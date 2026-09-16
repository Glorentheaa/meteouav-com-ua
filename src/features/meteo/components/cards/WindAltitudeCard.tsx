import React, { useMemo } from 'react'
import { Wind, ArrowUp, Cloud } from 'lucide-react'
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

  if (filteredPoints.length === 0) {
    return (
      <ForecastCard title="Вітер та кромка хмар по ешелонах" icon={Wind}>
        <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center p-6">
          <span className="text-slate-400 text-sm">Очікування даних ешелонів...</span>
        </div>
      </ForecastCard>
    )
  }

  return (
    <ForecastCard title="Вітер та кромка хмар по ешелонах" icon={Wind}>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto overflow-y-auto max-h-[380px] rounded-lg border border-slate-200 dark:border-slate-700 select-none">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 shadow-sm">
              <tr>
                <th className="py-2.5 px-3 sticky left-0 z-30 bg-slate-100 dark:bg-slate-800 text-left whitespace-nowrap min-w-[65px]">
                  Час
                </th>
                {activeLevels.map((alt) => (
                  <th
                    key={alt}
                    className="py-2.5 px-2.5 whitespace-nowrap min-w-[80px]"
                    title={`Ешелон ${alt}м${alt <= 500 ? ' (вітер / пориви м/с)' : ' (тільки швидкість м/с)'}`}
                  >
                    {alt}м
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-700/60 bg-white dark:bg-slate-900/50">
              {filteredPoints.map((pt) => (
                <tr key={pt.timestamp} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Стовпчик часу фіксований зліва */}
                  <td className="py-2 px-3 sticky left-0 z-10 bg-slate-50 dark:bg-slate-900 font-semibold text-slate-800 dark:text-slate-200 text-left border-r border-slate-200 dark:border-slate-800">
                    {pt.time}
                  </td>

                  {/* Ешелони */}
                  {activeLevels.map((alt) => {
                    const levelData = pt.levels[alt]
                    if (!levelData) {
                      return (
                        <td key={alt} className="py-2 px-2 text-slate-400">
                          —
                        </td>
                      )
                    }

                    // Оцінка небезпеки вітру та поривів
                    const windSev = evaluateWind(levelData.speed, warnings.wind)
                    const gustSev = levelData.gusts ? evaluateGusts(levelData.gusts, warnings.gusts) : 'safe'
                    const cellSev = windSev === 'danger' || gustSev === 'danger'
                      ? 'danger'
                      : windSev === 'warning' || gustSev === 'warning'
                      ? 'warning'
                      : 'safe'

                    // Перевірка входження в шар хмар (кромка хмар нижче або дорівнює висоті)
                    const isInsideCloud = pt.cloudBaseM <= alt

                    return (
                      <td
                        key={alt}
                        className={`py-2 px-2 transition-colors relative ${getSeverityCellClass(cellSev)}`}
                        title={`Ешелон ${alt}м: швидкість ${levelData.speed.toFixed(1)} м/с${
                          levelData.gusts ? `, порив ${levelData.gusts.toFixed(1)} м/с` : ''
                        }${isInsideCloud ? `, хмара (нижня кромка ${pt.cloudBaseM}м)` : ''}`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {/* Стрілка напрямку вітру */}
                          <ArrowUp
                            className="w-3 h-3 text-slate-500 shrink-0"
                            style={{
                              transform: `rotate(${levelData.directionDeg}deg)`,
                              transition: 'transform 0.2s ease',
                            }}
                          />

                          {/* Швидкість / пориви */}
                          <span className="font-medium whitespace-nowrap">
                            {levelData.speed.toFixed(1)}
                            {levelData.gusts !== undefined && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-0.5">
                                /{levelData.gusts.toFixed(0)}
                              </span>
                            )}
                          </span>

                          {/* Позначка входження в хмару */}
                          {isInsideCloud && (
                            <span title={`Кромка хмар на ${pt.cloudBaseM}м`} className="inline-flex">
                              <Cloud className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 shrink-0" />
                            </span>
                          )}
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
