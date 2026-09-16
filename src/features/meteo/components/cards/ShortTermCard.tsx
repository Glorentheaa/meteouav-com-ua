import React from 'react'
import { CloudLightning } from 'lucide-react'
import { ForecastCard } from './ForecastCard'

export const ShortTermCard: React.FC = () => {
  return (
    <ForecastCard title="Прогноз на найближчий час" icon={CloudLightning}>
      <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center">
        <span className="text-slate-400 text-sm">Таблиця погодних явищ</span>
      </div>
    </ForecastCard>
  )
}
