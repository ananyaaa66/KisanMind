import React from 'react'
import { ChevronRight } from 'lucide-react'

export default function DataCard({
  title,
  subtitle,
  value,
  unit,
  icon,
  trend,
  trendColor,
  onClick,
  className = '',
  children,
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer group ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-xs text-gray-400 mb-1">{subtitle}</p>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>

      {value !== undefined && (
        <div className="mb-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{value}</span>
            {unit && <span className="text-xs text-gray-400">{unit}</span>}
          </div>
          {trend && (
            <p className={`text-xs mt-1 ${trendColor || 'text-gray-400'}`}>{trend}</p>
          )}
        </div>
      )}

      {children}

      {onClick && (
        <div className="text-gray-400 group-hover:text-white transition-colors mt-2">
          <ChevronRight size={16} />
        </div>
      )}
    </div>
  )
}
