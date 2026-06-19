import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { runAdvisory, getHistory, downloadAdvisoryPdf } from '../utils/api.js'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [lang, setLang] = useState('en') // 'en' | 'hi' only
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  
  // New API-driven state variables
  const [advisoryData, setAdvisoryData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [reportsHistory, setReportsHistory] = useState([])
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('kisanmind_session_id')
    if (!id) {
      id = 'farmer_' + Math.random().toString(36).substring(2, 11)
      localStorage.setItem('kisanmind_session_id', id)
    }
    return id
  })

  const toggleLang = useCallback(() => setLang((l) => (l === 'en' ? 'hi' : 'en')), [])

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

  // Fetch reports history on load
  const loadReportsHistory = useCallback(async () => {
    try {
      const data = await getHistory(sessionId)
      if (data && data.success) {
        // Map backend ChromaDB items to match UI list schema
        const mapped = data.reports.map((r) => {
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
            location: meta.location
          }
        })
        setReportsHistory(mapped)
      }
    } catch (error) {
      console.error('Failed to load history:', error)
    }
  }, [sessionId])

  useEffect(() => {
    loadReportsHistory()
  }, [loadReportsHistory])

  // Run the multi-agent pipeline
  const runAdvisoryPipeline = useCallback(async (cropType, location, query, imageFile = null) => {
    setLoading(true)
    try {
      const data = await runAdvisory(cropType, location, query, imageFile)
      if (data && data.success) {
        setAdvisoryData(data)
        // Refresh local history
        await loadReportsHistory()
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
  }, [loadReportsHistory])

  // Export current advisory as PDF
  const exportPdf = useCallback(async () => {
    if (!advisoryData || !advisoryData.final_report) return
    try {
      await downloadAdvisoryPdf(advisoryData.session_id || sessionId, advisoryData.final_report)
    } catch (error) {
      console.error('Failed to download PDF:', error)
    }
  }, [advisoryData, sessionId])

  const value = {
    lang, setLang, toggleLang,
    voiceOpen, setVoiceOpen,
    reportOpen, setReportOpen,
    speak,
    
    // Live advisory pipeline integration
    advisoryData, setAdvisoryData,
    loading, setLoading,
    reportsHistory,
    sessionId,
    runAdvisoryPipeline,
    exportPdf
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
