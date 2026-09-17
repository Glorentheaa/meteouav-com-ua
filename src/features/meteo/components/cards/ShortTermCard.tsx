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
  getSeverityCellClass,
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

  const colWidth = isExpanded
    ? points.length <= 4
      ? 140
      : points.length <= 8
      ? 110
      : points.length <= 16
      ? 88
      : 76
    : points.length <= 4
    ? 80
    : points.length <= 8
    ? 68
    : 56
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
    <div
      className={`relative flex flex-col rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/90 shadow-sm dark:shadow-inner overflow-hidden select-none ${
        isExpanded ? 'w-fit max-w-full' : 'w-full'
      }`}
    >
      {/* Кнопки горизонтальної навігації (стрілочки вліво / вправо) */}
      <button
        type="button"
        onClick={() => handleScroll('left')}
        disabled={!canScrollLeft}
        aria-label="Прокрутити вліво"
        className={`absolute ${
          isExpanded ? 'left-[40px] sm:left-[44px]' : 'left-[34px] sm:left-[38px]'
        } top-1/2 -translate-y-1/2 z-30 p-1 rounded-full bg-white/95 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600/70 shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-all ${
          canScrollLeft ? 'opacity-90 hover:scale-110 cursor-pointer' : 'opacity-0 pointer-events-none'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => handleScroll('right')}
        disabled={!canScrollRight}
        aria-label="Прокрутити вправо"
        className={`absolute right-1.5 top-1/2 -translate-y-1/2 z-30 p-1 rounded-full bg-white/95 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600/70 shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-all ${
          canScrollRight ? 'opacity-90 hover:scale-110 cursor-pointer' : 'opacity-0 pointer-events-none'
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Горизонтальний скрол-контейнер */}
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600/70 scrollbar-track-transparent flex"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* ================= 1. ФІКСОВАНА КОЛОНКА ІКОНОК (STICKY) ================= */}
        <div
          className={`sticky left-0 z-20 shrink-0 bg-white dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col ${
            isExpanded ? 'w-11' : 'w-9 sm:w-10'
          }`}
        >
          {/* Рядок 1: Іконка години */}
          <div
            className={`flex items-center justify-center border-b border-slate-200 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800/80 ${
              isExpanded ? 'h-14' : 'h-11'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 shrink-0" />
          </div>

          {/* Рядок 2: Іконка температури */}
          <div
            className={`flex items-center justify-center border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-transparent ${
              isExpanded ? 'h-[46px]' : 'h-[38px]'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
          </div>

          {/* Рядок 3: Іконка вітру */}
          <div
            className={`flex items-center justify-center border-b border-slate-200 dark:border-slate-700/60 bg-slate-50/50 dark:bg-transparent ${
              isExpanded ? 'h-12' : 'h-10'
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
          </div>

          {/* Рядок 4: Іконка напрямку вітру */}
          <div
            className={`flex items-center justify-center border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-transparent ${
              isExpanded ? 'h-11' : 'h-9'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
          </div>

          {/* Рядок 5: Іконка кромки хмар */}
          <div
            className={`flex items-center justify-center border-b border-slate-200 dark:border-slate-700/60 bg-slate-50/50 dark:bg-transparent ${
              isExpanded ? 'h-12' : 'h-10'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          </div>

          {/* Рядок 6: Іконка опадів */}
          <div
            className={`flex items-center justify-center border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-transparent ${
              isExpanded ? 'h-12' : 'h-10'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
          </div>

          {/* Рядок 7: Іконка видимості */}
          <div
            className={`flex items-center justify-center border-b border-slate-200 dark:border-slate-700/60 bg-slate-50/50 dark:bg-transparent ${
              isExpanded ? 'h-12' : 'h-10'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          </div>

          {/* Рядок 8: Іконка КР-індексу */}
          <div
            className={`flex items-center justify-center bg-white dark:bg-transparent ${
              isExpanded ? 'h-10' : 'h-8'
            }`}
          >
            <Magnet className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
          </div>
        </div>

        {/* ================= 2. ТЕКСТОВИЙ ОПИС ПАРАМЕТРІВ (СКРОЛИТЬСЯ РАЗОМ З ТАБЛИЦЕЮ) ================= */}
        <div
          className={`shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-700/60 select-none ${
            isExpanded ? 'w-[155px] sm:w-[170px]' : 'w-[135px] sm:w-[145px]'
          }`}
        >
          {/* Рядок 1: Година */}
          <div
            className={`flex items-center px-2.5 font-bold border-b border-slate-200 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800/80 ${
              isExpanded ? 'h-14 text-xs sm:text-sm' : 'h-11 text-[11px]'
            }`}
          >
            <span className="text-slate-800 dark:text-slate-200 whitespace-nowrap">Година</span>
          </div>

          {/* Рядок 2: Температура, °C */}
          <div
            className={`flex items-center px-2.5 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-transparent ${
              isExpanded ? 'h-[46px] text-xs' : 'h-[38px] text-[10.5px] sm:text-[11px]'
            }`}
          >
            <span className="whitespace-nowrap">Температура, °C</span>
          </div>

          {/* Рядок 3: Вітер, м/с / Пориви, м/с */}
          <div
            className={`flex flex-col justify-center px-2.5 border-b border-slate-200 dark:border-slate-700/60 bg-slate-50/50 dark:bg-transparent leading-tight ${
              isExpanded ? 'h-12 text-xs' : 'h-10 text-[10px] sm:text-[10.5px]'
            }`}
          >
            <span className="font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">Вітер, м/с</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">Пориви, м/с</span>
          </div>

          {/* Рядок 4: Напрям вітру, ° */}
          <div
            className={`flex items-center px-2.5 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-transparent ${
              isExpanded ? 'h-11 text-xs' : 'h-9 text-[10.5px] sm:text-[11px]'
            }`}
          >
            <span className="whitespace-nowrap">Напрям вітру, °</span>
          </div>

          {/* Рядок 5: Кромка хмар, м / Хмарність, % */}
          <div
            className={`flex flex-col justify-center px-2.5 border-b border-slate-200 dark:border-slate-700/60 bg-slate-50/50 dark:bg-transparent leading-tight ${
              isExpanded ? 'h-12 text-xs' : 'h-10 text-[10px] sm:text-[10.5px]'
            }`}
          >
            <span className="font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">Кромка хмар, м</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">Хмарність, %</span>
          </div>

          {/* Рядок 6: Опади, мм / Вологість, % */}
          <div
            className={`flex flex-col justify-center px-2.5 border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-transparent leading-tight ${
              isExpanded ? 'h-12 text-xs' : 'h-10 text-[10px] sm:text-[10.5px]'
            }`}
          >
            <span className="font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">Опади, мм</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">Вологість, %</span>
          </div>

          {/* Рядок 7: Видимість, км / Туман */}
          <div
            className={`flex flex-col justify-center px-2.5 border-b border-slate-200 dark:border-slate-700/60 bg-slate-50/50 dark:bg-transparent leading-tight ${
              isExpanded ? 'h-12 text-xs' : 'h-10 text-[10px] sm:text-[10.5px]'
            }`}
          >
            <span className="font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">Видимість, км</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">Туман</span>
          </div>

          {/* Рядок 8: КР-індекс */}
          <div
            className={`flex items-center px-2.5 font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-transparent ${
              isExpanded ? 'h-10 text-xs' : 'h-8 text-[10.5px] sm:text-[11px]'
            }`}
          >
            <span className="whitespace-nowrap">КР-індекс</span>
          </div>
        </div>

        {/* ================= 3. ПРАВА ОБЛАСТЬ З ПОГОДИННИМИ КОЛОНКАМИ ================= */}
        <div
          className="relative flex flex-col shrink-0"
          style={{ width: `${totalWidth}px` }}
        >
          {/* ---------------- Рядок 1: Година + Іконка погоди ---------------- */}
          <div
            className={`flex border-b border-slate-200 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800/80 ${
              isExpanded ? 'h-14' : 'h-11'
            }`}
          >
            {points.map((pt) => {
              const cloudCover = pt.cloudCoverPct ?? (pt.cloudBaseM < 800 ? 80 : 30)
              return (
                <div
                  key={`hour-${pt.timestamp}`}
                  style={{ width: `${colWidth}px` }}
                  className="flex flex-col items-center justify-center border-r border-slate-200 dark:border-slate-700/60 px-0.5"
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
                    className={`font-bold tracking-tight text-slate-700 dark:text-slate-200 mt-0.5 ${
                      isExpanded ? 'text-xs' : 'text-[10px]'
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
            className="relative flex border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-950/40"
            style={{ height: `${rowHeightTemp}px` }}
          >
            {/* Фоновий SVG з плавною кривою температури */}
            <svg
              className="absolute inset-0 pointer-events-none w-full h-full z-10 overflow-visible"
              width={totalWidth}
              height={rowHeightTemp}
            >
              <defs>
                <linearGradient id="tempAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                  <stop offset="65%" stopColor="#f97316" stopOpacity="0.1" />
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
              const bgClass = getSeverityCellClass(tempSev)

              const roundedTemp = Math.round(pt.temp)
              const tempStr = roundedTemp > 0 ? `+${roundedTemp}` : `${roundedTemp}`

              return (
                <div
                  key={`temp-${pt.timestamp}`}
                  style={{ width: `${colWidth}px` }}
                  className={`relative flex items-center justify-center border-r border-slate-200 dark:border-slate-800/80 transition-colors z-0 ${bgClass}`}
                  title={`Температура: ${tempStr}°C (${tempSev})`}
                >
                  <span
                    className={`font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] z-20 ${
                      isExpanded ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-[11px]'
                    }`}
                  >
                    {tempStr}
                  </span>
                </div>
              )
            })}
          </div>

          {/* ---------------- Рядок 3: Вітер / Пориви (Діагональний спліт) ---------------- */}
          <div
            className={`flex border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-transparent ${
              isExpanded ? 'h-12' : 'h-10'
            }`}
          >
            {points.map((pt) => {
              const windSev = evaluateWind(pt.surfaceWind, warnings.wind)
              const gustSev = evaluateGusts(pt.surfaceGusts, warnings.gusts)
              const roundedWind = Math.round(pt.surfaceWind)
              const roundedGusts = Math.round(pt.surfaceGusts)

              return (
                <div
                  key={`wind-gust-${pt.timestamp}`}
                  style={{ width: `${colWidth}px` }}
                  className="p-0.5 border-r border-slate-200 dark:border-slate-800/80"
                >
                  <DiagonalSplitCell
                    topValue={roundedWind}
                    topSeverity={windSev}
                    topTitle={`Вітер: ${roundedWind} м/с`}
                    bottomValue={roundedGusts}
                    bottomSeverity={gustSev}
                    bottomTitle={`Пориви: ${roundedGusts} м/с`}
                    isExpanded={isExpanded}
                  />
                </div>
              )
            })}
          </div>

          {/* ---------------- Рядок 4: Напрям вітру (Авіаційна пір'їнка) ---------------- */}
          <div
            className={`flex items-center border-b border-slate-200 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-950/50 ${
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
            className={`flex border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-transparent ${
              isExpanded ? 'h-12' : 'h-10'
            }`}
          >
            {points.map((pt) => {
              const cloudSev = evaluateCloudBase(pt.cloudBaseM, maxFlightLevelM)
              const cloudCover = pt.cloudCoverPct ?? (pt.cloudBaseM < 800 ? 80 : 35)
              const coverSev = cloudCover >= 90 ? 'attention' : cloudCover >= 60 ? 'favorable' : 'ideal'
              const roundedBase = Math.round(pt.cloudBaseM)
              const roundedCover = Math.round(cloudCover)

              return (
                <div
                  key={`cloud-${pt.timestamp}`}
                  style={{ width: `${colWidth}px` }}
                  className="p-0.5 border-r border-slate-200 dark:border-slate-800/80"
                >
                  <DiagonalSplitCell
                    topValue={roundedBase}
                    topSeverity={cloudSev}
                    topTitle={`Кромка хмар: ${roundedBase} м`}
                    bottomValue={roundedCover}
                    bottomSeverity={coverSev}
                    bottomTitle={`Хмарність: ${roundedCover}%`}
                    isExpanded={isExpanded}
                  />
                </div>
              )
            })}
          </div>

          {/* ---------------- Рядок 6: Опади / Вологість (Діагональний спліт + Крива опадів) ---------------- */}
          <div
            className={`relative flex border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-transparent ${
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
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
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
              const roundedPrecip = pt.precipMm <= 0 ? '—' : Math.round(pt.precipMm) || '<1'
              const roundedHum = Math.round(pt.humidity)

              return (
                <div
                  key={`precip-hum-${pt.timestamp}`}
                  style={{ width: `${colWidth}px` }}
                  className="p-0.5 border-r border-slate-200 dark:border-slate-800/80 z-0"
                >
                  <DiagonalSplitCell
                    topValue={roundedPrecip}
                    topSeverity={precipSev}
                    topTitle={`Опади: ${roundedPrecip === '—' ? 'немає' : `${roundedPrecip} мм/год`}`}
                    bottomValue={roundedHum}
                    bottomSeverity={humSev}
                    bottomTitle={`Вологість: ${roundedHum}%`}
                    isExpanded={isExpanded}
                  />
                </div>
              )
            })}
          </div>

          {/* ---------------- Рядок 7: Видимість / Туман (Діагональний спліт) ---------------- */}
          <div
            className={`flex border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-transparent ${
              isExpanded ? 'h-12' : 'h-10'
            }`}
          >
            {points.map((pt) => {
              const fogSev = evaluateFog(pt.fogRisk, pt.visibilityKm, warnings.fog, warnings.visibility)
              const fogText = pt.fogRisk === 'high' ? 'Густий' : pt.fogRisk === 'low' ? 'Слабк.' : '—'
              const roundedVis = Math.round(pt.visibilityKm)

              return (
                <div
                  key={`vis-fog-${pt.timestamp}`}
                  style={{ width: `${colWidth}px` }}
                  className="p-0.5 border-r border-slate-200 dark:border-slate-800/80"
                >
                  <DiagonalSplitCell
                    topValue={roundedVis}
                    topSeverity={fogSev}
                    topTitle={`Видимість: ${roundedVis} км`}
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
            className={`flex bg-slate-50/50 dark:bg-slate-950/40 ${isExpanded ? 'h-10' : 'h-8'}`}
          >
            {points.map((pt) => {
              const kpSev = evaluateKpIndex(pt.kpIndex)
              const bgClass = getSeverityCellClass(kpSev)

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

  return (
    <>
      <ForecastCard
        title="Прогноз на найближчий час"
        icon={CloudLightning}
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

        {/* Нижній рядок: трек ліворуч, кнопка "Розгорнути" праворуч */}
        <div className="flex items-center justify-between mt-2.5 pt-1 shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Трек: крок {detailHours} год, глибина {depthHours} год, базовий прогноз на 10м.
          </span>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            title="Розгорнути прогноз на весь екран"
            aria-label="Розгорнути прогноз на весь екран"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors border border-slate-200 dark:border-slate-700/80 shadow-xs"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="text-[11px] sm:text-xs">Розгорнути</span>
          </button>
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

          <div className="relative w-fit max-w-[95vw] lg:max-w-7xl max-h-[92vh] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Шапка модального вікна */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0">
              <div className="flex items-center gap-2.5">
                <CloudLightning className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                    Погодинний прогноз на найближчий час
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Трек: крок {detailHours} год, глибина {depthHours} год, базовий прогноз на 10м.
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
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col items-center sm:items-start min-h-0">
              <ForecastGrid
                points={filteredPoints}
                warnings={warnings}
                maxFlightLevelM={maxFlightLevelM}
                isExpanded={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
