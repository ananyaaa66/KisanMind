import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Phone, Mail, MapPin, Save, Edit3 } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { t } from '../data/i18n.js'
import SpeakButton from '../components/SpeakButton.jsx'
import DataCard from '../components/DataCard.jsx'
import InfoSection from '../components/InfoSection.jsx'

export default function FarmerProfile({ onBack }) {
  const { lang, reportsHistory, profile, updateProfile } = useApp()
  const [localProfile, setLocalProfile] = useState(profile)
  const [editing, setEditing] = useState(!profile.name)

  // Keep localProfile in sync if profile changes from outside
  useEffect(() => {
    setLocalProfile(profile)
  }, [profile])

  const updateField = (field, value) => {
    setLocalProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    updateProfile(localProfile)
    setEditing(false)
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
            onClick={() => {
              if (editing) {
                handleSave()
              } else {
                setEditing(true)
              }
            }}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            title={editing ? (lang === 'hi' ? 'सहेजें' : 'Save') : (lang === 'hi' ? 'संपादित करें' : 'Edit')}
          >
            {editing ? <Save size={18} className="text-lime" /> : <Edit3 size={18} className="text-cropbright" />}
          </button>
          <SpeakButton text={localProfile.name || 'Farmer'} />
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-6 lg:space-y-0">
        {/* Left Column: Avatar & Contact */}
        <div className="lg:col-span-6 space-y-4">
          {/* Profile header */}
          <div className="glass p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-lime to-crop mx-auto mb-4 flex items-center justify-center text-3xl">
              🌾
            </div>
            {editing ? (
              <input
                type="text"
                value={localProfile.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder={lang === 'hi' ? 'अपना नाम दर्ज करें' : 'Enter your name'}
                className="w-full text-center text-2xl font-bold bg-transparent border-b border-crop/40 focus:outline-none focus:border-crop pb-1 text-white"
              />
            ) : (
              <h1 className="text-2xl font-bold text-white">{localProfile.name || (lang === 'hi' ? 'अपना नाम सेट करें' : 'Set your name')}</h1>
            )}
          </div>

          {/* Contact info */}
          <InfoSection title={lang === 'hi' ? 'संपर्क' : 'Contact'} icon="📱">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-lime shrink-0" />
                {editing ? (
                  <input type="tel" value={localProfile.phone} onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-crop" />
                ) : (
                  <span className="text-sm text-gray-300">{localProfile.phone || '—'}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-lime shrink-0" />
                {editing ? (
                  <input type="email" value={localProfile.email} onChange={(e) => updateField('email', e.target.value)}
                    placeholder="name@email.com"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-crop" />
                ) : (
                  <span className="text-sm text-gray-300">{localProfile.email || '—'}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-lime shrink-0" />
                {editing ? (
                  <input type="text" value={localProfile.location} onChange={(e) => updateField('location', e.target.value)}
                    placeholder={lang === 'hi' ? 'जैसे: दिल्ली' : 'e.g., Delhi'}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-crop" />
                ) : (
                  <span className="text-sm text-gray-300">{localProfile.location || '—'}</span>
                )}
              </div>
            </div>
          </InfoSection>
        </div>

        {/* Right Column: Farm Details & Stats */}
        <div className="lg:col-span-6 space-y-4 mt-4 lg:mt-0">
          {/* Farm details */}
          <InfoSection title={lang === 'hi' ? 'खेत का विवरण' : 'Farm Details'} icon="🚜">
            <div className="space-y-3">
              <div className="text-center p-3 bg-black/20 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">{lang === 'hi' ? 'कुल भूमि' : 'Total Land'}</p>
                {editing ? (
                  <input type="number" value={localProfile.totalLand} onChange={(e) => updateField('totalLand', parseFloat(e.target.value) || 0)}
                    step="0.5" min="0"
                    className="text-lg font-bold text-lime bg-transparent border-b border-crop/40 text-center w-20 focus:outline-none" />
                ) : (
                  <p className="text-lg font-bold text-lime">{localProfile.totalLand} {lang === 'hi' ? 'हेक्टेयर' : 'hectares'}</p>
                )}
              </div>

              <div className="border-t border-white/10 pt-3 space-y-3">
                {localProfile.crops.map((crop, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2"
                  >
                    {editing ? (
                      <div className="space-y-2">
                        {/* Crop Name */}
                        <div>
                          <label className="text-[10px] text-[var(--text-dim)] font-semibold block mb-0.5">
                            {lang === 'hi' ? 'फसल' : 'Crop'}
                          </label>
                          <input 
                            type="text" 
                            value={crop.name} 
                            onChange={(e) => {
                              const updatedCrops = [...localProfile.crops]
                              updatedCrops[idx] = { ...crop, name: e.target.value }
                              updateField('crops', updatedCrops)
                            }}
                            className="w-full bg-panel border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-crop" 
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {/* Crop Area */}
                          <div>
                            <label className="text-[10px] text-[var(--text-dim)] font-semibold block mb-0.5">
                              {lang === 'hi' ? 'क्षेत्रफल (ha)' : 'Area (ha)'}
                            </label>
                            <input 
                              type="number" 
                              step="0.1" 
                              min="0"
                              value={crop.area} 
                              onChange={(e) => {
                                const updatedCrops = [...localProfile.crops]
                                updatedCrops[idx] = { ...crop, area: parseFloat(e.target.value) || 0 }
                                updateField('crops', updatedCrops)
                              }}
                              className="w-full bg-panel border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-crop" 
                            />
                          </div>
                          
                          {/* Soil Type */}
                          <div>
                            <label className="text-[10px] text-[var(--text-dim)] font-semibold block mb-0.5">
                              {lang === 'hi' ? 'मिट्टी का प्रकार' : 'Soil Type'}
                            </label>
                            <input 
                              type="text" 
                              value={crop.soilType} 
                              onChange={(e) => {
                                const updatedCrops = [...localProfile.crops]
                                updatedCrops[idx] = { ...crop, soilType: e.target.value }
                                updateField('crops', updatedCrops)
                              }}
                              className="w-full bg-panel border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-crop" 
                            />
                          </div>
                        </div>
                        
                        {/* Remove Crop Button */}
                        <div className="text-right">
                          <button
                            type="button"
                            onClick={() => {
                              const updatedCrops = localProfile.crops.filter((_, cIdx) => cIdx !== idx)
                              updateField('crops', updatedCrops)
                            }}
                            className="text-[10px] text-red-400 hover:text-red-300 font-semibold"
                          >
                            {lang === 'hi' ? 'फसल हटाएं' : 'Remove Crop'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-white capitalize">{crop.name}</p>
                          <span className="text-xs text-gray-400">{crop.area} {lang === 'hi' ? 'हेक्टेयर' : 'ha'}</span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {lang === 'hi' ? 'मिट्टी' : 'Soil'}: {crop.soilType}
                        </p>
                      </>
                    )}
                  </motion.div>
                ))}

                {editing && (
                  <button
                    type="button"
                    onClick={() => {
                      const updatedCrops = [...localProfile.crops, { name: '', area: 0, soilType: '' }]
                      updateField('crops', updatedCrops)
                    }}
                    className="w-full py-2 border border-dashed border-crop/30 rounded-xl text-xs text-cropbright hover:bg-crop/5 transition"
                  >
                    + {lang === 'hi' ? 'नई फसल जोड़ें' : 'Add New Crop'}
                  </button>
                )}
              </div>
            </div>
          </InfoSection>

          {/* Stats from real data */}
          <div className="grid grid-cols-3 gap-2">
            <DataCard subtitle={lang === 'hi' ? 'रिपोर्ट' : 'Reports'} value={totalReports} icon="📋" />
            <DataCard subtitle={lang === 'hi' ? 'फ़सलें' : 'Crops'} value={localProfile.crops.length} icon="🌱" />
            <DataCard subtitle={lang === 'hi' ? 'भूमि' : 'Land'} value={`${localProfile.totalLand}ha`} icon="🚜" />
          </div>

          {editing && (
            <button
              onClick={handleSave}
              className="tap w-full bg-crop text-ink rounded-xl font-semibold py-3 flex items-center justify-center gap-2 glow-green"
            >
              <Save size={18} /> {lang === 'hi' ? 'प्रोफ़ाइल सहेजें' : 'Save Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
