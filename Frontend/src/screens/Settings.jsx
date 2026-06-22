import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Globe, Loader2, CheckCircle2, Thermometer, Coins } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { t } from '../data/i18n.js'
import SpeakButton from '../components/SpeakButton.jsx'
import InfoSection from '../components/InfoSection.jsx'
import { getModelInfo, switchModel } from '../utils/api.js'

const MODEL_OPTIONS = [
  { provider: 'gemini', model: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', icon: '✨' },
  { provider: 'groq', model: 'llama-3.3-70b-versatile', label: 'Groq — Llama 3.3 70B', icon: '⚡' },
]

export default function Settings({ onBack }) {
  const { lang, toggleLang, preferences, updatePreferences } = useApp()

  // AI Model state
  const [currentProvider, setCurrentProvider] = useState('groq')
  const [currentModel, setCurrentModel] = useState('')
  const [modelSwitching, setModelSwitching] = useState(false)
  const [modelStatus, setModelStatus] = useState(null) // 'success' | 'error' | null

  // Fetch current model on mount
  useEffect(() => {
    async function loadModelInfo() {
      try {
        const info = await getModelInfo()
        if (info.success) {
          setCurrentProvider(info.provider)
          setCurrentModel(info.model)
        }
      } catch {
        // silently fail — will show default
      }
    }
    loadModelInfo()
  }, [])

  const handleModelSwitch = async (option) => {
    if (option.provider === currentProvider) return
    setModelSwitching(true)
    setModelStatus(null)
    try {
      const result = await switchModel(option.provider, option.model)
      if (result.success) {
        setCurrentProvider(result.provider)
        setCurrentModel(result.model)
        setModelStatus('success')
      }
    } catch (err) {
      setModelStatus('error')
      console.error('Model switch failed:', err)
    } finally {
      setModelSwitching(false)
      setTimeout(() => setModelStatus(null), 3000)
    }
  }

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

      <div className="lg:grid lg:grid-cols-12 lg:gap-6 lg:space-y-0">
        {/* Left Column: Title, AI Model, About */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass p-4">
            <h1 className="text-2xl font-bold text-white">{lang === 'hi' ? 'सेटिंग्स' : 'Settings'}</h1>
          </div>

          {/* AI Model Selector */}
          <InfoSection title={lang === 'hi' ? 'एआई मॉडल' : 'AI Model'} icon="🤖">
            <p className="text-xs text-gray-400 mb-3">
              {lang === 'hi'
                ? 'सभी एजेंटों के लिए उपयोग किया जाने वाला LLM चुनें'
                : 'Choose the LLM used by all advisory agents'}
            </p>
            <div className="space-y-2">
              {MODEL_OPTIONS.map((option) => {
                const isActive = option.provider === currentProvider
                return (
                  <motion.button
                    key={option.provider}
                    onClick={() => handleModelSwitch(option)}
                    disabled={modelSwitching}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-crop/15 border-crop/50 text-cropbright'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30'
                    } ${modelSwitching ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
                  >
                    <span className="text-xl">{option.icon}</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold">{option.label}</p>
                      <p className="text-[10px] text-[var(--text-dim)]">{option.model}</p>
                    </div>
                    {isActive && !modelSwitching && (
                      <span className="text-[10px] font-bold text-lime bg-lime/15 px-2 py-0.5 rounded-full border border-lime/30">
                        {lang === 'hi' ? 'सक्रिय' : 'Active'}
                      </span>
                    )}
                    {modelSwitching && option.provider !== currentProvider && (
                      <Loader2 size={16} className="animate-spin text-lime" />
                    )}
                  </motion.button>
                )
              })}
            </div>
            {/* Status feedback */}
            {modelStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-2 text-xs text-green-400"
              >
                <CheckCircle2 size={14} />
                {lang === 'hi' ? 'मॉडल बदल दिया गया!' : 'Model switched successfully!'}
              </motion.div>
            )}
            {modelStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 mt-2"
              >
                {lang === 'hi' ? '❌ मॉडल बदलने में विफल' : '❌ Failed to switch model'}
              </motion.div>
            )}
          </InfoSection>

          {/* About Card */}
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

        {/* Right Column: Preferences */}
        <div className="lg:col-span-6 space-y-4 mt-4 lg:mt-0">
          {/* Preferences */}
          <InfoSection title={lang === 'hi' ? 'प्राथमिकताएँ' : 'Preferences'} icon="⚙️">
            {/* Language Toggle Row */}
            <motion.div
              onClick={toggleLang}
              className="py-3 border-b border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/5 px-2 rounded-xl transition select-none"
            >
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-lime" />
                <span className="text-sm text-white">{lang === 'hi' ? 'भाषा' : 'Language'}</span>
              </div>
              <span className="text-sm font-semibold text-lime">{lang === 'hi' ? 'हिंदी' : 'English'}</span>
            </motion.div>

            {/* Temperature Unit Toggle Row */}
            <motion.div
              onClick={() => updatePreferences({
                ...preferences,
                temperatureUnit: preferences.temperatureUnit === 'celsius' ? 'fahrenheit' : 'celsius'
              })}
              className="py-3 border-b border-white/10 flex items-center justify-between cursor-pointer hover:bg-white/5 px-2 rounded-xl transition select-none"
            >
              <div className="flex items-center gap-2">
                <Thermometer size={18} className="text-lime" />
                <span className="text-sm text-white">{lang === 'hi' ? 'तापमान इकाई' : 'Temperature Unit'}</span>
              </div>
              <span className="text-sm font-semibold text-lime">
                {preferences.temperatureUnit === 'celsius' ? '°C' : '°F'}
              </span>
            </motion.div>

            {/* Currency Toggle Row */}
            <motion.div
              onClick={() => updatePreferences({
                ...preferences,
                currency: preferences.currency === 'INR' ? 'USD' : 'INR'
              })}
              className="py-3 flex items-center justify-between cursor-pointer hover:bg-white/5 px-2 rounded-xl transition select-none"
            >
              <div className="flex items-center gap-2">
                <Coins size={18} className="text-lime" />
                <span className="text-sm text-white">{lang === 'hi' ? 'मुद्रा' : 'Currency'}</span>
              </div>
              <span className="text-sm font-semibold text-lime">
                {preferences.currency === 'INR' ? 'INR (₹)' : 'USD ($)'}
              </span>
            </motion.div>
          </InfoSection>
        </div>
      </div>
    </div>
  )
}
