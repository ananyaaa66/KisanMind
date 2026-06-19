import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import LanguageToggle from './components/LanguageToggle.jsx'
import BottomNav from './components/BottomNav.jsx'
import MicButton from './components/MicButton.jsx'
import VoiceOverlay from './components/VoiceOverlay.jsx'
import ReportModal from './components/ReportModal.jsx'
import { useApp } from './context/AppContext.jsx'
import { t } from './data/i18n.js'

import Home from './screens/Home.jsx'
import DiseaseScan from './screens/DiseaseScan.jsx'
import MandiPrices from './screens/MandiPrices.jsx'
import Schemes from './screens/Schemes.jsx'
import Weather from './screens/Weather.jsx'
import AdvisoryReports from './screens/AdvisoryReports.jsx'
import FarmerProfile from './screens/FarmerProfile.jsx'
import Settings from './screens/Settings.jsx'

export default function App() {
  const { lang } = useApp()
  const navigate = useNavigate()
  const [showBottomNav, setShowBottomNav] = useState(true)

  const handleBackFromModal = () => {
    setShowBottomNav(true)
    navigate('/')
  }

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-ink/70 backdrop-blur-md">
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

      <main>
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

      <MicButton />
      {showBottomNav && <BottomNav />}
      <VoiceOverlay />
      <ReportModal />
    </div>
  )
}
