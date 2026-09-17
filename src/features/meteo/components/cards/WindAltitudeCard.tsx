import React, { useMemo, useState, useRef, useEffect } from 'react'
import {
  Wind,
  Layers,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { ForecastCard } from './ForecastCard'
import { AviationWindBarb } from './AviationWindBarb'
import { DiagonalSplitCell } from './DiagonalSplitCell'
import type { HourlyForecastPoint, AltitudeLevel } from '../../types/meteoData'
import type { ForecastDepth, ForecastDetail, FlightLevels, MeteoWarnings } from '../../types/meteo'
import { evaluateWind, evaluateGusts, getSeverityCellClass } from '../../utils/warningEvaluator'

interface WindAltitudeCardProps {
  hourly?: HourlyForecastPoint[]
  warnings: MeteoWarnings
  levels: FlightLevels
  depth: ForecastDepth
  detail: ForecastDetail
}

const ALL_POSSIBLE_LEVELS: readonly AltitudeLevel[] = [
  50, 80, 120, 200, 300, 500, 800, 1000, 1500, 2000, 3000,
]

interface WindAltitudeGridProps {
  points: HourlyForecastPoint[]
  activeLevels: AltitudeLevel[]
  warnings: MeteoWarnings
  isExpanded?: boolean
}

const WindAltitudeGrid: React.FC<WindAltitudeGridProps> = ({
  points,
  activeLevels,
  warnings,
  isExpanded = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const colWidth = isExpanded
    ? points.length <= 4
      ? 150
      : points.length <= 8
      ? 130
      : points.length <= 12
      ? 120
      : 112
    : points.length <= 4
    ? 110
    : points.length <= 8
    ? 100
    : 90
  const leftColWidth = isExpanded ? 'w-[78px] sm:w-[86px]' : 'w-[64px] sm:w-[70px]'
  const rowHeight = isExpanded ? 'h-14' : 'h-12'
  const headerHeight = isExpanded ? 'h-11' : 'h-9'
  const totalWidth = points.length * colWidth

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
    const scrollAmount = direction === 'left' ? -colWidth * 3 : colWidth * 3
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

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
          isExpanded ? 'left-[82px] sm:left-[90px]' : 'left-[70px] sm:left-[76px]'
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
        {/* ================= 1. ФІКСОВАНА ВЕРТИКАЛЬНА КОЛОНКА ЕШЕЛОНІВ (STICKY) ================= */}
        <div
          className={`sticky left-0 z-20 shrink-0 bg-white dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col ${leftColWidth}`}
        >
          {/* Шапка колонки: Назва блоку */}
          <div
            className={`flex flex-col items-center justify-center border-b border-slate-200 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800/80 px-1 text-center ${headerHeight}`}
          >
            <div className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
              <Layers className="w-3 h-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span className={`font-bold tracking-tight ${isExpanded ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-[11px]'}`}>
                Ешелон
              </span>
            </div>
          </div>

          {/* Рядки ешелонів по вертикалі */}
          {activeLevels.map((alt) => (
            <div
              key={`lvl-${alt}`}
              className={`flex items-center justify-center px-1 border-b border-slate-200 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-900/60 ${rowHeight}`}
              title={`Ешелон польоту ${alt} метрів`}
            >
              <span
                className={`font-bold font-mono text-slate-800 dark:text-slate-200 tracking-tight ${
                  isExpanded ? 'text-xs sm:text-sm' : 'text-[10.5px] sm:text-[11px]'
                }`}
              >
                {alt}м
              </span>
            </div>
          ))}
        </div>

        {/* ================= 2. ОБЛАСТЬ ПОГОДИННИХ КОЛОНОК (ГОДИНИ ГОРИЗОНТАЛЬНО) ================= */}
        <div
          className="relative flex flex-col shrink-0"
          style={{ width: `${totalWidth}px` }}
        >
          {/* Рядок 1: Години (без іконок за вимогою користувача) */}
          <div
            className={`flex border-b border-slate-200 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-800/80 ${headerHeight}`}
          >
            {points.map((pt) => (
              <div
                key={`time-${pt.timestamp}`}
                style={{ width: `${colWidth}px` }}
                className="flex items-center justify-center border-r border-slate-200 dark:border-slate-700/60 px-0.5 shrink-0"
              >
                <span
                  className={`font-bold font-mono tracking-tight text-slate-700 dark:text-slate-200 ${
                    isExpanded ? 'text-xs sm:text-sm' : 'text-[10.5px] sm:text-[11px]'
                  }`}
                >
                  {pt.time}
                </span>
              </div>
            ))}
          </div>

          {/* Рядки даних для кожного ешелону */}
          {activeLevels.map((alt) => {
            const hasNoGusts = alt >= 800

            return (
              <div
                key={`row-${alt}`}
                className={`flex border-b border-slate-200 dark:border-slate-700/60 bg-white dark:bg-transparent ${rowHeight}`}
              >
                {points.map((pt) => {
                  const levelData = pt.levels[alt]
                  if (!levelData) {
                    return (
                      <div
                        key={`data-${alt}-${pt.timestamp}`}
                        style={{ width: `${colWidth}px` }}
                        className="flex items-center justify-center border-r border-slate-200 dark:border-slate-800/80 text-slate-400 text-xs shrink-0"
                      >
                        —
                      </div>
                    )
                  }

                  // Нормалізований азимут напрямку вітру (куди дме)
                  const normDeg = ((Math.round(levelData.directionDeg) % 360) + 360) % 360
                  const speedVal = Math.round(levelData.speed)
                  const gustVal = levelData.gusts !== undefined ? Math.round(levelData.gusts) : '—'

                  // Оцінка безпеки вітру та поривів (5 рівнів градієнта з урахуванням галочок користувача)
                  const windActive = !warnings.enabled || warnings.enabled.wind !== false
                  const gustsActive = !warnings.enabled || warnings.enabled.gusts !== false
                  const windSev = windActive ? evaluateWind(levelData.speed, warnings.wind) : 'ideal'
                  const gustSev = (gustsActive && levelData.gusts !== undefined) ? evaluateGusts(levelData.gusts, warnings.gusts) : 'ideal'

                  return (
                    <div
                      key={`data-${alt}-${pt.timestamp}`}
                      style={{ width: `${colWidth}px` }}
                      className="flex items-center border-r border-slate-200 dark:border-slate-800/80 p-0.5 shrink-0"
                    >
                      {/* Ліва вузька комірка: Авіаційна стрілка напряму вітру (куди дме) + числовий азимут */}
                      <div
                        className={`flex flex-col items-center justify-center h-full shrink-0 border-r border-slate-200/80 dark:border-slate-700/70 bg-slate-50/70 dark:bg-slate-950/50 rounded-l-xs mr-0.5 ${
                          isExpanded ? 'w-[42px] sm:w-[46px]' : 'w-[32px] sm:w-[35px]'
                        }`}
                        title={`Напрямок руху вітру на ${alt}м: ${normDeg}°`}
                      >
                        <AviationWindBarb
                          speedMs={levelData.speed}
                          directionDeg={normDeg}
                          size={isExpanded ? 24 : 20}
                          showText={true}
                        />
                      </div>

                      {/* Права комірка:
                          - Для 800-3000м: без поривів, суцільна комірка лише зі швидкістю вітру
                          - Для <800м: діагональний поділ вітер / пориви */}
                      <div className="flex-1 h-full min-w-0 flex items-center justify-center">
                        {hasNoGusts ? (
                          <div
                            className={`w-full h-full flex items-center justify-center rounded-xs transition-colors select-none ${getSeverityCellClass(
                              windSev
                            )}`}
                            title={`Ешелон ${alt}м - Вітер: ${speedVal} м/с (пориви відсутні на висотах ≥800м)`}
                          >
                            <span
                              className={`font-bold font-mono ${
                                isExpanded ? 'text-xs sm:text-sm' : 'text-[11px] sm:text-xs'
                              }`}
                            >
                              {speedVal}
                            </span>
                          </div>
                        ) : (
                          <DiagonalSplitCell
                            topValue={speedVal}
                            topSeverity={windSev}
                            topTitle={`Ешелон ${alt}м - Вітер: ${speedVal} м/с`}
                            bottomValue={gustVal}
                            bottomSeverity={gustSev}
                            bottomTitle={`Ешелон ${alt}м - Пориви: ${gustVal !== '—' ? `${gustVal} м/с` : 'відсутні'}`}
                            isExpanded={isExpanded}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export const WindAltitudeCard: React.FC<WindAltitudeCardProps> = ({
  hourly = [],
  warnings,
  levels,
  depth,
  detail,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const depthHours = parseInt(depth, 10)
  const detailHours = parseInt(detail, 10)
  const maxLevelM = parseInt(levels, 10) || 800

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

  // Закриття модального вікна по Escape
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
    <>
      <ForecastCard
        title="Вітер по ешелонах"
        icon={Wind}
        className="self-start w-full"
      >
        <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden mt-1">
          <WindAltitudeGrid
            points={filteredPoints}
            activeLevels={activeLevels}
            warnings={warnings}
            isExpanded={false}
          />
        </div>

        {/* Нижній рядок: трек ліворуч, кнопка "Розгорнути" праворуч */}
        <div className="flex items-center justify-between mt-2.5 pt-1 shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Трек: крок {detailHours} год, глибина {depthHours} год, ешелони до {maxLevelM} м
          </span>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            title="Розгорнути вітер по ешелонах на весь екран"
            aria-label="Розгорнути вітер по ешелонах на весь екран"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors border border-slate-200 dark:border-slate-700/80 shadow-xs cursor-pointer"
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
          {/* Клік на фон для закриття */}
          <div
            className="absolute inset-0 -z-10 cursor-pointer"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-fit max-w-[95vw] lg:max-w-7xl max-h-[92vh] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Шапка модального вікна */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0">
              <div className="flex items-center gap-2.5">
                <Wind className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                    Вітер по ешелонах (погодинно)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Трек: крок {detailHours} год, глибина {depthHours} год, ешелони до {maxLevelM} м
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                title="Закрити вікно (Esc)"
                aria-label="Закрити вікно"
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border border-slate-300 dark:border-slate-700/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Вміст модального вікна з розгорнутим гридом */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col items-center sm:items-start min-h-0">
              <WindAltitudeGrid
                points={filteredPoints}
                activeLevels={activeLevels}
                warnings={warnings}
                isExpanded={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
