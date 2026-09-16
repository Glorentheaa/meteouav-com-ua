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
  className?: string
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
  className = '',
}) => {
  const maxFlightLevelM = parseInt(levels, 10)

  // Розбиваємо всі години на ряди по 12 годин з розділенням датами
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

  // Розрахунок критичних зауважень під інфоблоком
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
      <ForecastCard title="Вікна для польотів" icon={Activity} className={className}>
        <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center p-6 min-h-[160px]">
          <span className="text-slate-400 text-xs">Очікування даних часових вікон...</span>
        </div>
      </ForecastCard>
    )
  }

  return (
    <ForecastCard
      title="Вікна для польотів"
      icon={Activity}
      className={className}
      criticalNotice={criticalNotice}
    >
      <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
        {/* Компактна легенда кольорів */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/60 pb-2 mb-2 px-0.5 shrink-0">
          <span className="font-semibold text-slate-600 dark:text-slate-300">Готовність (по 12 год):</span>
          <div className="flex items-center gap-2.5 text-[10px] font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 shadow-2xs" />
              <span className="text-emerald-700 dark:text-emerald-400">Можна</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 shadow-2xs" />
              <span className="text-amber-700 dark:text-amber-400">Увага</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 shadow-2xs" />
              <span className="text-rose-700 dark:text-rose-400">Заборонено</span>
            </span>
          </div>
        </div>

        {/* Контейнер зі скролом аналогічний першим двом блокам */}
        <div className="overflow-x-auto overflow-y-auto max-h-[310px] rounded-lg border border-slate-200 dark:border-slate-700 select-none p-2 flex flex-col gap-2.5 bg-white dark:bg-slate-900/40">
          {rows.map((row, rIdx) => (
            <div
              key={rIdx}
              className="bg-slate-50/80 dark:bg-slate-900/60 rounded-md border border-slate-200 dark:border-slate-800 p-2 flex flex-col gap-1.5"
            >
              {/* Розділювач дати зі шрифтами та стилем перших блоків */}
              <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between px-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{row.label}</span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">12 год</span>
              </div>

              {/* Таблиця на 12 колонок часу з порожніми кольоровими ячейками */}
              <div className="overflow-x-auto pb-0.5">
                <table className="w-full text-[10px] text-center border-collapse table-fixed min-w-[340px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-800/60">
                      {row.slots.map((slot, sIdx) => (
                        <th
                          key={sIdx}
                          className="text-[10px] font-bold text-slate-600 dark:text-slate-300 py-1 px-0.5 whitespace-nowrap"
                        >
                          {slot.time}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {row.slots.map((slot, sIdx) => {
                        let colorClass = 'bg-emerald-500 hover:bg-emerald-400 border border-emerald-600/30'
                        let titleStatus = 'Можна літати'
                        if (slot.severity === 'danger') {
                          colorClass = 'bg-rose-500 hover:bg-rose-400 border border-rose-600/30'
                          titleStatus = 'Заборонено'
                        } else if (slot.severity === 'warning') {
                          colorClass = 'bg-amber-400 hover:bg-amber-300 border border-amber-500/30'
                          titleStatus = 'Увага'
                        }

                        return (
                          <td key={sIdx} className="p-0.5">
                            <div
                              className={`h-6 sm:h-7 w-full rounded-xs shadow-2xs transition-all cursor-default ${colorClass}`}
                              title={`${slot.date} ${slot.time} — ${titleStatus}`}
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
