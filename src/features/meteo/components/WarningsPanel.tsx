import React from 'react'
import { Settings2, ChevronDown } from 'lucide-react'
import { LimitRow } from './LimitRow'
import type { MeteoWarnings, WarningKey } from '../types/meteo'

interface WarningsPanelProps {
  warnings: MeteoWarnings
  updateWarning: <K extends keyof MeteoWarnings>(key: K, value: MeteoWarnings[K]) => void
  toggleWarningEnabled?: (key: WarningKey, enabled: boolean) => void
  isOpen: boolean
  onToggle: () => void
}

export const WarningsPanel: React.FC<WarningsPanelProps> = ({
  warnings,
  updateWarning,
  toggleWarningEnabled,
  isOpen,
  onToggle,
}) => {
  const handleToggle = (key: WarningKey, enabled: boolean) => {
    if (toggleWarningEnabled) {
      toggleWarningEnabled(key, enabled)
    } else {
      updateWarning('enabled', {
        ...(warnings.enabled || {}),
        [key]: enabled,
      })
    }
  }

  const isEnabled = (key: WarningKey) => {
    return warnings.enabled ? warnings.enabled[key] !== false : true
  }

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
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
            10 параметрів
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
          {/* 1. Макс. вітер */}
          <LimitRow
            label="Макс. вітер (м/с)"
            value={warnings.wind}
            onChange={(val) => updateWarning('wind', val)}
            isEnabled={isEnabled('wind')}
            onToggleEnabled={(enabled) => handleToggle('wind', enabled)}
          />

          {/* 2. Макс. пориви */}
          <LimitRow
            label="Макс. пориви (м/с)"
            value={warnings.gusts}
            onChange={(val) => updateWarning('gusts', val)}
            isEnabled={isEnabled('gusts')}
            onToggleEnabled={(enabled) => handleToggle('gusts', enabled)}
          />

          {/* 3. Кромка хмар */}
          <LimitRow
            label="Кромка хмар нижче (м)"
            value={warnings.cloudBase ?? 300}
            step={50}
            min={0}
            max={3000}
            onChange={(val) => updateWarning('cloudBase', val)}
            isEnabled={isEnabled('cloudBase')}
            onToggleEnabled={(enabled) => handleToggle('cloudBase', enabled)}
          />

          {/* 4. Видимість */}
          <LimitRow
            label="Видимість менше (км)"
            value={warnings.visibility}
            step={1}
            min={0}
            max={20}
            onChange={(val) => updateWarning('visibility', val)}
            isEnabled={isEnabled('visibility')}
            onToggleEnabled={(enabled) => handleToggle('visibility', enabled)}
          />

          {/* 5. Опади */}
          <LimitRow
            label="Опади"
            type="select"
            value={warnings.precip}
            onChange={(val) => updateWarning('precip', val)}
            options={['>0.1 мм', '>0.3 мм', 'вимкнути']}
            isEnabled={isEnabled('precip')}
            onToggleEnabled={(enabled) => handleToggle('precip', enabled)}
          />

          {/* 6. Наявність туману */}
          <LimitRow
            label="Наявність туману"
            type="select"
            value={warnings.fog}
            onChange={(val) => updateWarning('fog', val)}
            options={['висока вірогідність', 'мала вірогідність', 'вимкнути']}
            isEnabled={isEnabled('fog')}
            onToggleEnabled={(enabled) => handleToggle('fog', enabled)}
          />

          {/* 7. Вологість */}
          <LimitRow
            label="Вологість вище (%)"
            value={warnings.humidity}
            step={1}
            min={0}
            max={100}
            onChange={(val) => updateWarning('humidity', val)}
            isEnabled={isEnabled('humidity')}
            onToggleEnabled={(enabled) => handleToggle('humidity', enabled)}
          />

          {/* 8. Мін. темп. */}
          <LimitRow
            label="Мін. темп. (°C)"
            value={warnings.minTemp}
            step={1}
            min={-50}
            max={50}
            onChange={(val) => updateWarning('minTemp', val)}
            isEnabled={isEnabled('minTemp')}
            onToggleEnabled={(enabled) => handleToggle('minTemp', enabled)}
          />

          {/* 9. Макс. темп. */}
          <LimitRow
            label="Макс. темп. (°C)"
            value={warnings.maxTemp}
            step={1}
            min={-50}
            max={60}
            onChange={(val) => updateWarning('maxTemp', val)}
            isEnabled={isEnabled('maxTemp')}
            onToggleEnabled={(enabled) => handleToggle('maxTemp', enabled)}
          />

          {/* 10. КР-індекс */}
          <LimitRow
            label="КР-індекс вище (0-9)"
            value={warnings.kpIndex ?? 5}
            step={1}
            min={0}
            max={9}
            onChange={(val) => updateWarning('kpIndex', val)}
            isEnabled={isEnabled('kpIndex')}
            onToggleEnabled={(enabled) => handleToggle('kpIndex', enabled)}
          />
        </div>
      )}
    </div>
  )
}
