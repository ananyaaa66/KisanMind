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
import hashlib
import json
from typing import Optional
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

load_dotenv()

import os
from graph.pipeline import run_pipeline
from memory.long_term import get_history, save_report, search_similar
from models.state import create_initial_state
from utils.image_handler import upload_to_base64, validate_image_size
from utils.llm_provider import get_llm, get_provider_info
from utils.pdf_generator import generate_pdf
from utils.supabase_client import get_supabase

# ──────────────────────────────────────────────
# App Setup
# ──────────────────────────────────────────────

app = FastAPI(
    title="KisanMind API",
    description="AI-powered agricultural advisory system for Indian farmers",
    version="1.0.0",
)

# CORS — open for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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
    user_id: Optional[int] = Form(None, description="Supabase user ID"),
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

            # Also save to Supabase (cloud persistence)
            try:
                sb = get_supabase()
                sb.table("reports").insert({
                    "session_id": result.get("session_id", ""),
                    "crop": crop_type,
                    "location": location,
                    "query": query,
                    "report_markdown": result["final_report"],
                    "execution_time": result.get("execution_time_parallel"),
                    "user_id": user_id,
                    "created_at": datetime.utcnow().isoformat(),
                }).execute()
            except Exception:
                pass  # Non-critical

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
async def get_all_session_history(user_id: Optional[int] = None):
    """
    Retrieve past advisory reports from Supabase for a specific user.
    Falls back to ChromaDB if no user_id is provided.
    """
    from memory.long_term import get_all_history
    try:
        if user_id:
            sb = get_supabase()
            res = sb.table("reports").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(50).execute()
            
            # Format to match existing ChromaDB response structure
            history = []
            for row in (res.data or []):
                history.append({
                    "id": row.get("session_id"),
                    "document": row.get("report_markdown"),
                    "metadata": {
                        "session_id": row.get("session_id"),
                        "crop": row.get("crop"),
                        "location": row.get("location"),
                        "query": row.get("query"),
                        "saved_at": row.get("created_at")
                    }
                })
        else:
            # Fallback to global ChromaDB
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
# GET /stats
# ──────────────────────────────────────────────

@app.get("/stats")
@app.head("/stats")
async def get_stats():
    """
    Get live platform statistics from Supabase.
    """
    try:
        sb = get_supabase()
        # Real user count from Supabase
        users_res = sb.table("users").select("id", count="exact").execute()
        user_count = users_res.count or 0
        
        # Real report count from Supabase
        reports_res = sb.table("reports").select("id", count="exact").execute()
        report_count = reports_res.count or 0
        
        return {
            "success": True,
            "registered_farmers": f"{user_count:,}",
            "reports_this_month": str(report_count),
            "benefits_disbursed": "₹18.4L"  # Mocked until transactions are added
        }
    except Exception as e:
        return {
            "success": True,
            "registered_farmers": "0",
            "reports_this_month": "0",
            "benefits_disbursed": "₹0"
        }


# ──────────────────────────────────────────────
# Auth Endpoints (Supabase)
# ──────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    city: str
    email: str
    password: str
    phone: str = ""
    land_owned: str = ""

class LoginRequest(BaseModel):
    email: str
    password: str

class OTPLoginRequest(BaseModel):
    phone: str
    otp: str

class UpdateProfileRequest(BaseModel):
    user_id: str
    name: str
    city: str
    state: str
    land_owned: float


@app.post("/auth/register")
async def register_user(req: RegisterRequest):
    """
    Register a new farmer in Supabase.
    """
    try:
        sb = get_supabase()
        # Hash password (simple sha256 for demo — use bcrypt in production)
        pw_hash = hashlib.sha256(req.password.encode()).hexdigest()
        
        # Check if user already exists
        existing = sb.table("users").select("id").eq("email", req.email).execute()
        if existing.data and len(existing.data) > 0:
            raise HTTPException(status_code=409, detail="User already exists with this email")
        
        # Insert user
        result = sb.table("users").insert({
            "name": req.name,
            "city": req.city,
            "email": req.email,
            "password_hash": pw_hash,
            "phone": req.phone,
            "land_owned": req.land_owned,
            "created_at": datetime.utcnow().isoformat(),
        }).execute()
        
        user = result.data[0] if result.data else {}
        
        return {
            "success": True,
            "message": "Registration successful",
            "user": {
                "id": user.get("id"),
                "name": req.name,
                "city": req.city,
                "phone": req.phone,
                "land_owned": req.land_owned,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@app.post("/auth/login")
async def login_user(req: LoginRequest):
    """
    Login a farmer by email/ID + password.
    """
    try:
        sb = get_supabase()
        pw_hash = hashlib.sha256(req.password.encode()).hexdigest()
        
        result = sb.table("users").select("*").eq("email", req.email).eq("password_hash", pw_hash).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        user = result.data[0]
        return {
            "success": True,
            "message": "Login successful",
            "user": {
                "id": user.get("id"),
                "name": user.get("name"),
                "city": user.get("city"),
                "phone": user.get("phone"),
                "land_owned": user.get("land_owned"),
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@app.post("/auth/otp-login")
async def otp_login(req: OTPLoginRequest):
    """
    Mock OTP login — accepts 123456 as valid OTP.
    In production, integrate Twilio/Supabase Auth.
    """
    if req.otp != "123456":
        raise HTTPException(status_code=401, detail="Invalid OTP")
    
    try:
        sb = get_supabase()
        result = sb.table("users").select("*").eq("phone", req.phone).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="No account found with this phone number. Please register first.")
        
        user = result.data[0]
        return {
            "success": True,
            "message": "OTP verified",
            "user": {
                "id": user.get("id"),
                "name": user.get("name"),
                "city": user.get("city"),
                "phone": user.get("phone"),
                "land_owned": user.get("land_owned"),
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OTP login failed: {str(e)}")


@app.post("/auth/update")
async def update_profile(req: UpdateProfileRequest):
    """
    Update farmer profile in Supabase.
    """
    try:
        sb = get_supabase()
        
        # We need to map state into city if we don't have a state column.
        # But wait, looking at register, it only takes city and land_owned.
        # Let's just update name, city, land_owned.
        
        result = sb.table("users").update({
            "name": req.name,
            "city": req.city,
            "land_owned": req.land_owned
        }).eq("id", req.user_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")
            
        user = result.data[0]
        return {
            "success": True,
            "message": "Profile updated successfully",
            "user": {
                "id": user.get("id"),
                "name": user.get("name"),
                "city": user.get("city"),
                "phone": user.get("phone"),
                "land_owned": user.get("land_owned"),
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profile update failed: {str(e)}")


# ──────────────────────────────────────────────
# GET /health
# ──────────────────────────────────────────────

@app.get("/health")
@app.head("/health")
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
# GET /voice/greet — Voice greeting TTS
# ──────────────────────────────────────────────

@app.get("/voice/greet")
async def voice_greet(lang: str = "en"):
    """
    Generate a TTS greeting audio for the voice assistant.
    Returns base64 audio and greeting text.
    """
    import httpx

    sarvam_key = os.getenv("SARVAM_API_KEY")

    greetings = {
        "hi": "नमस्ते! मैं किसानमाइंड हूँ। बताइए, मैं आपकी क्या मदद कर सकता हूँ?",
        "en": "Hello! I am KisanMind, your farming assistant. How can I help you today?",
    }
    greeting_text = greetings.get(lang, greetings["en"])

    audio_base64 = ""
    if sarvam_key:
        try:
            async with httpx.AsyncClient() as client:
                tts_payload = {
                    "text": greeting_text,
                    "speaker": "anushka",
                    "target_language_code": "hi-IN" if lang == "hi" else "en-IN",
                }
                tts_headers = {
                    "api-subscription-key": sarvam_key,
                    "Content-Type": "application/json",
                }
                tts_response = await client.post(
                    "https://api.sarvam.ai/text-to-speech",
                    json=tts_payload,
                    headers=tts_headers,
                    timeout=30.0,
                )
                if tts_response.status_code == 200:
                    audios = tts_response.json().get("audios", [])
                    audio_base64 = audios[0] if audios else ""
                else:
                    print(f"Sarvam TTS greeting failed: {tts_response.text}")
        except Exception as e:
            print(f"Sarvam TTS greeting error: {str(e)}")

    return {
        "success": True,
        "greeting_text": greeting_text,
        "audio_response": audio_base64,
    }


# ──────────────────────────────────────────────
# POST /voice/chat — Voice-to-voice RAG chat
# ──────────────────────────────────────────────

@app.post("/voice/chat")
async def voice_chat(
    session_id: str = Form(..., description="Session ID"),
    lang: str = Form("en", description="Language code: hi or en"),
    audio: Optional[UploadFile] = File(None, description="Optional recorded audio file"),
    text: Optional[str] = Form(None, description="Optional text query fallback"),
):
    """
    RAG voice-to-voice chat endpoint using Sarvam AI Indic STT/TTS.
    """
    import httpx
    import base64
    from memory.long_term import get_history, search_similar
    from models.price_predictor import predict
    
    # 1. Transcription (Sarvam STT)
    query_text = ""
    sarvam_key = os.getenv("SARVAM_API_KEY")
    
    if audio and audio.filename:
        # Read uploaded audio content
        audio_content = await audio.read()
        
        # Call Sarvam STT REST API
        async with httpx.AsyncClient() as client:
            try:
                # Sarvam STT expects multipart form data
                files = {"file": (audio.filename or "audio.wav", audio_content, audio.content_type or "audio/wav")}
                data = {"model": "saaras:v3", "mode": "transcribe"}
                headers = {"api-subscription-key": sarvam_key}
                
                response = await client.post(
                    "https://api.sarvam.ai/speech-to-text",
                    files=files,
                    data=data,
                    headers=headers,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    query_text = response.json().get("transcript", "").strip()
                else:
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Sarvam STT failed: {response.text}"
                    )
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Sarvam STT connection error: {str(e)}")
    elif text:
        query_text = text.strip()
    else:
        raise HTTPException(status_code=400, detail="Either 'audio' or 'text' must be provided.")
        
    if not query_text:
        return {
            "success": True,
            "query": "",
            "text_response": "I didn't hear anything. Please try speaking again." if lang == "en" else "मैंने कुछ नहीं सुना। कृपया फिर से बोलें।",
            "audio_response": None
        }

    # 2. RAG Context Collection
    # Search past reports in ChromaDB
    similar_docs = search_similar(query_text, n_results=3)
    history_docs = get_history(session_id, limit=5)
    
    # Collect metadata like crop and location to fetch market prediction if query is market related
    crop_context = None
    location_context = None
    
    # Try to extract crop/location from history metadata
    if history_docs:
        latest = history_docs[0]
        meta = latest.get("metadata", {})
        crop_context = meta.get("crop")
        location_context = meta.get("location")
        
    # Build ChromaDB reports context
    reports_context = "\n---\n".join([doc["document"] for doc in similar_docs])
    
    # Add market predictions if query mentions price, market, mandi, cost, sell, rate
    market_prediction_context = ""
    lower_query = query_text.lower()
    mkt_keywords = ["price", "mandi", "sell", "rate", "cost", "predict", "forecast", "भाव", "मंडी", "दाम", "कीमत", "बेच"]
    if any(k in lower_query for k in mkt_keywords):
        # Determine crop & state
        crop = crop_context or "wheat"
        state = location_context or "Maharashtra"
        
        # Check if query specifies a crop or state
        from models.price_predictor import CROPS, STATES
        for c in CROPS:
            if c in lower_query:
                crop = c
                break
        for s in STATES:
            if s.lower() in lower_query:
                state = s
                break
                
        # Run price predictor
        try:
            from datetime import datetime
            from models.price_predictor import _get_fallback_price
            last_price = _get_fallback_price(crop)
            pred = predict(crop=crop, state=state, month=datetime.utcnow().month, last_price=last_price)
            if not pred.get("error"):
                market_prediction_context = (
                    f"Live Mandi Info for {crop} in {state}:\n"
                    f"- Current estimated price: INR {last_price} per quintal\n"
                    f"- Predicted price in 7 days: INR {pred.get('predicted_price')} per quintal\n"
                    f"- Prediction confidence: {pred.get('confidence')}%\n"
                )
        except Exception:
            pass

    # 3. Prompt Construction & LLM Execution
    llm = get_llm()
    
    system_prompt = f"""You are KisanMind Voice Assistant, a friendly AI agricultural advisor speaking directly to a farmer.
Your response MUST be extremely brief (max 2-3 sentences), simple, conversational, and direct, suitable for speech synthesis.
Do NOT use any markdown formatting (no bolding, no bullets, no lists, no headings, no asterisks).
Answer the query based on the following context. If you don't know, keep it short and friendly.

Context from past advisory reports:
{reports_context}

Context from live market prediction:
{market_prediction_context}

Farmer's query:
{query_text}

Language rule: You MUST respond in Hindi (using Devanagari script) if the language parameter is "hi". Otherwise, respond in simple English.
Ensure natural conversational speech phrasing.
"""
    
    try:
        response = await llm.ainvoke(system_prompt)
        text_reply = response.content.strip()
        # Clean any remaining markdown fences or headers
        text_reply = text_reply.replace("*", "").replace("#", "").replace("- ", "").strip()
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"LLM generation failed: {str(e)}")

    # 4. Text-to-Speech Synthesis (Sarvam TTS)
    audio_base64 = ""
    try:
        async with httpx.AsyncClient() as client:
            tts_payload = {
                "text": text_reply,
                "speaker": "anushka",
                "target_language_code": "hi-IN" if lang == "hi" else "en-IN"
            }
            tts_headers = {
                "api-subscription-key": sarvam_key,
                "Content-Type": "application/json"
            }
            tts_response = await client.post(
                "https://api.sarvam.ai/text-to-speech",
                json=tts_payload,
                headers=tts_headers,
                timeout=30.0
            )
            if tts_response.status_code == 200:
                audios = tts_response.json().get("audios", [])
                audio_base64 = audios[0] if audios else ""
            else:
                # We won't block the request if TTS fails, just return text with empty audio
                print(f"Sarvam TTS synthesis failed: {tts_response.text}")
    except Exception as e:
        print(f"Sarvam TTS error: {str(e)}")

    return {
        "success": True,
        "query": query_text,
        "text_response": text_reply,
        "audio_response": audio_base64
    }


# ──────────────────────────────────────────────
# Run with: uvicorn main:app --reload --port 8000
# ──────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

