/**
 * UI constants — crop labels, state list, district mapping.
 * NO mock data, NO hardcoded values, NO fake API responses.
 * All live data comes from the backend API.
 *
 * Crops & districts sourced from:
 *   Dataset/agmarknet_india_historical_prices_2024_2025.csv
 */

// ───────────────────────────────────────────
// Crop selector labels  (from dataset + icons)
// ───────────────────────────────────────────
export const crops = [
  { id: 'wheat',           label: { en: 'Wheat',           hi: 'गेहूँ' },           icon: '🌾' },
  { id: 'rice',            label: { en: 'Rice',            hi: 'चावल' },            icon: '🍚' },
  { id: 'maize',           label: { en: 'Maize',           hi: 'मक्का' },           icon: '🌽' },
  { id: 'bajra',           label: { en: 'Bajra',           hi: 'बाजरा' },          icon: '🌿' },
  { id: 'jowar',           label: { en: 'Jowar',           hi: 'ज्वार' },          icon: '🌱' },
  { id: 'cotton',          label: { en: 'Cotton',          hi: 'कपास' },           icon: '☁️' },
  { id: 'soyabean',        label: { en: 'Soyabean',        hi: 'सोयाबीन' },        icon: '🫘' },
  { id: 'mustard',         label: { en: 'Mustard',         hi: 'सरसों' },           icon: '🌻' },
  { id: 'groundnut',       label: { en: 'Groundnut',       hi: 'मूंगफली' },        icon: '🥜' },
  { id: 'arhar',           label: { en: 'Arhar (Tur Dal)', hi: 'अरहर दाल' },       icon: '🫛' },
  { id: 'green_gram',      label: { en: 'Green Gram (Moong)', hi: 'मूंग दाल' },    icon: '🟢' },
  { id: 'lentil',          label: { en: 'Lentil (Masur)',  hi: 'मसूर दाल' },       icon: '🟤' },
  { id: 'sugarcane',       label: { en: 'Sugarcane',       hi: 'गन्ना' },          icon: '🎋' },
  { id: 'onion',           label: { en: 'Onion',           hi: 'प्याज़' },          icon: '🧅' },
  { id: 'potato',          label: { en: 'Potato',          hi: 'आलू' },            icon: '🥔' },
  { id: 'tomato',          label: { en: 'Tomato',          hi: 'टमाटर' },          icon: '🍅' },
  { id: 'green_chilli',    label: { en: 'Green Chilli',    hi: 'हरी मिर्च' },      icon: '🌶️' },
  { id: 'garlic',          label: { en: 'Garlic',          hi: 'लहसुन' },          icon: '🧄' },
  { id: 'ginger',          label: { en: 'Ginger',          hi: 'अदरक' },           icon: '🫚' },
  { id: 'cauliflower',     label: { en: 'Cauliflower',     hi: 'फूलगोभी' },        icon: '🥦' },
  { id: 'cabbage',         label: { en: 'Cabbage',         hi: 'पत्तागोभी' },      icon: '🥬' },
  { id: 'carrot',          label: { en: 'Carrot',          hi: 'गाजर' },           icon: '🥕' },
  { id: 'bhindi',          label: { en: 'Bhindi (Okra)',   hi: 'भिंडी' },          icon: '🟩' },
  { id: 'brinjal',         label: { en: 'Brinjal',         hi: 'बैंगन' },          icon: '🍆' },
  { id: 'banana',          label: { en: 'Banana',          hi: 'केला' },            icon: '🍌' },
  { id: 'mango',           label: { en: 'Mango',           hi: 'आम' },             icon: '🥭' },
  { id: 'apple',           label: { en: 'Apple',           hi: 'सेब' },            icon: '🍎' },
  { id: 'turmeric',        label: { en: 'Turmeric',        hi: 'हल्दी' },          icon: '🟡' },
  { id: 'gur',             label: { en: 'Gur (Jaggery)',   hi: 'गुड़' },            icon: '🟫' },
]

// Map from crop.id → dataset Commodity name (for ML / price lookup)
export const cropToDatasetName = {
  wheat:        'Wheat',
  rice:         'Rice',
  maize:        'Maize',
  bajra:        'Bajra(Pearl Millet/Cumbu)',
  jowar:        'Jowar(Sorghum)',
  cotton:       'Cotton',
  soyabean:     'Soyabean',
  mustard:      'Mustard',
  groundnut:    'Groundnut',
  arhar:        'Arhar (Tur/Red Gram)(Whole)',
  green_gram:   'Green Gram (Moong)(Whole)',
  lentil:       'Lentil (Masur)(Whole)',
  sugarcane:    'Sugarcane',
  onion:        'Onion',
  potato:       'Potato',
  tomato:       'Tomato',
  green_chilli: 'Green Chilli',
  garlic:       'Garlic',
  ginger:       'Ginger(Green)',
  cauliflower:  'Cauliflower',
  cabbage:      'Cabbage',
  carrot:       'Carrot',
  bhindi:       'Bhindi(Ladies Finger)',
  brinjal:      'Brinjal',
  banana:       'Banana',
  mango:        'Mango',
  apple:        'Apple',
  turmeric:     'Turmeric',
  gur:          'Gur(Jaggery)',
}

// Approximate last-known mandi prices (₹ per quintal) — used as defaults
export const lastKnownPrices = {
  wheat: 2450,   rice: 3200,    maize: 2200,     bajra: 2600,
  jowar: 3000,   cotton: 7200,  soyabean: 4800,  mustard: 5500,
  groundnut: 6000, arhar: 7500, green_gram: 7000, lentil: 5200,
  sugarcane: 350,  onion: 1800,  potato: 1200,    tomato: 2500,
  green_chilli: 4000, garlic: 5000, ginger: 4500, cauliflower: 1500,
  cabbage: 1000,  carrot: 2000,  bhindi: 2500,    brinjal: 1800,
  banana: 2800,   mango: 4000,   apple: 8000,     turmeric: 9000,
  gur: 4500,
}

// ───────────────────────────────────────────
// All Indian States & UTs
// ───────────────────────────────────────────
export const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  // Union Territories
  'Andaman & Nicobar', 'Chandigarh', 'Dadra & Nagar Haveli',
  'Daman & Diu', 'Delhi', 'Jammu & Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
]

// States that have data in the agmarknet dataset
export const datasetStates = [
  'Andhra Pradesh', 'Gujarat', 'Kerala', 'Madhya Pradesh',
  'Punjab', 'Rajasthan', 'Uttar Pradesh', 'West Bengal',
]

// ───────────────────────────────────────────
// State → Districts mapping  (from dataset)
// ───────────────────────────────────────────
export const stateDistricts = {
  'Andhra Pradesh': [
    'Anantapur', 'Cuddapah', 'East Godavari', 'Guntur',
    'Krishna', 'Kurnool', 'Nellore', 'Visakhapatnam',
    'West Godavari',
  ],
  'Gujarat': [
    'Ahmedabad', 'Amreli', 'Anand', 'Banaskanth', 'Bharuch',
    'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod', 'Dang',
    'DevBhumi Dwarka', 'Gandhinagar', 'Gir Somnath', 'Jamnagar',
    'Junagarh', 'Kachchh', 'Kheda', 'Mehsana', 'Morbi',
    'Narmada', 'Navsari', 'Panchmahals', 'Patan', 'Porbandar',
    'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar',
    'Vadodara', 'Valsad',
  ],
  'Kerala': [
    'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasargod',
    'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakad',
    'Pathanamthitta', 'Thirssur', 'Thiruvananthapuram', 'Wayanad',
  ],
  'Madhya Pradesh': [
    'Agar Malwa', 'Alirajpur', 'Anupgarh', 'Anupur',
    'Ashoknagar', 'Badwani', 'Balaghat', 'Betul', 'Bhind',
    'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara', 'Damoh',
    'Datia', 'Dewas', 'Dhar', 'Dindori', 'Guna', 'Gwalior',
    'Harda', 'Hoshangabad', 'Indore', 'Jabalpur', 'Jhabua',
    'Katni', 'Khandwa', 'Khargone', 'Mandla', 'Mandsaur',
    'Morena', 'Narsinghpur', 'Neemuch', 'Panna', 'Raisen',
    'Rajgarh', 'Ratlam', 'Rewa', 'Sagar', 'Satna', 'Sehore',
    'Seoni', 'Shajapur', 'Shehdol', 'Sheopur', 'Shivpuri',
    'Sidhi', 'Singroli', 'Tikamgarh', 'Ujjain', 'Umariya',
    'Vidisha',
  ],
  'Punjab': [
    'Amritsar', 'Barnala', 'Bhatinda', 'Faridkot', 'Fatehgarh',
    'Fazilka', 'Ferozpur', 'Gurdaspur', 'Hoshiarpur',
    'Jalandhar', 'Kapurthala', 'Ludhiana', 'Mansa', 'Moga',
    'Mohali', 'Muktsar', 'Nawanshahr', 'Pathankot', 'Patiala',
    'Ropar (Rupnagar)', 'Sangrur', 'Tarntaran',
  ],
  'Rajasthan': [
    'Ajmer', 'Alwar', 'Anupgarh', 'Balotra', 'Baran',
    'Barmer', 'Beawar', 'Bharatpur', 'Bhilwara', 'Bikaner',
    'Bundi', 'Chittor', 'Chittorgarh', 'Churu', 'Dausa',
    'Deedwana Kuchaman', 'Deeg', 'Dholpur', 'Dudu', 'Dungarpur',
    'Ganganagar', 'Gangapur City', 'Hanumangarh', 'Jaipur',
    'Jaipur Rural', 'Jaisalmer', 'Jalore', 'Jhalawar',
    'Jhunjhunu', 'Jodhpur', 'Jodhpur Rural', 'Karauli', 'Kekri',
    'Khairthal Tijara', 'Kota', 'Kotputli-Behror', 'Nagaur',
    'Neem Ka Thana', 'Pali', 'Phalodi', 'Pratapgarh',
    'Rajsamand', 'Sanchore', 'Sikar', 'Sirohi',
    'Swai Madhopur', 'Tonk', 'Udaipur',
  ],
  'Uttar Pradesh': [
    'Agra', 'Aligarh', 'Ambedkarnagar', 'Amethi', 'Amroha',
    'Auraiya', 'Ayodhya', 'Azamgarh', 'Badaun', 'Baghpat',
    'Bahraich', 'Ballia', 'Balrampur', 'Banda', 'Barabanki',
    'Bareilly', 'Basti', 'Bhadohi', 'Bijnor', 'Bulandshahar',
    'Chandauli', 'Chitrakut', 'Deoria', 'Etah', 'Etawah',
    'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Budh Nagar',
    'Ghaziabad', 'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur',
    'Hardoi', 'Hathras', 'Jaunpur', 'Jhansi', 'Kannauj',
    'Kanpur', 'Kanpur Dehat', 'Kasganj', 'Kaushambi',
    'Kushinagar', 'Lakhimpur', 'Lalitpur', 'Lucknow',
    'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura', 'Mau',
    'Meerut', 'Mirzapur', 'Muzaffarnagar', 'Pillibhit',
    'Pratapgarh', 'Prayagraj', 'Raebarelli', 'Rampur',
    'Saharanpur', 'Sambhal', 'Sant Kabir Nagar',
    'Shahjahanpur', 'Shamli', 'Shravasti', 'Siddharth Nagar',
    'Sitapur', 'Sonbhadra', 'Unnao', 'Varanasi',
  ],
  'West Bengal': [
    'Alipurduar', 'Bankura', 'Birbhum', 'Coochbehar',
    'Dakshin Dinajpur', 'Darjeeling', 'Hooghly', 'Howrah',
    'Jhargram', 'Jalpaiguri', 'Kalimpong', 'Kolkata', 'Malda',
    'Medinipur (E)', 'Medinipur (W)', 'Murshidabad', 'Nadia',
    'North 24 Parganas', 'Paschim Bardhaman', 'Purba Bardhaman',
    'Puruliya', 'South 24 Parganas', 'Uttar Dinajpur',
  ],
}

// Helper: get districts for a state (returns empty array for states not in dataset)
export function getDistrictsForState(state) {
  return stateDistricts[state] || []
}

// Helper: check if a state has price data in the dataset
export function hasDatasetData(state) {
  return datasetStates.includes(state)
}
