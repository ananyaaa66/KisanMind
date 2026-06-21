import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CloudRain, ScanLine, TrendingUp, FileBadge, CloudSun, FileText, ChevronRight, User, Settings, FileCheck, Loader2 } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { t } from '../data/i18n.js'
import GrowthLine from '../components/GrowthLine.jsx'
import SpeakButton from '../components/SpeakButton.jsx'
import { fetchWeather } from '../utils/api.js'

const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })

const tiles = [
  { to: '/scan', icon: ScanLine, label: { en: 'Disease Scan', hi: 'रोग जाँच' } },
  { to: '/prices', icon: TrendingUp, label: { en: 'Mandi Prices', hi: 'मंडी भाव' } },
  { to: '/schemes', icon: FileBadge, label: { en: 'Schemes', hi: 'योजनाएँ' } },
  { to: '/weather', icon: CloudSun, label: { en: 'Weather', hi: 'मौसम' } },
]

export default function Home() {
  const { lang, setReportOpen, advisoryData, setAdvisoryData, reportsHistory } = useApp()
  const navigate = useNavigate()

  // Live weather state
  const [liveWeather, setLiveWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function loadWeather() {
      try {
        // Use farmer's saved location instead of hardcoded Delhi
        const savedLoc = localStorage.getItem('kisanmind_farmer_location') || 'Delhi'
        const data = await fetchWeather(savedLoc)
        if (!cancelled) setLiveWeather(data)
      } catch { /* silently fail — show fallback */ }
      finally { if (!cancelled) setWeatherLoading(false) }
    }
    loadWeather()
    return () => { cancelled = true }
  }, [])

  // Farmer name from localStorage or default
  const farmerName = localStorage.getItem('kisanmind_farmer_name') || (lang === 'hi' ? 'किसान' : 'Farmer')
  const farmerLocation = localStorage.getItem('kisanmind_farmer_location') || (lang === 'hi' ? 'दिल्ली' : 'Delhi')

  const userMenuItems = [
    { to: '/profile', icon: User, label: { en: 'My Profile', hi: 'मेरा प्रोफाइल' } },
    { to: '/reports', icon: FileCheck, label: { en: 'Reports', hi: 'रिपोर्ट' } },
    { to: '/settings', icon: Settings, label: { en: 'Settings', hi: 'सेटिंग्स' } },
  ]

  // Resolve dynamic weather from live API
  const currentTemp = liveWeather?.today
    ? Math.round(liveWeather.today.temp_max_c)
    : null

  const currentRain = liveWeather?.today
    ? liveWeather.today.rain_probability_percent
    : null

  // Resolve dynamic advisory
  const activeAdvisory = advisoryData?.final_report
    ? {
        title: { 
          en: `Advisory for ${advisoryData.crop_type || 'Crop'}`, 
          hi: `${advisoryData.crop_type === 'tomato' ? 'टमाटर' : 'फ़सल'} के लिए कृषि सलाह` 
        },
        body: {
          en: advisoryData.final_report.slice(0, 180) + '...',
          hi: advisoryData.final_report.slice(0, 180) + '...'
        }
      }
    : {
        title: { en: 'Run Disease Scan to get AI advisory', hi: 'एआई सलाह पाने के लिए रोग जाँच करें' },
        body: {
          en: 'Tap "Disease Scan" to analyze your crop with our 5-agent AI system — disease detection, market prices, weather, and government schemes.',
          hi: '"रोग जाँच" पर टैप करें — हमारे 5-एजेंट एआई सिस्टम से रोग पहचान, बाज़ार भाव, मौसम और सरकारी योजनाएँ जानें।'
        }
      }

  const handleViewHistoryReport = (r) => {
    setAdvisoryData({
      final_report: r.reportText,
      session_id: r.id,
      crop_type: r.crop,
      location: r.location
    })
    setReportOpen(true)
  }

  // Display only real reports
  const displayReports = reportsHistory.slice(0, 3)

  return (
    <div className="px-4 pt-4 pb-32 space-y-4 animate-sprout">
      {/* Greeting card */}
      <div className="glass p-4 relative overflow-hidden">
        <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-crop to-lime" />
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className="text-[var(--text-dim)] text-sm">{t('greeting', lang)} 🙏</p>
            <h2 className="text-2xl font-bold mt-0.5">{farmerName}</h2>
            <p className="text-sm text-[var(--text-dim)] mt-1">{farmerLocation} · {today}</p>
          </div>
          <div className="flex gap-1">
            {userMenuItems.map(({ to, icon: Icon, label }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                title={label[lang]}
              >
                <Icon size={18} className="text-cropbright" />
              </button>
            ))}
          </div>
        </div>
        <GrowthLine className="mt-3 opacity-70" />
      </div>

      {/* Weather strip — LIVE */}
      <div className="grid grid-cols-1 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass p-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CloudRain className="text-lime" size={20} />
            <div>
              {weatherLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-lime" />
                  <p className="text-xs text-[var(--text-dim)]">{lang === 'hi' ? 'मौसम लोड हो रहा...' : 'Loading weather...'}</p>
                </div>
              ) : currentTemp !== null ? (
                <>
                  <p className="num text-lg font-bold">{currentTemp}°C</p>
                  <p className="text-xs text-[var(--text-dim)]">{currentRain}% {lang === 'hi' ? 'वर्षा' : 'Rain'} · {liveWeather?.today?.description}</p>
                </>
              ) : (
                <p className="text-xs text-[var(--text-dim)]">{lang === 'hi' ? 'मौसम उपलब्ध नहीं' : 'Weather unavailable'}</p>
              )}
            </div>
          </div>
          {liveWeather && (
            <span className="text-[10px] text-lime font-bold bg-lime/10 px-2 py-0.5 rounded-full border border-lime/30">LIVE</span>
          )}
        </motion.div>
      </div>

      {/* Today's advisory hero */}
      <div className="glass active p-4 relative overflow-hidden cursor-pointer" onClick={() => advisoryData && setReportOpen(true)}>
        <span className="absolute left-0 top-0 h-full w-1.5 bg-lime glow-green" />
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-lime font-semibold">{t('todayAdvisory', lang)}</p>
          <SpeakButton text={activeAdvisory.body[lang]} label="" />
        </div>
        <h3 className="font-bold text-lg mt-1.5">{activeAdvisory.title[lang]}</h3>
        <p className="text-sm text-[var(--text-dim)] mt-1">{activeAdvisory.body[lang]}</p>
      </div>

      {/* Quick action tiles */}
      <div>
        <p className="text-sm font-semibold mb-2">{t('quickActions', lang)}</p>
        <div className="grid grid-cols-2 gap-3">
          {tiles.map(({ to, icon: Icon, label }) => (
            <motion.div key={to} whileTap={{ scale: 0.96 }}>
              <Link to={to} className="glass p-4 flex flex-col gap-3 active:border-crop/60 transition">
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-crop/15 text-cropbright">
                  <Icon size={22} />
                </span>
                <span className="font-semibold text-sm">{label[lang]}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent reports — live only */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold">{t('recentReports', lang)}</p>
        </div>
        {displayReports.length > 0 ? (
          <div className="space-y-2">
            {displayReports.map((r) => (
              <button 
                key={r.id} 
                onClick={() => handleViewHistoryReport(r)}
                className="glass w-full p-3 flex items-center gap-3 text-left"
              >
                <FileText size={18} className="text-cropbright shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.title[lang]}</p>
                  <p className="text-xs text-[var(--text-dim)]">{r.date}</p>
                </div>
                <ChevronRight size={18} className="text-[var(--text-dim)]" />
              </button>
            ))}
          </div>
        ) : (
          <div className="glass p-4 text-center text-xs text-[var(--text-dim)]">
            {lang === 'hi' ? 'अभी तक कोई रिपोर्ट नहीं। "रोग जाँच" से शुरू करें।' : 'No reports yet. Start with a Disease Scan to generate your first advisory.'}
          </div>
        )}
      </div>
    </div>
  )
}
