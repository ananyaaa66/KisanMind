import { useState, useEffect } from 'react'
import { ChevronDown, CheckCircle2, AlertCircle, FileDown, FileText, ListChecks, CalendarClock, ExternalLink, Sparkles, Loader2, WifiOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import { t } from '../data/i18n.js'
import Screen from '../components/Screen.jsx'
import { fetchSchemes } from '../utils/api.js'
import { crops, indianStates } from '../data/mockData.js'

export default function Schemes() {
  const { lang } = useApp()
  const [state, setState] = useState('Maharashtra')
  const [crop, setCrop] = useState('wheat')
  const [open, setOpen] = useState(null)

  const [schemesData, setSchemesData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasFetched, setHasFetched] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSchemes(crop, state)
      setSchemesData(data.scheme_result)
      setHasFetched(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch on first mount
  useEffect(() => {
    handleSearch()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const displaySchemes = schemesData?.eligible_schemes?.map((s, idx) => ({
    id: `live-scheme-${idx}`,
    name: { en: s.scheme_name, hi: s.scheme_name },
    benefit: { en: s.description, hi: s.description },
    eligible: true,
    documents: {
      en: [s.eligibility || 'Check website for document rules'],
      hi: [s.eligibility || 'दस्तावेज विवरण के लिए वेबसाइट देखें']
    },
    steps: {
      en: s.application_steps ? s.application_steps.split('\n').filter(Boolean) : ['Visit official portal to apply'],
      hi: s.application_steps ? s.application_steps.split('\n').filter(Boolean) : ['आवेदन के लिए आधिकारिक पोर्टल पर जाएं']
    },
    deadline: { en: s.deadline || 'Rolling', hi: s.deadline || 'लगातार चालू' },
    link: s.link,
  })) || []

  return (
    <Screen title={t('schemesTitle', lang)} subtitle="Agent 3">
      {/* Form */}
      <div className="glass p-4 space-y-4">
        <div>
          <label className="text-xs text-[var(--text-dim)]">{t('state', lang)}</label>
          <div className="relative">
            <select value={state} onChange={(e) => setState(e.target.value)}
              className="tap w-full mt-1 bg-panel border border-crop/20 rounded-xl px-3 text-sm focus:border-crop outline-none appearance-none pr-8">
              {indianStates.map((s) => <option key={s} className="bg-panel">{s}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="text-xs text-[var(--text-dim)]">{t('cropType', lang)}</label>
          <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-hide">
            {crops.map((c) => (
              <button key={c.id} onClick={() => setCrop(c.id)}
                className={`tap !min-h-0 shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  crop === c.id ? 'bg-crop text-ink border-crop' : 'border-white/10 text-[var(--text-dim)]'}`}>
                {c.icon} {c.label[lang]}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="tap w-full bg-crop text-ink rounded-xl font-semibold py-3 flex items-center justify-center gap-2 glow-green disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> {lang === 'hi' ? 'खोज रहे हैं...' : 'Searching...'}</>
          ) : (
            <>{lang === 'hi' ? 'योजनाएँ खोजें' : 'Search Schemes'}</>
          )}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 size={28} className="animate-spin text-lime" />
          <p className="text-sm text-[var(--text-dim)]">
            {lang === 'hi' ? 'Tavily से योजनाएँ खोज रहे हैं...' : 'Searching schemes via Tavily AI...'}
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <WifiOff size={28} className="text-red-400" />
          <p className="text-sm text-red-400 font-semibold">{lang === 'hi' ? 'योजनाएँ लोड नहीं हो सकीं' : 'Failed to load schemes'}</p>
          <p className="text-xs text-[var(--text-dim)] max-w-xs">{error}</p>
        </div>
      )}

      {/* Scheme results */}
      {!loading && !error && hasFetched && (
        <div className="mt-4 space-y-3">
          <div className="text-lime flex items-center gap-1 bg-lime/10 px-2 py-1 rounded-full text-xs font-bold border border-lime/30 justify-center">
            <Sparkles size={12} /> {lang === 'hi' ? `${displaySchemes.length} योजनाएँ Tavily से मिलीं` : `${displaySchemes.length} schemes found via Tavily AI`}
          </div>

          {displaySchemes.length === 0 ? (
            <div className="glass p-4 text-center text-xs text-[var(--text-dim)]">
              {lang === 'hi' ? 'कोई योजना नहीं मिली।' : 'No schemes found.'}
            </div>
          ) : (
            displaySchemes.map((s) => (
              <div key={s.id} className="glass p-4 active">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <FileText size={18} className="text-cropbright mt-0.5 shrink-0" />
                    <div>
                      <h3 className="font-semibold leading-tight">{s.name[lang]}</h3>
                      <p className="text-xs text-[var(--text-dim)] mt-0.5">{s.benefit[lang]}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full border text-cropbright border-crop/40 bg-crop/10 glow-green flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    {t('eligible', lang)}
                  </span>
                </div>

                <button onClick={() => setOpen(open === s.id ? null : s.id)}
                  className="tap !min-h-0 mt-3 w-full flex items-center justify-between text-sm text-cropbright">
                  <span>{lang === 'hi' ? 'विवरण देखें' : 'View checklist'}</span>
                  <ChevronDown size={18} className={`transition ${open === s.id ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {open === s.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="pt-3 space-y-3 text-sm">
                        <Block icon={FileText} title={lang === 'hi' ? 'पात्रता नियम व दस्तावेज' : 'Eligibility & Documents'} items={s.documents[lang]} />
                        <Block icon={ListChecks} title={t('steps', lang)} items={s.steps[lang]} />
                        <div className="flex items-center gap-2 text-xs text-lime"><CalendarClock size={14} /> {t('deadline', lang)}: {s.deadline[lang]}</div>
                        
                        {s.link ? (
                          <a 
                            href={s.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="tap w-full bg-crop text-ink rounded-xl font-semibold flex items-center justify-center gap-2 py-3 text-center no-underline text-sm"
                          >
                            <ExternalLink size={18} /> {lang === 'hi' ? 'आधिकारिक साइट पर जाएं' : 'Visit Official Portal'}
                          </a>
                        ) : (
                          <button className="tap w-full bg-crop text-ink rounded-xl font-semibold flex items-center justify-center gap-2 py-3">
                            <FileDown size={18} /> {t('downloadChecklist', lang)}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      )}
    </Screen>
  )
}

function Block({ icon: Icon, title, items }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-dim)] mb-1.5"><Icon size={14} /> {title}</p>
      <ul className="space-y-1 pl-1">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <span className="text-crop">•</span> {it}
          </li>
        ))}
      </ul>
    </div>
  )
}
