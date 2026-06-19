// Thin animated organic "growth line" divider — leaf-vein motif, low opacity
export default function GrowthLine({ className = '' }) {
  return (
    <svg viewBox="0 0 400 24" className={`w-full h-5 ${className}`} fill="none" preserveAspectRatio="none">
      <path
        d="M0 12 C 60 12, 80 4, 120 12 S 180 20, 220 12 S 300 4, 400 12"
        stroke="url(#vine)" strokeWidth="1.4" strokeLinecap="round"
        strokeDasharray="500" strokeDashoffset="500" className="animate-dash"
      />
      <path d="M120 12 l-7 -8 M120 12 l7 -8" stroke="#2ECC71" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
      <path d="M220 12 l-7 8 M220 12 l7 8" stroke="#A8FF60" strokeWidth="1.2" opacity="0.45" strokeLinecap="round" />
      <defs>
        <linearGradient id="vine" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2ECC71" stopOpacity="0.15" />
          <stop offset="0.5" stopColor="#3DDC84" stopOpacity="0.7" />
          <stop offset="1" stopColor="#A8FF60" stopOpacity="0.15" />
        </linearGradient>
      </defs>
    </svg>
  )
}
