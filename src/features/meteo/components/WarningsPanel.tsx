import React from 'react'
import { Settings2, ChevronDown } from 'lucide-react'
import { LimitRow } from './LimitRow'
import type { MeteoWarnings } from '../types/meteo'

interface WarningsPanelProps {
  warnings: MeteoWarnings
  updateWarning: <K extends keyof MeteoWarnings>(key: K, value: MeteoWarnings[K]) => void
  isOpen: boolean
  onToggle: () => void
}

export const WarningsPanel: React.FC<WarningsPanelProps> = ({
  warnings,
  updateWarning,
  isOpen,
  onToggle,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full max-w-sm p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 transition-colors shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Попередження
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3 mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
          <LimitRow
            label="Макс. вітер (м/с)"
            value={warnings.wind}
            onChange={(val) => updateWarning('wind', val)}
          />
          <LimitRow
            label="Макс. пориви (м/с)"
            value={warnings.gusts}
            onChange={(val) => updateWarning('gusts', val)}
          />
          <LimitRow
            label="Опади"
            type="select"
            value={warnings.precip}
            onChange={(val) => updateWarning('precip', val)}
            options={['>0.1 мм', '>0.3 мм', 'вимкнути']}
          />
          <LimitRow
            label="Наявність туману"
            type="select"
            value={warnings.fog}
            onChange={(val) => updateWarning('fog', val)}
            options={['висока вірогідність', 'мала вірогідність', 'вимкнути']}
          />
          <LimitRow
            label="Вологість вище (%)"
            value={warnings.humidity}
            onChange={(val) => updateWarning('humidity', val)}
          />
          <LimitRow
            label="Видимість менше (км)"
            value={warnings.visibility}
            onChange={(val) => updateWarning('visibility', val)}
          />
          <LimitRow
            label="Мін. темп. (°C)"
            value={warnings.minTemp}
            onChange={(val) => updateWarning('minTemp', val)}
          />
          <LimitRow
            label="Макс. темп. (°C)"
            value={warnings.maxTemp}
            onChange={(val) => updateWarning('maxTemp', val)}
          />
        </div>
      )}
    </div>
  )
}
