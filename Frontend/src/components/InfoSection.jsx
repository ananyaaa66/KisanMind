import React from 'react'

export default function InfoSection({ title, children, icon, className = '' }) {
  return (
    <div className={`bg-gradient-to-br from-white/5 to-transparent rounded-xl p-4 border border-white/10 ${className}`}>
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-3">
          {icon && <span className="text-xl">{icon}</span>}
          {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}
        </div>
      )}
      {children}
    </div>
  )
}
