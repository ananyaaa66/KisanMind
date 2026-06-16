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

load_dotenv()

from graph.pipeline import run_pipeline
from memory.long_term import get_history, save_report, search_similar
from models.state import create_initial_state
from utils.image_handler import upload_to_base64, validate_image_size
from utils.llm_provider import get_provider_info

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
# GET /history/{session_id}
# ──────────────────────────────────────────────

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
# Run with: uvicorn main:app --reload --port 8000
# ──────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
