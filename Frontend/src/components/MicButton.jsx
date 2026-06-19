import { Mic } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
// Persistent floating mic — glowing green pulse ring, voice entry point
export default function MicButton() {
  const { setVoiceOpen, voiceOpen } = useApp()
  if (voiceOpen) return null
  return (
    <button
      onClick={() => setVoiceOpen(true)}
      aria-label="Open voice assistant"
      className="fixed z-40 bottom-24 right-4 max-[480px]:right-4"
      style={{ right: 'max(1rem, calc(50% - 240px + 1rem))' }}
    >
      <span className="relative grid place-items-center w-16 h-16 rounded-full bg-crop text-ink glow-green active:scale-95 transition">
        <span className="absolute inset-0 rounded-full bg-crop/60 animate-pulsering" />
        <span className="absolute inset-0 rounded-full bg-crop/40 animate-pulsering" style={{ animationDelay: '0.7s' }} />
        <Mic size={26} />
      </span>
    </button>
  )
}
