import React from 'react'

export const MeteoApp: React.FC = () => {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="border-b border-slate-800 pb-4 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">MeteoUAV Console</h1>
          <p className="text-xs text-slate-400">Робочий простір тактичного прогнозування</p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 bg-cyan-950 border border-cyan-800 text-cyan-400 rounded">
          DEV ENVIRONMENT
        </span>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <h2 className="text-sm font-semibold text-slate-300 mb-2">Приземний шар (0-100м)</h2>
          <p className="text-xs text-slate-500">Модуль розрахунку вітру та поривів</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <h2 className="text-sm font-semibold text-slate-300 mb-2">Робочий ешелон</h2>
          <p className="text-xs text-slate-500">Висота нижньої межі хмар та зсув вітру</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <h2 className="text-sm font-semibold text-slate-300 mb-2">Політне вікно</h2>
          <p className="text-xs text-slate-500">Індекси безпеки за типами БпЛА</p>
        </div>
      </section>
    </main>
  )
}