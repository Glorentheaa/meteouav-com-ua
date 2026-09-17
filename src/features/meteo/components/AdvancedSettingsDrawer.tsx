import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, X } from 'lucide-react'
import { useAuth } from '../../../context/useAuth'
import { WarningsPanel } from './WarningsPanel'
import type {
  ForecastDepth,
  ForecastDetail,
  FlightLevels,
  MeteoWarnings,
} from '../types/meteo'

interface AdvancedSettingsDrawerProps {
  depth: ForecastDepth
  setDepth: (depth: ForecastDepth) => void
  detail: ForecastDetail
  setDetail: (detail: ForecastDetail) => void
  levels: FlightLevels
  setLevels: (levels: FlightLevels) => void
  warnings: MeteoWarnings
  updateWarning: <K extends keyof MeteoWarnings>(key: K, value: MeteoWarnings[K]) => void
  showWarnings: boolean
  setShowWarnings: (show: boolean | ((prev: boolean) => boolean)) => void
  onFactoryReset: () => void
  onSave: () => void
}

const DEPTH_OPTIONS: readonly ForecastDepth[] = ['24', '48']
const DETAIL_OPTIONS: readonly ForecastDetail[] = ['1', '3', '6']
const LEVEL_OPTIONS: readonly FlightLevels[] = ['300', '500', '800', '3000']

export const AdvancedSettingsDrawer: React.FC<AdvancedSettingsDrawerProps> = ({
  depth,
  setDepth,
  detail,
  setDetail,
  levels,
  setLevels,
  warnings,
  updateWarning,
  showWarnings,
  setShowWarnings,
  onFactoryReset,
  onSave,
}) => {
  const { isPro } = useAuth()
  const [activePopover, setActivePopover] = useState<'depth' | 'detail' | 'levels' | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Якщо користувач не має PRO, автоматично повертаємо базові значення, якщо були вибрані заблоковані
  useEffect(() => {
    if (!isPro) {
      if (depth === '48') setDepth('24')
      if (detail === '1') setDetail('3')
      if (levels === '3000') setLevels('800')
    }
  }, [isPro, depth, detail, levels, setDepth, setDetail, setLevels])

  // Показ спливаючого вікна на 4 секунди
  const handleTriggerPopover = (group: 'depth' | 'detail' | 'levels') => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setActivePopover(group)
    timerRef.current = setTimeout(() => {
      setActivePopover(null)
    }, 4000)
  }

  // Утримання вікна при наведенні мишки
  const handlePopoverMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  // Відновлення таймера закриття, коли курсор пішов геть
  const handlePopoverMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setActivePopover(null)
    }, 2000)
  }

  // Очищення таймера при демонтажі
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div className="p-4 sm:p-5 flex flex-col gap-6 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Перемикачі в ряд */}
      <div className="flex flex-wrap gap-5 lg:gap-8">
        {/* 1. Глибина */}
        <div className="relative">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
            Глибина (год)
          </label>
          <div className="flex bg-slate-200/50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-0.5 shadow-inner">
            {DEPTH_OPTIONS.map((val) => {
              const isLocked = !isPro && val === '48'
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    if (isLocked) {
                      handleTriggerPopover('depth')
                    } else {
                      setDepth(val)
                    }
                  }}
                  className={`px-4 py-1 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1 ${
                    depth === val
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-400 border border-transparent hover:text-slate-900 dark:hover:text-slate-200'
                  } ${isLocked ? 'cursor-pointer' : ''}`}
                >
                  <span>{val}</span>
                  {isLocked && (
                    <Heart className="w-2.5 h-2.5 text-amber-500 fill-amber-500/30 shrink-0" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Спливаюче вікно для Глибини */}
          {activePopover === 'depth' && (
            <div
              onMouseEnter={handlePopoverMouseEnter}
              onMouseLeave={handlePopoverMouseLeave}
              className="absolute top-full left-0 mt-2 z-40 w-72 p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/40 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-200"
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                  <Heart className="w-3.5 h-3.5 fill-amber-500/30" />
                </div>
                <div className="flex-1 text-[11.5px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  Ці функції відкриваємо за ваші донати, докладніше прочитати ви можете{' '}
                  <Link
                    to="/donate"
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline"
                  >
                    тут
                  </Link>
                  .
                </div>
                <button
                  type="button"
                  onClick={() => setActivePopover(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                  aria-label="Закрити"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. Деталізація */}
        <div className="relative">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
            Деталізація (год)
          </label>
          <div className="flex bg-slate-200/50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-0.5 shadow-inner">
            {DETAIL_OPTIONS.map((val) => {
              const isLocked = !isPro && val === '1'
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    if (isLocked) {
                      handleTriggerPopover('detail')
                    } else {
                      setDetail(val)
                    }
                  }}
                  className={`px-4 py-1 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1 ${
                    detail === val
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-400 border border-transparent hover:text-slate-900 dark:hover:text-slate-200'
                  } ${isLocked ? 'cursor-pointer' : ''}`}
                >
                  <span>{val}</span>
                  {isLocked && (
                    <Heart className="w-2.5 h-2.5 text-amber-500 fill-amber-500/30 shrink-0" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Спливаюче вікно для Деталізації */}
          {activePopover === 'detail' && (
            <div
              onMouseEnter={handlePopoverMouseEnter}
              onMouseLeave={handlePopoverMouseLeave}
              className="absolute top-full left-0 mt-2 z-40 w-72 p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/40 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-200"
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                  <Heart className="w-3.5 h-3.5 fill-amber-500/30" />
                </div>
                <div className="flex-1 text-[11.5px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  Ці функції відкриваємо за ваші донати, докладніше прочитати ви можете{' '}
                  <Link
                    to="/donate"
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline"
                  >
                    тут
                  </Link>
                  .
                </div>
                <button
                  type="button"
                  onClick={() => setActivePopover(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                  aria-label="Закрити"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Ешелони */}
        <div className="relative">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
            Ешелони (до ... м)
          </label>
          <div className="flex bg-slate-200/50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-0.5 shadow-inner flex-wrap">
            {LEVEL_OPTIONS.map((val) => {
              const isLocked = !isPro && val === '3000'
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    if (isLocked) {
                      handleTriggerPopover('levels')
                    } else {
                      setLevels(val)
                    }
                  }}
                  className={`px-4 py-1 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1 ${
                    levels === val
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-400 border border-transparent hover:text-slate-900 dark:hover:text-slate-200'
                  } ${isLocked ? 'cursor-pointer' : ''}`}
                >
                  <span>{val}</span>
                  {isLocked && (
                    <Heart className="w-2.5 h-2.5 text-amber-500 fill-amber-500/30 shrink-0" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Спливаюче вікно для Ешелонів */}
          {activePopover === 'levels' && (
            <div
              onMouseEnter={handlePopoverMouseEnter}
              onMouseLeave={handlePopoverMouseLeave}
              className="absolute top-full left-0 mt-2 z-40 w-72 p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/40 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-200"
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                  <Heart className="w-3.5 h-3.5 fill-amber-500/30" />
                </div>
                <div className="flex-1 text-[11.5px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  Ці функції відкриваємо за ваші донати, докладніше прочитати ви можете{' '}
                  <Link
                    to="/donate"
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline"
                  >
                    тут
                  </Link>
                  .
                </div>
                <button
                  type="button"
                  onClick={() => setActivePopover(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                  aria-label="Закрити"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Підменю "Попередження" */}
      <WarningsPanel
        warnings={warnings}
        updateWarning={updateWarning}
        isOpen={showWarnings}
        onToggle={() => setShowWarnings((prev) => !prev)}
      />

      {/* Кнопки збереження та скидання */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onFactoryReset}
          className="px-5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors shadow-sm"
        >
          Скинути до базових
        </button>
        <button
          type="button"
          onClick={onSave}
          className="px-6 py-2 text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-lg transition-colors shadow-sm"
        >
          Зберегти
        </button>
      </div>
    </div>
  )
}
