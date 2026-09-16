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

  // Розрахунок критичних попереджень для цього блоку (Вимога 7)
  const criticalNotice = useMemo(() => {
    if (filteredPoints.length === 0) return null
    const criticalList: string[] = []
    const warningList: string[] = []

    for (const pt of filteredPoints) {
      if (evaluateWind(pt.surfaceWind, warnings.wind) === 'danger') {
        const msg = `Вітер до ${pt.surfaceWind.toFixed(1)} м/с (ліміт ${warnings.wind})`
        if (!criticalList.includes(msg)) criticalList.push(msg)
      } else if (evaluateWind(pt.surfaceWind, warnings.wind) === 'warning') {
        const msg = `Вітер наближається до ліміту (${pt.surfaceWind.toFixed(1)} м/с)`
        if (!warningList.includes(msg)) warningList.push(msg)
      }

      if (evaluateGusts(pt.surfaceGusts, warnings.gusts) === 'danger') {
        const msg = `Пориви до ${pt.surfaceGusts.toFixed(1)} м/с (ліміт ${warnings.gusts})`
        if (!criticalList.includes(msg)) criticalList.push(msg)
      }

      if (evaluateFog(pt.fogRisk, pt.visibilityKm, warnings.fog, warnings.visibility) === 'danger') {
        const msg = pt.fogRisk === 'high' ? 'Високий ризик туману' : `Видимість менше ${warnings.visibility} км`
        if (!criticalList.includes(msg)) criticalList.push(msg)
      }

      if (evaluatePrecip(pt.precipMm, warnings.precip) === 'danger') {
        const msg = `Опади ${pt.precipMm.toFixed(1)} мм/год`
        if (!criticalList.includes(msg)) criticalList.push(msg)
      }

      if (evaluateHumidity(pt.humidity, warnings.humidity) === 'danger') {
        const msg = `Вологість ${pt.humidity}% (ліміт ${warnings.humidity}%)`
        if (!criticalList.includes(msg)) criticalList.push(msg)
      }
    }

    if (criticalList.length > 0) {
      return `Критичні фактори: ${criticalList.slice(0, 3).join(', ')}`
    }
    if (warningList.length > 0) {
      return `Зверніть увагу: ${warningList.slice(0, 2).join(', ')}`
    }
    return null
  }, [filteredPoints, warnings])

  if (filteredPoints.length === 0) {
    return (
      <ForecastCard title="Прогноз на найближчий час" icon={CloudLightning}>
        <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center p-6 min-h-[160px]">
          <span className="text-slate-400 text-xs">Очікування даних прогнозу... Натисніть «Оновити прогноз»</span>
        </div>
      </ForecastCard>
    )
  }

  return (
    <ForecastCard
      title="Прогноз на найближчий час"
      icon={CloudLightning}
      criticalNotice={criticalNotice}
    >
      <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[360px] rounded-lg border border-slate-200 dark:border-slate-700 select-none">
          <table className="w-full text-[10px] text-center border-collapse">
            <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 shadow-sm">
              <tr className="h-24">
                {/* Стовпчик часу з горизонтальним текстом */}
                <th className="py-2 px-2 sticky left-0 z-30 bg-slate-100 dark:bg-slate-800 text-left align-bottom whitespace-nowrap min-w-[50px] border-r border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-[11px] font-bold">Час</span>
                </th>

                {/* Вертикальні заголовки параметрів */}
                <th className="py-1 px-1.5 align-bottom min-w-[32px]">
                  <div className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap mx-auto pb-1 tracking-tight" title="Температура повітря (°C)">
                    Температура
                  </div>
                </th>
                <th className="py-1 px-1.5 align-bottom min-w-[38px]">
                  <div className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap mx-auto pb-1 tracking-tight" title="Швидкість вітру біля поверхні (10м, м/с)">
                    Вітер (10м)
                  </div>
                </th>
                <th className="py-1 px-1.5 align-bottom min-w-[34px]">
                  <div className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap mx-auto pb-1 tracking-tight" title="Пориви вітру (10м, м/с)">
                    Пориви
                  </div>
                </th>
                <th className="py-1 px-1.5 align-bottom min-w-[36px]">
                  <div className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap mx-auto pb-1 tracking-tight" title="Висота нижньої кромки хмар (м)">
                    Кромка хмар
                  </div>
                </th>
                <th className="py-1 px-1.5 align-bottom min-w-[32px]">
                  <div className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap mx-auto pb-1 tracking-tight" title="Опади за годину (мм)">
                    Опади
                  </div>
                </th>
                <th className="py-1 px-1.5 align-bottom min-w-[32px]">
                  <div className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap mx-auto pb-1 tracking-tight" title="Відносна вологість (%)">
                    Вологість
                  </div>
                </th>
                <th className="py-1 px-1.5 align-bottom min-w-[34px]">
                  <div className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap mx-auto pb-1 tracking-tight" title="Видимість (км)">
                    Видимість
                  </div>
                </th>
                <th className="py-1 px-1.5 align-bottom min-w-[32px]">
                  <div className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap mx-auto pb-1 tracking-tight" title="Наявність та ризик туману">
                    Туман
                  </div>
                </th>
                <th className="py-1 px-1.5 align-bottom min-w-[30px]">
                  <div className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap mx-auto pb-1 tracking-tight" title="Геомагнітна активність КР-індекс (0-9)">
                    КР-індекс
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-700/50 bg-white dark:bg-slate-900/40 font-medium">
              {filteredPoints.map((pt) => {
                const tempSev = evaluateTemp(pt.temp, warnings.minTemp, warnings.maxTemp)
                const windSev = evaluateWind(pt.surfaceWind, warnings.wind)
                const gustSev = evaluateGusts(pt.surfaceGusts, warnings.gusts)
                const precipSev = evaluatePrecip(pt.precipMm, warnings.precip)
                const humSev = evaluateHumidity(pt.humidity, warnings.humidity)
                const fogSev = evaluateFog(pt.fogRisk, pt.visibilityKm, warnings.fog, warnings.visibility)
                const kpSev = evaluateKpIndex(pt.kpIndex)

                // Стан туману:
                const fogText = pt.fogRisk === 'high' ? 'Густий' : pt.fogRisk === 'low' ? 'Слабк.' : '—'

                return (
                  <tr key={pt.timestamp} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Час */}
                    <td className="py-1.5 px-2 sticky left-0 z-10 bg-slate-50 dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 text-left border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                      {pt.time}
                    </td>

                    {/* Температура */}
                    <td className={`py-1.5 px-1 ${getSeverityCellClass(tempSev)}`}>
                      {pt.temp > 0 ? `+${pt.temp}` : pt.temp}°
                    </td>

                    {/* Вітер (10м) + стрілка */}
                    <td className={`py-1.5 px-1 ${getSeverityCellClass(windSev)}`}>
                      <div className="flex items-center justify-center gap-0.5">
                        <ArrowUp
                          className="w-2.5 h-2.5 shrink-0 opacity-70"
                          style={{ transform: `rotate(${pt.windDirectionDeg}deg)` }}
                        />
                        <span>{pt.surfaceWind.toFixed(1)}</span>
                      </div>
                    </td>

                    {/* Пориви */}
                    <td className={`py-1.5 px-1 ${getSeverityCellClass(gustSev)}`}>
                      {pt.surfaceGusts.toFixed(1)}
                    </td>

                    {/* Кромка хмар */}
                    <td className="py-1.5 px-1 text-slate-600 dark:text-slate-400">
                      {pt.cloudBaseM}
                    </td>

                    {/* Опади */}
                    <td className={`py-1.5 px-1 ${getSeverityCellClass(precipSev)}`}>
                      {pt.precipMm > 0 ? pt.precipMm.toFixed(1) : '—'}
                    </td>

                    {/* Вологість */}
                    <td className={`py-1.5 px-1 ${getSeverityCellClass(humSev)}`}>
                      {pt.humidity}%
                    </td>

                    {/* Видимість */}
                    <td className={`py-1.5 px-1 ${getSeverityCellClass(fogSev)}`}>
                      {pt.visibilityKm.toFixed(1)}
                    </td>

                    {/* Туман */}
                    <td className={`py-1.5 px-1 ${getSeverityCellClass(fogSev)}`}>
                      {fogText}
                    </td>

                    {/* КР-індекс */}
                    <td className={`py-1.5 px-1 ${getSeverityCellClass(kpSev)}`}>
                      {pt.kpIndex}
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
