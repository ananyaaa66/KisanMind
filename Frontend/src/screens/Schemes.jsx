import { useState } from 'react'
import { ChevronDown, CheckCircle2, AlertCircle, FileDown, FileText, ListChecks, CalendarClock, ExternalLink, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext.jsx'
import { t } from '../data/i18n.js'
import Screen from '../components/Screen.jsx'
import { schemes as mockSchemes, indianStates, crops } from '../data/mockData.js'

export default function Schemes() {
  const { lang, advisoryData } = useApp()
  const [state, setState] = useState('Maharashtra')
  const [land, setLand] = useState(3)
  const [crop, setCrop] = useState('tomato')
  const [income, setIncome] = useState(120000)
  const [open, setOpen] = useState(null)

  // Check if we have live scheme data
  const hasLiveData = advisoryData && advisoryData.scheme_result
  const liveSchemes = hasLiveData ? advisoryData.scheme_result.eligible_schemes : []

  // Map live schemes to match UI requirements
  const displaySchemes = hasLiveData
    ? liveSchemes.map((s, idx) => ({
        id: `live-scheme-${idx}`,
        name: { en: s.scheme_name, hi: s.scheme_name },
        benefit: { en: s.description, hi: s.description },
        eligible: true, // If returned by scheme agent, it is likely eligible
        documents: { 
          en: [s.eligibility || 'Check website for document rules'], 
          hi: [s.eligibility || 'दस्तावेज विवरण के लिए वेबसाइट देखें'] 
        },
        steps: { 
          en: s.application_steps ? s.application_steps.split('\n').filter(Boolean) : ['Visit official portal to apply'],
          hi: s.application_steps ? s.application_steps.split('\n').filter(Boolean) : ['आवेदन के लिए आधिकारिक पोर्टल पर जाएं']
        },
        deadline: { en: s.deadline || 'Rolling', hi: s.deadline || 'लगातार चालू' },
        link: s.link
      }))
    : mockSchemes

  return (
    <Screen title={t('schemesTitle', lang)} subtitle="Agent 3">
      {/* Form */}
      <div className="glass p-4 space-y-4">
        {hasLiveData && (
          <div className="text-lime flex items-center gap-1 bg-lime/10 px-2 py-1 rounded-full text-xs font-bold border border-lime/30 justify-center">
            <Sparkles size={12} /> {lang === 'hi' ? 'लाइव एजेंट द्वारा खोजा गया' : 'Active Schemes found by Agent'}
          </div>
        )}
        <div>
          <label className="text-xs text-[var(--text-dim)]">{t('state', lang)}</label>
          <select value={state} onChange={(e) => setState(e.target.value)}
            className="tap w-full mt-1 bg-panel border border-crop/20 rounded-xl px-3 text-sm focus:border-crop outline-none">
            {indianStates.map((s) => <option key={s} className="bg-panel">{s}</option>)}
          </select>
        </div>

        <div>
          <div className="flex justify-between text-xs"><span className="text-[var(--text-dim)]">{t('landSize', lang)}</span><span className="text-cropbright font-semibold num">{land}</span></div>
          <input type="range" min="0.5" max="20" step="0.5" value={land} onChange={(e) => setLand(+e.target.value)} className="kis-range w-full mt-2" />
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

        <div>
          <div className="flex justify-between text-xs"><span className="text-[var(--text-dim)]">{t('income', lang)}</span><span className="text-cropbright font-semibold num">₹{income.toLocaleString('en-IN')}</span></div>
          <input type="range" min="0" max="500000" step="10000" value={income} onChange={(e) => setIncome(+e.target.value)} className="kis-range w-full mt-2" />
        </div>
      </div>

      {/* Scheme results */}
      <div className="mt-4 space-y-3">
        {displaySchemes.length === 0 ? (
          <div className="glass p-4 text-center text-xs text-[var(--text-dim)]">
            {lang === 'hi' ? 'कोई योजना नहीं मिली।' : 'No schemes found.'}
          </div>
        ) : (
          displaySchemes.map((s) => (
            <div key={s.id} className={`glass p-4 ${s.eligible ? 'active' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <FileText size={18} className="text-cropbright mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold leading-tight">{s.name[lang]}</h3>
                    <p className="text-xs text-[var(--text-dim)] mt-0.5">{s.benefit[lang]}</p>
                  </div>
                </div>
                <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                  s.eligible ? 'text-cropbright border-crop/40 bg-crop/10 glow-green' : 'text-lime border-lime/40 bg-lime/10'}`}>
                  {s.eligible ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                  {s.eligible ? t('eligible', lang) : t('checkRequired', lang)}
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
                      <Block icon={ListChecks} title={t('steps', lang)} items={s.steps[lang]} ordered={hasLiveData ? false : true} />
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
    </Screen>
  )
}

function Block({ icon: Icon, title, items, ordered }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-dim)] mb-1.5"><Icon size={14} /> {title}</p>
      <ul className="space-y-1 pl-1">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm">
            <span className="text-crop">{ordered ? `${i + 1}.` : '•'}</span> {it}
          </li>
        ))}
      </ul>
    </div>
  )
}
