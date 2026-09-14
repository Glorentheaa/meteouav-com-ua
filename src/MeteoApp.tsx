import React from 'react'

export const MeteoApp: React.FC = () => {
  return (
    <div className="w-full flex flex-col gap-6">
      <header className="border-b border-slate-200 dark:border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-wide">
            MeteoUAV Console
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Робочий простір тактичного прогнозування
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 rounded">
          DEV ENVIRONMENT
        </span>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm dark:shadow-none">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-300 mb-2">Приземний шар (0-100м)</h2>
          <p className="text-sm text-slate-500">Модуль розрахунку вітру та поривів</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm dark:shadow-none">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-300 mb-2">Робочий ешелон</h2>
          <p className="text-sm text-slate-500">Висота нижньої межі хмар та зсув вітру</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm dark:shadow-none">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-300 mb-2">Політне вікно</h2>
          <p className="text-sm text-slate-500">Індекси безпеки за типами БпЛА</p>
        </div>
      </section>
    </div>
  )
}