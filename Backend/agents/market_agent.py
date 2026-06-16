"""
KisanMind Market Intelligence Agent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Uses Tavily to search real-time mandi prices across India,
then calls the XGBoost price_predictor ML model for
7-day price forecasting.
"""

import json
import os
import time

from dotenv import load_dotenv
from tavily import TavilyClient

from models.state import KisanMindState, MarketResult
from utils.llm_provider import get_llm

load_dotenv()

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")


async def _search_mandi_prices(crop_type: str, location: str) -> str:
    """Use Tavily to search for latest mandi prices."""
    client = TavilyClient(api_key=TAVILY_API_KEY)

    query = (
        f"latest mandi price of {crop_type} in {location} India "
        f"today per quintal rupees 2024 2025"
    )

    try:
        results = client.search(
            query=query,
            search_depth="advanced",
            max_results=5,
            include_answer=True,
        )
        return json.dumps(results, default=str)
    except Exception as e:
        return json.dumps({"error": str(e)})


async def _get_ml_prediction(crop_type: str, location: str) -> dict:
    """
    Call the XGBoost price predictor for 7-day forecast.
    Falls back gracefully if the model isn't trained yet.
    """
    try:
        from models.price_predictor import predict

        from datetime import datetime

        month = datetime.utcnow().month
        prediction = predict(
            crop=crop_type,
            state=location,
            month=month,
            last_price=2500.0,  # placeholder; in production, use last known price
        )
        return prediction
    except Exception as e:
        return {"predicted_price": None, "confidence": None, "error": str(e)}


async def run_market_agent(state: KisanMindState) -> KisanMindState:
    """
    LangGraph node: Search mandi prices + ML prediction,
    then use LLM to synthesize a market advisory.
    """
    start = time.time()

    crop_type = state.get("crop_type", "wheat")
    location = state.get("location", "Delhi")

    try:
        # Parallel data gathering
        search_results = await _search_mandi_prices(crop_type, location)
        ml_prediction = await _get_ml_prediction(crop_type, location)

        # Use LLM to synthesize
        llm = get_llm()

        prompt = f"""You are an Indian agricultural market analyst.
Given the following real-time mandi price search results and ML prediction,
provide a market advisory for a farmer growing {crop_type} in {location}.

Search Results:
{search_results}

ML Price Prediction (7 days):
{json.dumps(ml_prediction, default=str)}

Return a JSON with exactly these fields:
{{
  "current_price_per_quintal": <number, best estimate in ₹>,
  "price_trend": "up" | "down" | "stable",
  "best_mandi": "<name of the best nearby mandi>",
  "recommendation": "sell_now" or "wait",
  "data_source": "tavily + xgboost"
}}

Rules:
- Use realistic Indian mandi prices (e.g. wheat ~2200-2800, rice ~2500-3500, cotton ~6000-8000 per quintal)
- If data is unclear, make your best informed estimate
- Return ONLY the JSON, no markdown fences
"""

        response = await llm.ainvoke(prompt)
        raw = response.content.strip()

        # Strip markdown fences
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[-1]
        if raw.endswith("```"):
            raw = raw.rsplit("```", 1)[0]
        raw = raw.strip()

        parsed = json.loads(raw)

        # Merge ML prediction data
        parsed["predicted_price_7d"] = ml_prediction.get("predicted_price")
        parsed["prediction_confidence"] = ml_prediction.get("confidence")

        result = MarketResult(**parsed)

        elapsed = time.time() - start
        agent_times = dict(state.get("agent_times") or {})
        agent_times["market_agent"] = round(elapsed, 3)

        return {
            "market_result": result.model_dump(),
            "agent_times": agent_times,
        }

    except Exception as e:
        elapsed = time.time() - start
        agent_times = dict(state.get("agent_times") or {})
        agent_times["market_agent"] = round(elapsed, 3)
        errors = dict(state.get("errors") or {})
        errors["market_agent"] = str(e)

        return {
            "market_result": None,
            "agent_times": agent_times,
            "errors": errors,
        }
