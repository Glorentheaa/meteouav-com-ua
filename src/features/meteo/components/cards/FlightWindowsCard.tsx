import React, { useMemo } from 'react'
import { Activity } from 'lucide-react'
import { ForecastCard } from './ForecastCard'
import type { HourlyForecastPoint } from '../../types/meteoData'
import type { MeteoWarnings, FlightLevels } from '../../types/meteo'
import { evaluateHour } from '../../utils/warningEvaluator'

interface FlightWindowsCardProps {
  hourly?: HourlyForecastPoint[]
  warnings: MeteoWarnings
  levels?: FlightLevels
}

interface WindowSlot {
  time: string
  date: string
  severity: 'safe' | 'warning' | 'danger'
}

interface WindowRow {
  label: string
  slots: WindowSlot[]
}

export const FlightWindowsCard: React.FC<FlightWindowsCardProps> = ({
  hourly = [],
  warnings,
  levels = '300',
}) => {
  const maxFlightLevelM = parseInt(levels, 10)

  // Розбиваємо всі години на ряди по 12 годин з розділенням датами (Вимога 3)
  const rows: WindowRow[] = useMemo(() => {
    if (!hourly || hourly.length === 0) return []

    const result: WindowRow[] = []
    const chunkSize = 12

    for (let i = 0; i < hourly.length; i += chunkSize) {
      const chunk = hourly.slice(i, i + chunkSize)
      if (chunk.length === 0) continue

      const firstPoint = chunk[0]
      const lastPoint = chunk[chunk.length - 1]

      // Форматування мітки дати та діапазону годин
      const dateLabel = `${firstPoint.fullDate} (${firstPoint.time} — ${lastPoint.time})`

      const slots: WindowSlot[] = chunk.map((pt) => {
        const evaluation = evaluateHour(pt, warnings, maxFlightLevelM)
        return {
          time: pt.time,
          date: pt.fullDate,
          severity: evaluation.severity,
        }
      })

      result.push({
        label: dateLabel,
        slots,
      })
    }

    return result
  }, [hourly, warnings, maxFlightLevelM])

  // Розрахунок критичних зауважень під інфоблоком (Вимога 7)
  const criticalNotice = useMemo(() => {
    if (!hourly || hourly.length === 0) return null
    let dangerCount = 0
    let warningCount = 0

    for (const pt of hourly) {
      const ev = evaluateHour(pt, warnings, maxFlightLevelM)
      if (ev.severity === 'danger') dangerCount++
      else if (ev.severity === 'warning') warningCount++
    }

    if (dangerCount > 0) {
      return `Критичні фактори: ${dangerCount} з ${hourly.length} годин не придатні для польотів за заданими лімітами`
    }
    if (warningCount > 0) {
      return `Зверніть увагу: ${warningCount} годин мають погодні фактори наближені до критичних`
    }
    return null
  }, [hourly, warnings, maxFlightLevelM])

  if (rows.length === 0) {
    return (
      <ForecastCard title="Вікна для польотів" icon={Activity}>
        <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center p-6 min-h-[140px]">
          <span className="text-slate-400 text-xs">Очікування даних часових вікон...</span>
        </div>
      </ForecastCard>
    )
  }

  return (
    <ForecastCard
      title="Вікна для польотів"
      icon={Activity}
      className="lg:col-span-2"
      criticalNotice={criticalNotice}
    >
      <div className="flex flex-col gap-3.5 w-full">
        {/* Компактна легенда кольорів */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/60 pb-1.5">
          <span>Стрічка по 12 годин у ряд:</span>
          <div className="flex items-center gap-3 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span>Можна літати</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
              <span>Увага</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              <span>Заборонено</span>
            </span>
          </div>
        </div>

        {/* Табличні ряди по 12 годин з візуальним розділенням датами */}
        <div className="flex flex-col gap-3">
          {rows.map((row, rIdx) => (
            <div
              key={rIdx}
              className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5"
            >
              {/* Візуальний розділювач дати */}
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{row.label}</span>
              </div>

              {/* Таблиця: 12 колонок часу + 12 порожніх кольорових ячеєк */}
              <div className="overflow-x-auto pb-0.5">
                <table className="w-full border-collapse text-center table-fixed min-w-[360px]">
                  <thead>
                    <tr>
                      {row.slots.map((slot, sIdx) => (
                        <th
                          key={sIdx}
                          className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 pb-1 px-0.5"
                        >
                          {slot.time}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {row.slots.map((slot, sIdx) => {
                        let colorClass = 'bg-emerald-500 hover:bg-emerald-400'
                        if (slot.severity === 'danger') {
                          colorClass = 'bg-rose-500 hover:bg-rose-400'
                        } else if (slot.severity === 'warning') {
                          colorClass = 'bg-amber-400 hover:bg-amber-300'
                        }

                        return (
                          <td key={sIdx} className="p-0.5">
                            {/* Порожня кольорова ячейка (Вимога 3) */}
                            <div
                              className={`h-7 w-full rounded-md shadow-xs transition-colors cursor-default ${colorClass}`}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ForecastCard>
  )
}
