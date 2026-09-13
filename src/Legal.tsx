import React from 'react'

export const Legal: React.FC = () => {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold text-white mb-2">Правова інформація</h1>
      <p className="text-slate-400 text-sm max-w-md leading-relaxed">
        © 2026 MeteoUAV. Всі права захищено. Сервіс надає розрахункові метеодані «як є» виключно для інформаційної підтримки планування польотів.
      </p>
    </main>
  )
}