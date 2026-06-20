/**
 * UI-only constants — crop labels, state list.
 * NO mock data, NO hardcoded values, NO fake API responses.
 * All live data comes from the backend API.
 */

// Crop selector labels (UI-only, not data)
export const crops = [
  { id: 'tomato', label: { en: 'Tomato', hi: 'टमाटर' }, icon: '🍅' },
  { id: 'onion', label: { en: 'Onion', hi: 'प्याज़' }, icon: '🧅' },
  { id: 'wheat', label: { en: 'Wheat', hi: 'गेहूँ' }, icon: '🌾' },
  { id: 'cotton', label: { en: 'Cotton', hi: 'कपास' }, icon: '☁️' },
  { id: 'soybean', label: { en: 'Soybean', hi: 'सोयाबीन' }, icon: '🫘' },
]

// Indian state names for dropdown (UI-only)
export const indianStates = [
  'Maharashtra', 'Punjab', 'Uttar Pradesh', 'Karnataka',
  'Gujarat', 'Madhya Pradesh', 'Rajasthan', 'Bihar',
]
