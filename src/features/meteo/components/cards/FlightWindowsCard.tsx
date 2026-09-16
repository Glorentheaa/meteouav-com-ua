import React from 'react'
import { Activity } from 'lucide-react'
import { ForecastCard } from './ForecastCard'

export const FlightWindowsCard: React.FC = () => {
  return (
    <ForecastCard title="Вікна для польотів" icon={Activity}>
      <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center">
        <span className="text-slate-400 text-sm">Таймлайн безпечних зон</span>
      </div>
    </ForecastCard>
  )
}
