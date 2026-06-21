import { useState, useEffect } from 'react'
import { MapPin, TrendingUp, TrendingDown, Sparkles, Loader2, WifiOff, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import { t } from '../data/i18n.js'
import Screen from '../components/Screen.jsx'
import { fetchPrediction } from '../utils/api.js'
import { crops, indianStates, datasetStates, getDistrictsForState, lastKnownPrices } from '../data/mockData.js'

export default function MandiPrices() {
  const { lang, advisoryData } = useApp()
  const [crop, setCrop] = useState('wheat')
  const [selectedState, setSelectedState] = useState('Uttar Pradesh')
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch ML prediction when crop or state changes
  useEffect(() => {
    let cancelled = false
    async function loadPrediction() {
      setLoading(true)
      setError(null)
      try {
        const month = new Date().getMonth() + 1
        const lastPrice = lastKnownPrices[crop] || 2500
        const data = await fetchPrediction(crop, selectedState, month, lastPrice)
        if (!cancelled) setPrediction(data.prediction)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadPrediction()
    return () => { cancelled = true }
  }, [crop, selectedState])

  // Check for live advisory pipeline data
  const hasLiveData = advisoryData && advisoryData.crop_type === crop && advisoryData.market_result
  const liveMarket = hasLiveData ? advisoryData.market_result : null

  const currentPrice = liveMarket
    ? liveMarket.current_price_per_quintal
    : lastKnownPrices[crop] || 2500

  const predictedPrice = prediction?.predicted_price || null
  const confidence = prediction?.confidence || null

  const priceTrend = predictedPrice && currentPrice
    ? (predictedPrice > currentPrice * 1.02 ? 'upward' : predictedPrice < currentPrice * 0.98 ? 'downward' : 'stable')
    : 'stable'

  const trendPercent = predictedPrice && currentPrice
    ? (((predictedPrice - currentPrice) / currentPrice) * 100).toFixed(1)
    : '0.0'

  const isSell = priceTrend === 'downward' || (liveMarket && (liveMarket.recommendation === 'sell_now' || liveMarket.recommendation === 'sell'))

  const actionReason = liveMarket
    ? (lang === 'hi' ? `एआई सिफारिश: ${liveMarket.best_mandi} में सर्वाधिक भाव।` : `AI Recommendation: Best returns at ${liveMarket.best_mandi}.`)
    : predictedPrice
      ? (lang === 'hi'
        ? `XGBoost मॉडल: 7 दिन में ₹${Math.round(predictedPrice)} अनुमानित। ${Number(trendPercent) > 0 ? 'बढ़त' : 'गिरावट'} का रुझान।`
        : `XGBoost Model: ₹${Math.round(predictedPrice)} predicted in 7 days. ${Number(trendPercent) > 0 ? 'Upward' : 'Downward'} trend.`)
      : ''

  const hasDataset = datasetStates.includes(selectedState)
  const cropInfo = crops.find((c) => c.id === crop)

  return (
    <Screen title={t('pricesTitle', lang)} subtitle="Agent 2">
      {/* State selector */}
      <div className="glass p-3 mb-3">
        <label className="text-xs text-[var(--text-dim)] mb-1 block">{lang === 'hi' ? 'राज्य चुनें' : 'Select State'}</label>
        <div className="relative">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="tap w-full bg-panel border border-crop/20 rounded-xl px-3 py-2 text-sm focus:border-crop outline-none appearance-none pr-8"
          >
            {/* Dataset states first */}
            <optgroup label={lang === 'hi' ? '📊 डेटा उपलब्ध' : '📊 Data Available'}>
              {datasetStates.map((s) => <option key={s} className="bg-panel">{s}</option>)}
            </optgroup>
            <optgroup label={lang === 'hi' ? '🌤️ केवल मौसम' : '🌤️ Weather Only'}>
              {indianStates.filter((s) => !datasetStates.includes(s)).map((s) => (
                <option key={s} className="bg-panel">{s}</option>
              ))}
            </optgroup>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] pointer-events-none" />
        </div>
        {!hasDataset && (
          <p className="text-[10px] text-yellow-400 mt-1">
            {lang === 'hi' ? '⚠️ इस राज्य के लिए डेटासेट में भाव उपलब्ध नहीं है' : '⚠️ No price data in dataset for this state'}
          </p>
        )}
      </div>

      {/* Crop selector pills — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {crops.map((c) => (
          <button key={c.id} onClick={() => setCrop(c.id)}
            className={`tap !min-h-0 shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition flex items-center gap-1.5 ${
              crop === c.id ? 'bg-crop text-ink border-crop glow-green' : 'glass text-[var(--text-dim)]'}`}>
            <span>{c.icon}</span> {c.label[lang]}
          </button>
        ))}
      </div>

      {/* Big price display */}
      <div className="glass active p-5 mt-3 text-center relative overflow-hidden">
        {liveMarket && (
          <div className="absolute top-2 right-2 text-lime flex items-center gap-1 bg-lime/10 px-2 py-0.5 rounded-full text-[10px] font-bold border border-lime/30">
            <Sparkles size={10} /> {lang === 'hi' ? 'लाइव डेटा' : 'Live AI Agent'}
          </div>
        )}
        <p className="text-sm text-[var(--text-dim)]">{cropInfo?.label[lang] || crop} · {t('perQuintal', lang)}</p>
        <p className="num text-5xl font-extrabold text-cropbright mt-1" style={{ textShadow: '0 0 24px rgba(46,204,113,0.5)' }}>
          ₹{currentPrice.toLocaleString('en-IN')}
        </p>
        
        <div className="flex justify-center gap-2 mt-3">
          <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold ${
            isSell ? 'bg-crop text-ink' : 'bg-lime/15 text-lime border border-lime/40'}`}>
            {isSell
              ? <><TrendingUp size={15} /> {t('sellNow', lang)}</>
              : <><TrendingUp size={15} /> {t('wait', lang)} 7 {t('days', lang)}</>
            }
          </span>
        </div>
        {actionReason && <p className="text-xs text-[var(--text-dim)] mt-2">{actionReason}</p>}
      </div>

      {/* ML Prediction card */}
      {loading && (
        <div className="glass p-4 mt-3 flex items-center justify-center gap-3">
          <Loader2 size={18} className="animate-spin text-lime" />
          <p className="text-sm text-[var(--text-dim)]">{lang === 'hi' ? 'XGBoost मॉडल से भविष्यवाणी...' : 'Getting XGBoost prediction...'}</p>
        </div>
      )}

      {error && !loading && (
        <div className="glass p-4 mt-3 flex items-center justify-center gap-3">
          <WifiOff size={18} className="text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {predictedPrice && !loading && (
        <div className="glass p-4 mt-3 bg-gradient-to-r from-crop/10 to-lime/10 border border-crop/30">
          <div className="flex items-center gap-2 text-cropbright font-bold text-sm mb-1.5">
            <Sparkles size={16} />
            <h4>{lang === 'hi' ? '7-दिवसीय XGBoost भाव भविष्यवाणी' : '7-Day XGBoost Price Forecast'}</h4>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="num text-2xl font-bold text-lime">₹{Math.round(predictedPrice).toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-[var(--text-dim)] mt-0.5">
                {lang === 'hi' ? 'XGBoost रिग्रेसर द्वारा संचालित' : 'Powered by XGBoost Regressor'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-cropbright">{confidence}% {lang === 'hi' ? 'सटीकता' : 'Confidence'}</p>
              <p className={`text-sm font-bold mt-1 ${Number(trendPercent) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {Number(trendPercent) >= 0 ? '+' : ''}{trendPercent}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Market trend cards */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-3">
          <p className="text-xs text-[var(--text-dim)] mb-1">{lang === 'hi' ? 'अनुमानित भाव' : 'Predicted Price'}</p>
          <p className="text-lg font-bold text-lime">
            {predictedPrice ? `₹${Math.round(predictedPrice).toLocaleString('en-IN')}` : '—'}
          </p>
          <p className={`text-xs mt-1 font-semibold ${Number(trendPercent) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {predictedPrice ? `${Number(trendPercent) >= 0 ? '+' : ''}${trendPercent}%` : '—'}
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass p-3">
          <p className="text-xs text-[var(--text-dim)] mb-1">{lang === 'hi' ? 'बाजार स्थिति' : 'Market Status'}</p>
          <div className="flex items-center gap-1">
            {priceTrend === 'upward' || priceTrend === 'stable' ? (
              <TrendingUp size={18} className="text-green-400" />
            ) : (
              <TrendingDown size={18} className="text-red-400" />
            )}
            <p className="text-sm font-semibold capitalize">{priceTrend}</p>
          </div>
          <p className="text-[10px] text-[var(--text-dim)] mt-1">
            {prediction?.model_type || 'XGBoost'}
          </p>
        </motion.div>
      </div>

      {/* Live mandi info from advisory pipeline if available */}
      {liveMarket && liveMarket.best_mandi && (
        <div className="mt-3">
          <p className="text-sm font-semibold mb-2">{t('nearbyMandi', lang)}</p>
          <div className="glass p-3 flex items-center gap-3">
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-crop/10 text-cropbright shrink-0"><MapPin size={18} /></span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{liveMarket.best_mandi}</p>
              <p className="text-xs text-[var(--text-dim)]">₹{liveMarket.current_price_per_quintal?.toLocaleString('en-IN')}/qtl</p>
            </div>
            <span className="text-xs text-lime font-semibold">{lang === 'hi' ? 'एआई अनुशंसित' : 'AI Recommended'}</span>
          </div>
        </div>
      )}
    </Screen>
  )
}
