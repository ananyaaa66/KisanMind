import { useState, useEffect } from 'react'
import { Sun, Cloud, CloudRain, SprayCan, Droplets, Sprout, Sparkles, Loader2, WifiOff, ChevronDown, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import { t } from '../data/i18n.js'
import Screen from '../components/Screen.jsx'
import SpeakButton from '../components/SpeakButton.jsx'
import { fetchWeather } from '../utils/api.js'
import { indianStates, datasetStates, getDistrictsForState } from '../data/mockData.js'

const wIcon = { 
  sun: Sun, 
  cloud: Cloud, 
  rain: CloudRain,
  clear: Sun,
  clouds: Cloud,
  drizzle: CloudRain,
  thunderstorm: CloudRain
}

function mapIconFromDesc(desc) {
  const d = (desc || '').toLowerCase()
  if (d.includes('rain') || d.includes('drizzle') || d.includes('shower')) return 'rain'
  if (d.includes('clear') || d.includes('sun')) return 'sun'
  return 'cloud'
}

export default function Weather() {
  const { lang } = useApp()
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Location selectors
  const savedLocation = localStorage.getItem('kisanmind_farmer_location') || ''
  const defaultState = indianStates.find((s) => savedLocation.includes(s)) || 'Uttar Pradesh'
  const [selectedState, setSelectedState] = useState(defaultState)
  const districts = getDistrictsForState(selectedState)
  const [selectedDistrict, setSelectedDistrict] = useState(districts[0] || '')
  
  // The location string to fetch weather for
  const weatherLocation = selectedDistrict || savedLocation || selectedState

  // Update district when state changes
  useEffect(() => {
    const newDistricts = getDistrictsForState(selectedState)
    setSelectedDistrict(newDistricts[0] || '')
  }, [selectedState])

  // Fetch weather when location changes
  useEffect(() => {
    if (!weatherLocation) return
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchWeather(weatherLocation)
        if (!cancelled) setWeatherData(data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [weatherLocation])

  // Location selector UI (always shown)
  const locationSelector = (
    <div className="glass p-3 mb-3 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <MapPin size={14} className="text-cropbright" />
        <span className="text-xs font-semibold text-[var(--text-dim)]">
          {lang === 'hi' ? 'स्थान चुनें' : 'Select Location'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {/* State dropdown */}
        <div className="relative">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="tap w-full bg-panel border border-crop/20 rounded-xl px-3 py-2 text-xs focus:border-crop outline-none appearance-none pr-7"
          >
            {indianStates.map((s) => (
              <option key={s} className="bg-panel">{s}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-dim)] pointer-events-none" />
        </div>

        {/* District dropdown */}
        <div className="relative">
          {districts.length > 0 ? (
            <>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="tap w-full bg-panel border border-crop/20 rounded-xl px-3 py-2 text-xs focus:border-crop outline-none appearance-none pr-7"
              >
                {districts.map((d) => (
                  <option key={d} className="bg-panel">{d}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-dim)] pointer-events-none" />
            </>
          ) : (
            <input
              type="text"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              placeholder={lang === 'hi' ? 'जिला / शहर' : 'District / City'}
              className="w-full bg-panel border border-crop/20 rounded-xl px-3 py-2 text-xs focus:border-crop outline-none"
            />
          )}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <Screen title={t('weatherTitle', lang)} subtitle="Agent 4">
        {locationSelector}
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={32} className="animate-spin text-lime" />
          <p className="text-sm text-[var(--text-dim)]">
            {lang === 'hi' ? `${weatherLocation} का मौसम लोड हो रहा है...` : `Fetching weather for ${weatherLocation}...`}
          </p>
        </div>
      </Screen>
    )
  }

  if (error || !weatherData) {
    return (
      <Screen title={t('weatherTitle', lang)} subtitle="Agent 4">
        {locationSelector}
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <WifiOff size={32} className="text-red-400" />
          <p className="text-sm text-red-400 font-semibold">{lang === 'hi' ? 'मौसम डेटा लोड नहीं हो सका' : 'Failed to load weather data'}</p>
          <p className="text-xs text-[var(--text-dim)] max-w-xs">{error}</p>
        </div>
      </Screen>
    )
  }

  const today = weatherData.today
  const forecast3d = (weatherData.forecast_3d || []).map((f) => {
    const dateObj = new Date(f.date)
    const dayStr = isNaN(dateObj.getTime())
      ? f.date
      : dateObj.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short' })
    return {
      day: dayStr,
      temp: Math.round(f.temp_max_c),
      minTemp: Math.round(f.temp_min_c),
      rain: Math.round(f.rain_probability_percent),
      humidity: Math.round(f.humidity_percent),
      wind: Math.round(f.wind_speed_kmh),
      icon: mapIconFromDesc(f.description),
      desc: f.description,
    }
  })

  const soilTipText = lang === 'hi'
    ? `वर्तमान आर्द्रता ${today.humidity_percent}% है। हवा की गति ${Math.round(today.wind_speed_kmh)} km/h। नम मौसम में कवक के प्रति सावधान रहें।`
    : `Current humidity is ${today.humidity_percent}%. Wind speed ${Math.round(today.wind_speed_kmh)} km/h. Watch for fungal infections in humid conditions.`

  return (
    <Screen title={t('weatherTitle', lang)} subtitle="Agent 4">
      {/* Location selector */}
      {locationSelector}

      {/* Live badge */}
      <div className="text-lime flex items-center gap-1 bg-lime/10 px-2 py-1 rounded-full text-xs font-bold border border-lime/30 justify-center mb-3">
        <Sparkles size={12} /> {lang === 'hi' ? `लाइव मौसम — ${weatherLocation}` : `Live Weather — ${weatherLocation}`}
      </div>

      {/* Today's highlight card */}
      <div className="glass active p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--text-dim)] uppercase tracking-wider">{lang === 'hi' ? 'आज का मौसम' : "Today's Weather"}</p>
            <p className="num text-4xl font-extrabold text-cropbright mt-1" style={{ textShadow: '0 0 24px rgba(46,204,113,0.5)' }}>
              {Math.round(today.temp_max_c)}°C
            </p>
            <p className="text-sm text-[var(--text-dim)] mt-1 capitalize">{today.description}</p>
          </div>
          <div className="text-right space-y-2">
            <div>
              <p className="text-[10px] text-[var(--text-dim)]">{lang === 'hi' ? 'आर्द्रता' : 'Humidity'}</p>
              <p className="text-sm font-bold text-lime">{today.humidity_percent}%</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-dim)]">{lang === 'hi' ? 'हवा' : 'Wind'}</p>
              <p className="text-sm font-bold">{Math.round(today.wind_speed_kmh)} km/h</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--text-dim)]">{lang === 'hi' ? 'वर्षा' : 'Rain'}</p>
              <p className="text-sm font-bold text-lime">{today.rain_probability_percent}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3-day forecast */}
      <p className="text-sm font-semibold mb-3">{lang === 'hi' ? '3-दिन का पूर्वानुमान' : '3-Day Forecast'}</p>
      <div className="space-y-2 mb-4">
        {forecast3d.map((f, i) => {
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
                  <span className="text-[10px] text-[var(--text-dim)] truncate max-w-[80px] capitalize">
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

      {/* Soil tip based on live data */}
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
