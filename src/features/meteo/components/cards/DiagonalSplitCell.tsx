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

function getSplitStyles(severity?: WarningSeverity) {
  switch (severity) {
    case 'danger':
      return {
        bg: 'bg-rose-200/90 dark:bg-rose-900/70',
        text: 'text-rose-950 dark:text-rose-100 font-extrabold',
      }
    case 'warning':
      return {
        bg: 'bg-orange-200/90 dark:bg-orange-900/70',
        text: 'text-orange-950 dark:text-orange-100 font-bold',
      }
    case 'attention':
      return {
        bg: 'bg-yellow-200/90 dark:bg-yellow-900/60',
        text: 'text-yellow-950 dark:text-yellow-100 font-semibold',
      }
    case 'favorable':
      return {
        bg: 'bg-emerald-800/20 dark:bg-emerald-950/80',
        text: 'text-emerald-950 dark:text-emerald-200 font-medium',
      }
    case 'ideal':
    case 'safe':
    default:
      return {
        bg: 'bg-emerald-500/20 dark:bg-emerald-900/40',
        text: 'text-emerald-900 dark:text-emerald-200 font-semibold',
      }
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
  const topStyles = getSplitStyles(topSeverity)
  const bottomStyles = getSplitStyles(bottomSeverity)

  const fullTitle = [
    topTitle || (topLabel ? `${topLabel}: ${topValue}` : String(topValue)),
    bottomTitle || (bottomLabel ? `${bottomLabel}: ${bottomValue}` : String(bottomValue)),
  ].join(' / ')

  return (
    <div
      className={`relative w-full h-full overflow-hidden border border-slate-200 dark:border-slate-700/60 rounded-sm select-none group transition-transform bg-white dark:bg-slate-900 ${className}`}
      title={fullTitle}
    >
      {/* 1. Верхній лівий трикутник (полігон 0,0 -> 100%,0 -> 0,100%) */}
      <div
        className={`absolute inset-0 transition-colors ${topStyles.bg}`}
        style={{
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
        }}
      />

      {/* 2. Нижній правий трикутник (полігон 100%,0 -> 100%,100% -> 0,100%) */}
      <div
        className={`absolute inset-0 transition-colors ${bottomStyles.bg}`}
        style={{
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
        }}
      />

      {/* 3. Діагональна лінія розділювача */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-300 dark:stroke-slate-600/70"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <line x1="0" y1="100" x2="100" y2="0" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      </svg>

      {/* 4. Контент верхнього лівого кутка */}
      <div
        className={`absolute top-0.5 left-1 flex items-baseline gap-0.5 leading-none z-10 ${topStyles.text}`}
      >
        {topLabel && (
          <span className="text-[8px] opacity-75 font-normal mr-0.5">
            {topLabel}
          </span>
        )}
        <span
          className={`font-bold tracking-tight ${
            isExpanded ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-[11px]'
          }`}
        >
          {topValue}
        </span>
      </div>

      {/* 5. Контент нижнього правого кутка */}
      <div
        className={`absolute bottom-0.5 right-1 flex items-baseline gap-0.5 leading-none z-10 ${bottomStyles.text}`}
      >
        <span
          className={`font-bold tracking-tight ${
            isExpanded ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-[11px]'
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
