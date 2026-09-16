import React from 'react'
import { Sunrise, Moon } from 'lucide-react'
import { ForecastCard } from './ForecastCard'

interface SunMoonCardProps {
  isWeeklyVisible?: boolean
}

export const SunMoonCard: React.FC<SunMoonCardProps> = ({
  isWeeklyVisible = true,
}) => {
  return (
    <ForecastCard
      title="Схід/Захід сонця та луни"
      icon={Sunrise}
      className={isWeeklyVisible ? 'lg:col-span-1' : 'lg:col-span-3'}
    >
      <div className="flex-1 grid grid-cols-2 gap-4">
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center">
          <Sunrise className="w-8 h-8 text-amber-500 mb-2" />
          <span className="text-sm font-semibold">05:40 - 20:15</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center">
          <Moon className="w-8 h-8 text-indigo-400 mb-2" />
          <span className="text-sm font-semibold">22:10 - 06:30</span>
        </div>
      </div>
    </ForecastCard>
  )
}
