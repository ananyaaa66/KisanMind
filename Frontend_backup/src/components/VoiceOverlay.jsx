import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PhoneOff, Captions, Mic, Send, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import { t } from '../data/i18n.js'

const ROUTES = [
  { kw: ['disease', 'leaf', 'spot', 'rot', 'blight', 'fungus', 'रोग', 'पत्ती', 'बीमारी', 'धब्बे', 'सड़न'], path: '/scan' },
  { kw: ['price', 'mandi', 'sell', 'rate', 'cost', 'भाव', 'मंडी', 'बेच', 'दाम', 'कीमत'], path: '/prices' },
  { kw: ['scheme', 'yojana', 'loan', 'subsidy', 'gov', 'योजना', 'ऋण', 'सरकार', 'लोन', 'सब्सिडी'], path: '/schemes' },
  { kw: ['weather', 'rain', 'temp', 'wind', 'monsoon', 'मौसम', 'बारिश', 'पानी', 'तापमान'], path: '/weather' },
]

export default function VoiceOverlay() {
  const { voiceOpen, setVoiceOpen, lang, speak, runAdvisoryPipeline, setReportOpen } = useApp()
  const navigate = useNavigate()
  
  const [phase, setPhase] = useState('listening') // listening | thinking | replying | error
  const [transcript, setTranscript] = useState('')
  const [typedInput, setTypedInput] = useState('')
  const [showCaption, setShowCaption] = useState(true)
  const [reply, setReply] = useState('')
  const [recognitionSupported, setRecognitionSupported] = useState(true)
  
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (!voiceOpen) return

    setPhase('listening')
    setTranscript('')
    setReply('')
    setTypedInput('')

    // Initialize Web Speech API SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setRecognitionSupported(false)
      return
    }

    try {
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = true
      rec.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'

      rec.onresult = (e) => {
        const result = Array.from(e.results)
          .map((r) => r[0].transcript)
          .join('')
        setTranscript(result)
      }

      rec.onend = () => {
        // When speech stops, automatically submit the transcript if it's not empty
        setTranscript((current) => {
          if (current.trim().length > 3) {
            handleVoiceCommand(current)
          }
          return current
        })
      }

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e.error)
        if (e.error === 'not-allowed') {
          setRecognitionSupported(false)
        }
      }

      rec.start()
      recognitionRef.current = rec
    } catch (e) {
      console.error(e)
      setRecognitionSupported(false)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      window.speechSynthesis?.cancel()
    }
  }, [voiceOpen, lang]) // eslint-disable-line

  const handleVoiceCommand = async (commandText) => {
    if (recognitionRef.current) {
      recognitionRef.current.abort()
    }
    
    setPhase('thinking')
    
    try {
      // Execute the real LangGraph pipeline via AppContext
      const defaultCrop = 'tomato'
      const defaultLoc = 'Nashik, Maharashtra'
      
      const response = await runAdvisoryPipeline(defaultCrop, defaultLoc, commandText)
      
      // Determine navigation route based on speech keywords
      const lowerCmd = commandText.toLowerCase()
      const matchedRoute = ROUTES.find((r) => r.kw.some((k) => lowerCmd.includes(k)))
      if (matchedRoute) {
        navigate(matchedRoute.path)
      }

      // Generate speech synthesis text from the backend response
      let ttsMessage = ''
      if (response.disease_result) {
        ttsMessage = lang === 'hi'
          ? `रोग की पहचान: ${response.disease_result.disease_name}। उपचार के लिए: ${response.disease_result.treatment}`
          : `Detected disease: ${response.disease_result.disease_name}. Treatment recommendation is: ${response.disease_result.treatment}`
      } else if (response.weather_result) {
        ttsMessage = lang === 'hi'
          ? `मौसम: ${response.weather_result.spray_advisory || 'मौसम साफ रहेगा'}`
          : `Weather Advisory: ${response.weather_result.spray_advisory || 'Conditions are normal.'}`
      } else {
        ttsMessage = lang === 'hi'
          ? `आपकी कृषि सलाह तैयार है। कृपया पूरी रिपोर्ट स्क्रीन पर देखें।`
          : `Your agricultural advisory is ready. Please view the full report on screen.`
      }

      setReply(ttsMessage)
      setPhase('replying')
      
      // Speak back the AI advisor's answer
      speak(ttsMessage)
      
      // Open the comprehensive report modal in 1.5 seconds so they can read the full report
      setTimeout(() => {
        setReportOpen(true)
        setVoiceOpen(false)
      }, 3000)

    } catch (error) {
      console.error(error)
      setPhase('error')
      const errMsg = lang === 'hi' ? 'सलाह प्राप्त करने में विफलता। कृपया पुनः प्रयास करें।' : 'Failed to reach AI advisers. Please try again.'
      setReply(errMsg)
      speak(errMsg)
    }
  }

  const handleTextSubmit = (e) => {
    e.preventDefault()
    if (typedInput.trim()) {
      handleVoiceCommand(typedInput)
    }
  }

  const end = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort()
    }
    window.speechSynthesis?.cancel()
    setVoiceOpen(false)
  }

  return (
    <AnimatePresence>
      {voiceOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between py-12 px-6"
          style={{ background: 'radial-gradient(circle at 50% 35%, rgba(46,204,113,0.18), rgba(10,15,10,0.96) 60%)', backdropFilter: 'blur(8px)' }}
        >
          {/* Top Label */}
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-cropbright/80">{t('appName', lang)}</p>
            <p className="text-[var(--text-dim)] text-xs mt-1 flex items-center justify-center gap-1">
              <Sparkles size={12} className="text-crop" />
              {phase === 'listening' && (lang === 'hi' ? 'बोलिए, मैं सुन रहा हूँ...' : 'Listening to your voice...')}
              {phase === 'thinking' && (lang === 'hi' ? 'सलाहकारों से परामर्श कर रहा हूँ...' : 'Consulting AI advisors...')}
              {phase === 'replying' && (lang === 'hi' ? 'समाधान पाया गया' : 'Solutions Prepared')}
              {phase === 'error' && 'Error'}
            </p>
          </div>

          {/* Orb waveform */}
          <div className="relative grid place-items-center">
            <span className="absolute w-64 h-64 rounded-full bg-crop/10 animate-pulsering" />
            <span className="absolute w-64 h-64 rounded-full bg-crop/10 animate-pulsering" style={{ animationDelay: '1s' }} />
            <motion.div
              animate={{ scale: phase === 'listening' ? [1, 1.08, 1] : 1 }}
              transition={{ repeat: Infinity, duration: 1.6 }}
              className="relative w-40 h-40 rounded-full grid place-items-center glow-green cursor-pointer"
              onClick={() => {
                if (phase === 'listening' && transcript.trim()) {
                  handleVoiceCommand(transcript)
                }
              }}
              style={{ background: 'radial-gradient(circle at 50% 40%, #3DDC84, #1d7a48)' }}
            >
              <Mic size={48} className="text-ink" />
            </motion.div>
            {phase === 'listening' && (
              <div className="absolute -bottom-10 flex items-end gap-1 h-8">
                {Array.from({ length: 9 }).map((_, i) => (
                  <motion.span key={i} className="w-1.5 rounded-full bg-lime"
                    animate={{ height: [6, 26, 10, 30, 8] }}
                    transition={{ repeat: Infinity, duration: 1.1, delay: i * 0.08 }} />
                ))}
              </div>
            )}
          </div>

          {/* Transcript / Input text box */}
          <div className="w-full max-w-sm">
            {phase === 'replying' && reply && (
              <p className="text-center text-cropbright mb-3 animate-sprout font-medium">{reply}</p>
            )}
            
            {phase === 'error' && (
              <p className="text-center text-red-400 mb-3 animate-sprout">{reply}</p>
            )}

            {showCaption && (
              <div className="glass p-3 text-center min-h-[52px] flex flex-col items-center justify-center">
                {recognitionSupported ? (
                  <p className="text-sm">
                    {transcript || (lang === 'hi' ? 'बोलना शुरू करें...' : 'Speak now...')}
                    <span className="animate-pulse">|</span>
                  </p>
                ) : (
                  /* Fallback Typing Input */
                  <form onSubmit={handleTextSubmit} className="flex gap-2 w-full">
                    <input
                      type="text"
                      value={typedInput}
                      onChange={(e) => setTypedInput(e.target.value)}
                      placeholder={lang === 'hi' ? 'अपना प्रश्न यहाँ टाइप करें...' : 'Type your question here...'}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-crop"
                    />
                    <button type="submit" className="bg-crop text-ink p-2 rounded-xl active:scale-95 transition">
                      <Send size={14} />
                    </button>
                  </form>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-center gap-3 mt-5">
              {recognitionSupported && (
                <button onClick={() => setShowCaption((s) => !s)}
                  className="tap glass !rounded-full px-4 flex items-center gap-2 text-sm">
                  <Captions size={18} /> {t('transcript', lang)}
                </button>
              )}
              <button onClick={end}
                className="tap rounded-full px-6 py-3 flex items-center gap-2 font-semibold border border-crop text-cropbright hover:bg-crop hover:text-ink transition">
                <PhoneOff size={18} /> {t('endCall', lang)}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
