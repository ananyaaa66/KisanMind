import React from 'react'
import { Droplets, Leaf, Harvest } from 'lucide-react'

const iconMap = {
  spray: '💧',
  irrigate: '💦',
  harvest: '🌾',
  fertilize: '🌱',
}

const lucideIcons = {
  spray: Droplets,
  irrigate: Droplets,
  harvest: Harvest,
  fertilize: Leaf,
}

export default function TimelineItem({ type, when, text, completed = false }) {
  const LucideIcon = lucideIcons[type]
  const Icon = iconMap[type] || '📌'

  return (
    <div className={`flex gap-4 pb-6 relative ${completed ? 'opacity-60' : ''}`}>
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${completed ? 'bg-green-500/20 border border-green-500/50' : 'bg-blue-500/20 border border-blue-500/50'}`}>
          {LucideIcon ? (
            <LucideIcon size={18} className={completed ? 'text-green-400' : 'text-blue-400'} />
          ) : (
            Icon
          )}
        </div>
        <div className="w-0.5 h-12 bg-gradient-to-b from-blue-500/50 to-transparent mt-2" />
      </div>

      {/* Content */}
      <div className="pt-1 flex-1">
        <p className="text-xs font-semibold text-gray-300 mb-1">{when}</p>
        <p className="text-sm text-gray-400">{text}</p>
      </div>
    </div>
  )
}
