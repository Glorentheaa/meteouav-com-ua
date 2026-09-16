import React from 'react'
import { Activity } from 'lucide-react'
import { ForecastCard } from './ForecastCard'

export const MeteorologistCard: React.FC = () => {
  return (
    <ForecastCard title="Висновок від метеолога" icon={Activity}>
      <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 italic">
          "Очікується погіршення умов після 14:00 через проходження холодного фронту.
          Прогнозуються пориви вітру до 16 м/с на висоті 200м."
        </p>
      </div>
    </ForecastCard>
  )
}
