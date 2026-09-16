import React, { useMemo } from 'react'
import { Wind, ArrowUp } from 'lucide-react'
import { ForecastCard } from './ForecastCard'
import type { HourlyForecastPoint, AltitudeLevel } from '../../types/meteoData'
import type { ForecastDepth, ForecastDetail, FlightLevels, MeteoWarnings } from '../../types/meteo'
import {
  evaluateWind,
  evaluateGusts,
  getSeverityCellClass,
} from '../../utils/warningEvaluator'

interface WindAltitudeCardProps {
  hourly?: HourlyForecastPoint[]
  warnings: MeteoWarnings
  levels: FlightLevels
  depth: ForecastDepth
  detail: ForecastDetail
}

const ALL_POSSIBLE_LEVELS: readonly AltitudeLevel[] = [
  10, 50, 80, 120, 200, 300, 500, 800, 1000, 1500, 2000, 3000,
]

export const WindAltitudeCard: React.FC<WindAltitudeCardProps> = ({
  hourly = [],
  warnings,
  levels,
  depth,
  detail,
}) => {
  const depthHours = parseInt(depth, 10)
  const detailHours = parseInt(detail, 10)
  const maxLevelM = parseInt(levels, 10)

  // Фільтруємо ешелони за максимальним налаштуванням користувача (до 300/500/800/3000м)
  const activeLevels = useMemo(() => {
    return ALL_POSSIBLE_LEVELS.filter((alt) => alt <= maxLevelM)
  }, [maxLevelM])

  // Фільтруємо часові мітки
  const filteredPoints = useMemo(() => {
    if (!hourly || hourly.length === 0) return []
    const sliced = hourly.slice(0, depthHours)
    return sliced.filter((_, idx) => idx % detailHours === 0)
  }, [hourly, depthHours, detailHours])

  // Розрахунок критичних факторів по ешелонах (Вимога 7)
  const criticalNotice = useMemo(() => {
    if (filteredPoints.length === 0) return null
    let maxWindFound = 0
    let maxGustFound = 0
    let dangerAltitudes: number[] = []

    for (const pt of filteredPoints) {
      for (const alt of activeLevels) {
        const lvlData = pt.levels[alt]
        if (!lvlData) continue
        if (lvlData.speed > maxWindFound) maxWindFound = lvlData.speed
        if (lvlData.gusts && lvlData.gusts > maxGustFound) maxGustFound = lvlData.gusts

        const windSev = evaluateWind(lvlData.speed, warnings.wind)
        const gustSev = lvlData.gusts ? evaluateGusts(lvlData.gusts, warnings.gusts) : 'safe'
        if ((windSev === 'danger' || gustSev === 'danger') && !dangerAltitudes.includes(alt)) {
          dangerAltitudes.push(alt)
        }
      }
    }

    if (dangerAltitudes.length > 0) {
      return `Критичний вітер/пориви на ешелонах: ${dangerAltitudes.sort((a,b)=>a-b).map(a => `${a}м`).join(', ')} (макс. швидкість ${maxWindFound.toFixed(0)} м/с, пориви ${maxGustFound.toFixed(0)} м/с)`
    }
    if (maxWindFound >= warnings.wind * 0.8 || maxGustFound >= warnings.gusts * 0.8) {
      return `Увага: посилення вітру до ${maxWindFound.toFixed(0)} м/с (наближення до ліміту)`
    }
    return null
  }, [filteredPoints, activeLevels, warnings])

  if (filteredPoints.length === 0) {
    return (
      <ForecastCard title="Вітер по ешелонах" icon={Wind}>
        <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center p-6 min-h-[160px]">
          <span className="text-slate-400 text-xs">Очікування даних ешелонів...</span>
        </div>
      </ForecastCard>
    )
  }

  return (
    <ForecastCard
      title="Вітер по ешелонах"
      icon={Wind}
      criticalNotice={criticalNotice}
    >
      <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[360px] rounded-lg border border-slate-200 dark:border-slate-700 select-none">
          <table className="w-full text-[10px] text-center border-collapse">
            <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 shadow-sm">
              <tr>
                <th className="py-2 px-2 sticky left-0 z-30 bg-slate-100 dark:bg-slate-800 text-left whitespace-nowrap min-w-[50px] border-r border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold">Час</span>
                </th>
                {activeLevels.map((alt) => (
                  <th
                    key={alt}
                    className="py-2 px-1 whitespace-nowrap min-w-[54px] text-center"
                    title={`Ешелон ${alt}м${alt <= 500 ? ' (швидкість / пориви м/с)' : ' (швидкість м/с)'}`}
                  >
                    <span className="font-bold">{alt}м</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-700/50 bg-white dark:bg-slate-900/40">
              {filteredPoints.map((pt) => (
                <tr key={pt.timestamp} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Час (фіксований) */}
                  <td className="py-1.5 px-2 sticky left-0 z-10 bg-slate-50 dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 text-left border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                    {pt.time}
                  </td>

                  {/* Ешелони */}
                  {activeLevels.map((alt) => {
                    const levelData = pt.levels[alt]
                    if (!levelData) {
                      return (
                        <td key={alt} className="py-1.5 px-1 text-slate-400">
                          —
                        </td>
                      )
                    }

                    // Оцінка безпеки вітру та поривів
                    const windSev = evaluateWind(levelData.speed, warnings.wind)
                    const gustSev = levelData.gusts ? evaluateGusts(levelData.gusts, warnings.gusts) : 'safe'
                    const cellSev = windSev === 'danger' || gustSev === 'danger'
                      ? 'danger'
                      : windSev === 'warning' || gustSev === 'warning'
                      ? 'warning'
                      : 'safe'

                    // Формування рядка швидкості: 12/15 або 12
                    const valueStr = levelData.gusts !== undefined
                      ? `${levelData.speed.toFixed(0)}/${levelData.gusts.toFixed(0)}`
                      : `${levelData.speed.toFixed(0)}`

                    return (
                      <td
                        key={alt}
                        className={`py-1.5 px-1 transition-colors ${getSeverityCellClass(cellSev)}`}
                      >
                        <div className="flex items-center justify-center gap-0.5 whitespace-nowrap">
                          {/* Стрілка напрямку вітру */}
                          <ArrowUp
                            className="w-2.5 h-2.5 shrink-0 opacity-75"
                            style={{ transform: `rotate(${levelData.directionDeg}deg)` }}
                          />

                          {/* Всі цифри підсвічуються єдиним стилем статусу (Вимога 2) */}
                          <span className="font-semibold tracking-tight">
                            {valueStr}
                          </span>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ForecastCard>
  )
}
