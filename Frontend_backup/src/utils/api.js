const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Execute the multi-agent agricultural advisory pipeline.
 */
export async function runAdvisory(cropType, location, query, imageFile = null) {
  const formData = new FormData();
  formData.append('crop_type', cropType);
  formData.append('location', location);
  formData.append('query', query || `Analyze crop health for ${cropType} in ${location}`);
  
  if (imageFile) {
    formData.append('image', imageFile);
  }

  const response = await fetch(`${API_BASE_URL}/advisory`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ detail: 'Failed to execute pipeline' }));
    throw new Error(errData.detail || 'Failed to connect to KisanMind API');
  }

  return response.json();
}

/**
 * Fetch past advisory reports for a session ID.
 */
export async function getHistory(sessionId) {
  const response = await fetch(`${API_BASE_URL}/history/${encodeURIComponent(sessionId)}`);
  if (!response.ok) {
    throw new Error('Failed to retrieve history');
  }
  return response.json();
}

/**
 * Download a PDF copy of the advisory report.
 */
export async function downloadAdvisoryPdf(sessionId, reportMarkdown) {
  const formData = new FormData();
  formData.append('session_id', sessionId);
  formData.append('report', reportMarkdown);

  const response = await fetch(`${API_BASE_URL}/advisory/pdf`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to download report PDF');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kisanmind_report_${sessionId.slice(0, 8)}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Fetch real-time weather from OpenWeatherMap via backend.
 * @param {string} location - City name (e.g. "Delhi")
 * @returns {Promise<object>} { success, location, today, forecast_3d }
 */
export async function fetchWeather(location = 'Delhi') {
  const response = await fetch(`${API_BASE_URL}/weather?location=${encodeURIComponent(location)}`);
  if (!response.ok) {
    const errData = await response.json().catch(() => ({ detail: 'Weather fetch failed' }));
    throw new Error(errData.detail || 'Failed to fetch weather');
  }
  return response.json();
}

/**
 * Fetch eligible government schemes via Tavily + LLM.
 * @param {string} crop - Crop type (e.g. "tomato")
 * @param {string} location - State name (e.g. "Maharashtra")
 * @returns {Promise<object>} { success, scheme_result }
 */
export async function fetchSchemes(crop = 'wheat', location = 'Maharashtra') {
  const response = await fetch(
    `${API_BASE_URL}/schemes?crop=${encodeURIComponent(crop)}&location=${encodeURIComponent(location)}`
  );
  if (!response.ok) {
    const errData = await response.json().catch(() => ({ detail: 'Scheme search failed' }));
    throw new Error(errData.detail || 'Failed to fetch schemes');
  }
  return response.json();
}

/**
 * Get XGBoost 7-day crop price prediction.
 * @param {string} crop - Crop type
 * @param {string} state - Indian state
 * @param {number} month - Current month (1-12)
 * @param {number} lastPrice - Last known price per quintal
 * @returns {Promise<object>} { success, prediction }
 */
export async function fetchPrediction(crop = 'tomato', state = 'Maharashtra', month = 6, lastPrice = 2500) {
  const response = await fetch(
    `${API_BASE_URL}/predict?crop=${encodeURIComponent(crop)}&state=${encodeURIComponent(state)}&month=${month}&last_price=${lastPrice}`
  );
  if (!response.ok) {
    const errData = await response.json().catch(() => ({ detail: 'Prediction failed' }));
    throw new Error(errData.detail || 'Failed to get prediction');
  }
  return response.json();
}

/**
 * Get current LLM model info.
 * @returns {Promise<object>} { success, provider, model, api_key_set, available_providers }
 */
export async function getModelInfo() {
  const response = await fetch(`${API_BASE_URL}/settings/model`);
  if (!response.ok) {
    throw new Error('Failed to get model info');
  }
  return response.json();
}

/**
 * Switch the active LLM provider and model at runtime.
 * @param {string} provider - Provider name (gemini, groq, ollama, openrouter, openai)
 * @param {string} [modelName] - Optional model name override
 * @returns {Promise<object>} { success, message, provider, model }
 */
export async function switchModel(provider, modelName = null) {
  const formData = new FormData();
  formData.append('provider', provider);
  if (modelName) {
    formData.append('model_name', modelName);
  }

  const response = await fetch(`${API_BASE_URL}/settings/model`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ detail: 'Failed to switch model' }));
    throw new Error(errData.detail || 'Failed to switch model');
  }
  return response.json();
}

