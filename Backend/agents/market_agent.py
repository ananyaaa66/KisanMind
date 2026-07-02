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

    # More targeted search query for Indian mandi prices
    query = (
        f"{crop_type} mandi price today {location} India "
        f"rupees per quintal agmarknet enam"
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


def _get_ml_prediction(crop_type: str, location: str, current_price: float) -> dict:
    """
    Call the XGBoost price predictor for 7-day forecast.
    Uses the actual current price extracted from Tavily/LLM.
    """
    try:
        from models.price_predictor import predict
        from datetime import datetime

        month = datetime.utcnow().month
        prediction = predict(
            crop=crop_type,
            state=location,
            month=month,
            last_price=current_price,
        )
        return prediction
    except Exception as e:
        return {"predicted_price": None, "confidence": None, "error": str(e)}


def _get_fallback_price(crop_type: str) -> float:
    """Get a realistic fallback price from the price_predictor ranges."""
    try:
        from models.price_predictor import PRICE_RANGES
        low, high = PRICE_RANGES.get(crop_type.lower().replace("_", " "), (1500, 3000))
        return (low + high) / 2
    except Exception:
        return 2500.0


async def run_market_agent(state: KisanMindState) -> KisanMindState:
    """
    LangGraph node: Search mandi prices + ML prediction,
    then use LLM to synthesize a market advisory.
    """
    start = time.time()

    crop_type = state.get("crop_type", "wheat")
    location = state.get("location", "Delhi")

    try:
        # Step 1: Search for real-time prices via Tavily
        search_results = await _search_mandi_prices(crop_type, location)

        # Step 2: Use LLM to extract current price from search results
        llm = get_llm()

        prompt = f"""You are an Indian agricultural market analyst.
A farmer growing {crop_type} in {location} wants to know the current mandi price.

Below are real-time search results about mandi prices. Extract the current market price
and provide a market advisory.

Search Results:
{search_results}

Return a JSON with exactly these fields:
{{
  "current_price_per_quintal": <number, the actual current mandi price in ₹ extracted from search results>,
  "price_trend": "up" | "down" | "stable",
  "best_mandi": "<name of the best nearby mandi from search results>",
  "recommendation": "sell_now" or "wait",
  "data_source": "tavily + xgboost"
}}

CRITICAL RULES:
- Extract the ACTUAL price from the search results — do NOT guess or use generic ranges
- current_price_per_quintal MUST be a specific number found in the search data
- If multiple prices are found, use the modal/average price
- If no specific price is found in search results, use your best knowledge of current Indian mandi rates for {crop_type}
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

        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            import re
            match = re.search(r'\{[\s\S]*\}', raw)
            if match:
                parsed = json.loads(match.group())
            else:
                raise ValueError(f"No valid JSON in market response: {raw[:200]}")

        # Step 3: Use the extracted current price to feed ML prediction
        current_price = parsed.get("current_price_per_quintal", _get_fallback_price(crop_type))
        if not isinstance(current_price, (int, float)) or current_price <= 0:
            current_price = _get_fallback_price(crop_type)

        ml_prediction = _get_ml_prediction(crop_type, location, current_price)

        print(f"📊 Market: {crop_type} in {location} → ₹{current_price}/q → ML predicts ₹{ml_prediction.get('predicted_price')}/q in 7d")

        # Merge ML prediction data
        parsed["predicted_price_7d"] = ml_prediction.get("predicted_price")
        parsed["prediction_confidence"] = ml_prediction.get("confidence")

        # Override the LLM's blind recommendation using the actual ML forecast math
        predicted = parsed.get("predicted_price_7d")
        if predicted and current_price:
            if predicted > current_price * 1.02:
                parsed["recommendation"] = "wait"
                parsed["price_trend"] = "up"
            elif predicted < current_price * 0.98:
                parsed["recommendation"] = "sell_now"
                parsed["price_trend"] = "down"
            else:
                parsed["price_trend"] = "stable"

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
