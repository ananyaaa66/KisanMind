# 🌾 KisanMind

KisanMind is an intelligent, agentic AI assistant built specifically for Indian farmers. It uses a **LangGraph** architecture to route user questions to specialized agents (Weather, Market Prices, Disease Detection, and Government Schemes) and aggregates the knowledge into natural language reports.

---

## 🏗️ Architecture Overview

The system is split into two primary domains:

1. **Agentic API (FastAPI + LangGraph)**
   * **Disease Agent:** Uses Google's **Gemini Vision** zero-shot multimodal capabilities to diagnose crop diseases from uploaded photos. (No local CNN required).
   * **Scheme Agent:** Uses **Tavily Search** to crawl government portals live for PM-KISAN rules and subsidy eligibility.
   * **Weather Agent:** Integrates with **OpenWeatherMap** for hyper-local 5-day forecasts.
   
2. **Predictive Modeling (XGBoost / CatBoost)**
   * A custom Machine Learning pipeline trained on real **AGMARKNET** historical mandi data to forecast crop prices 7 days into the future.
   * Uses advanced Feature Engineering (Lag variables, rolling volatility, 30-day moving averages) to power the predictions.

---

## 🚀 Getting Started

### 1. Environment Setup
The backend runs on Python 3.11+. 

```bash
cd Backend
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. API Keys
You will need to create a `.env` file in the `Backend/` folder with the following keys:
```env
OPENWEATHERMAP_API_KEY=your_key
TAVILY_API_KEY=your_key
GEMINI_API_KEY=your_key
```

### 3. Running the App
To run the agentic backend server:
```bash
cd Backend
python main.py
```

---

## ✅ Project Status: Core Systems Complete

The **Core Agentic Architecture** and the **Custom ML Pipeline** are now both complete and mathematically validated!

### The Machine Learning Pipeline
All model training was finalized inside **`Backend/TrainingDataset.ipynb`**. We engineered powerful time-series features (Lags, Rolling Means, Rolling Volatility, Rate of Change) from a 97MB AGMARKNET historical dataset. 

After conducting a 3-way head-to-head showdown on a strictly date-sorted validation split, the **CatBoost Regressor** emerged as the champion model with an **R² of 0.8335**, beating out both standard XGBoost and Momentum-based XGBoost by utilizing its native `cat_features` handling.

### Immediate Next Steps for Deployment:
1. Export the champion CatBoost model from the notebook and save it as `price_model.pkl` in the `Backend/data/` folder.
2. Update `market_agent.py` to load the CatBoost model instead of the XGBoost model.
3. Deploy the FastAPI backend and test the final farmer queries!
