import React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export type LimitRowProps =
  | {
      label: string
      type: 'select'
      value: string
      onChange: (value: string) => void
      options: readonly string[] | string[]
      isEnabled?: boolean
      onToggleEnabled?: (enabled: boolean) => void
    }
  | {
      label: string
      type?: 'number'
      value: number
      onChange: (value: number) => void
      options?: never
      isEnabled?: boolean
      onToggleEnabled?: (enabled: boolean) => void
      step?: number
      min?: number
      max?: number
    }

export const LimitRow: React.FC<LimitRowProps> = (props) => {
  const isEnabled = props.isEnabled !== false
  const isOff = !isEnabled || props.value === 'вимкнути'
  const borderColor = isOff
    ? 'border-l-slate-300 dark:border-l-slate-600'
    : 'border-l-amber-500'

  return (
    <div
      className={`flex items-center justify-between gap-2 sm:gap-3 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 border-l-4 ${borderColor} transition-all`}
    >
      {/* Галочка вмикання/вимикання параметру перед назвою */}
      <label className="flex items-center gap-2 cursor-pointer select-none min-w-0 flex-1">
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={(e) => props.onToggleEnabled?.(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0 accent-emerald-600"
        />
        <span
          className={`text-xs font-medium truncate pr-1 transition-colors ${
            isEnabled
              ? 'text-slate-700 dark:text-slate-300'
              : 'text-slate-400 dark:text-slate-500 line-through opacity-75'
          }`}
          title={props.label}
        >
          {props.label}
        </span>
      </label>

      <div
        className={`flex items-center gap-2 shrink-0 transition-opacity ${
          isEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'
        }`}
      >
        {props.type === 'select' ? (
          <select
            disabled={!isEnabled}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            className="w-36 sm:w-44 px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-emerald-500 dark:text-slate-200 transition-colors disabled:cursor-not-allowed"
          >
            {props.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex items-center w-36 sm:w-44 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus-within:border-emerald-500 transition-colors overflow-hidden">
            <input
              type="number"
              disabled={!isEnabled}
              value={props.value}
              onChange={(e) => props.onChange(Number(e.target.value))}
              min={props.min}
              max={props.max}
              step={props.step || 1}
              className="w-full px-2 py-1.5 text-xs bg-transparent focus:outline-none text-center dark:text-slate-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:cursor-not-allowed"
            />
            <div className="flex flex-col border-l border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 shrink-0">
              <button
                type="button"
                disabled={!isEnabled}
                onClick={() => props.onChange(Number(props.value) + (props.step || 1))}
                className="px-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors border-b border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 disabled:cursor-not-allowed"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                disabled={!isEnabled}
                onClick={() => props.onChange(Number(props.value) - (props.step || 1))}
                className="px-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-slate-600 dark:text-slate-300 disabled:cursor-not-allowed"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
