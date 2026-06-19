import { Sun, Cloud, CloudRain, SprayCan, Droplets, Scissors, Sprout, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import { t } from '../data/i18n.js'
import Screen from '../components/Screen.jsx'
import SpeakButton from '../components/SpeakButton.jsx'
import { forecast as mockForecast, actionTimeline as mockTimeline, soilTip as mockSoilTip, extendedForecast as mockExtendedForecast } from '../data/mockData.js'

const wIcon = { 
  sun: Sun, 
  cloud: Cloud, 
  rain: CloudRain,
  clear: Sun,
  clouds: Cloud,
  drizzle: CloudRain,
  thunderstorm: CloudRain
}

export default function Weather() {
  const { lang, advisoryData } = useApp()

  // Check if we have live weather data
  const hasLiveData = advisoryData && advisoryData.weather_result
  const liveWeather = hasLiveData ? advisoryData.weather_result : null

  // Map forecast data
  const displayForecast = hasLiveData && liveWeather.forecast_3d && liveWeather.forecast_3d.length > 0
    ? liveWeather.forecast_3d.map((f, i) => {
        // Map icon dynamically based on backend description
        const desc = (f.description || '').toLowerCase()
        let iconName = 'cloud'
        if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower')) iconName = 'rain'
        else if (desc.includes('clear') || desc.includes('sun')) iconName = 'sun'
        
        // Format day name from date string (e.g. "2024-06-12" -> "Wed")
        const dateObj = new Date(f.date)
        const dayStr = isNaN(dateObj.getTime()) 
          ? f.date 
          : dateObj.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short' })

        return {
          day: dayStr,
          temp: Math.round(f.temp_max_c),
          minTemp: Math.round(f.temp_min_c),
          rain: Math.round(f.rain_probability_percent),
          icon: iconName,
          desc: f.description
        }
      })
    : mockExtendedForecast

  // Map action timeline from live advisories
  const displayTimeline = hasLiveData
    ? [
        { 
          type: 'spray', 
          when: { en: 'Spray Advisory', hi: 'छिड़काव सलाह' }, 
          text: { en: liveWeather.spray_advisory || 'Conditions good for foliar spray.', hi: liveWeather.spray_advisory || 'छिड़काव के लिए मौसम उपयुक्त है।' } 
        },
        { 
          type: 'irrigate', 
          when: { en: 'Irrigation Advice', hi: 'सिंचाई सलाह' }, 
          text: { en: liveWeather.irrigation_recommendation || 'Irrigate based on soil moisture.', hi: liveWeather.irrigation_recommendation || 'मिट्टी की नमी के अनुसार हल्की सिंचाई करें।' } 
        }
      ]
    : mockTimeline

  const soilTipText = hasLiveData && liveWeather.today
    ? (lang === 'hi' 
        ? `वर्तमान आर्द्रता ${liveWeather.today.humidity_percent}% है। नम मौसम में कवक के प्रति सावधान रहें।`
        : `Current humidity is ${liveWeather.today.humidity_percent}%. Watch out for fungal infections in humid conditions.`)
    : mockSoilTip[lang]

  return (
    <Screen title={t('weatherTitle', lang)} subtitle="Agent 4">
      {hasLiveData && (
        <div className="text-lime flex items-center gap-1 bg-lime/10 px-2 py-1 rounded-full text-xs font-bold border border-lime/30 justify-center mb-3">
          <Sparkles size={12} /> {lang === 'hi' ? 'लाइव मौसम डेटा (ओपनवेदरमैप)' : 'Live Weather Agent (OpenWeatherMap)'}
        </div>
      )}

      {/* 3-day / 7-day forecast detailed */}
      <p className="text-sm font-semibold mb-3">{t('sevenDayForecast', lang)}</p>
      <div className="space-y-2 mb-4">
        {displayForecast.map((f, i) => {
          const Icon = wIcon[f.icon] || Cloud
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 text-left">
                  <p className="text-xs text-[var(--text-dim)]">{f.day}</p>
                </div>
                <Icon size={20} className={f.icon === 'rain' ? 'text-lime' : 'text-cropbright'} />
                {f.desc && (
                  <span className="text-[10px] text-[var(--text-dim)] truncate max-w-[80px]">
                    {f.desc}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 flex-1 justify-end mr-4">
                <div className="text-right">
                  <p className="text-xs text-[var(--text-dim)]">{lang === 'hi' ? 'तापमान' : 'Temp'}</p>
                  <p className="num text-sm font-bold">{f.minTemp}°-{f.temp}°C</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-[var(--text-dim)]">{lang === 'hi' ? 'वर्षा' : 'Rain'}</p>
                <p className="text-sm font-semibold text-lime">{f.rain}%</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Action timeline — nodes connected by an animated vine/stem */}
      <p className="text-sm font-semibold mt-5 mb-3">{t('actionTimeline', lang)}</p>
      <div className="relative pl-9">
        <span className="absolute left-[14px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-crop via-lime to-crop/20" />
        <div className="space-y-4">
          {displayTimeline.map((a, i) => {
            const Icon = a.type === 'spray' ? SprayCan : a.type === 'irrigate' ? Droplets : Scissors
            return (
              <div key={i} className="relative">
                <span className="absolute -left-9 top-0 grid place-items-center w-7 h-7 rounded-full bg-panel border border-crop/50 text-cropbright glow-green">
                  <Icon size={15} />
                </span>
                <div className="glass p-3">
                  <p className="text-[11px] uppercase tracking-wide text-lime font-semibold">{a.when[lang] || a.when}</p>
                  <p className="text-sm mt-0.5">{a.text[lang] || a.text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Soil tip */}
      <div className="glass active p-4 mt-5">
        <div className="flex items-center justify-between mb-1">
          <p className="flex items-center gap-2 font-semibold"><Sprout size={18} className="text-cropbright" /> {t('soilTip', lang)}</p>
          <SpeakButton text={soilTipText} label="" />
        </div>
        <p className="text-sm text-[var(--text-dim)]">{soilTipText}</p>
      </div>
    </Screen>
  )
}
