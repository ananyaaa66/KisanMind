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

## 🛑 DEVELOPER HANDOFF: Continue From Here

If you are picking up this project, the **Core Agentic Architecture is complete.** 
The current focus is on finalizing the custom ML Model for the `price_predictor`. 

### The Training Playground
All experimental model training is happening inside **`Backend/TrainingDataset.ipynb`**. The user has successfully downloaded a 97MB AGMARKNET dataset (located in `Dataset/`) and engineered powerful time-series features (Lags, Rolling Means, Rolling Standard Deviations).

### Immediate Next Steps to Fix:
If you open the notebook, there are two commented-out experiments at the bottom: **Trend Features** and a **CatBoost Regressor**. Before uncommenting and running them, you must fix a critical bug:

**Bug:** The current `Train/Test Split` is slicing the first 80% of rows sequentially. Because the dataset was sorted by `crop` earlier in the notebook, this segregates the crops (Training set only sees Apples/Bananas; Test set only evaluates Wheat/Zucchini), ruining the `R²` score.

**The Fix:**
Sort the dataframe strictly by date before splitting it:
```python
# Apply this fix right above the Train/Test split cell
df_clean = df_clean.sort_values('date')

split_idx = int(len(df_clean) * 0.8)
X_train = X.iloc[:split_idx]
```

Once that is fixed, uncomment the CatBoost and Trend Feature cells, train the model, and then export it as `price_model.pkl` to power the live `market_agent.py`!
