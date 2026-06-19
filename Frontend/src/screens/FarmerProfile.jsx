import { motion } from 'framer-motion'
import { ChevronLeft, Phone, Mail, MapPin, Leaf, TrendingUp } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { t } from '../data/i18n.js'
import { farmerProfile } from '../data/mockData.js'
import SpeakButton from '../components/SpeakButton.jsx'
import DataCard from '../components/DataCard.jsx'
import InfoSection from '../components/InfoSection.jsx'

export default function FarmerProfile({ onBack }) {
  const { lang } = useApp()

  const joinedYear = new Date(farmerProfile.joinedDate).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    year: 'numeric',
    month: 'long',
  })

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
        <SpeakButton text={farmerProfile.name[lang]} />
      </div>

      {/* Profile header */}
      <div className="glass p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-lime to-crop mx-auto mb-4 flex items-center justify-center text-3xl">
          🌾
        </div>
        <h1 className="text-2xl font-bold">{farmerProfile.name[lang]}</h1>
        <p className="text-sm text-gray-400 mt-1">
          {lang === 'hi' ? 'सदस्य रहे' : 'Member since'} {joinedYear}
        </p>
      </div>

      {/* Contact info */}
      <InfoSection title="Contact" icon="📱">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-lime" />
            <span className="text-sm text-gray-300">{farmerProfile.phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-lime" />
            <span className="text-sm text-gray-300">{farmerProfile.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-lime" />
            <span className="text-sm text-gray-300">{farmerProfile.location[lang]}</span>
          </div>
        </div>
      </InfoSection>

      {/* Farm details */}
      <InfoSection title={lang === 'hi' ? 'खेत का विवरण' : 'Farm Details'} icon="🚜">
        <div className="space-y-3">
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">{lang === 'hi' ? 'कुल भूमि' : 'Total Land'}</p>
            <p className="text-lg font-bold text-lime">
              {farmerProfile.totalLand.value} {farmerProfile.totalLand.unit[lang]}
            </p>
          </div>

          <div className="border-t border-white/10 pt-3">
            {farmerProfile.crops.map((crop, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="mb-3 last:mb-0"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-white capitalize">{crop.name}</p>
                  <span className="text-xs text-gray-400">
                    {crop.area.value} {crop.area.unit[lang]}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {lang === 'hi' ? 'मिट्टी' : 'Soil'}: {crop.soilType[lang]}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {lang === 'hi' ? 'कटाई' : 'Harvest'}: {new Date(crop.expectedHarvest).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN')}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </InfoSection>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <DataCard
          subtitle={lang === 'hi' ? 'रिपोर्ट' : 'Reports'}
          value={farmerProfile.stats.totalReports}
          icon="📋"
        />
        <DataCard
          subtitle={lang === 'hi' ? 'समाधान' : 'Resolved'}
          value={farmerProfile.stats.resolvedIssues}
          icon="✓"
        />
        <DataCard
          subtitle={lang === 'hi' ? 'योजनाएँ' : 'Schemes'}
          value={farmerProfile.stats.schemesEnrolled}
          icon="📜"
        />
      </div>

      {/* Bank details */}
      <InfoSection title={lang === 'hi' ? 'बैंक विवरण' : 'Bank Details'} icon="🏦">
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-1">{lang === 'hi' ? 'खाता धारक' : 'Account Holder'}</p>
            <p className="text-white font-semibold">{farmerProfile.bankDetails.accountHolder[lang]}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">{lang === 'hi' ? 'बैंक' : 'Bank'}</p>
              <p className="text-white font-semibold">{farmerProfile.bankDetails.bankName[lang]}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">{lang === 'hi' ? 'आईएफएससी' : 'IFSC'}</p>
              <p className="text-white font-mono text-sm">{farmerProfile.bankDetails.ifsc}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">{lang === 'hi' ? 'खाता संख्या' : 'Account No.'}</p>
            <p className="text-white font-mono">{farmerProfile.bankDetails.accountNumber}</p>
          </div>
        </div>
      </InfoSection>

      {/* Active schemes */}
      <InfoSection title={lang === 'hi' ? 'सक्रिय योजनाएँ' : 'Active Schemes'} icon="📜">
        <div className="space-y-2">
          {farmerProfile.schemes.map((scheme) => (
            <div key={scheme.id} className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-white">{scheme.name[lang]}</p>
                <p className="text-xs text-gray-400">
                  {lang === 'hi' ? 'से' : 'Since'} {new Date(scheme.joinedDate).toLocaleDateString()}
                </p>
              </div>
              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded-full font-semibold">
                {lang === 'hi' ? 'सक्रिय' : 'Active'}
              </span>
            </div>
          ))}
        </div>
      </InfoSection>
    </div>
  )
}
