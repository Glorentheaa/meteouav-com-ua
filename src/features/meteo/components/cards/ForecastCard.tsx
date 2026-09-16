import React from 'react'

interface ForecastCardProps {
  title: string
  icon: React.ComponentType<{ className?: string }>
  updatedText?: string
  className?: string
  children: React.ReactNode
}

export const ForecastCard: React.FC<ForecastCardProps> = ({
  title,
  icon: Icon,
  updatedText = 'Оновлено 00:10:05 назад',
  className = '',
  children,
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-5 rounded-xl flex flex-col h-64 shadow-sm ${className}`}
    >
      <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-emerald-500" /> {title}
      </h2>
      <div className="flex-1 flex flex-col min-h-0">{children}</div>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 text-right">
        {updatedText}
      </p>
    </div>
  )
}
