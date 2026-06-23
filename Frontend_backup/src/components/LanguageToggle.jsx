import { useApp } from '../context/AppContext.jsx'
// Two-state switch: EN | हिं  (English / Hindi only)
export default function LanguageToggle() {
  const { lang, setLang } = useApp()
  return (
    <div className="glass !rounded-full flex items-center p-1 text-sm font-semibold select-none">
      <button
        onClick={() => setLang('en')}
        className={`tap !min-h-0 px-3 py-1.5 rounded-full transition ${lang === 'en' ? 'bg-crop text-ink' : 'text-[var(--text-dim)]'}`}
      >EN</button>
      <button
        onClick={() => setLang('hi')}
        className={`tap !min-h-0 px-3 py-1.5 rounded-full transition ${lang === 'hi' ? 'bg-crop text-ink' : 'text-[var(--text-dim)]'}`}
      >हिं</button>
    </div>
  )
}
