import React, { useMemo } from 'react'
import { Activity, CheckCircle2, AlertTriangle, XCircle, Compass } from 'lucide-react'
import { ForecastCard } from './ForecastCard'
import type { HourlyForecastPoint } from '../../types/meteoData'
import type { MeteoWarnings, FlightLevels } from '../../types/meteo'
import { evaluateHour } from '../../utils/warningEvaluator'

interface FlightWindowsCardProps {
  hourly?: HourlyForecastPoint[]
  warnings: MeteoWarnings
  levels?: FlightLevels
}

export const FlightWindowsCard: React.FC<FlightWindowsCardProps> = ({
  hourly = [],
  warnings,
  levels = '300',
}) => {
  const maxFlightLevelM = parseInt(levels, 10)

  // Беремо перші 12 годин для стрічки
  const twelveHours = useMemo(() => {
    return hourly.slice(0, 12).map((pt) => {
      const evaluation = evaluateHour(pt, warnings, maxFlightLevelM)
      return {
        point: pt,
        evaluation,
      }
    })
  }, [hourly, warnings, maxFlightLevelM])

  if (twelveHours.length === 0) {
    return (
      <ForecastCard title="Вікна для польотів (найближчі 12 годин)" icon={Activity}>
        <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center p-6">
          <span className="text-slate-400 text-sm">Очікування даних часових вікон...</span>
        </div>
      </ForecastCard>
    )
  }

  return (
    <ForecastCard
      title="Вікна для польотів (найближчі 12 годин)"
      icon={Activity}
      className="lg:col-span-2"
    >
      <div className="flex flex-col gap-3">
        {/* Пояснення кольорів */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/60 pb-2">
          <span>Стрічка готовності до вильоту по годинах:</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Льотно</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Увага</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Небезпечно</span>
            </span>
          </div>
        </div>

        {/* 12 годин у ряд (горизонтальний скрол на малих, грід на великих) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 overflow-x-auto pb-1">
          {twelveHours.map(({ point, evaluation }) => {
            const { severity, issues } = evaluation

            let bgBorderClass = 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
            let Icon = CheckCircle2
            let iconColor = 'text-emerald-600 dark:text-emerald-400'
            let statusText = 'GO'

            if (severity === 'danger') {
              bgBorderClass = 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/80 text-rose-900 dark:text-rose-300'
              Icon = XCircle
              iconColor = 'text-rose-600 dark:text-rose-400'
              statusText = 'NO-GO'
            } else if (severity === 'warning') {
              bgBorderClass = 'bg-amber-50 dark:bg-amber-950/25 border-amber-300 dark:border-amber-800/70 text-amber-900 dark:text-amber-300'
              Icon = AlertTriangle
              iconColor = 'text-amber-600 dark:text-amber-400'
              statusText = 'CAUTION'
            }

            return (
              <div
                key={point.timestamp}
                className={`p-2 rounded-lg border flex flex-col items-center justify-between text-center transition-all duration-200 hover:shadow-md cursor-default min-h-[110px] ${bgBorderClass}`}
                title={issues.length > 0 ? `Обмеження:\n• ${issues.join('\n• ')}` : 'Умови сприятливі для вильоту'}
              >
                {/* Час */}
                <span className="text-xs font-bold">{point.time}</span>

                {/* Статус іконка */}
                <div className="my-1 flex flex-col items-center">
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                  <span className="text-[10px] font-black tracking-wider uppercase mt-0.5">
                    {statusText}
                  </span>
                </div>

                {/* Короткі параметри години */}
                <div className="text-[10px] w-full flex flex-col gap-0.5 border-t border-black/10 dark:border-white/10 pt-1">
                  <span className="font-semibold" title="Швидкість вітру біля поверхні / пориви">
                    {point.surfaceWind.toFixed(1)}/{point.surfaceGusts.toFixed(0)} м/с
                  </span>
                  {point.kpIndex >= 4 && (
                    <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 flex items-center justify-center gap-0.5" title={`КР-індекс ${point.kpIndex} (геомагнітні збурення)`}>
                      <Compass className="w-2.5 h-2.5" /> КР:{point.kpIndex}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </ForecastCard>
  )
}
