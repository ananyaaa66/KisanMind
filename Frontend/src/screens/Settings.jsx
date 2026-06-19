import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Moon, Volume2, Database, Lock, Globe } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { t } from '../data/i18n.js'
import SpeakButton from '../components/SpeakButton.jsx'
import InfoSection from '../components/InfoSection.jsx'

export default function Settings({ onBack }) {
  const { lang, toggleLang } = useApp()
  const [settings, setSettings] = useState({
    notifications: {
      diseaseAlerts: true,
      weatherWarnings: true,
      priceUpdates: true,
      schemeReminders: true,
    },
    preferences: {
      language: lang,
      temperatureUnit: 'celsius',
      areaUnit: 'hectare',
      currency: 'INR',
    },
    privacy: {
      shareLocationData: true,
      shareYieldData: false,
      sharePhoneWithPartners: false,
    },
  })

  const toggleSetting = (section, key) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: !prev[section][key],
      },
    }))
  }

  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-lime' : 'bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  )

  const SettingRow = ({ label, enabled, onChange, icon }) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0"
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-lg">{icon}</span>}
        <span className="text-sm text-white">{label}</span>
      </div>
      <ToggleSwitch enabled={enabled} onChange={onChange} />
    </motion.div>
  )

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
        <SpeakButton text={lang === 'hi' ? 'सेटिंग्स' : 'Settings'} />
      </div>

      <div className="glass p-4">
        <h1 className="text-2xl font-bold">{lang === 'hi' ? 'सेटिंग्स' : 'Settings'}</h1>
      </div>

      {/* Notifications */}
      <InfoSection title={lang === 'hi' ? 'सूचनाएँ' : 'Notifications'} icon="🔔">
        <SettingRow
          label={lang === 'hi' ? 'रोग सचेतनी' : 'Disease Alerts'}
          enabled={settings.notifications.diseaseAlerts}
          onChange={() => toggleSetting('notifications', 'diseaseAlerts')}
          icon="🦠"
        />
        <SettingRow
          label={lang === 'hi' ? 'मौसम चेतावनी' : 'Weather Warnings'}
          enabled={settings.notifications.weatherWarnings}
          onChange={() => toggleSetting('notifications', 'weatherWarnings')}
          icon="⛈️"
        />
        <SettingRow
          label={lang === 'hi' ? 'भाव अपडेट' : 'Price Updates'}
          enabled={settings.notifications.priceUpdates}
          onChange={() => toggleSetting('notifications', 'priceUpdates')}
          icon="📊"
        />
        <SettingRow
          label={lang === 'hi' ? 'योजना अनुस्मारक' : 'Scheme Reminders'}
          enabled={settings.notifications.schemeReminders}
          onChange={() => toggleSetting('notifications', 'schemeReminders')}
          icon="📜"
        />
      </InfoSection>

      {/* Preferences */}
      <InfoSection title={lang === 'hi' ? 'प्राथमिकताएँ' : 'Preferences'} icon="⚙️">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="py-3 border-b border-white/10"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-lime" />
              <span className="text-sm text-white">{lang === 'hi' ? 'भाषा' : 'Language'}</span>
            </div>
            <span className="text-sm font-semibold text-lime">{lang === 'hi' ? 'हिंदी' : 'English'}</span>
          </div>
          <button
            onClick={toggleLang}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            {lang === 'hi' ? 'English में स्विच करें' : 'हिंदी में स्विच करें'}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="py-3 border-b border-white/10 last:border-b-0"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">{lang === 'hi' ? 'तापमान इकाई' : 'Temperature Unit'}</span>
            <span className="text-sm font-semibold text-white">{settings.preferences.temperatureUnit === 'celsius' ? '°C' : '°F'}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="py-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">{lang === 'hi' ? 'मुद्रा' : 'Currency'}</span>
            <span className="text-sm font-semibold text-white">{settings.preferences.currency}</span>
          </div>
        </motion.div>
      </InfoSection>

      {/* Privacy */}
      <InfoSection title={lang === 'hi' ? 'गोपनीयता' : 'Privacy'} icon="🔒">
        <SettingRow
          label={lang === 'hi' ? 'स्थान डेटा साझा करें' : 'Share Location Data'}
          enabled={settings.privacy.shareLocationData}
          onChange={() => toggleSetting('privacy', 'shareLocationData')}
          icon="📍"
        />
        <SettingRow
          label={lang === 'hi' ? 'उपज डेटा साझा करें' : 'Share Yield Data'}
          enabled={settings.privacy.shareYieldData}
          onChange={() => toggleSetting('privacy', 'shareYieldData')}
          icon="📈"
        />
        <SettingRow
          label={lang === 'hi' ? 'फोन साझा करें' : 'Share Phone Number'}
          enabled={settings.privacy.sharePhoneWithPartners}
          onChange={() => toggleSetting('privacy', 'sharePhoneWithPartners')}
          icon="📱"
        />
      </InfoSection>

      {/* Data Management */}
      <InfoSection title={lang === 'hi' ? 'डेटा' : 'Data'} icon="💾">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <button className="w-full py-2 px-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-xs font-semibold text-blue-300 transition-colors">
            {lang === 'hi' ? 'डेटा निर्यात करें' : 'Export Data'}
          </button>
          <button className="w-full py-2 px-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-xs font-semibold text-red-300 transition-colors">
            {lang === 'hi' ? 'सभी डेटा मिटाएँ' : 'Clear All Data'}
          </button>
        </motion.div>
      </InfoSection>

      {/* App info */}
      <InfoSection title={lang === 'hi' ? 'अन्य' : 'About'} icon="ℹ️">
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>{lang === 'hi' ? 'संस्करण' : 'App Version'}</span>
            <span className="text-white font-mono">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>{lang === 'hi' ? 'निर्मित' : 'Built with'}</span>
            <span className="text-white">React + Vite</span>
          </div>
        </div>
      </InfoSection>
    </div>
  )
}
