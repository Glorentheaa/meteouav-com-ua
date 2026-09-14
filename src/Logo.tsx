import React from 'react'
import { CloudSun } from 'lucide-react'

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2 font-logo select-none">
      <CloudSun className="text-emerald-500 w-6 h-6 sm:w-7 sm:h-7 shrink-0" />
      <span className="text-xl sm:text-2xl tracking-wide flex items-center">
        <span className="text-slate-700 dark:text-slate-400 font-semibold">Meteo</span>
        <span className="text-emerald-500 font-extrabold">UAV</span>
      </span>
    </div>
  )
}