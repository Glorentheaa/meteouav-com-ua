import React from 'react'
import { ChevronDown } from 'lucide-react'

interface SectionDividerProps {
  isOpen: boolean
  onToggle: () => void
  label: string
  className?: string
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
  isOpen,
  onToggle,
  label,
  className = 'my-2',
}) => {
  return (
    <div
      onClick={onToggle}
      className={`flex flex-col items-center cursor-pointer group select-none ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle()
        }
      }}
    >
      <div className="w-full h-px bg-slate-300 dark:bg-slate-700 mb-2 group-hover:bg-emerald-500/50 transition-colors" />
      <div className="flex items-center justify-center gap-3 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors px-4 w-full">
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
        <span className="text-[11px] font-medium text-center">{label}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>
    </div>
  )
}
