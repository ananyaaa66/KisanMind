import { motion } from 'framer-motion'
import { ChevronLeft, FileText, ChevronRight, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { t } from '../data/i18n.js'
import SpeakButton from '../components/SpeakButton.jsx'

export default function AdvisoryReports({ onBack }) {
  const { lang, reportsHistory, setAdvisoryData, setReportOpen } = useApp()

  const handleReportClick = (report) => {
    if (report.reportText) {
      setAdvisoryData({
        final_report: report.reportText,
        session_id: report.id,
        crop_type: report.crop,
        location: report.location
      })
      setReportOpen(true)
    }
  }

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
        <SpeakButton text={t('advisoryReports', lang)} />
      </div>

      <div className="glass p-4 relative overflow-hidden">
        {reportsHistory.length > 0 && (
          <div className="absolute top-2 right-2 text-lime flex items-center gap-1 bg-lime/10 px-2 py-0.5 rounded-full text-[10px] font-bold border border-lime/30">
            <Sparkles size={10} /> {lang === 'hi' ? 'क्लाउड सिंक' : 'ChromaDB Sync'}
          </div>
        )}
        <h1 className="text-2xl font-bold mb-1">{t('advisoryReports', lang)}</h1>
        <p className="text-sm text-gray-400">{reportsHistory.length} {t('reports', lang)}</p>
      </div>

      {/* Reports list — live only */}
      {reportsHistory.length > 0 ? (
        <div className="space-y-3">
          {reportsHistory.map((report, idx) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleReportClick(report)}
              className="cursor-pointer"
            >
              <div className="glass p-4 border border-white/10 hover:border-crop/40 transition-all rounded-xl flex items-center gap-3">
                <span className="grid place-items-center w-10 h-10 rounded-xl bg-crop/10 text-cropbright shrink-0">
                  <FileText size={20} />
                </span>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm mb-0.5 truncate">{report.title[lang]}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{report.date}</span>
                    <span className="text-[10px] bg-white/5 text-[var(--text-dim)] px-2 py-0.5 rounded border border-white/5 uppercase">
                      {report.crop}
                    </span>
                  </div>
                </div>

                <ChevronRight size={18} className="text-gray-400 shrink-0" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass p-8 text-center space-y-3">
          <div className="text-4xl">📋</div>
          <h3 className="font-bold text-lg">
            {lang === 'hi' ? 'अभी तक कोई रिपोर्ट नहीं' : 'No Reports Yet'}
          </h3>
          <p className="text-sm text-[var(--text-dim)] max-w-xs mx-auto">
            {lang === 'hi'
              ? 'अपनी पहली रिपोर्ट बनाने के लिए "रोग जाँच" पेज पर जाएं और एआई सलाहकार चलाएं।'
              : 'Go to the "Disease Scan" page and run the AI advisory pipeline to generate your first report.'}
          </p>
        </div>
      )}
    </div>
  )
}
