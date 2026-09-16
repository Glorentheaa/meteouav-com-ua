import React from 'react'
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
  return (
    <div className="p-4 sm:p-5 flex flex-col gap-6 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Перемикачі в ряд */}
      <div className="flex flex-wrap gap-5 lg:gap-8">
        <div>
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
            Глибина (год)
          </label>
          <div className="flex bg-slate-200/50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-0.5 shadow-inner">
            {DEPTH_OPTIONS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setDepth(val)}
                className={`px-4 py-1 text-xs font-medium rounded transition-colors ${
                  depth === val
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-400 border border-transparent'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
            Деталізація (год)
          </label>
          <div className="flex bg-slate-200/50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-0.5 shadow-inner">
            {DETAIL_OPTIONS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setDetail(val)}
                className={`px-4 py-1 text-xs font-medium rounded transition-colors ${
                  detail === val
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-400 border border-transparent'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
            Ешелони (до ... м)
          </label>
          <div className="flex bg-slate-200/50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-0.5 shadow-inner flex-wrap">
            {LEVEL_OPTIONS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setLevels(val)}
                className={`px-4 py-1 text-xs font-medium rounded transition-colors ${
                  levels === val
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-400 border border-transparent'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
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
