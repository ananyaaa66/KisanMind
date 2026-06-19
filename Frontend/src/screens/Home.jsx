import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CloudRain, ScanLine, TrendingUp, FileBadge, CloudSun, FileText, ChevronRight, User, Settings, FileCheck, Activity } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { t } from '../data/i18n.js'
import GrowthLine from '../components/GrowthLine.jsx'
import SpeakButton from '../components/SpeakButton.jsx'
import { farmer, weatherSnapshot, todayAdvisory, cropHealthScore } from '../data/mockData.js'

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

  const userMenuItems = [
    { to: '/profile', icon: User, label: { en: 'My Profile', hi: 'मेरा प्रोफाइल' } },
    { to: '/reports', icon: FileCheck, label: { en: 'Reports', hi: 'रिपोर्ट' } },
    { to: '/settings', icon: Settings, label: { en: 'Settings', hi: 'सेटिंग्स' } },
  ]

  // Resolve dynamic weather
  const currentTemp = advisoryData?.weather_result?.today
    ? Math.round(advisoryData.weather_result.today.temp_max_c)
    : weatherSnapshot.temp

  const currentRain = advisoryData?.weather_result?.today
    ? advisoryData.weather_result.today.rain_probability_percent
    : weatherSnapshot.rainChance

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
    : todayAdvisory

  const handleViewHistoryReport = (r) => {
    setAdvisoryData({
      final_report: r.reportText,
      session_id: r.id,
      crop_type: r.crop,
      location: r.location
    })
    setReportOpen(true)
  }

  // Display only top 3 reports on home page
  const displayReports = reportsHistory.length > 0
    ? reportsHistory.slice(0, 3)
    : [
        { id: 'r1', title: { en: 'Tomato leaf diagnosis', hi: 'टमाटर पत्ती निदान' }, date: '12 Jun 2024', reportText: '', crop: 'tomato' },
        { id: 'r2', title: { en: 'Onion mandi price plan', hi: 'प्याज़ मंडी भाव योजना' }, date: '09 Jun 2024', reportText: '', crop: 'onion' },
        { id: 'r3', title: { en: 'PM-KISAN eligibility', hi: 'पीएम-किसान पात्रता' }, date: '04 Jun 2024', reportText: '', crop: 'wheat' }
      ]

  return (
    <div className="px-4 pt-4 pb-32 space-y-4 animate-sprout">
      {/* Greeting card with user menu */}
      <div className="glass p-4 relative overflow-hidden">
        <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-crop to-lime" />
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className="text-[var(--text-dim)] text-sm">{t('greeting', lang)} 🙏</p>
            <h2 className="text-2xl font-bold mt-0.5">{farmer.name[lang]}</h2>
            <p className="text-sm text-[var(--text-dim)] mt-1">{farmer.location[lang]} · {today}</p>
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

      {/* Crop health + Weather strip */}
      <div className="grid grid-cols-2 gap-3">
        {/* Crop health card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity size={18} className="text-lime" />
            <span className="text-xs text-[var(--text-dim)]">{t('cropHealth', lang)}</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="num text-2xl font-bold">{cropHealthScore.overall}%</p>
              <p className="text-xs text-[var(--text-dim)] mt-0.5">{cropHealthScore.foliage === 'good' ? '✓ Good' : '⚠ Fair'}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-lime/20 flex items-center justify-center text-sm">
              🌱
            </div>
          </div>
        </motion.div>

        {/* Weather snapshot strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass p-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CloudRain className="text-lime" size={20} />
            <div>
              <p className="num text-lg font-bold">{currentTemp}°C</p>
              <p className="text-xs text-[var(--text-dim)]">{currentRain}% {lang === 'hi' ? 'वर्षा की संभावना' : 'Rain chance'}</p>
            </div>
          </div>
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

      {/* Recent reports */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold">{t('recentReports', lang)}</p>
        </div>
        <div className="space-y-2">
          {displayReports.map((r) => (
            <button 
              key={r.id} 
              onClick={() => r.reportText ? handleViewHistoryReport(r) : setReportOpen(true)}
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
      </div>
    </div>
  )
}
