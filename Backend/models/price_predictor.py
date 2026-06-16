"""
KisanMind Price Predictor (XGBoost)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Trains and serves an XGBoost regression model for
7-day crop price prediction.

Features: crop_type (encoded), state (encoded), month, season, last_30d_avg_price
Target:   predicted price for next 7 days

The model is trained on synthetic data for now and saved as
price_model.pkl. It can be retrained on real Kaggle/government
data later by calling train_model().
"""

import os
import warnings

import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder

warnings.filterwarnings("ignore")

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
MODEL_PATH = os.path.join(MODEL_DIR, "price_model.pkl")
ENCODERS_PATH = os.path.join(MODEL_DIR, "price_encoders.pkl")

# ── Synthetic data parameters ──
CROPS = [
    "wheat", "rice", "cotton", "sugarcane", "soybean",
    "maize", "bajra", "jowar", "mustard", "groundnut",
    "onion", "potato", "tomato", "chilli", "turmeric",
]

STATES = [
    "Maharashtra", "Punjab", "Haryana", "Uttar Pradesh",
    "Madhya Pradesh", "Rajasthan", "Gujarat", "Karnataka",
    "Tamil Nadu", "Andhra Pradesh", "West Bengal", "Bihar",
    "Odisha", "Telangana", "Chhattisgarh",
]

# Approximate real mandi price ranges (₹ per quintal)
PRICE_RANGES = {
    "wheat": (2000, 2800), "rice": (2500, 3500), "cotton": (6000, 8500),
    "sugarcane": (300, 400), "soybean": (4000, 5500), "maize": (1800, 2600),
    "bajra": (2200, 3000), "jowar": (2600, 3400), "mustard": (4800, 6200),
    "groundnut": (5000, 7000), "onion": (800, 3500), "potato": (600, 2000),
    "tomato": (500, 4000), "chilli": (8000, 15000), "turmeric": (7000, 12000),
}


def _get_season(month: int) -> int:
    """Map month to season: 0=winter, 1=spring, 2=summer, 3=monsoon, 4=autumn."""
    if month in (12, 1, 2):
        return 0
    elif month in (3, 4):
        return 1
    elif month in (5, 6):
        return 2
    elif month in (7, 8, 9):
        return 3
    else:
        return 4


def _generate_synthetic_data(n_samples: int = 5000) -> pd.DataFrame:
    """
    Generate realistic synthetic mandi price data.
    Prices vary by crop, state, season, and include noise.
    """
    np.random.seed(42)

    records = []
    for _ in range(n_samples):
        crop = np.random.choice(CROPS)
        state = np.random.choice(STATES)
        month = np.random.randint(1, 13)
        season = _get_season(month)

        low, high = PRICE_RANGES.get(crop, (1500, 3000))
        base_price = np.random.uniform(low, high)

        # Seasonal variation
        seasonal_factor = 1.0 + 0.1 * np.sin(2 * np.pi * month / 12)

        # State variation (some states get premium prices)
        state_factor = 1.0 + np.random.uniform(-0.05, 0.05)

        last_30d_avg = base_price * seasonal_factor * state_factor
        last_30d_avg += np.random.normal(0, base_price * 0.03)  # noise

        # Target: 7-day future price (slight trend + noise)
        trend = np.random.uniform(-0.05, 0.08)  # slight upward bias
        target_price = last_30d_avg * (1 + trend)
        target_price += np.random.normal(0, base_price * 0.02)

        records.append({
            "crop": crop,
            "state": state,
            "month": month,
            "season": season,
            "last_30d_avg_price": round(last_30d_avg, 2),
            "target_price_7d": round(target_price, 2),
        })

    return pd.DataFrame(records)


def train_model(data: pd.DataFrame = None) -> dict:
    """
    Train XGBoost regression model and save to disk.
    Can be called with real data or defaults to synthetic.
    Returns training metrics.
    """
    import xgboost as xgb
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_absolute_error, r2_score

    if data is None:
        data = _generate_synthetic_data()

    # Encode categoricals
    crop_enc = LabelEncoder()
    state_enc = LabelEncoder()

    data["crop_encoded"] = crop_enc.fit_transform(data["crop"])
    data["state_encoded"] = state_enc.fit_transform(data["state"])

    features = ["crop_encoded", "state_encoded", "month", "season", "last_30d_avg_price"]
    X = data[features]
    y = data["target_price_7d"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = xgb.XGBRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
    )

    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    # Save model + encoders
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump({"crop": crop_enc, "state": state_enc}, ENCODERS_PATH)

    return {
        "mae": round(mae, 2),
        "r2_score": round(r2, 4),
        "samples_trained": len(X_train),
        "samples_tested": len(X_test),
        "model_path": MODEL_PATH,
    }


def predict(crop: str, state: str, month: int, last_price: float) -> dict:
    """
    Predict 7-day crop price.

    Args:
        crop: crop name (e.g. "wheat")
        state: Indian state name (e.g. "Punjab")
        month: current month (1-12)
        last_price: last known price per quintal

    Returns:
        dict with predicted_price, confidence, etc.
    """
    # Auto-train if model doesn't exist
    if not os.path.exists(MODEL_PATH):
        print("🧠 Training price prediction model for the first time...")
        metrics = train_model()
        print(f"✅ Model trained: MAE=₹{metrics['mae']}, R²={metrics['r2_score']}")

    model = joblib.load(MODEL_PATH)
    encoders = joblib.load(ENCODERS_PATH)

    crop_enc = encoders["crop"]
    state_enc = encoders["state"]

    # Handle unseen categories gracefully
    try:
        crop_code = crop_enc.transform([crop.lower()])[0]
    except ValueError:
        crop_code = 0  # fallback to first crop

    try:
        state_code = state_enc.transform([state])[0]
    except ValueError:
        state_code = 0  # fallback to first state

    season = _get_season(month)

    X = np.array([[crop_code, state_code, month, season, last_price]])
    predicted = model.predict(X)[0]

    # Confidence based on how close last_price is to training range
    low, high = PRICE_RANGES.get(crop.lower(), (1500, 3000))
    in_range = low <= last_price <= high
    confidence = 78.0 if in_range else 55.0  # heuristic confidence

    return {
        "predicted_price": round(float(predicted), 2),
        "confidence": confidence,
        "prediction_horizon_days": 7,
        "model_type": "XGBoost Regressor",
    }


# ── CLI: Train the model independently ──
if __name__ == "__main__":
    print("🚀 Training KisanMind Price Prediction Model...")
    metrics = train_model()
    print(f"✅ Done!")
    print(f"   MAE: ₹{metrics['mae']} per quintal")
    print(f"   R² Score: {metrics['r2_score']}")
    print(f"   Train samples: {metrics['samples_trained']}")
    print(f"   Test samples: {metrics['samples_tested']}")
    print(f"   Saved to: {metrics['model_path']}")
