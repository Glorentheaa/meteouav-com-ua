import React, { useMemo } from 'react'
import { CloudLightning, ArrowUp } from 'lucide-react'
import { ForecastCard } from './ForecastCard'
import type { HourlyForecastPoint } from '../../types/meteoData'
import type { ForecastDepth, ForecastDetail, MeteoWarnings } from '../../types/meteo'
import {
  evaluateWind,
  evaluateGusts,
  evaluateTemp,
  evaluatePrecip,
  evaluateHumidity,
  evaluateFog,
  evaluateKpIndex,
  getSeverityCellClass,
} from '../../utils/warningEvaluator'

interface ShortTermCardProps {
  hourly?: HourlyForecastPoint[]
  warnings: MeteoWarnings
  depth: ForecastDepth
  detail: ForecastDetail
}

export const ShortTermCard: React.FC<ShortTermCardProps> = ({
  hourly = [],
  warnings,
  depth,
  detail,
}) => {
  const depthHours = parseInt(depth, 10)
  const detailHours = parseInt(detail, 10)

  // Фільтрація точок за глибиною та деталізацією
  const filteredPoints = useMemo(() => {
    if (!hourly || hourly.length === 0) return []
    const sliced = hourly.slice(0, depthHours)
    return sliced.filter((_, idx) => idx % detailHours === 0)
  }, [hourly, depthHours, detailHours])

  if (filteredPoints.length === 0) {
    return (
      <ForecastCard title="Прогноз на найближчий час" icon={CloudLightning}>
        <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center p-6">
          <span className="text-slate-400 text-sm">Очікування даних прогнозу... Натисніть «Оновити прогноз»</span>
        </div>
      </ForecastCard>
    )
  }

  return (
    <ForecastCard title="Прогноз на найближчий час" icon={CloudLightning}>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto overflow-y-auto max-h-[380px] rounded-lg border border-slate-200 dark:border-slate-700 select-none">
          <table className="w-full text-xs text-center border-collapse">
            <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 shadow-sm">
              <tr>
                <th className="py-2.5 px-3 sticky left-0 z-30 bg-slate-100 dark:bg-slate-800 text-left whitespace-nowrap min-w-[65px]">
                  Час
                </th>
                <th className="py-2.5 px-2.5 whitespace-nowrap min-w-[60px]" title="Температура повітря (°C)">
                  Темп
                </th>
                <th className="py-2.5 px-3 whitespace-nowrap min-w-[85px]" title="Швидкість вітру біля поверхні 10м (м/с) та напрямок">
                  Вітер (10м)
                </th>
                <th className="py-2.5 px-2.5 whitespace-nowrap min-w-[70px]" title="Пориви вітру (м/с)">
                  Пориви
                </th>
                <th className="py-2.5 px-2.5 whitespace-nowrap min-w-[80px]" title="Висота нижньої кромки хмар (м)">
                  Хмари
                </th>
                <th className="py-2.5 px-2.5 whitespace-nowrap min-w-[65px]" title="Опади за годину (мм)">
                  Опади
                </th>
                <th className="py-2.5 px-2.5 whitespace-nowrap min-w-[65px]" title="Відносна вологість повітря (%)">
                  Волог.
                </th>
                <th className="py-2.5 px-2.5 whitespace-nowrap min-w-[75px]" title="Дальність видимості (км) та туман">
                  Видимість
                </th>
                <th className="py-2.5 px-2.5 whitespace-nowrap min-w-[60px]" title="Геомагнітна активність (КР-індекс, 0-9)">
                  КР-інд.
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-700/60 bg-white dark:bg-slate-900/50">
              {filteredPoints.map((pt) => {
                const tempSev = evaluateTemp(pt.temp, warnings.minTemp, warnings.maxTemp)
                const windSev = evaluateWind(pt.surfaceWind, warnings.wind)
                const gustSev = evaluateGusts(pt.surfaceGusts, warnings.gusts)
                const precipSev = evaluatePrecip(pt.precipMm, warnings.precip)
                const humSev = evaluateHumidity(pt.humidity, warnings.humidity)
                const fogSev = evaluateFog(pt.fogRisk, pt.visibilityKm, warnings.fog, warnings.visibility)
                const kpSev = evaluateKpIndex(pt.kpIndex)

                return (
                  <tr key={pt.timestamp} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Стовпчик часу фіксований ліворуч */}
                    <td className="py-2 px-3 sticky left-0 z-10 bg-slate-50 dark:bg-slate-900 font-semibold text-slate-800 dark:text-slate-200 text-left border-r border-slate-200 dark:border-slate-800">
                      {pt.time}
                    </td>

                    {/* Температура */}
                    <td className={`py-2 px-2.5 ${getSeverityCellClass(tempSev)}`}>
                      {pt.temp > 0 ? `+${pt.temp}` : pt.temp}°
                    </td>

                    {/* Вітер поверхня + стрілка */}
                    <td className={`py-2 px-2.5 ${getSeverityCellClass(windSev)}`}>
                      <div className="flex items-center justify-center gap-1.5">
                        <ArrowUp
                          className="w-3.5 h-3.5 text-slate-500 shrink-0"
                          style={{
                            transform: `rotate(${pt.windDirectionDeg}deg)`,
                            transition: 'transform 0.2s ease',
                          }}
                        />
                        <span>{pt.surfaceWind.toFixed(1)}</span>
                      </div>
                    </td>

                    {/* Пориви */}
                    <td className={`py-2 px-2.5 ${getSeverityCellClass(gustSev)}`}>
                      {pt.surfaceGusts.toFixed(1)}
                    </td>

                    {/* Кромка хмар */}
                    <td className="py-2 px-2.5 text-slate-600 dark:text-slate-400">
                      {pt.cloudBaseM} м
                    </td>

                    {/* Опади */}
                    <td className={`py-2 px-2.5 ${getSeverityCellClass(precipSev)}`}>
                      {pt.precipMm > 0 ? `${pt.precipMm.toFixed(1)}` : '—'}
                    </td>

                    {/* Вологість */}
                    <td className={`py-2 px-2.5 ${getSeverityCellClass(humSev)}`}>
                      {pt.humidity}%
                    </td>

                    {/* Видимість / Туман */}
                    <td className={`py-2 px-2.5 ${getSeverityCellClass(fogSev)}`}>
                      {pt.fogRisk === 'high' ? (
                        <span className="text-[10px] uppercase font-bold text-rose-600">Туман</span>
                      ) : (
                        `${pt.visibilityKm.toFixed(1)} км`
                      )}
                    </td>

                    {/* КР-індекс */}
                    <td className={`py-2 px-2.5 ${getSeverityCellClass(kpSev)}`}>
                      <span className="font-semibold">{pt.kpIndex}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ForecastCard>
  )
}
