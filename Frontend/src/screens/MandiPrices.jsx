import { useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { MapPin, Navigation, TrendingUp, Clock, AlertCircle, TrendingDown, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import { t } from '../data/i18n.js'
import Screen from '../components/Screen.jsx'
import { crops, priceData, mandis, mandiPriceTrends } from '../data/mockData.js'

export default function MandiPrices() {
  const { lang, advisoryData } = useApp()
  const [crop, setCrop] = useState('tomato')

  // Check if we have live data in context for the currently selected crop
  const hasLiveData = advisoryData && advisoryData.crop_type === crop && advisoryData.market_result
  const liveMarket = hasLiveData ? advisoryData.market_result : null

  // Resolve current price, trend and recommendation
  const currentPrice = liveMarket 
    ? liveMarket.current_price_per_quintal 
    : priceData[crop].current

  const priceTrend = liveMarket
    ? (liveMarket.price_trend === 'up' ? 'upward' : liveMarket.price_trend === 'down' ? 'downward' : 'stable')
    : (mandiPriceTrends[crop]?.trend || 'stable')

  const isSell = liveMarket
    ? (liveMarket.recommendation === 'sell_now' || liveMarket.recommendation === 'sell')
    : priceData[crop].action.type === 'sell'

  const actionReason = liveMarket
    ? (lang === 'hi' ? `एआई सिफारिश: ${liveMarket.best_mandi} में सर्वाधिक भाव।` : `AI Recommendation: Best returns found at ${liveMarket.best_mandi}.`)
    : priceData[crop].action.reason[lang]

  // Nearby mandis list
  const list = mandis[crop] || mandis.tomato
  const displayMandis = [...list]
  if (liveMarket && liveMarket.best_mandi) {
    // Check if best_mandi is already in list; if not, prepend it
    const exists = displayMandis.some(m => m.name.en.toLowerCase().includes(liveMarket.best_mandi.toLowerCase()))
    if (!exists) {
      displayMandis.unshift({
        name: { en: liveMarket.best_mandi, hi: `${liveMarket.best_mandi} (एआई अनुशंसित)` },
        price: liveMarket.current_price_per_quintal,
        dist: 5
      })
    }
  }

  // Price history chart data
  const chartData = priceData[crop].trend

  return (
    <Screen title={t('pricesTitle', lang)} subtitle="Agent 2">
      {/* Crop selector pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {crops.map((c) => (
          <button key={c.id} onClick={() => setCrop(c.id)}
            className={`tap !min-h-0 shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition flex items-center gap-1.5 ${
              crop === c.id ? 'bg-crop text-ink border-crop glow-green' : 'glass text-[var(--text-dim)]'}`}>
            <span>{c.icon}</span> {c.label[lang]}
          </button>
        ))}
      </div>

      {/* Big glowing price */}
      <div className="glass active p-5 mt-3 text-center relative overflow-hidden">
        {liveMarket && (
          <div className="absolute top-2 right-2 text-lime flex items-center gap-1 bg-lime/10 px-2 py-0.5 rounded-full text-[10px] font-bold border border-lime/30">
            <Sparkles size={10} /> {lang === 'hi' ? 'लाइव डेटा' : 'Live AI Agent'}
          </div>
        )}
        <p className="text-sm text-[var(--text-dim)]">{crops.find((c) => c.id === crop).label[lang]} · {t('perQuintal', lang)}</p>
        <p className="num text-5xl font-extrabold text-cropbright mt-1" style={{ textShadow: '0 0 24px rgba(46,204,113,0.5)' }}>
          ₹{currentPrice.toLocaleString('en-IN')}
        </p>
        
        <div className="flex justify-center gap-2 mt-3">
          <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold ${
            isSell ? 'bg-crop text-ink' : 'bg-lime/15 text-lime border border-lime/40'}`}>
            {isSell ? <><TrendingUp size={15} /> {t('sellNow', lang)}</> : <><Clock size={15} /> {t('wait', lang)} {liveMarket?.predicted_price_7d ? '7' : priceData[crop].action.days} {t('days', lang)}</>}
          </span>
        </div>
        <p className="text-xs text-[var(--text-dim)] mt-2">{actionReason}</p>
      </div>

      {/* ML Forecast Indicator */}
      {liveMarket && liveMarket.predicted_price_7d && (
        <div className="glass p-4 mt-3 bg-gradient-to-r from-crop/10 to-lime/10 border border-crop/30 animate-pulse-slow">
          <div className="flex items-center gap-2 text-cropbright font-bold text-sm mb-1.5">
            <Sparkles size={16} />
            <h4>{lang === 'hi' ? '7-दिवसीय एआई भाव भविष्यवाणी' : '7-Day AI Price Forecast'}</h4>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="num text-2xl font-bold text-lime">₹{Math.round(liveMarket.predicted_price_7d).toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-[var(--text-dim)] mt-0.5">
                {lang === 'hi' ? 'कैटबूस्ट टाइम-सीरीज मॉडल द्वारा संचालित' : 'Powered by CatBoost Regressor'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-cropbright">{liveMarket.prediction_confidence}% {lang === 'hi' ? 'सटीकता' : 'Confidence'}</p>
              <p className="text-[10px] text-[var(--text-dim)]">{lang === 'hi' ? 'सटीकता सूचकांक' : 'Reliability Index'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Market trends & recommendations */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-3"
        >
          <p className="text-xs text-[var(--text-dim)] mb-1">{lang === 'hi' ? 'रुझान प्रकार' : 'Weekly Trend'}</p>
          <p className="text-lg font-bold text-lime">₹{Math.round(currentPrice * 0.98)}</p>
          <p className={`text-xs mt-1 font-semibold ${priceTrend === 'upward' ? 'text-green-400' : 'text-red-400'}`}>
            {priceTrend === 'upward' ? '+4.8%' : '-1.5%'}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass p-3"
        >
          <p className="text-xs text-[var(--text-dim)] mb-1">{lang === 'hi' ? 'बाजार स्थिति' : 'Market Status'}</p>
          <div className="flex items-center gap-1">
            {priceTrend === 'upward' ? (
              <TrendingUp size={18} className="text-green-400" />
            ) : (
              <TrendingDown size={18} className="text-red-400" />
            )}
            <p className="text-sm font-semibold capitalize">{priceTrend}</p>
          </div>
        </motion.div>
      </div>

      {/* 30-day chart */}
      <div className="glass p-3 mt-3">
        <p className="text-xs text-[var(--text-dim)] mb-2 px-1">{lang === 'hi' ? '30-दिन भाव रुझान' : '30-day price trend'}</p>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#5e7066', fontSize: 10 }} tickLine={false} axisLine={false} interval={6} />
              <YAxis tick={{ fill: '#5e7066', fontSize: 10 }} tickLine={false} axisLine={false} domain={['dataMin - 100', 'dataMax + 100']} />
              <Tooltip contentStyle={{ background: '#0D1410', border: '1px solid rgba(46,204,113,0.4)', borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: '#A8FF60' }} formatter={(v) => [`₹${v}`, 'Price']} />
              <Line type="monotone" dataKey="price" stroke="#A8FF60" strokeWidth={2.5} dot={false}
                style={{ filter: 'drop-shadow(0 0 5px rgba(168,255,96,0.6))' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Nearby mandis */}
      <div className="mt-3">
        <p className="text-sm font-semibold mb-2">{t('nearbyMandi', lang)}</p>
        <div className="space-y-2">
          {displayMandis.sort((a, b) => b.price - a.price).map((m, i) => (
            <div key={i} className="glass p-3 flex items-center gap-3">
              <span className="grid place-items-center w-9 h-9 rounded-lg bg-crop/10 text-cropbright shrink-0"><MapPin size={18} /></span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{m.name[lang] || m.name.en}</p>
                <p className="text-xs text-[var(--text-dim)]">{m.dist} km · ₹{m.price.toLocaleString('en-IN')}/qtl</p>
              </div>
              <button className="tap !min-h-0 px-3 py-2 rounded-lg text-xs font-semibold text-cropbright border border-crop/30 flex items-center gap-1.5">
                <Navigation size={14} /> {t('directions', lang)}
              </button>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  )
}
