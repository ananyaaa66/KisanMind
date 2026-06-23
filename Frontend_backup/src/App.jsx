import { useState } from 'react'
import { Routes, Route, useNavigate, NavLink } from 'react-router-dom'
import { Leaf, Home as HomeIcon, ScanLine, TrendingUp, FileBadge, CloudSun, User, FileText, Settings as SettingsIcon } from 'lucide-react'
import LanguageToggle from './components/LanguageToggle.jsx'
import BottomNav from './components/BottomNav.jsx'
import MicButton from './components/MicButton.jsx'
import VoiceOverlay from './components/VoiceOverlay.jsx'
import ReportModal from './components/ReportModal.jsx'
import { useApp } from './context/AppContext.jsx'
import { t, STR } from './data/i18n.js'

import Home from './screens/Home.jsx'
import DiseaseScan from './screens/DiseaseScan.jsx'
import MandiPrices from './screens/MandiPrices.jsx'
import Schemes from './screens/Schemes.jsx'
import Weather from './screens/Weather.jsx'
import AdvisoryReports from './screens/AdvisoryReports.jsx'
import FarmerProfile from './screens/FarmerProfile.jsx'
import Settings from './screens/Settings.jsx'

const items = [
  { to: '/', icon: HomeIcon, key: 'home', end: true },
  { to: '/scan', icon: ScanLine, key: 'disease' },
  { to: '/prices', icon: TrendingUp, key: 'prices' },
  { to: '/schemes', icon: FileBadge, key: 'schemes' },
  { to: '/weather', icon: CloudSun, key: 'weather' },
]

const userItems = [
  { to: '/profile', icon: User, label: { en: 'My Profile', hi: 'मेरा प्रोफाइल' } },
  { to: '/reports', icon: FileText, label: { en: 'Reports', hi: 'रिपोर्ट' } },
  { to: '/settings', icon: SettingsIcon, label: { en: 'Settings', hi: 'सेटिंग्स' } },
]

export default function App() {
  const { lang, profile } = useApp()
  const navigate = useNavigate()
  const [showBottomNav, setShowBottomNav] = useState(true)

  const handleBackFromModal = () => {
    setShowBottomNav(true)
    navigate('/')
  }

  const farmerName = profile?.name || (lang === 'hi' ? 'किसान' : 'Farmer')

  return (
    <div className="app-shell min-h-screen flex flex-col lg:flex-row lg:bg-ink">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-card-border bg-panel/30 backdrop-blur-md p-6 h-screen sticky top-0 shrink-0">
        <div className="flex items-center gap-2.5 mb-8">
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-crop/15 text-cropbright glow-green">
            <Leaf size={22} />
          </span>
          <div>
            <p className="font-extrabold text-lg leading-none tracking-tight">{t('appName', lang)}</p>
            <p className="text-[11px] text-[var(--text-dim)] mt-0.5">{t('tagline', lang)}</p>
          </div>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col gap-1.5">
          {items.map(({ to, icon: Icon, key, end }) => (
            <NavLink
              key={key} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-crop/15 text-cropbright border border-crop/30 glow-green font-semibold' 
                    : 'text-[var(--text-dim)] hover:bg-white/5 hover:text-[#e6f2ea] border border-transparent'
                }`
              }
            >
              <Icon size={18} />
              <span className="text-sm">{STR.nav[key][lang]}</span>
            </NavLink>
          ))}
          
          <div className="h-px bg-white/10 my-4" />
          
          {userItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-crop/15 text-cropbright border border-crop/30 glow-green font-semibold' 
                    : 'text-[var(--text-dim)] hover:bg-white/5 hover:text-[#e6f2ea] border border-transparent'
                }`
              }
            >
              <Icon size={18} />
              <span className="text-sm">{label[lang]}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime to-crop flex items-center justify-center text-sm">🌾</div>
            <span className="text-sm font-semibold text-white truncate max-w-[120px]" title={farmerName}>
              {farmerName}
            </span>
          </div>
          <LanguageToggle />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header (Hidden on lg) */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-ink/70 backdrop-blur-md border-b border-card-border/30">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-crop/15 text-cropbright glow-green">
              <Leaf size={20} />
            </span>
            <div>
              <p className="font-extrabold leading-none tracking-tight">{t('appName', lang)}</p>
              <p className="text-[10px] text-[var(--text-dim)] mt-0.5">{t('tagline', lang)}</p>
            </div>
          </div>
          <LanguageToggle />
        </header>

        {/* Routes Container */}
        <main className="flex-1 w-full max-w-5xl mx-auto lg:px-8 lg:py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/scan" element={<DiseaseScan />} />
            <Route path="/prices" element={<MandiPrices />} />
            <Route path="/schemes" element={<Schemes />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/reports" element={<AdvisoryReports onBack={handleBackFromModal} />} />
            <Route path="/profile" element={<FarmerProfile onBack={handleBackFromModal} />} />
            <Route path="/settings" element={<Settings onBack={handleBackFromModal} />} />
          </Routes>
        </main>
      </div>

      <MicButton />
      <div className="lg:hidden">
        {showBottomNav && <BottomNav />}
      </div>
      <VoiceOverlay />
      <ReportModal />
    </div>
  )
}
