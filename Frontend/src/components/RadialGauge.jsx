// Affected-area gauge styled like a tree growth ring
export default function RadialGauge({ value = 0, severity = 'amber' }) {
  const r = 46
  const c = 2 * Math.PI * r
  const off = c - (value / 100) * c
  const color = severity === 'red' ? '#ff5d5d' : severity === 'green' ? '#3DDC84' : '#A8FF60'
  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
        <circle cx="60" cy="60" r={r-12} stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" fill="none" />
        <circle cx="60" cy="60" r={r-20} stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" fill="none" />
        <circle
          cx="60" cy="60" r={r} stroke={color} strokeWidth="8" fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 1.1s ease', filter: `drop-shadow(0 0 6px ${color}99)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="num text-3xl font-extrabold" style={{ color }}>{value}%</span>
      </div>
    </div>
  )
}
