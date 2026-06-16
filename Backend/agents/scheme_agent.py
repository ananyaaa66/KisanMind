"""
KisanMind Government Scheme Agent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Uses Tavily to search PM-KISAN, PM Fasal Bima Yojana,
and state-specific agricultural schemes relevant to
the farmer's crop, state, and situation.
"""

import json
import os
import time

from dotenv import load_dotenv
from tavily import TavilyClient

from models.state import KisanMindState, SchemeInfo, SchemeResult
from utils.llm_provider import get_llm

load_dotenv()

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")


async def _search_schemes(crop_type: str, location: str, query: str) -> str:
    """Use Tavily to search for relevant government agricultural schemes."""
    client = TavilyClient(api_key=TAVILY_API_KEY)

    search_query = (
        f"Indian government agricultural schemes for {crop_type} farmers "
        f"in {location} state PM-KISAN PM Fasal Bima Yojana 2024 2025 "
        f"eligibility how to apply {query}"
    )

    try:
        results = client.search(
            query=search_query,
            search_depth="advanced",
            max_results=7,
            include_answer=True,
        )
        return json.dumps(results, default=str)
    except Exception as e:
        return json.dumps({"error": str(e)})


async def run_scheme_agent(state: KisanMindState) -> KisanMindState:
    """
    LangGraph node: Find eligible government schemes.
    """
    start = time.time()

    crop_type = state.get("crop_type", "general")
    location = state.get("location", "India")
    user_query = state.get("query", "")

    try:
        search_results = await _search_schemes(crop_type, location, user_query)

        llm = get_llm()

        prompt = f"""You are an expert on Indian government agricultural schemes and subsidies.
A farmer growing {crop_type} in {location} is asking: "{user_query}"

Based on the search results below, identify ALL eligible government schemes.
For each scheme, provide structured information.

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
- Application steps should be actionable (e.g., "Visit nearest CSC center", "Apply on pmkisan.gov.in")
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
        result = SchemeResult(
            eligible_schemes=[SchemeInfo(**s) for s in parsed.get("eligible_schemes", [])],
            total_found=parsed.get("total_found", 0),
            state_specific=parsed.get("state_specific", False),
        )

        elapsed = time.time() - start
        agent_times = dict(state.get("agent_times") or {})
        agent_times["scheme_agent"] = round(elapsed, 3)

        return {
            "scheme_result": result.model_dump(),
            "agent_times": agent_times,
        }

    except Exception as e:
        elapsed = time.time() - start
        agent_times = dict(state.get("agent_times") or {})
        agent_times["scheme_agent"] = round(elapsed, 3)
        errors = dict(state.get("errors") or {})
        errors["scheme_agent"] = str(e)

        return {
            "scheme_result": None,
            "agent_times": agent_times,
            "errors": errors,
        }
