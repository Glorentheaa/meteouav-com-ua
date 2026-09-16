import React from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export type LimitRowProps =
  | {
      label: string
      type: 'select'
      value: string
      onChange: (value: string) => void
      options: readonly string[] | string[]
    }
  | {
      label: string
      type?: 'number'
      value: number
      onChange: (value: number) => void
      options?: never
    }

export const LimitRow: React.FC<LimitRowProps> = (props) => {
  const isOff = props.value === 'вимкнути'
  const borderColor = isOff ? 'border-l-emerald-500' : 'border-l-amber-500'

  return (
    <div
      className={`flex items-center justify-between gap-3 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 border-l-4 ${borderColor}`}
    >
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate pr-2">
        {props.label}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        {props.type === 'select' ? (
          <select
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            className="w-48 px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-emerald-500 dark:text-slate-200 transition-colors"
          >
            {props.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex items-center w-48 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus-within:border-emerald-500 transition-colors overflow-hidden">
            <input
              type="number"
              value={props.value}
              onChange={(e) => props.onChange(Number(e.target.value))}
              className="w-full px-2 py-1.5 text-xs bg-transparent focus:outline-none text-center dark:text-slate-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <div className="flex flex-col border-l border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 shrink-0">
              <button
                type="button"
                onClick={() => props.onChange(Number(props.value) + 1)}
                className="px-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors border-b border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => props.onChange(Number(props.value) - 1)}
                className="px-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-slate-600 dark:text-slate-300"
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
