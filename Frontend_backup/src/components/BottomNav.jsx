import { NavLink } from 'react-router-dom'
import { Home, ScanLine, TrendingUp, FileBadge, CloudSun } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { STR } from '../data/i18n.js'

const items = [
  { to: '/', icon: Home, key: 'home', end: true },
  { to: '/scan', icon: ScanLine, key: 'disease' },
  { to: '/prices', icon: TrendingUp, key: 'prices' },
  { to: '/schemes', icon: FileBadge, key: 'schemes' },
  { to: '/weather', icon: CloudSun, key: 'weather' },
]

export default function BottomNav() {
  const { lang } = useApp()
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-30">
      <div className="mx-3 mb-3 glass !rounded-2xl flex items-stretch justify-between px-1 py-1.5 backdrop-blur-xl">
        {items.map(({ to, icon: Icon, key, end }) => (
          <NavLink
            key={key} to={to} end={end}
            className={({ isActive }) =>
              `tap flex-1 flex flex-col items-center justify-center gap-0.5 rounded-xl py-1 transition ${
                isActive ? 'text-cropbright' : 'text-[var(--text-dim)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`grid place-items-center w-9 h-9 rounded-xl transition ${isActive ? 'bg-crop/15 glow-green' : ''}`}>
                  <Icon size={20} />
                </span>
                <span className="text-[10px] font-semibold">{STR.nav[key][lang]}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
