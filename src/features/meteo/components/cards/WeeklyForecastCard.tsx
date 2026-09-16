import React from 'react'
import { CalendarDays } from 'lucide-react'
import { ForecastCard } from './ForecastCard'

interface WeeklyForecastCardProps {
  isSunMoonVisible?: boolean
}

export const WeeklyForecastCard: React.FC<WeeklyForecastCardProps> = ({
  isSunMoonVisible = true,
}) => {
  return (
    <ForecastCard
      title="Тижневий прогноз"
      icon={CalendarDays}
      className={isSunMoonVisible ? 'lg:col-span-2' : 'lg:col-span-3'}
    >
      <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center">
        <span className="text-slate-400 text-sm">Спрощений потижневий огляд</span>
      </div>
    </ForecastCard>
  )
}
