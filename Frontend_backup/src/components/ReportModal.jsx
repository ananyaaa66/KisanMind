import { motion, AnimatePresence } from 'framer-motion'
import { X, FileDown, Volume2, Share2, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { t } from '../data/i18n.js'
import GrowthLine from './GrowthLine.jsx'


export default function ReportModal() {
  const { reportOpen, setReportOpen, lang, speak, advisoryData, exportPdf, profile } = useApp()

  const readAll = () => {
    if (advisoryData && advisoryData.final_report) {
      // Speak the first 600 characters of the report as a summary
      speak(advisoryData.final_report.slice(0, 600))
    }
  }

  // Simple markdown renderer for React
  const renderMarkdown = (md) => {
    if (!md) return null
    return md.split('\n').map((line, idx) => {
      const clean = line.trim()
      if (clean.startsWith('# ')) {
        return <h1 key={idx} className="text-xl font-bold text-cropbright mt-4 mb-2">{clean.replace('# ', '')}</h1>
      } else if (clean.startsWith('## ')) {
        return <h2 key={idx} className="text-lg font-bold text-cropbright mt-3 mb-2">{clean.replace('## ', '')}</h2>
      } else if (clean.startsWith('### ')) {
        return <h3 key={idx} className="text-md font-semibold text-cropbright mt-2 mb-1">{clean.replace('### ', '')}</h3>
      } else if (clean.startsWith('- ') || clean.startsWith('* ')) {
        return <li key={idx} className="text-sm text-[var(--text-dim)] list-disc ml-5 my-1 leading-relaxed">{clean.substring(2)}</li>
      } else if (clean === '---') {
        return <hr key={idx} className="border-white/5 my-3" />
      } else {
        // replace **text** with bold tags
        const parts = clean.split('**')
        const renderedParts = parts.map((part, pIdx) => {
          if (pIdx % 2 === 1) return <strong key={pIdx} className="font-semibold text-cropbright">{part}</strong>
          return part
        })
        return <p key={idx} className="text-sm text-[var(--text-dim)] my-2 leading-relaxed">{renderedParts}</p>
      }
    })
  }

  return (
    <AnimatePresence>
      {reportOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center lg:p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setReportOpen(false)}
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[480px] lg:max-w-[680px] bg-panel rounded-t-3xl lg:rounded-2xl border-t lg:border border-crop/30 max-h-[88vh] lg:max-h-[80vh] flex flex-col shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-2">
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-lg">{t('report', lang)}</h2>
                {advisoryData?.execution_time_parallel && (
                  <span className="text-[9px] bg-crop/15 text-cropbright px-2 py-0.5 rounded-full border border-crop/30 flex items-center gap-0.5">
                    <Sparkles size={8} /> {advisoryData.execution_time_parallel}s
                  </span>
                )}
              </div>
              <button onClick={() => setReportOpen(false)} className="tap !min-h-0 p-2 text-[var(--text-dim)]"><X size={20} /></button>
            </div>

            {/* Content Body */}
            <div className="overflow-y-auto scrollbar-hide px-4 pb-6 flex-1">
              <p className="text-xs text-[var(--text-dim)] mb-3">
                {profile?.name || 'Farmer'} · {advisoryData?.location || profile?.location || 'Delhi'} · {advisoryData?.timestamp ? new Date(advisoryData.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today'}
              </p>
              <GrowthLine className="mb-4 opacity-70" />
              
              <div className="space-y-1">
                {advisoryData?.final_report ? (
                  renderMarkdown(advisoryData.final_report)
                ) : (
                  <p className="text-sm text-[var(--text-dim)] text-center py-8">
                    {lang === 'hi' ? 'सलाह प्राप्त करने के लिए कृपया एक फसल की जांच शुरू करें।' : 'Please run a crop scan to generate advice report.'}
                  </p>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="sticky bottom-0 flex gap-2 p-3 bg-panel border-t border-white/5">
              <button 
                onClick={exportPdf}
                disabled={!advisoryData}
                className="tap flex-1 bg-crop text-ink rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FileDown size={18} /> {t('exportPdf', lang)}
              </button>
              <button 
                onClick={readAll} 
                disabled={!advisoryData}
                className="tap px-4 glass !rounded-xl flex items-center justify-center disabled:opacity-50"
              >
                <Volume2 size={18} />
              </button>
              <button 
                disabled={!advisoryData}
                className="tap px-4 glass !rounded-xl flex items-center justify-center text-lime disabled:opacity-50"
              >
                <Share2 size={18} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
