const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Execute the multi-agent agricultural advisory pipeline.
 * 
 * @param {string} cropType - Type of crop (e.g. tomato, onion)
 * @param {string} location - Farmer's location (e.g. Nashik, Maharashtra)
 * @param {string} query - Farmer's custom question or prompt
 * @param {File|null} imageFile - Optional photo of the infected crop
 * @returns {Promise<object>} Parsed response JSON from FastAPI
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
 * 
 * @param {string} sessionId - User session identifier
 * @returns {Promise<object>} History reports object
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
 * 
 * @param {string} sessionId - The advisory session ID
 * @param {string} reportMarkdown - The full markdown content of the report
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
