import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Phone, Mail, MapPin, Save, Edit3 } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { t } from '../data/i18n.js'
import SpeakButton from '../components/SpeakButton.jsx'
import DataCard from '../components/DataCard.jsx'
import InfoSection from '../components/InfoSection.jsx'

const defaultProfile = {
  name: '',
  phone: '',
  email: '',
  location: '',
  totalLand: 2.5,
  crops: [
    { name: 'tomato', area: 1.0, soilType: 'Black soil' },
    { name: 'onion', area: 1.5, soilType: 'Loamy soil' },
  ],
}

function loadProfile() {
  try {
    const saved = localStorage.getItem('kisanmind_profile')
    return saved ? JSON.parse(saved) : defaultProfile
  } catch {
    return defaultProfile
  }
}

function saveProfile(profile) {
  localStorage.setItem('kisanmind_profile', JSON.stringify(profile))
  // Also save name/location for Home screen
  if (profile.name) localStorage.setItem('kisanmind_farmer_name', profile.name)
  if (profile.location) localStorage.setItem('kisanmind_farmer_location', profile.location)
}

export default function FarmerProfile({ onBack }) {
  const { lang, reportsHistory } = useApp()
  const [profile, setProfile] = useState(loadProfile)
  const [editing, setEditing] = useState(!profile.name)

  useEffect(() => {
    saveProfile(profile)
  }, [profile])

  const updateField = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const totalReports = reportsHistory?.length || 0

  return (
    <div className="px-4 pt-4 pb-32 space-y-4 animate-sprout">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="text-sm">{t('back', lang)}</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing(!editing)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            {editing ? <Save size={18} className="text-lime" /> : <Edit3 size={18} className="text-cropbright" />}
          </button>
          <SpeakButton text={profile.name || 'Farmer'} />
        </div>
      </div>

      {/* Profile header */}
      <div className="glass p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-lime to-crop mx-auto mb-4 flex items-center justify-center text-3xl">
          🌾
        </div>
        {editing ? (
          <input
            type="text"
            value={profile.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder={lang === 'hi' ? 'अपना नाम दर्ज करें' : 'Enter your name'}
            className="w-full text-center text-2xl font-bold bg-transparent border-b border-crop/40 focus:outline-none focus:border-crop pb-1"
          />
        ) : (
          <h1 className="text-2xl font-bold">{profile.name || (lang === 'hi' ? 'अपना नाम सेट करें' : 'Set your name')}</h1>
        )}
      </div>

      {/* Contact info */}
      <InfoSection title={lang === 'hi' ? 'संपर्क' : 'Contact'} icon="📱">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-lime shrink-0" />
            {editing ? (
              <input type="tel" value={profile.phone} onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-crop" />
            ) : (
              <span className="text-sm text-gray-300">{profile.phone || '—'}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-lime shrink-0" />
            {editing ? (
              <input type="email" value={profile.email} onChange={(e) => updateField('email', e.target.value)}
                placeholder="name@email.com"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-crop" />
            ) : (
              <span className="text-sm text-gray-300">{profile.email || '—'}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-lime shrink-0" />
            {editing ? (
              <input type="text" value={profile.location} onChange={(e) => updateField('location', e.target.value)}
                placeholder={lang === 'hi' ? 'जैसे: दिल्ली' : 'e.g., Delhi'}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-crop" />
            ) : (
              <span className="text-sm text-gray-300">{profile.location || '—'}</span>
            )}
          </div>
        </div>
      </InfoSection>

      {/* Farm details */}
      <InfoSection title={lang === 'hi' ? 'खेत का विवरण' : 'Farm Details'} icon="🚜">
        <div className="space-y-3">
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">{lang === 'hi' ? 'कुल भूमि' : 'Total Land'}</p>
            {editing ? (
              <input type="number" value={profile.totalLand} onChange={(e) => updateField('totalLand', parseFloat(e.target.value) || 0)}
                step="0.5" min="0"
                className="text-lg font-bold text-lime bg-transparent border-b border-crop/40 text-center w-20 focus:outline-none" />
            ) : (
              <p className="text-lg font-bold text-lime">{profile.totalLand} {lang === 'hi' ? 'हेक्टेयर' : 'hectares'}</p>
            )}
          </div>

          <div className="border-t border-white/10 pt-3">
            {profile.crops.map((crop, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="mb-3 last:mb-0"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-white capitalize">{crop.name}</p>
                  <span className="text-xs text-gray-400">{crop.area} {lang === 'hi' ? 'हेक्टेयर' : 'ha'}</span>
                </div>
                <p className="text-xs text-gray-400">
                  {lang === 'hi' ? 'मिट्टी' : 'Soil'}: {crop.soilType}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </InfoSection>

      {/* Stats from real data */}
      <div className="grid grid-cols-3 gap-2">
        <DataCard subtitle={lang === 'hi' ? 'रिपोर्ट' : 'Reports'} value={totalReports} icon="📋" />
        <DataCard subtitle={lang === 'hi' ? 'फ़सलें' : 'Crops'} value={profile.crops.length} icon="🌱" />
        <DataCard subtitle={lang === 'hi' ? 'भूमि' : 'Land'} value={`${profile.totalLand}ha`} icon="🚜" />
      </div>

      {editing && (
        <button
          onClick={() => setEditing(false)}
          className="tap w-full bg-crop text-ink rounded-xl font-semibold py-3 flex items-center justify-center gap-2 glow-green"
        >
          <Save size={18} /> {lang === 'hi' ? 'प्रोफ़ाइल सहेजें' : 'Save Profile'}
        </button>
      )}
    </div>
  )
}
