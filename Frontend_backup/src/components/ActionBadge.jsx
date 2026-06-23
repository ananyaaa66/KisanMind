import React from 'react'
import { TrendingUp, Clock, AlertCircle } from 'lucide-react'

export default function ActionBadge({ type = 'info', label, icon, color = '#A8FF60' }) {
  const bgColor = type === 'urgent' ? 'bg-red-500/20 border-red-500/30' : type === 'warning' ? 'bg-amber-500/20 border-amber-500/30' : 'bg-blue-500/20 border-blue-500/30'
  const textColor = type === 'urgent' ? 'text-red-300' : type === 'warning' ? 'text-amber-300' : 'text-blue-300'

  const IconComponent = icon || (type === 'urgent' ? AlertCircle : type === 'warning' ? Clock : TrendingUp)

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${bgColor} ${textColor} text-xs font-medium`}>
      <IconComponent size={14} />
      <span>{label}</span>
    </div>
  )
}
