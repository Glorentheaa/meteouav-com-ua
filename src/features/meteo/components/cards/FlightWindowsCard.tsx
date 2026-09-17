import React, { useMemo, useState } from 'react'
import { Activity } from 'lucide-react'
import { ForecastCard } from './ForecastCard'
import type { HourlyForecastPoint, WarningSeverity } from '../../types/meteoData'
import type { MeteoWarnings, FlightLevels, ForecastDepth, ForecastDetail } from '../../types/meteo'
import { evaluateHour } from '../../utils/warningEvaluator'

interface FlightWindowsCardProps {
  hourly?: HourlyForecastPoint[]
  warnings: MeteoWarnings
  levels?: FlightLevels
  depth?: ForecastDepth
  detail?: ForecastDetail
  className?: string
}

type DialSectorStatus = 'past' | 'ideal' | 'favorable' | 'attention' | 'warning' | 'danger' | 'no_data'

interface DialSectorData {
  id: string
  startHour: number
  endHour: number
  timeRangeStr: string
  status: DialSectorStatus
  issues: string[]
  startAngle: number
  endAngle: number
}

/**
 * Допоміжний розрахунок SVG шляху сектора кільця (Donut Arc)
 */
function getArcPath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngleDeg: number,
  endAngleDeg: number
): string {
  const rad = Math.PI / 180
  const a1 = startAngleDeg * rad
  const a2 = endAngleDeg * rad

  const x1o = cx + rOuter * Math.cos(a1)
  const y1o = cy + rOuter * Math.sin(a1)
  const x2o = cx + rOuter * Math.cos(a2)
  const y2o = cy + rOuter * Math.sin(a2)

  const x2i = cx + rInner * Math.cos(a2)
  const y2i = cy + rInner * Math.sin(a2)
  const x1i = cx + rInner * Math.cos(a1)
  const y1i = cy + rInner * Math.sin(a1)

  // Перевірка на велику дугу (> 180 градусів)
  const largeArc = endAngleDeg - startAngleDeg > 180 ? 1 : 0

  return `M ${x1o.toFixed(2)} ${y1o.toFixed(2)} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2o.toFixed(2)} ${y2o.toFixed(2)} L ${x2i.toFixed(2)} ${y2i.toFixed(2)} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x1i.toFixed(2)} ${y1i.toFixed(2)} Z`
}

/**
 * Кольорова заливка та обводка для кожного статусу сектора циферблату
 */
function getSectorColor(status: DialSectorStatus): { fill: string; stroke: string } {
  switch (status) {
    case 'past':
      return {
        fill: 'fill-slate-300 dark:fill-slate-700 opacity-60',
        stroke: 'stroke-slate-400 dark:stroke-slate-600',
      }
    case 'ideal':
      return {
        fill: 'fill-emerald-500 hover:fill-emerald-400',
        stroke: 'stroke-emerald-600/40',
      }
    case 'favorable':
      return {
        fill: 'fill-emerald-700 hover:fill-emerald-600',
        stroke: 'stroke-emerald-800/40',
      }
    case 'attention':
      return {
        fill: 'fill-yellow-400 hover:fill-yellow-300',
        stroke: 'stroke-yellow-500/40',
      }
    case 'warning':
      return {
        fill: 'fill-orange-500 hover:fill-orange-400',
        stroke: 'stroke-orange-600/40',
      }
    case 'danger':
      return {
        fill: 'fill-rose-500 hover:fill-rose-400',
        stroke: 'stroke-rose-600/40',
      }
    case 'no_data':
    default:
      return {
        fill: 'fill-slate-100 dark:fill-slate-800/40 opacity-40',
        stroke: 'stroke-slate-200 dark:stroke-slate-700/40',
      }
  }
}

/**
 * Допоміжний метод формування спрощеного тексту статусу без числових параметрів
 * Наприклад: "Небезпечно: Пориви, вітер", "Увага: Пориви", "Ідеально: В нормі"
 */
function getSimplifiedIssueText(
  status: DialSectorStatus,
  issues: string[]
): { title: string; subtitle?: string } {
  const statusLabels: Record<DialSectorStatus, string> = {
    past: 'Минулий час',
    ideal: 'Ідеально',
    favorable: 'Сприятливо',
    attention: 'Увага',
    warning: 'Наближення',
    danger: 'Небезпечно',
    no_data: 'Немає даних',
  }

  const baseLabel = statusLabels[status] || 'Умови в нормі'

  if (status === 'past' || status === 'no_data') {
    return { title: baseLabel }
  }

  if (status === 'ideal' || status === 'favorable') {
    return { title: baseLabel, subtitle: 'В нормі' }
  }

  // Для attention, warning, danger витягуємо виключно назви чинників без цифр та параметрів
  const detectedFactors: string[] = []
  for (const issue of issues) {
    const lower = issue.toLowerCase()
    if (lower.includes('порив') && !detectedFactors.includes('Пориви')) {
      detectedFactors.push('Пориви')
    }
    if (lower.includes('вітер') && !detectedFactors.includes('Вітер')) {
      detectedFactors.push('Вітер')
    }
    if (lower.includes('опад') && !detectedFactors.includes('Опади')) {
      detectedFactors.push('Опади')
    }
    if (lower.includes('туман') && !detectedFactors.includes('Туман')) {
      detectedFactors.push('Туман')
    } else if (lower.includes('видимість') && !detectedFactors.includes('Видимість') && !detectedFactors.includes('Туман')) {
      detectedFactors.push('Видимість')
    }
    if (lower.includes('волог') && !detectedFactors.includes('Вологість')) {
      detectedFactors.push('Вологість')
    }
    if (lower.includes('температур') && !detectedFactors.includes('Температура')) {
      detectedFactors.push('Температура')
    }
    if (lower.includes('кр') && !detectedFactors.includes('КР-індекс')) {
      detectedFactors.push('КР-індекс')
    }
    if (lower.includes('хмар') && !detectedFactors.includes('Хмарність')) {
      detectedFactors.push('Хмарність')
    }
  }

  // Якщо нічого не збіглося зі словником, беремо перше слово з issue без цифр
  if (detectedFactors.length === 0 && issues.length > 0) {
    for (const issue of issues) {
      const clean = issue
        .replace(/\s*\([^)]*\)/g, '')
        .replace(/[0-9.,/:><°%—–-]/g, '')
        .trim()
        .split(' ')[0]
      if (clean && !detectedFactors.includes(clean)) {
        detectedFactors.push(clean)
      }
    }
  }

  const factorsStr =
    detectedFactors.length > 0
      ? detectedFactors
          .slice(0, 2)
          .map((f, i) => (i === 0 ? f : f.toLowerCase()))
          .join(', ')
      : ''

  return {
    title: baseLabel,
    subtitle: factorsStr,
  }
}

/**
 * Окремий 12-годинний циферблат з класичним розташуванням цифр
 */
const TwelveHourClockDial: React.FC<{
  title: string
  subtitle: string
  sectors: DialSectorData[]
  hourNumbers: string[] // 12 цифр від 12/24 по колу
}> = ({ title, subtitle, sectors, hourNumbers }) => {
  const [hoveredSector, setHoveredSector] = useState<DialSectorData | null>(null)

  const cx = 115
  const cy = 115
  const rInner = 60
  const rOuter = 92
  const rLabels = 106

  return (
    <div className="flex flex-col items-center w-full max-w-[170px] sm:max-w-[210px] p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs select-none transition-all">
      {/* Заголовок циферблата */}
      <div className="flex flex-col items-center mb-0.5 sm:mb-1 text-center w-full px-0.5">
        <span className="text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-tight truncate max-w-full">
          {title}
        </span>
        <span className="text-[8.5px] sm:text-[9.5px] font-medium font-mono text-slate-400 dark:text-slate-500">
          {subtitle}
        </span>
      </div>

      {/* SVG Циферблат */}
      <div className="relative w-full aspect-square max-w-[145px] sm:max-w-[185px] flex items-center justify-center">
        <svg
          viewBox="0 0 230 230"
          className="w-full h-full overflow-visible transition-transform duration-300"
        >
          {/* Фонове кільце */}
          <circle
            cx={cx}
            cy={cy}
            r={(rInner + rOuter) / 2}
            strokeWidth={rOuter - rInner + 2}
            className="fill-none stroke-slate-100 dark:stroke-slate-800/50"
          />

          {/* Інтерактивні сектори (12, 4 або 2 відповідно до кроку) */}
          {sectors.map((s) => {
            const gap = sectors.length > 2 ? 1.0 : 0.6
            const aStart = s.startAngle + gap
            const aEnd = s.endAngle - gap

            const isHovered = hoveredSector?.id === s.id
            const currentRInner = isHovered ? rInner - 2 : rInner
            const currentROuter = isHovered ? rOuter + 3 : rOuter

            const path = getArcPath(cx, cy, currentRInner, currentROuter, aStart, aEnd)
            const colors = getSectorColor(s.status)

            return (
              <path
                key={s.id}
                d={path}
                className={`${colors.fill} ${colors.stroke} stroke-[1] transition-all duration-150 cursor-pointer ${
                  isHovered ? 'filter drop-shadow-md scale-[1.02] origin-center z-10' : ''
                }`}
                onMouseEnter={() => setHoveredSector(s)}
                onMouseLeave={() => setHoveredSector(null)}
              />
            )
          })}

          {/* 12 класичних годинних цифр навколо циферблата */}
          {hourNumbers.map((num, i) => {
            // i=0: 12 (top, -90°); i=1: 1 (-60°); i=2: 2 (-30°); i=3: 3 (0°)...
            const angleDeg = -90 + i * 30
            const rad = (angleDeg * Math.PI) / 180
            const tx = cx + rLabels * Math.cos(rad)
            const ty = cy + rLabels * Math.sin(rad)
            const isCardinal = i === 0 || i === 3 || i === 6 || i === 9

            return (
              <text
                key={`tick-${i}-${num}`}
                x={tx}
                y={ty}
                textAnchor="middle"
                dominantBaseline="central"
                className={`select-none pointer-events-none font-mono ${
                  isCardinal
                    ? 'text-[10px] font-black fill-slate-700 dark:fill-slate-300'
                    : 'text-[8.5px] font-semibold fill-slate-400 dark:fill-slate-500'
                }`}
              >
                {num}
              </text>
            )
          })}

          {/* Внутрішній круг серцевини */}
          <circle
            cx={cx}
            cy={cy}
            r={rInner - 3}
            className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-700/80 stroke-[1.5] shadow-inner"
          />
        </svg>

        {/* Інтерактивний центр циферблату */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[49%] h-[49%] rounded-full flex flex-col items-center justify-center p-0.5 text-center select-none overflow-hidden">
            {hoveredSector ? (
              <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-90 duration-150 w-full px-0.5">
                {/* Час */}
                <span className="font-mono font-black text-[9.5px] sm:text-[11px] text-slate-900 dark:text-slate-100 leading-none">
                  {hoveredSector.timeRangeStr}
                </span>

                {/* Статус + спрощені чинники без числових параметрів */}
                {(() => {
                  const { title: statusTitle, subtitle: factorsSubtitle } = getSimplifiedIssueText(
                    hoveredSector.status,
                    hoveredSector.issues
                  )
                  const colorClass =
                    hoveredSector.status === 'danger'
                      ? 'text-rose-600 dark:text-rose-400'
                      : hoveredSector.status === 'warning'
                      ? 'text-orange-600 dark:text-orange-400'
                      : hoveredSector.status === 'attention'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : hoveredSector.status === 'favorable'
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : hoveredSector.status === 'ideal'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 dark:text-slate-500'

                  return (
                    <div className="flex flex-col items-center justify-center mt-0.5 text-center leading-tight">
                      <span className={`text-[8.5px] sm:text-[9.5px] font-bold ${colorClass}`}>
                        {factorsSubtitle ? `${statusTitle}:` : statusTitle}
                      </span>
                      {factorsSubtitle && (
                        <span className={`text-[7px] sm:text-[8px] font-semibold leading-tight ${colorClass} line-clamp-2 px-0.5`}>
                          {factorsSubtitle}
                        </span>
                      )}
                    </div>
                  )
                })()}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center leading-tight">
                <span className="text-[9.5px] sm:text-[11px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                  Вікна для
                </span>
                <span className="text-[9.5px] sm:text-[11px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                  польотів
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const FlightWindowsCard: React.FC<FlightWindowsCardProps> = ({
  hourly = [],
  warnings,
  levels = '800',
  depth = '48',
  detail = '1',
  className = '',
}) => {
  const depthHours = parseInt(depth, 10) || 48
  const detailHours = parseInt(detail, 10) || 1
  const maxFlightLevelM = parseInt(levels, 10) || 800

  // Визначаємо унікальні дати з погодинного прогнозу
  const uniqueDates = useMemo(() => {
    if (!hourly || hourly.length === 0) return []
    const dates: string[] = []
    for (const p of hourly) {
      if (p.fullDate && !dates.includes(p.fullDate)) {
        dates.push(p.fullDate)
      }
    }
    return dates
  }, [hourly])

  const todayDateStr = uniqueDates[0] || new Date().toISOString().slice(0, 10)
  const tomorrowDateStr = useMemo(() => {
    if (uniqueDates.length > 1) return uniqueDates[1]
    const d = new Date(todayDateStr)
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  }, [uniqueDates, todayDateStr])

  const formatShortDate = (dStr: string) => {
    const parts = dStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}`
    }
    return dStr
  }

  const todayFormattedShort = useMemo(() => formatShortDate(todayDateStr), [todayDateStr])
  const tomorrowFormattedShort = useMemo(() => formatShortDate(tomorrowDateStr), [tomorrowDateStr])

  // Поточна година початку прогнозу (для сірого забарвлення минулих годин сьогодні)
  const firstForecastHour = useMemo(() => {
    if (hourly && hourly.length > 0) {
      return parseInt(hourly[0].time.split(':')[0], 10)
    }
    return new Date().getHours()
  }, [hourly])

  // Якщо перша половина доби вже в минулому (година >= 12), не показуємо перший циферблат сьогодні
  const isTodayAmRelevant = useMemo(() => {
    return firstForecastHour < 12
  }, [firstForecastHour])

  // Ранжування статусів небезпеки
  const severityRank: Record<DialSectorStatus, number> = {
    danger: 5,
    warning: 4,
    attention: 3,
    favorable: 2,
    ideal: 1,
    past: 0,
    no_data: -1,
  }

  // Генерація секторів для 12-годинного блоку
  const buildHalfDaySectors = (targetDateStr: string, startBaseHour: number, isToday: boolean) => {
    const sectorCount = Math.max(1, Math.floor(12 / detailHours))
    const spanAngle = 360 / sectorCount
    const sectors: DialSectorData[] = []

    for (let s = 0; s < sectorCount; s++) {
      const segStart = startBaseHour + s * detailHours
      const segEnd = segStart + detailHours
      const startAngle = -90 + s * spanAngle
      const endAngle = startAngle + spanAngle

      const timeRangeStr =
        detailHours === 1
          ? `${String(segStart).padStart(2, '0')}:00`
          : `${String(segStart).padStart(2, '0')}:00 - ${String(segEnd).padStart(2, '0')}:00`

      // Перевіряємо чи цей сектор повністю в минулому (тільки для Сьогодні)
      if (isToday && segEnd <= firstForecastHour) {
        sectors.push({
          id: `seg-${targetDateStr}-${segStart}-${segEnd}`,
          startHour: segStart,
          endHour: segEnd,
          timeRangeStr,
          status: 'past',
          issues: ['Час вже минув'],
          startAngle,
          endAngle,
        })
        continue
      }

      // Шукаємо точки прогнозу для даного часового проміжку
      const matchingPoints = hourly.filter((p) => {
        if (p.fullDate !== targetDateStr) return false
        const h = parseInt(p.time.split(':')[0], 10)
        return h >= segStart && h < segEnd
      })

      if (matchingPoints.length === 0) {
        sectors.push({
          id: `seg-${targetDateStr}-${segStart}-${segEnd}`,
          startHour: segStart,
          endHour: segEnd,
          timeRangeStr,
          status: 'no_data',
          issues: ['Поза межами прогнозу'],
          startAngle,
          endAngle,
        })
        continue
      }

      // Визначаємо найгірший статус серед точок сектора
      let worstStatus: DialSectorStatus = 'ideal'
      const collectedIssues: string[] = []

      for (const pt of matchingPoints) {
        const evalRes = evaluateHour(pt, warnings, maxFlightLevelM)
        const statusMap: Record<WarningSeverity, DialSectorStatus> = {
          danger: 'danger',
          warning: 'warning',
          attention: 'attention',
          favorable: 'favorable',
          ideal: 'ideal',
          safe: 'ideal',
        }
        const mappedStatus = statusMap[evalRes.severity] || 'ideal'
        if (severityRank[mappedStatus] > severityRank[worstStatus]) {
          worstStatus = mappedStatus
        }
        if (evalRes.issues.length > 0) {
          collectedIssues.push(...evalRes.issues)
        }
      }

      sectors.push({
        id: `seg-${targetDateStr}-${segStart}-${segEnd}`,
        startHour: segStart,
        endHour: segEnd,
        timeRangeStr,
        status: worstStatus,
        issues: Array.from(new Set(collectedIssues)),
        startAngle,
        endAngle,
      })
    }

    return sectors
  }

  // Сьогодні: Ніч/Ранок (00:00 - 12:00) та День/Вечір (12:00 - 24:00)
  const todayAmSectors = useMemo(() => {
    return buildHalfDaySectors(todayDateStr, 0, true)
  }, [hourly, todayDateStr, firstForecastHour, detailHours, warnings, maxFlightLevelM])

  const todayPmSectors = useMemo(() => {
    return buildHalfDaySectors(todayDateStr, 12, true)
  }, [hourly, todayDateStr, firstForecastHour, detailHours, warnings, maxFlightLevelM])

  // Завтра: Ніч/Ранок (00:00 - 12:00) та День/Вечір (12:00 - 24:00)
  const tomorrowAmSectors = useMemo(() => {
    return buildHalfDaySectors(tomorrowDateStr, 0, false)
  }, [hourly, tomorrowDateStr, firstForecastHour, detailHours, warnings, maxFlightLevelM])

  const tomorrowPmSectors = useMemo(() => {
    return buildHalfDaySectors(tomorrowDateStr, 12, false)
  }, [hourly, tomorrowDateStr, firstForecastHour, detailHours, warnings, maxFlightLevelM])

  // Номери годин для класичного циферблата
  const amHourNumbers = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']
  const pmHourNumbers = ['24', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']

  if (!hourly || hourly.length === 0) {
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
      className={`w-full ${className}`}
    >
      <div className="w-full flex flex-col justify-between flex-1 min-h-0 gap-4">
        {/* ================= КОНТЕЙНЕР 1: СЬОГОДНІ ================= */}
        <div className="w-full flex flex-col p-2.5 sm:p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
          <div className="flex items-center gap-1.5 mb-2 px-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-xs" />
            <h4 className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">
              Сьогодні
            </h4>
          </div>

          <div className={`w-full ${isTodayAmRelevant ? 'grid grid-cols-2 gap-1.5 sm:gap-3 justify-items-center' : 'flex justify-center'}`}>
            {isTodayAmRelevant && (
              <TwelveHourClockDial
                title={`${todayFormattedShort} (Ніч / Ранок)`}
                subtitle="00:00 – 12:00"
                sectors={todayAmSectors}
                hourNumbers={amHourNumbers}
              />
            )}
            <TwelveHourClockDial
              title={`${todayFormattedShort} (День / Вечір)`}
              subtitle="12:00 – 24:00"
              sectors={todayPmSectors}
              hourNumbers={pmHourNumbers}
            />
          </div>
        </div>

        {/* ================= КОНТЕЙНЕР 2: ЗАВТРА ================= */}
        <div className="w-full flex flex-col p-2.5 sm:p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/90 dark:border-slate-800/90 shadow-xs">
          <div className="flex items-center gap-1.5 mb-2 px-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-xs" />
            <h4 className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">
              Завтра
            </h4>
          </div>

          <div className="w-full grid grid-cols-2 gap-1.5 sm:gap-3 justify-items-center">
            <TwelveHourClockDial
              title={`${tomorrowFormattedShort} (Ніч / Ранок)`}
              subtitle="00:00 – 12:00"
              sectors={tomorrowAmSectors}
              hourNumbers={amHourNumbers}
            />
            <TwelveHourClockDial
              title={`${tomorrowFormattedShort} (День / Вечір)`}
              subtitle="12:00 – 24:00"
              sectors={tomorrowPmSectors}
              hourNumbers={pmHourNumbers}
            />
          </div>
        </div>

        {/* 
          Нижня інформаційна частина:
          - В один рядок над треком: розшифровка кольорів (без лінії розділення)
          - Знизу: підпис треку
        */}
        <div className="flex flex-col items-start gap-1.5 pt-1 shrink-0">
          {/* Розшифровка кольорів попереджень в один рядок */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-[9px] sm:text-[10px] font-semibold">
            <span className="flex items-center gap-1" title="Час від початку доби до поточного прогнозу">
              <span className="w-2.5 h-2.5 rounded-xs bg-slate-400 dark:bg-slate-600 shadow-2xs" />
              <span className="text-slate-500 dark:text-slate-400">Минулий</span>
            </span>
            <span className="flex items-center gap-1" title="Ідеальні умови польоту">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 shadow-2xs" />
              <span className="text-emerald-700 dark:text-emerald-400">Ідеально</span>
            </span>
            <span className="flex items-center gap-1" title="Сприятливі умови польоту">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-700 shadow-2xs" />
              <span className="text-emerald-800 dark:text-emerald-300">Сприятливо</span>
            </span>
            <span className="flex items-center gap-1" title="Звернути увагу на фактори">
              <span className="w-2.5 h-2.5 rounded-xs bg-yellow-400 shadow-2xs" />
              <span className="text-yellow-700 dark:text-yellow-400">Увага</span>
            </span>
            <span className="flex items-center gap-1" title="Наближення до критичних показників">
              <span className="w-2.5 h-2.5 rounded-xs bg-orange-500 shadow-2xs" />
              <span className="text-orange-700 dark:text-orange-400">Наближення</span>
            </span>
            <span className="flex items-center gap-1" title="Перевищення критичних показників">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 shadow-2xs" />
              <span className="text-rose-700 dark:text-rose-400">Небезпечно</span>
            </span>
          </div>

          {/* Підпис треку під розшифровкою */}
          <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
            Трек: крок {detailHours} год, глибина {depthHours} год
          </span>
        </div>
      </div>
    </ForecastCard>
  )
}
