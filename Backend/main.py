"""
KisanMind FastAPI Backend
━━━━━━━━━━━━━━━━━━━━━━━━━
Production-grade AgriTech AI advisory system for Indian farmers.
Multi-agent system using LangGraph with parallel execution.

Endpoints:
  POST /advisory    — Run full advisory pipeline
  GET  /history/{session_id} — Past reports from ChromaDB
  GET  /health      — System status
"""

import time
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

load_dotenv()

import os
from graph.pipeline import run_pipeline
from memory.long_term import get_history, save_report, search_similar
from models.state import create_initial_state
from utils.image_handler import upload_to_base64, validate_image_size
from utils.llm_provider import get_llm, get_provider_info
from utils.pdf_generator import generate_pdf

# ──────────────────────────────────────────────
# App Setup
# ──────────────────────────────────────────────

app = FastAPI(
    title="KisanMind API",
    description="AI-powered agricultural advisory system for Indian farmers",
    version="1.0.0",
)

# CORS — open for frontend connection later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# POST /advisory
# ──────────────────────────────────────────────

@app.post("/advisory")
async def create_advisory(
    query: str = Form(..., description="Farmer's question in Hindi or English"),
    crop_type: str = Form(..., description="Type of crop (e.g., wheat, rice, cotton)"),
    location: str = Form(..., description="Location (city or state)"),
    image: Optional[UploadFile] = File(None, description="Optional crop image for disease detection"),
):
    """
    Run the full KisanMind multi-agent advisory pipeline.

    Accepts multipart form data with optional crop image.
    Returns complete advisory report with disease analysis,
    market intelligence, government schemes, and weather advisory.
    """
    try:
        # Convert image to base64 if provided
        image_b64 = None
        if image and image.filename:
            image_b64 = await upload_to_base64(image)
            if image_b64 and not validate_image_size(image_b64):
                raise HTTPException(status_code=413, detail="Image exceeds 10MB limit")

        # Build initial state
        state = create_initial_state(
            query=query,
            crop_type=crop_type,
            location=location,
            image_base64=image_b64,
        )

        # Run the LangGraph pipeline
        result = await run_pipeline(state)

        # Save report to long-term memory (ChromaDB)
        if result.get("final_report"):
            try:
                save_report(
                    report=result["final_report"],
                    metadata={
                        "session_id": result.get("session_id", ""),
                        "crop": crop_type,
                        "location": location,
                        "query": query,
                    },
                )
            except Exception:
                pass  # Non-critical: don't fail the request if ChromaDB save fails

        # Build response
        return {
            "success": True,
            "session_id": result.get("session_id"),
            "timestamp": result.get("timestamp"),
            "crop_type": crop_type,
            "location": location,
            "query": query,
            "disease_result": result.get("disease_result"),
            "market_result": result.get("market_result"),
            "scheme_result": result.get("scheme_result"),
            "weather_result": result.get("weather_result"),
            "final_report": result.get("final_report"),
            "execution_time_parallel": result.get("execution_time_parallel"),
            "execution_time_sequential": result.get("execution_time_sequential"),
            "agent_times": result.get("agent_times"),
            "errors": result.get("errors") if result.get("errors") else None,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")


# ──────────────────────────────────────────────
# POST /advisory/pdf
# ──────────────────────────────────────────────

@app.post("/advisory/pdf")
async def download_advisory_pdf(
    session_id: str = Form(..., description="Session ID"),
    report: str = Form(..., description="Full markdown report content")
):
    """
    Generate and download a PDF version of the advisory report.
    """
    try:
        filepath = generate_pdf(report, session_id)
        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="PDF generation failed")
        return FileResponse(
            path=filepath,
            filename=f"kisanmind_report_{session_id[:8]}.pdf",
            media_type="application/pdf"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation error: {str(e)}")


# ──────────────────────────────────────────────
# GET /history/{session_id}
# ──────────────────────────────────────────────

@app.get("/history/all")
async def get_all_session_history():
    """
    Retrieve all past advisory reports from ChromaDB.
    """
    from memory.long_term import get_all_history
    try:
        history = get_all_history(limit=50)
        return {
            "success": True,
            "total_reports": len(history),
            "reports": history,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"History retrieval failed: {str(e)}")


@app.get("/history/{session_id}")
async def get_session_history(session_id: str):
    """
    Retrieve all past advisory reports for a session from ChromaDB.
    """
    try:
        history = get_history(session_id)
        return {
            "success": True,
            "session_id": session_id,
            "total_reports": len(history),
            "reports": history,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"History retrieval failed: {str(e)}")


# ──────────────────────────────────────────────
# GET /search
# ──────────────────────────────────────────────

@app.get("/search")
async def search_reports(q: str, limit: int = 5):
    """
    Semantic search across all stored advisory reports.
    """
    try:
        results = search_similar(q, n_results=limit)
        return {
            "success": True,
            "query": q,
            "total_results": len(results),
            "results": results,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


# ──────────────────────────────────────────────
# GET /health
# ──────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """
    System health check — returns active LLM provider
    and service status.
    """
    provider_info = get_provider_info()

    return {
        "status": "healthy",
        "service": "KisanMind API",
        "version": "1.0.0",
        "llm_provider": provider_info,
    }


# ──────────────────────────────────────────────
# GET /settings/model — Current LLM info
# ──────────────────────────────────────────────

@app.get("/settings/model")
async def get_model_settings():
    """
    Return current LLM provider, model name, and available providers.
    """
    from utils.llm_provider import get_manager
    manager = get_manager()
    return {
        "success": True,
        **manager.get_provider_info(),
    }


# ──────────────────────────────────────────────
# POST /settings/model — Switch LLM at runtime
# ──────────────────────────────────────────────

@app.post("/settings/model")
async def switch_model(
    provider: str = Form(..., description="LLM provider: gemini, groq, ollama, openrouter, openai"),
    model_name: str = Form(None, description="Optional model name override"),
):
    """
    Hot-swap the active LLM provider and model at runtime.
    Takes effect immediately for all subsequent agent calls.
    """
    from utils.llm_provider import get_manager
    manager = get_manager()

    try:
        info = manager.switch_provider(provider, model_name or None)
        return {
            "success": True,
            "message": f"Switched to {info['provider']} / {info['model']}",
            **info,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ──────────────────────────────────────────────
# GET /weather — Standalone live weather
# ──────────────────────────────────────────────

@app.get("/weather")
async def get_weather(location: str = "Delhi"):
    """
    Fetch real-time weather from OpenWeatherMap for a location.
    Returns current conditions + 3-day forecast.
    No LLM call — fast response (<2s).
    """
    from agents.weather_agent import _fetch_weather, _parse_current, _parse_forecast_3d

    try:
        weather_data = await _fetch_weather(location)

        # Check for API error
        if weather_data["current"].get("cod") != 200:
            raise HTTPException(
                status_code=404,
                detail=f"Weather data not found for '{location}': {weather_data['current'].get('message', 'Unknown error')}"
            )

        today = _parse_current(weather_data["current"])
        forecast_3d = _parse_forecast_3d(weather_data["forecast"])

        return {
            "success": True,
            "location": location,
            "today": today.model_dump(),
            "forecast_3d": [f.model_dump() for f in forecast_3d],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Weather fetch failed: {str(e)}")


# ──────────────────────────────────────────────
# GET /schemes — Standalone scheme search
# ──────────────────────────────────────────────

@app.get("/schemes")
async def get_schemes(crop: str = "wheat", location: str = "Maharashtra"):
    """
    Search for eligible government agricultural schemes
    using Tavily + LLM synthesis.
    """
    from agents.scheme_agent import _search_schemes
    from models.state import SchemeInfo, SchemeResult
    import json

    try:
        search_results = await _search_schemes(crop, location, "")

        llm = get_llm()

        prompt = f"""You are an expert on Indian government agricultural schemes and subsidies.
A farmer growing {crop} in {location} is looking for eligible schemes.

Based on the search results below, identify ALL eligible government schemes.

Search Results:
{search_results}

Return a JSON with exactly this structure:
{{
  "eligible_schemes": [
    {{
      "scheme_name": "name of the scheme",
      "description": "brief 1-2 line description",
      "eligibility": "who is eligible",
      "application_steps": "step by step how to apply",
      "deadline": "deadline if known, else null",
      "link": "official URL if available, else null"
    }}
  ],
  "total_found": <number>,
  "state_specific": true/false
}}

Rules:
- Always include PM-KISAN and PM Fasal Bima Yojana if relevant
- Include state-specific schemes for {location}
- Return ONLY the JSON, no markdown fences
"""
        response = await llm.ainvoke(prompt)
        raw = response.content.strip()

        if raw.startswith("```"):
            raw = raw.split("\n", 1)[-1]
        if raw.endswith("```"):
            raw = raw.rsplit("```", 1)[0]
        raw = raw.strip()

        parsed = json.loads(raw)
        result = SchemeResult(
            eligible_schemes=[SchemeInfo(**s) for s in parsed.get("eligible_schemes", [])],
            total_found=parsed.get("total_found", 0),
            state_specific=parsed.get("state_specific", False),
        )

        return {
            "success": True,
            "crop": crop,
            "location": location,
            "scheme_result": result.model_dump(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scheme search failed: {str(e)}")


# ──────────────────────────────────────────────
# GET /predict — Standalone ML price prediction
# ──────────────────────────────────────────────

@app.get("/predict")
async def get_prediction(
    crop: str = "tomato",
    state: str = "Maharashtra",
    month: int = 6,
    last_price: float = 2500.0,
):
    """
    Get XGBoost 7-day crop price prediction.
    Uses the trained price_model.pkl directly.
    """
    from models.price_predictor import predict

    try:
        result = predict(crop=crop, state=state, month=month, last_price=last_price)

        if result.get("error"):
            raise HTTPException(status_code=500, detail=f"Prediction error: {result['error']}")

        return {
            "success": True,
            "crop": crop,
            "state": state,
            "month": month,
            "last_price": last_price,
            "prediction": result,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


# ──────────────────────────────────────────────
# Run with: uvicorn main:app --reload --port 8000
# ──────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

