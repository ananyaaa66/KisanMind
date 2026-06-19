import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, ImageUp, FlaskConical, Droplets, Sprout, MessageCircle, FileText, MapPin, HelpCircle } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { t } from '../data/i18n.js'
import Screen from '../components/Screen.jsx'
import LeafSpinner from '../components/LeafSpinner.jsx'
import RadialGauge from '../components/RadialGauge.jsx'
import SpeakButton from '../components/SpeakButton.jsx'

const cropsList = [
  { id: 'tomato', label: { en: 'Tomato', hi: 'टमाटर' }, icon: '🍅' },
  { id: 'onion', label: { en: 'Onion', hi: 'प्याज़' }, icon: '🧅' },
  { id: 'wheat', label: { en: 'Wheat', hi: 'गेहूँ' }, icon: '🌾' },
  { id: 'cotton', label: { en: 'Cotton', hi: 'कपास' }, icon: '☁️' },
  { id: 'soybean', label: { en: 'Soybean', hi: 'सोयाबीन' }, icon: '🫘' },
]

const sevColor = {
  low: 'text-cropbright border-crop/40 bg-crop/10',
  medium: 'text-lime border-lime/40 bg-lime/10',
  high: 'text-red-400 border-red-500/40 bg-red-500/10'
}
const sevLabel = {
  low: { en: 'Mild', hi: 'हल्का' },
  medium: { en: 'Moderate', hi: 'मध्यम' },
  high: { en: 'Severe', hi: 'गंभीर' }
}

export default function DiseaseScan() {
  const { lang, runAdvisoryPipeline, loading, advisoryData, setReportOpen } = useApp()
  
  // Form states
  const [cropType, setCropType] = useState('tomato')
  const [location, setLocation] = useState('Nashik, Maharashtra')
  const [query, setQuery] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleScan = async (e) => {
    e.preventDefault()
    try {
      const defaultQuery = lang === 'hi' 
        ? `इस ${cropType} की फसल के लिए रोग की जांच करें और समाधान बताएं।` 
        : `Diagnose crop health and diseases for ${cropType} and suggest treatments.`
      
      await runAdvisoryPipeline(
        cropType, 
        location, 
        query || defaultQuery, 
        selectedFile
      )
    } catch (err) {
      alert(lang === 'hi' ? 'स्कैन करने में विफल: ' + err.message : 'Scan failed: ' + err.message)
    }
  }

  const reset = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setQuery('')
  }

  // Active result mappings
  const activeResult = advisoryData && advisoryData.crop_type === cropType ? advisoryData : null
  const hasDiseaseResult = activeResult && activeResult.disease_result

  return (
    <Screen title={t('scanTitle', lang)} subtitle="Agent 1">
      {/* Show loading state */}
      {loading && (
        <div className="glass aspect-[4/3] grid place-items-center relative overflow-hidden my-4">
          <motion.span 
            className="absolute left-0 w-full h-0.5 bg-lime glow-green"
            animate={{ top: ['10%', '90%', '10%'] }} 
            transition={{ repeat: Infinity, duration: 2 }} 
          />
          <div className="text-center">
            <LeafSpinner size={36} />
            <p className="text-sm text-cropbright mt-3 font-medium">
              {lang === 'hi' ? 'कृषि एआई सलाहकारों से जुड़ रहे हैं...' : 'Connecting to KisanMind AI Advisors...'}
            </p>
          </div>
        </div>
      )}

      {/* Input state */}
      {!loading && !activeResult && (
        <form onSubmit={handleScan} className="space-y-4 animate-sprout">
          {/* Photo Uploader / Preview */}
          <div 
            onClick={() => fileInputRef.current.click()}
            className="glass aspect-[4/3] grid place-items-center text-[var(--text-dim)] cursor-pointer hover:border-crop/50 transition relative overflow-hidden"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Crop preview" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="text-center px-6">
                <Sprout className="mx-auto text-crop/50" size={40} />
                <p className="text-sm mt-2 font-medium text-cropbright">
                  {lang === 'hi' ? 'पत्ती की फोटो अपलोड करें (वैकल्पिक)' : 'Upload leaf photo (Optional)'}
                </p>
                <p className="text-xs text-[var(--text-dim)] mt-1">
                  {lang === 'hi' ? 'एआई रोग का पता लगाने में मदद करेगा' : 'AI will detect diseases if uploaded'}
                </p>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="glass p-4 space-y-3">
            {/* Crop Selector */}
            <div>
              <label className="text-xs text-[var(--text-dim)] font-semibold block mb-1">
                {lang === 'hi' ? 'फसल चुनें' : 'Select Crop'}
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {cropsList.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCropType(c.id)}
                    className={`p-2 rounded-xl text-center border transition flex flex-col items-center gap-1 ${
                      cropType === c.id 
                        ? 'bg-crop text-ink border-crop glow-green' 
                        : 'glass border-white/5 text-[var(--text-dim)] text-xs'
                    }`}
                  >
                    <span className="text-lg">{c.icon}</span>
                    <span className="text-[10px] font-semibold truncate w-full">{c.label[lang]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location Input */}
            <div>
              <label className="text-xs text-[var(--text-dim)] font-semibold block mb-1 flex items-center gap-1">
                <MapPin size={12} className="text-cropbright" />
                {lang === 'hi' ? 'स्थान' : 'Location'}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-crop"
                placeholder={lang === 'hi' ? 'जैसे: नासिक, महाराष्ट्र' : 'e.g., Nashik, Maharashtra'}
              />
            </div>

            {/* Query Question Input */}
            <div>
              <label className="text-xs text-[var(--text-dim)] font-semibold block mb-1 flex items-center gap-1">
                <HelpCircle size={12} className="text-cropbright" />
                {lang === 'hi' ? 'एआई से सवाल पूछें (वैकल्पिक)' : 'Ask AI a question (Optional)'}
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-crop resize-none"
                placeholder={
                  lang === 'hi'
                    ? 'जैसे: पत्तियों पर पीले धब्बे आ गए हैं, क्या करें?'
                    : 'e.g., Yellow spots appeared on leaf borders, what should I do?'
                }
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {previewUrl && (
              <button 
                type="button" 
                onClick={reset} 
                className="glass !rounded-2xl px-4 text-sm text-red-400 font-semibold"
              >
                {lang === 'hi' ? 'हटाएं' : 'Clear'}
              </button>
            )}
            <button 
              type="submit" 
              className="tap flex-1 rounded-2xl py-4 font-bold text-ink flex items-center justify-center gap-2 glow-green"
              style={{ background: 'linear-gradient(90deg,#2ECC71,#3DDC84)' }}
            >
              <Camera size={20} /> 
              {selectedFile 
                ? (lang === 'hi' ? 'फसल की जांच करें' : 'Analyze Crop Health') 
                : (lang === 'hi' ? 'सलाह प्राप्त करें' : 'Get AI Advisory')
              }
            </button>
          </div>
        </form>
      )}

      {/* Result state */}
      {!loading && activeResult && (
        <div className="space-y-3 animate-sprout">
          {hasDiseaseResult ? (
            /* Real Disease detection card */
            <div className="glass active p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-[var(--text-dim)]">
                    {activeResult.disease_result.image_analysis_summary || 'Gemini Vision AI Pathogen Scan'}
                  </p>
                  <h3 className="text-xl font-bold mt-1">
                    {activeResult.disease_result.disease_name}
                  </h3>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${sevColor[activeResult.disease_result.severity || 'low']}`}>
                  {t('severity', lang)}: {sevLabel[activeResult.disease_result.severity || 'low'][lang]}
                </span>
              </div>

              {/* Confidence & Affected area */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-[var(--text-dim)] mb-1">
                    {lang === 'hi' ? 'विश्वास स्तर' : 'AI Confidence'}
                  </p>
                  <p className="text-lg font-bold text-lime">
                    {activeResult.disease_result.confidence_score}%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <RadialGauge 
                    value={activeResult.disease_result.affected_area_percent} 
                    severity={activeResult.disease_result.severity || 'low'} 
                  />
                </div>
              </div>

              <p className="text-sm text-[var(--text-dim)]">
                {activeResult.disease_result.image_analysis_summary}
              </p>
              <div className="mt-3">
                <SpeakButton text={`${activeResult.disease_result.disease_name}, ${lang === 'hi' ? 'तीव्रता' : 'severity'} ${activeResult.disease_result.severity}. Treatment: ${activeResult.disease_result.treatment}`} />
              </div>
            </div>
          ) : (
            /* General Advisory fallback when no image was uploaded */
            <div className="glass active p-4 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-crop/15 text-cropbright flex items-center justify-center text-xl mx-auto">
                📝
              </div>
              <h3 className="font-bold text-lg">
                {lang === 'hi' ? 'सामान्य कृषि सलाह तैयार' : 'AI Advisory Prepared'}
              </h3>
              <p className="text-sm text-[var(--text-dim)]">
                {lang === 'hi' 
                  ? `कोई फोटो अपलोड नहीं की गई, लेकिन ${cropType} फसल के लिए मौसम, मंडी और योजनाओं की सलाह तैयार है।` 
                  : `No leaf photo uploaded, but Weather, Market, and Schemes advice for ${cropType} has been calculated.`
                }
              </p>
            </div>
          )}

          {/* Quick links to see detailed tabs */}
          {hasDiseaseResult && activeResult.disease_result.treatment && (
            <div className="glass p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{t('treatment', lang)}</h4>
                <SpeakButton text={activeResult.disease_result.treatment} label="" />
              </div>
              <Row icon={FlaskConical} label={activeResult.disease_result.treatment} sub={lang === 'hi' ? 'उपचार विधि' : 'Treatment & Pesticide'} />
            </div>
          )}

          {/* Show full report action */}
          <div className="glass p-4 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm">{lang === 'hi' ? 'विस्तृत रिपोर्ट तैयार' : 'Full Advisory Report'}</h4>
              <p className="text-xs text-[var(--text-dim)] mt-0.5">
                {lang === 'hi' ? 'सभी ५ सलाहकारों की संयुक्त समीक्षा' : 'Aggregated response from all agents'}
              </p>
            </div>
            <button 
              onClick={() => setReportOpen(true)}
              className="tap bg-crop text-ink px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 glow-green"
            >
              <FileText size={14} /> {lang === 'hi' ? 'रिपोर्ट देखें' : 'View Report'}
            </button>
          </div>

          <button 
            onClick={() => setReportOpen(true)}
            className="tap w-full glass !rounded-2xl py-3 font-semibold flex items-center justify-center gap-2 text-cropbright"
          >
            <MessageCircle size={18} /> {t('askFollowup', lang)}
          </button>
          
          <button 
            onClick={reset} 
            className="tap w-full text-sm text-[var(--text-dim)] py-2"
          >
            ↺ {lang === 'hi' ? 'फिर से स्कैन करें' : 'Scan / Ask Again'}
          </button>
        </div>
      )}
    </Screen>
  )
}

function Row({ icon: Icon, label, sub }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
      <span className="grid place-items-center w-9 h-9 rounded-lg bg-crop/10 text-cropbright shrink-0">
        <Icon size={18} />
      </span>
      <div>
        <p className="text-xs text-[var(--text-dim)]">{sub}</p>
        <p className="text-sm font-medium">{label}</p>
      </div>
    </div>
  )
}
