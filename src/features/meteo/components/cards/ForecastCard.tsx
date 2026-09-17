import React from 'react'

interface ForecastCardProps {
  title: string
  icon: React.ComponentType<{ className?: string }>
  updatedText?: string | null
  className?: string
  criticalNotice?: string | null
  headerAction?: React.ReactNode
  children: React.ReactNode
}

export const ForecastCard: React.FC<ForecastCardProps> = ({
  title,
  icon: Icon,
  updatedText,
  className = '',
  criticalNotice,
  headerAction,
  children,
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-4 sm:p-5 rounded-xl flex flex-col shadow-sm transition-all overflow-hidden ${className}`}
    >
      {/* Заголовок картки */}
      <div className="flex items-center justify-between mb-3 shrink-0 gap-2">
        <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 truncate">
          <Icon className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="truncate">{title}</span>
        </h2>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </div>

      {/* Основний вміст картки (адаптивний по висоті та ширині) */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">{children}</div>

      {/* Рядок критичних попереджень внизу картки під інфо */}
      {criticalNotice && (
        <div className="mt-2.5 px-2.5 py-1.5 rounded bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-[11px] leading-tight flex items-start gap-1.5 shrink-0 animate-in fade-in duration-200">
          <span className="shrink-0 font-bold">⚠️</span>
          <span className="font-medium">{criticalNotice}</span>
        </div>
      )}

      {/* Підвал оновлення */}
      {updatedText && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-right shrink-0">
          {updatedText}
        </p>
      )}
    </div>
  )
}
