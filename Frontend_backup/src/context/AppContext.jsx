import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { runAdvisory, getHistory, downloadAdvisoryPdf } from '../utils/api.js'

const AppContext = createContext(null)

const LS_REPORTS_KEY = 'kisanmind_reports'
const LS_ADVISORY_KEY = 'kisanmind_last_advisory'

/**
 * Load saved reports from localStorage.
 */
function loadReportsFromStorage() {
  try {
    const raw = localStorage.getItem(LS_REPORTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Save reports array to localStorage.
 */
function saveReportsToStorage(reports) {
  try {
    localStorage.setItem(LS_REPORTS_KEY, JSON.stringify(reports))
  } catch (e) {
    console.warn('Failed to save reports to localStorage:', e)
  }
}

/**
 * Load last advisory data from localStorage (for home page hero card).
 */
function loadAdvisoryFromStorage() {
  try {
    const raw = localStorage.getItem(LS_ADVISORY_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Save advisory data to localStorage.
 */
function saveAdvisoryToStorage(data) {
  try {
    if (data) {
      localStorage.setItem(LS_ADVISORY_KEY, JSON.stringify(data))
    }
  } catch (e) {
    console.warn('Failed to save advisory to localStorage:', e)
  }
}

const defaultProfile = {
  name: 'Ananya KhetiWadi',
  phone: '',
  email: '',
  location: '',
  totalLand: 2.5,
  crops: [
    { name: 'tomato', area: 1.0, soilType: 'Black soil' },
    { name: 'onion', area: 1.5, soilType: 'Loamy soil' },
  ],
}

export function AppProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('kisanmind_lang')
      return (saved === 'hi' || saved === 'en') ? saved : 'en'
    } catch {
      return 'en'
    }
  })

  const setLang = useCallback((valOrFn) => {
    setLangState((prev) => {
      const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn
      try {
        localStorage.setItem('kisanmind_lang', next)
      } catch (e) {
        console.warn('Failed to save lang to localStorage:', e)
      }
      return next
    })
  }, [])
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  
  // Profile global state
  const [profile, setProfileState] = useState(() => {
    try {
      const saved = localStorage.getItem('kisanmind_profile')
      if (saved) return JSON.parse(saved)
      
      const legacyName = localStorage.getItem('kisanmind_farmer_name') || ''
      const legacyLoc = localStorage.getItem('kisanmind_farmer_location') || ''
      return {
        ...defaultProfile,
        name: legacyName || 'Ananya KhetiWadi',
        location: legacyLoc,
      }
    } catch {
      return defaultProfile
    }
  })

  const updateProfile = useCallback((newProfile) => {
    setProfileState(newProfile)
    try {
      localStorage.setItem('kisanmind_profile', JSON.stringify(newProfile))
      if (newProfile.name) {
        localStorage.setItem('kisanmind_farmer_name', newProfile.name)
      }
      if (newProfile.location) {
        localStorage.setItem('kisanmind_farmer_location', newProfile.location)
      }
    } catch (e) {
      console.warn('Failed to save profile to localStorage:', e)
    }
  }, [])

  // Preferences global state
  const [preferences, setPreferencesState] = useState(() => {
    try {
      const saved = localStorage.getItem('kisanmind_preferences')
      return saved ? JSON.parse(saved) : {
        temperatureUnit: 'celsius',
        currency: 'INR',
      }
    } catch {
      return {
        temperatureUnit: 'celsius',
        currency: 'INR',
      }
    }
  })

  const updatePreferences = useCallback((newPrefs) => {
    setPreferencesState(newPrefs)
    try {
      localStorage.setItem('kisanmind_preferences', JSON.stringify(newPrefs))
    } catch (e) {
      console.warn('Failed to save preferences to localStorage:', e)
    }
  }, [])
  
  // Load persisted state on mount
  const [advisoryData, setAdvisoryData] = useState(() => loadAdvisoryFromStorage())
  const [loading, setLoading] = useState(false)
  const [reportsHistory, setReportsHistory] = useState(() => loadReportsFromStorage())
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('kisanmind_session_id')
    if (!id) {
      id = 'farmer_' + Math.random().toString(36).substring(2, 11)
      localStorage.setItem('kisanmind_session_id', id)
    }
    return id
  })

  const toggleLang = useCallback(() => setLang((l) => (l === 'en' ? 'hi' : 'en')), [setLang])

  // Web Speech API TTS — EN + HI only
  const speak = useCallback((text) => {
    try {
      if (!('speechSynthesis' in window)) return
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
      u.rate = 0.95
      window.speechSynthesis.speak(u)
    } catch (e) { /* TTS unavailable in this environment */ }
  }, [lang])

  // Persist advisoryData whenever it changes
  useEffect(() => {
    if (advisoryData) {
      saveAdvisoryToStorage(advisoryData)
    }
  }, [advisoryData])

  // Try to merge ChromaDB history on mount (fallback, non-blocking)
  useEffect(() => {
    async function mergeRemoteHistory() {
      try {
        const data = await getHistory(sessionId)
        if (data && data.success && data.reports?.length) {
          const localIds = new Set(reportsHistory.map(r => r.id))
          const newRemote = data.reports
            .filter(r => !localIds.has(r.id))
            .map((r) => {
              const meta = r.metadata || {}
              return {
                id: r.id,
                title: {
                  en: `${meta.crop || 'Crop'} Health Diagnosis`,
                  hi: `${meta.crop === 'tomato' ? 'टमाटर' : meta.crop === 'onion' ? 'प्याज़' : 'फ़सल'} स्वास्थ्य जाँच`
                },
                date: meta.saved_at ? new Date(meta.saved_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
                reportText: r.document,
                crop: meta.crop,
                location: meta.location,
                timestamp: meta.saved_at || new Date().toISOString()
              }
            })
          if (newRemote.length) {
            setReportsHistory(prev => {
              const merged = [...newRemote, ...prev]
              saveReportsToStorage(merged)
              return merged
            })
          }
        }
      } catch (error) {
        console.warn('ChromaDB history sync skipped:', error.message)
      }
    }
    mergeRemoteHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  // Run the multi-agent pipeline
  const runAdvisoryPipeline = useCallback(async (cropType, location, query, imageFile = null) => {
    setLoading(true)
    try {
      const data = await runAdvisory(cropType, location, query, imageFile)
      if (data && data.success) {
        setAdvisoryData(data)

        // Create a report entry and persist to localStorage
        const newReport = {
          id: data.session_id || ('report_' + Date.now()),
          title: {
            en: `${cropType || 'Crop'} Health Diagnosis`,
            hi: `${cropType === 'tomato' ? 'टमाटर' : cropType === 'onion' ? 'प्याज़' : 'फ़सल'} स्वास्थ्य जाँच`
          },
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          reportText: data.final_report,
          crop: cropType,
          location: location,
          timestamp: new Date().toISOString()
        }

        setReportsHistory(prev => {
          // Avoid duplicates
          const filtered = prev.filter(r => r.id !== newReport.id)
          const updated = [newReport, ...filtered]
          saveReportsToStorage(updated)
          return updated
        })

        setLoading(false)
        return data
      } else {
        throw new Error('Pipeline completed but returned unsuccessful response')
      }
    } catch (error) {
      setLoading(false)
      console.error('Error running advisory pipeline:', error)
      throw error
    }
  }, [])

  // Export current advisory as PDF
  const exportPdf = useCallback(async () => {
    if (!advisoryData || !advisoryData.final_report) return
    try {
      await downloadAdvisoryPdf(advisoryData.session_id || sessionId, advisoryData.final_report)
    } catch (error) {
      console.error('Failed to download PDF:', error)
    }
  }, [advisoryData, sessionId])

  // Delete a single report
  const deleteReport = useCallback((reportId) => {
    setReportsHistory(prev => {
      const updated = prev.filter(r => r.id !== reportId)
      saveReportsToStorage(updated)
      return updated
    })
  }, [])

  // Clear all reports from localStorage
  const clearAllReports = useCallback(() => {
    setReportsHistory([])
    setAdvisoryData(null)
    localStorage.removeItem(LS_REPORTS_KEY)
    localStorage.removeItem(LS_ADVISORY_KEY)
  }, [])

  const value = {
    lang, setLang, toggleLang,
    voiceOpen, setVoiceOpen,
    reportOpen, setReportOpen,
    speak,
    profile, updateProfile,
    preferences, updatePreferences,
    
    // Live advisory pipeline integration
    advisoryData, setAdvisoryData,
    loading, setLoading,
    reportsHistory,
    sessionId,
    runAdvisoryPipeline,
    exportPdf,
    deleteReport,
    clearAllReports
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
