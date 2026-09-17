import React, { useMemo, useRef, useState, useEffect } from 'react'
import {
  CloudLightning,
  Clock,
  Thermometer,
  Wind,
  Navigation,
  Cloud,
  Droplets,
  Eye,
  Magnet,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { ForecastCard } from './ForecastCard'
import { WeatherIcon } from './WeatherIcon'
import { AviationWindBarb } from './AviationWindBarb'
import { DiagonalSplitCell } from './DiagonalSplitCell'
import type { HourlyForecastPoint } from '../../types/meteoData'
import type { ForecastDepth, ForecastDetail, MeteoWarnings, FlightLevels } from '../../types/meteo'
import {
  evaluateWind,
  evaluateGusts,
  evaluateTemp,
  evaluatePrecip,
  evaluateHumidity,
  evaluateFog,
  evaluateKpIndex,
  evaluateCloudBase,
} from '../../utils/warningEvaluator'

interface ShortTermCardProps {
  hourly?: HourlyForecastPoint[]
  warnings: MeteoWarnings
  depth: ForecastDepth
  detail: ForecastDetail
  levels?: FlightLevels
}

/**
 * Допоміжна функція для побудови плавної кубічної кривої Безьє (Catmull-Rom spline)
 */
function generateSmoothSplinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(i + 2, points.length - 1)]

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x} ${p2.y}`
  }
  return d
}

interface ForecastGridProps {
  points: HourlyForecastPoint[]
  warnings: MeteoWarnings
  maxFlightLevelM: number
  isExpanded?: boolean
}

const ForecastGrid: React.FC<ForecastGridProps> = ({
  points,
  warnings,
  maxFlightLevelM,
  isExpanded = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const colWidth = isExpanded ? 76 : 56
  const rowHeightTemp = isExpanded ? 46 : 38
  const rowHeightPrecip = isExpanded ? 44 : 36
  const totalWidth = points.length * colWidth

  // Перевірка стану прокрутки для активації стрілочок
  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll)
      return () => el.removeEventListener('scroll', checkScroll)
    }
  }, [points])

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = direction === 'left' ? -colWidth * 4 : colWidth * 4
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  // 1. Розрахунок кривої температури
  const tempSpline = useMemo(() => {
    if (points.length === 0) return { path: '', areaPath: '', coords: [] }
    const temps = points.map((p) => p.temp)
    let minT = Math.min(...temps)
    let maxT = Math.max(...temps)
    if (maxT === minT) {
      maxT += 2
      minT -= 2
    }
    const tRange = maxT - minT || 1

    const padTop = isExpanded ? 14 : 10
    const padBottom = isExpanded ? 12 : 8
    const usableH = rowHeightTemp - padTop - padBottom

    const coords = points.map((p, i) => {
      const x = i * colWidth + colWidth / 2
      const norm = (p.temp - minT) / tRange
      const y = padTop + (1 - norm) * usableH
      return { x, y, temp: p.temp }
    })

    const path = generateSmoothSplinePath(coords)
    const areaPath = `${path} L ${coords[coords.length - 1].x} ${rowHeightTemp} L ${coords[0].x} ${rowHeightTemp} Z`

    return { path, areaPath, coords }
  }, [points, colWidth, rowHeightTemp, isExpanded])

  // 2. Розрахунок кривої опадів (початок, пік, завершення)
  const precipSpline = useMemo(() => {
    if (points.length === 0) return { path: '', areaPath: '', coords: [] }
    const precips = points.map((p) => p.precipMm)
    const maxP = Math.max(1.5, ...precips)

    const padTop = 4
    const padBottom = 3
    const usableH = rowHeightPrecip - padTop - padBottom

    const coords = points.map((p, i) => {
      const x = i * colWidth + colWidth / 2
      const norm = Math.min(1, p.precipMm / maxP)
      const y = padTop + (1 - norm) * usableH
      return { x, y, precip: p.precipMm }
    })

    const path = generateSmoothSplinePath(coords)
    const areaPath = `${path} L ${coords[coords.length - 1].x} ${rowHeightPrecip} L ${coords[0].x} ${rowHeightPrecip} Z`

    return { path, areaPath, coords }
  }, [points, colWidth, rowHeightPrecip])

  return (
    <div className="relative w-full flex flex-col rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-900/90 shadow-inner overflow-hidden select-none">
      {/* Кнопки горизонтальної навігації (стрілочки вліво / вправо) */}
      <button
        type="button"
        onClick={() => handleScroll('left')}
        disabled={!canScrollLeft}
        aria-label="Прокрутити вліво"
        className={`absolute left-[118px] sm:left-[142px] top-1/2 -translate-y-1/2 z-30 p-1 rounded-full bg-slate-800/90 text-slate-200 border border-slate-600/70 shadow-lg hover:bg-slate-700 transition-all ${canScrollLeft ? 'opacity-90 hover:scale-110 cursor-pointer' : 'opacity-0 pointer-events-none'
          }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => handleScroll('right')}
        disabled={!canScrollRight}
        aria-label="Прокрутити вправо"
        className={`absolute right-1.5 top-1/2 -translate-y-1/2 z-30 p-1 rounded-full bg-slate-800/90 text-slate-200 border border-slate-600/70 shadow-lg hover:bg-slate-700 transition-all ${canScrollRight ? 'opacity-90 hover:scale-110 cursor-pointer' : 'opacity-0 pointer-events-none'
          }`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Горизонтальний скрол-контейнер */}
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-600/70 scrollbar-track-transparent flex"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* ================= ЛІВА ФІКСОВАНА КОЛОНКА ПАРАМЕТРІВ ================= */}
        <div
          className={`sticky left-0 z-20 shrink-0 bg-slate-900/95 backdrop-blur-md border-r border-slate-700/80 shadow-md ${isExpanded ? 'w-[148px]' : 'w-[124px] sm:w-[138px]'
            }`}
        >
          {/* Рядок 1: Година */}
          {/* Рядок 1: Година */}
          <div
            className={`flex items-center gap-1.5 px-2.5 font-bold text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700/60 ${
              isExpanded ? 'h-14 text-xs sm:text-sm' : 'h-11 text-[11px]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 shrink-0" />
            <span className="truncate">Година</span>
          </div>

          {/* Рядок 2: Температура, °C */}
          <div
            className={`flex items-center gap-1.5 px-2.5 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-700/60 ${
              isExpanded ? 'h-[46px] text-xs' : 'h-[38px] text-[10px] sm:text-[11px]'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
            <span className="truncate">Температура, °C</span>
          </div>

          {/* Рядок 3: Вітер / Пориви, м/с */}
          <div
            className={`flex items-center gap-1.5 px-2.5 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-700/60 ${
              isExpanded ? 'h-12 text-xs' : 'h-10 text-[10px] sm:text-[11px]'
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span className="truncate">Вітер / Пор., м/с</span>
          </div>

          {/* Рядок 4: Напрям вітру, ° */}
          <div
            className={`flex items-center gap-1.5 px-2.5 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-700/60 ${
              isExpanded ? 'h-11 text-xs' : 'h-9 text-[10px] sm:text-[11px]'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <span className="truncate">Напрям вітру, °</span>
          </div>

          {/* Рядок 5: Кромка, м / Хмарн., % */}
          <div
            className={`flex items-center gap-1.5 px-2.5 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-700/60 ${
              isExpanded ? 'h-12 text-xs' : 'h-10 text-[10px] sm:text-[11px]'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300 shrink-0" />
            <span className="truncate">Кромка, м / Хм., %</span>
          </div>

          {/* Рядок 6: Опади, мм / Волог., % */}
          <div
            className={`flex items-center gap-1.5 px-2.5 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-700/60 ${
              isExpanded ? 'h-12 text-xs' : 'h-10 text-[10px] sm:text-[11px]'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
            <span className="truncate">Опади, мм / Вол., %</span>
          </div>

          {/* Рядок 7: Видимість, км / Туман */}
          <div
            className={`flex items-center gap-1.5 px-2.5 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-300 dark:border-slate-700/60 ${
              isExpanded ? 'h-12 text-xs' : 'h-10 text-[10px] sm:text-[11px]'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="truncate">Видим., км / Туман</span>
          </div>

          {/* Рядок 8: КР-індекс */}
          <div
            className={`flex items-center gap-1.5 px-2.5 font-semibold text-slate-700 dark:text-slate-300 ${
              isExpanded ? 'h-10 text-xs' : 'h-8 text-[10px] sm:text-[11px]'
            }`}
          >
            <Magnet className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
            <span className="truncate">КР-індекс</span>
          </div>
        </div>

        {/* ================= ПРАВА ОБЛАСТЬ З ПОГОДИННИМИ КОЛОНКАМИ ================= */}
        <div
          className="relative flex flex-col shrink-0"
          style={{ width: `${totalWidth}px` }}
        >
          {/* ---------------- Рядок 1: Година + Іконка погоди ---------------- */}
          <div
            className={`flex border-b border-slate-700/60 bg-slate-900/60 ${isExpanded ? 'h-14' : 'h-11'
              }`}
          >
            {points.map((pt) => {
              const cloudCover = pt.cloudCoverPct ?? (pt.cloudBaseM < 800 ? 80 : 30)
              return (
                <div
                  key={`hour-${pt.timestamp}`}
                  style={{ width: `${colWidth}px` }}
                  className="flex flex-col items-center justify-center border-r border-slate-800/80 px-0.5"
                >
                  <WeatherIcon
                    cloudCoverPct={cloudCover}
                    precipMm={pt.precipMm}
                    fogRisk={pt.fogRisk}
                    visibilityKm={pt.visibilityKm}
                    time={pt.time}
                    className={isExpanded ? 'w-5 h-5' : 'w-4 h-4'}
                  />
                  <span
                    className={`font-bold tracking-tight text-slate-200 mt-0.5 ${isExpanded ? 'text-xs' : 'text-[10px]'
                      }`}
                  >
                    {pt.time}
                  </span>
                </div>
              )
            })}
          </div>

          {/* ---------------- Рядок 2: Температура + Крива Безьє ---------------- */}
          <div
            className="relative flex border-b border-slate-300 dark:border-slate-700/60 bg-slate-50/40 dark:bg-slate-950/40"
            style={{ height: `${rowHeightTemp}px` }}
          >
            {/* Фоновий SVG з плавною кривою температури */}
            <svg
              className="absolute inset-0 pointer-events-none w-full h-full z-0 overflow-visible"
              width={totalWidth}
              height={rowHeightTemp}
            >
              <defs>
                <linearGradient id="tempAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.45" />
                  <stop offset="65%" stopColor="#f97316" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Заливка (тінь) під кривою температури */}
              {tempSpline.areaPath && (
                <path d={tempSpline.areaPath} fill="url(#tempAreaGrad)" />
              )}

              {/* Тонка помаранчева лінія температури (без точок) */}
              {tempSpline.path && (
                <path
                  d={tempSpline.path}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth={isExpanded ? 1.5 : 1.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_0_2px_rgba(249,115,22,0.5)]"
                />
              )}
            </svg>

            {/* Колонки температури з індивідуальними фоновими статусами безпеки */}
            {points.map((pt) => {
              const tempSev = evaluateTemp(pt.temp, warnings.minTemp, warnings.maxTemp)
              let bgClass = 'bg-emerald-50/80 text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300'
              if (tempSev === 'danger') {
                bgClass = 'bg-rose-100 text-rose-900 dark:bg-rose-900/50 dark:text-rose-300 font-bold'
              } else if (tempSev === 'warning') {
                bgClass = 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300 font-semibold'
              }

              return (
                <div
                  key={`temp-${pt.timestamp}`}
                  style={{ width: `${colWidth}px` }}
                  className={`relative flex items-center justify-center border-r border-slate-200 dark:border-slate-800/80 transition-colors z-10 ${bgClass}`}
                  title={`Температура: ${pt.temp > 0 ? `+${pt.temp}` : pt.temp}°C (${tempSev})`}
                >
                  <span
                    className={`font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ${
                      isExpanded ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-[11px]'
                    }`}
                  >
                    {pt.temp > 0 ? `+${pt.temp}` : pt.temp}
                  </span>
                </div>
              )
            })}
          </div>

          {/* ---------------- Рядок 3: Вітер / Пориви (Діагональний спліт) ---------------- */}
          <div
            className={`flex border-b border-slate-700/60 ${isExpanded ? 'h-12' : 'h-10'}`}
          >
            {points.map((pt) => {
              const windSev = evaluateWind(pt.surfaceWind, warnings.wind)
              const gustSev = evaluateGusts(pt.surfaceGusts, warnings.gusts)

              return (
                <div
                  key={`wind-gust-${pt.timestamp}`}
                  style={{ width: `${colWidth}px` }}
                  className="p-0.5 border-r border-slate-800/80"
                >
                  <DiagonalSplitCell
                    topValue={pt.surfaceWind.toFixed(1)}
                    topSeverity={windSev}
                    topTitle={`Вітер: ${pt.surfaceWind.toFixed(1)} м/с`}
                    bottomValue={pt.surfaceGusts.toFixed(1)}
                    bottomSeverity={gustSev}
                    bottomTitle={`Пориви: ${pt.surfaceGusts.toFixed(1)} м/с`}
                    isExpanded={isExpanded}
                  />
                </div>
              )
            })}
          </div>

          {/* ---------------- Рядок 4: Напрям вітру (Авіаційна пір'їнка) ---------------- */}
          <div
            className={`flex items-center border-b border-slate-300 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-950/50 ${
              isExpanded ? 'h-11' : 'h-9'
            }`}
          >
            {points.map((pt) => (
              <div
                key={`dir-${pt.timestamp}`}
                style={{ width: `${colWidth}px` }}
                className="flex items-center justify-center border-r border-slate-200 dark:border-slate-800/80 py-0.5"
              >
                <AviationWindBarb
                  speedMs={pt.surfaceWind}
                  directionDeg={pt.windDirectionDeg}
                  size={isExpanded ? 24 : 20}
                  showText={true}
                />
              </div>
            ))}
          </div>

          {/* ---------------- Рядок 5: Кромка хмар / Хмарність (Діагональний спліт) ---------------- */}
          <div
            className={`flex border-b border-slate-300 dark:border-slate-700/60 ${isExpanded ? 'h-12' : 'h-10'}`}
          >
            {points.map((pt) => {
              const cloudSev = evaluateCloudBase(pt.cloudBaseM, maxFlightLevelM)
              const cloudCover = pt.cloudCoverPct ?? (pt.cloudBaseM < 800 ? 80 : 35)
              const coverSev = cloudCover >= 80 ? 'warning' : 'safe'

              return (
                <div
                  key={`cloud-${pt.timestamp}`}
                  style={{ width: `${colWidth}px` }}
                  className="p-0.5 border-r border-slate-200 dark:border-slate-800/80"
                >
                  <DiagonalSplitCell
                    topValue={pt.cloudBaseM}
                    topSeverity={cloudSev}
                    topTitle={`Кромка хмар: ${pt.cloudBaseM} м`}
                    bottomValue={cloudCover}
                    bottomSeverity={coverSev}
                    bottomTitle={`Хмарність: ${cloudCover}%`}
                    isExpanded={isExpanded}
                  />
                </div>
              )
            })}
          </div>

          {/* ---------------- Рядок 6: Опади / Вологість (Діагональний спліт + Крива опадів) ---------------- */}
          <div
            className={`relative flex border-b border-slate-300 dark:border-slate-700/60 ${
              isExpanded ? 'h-12' : 'h-10'
            }`}
          >
            {/* SVG крива динаміки опадів (початок, пік, завершення) */}
            <svg
              className="absolute inset-0 pointer-events-none w-full h-full z-10 overflow-hidden"
              width={totalWidth}
              height={rowHeightPrecip}
            >
              <defs>
                <linearGradient id="precipAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Якщо є опади хоча б в одній точці, відображаємо витончену лінію інтенсивності */}
              {points.some((p) => p.precipMm > 0) && (
                <>
                  <path d={precipSpline.areaPath} fill="url(#precipAreaGrad)" />
                  <path
                    d={precipSpline.path}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth={isExpanded ? 1.5 : 1.2}
                    strokeLinecap="round"
                    strokeDasharray={points.every((p) => p.precipMm === 0) ? '2 2' : 'none'}
                    className="dark:stroke-[#38bdf8] drop-shadow-[0_0_2px_rgba(56,189,248,0.7)] opacity-90"
                  />
                </>
              )}
            </svg>

            {points.map((pt) => {
              const precipSev = evaluatePrecip(pt.precipMm, warnings.precip)
              const humSev = evaluateHumidity(pt.humidity, warnings.humidity)

              return (
                <div
                  key={`precip-hum-${pt.timestamp}`}
                  style={{ width: `${colWidth}px` }}
                  className="p-0.5 border-r border-slate-200 dark:border-slate-800/80 z-0"
                >
                  <DiagonalSplitCell
                    topValue={pt.precipMm > 0 ? pt.precipMm.toFixed(1) : '—'}
                    topSeverity={precipSev}
                    topTitle={`Опади: ${pt.precipMm > 0 ? `${pt.precipMm.toFixed(1)} мм/год` : 'немає'}`}
                    bottomValue={pt.humidity}
                    bottomSeverity={humSev}
                    bottomTitle={`Вологість: ${pt.humidity}%`}
                    isExpanded={isExpanded}
                  />
                </div>
              )
            })}
          </div>

          {/* ---------------- Рядок 7: Видимість / Туман (Діагональний спліт) ---------------- */}
          <div
            className={`flex border-b border-slate-300 dark:border-slate-700/60 ${isExpanded ? 'h-12' : 'h-10'}`}
          >
            {points.map((pt) => {
              const fogSev = evaluateFog(pt.fogRisk, pt.visibilityKm, warnings.fog, warnings.visibility)
              const fogText = pt.fogRisk === 'high' ? 'Густий' : pt.fogRisk === 'low' ? 'Слабк.' : '—'

              return (
                <div
                  key={`vis-fog-${pt.timestamp}`}
                  style={{ width: `${colWidth}px` }}
                  className="p-0.5 border-r border-slate-200 dark:border-slate-800/80"
                >
                  <DiagonalSplitCell
                    topValue={pt.visibilityKm.toFixed(1)}
                    topSeverity={fogSev}
                    topTitle={`Видимість: ${pt.visibilityKm.toFixed(1)} км`}
                    bottomValue={fogText}
                    bottomSeverity={fogSev}
                    bottomTitle={`Туман: ${fogText}`}
                    isExpanded={isExpanded}
                  />
                </div>
              )
            })}
          </div>

          {/* ---------------- Рядок 8: КР-індекс ---------------- */}
          <div
            className={`flex bg-slate-50/40 dark:bg-slate-950/40 ${isExpanded ? 'h-10' : 'h-8'}`}
          >
            {points.map((pt) => {
              const kpSev = evaluateKpIndex(pt.kpIndex)
              const bgClass =
                kpSev === 'warning'
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-300 font-bold'
                  : 'bg-emerald-50/80 text-emerald-900 dark:bg-emerald-950/25 dark:text-emerald-400 font-semibold'

              return (
                <div
                  key={`kp-${pt.timestamp}`}
                  style={{ width: `${colWidth}px` }}
                  className={`flex items-center justify-center border-r border-slate-200 dark:border-slate-800/80 transition-colors ${bgClass}`}
                  title={`КР-індекс: ${pt.kpIndex} (${kpSev === 'warning' ? 'геомагнітне збурення' : 'спокійно'})`}
                >
                  <span className={isExpanded ? 'text-xs' : 'text-[10px]'}>
                    {pt.kpIndex}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export const ShortTermCard: React.FC<ShortTermCardProps> = ({
  hourly = [],
  warnings,
  depth,
  detail,
  levels = '300',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const depthHours = parseInt(depth, 10)
  const detailHours = parseInt(detail, 10)
  const maxFlightLevelM = parseInt(levels, 10) || 300

  // Закриття модального вікна по натисканню Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false)
      }
    }
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isModalOpen])

  // Фільтрація точок за глибиною та деталізацією
  const filteredPoints = useMemo(() => {
    if (!hourly || hourly.length === 0) return []
    const sliced = hourly.slice(0, depthHours)
    return sliced.filter((_, idx) => idx % detailHours === 0)
  }, [hourly, depthHours, detailHours])

  // Розрахунок критичних попереджень
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

      if (evaluateCloudBase(pt.cloudBaseM, maxFlightLevelM) === 'danger') {
        const msg = `Кромка хмар (${pt.cloudBaseM}м) нижче ешелону ${maxFlightLevelM}м`
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
  }, [filteredPoints, warnings, maxFlightLevelM])

  if (filteredPoints.length === 0) {
    return (
      <ForecastCard
        title="Прогноз на найближчий час"
        icon={CloudLightning}
        updatedText={null}
      >
        <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center p-6 min-h-[160px]">
          <span className="text-slate-400 text-xs">Очікування даних прогнозу... Натисніть «Оновити прогноз»</span>
        </div>
      </ForecastCard>
    )
  }

  // Кнопка "Розгорнути" у правому кутку заголовка картки
  const expandAction = (
    <button
      type="button"
      onClick={() => setIsModalOpen(true)}
      title="Розгорнути прогноз на весь екран"
      aria-label="Розгорнути прогноз на весь екран"
      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
    >
      <Maximize2 className="w-3.5 h-3.5" />
      <span className="hidden sm:inline text-[11px]">Розгорнути</span>
    </button>
  )

  return (
    <>
      <ForecastCard
        title="Прогноз на найближчий час"
        icon={CloudLightning}
        criticalNotice={criticalNotice}
        headerAction={expandAction}
        updatedText={null}
        className="self-start w-full"
      >
        <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden mt-1">
          <ForecastGrid
            points={filteredPoints}
            warnings={warnings}
            maxFlightLevelM={maxFlightLevelM}
            isExpanded={false}
          />
        </div>
      </ForecastCard>

      {/* ================= МОДАЛЬНЕ ВІКНО НА ВЕСЬ ЕКРАН ================= */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
        >
          {/* Фон клік для закриття */}
          <div
            className="absolute inset-0 -z-10 cursor-pointer"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-7xl max-h-[92vh] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Шапка модального вікна */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0">
              <div className="flex items-center gap-2.5">
                <CloudLightning className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                    Погодинний прогноз на найближчий час
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Горизонтальний трек: {filteredPoints.length} інтервалів (крок {detailHours} год, глибина {depthHours} год)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                title="Закрити вікно (Esc)"
                aria-label="Закрити вікно"
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border border-slate-300 dark:border-slate-700/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Вміст модального вікна (комфортні розміри та шрифти) */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col min-h-0">
              <div className="flex-1 flex flex-col">
                <ForecastGrid
                  points={filteredPoints}
                  warnings={warnings}
                  maxFlightLevelM={maxFlightLevelM}
                  isExpanded={true}
                />
              </div>

              {/* Критичні фактори в модальному вікні */}
              {criticalNotice && (
                <div className="mt-4 px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 shrink-0">
                  <span className="text-base">⚠️</span>
                  <span>{criticalNotice}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
