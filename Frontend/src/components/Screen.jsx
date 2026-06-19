import GrowthLine from './GrowthLine.jsx'
// Standard screen wrapper with animated title + growth divider
export default function Screen({ title, subtitle, children, action }) {
  return (
    <div className="px-4 pt-5 pb-32 animate-sprout">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-[var(--text-dim)] mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <GrowthLine className="my-3 opacity-80" />
      {children}
    </div>
  )
}
