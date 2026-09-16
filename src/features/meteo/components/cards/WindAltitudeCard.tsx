import React from 'react'
import { Wind } from 'lucide-react'
import { ForecastCard } from './ForecastCard'

export const WindAltitudeCard: React.FC = () => {
  return (
    <ForecastCard title="Вітер та кромка хмар по ешелонах" icon={Wind}>
      <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center">
        <span className="text-slate-400 text-sm">Графік шарів вітру (0-1000м)</span>
      </div>
    </ForecastCard>
  )
}
