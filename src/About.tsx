import React from 'react'

export const About: React.FC = () => (
  <div className="w-full flex flex-col gap-6">
    <header className="border-b border-slate-300 dark:border-slate-800 pb-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Про проєкт</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Інформація про розробку та архітектуру.</p>
    </header>
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm dark:shadow-none">
      <p className="text-slate-500 dark:text-slate-400">Сторінка в розробці...</p>
    </div>
  </div>
)