import { Volume2 } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { t } from '../data/i18n.js'

export default function SpeakButton({ text, label }) {
  const { speak, lang } = useApp()
  return (
    <button
      onClick={() => speak(text)}
      aria-label={t('readAloud', lang)}
      className="tap !min-h-0 inline-flex items-center gap-1.5 text-xs text-cropbright/90 hover:text-cropbright px-2 py-1.5 rounded-lg border border-crop/20 hover:border-crop/50 transition"
    >
      <Volume2 size={15} /> {label ?? t('readAloud', lang)}
    </button>
  )
}
