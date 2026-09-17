import React, { useMemo, useState } from 'react'
import { Activity, Clock, ShieldCheck, AlertTriangle } from 'lucide-react'
import { ForecastCard } from './ForecastCard'
import type { HourlyForecastPoint } from '../../types/meteoData'
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

type DialHourStatus = 'past' | 'ideal' | 'favorable' | 'attention' | 'warning' | 'danger' | 'no_data'

interface DialHourData {
  hour: number // 0..23
  timeStr: string // "00:00", "01:00", ...
  status: DialHourStatus
  issues: string[]
  point?: HourlyForecastPoint
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

  return `M ${x1o.toFixed(2)} ${y1o.toFixed(2)} A ${rOuter} ${rOuter} 0 0 1 ${x2o.toFixed(2)} ${y2o.toFixed(2)} L ${x2i.toFixed(2)} ${y2i.toFixed(2)} A ${rInner} ${rInner} 0 0 0 ${x1i.toFixed(2)} ${y1i.toFixed(2)} Z`
}

/**
 * Кольорова заливка та обводка для кожного статусу сектора циферблату
 */
function getSectorColor(status: DialHourStatus): { fill: string; stroke: string } {
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
 * Окремий 24-годинний циферблат для одного дня
 */
const ClockDial: React.FC<{
  title: string
  dateStr: string
  hours: DialHourData[]
}> = ({ title, dateStr, hours }) => {
  const [hoveredHour, setHoveredHour] = useState<DialHourData | null>(null)

  const cx = 115
  const cy = 115
  const rInner = 64
  const rOuter = 95
  const rLabels = 108

  // Підрахунок сприятливих годин для польотів
  const safeCount = hours.filter(
    (h) => h.status === 'ideal' || h.status === 'favorable'
  ).length
  const forecastCount = hours.filter(
    (h) => h.status !== 'past' && h.status !== 'no_data'
  ).length

  // Годинні мітки навколо циферблата (кожні 3 години)
  const hourTicks = [
    { label: '00', angle: -90 },
    { label: '03', angle: -45 },
    { label: '06', angle: 0 },
    { label: '09', angle: 45 },
    { label: '12', angle: 90 },
    { label: '15', angle: 135 },
    { label: '18', angle: 180 },
    { label: '21', angle: 225 },
  ]

  return (
    <div className="flex flex-col items-center w-full max-w-[270px] p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs select-none transition-all">
      {/* Заголовок дати над циферблатом */}
      <div className="flex flex-col items-center mb-1 text-center">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          {title}
        </span>
        <span className="text-[10px] font-medium font-mono text-slate-400 dark:text-slate-500">
          {dateStr}
        </span>
      </div>

      {/* SVG Циферблат */}
      <div className="relative w-[210px] h-[210px] sm:w-[230px] sm:h-[230px] flex items-center justify-center">
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

          {/* 24 сектори годин */}
          {hours.map((h) => {
            // Кожна година займає 15 градусів (360 / 24 = 15)
            // 00:00 починається вгорі (-90 градусів)
            const baseAngle = -90 + h.hour * 15
            const gap = 1.0 // зазор між секторами в градусах
            const startAngle = baseAngle + gap
            const endAngle = baseAngle + 15 - gap

            const isHovered = hoveredHour?.hour === h.hour
            const currentRInner = isHovered ? rInner - 2 : rInner
            const currentROuter = isHovered ? rOuter + 3 : rOuter

            const path = getArcPath(cx, cy, currentRInner, currentROuter, startAngle, endAngle)
            const colors = getSectorColor(h.status)

            return (
              <path
                key={h.hour}
                d={path}
                className={`${colors.fill} ${colors.stroke} stroke-[1] transition-all duration-150 cursor-pointer ${
                  isHovered ? 'filter drop-shadow-md scale-[1.02] origin-center z-10' : ''
                }`}
                onMouseEnter={() => setHoveredHour(h)}
                onMouseLeave={() => setHoveredHour(null)}
              />
            )
          })}

          {/* Цифрові підписи годин по периметру (00, 03, 06, 09, 12, 15, 18, 21) */}
          {hourTicks.map((tick) => {
            const rad = (tick.angle * Math.PI) / 180
            const tx = cx + rLabels * Math.cos(rad)
            const ty = cy + rLabels * Math.sin(rad)
            return (
              <text
                key={tick.label}
                x={tx}
                y={ty}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-[9px] font-mono font-bold fill-slate-400 dark:fill-slate-500 select-none pointer-events-none"
              >
                {tick.label}
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
          <div className="w-[110px] h-[110px] rounded-full flex flex-col items-center justify-center p-1 text-center">
            {hoveredHour ? (
              <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-90 duration-150">
                <span className="font-mono font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-tight">
                  {hoveredHour.timeStr}
                </span>

                {hoveredHour.status === 'past' && (
                  <span className="text-[9.5px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    Минулий час
                  </span>
                )}
                {hoveredHour.status === 'ideal' && (
                  <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Ідеально
                  </span>
                )}
                {hoveredHour.status === 'favorable' && (
                  <span className="text-[9.5px] font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                    Сприятливо
                  </span>
                )}
                {hoveredHour.status === 'attention' && (
                  <span className="text-[9.5px] font-bold text-yellow-600 dark:text-yellow-400 mt-0.5">
                    Увага
                  </span>
                )}
                {hoveredHour.status === 'warning' && (
                  <span className="text-[9.5px] font-bold text-orange-600 dark:text-orange-400 mt-0.5">
                    Наближення
                  </span>
                )}
                {hoveredHour.status === 'danger' && (
                  <span className="text-[9.5px] font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                    Перевищення
                  </span>
                )}
                {hoveredHour.status === 'no_data' && (
                  <span className="text-[9.5px] font-medium text-slate-400 mt-0.5">
                    Немає даних
                  </span>
                )}

                {hoveredHour.issues.length > 0 ? (
                  <span className="text-[8.5px] text-slate-500 dark:text-slate-400 max-w-[95px] line-clamp-2 leading-tight mt-0.5">
                    {hoveredHour.issues[0]}
                  </span>
                ) : hoveredHour.status === 'ideal' || hoveredHour.status === 'favorable' ? (
                  <span className="text-[8.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Без обмежень
                  </span>
                ) : null}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center animate-in fade-in duration-200">
                {safeCount >= 10 ? (
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mb-0.5" />
                ) : safeCount > 0 ? (
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 mb-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 mb-0.5" />
                )}

                <span className="font-bold text-xs sm:text-[13px] text-slate-800 dark:text-slate-100 leading-tight">
                  {safeCount} з {forecastCount || 24} год
                </span>
                <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                  {safeCount >= 12
                    ? 'Сприятливий день'
                    : safeCount > 0
                    ? 'Обмежені вікна'
                    : 'Не придатний'}
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
  levels = '300',
  depth = '24',
  detail = '1',
  className = '',
}) => {
  const maxFlightLevelM = parseInt(levels, 10) || 300
  const depthHours = parseInt(depth, 10) || 24
  const detailHours = parseInt(detail, 10) || 1

  // 1. Формуємо дати сьогодні та завтра
  const { todayDate, tomorrowDate, todayFormatted, tomorrowFormatted } = useMemo(() => {
    if (!hourly || hourly.length === 0) {
      const d = new Date()
      const t = new Date(d)
      t.setDate(t.getDate() + 1)
      const dStr = d.toISOString().slice(0, 10)
      const tStr = t.toISOString().slice(0, 10)
      return {
        todayDate: dStr,
        tomorrowDate: tStr,
        todayFormatted: d.toLocaleDateString('uk-UA'),
        tomorrowFormatted: t.toLocaleDateString('uk-UA'),
      }
    }

    const tDate = hourly[0].fullDate
    let tmDate = ''
    for (const pt of hourly) {
      if (pt.fullDate > tDate) {
        tmDate = pt.fullDate
        break
      }
    }

    // Якщо прогноз не містить наступної дати — додаємо день до tDate
    if (!tmDate) {
      const parts = tDate.split('-').map(Number)
      if (parts.length === 3) {
        const dObj = new Date(parts[0], parts[1] - 1, parts[2] + 1)
        tmDate = `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, '0')}-${String(
          dObj.getDate()
        ).padStart(2, '0')}`
      }
    }

    const formatUA = (s: string) => {
      const p = s.split('-')
      return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : s
    }

    return {
      todayDate: tDate,
      tomorrowDate: tmDate,
      todayFormatted: formatUA(tDate),
      tomorrowFormatted: formatUA(tmDate),
    }
  }, [hourly])

  // 2. Перша година доступного прогнозу (до неї час вважається минулим і підсвічується сірим)
  const firstForecastHour = useMemo(() => {
    if (!hourly || hourly.length === 0) return 0
    const [h] = hourly[0].time.split(':')
    return parseInt(h, 10) || 0
  }, [hourly])

  // 3. Побудова даних для циферблату Сьогодні (24 години)
  const todayHours: DialHourData[] = useMemo(() => {
    const hoursArr: DialHourData[] = []

    for (let h = 0; h < 24; h++) {
      const timeStr = `${String(h).padStart(2, '0')}:00`

      // До першої години показу прогнозу — минулий час (сірим)
      if (h < firstForecastHour) {
        hoursArr.push({
          hour: h,
          timeStr,
          status: 'past',
          issues: ['Минулий час доби'],
        })
        continue
      }

      // Шукаємо відповідну точку у прогнозі з урахуванням кроку деталізації
      const pt = hourly.find((p) => {
        if (p.fullDate !== todayDate) return false
        const pHour = parseInt(p.time.split(':')[0], 10)
        return h >= pHour && h < pHour + detailHours
      })

      if (pt) {
        const evaluation = evaluateHour(pt, warnings, maxFlightLevelM)
        hoursArr.push({
          hour: h,
          timeStr,
          status: evaluation.severity as DialHourStatus,
          issues: evaluation.issues,
          point: pt,
        })
      } else {
        // Якщо для години немає прогнозу в межах заданої глибини
        hoursArr.push({
          hour: h,
          timeStr,
          status: 'no_data',
          issues: ['Немає прогнозних даних'],
        })
      }
    }

    return hoursArr
  }, [hourly, todayDate, firstForecastHour, detailHours, warnings, maxFlightLevelM])

  // 4. Побудова даних для циферблату Завтра (24 години)
  const tomorrowHours: DialHourData[] = useMemo(() => {
    const hoursArr: DialHourData[] = []

    for (let h = 0; h < 24; h++) {
      const timeStr = `${String(h).padStart(2, '0')}:00`

      // Шукаємо відповідну точку для дати завтра
      const pt = hourly.find((p) => {
        if (p.fullDate !== tomorrowDate) return false
        const pHour = parseInt(p.time.split(':')[0], 10)
        return h >= pHour && h < pHour + detailHours
      })

      if (pt) {
        const evaluation = evaluateHour(pt, warnings, maxFlightLevelM)
        hoursArr.push({
          hour: h,
          timeStr,
          status: evaluation.severity as DialHourStatus,
          issues: evaluation.issues,
          point: pt,
        })
      } else {
        // Якщо глибина прогнозу 24 год і завтрашні години не покриті
        hoursArr.push({
          hour: h,
          timeStr,
          status: 'no_data',
          issues: ['Поза межами обраної глибини прогнозу'],
        })
      }
    }

    return hoursArr
  }, [hourly, tomorrowDate, detailHours, warnings, maxFlightLevelM])

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
      className={`self-start w-full ${className}`}
    >
      <div className="w-full flex flex-col min-h-0">
        {/* Два циферблати: Сьогодні та Завтра (в ряд, при зменшенні екрана — один під одним) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full items-center justify-items-center py-1">
          <ClockDial
            title="Сьогодні"
            dateStr={todayFormatted}
            hours={todayHours}
          />
          <ClockDial
            title="Завтра"
            dateStr={tomorrowFormatted}
            hours={tomorrowHours}
          />
        </div>

        {/* 
          Нижній рядок:
          - Лівий кут: Трек: крок X год, глибина Y год (як у першому блоці)
          - Правий кут: Кольорова градація попереджень, розшифровка
        */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 shrink-0">
          {/* Лівий кут: трек */}
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
            Трек: крок {detailHours} год, глибина {depthHours} год
          </span>

          {/* Правий кут: розшифровка та кольорова градація */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-[10px] font-semibold">
            <span className="flex items-center gap-1" title="Час від початку доби до моменту прогнозу">
              <span className="w-2.5 h-2.5 rounded-xs bg-slate-400 dark:bg-slate-600 shadow-2xs" />
              <span className="text-slate-500 dark:text-slate-400">Минулий</span>
            </span>
            <span className="flex items-center gap-1" title="Ідеальні умови польоту">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 shadow-2xs" />
              <span className="text-emerald-700 dark:text-emerald-400">Ідеально</span>
            </span>
            <span className="flex items-center gap-1" title="Сприятливі умови">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-700 shadow-2xs" />
              <span className="text-emerald-800 dark:text-emerald-300">Сприятливо</span>
            </span>
            <span className="flex items-center gap-1" title="Звернути увагу на фактори">
              <span className="w-2.5 h-2.5 rounded-xs bg-yellow-400 shadow-2xs" />
              <span className="text-yellow-700 dark:text-yellow-400">Увага</span>
            </span>
            <span className="flex items-center gap-1" title="Наближення до лімітів">
              <span className="w-2.5 h-2.5 rounded-xs bg-orange-500 shadow-2xs" />
              <span className="text-orange-700 dark:text-orange-400">Наближення</span>
            </span>
            <span className="flex items-center gap-1" title="Перевищення критичних показників">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 shadow-2xs" />
              <span className="text-rose-700 dark:text-rose-400">Перевищення</span>
            </span>
          </div>
        </div>
      </div>
    </ForecastCard>
  )
}
