"""
KisanMind LLM Provider Abstraction
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Single source of truth for LLM instantiation.
Every agent imports get_llm() from here — no agent
should ever directly import an LLM class.

Provider is controlled entirely via .env:
  LLM_PROVIDER = gemini | groq | ollama | openrouter | openai
  LLM_API_KEY  = your key
  LLM_MODEL_NAME = model override (optional)
"""

import os

from dotenv import load_dotenv

load_dotenv()

PROVIDER = os.getenv("LLM_PROVIDER", "gemini").lower()
API_KEY = os.getenv("LLM_API_KEY")
MODEL_NAME = os.getenv("LLM_MODEL_NAME")


def get_llm():
    """
    Return a LangChain-compatible chat model based on
    the LLM_PROVIDER environment variable.

    Lazy-imports so only the required SDK is loaded.
    """

    if PROVIDER == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI

        return ChatGoogleGenerativeAI(
            model=MODEL_NAME or "gemini-2.0-flash",
            google_api_key=API_KEY,
            temperature=0.3,
        )

    elif PROVIDER == "groq":
        from langchain_groq import ChatGroq

        return ChatGroq(
            model=MODEL_NAME or "llama-3.3-70b-versatile",
            groq_api_key=API_KEY,
            temperature=0.3,
        )

    elif PROVIDER == "ollama":
        from langchain_ollama import ChatOllama

        return ChatOllama(
            model=MODEL_NAME or "llama3",
            temperature=0.3,
        )

    elif PROVIDER == "openrouter":
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=MODEL_NAME or "google/gemma-3-4b-it:free",
            openai_api_key=API_KEY,
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=0.3,
        )

    elif PROVIDER == "openai":
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=MODEL_NAME or "gpt-4o-mini",
            openai_api_key=API_KEY,
            temperature=0.3,
        )

    else:
        raise ValueError(
            f"Unknown LLM provider: '{PROVIDER}'. "
            "Supported: gemini, groq, ollama, openrouter, openai"
        )


def get_provider_info() -> dict:
    """Return metadata about the active LLM provider (for /health endpoint)."""
    return {
        "provider": PROVIDER,
        "model": MODEL_NAME or _default_model_for(PROVIDER),
        "api_key_set": bool(API_KEY),
    }


def _default_model_for(provider: str) -> str:
    defaults = {
        "gemini": "gemini-2.0-flash",
        "groq": "llama-3.3-70b-versatile",
        "ollama": "llama3",
        "openrouter": "google/gemma-3-4b-it:free",
        "openai": "gpt-4o-mini",
    }
    return defaults.get(provider, "unknown")
