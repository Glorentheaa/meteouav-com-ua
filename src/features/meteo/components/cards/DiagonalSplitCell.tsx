import React from 'react'
import type { WarningSeverity } from '../../types/meteoData'

interface DiagonalSplitCellProps {
  // Верхній лівий параметр
  topLabel?: string
  topValue: string | number | React.ReactNode
  topSeverity?: WarningSeverity
  topTitle?: string

  // Нижній правий параметр
  bottomLabel?: string
  bottomValue: string | number | React.ReactNode
  bottomSeverity?: WarningSeverity
  bottomTitle?: string

  className?: string
  isExpanded?: boolean
}

function getSplitBg(severity?: WarningSeverity): string {
  switch (severity) {
    case 'danger':
      return 'bg-rose-600/35 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
    case 'warning':
      return 'bg-amber-500/35 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
    case 'safe':
    default:
      return 'bg-emerald-500/20 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
  }
}

export const DiagonalSplitCell: React.FC<DiagonalSplitCellProps> = ({
  topLabel,
  topValue,
  topSeverity = 'safe',
  topTitle,
  bottomLabel,
  bottomValue,
  bottomSeverity = 'safe',
  bottomTitle,
  className = '',
  isExpanded = false,
}) => {
  const topClasses = getSplitBg(topSeverity)
  const bottomClasses = getSplitBg(bottomSeverity)

  const fullTitle = [
    topTitle || (topLabel ? `${topLabel}: ${topValue}` : String(topValue)),
    bottomTitle || (bottomLabel ? `${bottomLabel}: ${bottomValue}` : String(bottomValue)),
  ].join(' / ')

  return (
    <div
      className={`relative w-full h-full overflow-hidden border border-slate-200/50 dark:border-slate-700/60 rounded-sm select-none group transition-transform ${className}`}
      title={fullTitle}
    >
      {/* 1. Верхній лівий трикутник (полігон 0,0 -> 100%,0 -> 0,100%) */}
      <div
        className={`absolute inset-0 transition-colors ${topClasses}`}
        style={{
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
        }}
      />

      {/* 2. Нижній правий трикутник (полігон 100%,0 -> 100%,100% -> 0,100%) */}
      <div
        className={`absolute inset-0 transition-colors ${bottomClasses}`}
        style={{
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
        }}
      />

      {/* 3. Діагональна лінія розділювача */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-300/60 dark:stroke-slate-600/70"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <line x1="0" y1="100" x2="100" y2="0" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>

      {/* 4. Контент верхнього лівого кутка */}
      <div
        className={`absolute top-0.5 left-1 flex items-baseline gap-0.5 leading-none z-10 ${topClasses}`}
        style={{ background: 'transparent' }}
      >
        {topLabel && (
          <span className="text-[8px] opacity-75 font-normal mr-0.5">
            {topLabel}
          </span>
        )}
        <span
          className={`font-bold tracking-tight ${isExpanded ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-[11px]'
            }`}
        >
          {topValue}
        </span>
      </div>

      {/* 5. Контент нижнього правого кутка */}
      <div
        className={`absolute bottom-0.5 right-1 flex items-baseline gap-0.5 leading-none z-10 ${bottomClasses}`}
        style={{ background: 'transparent' }}
      >
        <span
          className={`font-bold tracking-tight ${isExpanded ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-[11px]'
            }`}
        >
          {bottomValue}
        </span>
        {bottomLabel && (
          <span className="text-[8px] opacity-75 font-normal ml-0.5">
            {bottomLabel}
          </span>
        )}
      </div>
    </div>
  )
}
