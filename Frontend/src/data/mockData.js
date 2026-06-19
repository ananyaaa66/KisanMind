// Realistic mock data for the 5 agents. Componentized so backend is a drop-in later.

export const farmer = {
  name: { en: 'Ramesh Kumar', hi: 'रमेश कुमार' },
  location: { en: 'Nashik, Maharashtra', hi: 'नासिक, महाराष्ट्र' },
  crop: 'tomato',
}

export const weatherSnapshot = {
  temp: 29,
  rainChance: 65,
  condition: { en: 'Cloudy, light showers', hi: 'बादल, हल्की बौछार' },
}

export const todayAdvisory = {
  title: { en: 'Spray fungicide before evening rain', hi: 'शाम की बारिश से पहले फफूंदनाशक छिड़कें' },
  body: {
    en: 'High humidity + 65% rain expected. Apply Mancozeb to tomato to prevent early blight.',
    hi: 'अधिक नमी और 65% बारिश की संभावना। टमाटर पर अगेती झुलसा रोकने हेतु मैनकोज़ेब डालें।',
  },
  priority: 'high',
}

export const recentReports = [
  { id: 'r1', title: { en: 'Tomato leaf diagnosis', hi: 'टमाटर पत्ती निदान' }, date: '12 Jun 2024' },
  { id: 'r2', title: { en: 'Onion mandi price plan', hi: 'प्याज़ मंडी भाव योजना' }, date: '09 Jun 2024' },
  { id: 'r3', title: { en: 'PM-KISAN eligibility', hi: 'पीएम-किसान पात्रता' }, date: '04 Jun 2024' },
]

// Agent 1: Disease
export const diseaseResult = {
  name: { en: 'Early Blight', hi: 'अगेती झुलसा' },
  severity: 'amber', // green | amber | red
  affectedPct: 38,
  pathogen: 'Alternaria solani',
  treatment: {
    pesticide: { en: 'Mancozeb 75% WP', hi: 'मैनकोज़ेब 75% WP' },
    dosage: { en: '2.5 g per litre of water', hi: '2.5 ग्राम प्रति लीटर पानी' },
    method: { en: 'Foliar spray, cover both leaf sides, repeat in 10 days', hi: 'पत्तियों पर छिड़काव, दोनों ओर, 10 दिन बाद दोहराएँ' },
  },
}

// Agent 2: Market prices
export const crops = [
  { id: 'tomato', label: { en: 'Tomato', hi: 'टमाटर' }, icon: '🍅' },
  { id: 'onion', label: { en: 'Onion', hi: 'प्याज़' }, icon: '🧅' },
  { id: 'wheat', label: { en: 'Wheat', hi: 'गेहूँ' }, icon: '🌾' },
  { id: 'cotton', label: { en: 'Cotton', hi: 'कपास' }, icon: '☁️' },
  { id: 'soybean', label: { en: 'Soybean', hi: 'सोयाबीन' }, icon: '🫘' },
]

const genTrend = (base, vol) =>
  Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    price: Math.round(base + Math.sin(i / 3) * vol + (Math.random() - 0.5) * vol * 0.6),
  }))

export const priceData = {
  tomato: { current: 2450, trend: genTrend(2300, 220), action: { type: 'sell', reason: { en: 'Prices peaked, supply rising next week', hi: 'भाव चरम पर, अगले हफ्ते आवक बढ़ेगी' } } },
  onion: { current: 1820, trend: genTrend(1700, 180), action: { type: 'wait', days: 6, reason: { en: 'Festival demand will lift rates', hi: 'त्योहारी मांग से भाव चढ़ेंगे' } } },
  wheat: { current: 2275, trend: genTrend(2250, 90), action: { type: 'sell', reason: { en: 'MSP level reached, stable demand', hi: 'एमएसपी स्तर, स्थिर मांग' } } },
  cotton: { current: 7150, trend: genTrend(7000, 320), action: { type: 'wait', days: 9, reason: { en: 'Export orders expected to firm prices', hi: 'निर्यात ऑर्डर से भाव मजबूत होंगे' } } },
  soybean: { current: 4680, trend: genTrend(4600, 200), action: { type: 'sell', reason: { en: 'Oil demand strong, sell surplus now', hi: 'तेल मांग मजबूत, अधिशेष अभी बेचें' } } },
}

export const mandis = {
  tomato: [
    { name: { en: 'Pimpalgaon Mandi', hi: 'पिंपळगाव मंडी' }, price: 2510, dist: 12 },
    { name: { en: 'Nashik APMC', hi: 'नासिक एपीएमसी' }, price: 2450, dist: 8 },
    { name: { en: 'Lasalgaon Mandi', hi: 'लासलगाव मंडी' }, price: 2390, dist: 24 },
  ],
}

// Agent 3: Schemes
export const indianStates = ['Maharashtra', 'Punjab', 'Uttar Pradesh', 'Karnataka', 'Gujarat', 'Madhya Pradesh', 'Rajasthan', 'Bihar']

export const schemes = [
  {
    id: 's1',
    name: { en: 'PM-KISAN Samman Nidhi', hi: 'पीएम-किसान सम्मान निधि' },
    benefit: { en: '₹6,000/year income support', hi: '₹6,000/वर्ष आय सहायता' },
    eligible: true,
    documents: { en: ['Aadhaar card', 'Land records (7/12)', 'Bank passbook'], hi: ['आधार कार्ड', 'भूमि रिकॉर्ड (7/12)', 'बैंक पासबुक'] },
    steps: { en: ['Register on pmkisan.gov.in', 'eKYC verification', 'Link bank account'], hi: ['pmkisan.gov.in पर रजिस्टर करें', 'ई-केवाईसी सत्यापन', 'बैंक खाता जोड़ें'] },
    deadline: { en: 'Rolling — apply anytime', hi: 'कभी भी आवेदन करें' },
  },
  {
    id: 's2',
    name: { en: 'Pradhan Mantri Fasal Bima Yojana', hi: 'प्रधानमंत्री फसल बीमा योजना' },
    benefit: { en: 'Crop insurance, low premium', hi: 'फसल बीमा, कम प्रीमियम' },
    eligible: true,
    documents: { en: ['Aadhaar', 'Sowing certificate', 'Bank details'], hi: ['आधार', 'बुवाई प्रमाणपत्र', 'बैंक विवरण'] },
    steps: { en: ['Apply via bank/CSC', 'Pay premium share', 'Get policy receipt'], hi: ['बैंक/सीएससी से आवेदन', 'प्रीमियम भरें', 'पॉलिसी रसीद लें'] },
    deadline: { en: '31 Jul 2024 (Kharif)', hi: '31 जुलाई 2024 (खरीफ)' },
  },
  {
    id: 's3',
    name: { en: 'Kisan Credit Card', hi: 'किसान क्रेडिट कार्ड' },
    benefit: { en: 'Low-interest crop loan up to ₹3 lakh', hi: '₹3 लाख तक कम ब्याज ऋण' },
    eligible: false,
    documents: { en: ['ID proof', 'Land ownership proof', 'Photo'], hi: ['पहचान प्रमाण', 'भूमि स्वामित्व', 'फोटो'] },
    steps: { en: ['Visit bank branch', 'Submit KCC form', 'Verification & approval'], hi: ['बैंक शाखा जाएँ', 'केसीसी फॉर्म भरें', 'सत्यापन व मंज़ूरी'] },
    deadline: { en: 'Rolling', hi: 'कभी भी' },
  },
]

// Agent 4: Weather
export const forecast = [
  { day: { en: 'Mon', hi: 'सोम' }, temp: 29, rain: 65, icon: 'rain' },
  { day: { en: 'Tue', hi: 'मंगल' }, temp: 31, rain: 20, icon: 'cloud' },
  { day: { en: 'Wed', hi: 'बुध' }, temp: 33, rain: 5, icon: 'sun' },
  { day: { en: 'Thu', hi: 'गुरु' }, temp: 30, rain: 40, icon: 'cloud' },
  { day: { en: 'Fri', hi: 'शुक्र' }, temp: 28, rain: 70, icon: 'rain' },
]

export const actionTimeline = [
  { type: 'spray', when: { en: 'Today, before 5 PM', hi: 'आज, शाम 5 बजे से पहले' }, text: { en: 'Spray fungicide before rain', hi: 'बारिश से पहले फफूंदनाशक छिड़कें' } },
  { type: 'irrigate', when: { en: 'Wed (dry spell)', hi: 'बुध (सूखा दौर)' }, text: { en: 'Light irrigation in morning', hi: 'सुबह हल्की सिंचाई' } },
  { type: 'harvest', when: { en: 'Next week', hi: 'अगले हफ्ते' }, text: { en: 'Harvest ripe tomato batches', hi: 'पके टमाटर की तुड़ाई' } },
]

export const soilTip = {
  en: 'Moist black soil + warm season favours fungal growth. Ensure drainage and avoid overhead watering in evening.',
  hi: 'नम काली मिट्टी और गर्म मौसम फफूंद बढ़ाते हैं। जल निकासी रखें और शाम को ऊपर से सिंचाई न करें।',
}

// Agent 5: Historical disease reports for AdvisoryReports screen
export const advisoryReports = [
  {
    id: 'report-001',
    title: { en: 'Tomato Early Blight Detection', hi: 'टमाटर अगेती झुलसा पहचान' },
    date: '12 Jun 2024',
    severity: 'amber',
    crop: 'tomato',
    imageUrl: null, // placeholder for uploaded image
    treatment: 'Mancozeb 75% WP - 2.5 g/L',
    recommendations: {
      en: ['Spray immediately before rain', 'Improve drainage around plants', 'Remove infected leaves', 'Repeat spray in 10 days'],
      hi: ['बारिश से पहले तुरंत छिड़कें', 'पौधों के पास ड्रेनेज बेहतर करें', 'संक्रमित पत्तियाँ हटाएँ', '10 दिन बाद दोहराएँ'],
    },
    status: 'resolved',
  },
  {
    id: 'report-002',
    title: { en: 'Onion Neck Rot Prevention', hi: 'प्याज़ नेक रॉट रोकथाम' },
    date: '05 Jun 2024',
    severity: 'red',
    crop: 'onion',
    treatment: 'Trichoderma harzianum',
    recommendations: {
      en: ['Reduce irrigation 2 weeks before harvest', 'Ensure proper field drying', 'Store in cool, dry place'],
      hi: ['कटाई से 2 हफ्ते पहले सिंचाई कम करें', 'खेत को ठीक से सूखाएँ', 'ठंडे, सूखे स्थान पर रखें'],
    },
    status: 'ongoing',
  },
  {
    id: 'report-003',
    title: { en: 'Wheat Leaf Spot Management', hi: 'गेहूँ पत्ती चित्ती प्रबंधन' },
    date: '28 May 2024',
    severity: 'green',
    crop: 'wheat',
    treatment: 'Propiconazole 25% EC',
    recommendations: {
      en: ['Monitor weekly for new spots', 'Ensure good air circulation', 'Remove crop residue after harvest'],
      hi: ['साप्ताहिक निरीक्षण करें', 'अच्छी हवा का संचार सुनिश्चित करें', 'कटाई के बाद अवशेष हटाएँ'],
    },
    status: 'resolved',
  },
]

// Crop health tracking data
export const cropHealthHistory = [
  { date: '10 Jun', score: 72, status: 'good', notes: { en: 'Healthy growth', hi: 'स्वस्थ विकास' } },
  { date: '11 Jun', score: 68, status: 'fair', notes: { en: 'Early blight detected', hi: 'अगेती झुलसा पाया गया' } },
  { date: '12 Jun', score: 70, status: 'fair', notes: { en: 'Treatment applied', hi: 'उपचार लागू' } },
]

export const cropHealthScore = {
  overall: 70,
  foliage: 'fair',
  stem: 'good',
  soil: 'good',
  disease: 'amber', // presence of disease risk
}

// Farmer profile data
export const farmerProfile = {
  name: { en: 'Ramesh Kumar Singh', hi: 'रमेश कुमार सिंह' },
  phone: '+91 98765 43210',
  email: 'ramesh.kumar@email.com',
  location: { en: 'Nashik, Maharashtra', hi: 'नासिक, महाराष्ट्र' },
  joinedDate: '2023-06-15',
  totalLand: { value: 2.5, unit: { en: 'hectares', hi: 'हेक्टेयर' } },
  crops: [
    {
      name: 'tomato',
      area: { value: 1.0, unit: { en: 'hectares', hi: 'हेक्टेयर' } },
      soilType: { en: 'Black soil', hi: 'काली मिट्टी' },
      plantingDate: '2024-03-15',
      expectedHarvest: '2024-07-15',
    },
    {
      name: 'onion',
      area: { value: 1.5, unit: { en: 'hectares', hi: 'हेक्टेयर' } },
      soilType: { en: 'Loamy soil', hi: 'दोमट मिट्टी' },
      plantingDate: '2024-04-01',
      expectedHarvest: '2024-08-15',
    },
  ],
  bankDetails: {
    accountHolder: { en: 'Ramesh Kumar Singh', hi: 'रमेश कुमार सिंह' },
    bankName: { en: 'SBI Bank', hi: 'एसबीआई बैंक' },
    accountNumber: '****5678',
    ifsc: 'SBIN0001234',
  },
  schemes: [
    { id: 's1', name: { en: 'PM-KISAN', hi: 'पीएम-किसान' }, status: 'active', joinedDate: '2023-07-01' },
    { id: 's2', name: { en: 'PMFBY', hi: 'पीएमएफबीवाई' }, status: 'active', joinedDate: '2024-01-10' },
  ],
  stats: {
    totalReports: 12,
    resolvedIssues: 10,
    schemesEnrolled: 2,
  },
}

// Settings options for farmer
export const settingsOptions = {
  notifications: {
    diseaseAlerts: true,
    weatherWarnings: true,
    priceUpdates: true,
    schemeReminders: true,
  },
  preferences: {
    language: 'en', // will sync with app context
    temperatureUnit: 'celsius',
    areaUnit: 'hectare',
    currency: 'INR',
  },
  privacy: {
    shareLocationData: true,
    shareYieldData: false,
    sharePhoneWithPartners: false,
  },
  dataSync: {
    autoBackup: true,
    lastSync: '2024-06-12 14:32',
  },
}

// Extended disease database for Disease Scan improvements
export const diseaseDatabase = [
  {
    id: 'disease-001',
    name: { en: 'Early Blight', hi: 'अगेती झुलसा' },
    crop: 'tomato',
    symptoms: {
      en: ['Brown spots on leaves', 'Concentric rings pattern', 'Yellowing around spots', 'Stem lesions'],
      hi: ['पत्तियों पर भूरे धब्बे', 'संकेंद्रित वलय पैटर्न', 'धब्बों के आसपास पीलापन', 'तने पर घाव'],
    },
    treatment: 'Mancozeb 75% WP',
    preventionTips: {
      en: ['Proper plant spacing', 'Avoid overhead watering', 'Remove infected leaves', 'Ensure good drainage'],
      hi: ['उचित पौधा अंतराल', 'ऊपर से सिंचाई न करें', 'संक्रमित पत्तियाँ हटाएँ', 'अच्छी ड्रेनेज'],
    },
  },
  {
    id: 'disease-002',
    name: { en: 'Late Blight', hi: 'पिछेती झुलसा' },
    crop: 'tomato',
    symptoms: {
      en: ['Water-soaked spots', 'White mold on underside', 'Rapid spread in wet weather', 'Fruit rot'],
      hi: ['पानी से भीगे धब्बे', 'निचली ओर सफेद सड़ंध', 'नम मौसम में तेजी से फैलाव', 'फल सड़ना'],
    },
    treatment: 'Metalaxyl 8% + Mancozeb 64%',
    preventionTips: {
      en: ['Improve air circulation', 'Remove lower leaves', 'Avoid crop contact when wet', 'Burn infected material'],
      hi: ['हवा का संचार बेहतर करें', 'निचली पत्तियाँ हटाएँ', 'गीली अवस्था में पौधे स्पर्श न करें', 'संक्रमित सामग्री जलाएँ'],
    },
  },
]

// Extended market data for Mandi Prices improvements with trends
export const mandiPriceTrends = {
  tomato: {
    weeklyAverage: 2450,
    priceChange: '+5.2%',
    trend: 'upward',
    recommendation: { en: 'Sell now while prices are high', hi: 'अभी कीमतें अधिक हैं, बेच दें' },
  },
  onion: {
    weeklyAverage: 1820,
    priceChange: '+2.1%',
    trend: 'stable',
    recommendation: { en: 'Wait for festival season surge', hi: 'त्योहारी मौसम का इंतजार करें' },
  },
}

// More comprehensive scheme details
export const schemeDetails = {
  s1: {
    fullName: { en: 'Pradhan Mantri Kisan Samman Nidhi', hi: 'प्रधानमंत्री किसान सम्मान निधि' },
    launchYear: 2019,
    totalBudget: { en: '₹75,000 crore', hi: '₹75,000 करोड़' },
    eligibility: {
      landHolding: { en: 'All landholding farmers', hi: 'सभी भूमि धारक किसान' },
      income: { en: 'Below ₹1.5 crore annual income', hi: '₹1.5 करोड़ से कम वार्षिक आय' },
      age: { en: 'No age restriction', hi: 'कोई आयु सीमा नहीं' },
    },
    disbursement: { en: '₹6,000 in 3 installments of ₹2,000 each', hi: '3 किश्तों में ₹2,000 प्रत्येक' },
  },
  s2: {
    fullName: { en: 'Pradhan Mantri Fasal Bima Yojana', hi: 'प्रधानमंत्री फसल बीमा योजना' },
    launchYear: 2016,
    coverage: { en: 'Upto 70% of crop value', hi: 'फसल मूल्य का 70% तक' },
    premiumSharing: {
      kharif: { en: 'Farmer 2%, Government 48%', hi: 'किसान 2%, सरकार 48%' },
      rabi: { en: 'Farmer 1.5%, Government 48.5%', hi: 'किसान 1.5%, सरकार 48.5%' },
    },
  },
}

// Enhanced weather data with detailed recommendations
export const weatherAdvisory = [
  {
    date: '12 Jun 2024',
    condition: { en: 'Light showers expected', hi: 'हल्की बारिश की संभावना' },
    recommendation: { en: 'Spray fungicide before 5 PM', hi: 'शाम 5 बजे से पहले फफूंदनाशक स्प्रे करें' },
  },
  {
    date: '13 Jun 2024',
    condition: { en: 'Sunny, hot', hi: 'धूप, गर्म' },
    recommendation: { en: 'Increase irrigation, mulch soil', hi: 'सिंचाई बढ़ाएँ, मल्च लगाएँ' },
  },
]

// Seven-day comprehensive forecast
export const extendedForecast = [
  { day: 'Mon', temp: 29, minTemp: 22, rain: 65, humidity: 78, windSpeed: 12, icon: 'rain' },
  { day: 'Tue', temp: 31, minTemp: 24, rain: 20, humidity: 65, windSpeed: 8, icon: 'cloud' },
  { day: 'Wed', temp: 33, minTemp: 25, rain: 5, humidity: 52, windSpeed: 6, icon: 'sun' },
  { day: 'Thu', temp: 30, minTemp: 23, rain: 40, humidity: 70, windSpeed: 10, icon: 'cloud' },
  { day: 'Fri', temp: 28, minTemp: 21, rain: 70, humidity: 80, windSpeed: 14, icon: 'rain' },
  { day: 'Sat', temp: 32, minTemp: 26, rain: 10, humidity: 60, windSpeed: 7, icon: 'sun' },
  { day: 'Sun', temp: 34, minTemp: 27, rain: 2, humidity: 48, windSpeed: 5, icon: 'sun' },
]
