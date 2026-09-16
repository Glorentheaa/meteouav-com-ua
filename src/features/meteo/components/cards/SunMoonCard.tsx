import React from 'react'
import { Sunrise, Sunset, Moon, Sun, Sparkles } from 'lucide-react'
import { ForecastCard } from './ForecastCard'
import type { AstronomyData } from '../../types/meteoData'

interface SunMoonCardProps {
  isWeeklyVisible?: boolean
  astronomy?: AstronomyData
}

export const SunMoonCard: React.FC<SunMoonCardProps> = ({
  isWeeklyVisible = true,
  astronomy,
}) => {
  const data: AstronomyData = astronomy || {
    sun: {
      sunrise: '05:46',
      sunset: '19:24',
      daylightDuration: '13 год 38 хв',
      civilTwilightStart: '05:14',
      civilTwilightEnd: '19:56',
    },
    moon: {
      moonrise: '20:48',
      moonset: '07:12',
      phaseName: 'Перша чверть',
      illuminationPct: 54,
    },
  }

  return (
    <ForecastCard
      title="Схід/Захід сонця та луни"
      icon={Sunrise}
      className={isWeeklyVisible ? 'lg:col-span-1' : 'lg:col-span-3'}
    >
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        {/* Сонце */}
        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Сонце
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
              День: {data.sun.daylightDuration}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center my-1">
            <div className="p-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
                <Sunrise className="w-3.5 h-3.5 text-amber-500" />
                <span>Схід</span>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {data.sun.sunrise}
              </span>
            </div>

            <div className="p-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
                <Sunset className="w-3.5 h-3.5 text-orange-500" />
                <span>Захід</span>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {data.sun.sunset}
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 text-center mt-1 border-t border-slate-200/60 dark:border-slate-800 pt-1">
            Сутінки (оптика без ТПВ): <span className="font-semibold text-slate-700 dark:text-slate-300">{data.sun.civilTwilightStart} — {data.sun.civilTwilightEnd}</span>
          </div>
        </div>

        {/* Місяць / Луна */}
        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Луна (Місяць)
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              {data.moon.illuminationPct}% світла
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center my-1">
            <div className="p-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">Схід</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {data.moon.moonrise}
              </span>
            </div>

            <div className="p-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">Захід</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {data.moon.moonset}
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 dark:text-slate-400 text-center mt-1 border-t border-slate-200/60 dark:border-slate-800 pt-1">
            Фаза: <span className="font-semibold text-slate-700 dark:text-slate-300">{data.moon.phaseName}</span>
          </div>
        </div>
      </div>
    </ForecastCard>
  )
}
