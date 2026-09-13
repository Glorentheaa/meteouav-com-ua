import React from 'react'

export const Home: React.FC = () => {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <span className="px-3 py-1 bg-cyan-950/60 border border-cyan-800 text-cyan-400 text-xs tracking-widest uppercase font-mono rounded-full mb-4">
        MeteoUAV Platform
      </span>
      <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
        Тактичний метеосервіс БпЛА
      </h1>
      <p className="max-w-xl text-slate-400 text-sm sm:text-base leading-relaxed">
        Спеціалізовані розрахунки вітрового профілю, висоти хмарності та умов виконання польотів. Сервіс знаходиться в стадії розробки та закритого калібрування.
      </p>
    </main>
  )
}