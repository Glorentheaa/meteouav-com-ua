import React from 'react'

export const About: React.FC = () => {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold text-white mb-2">Про MeteoUAV</h1>
      <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
        Спеціалізований інструмент для підрозділів БпЛА. Призначений для швидкої оцінки метеорологічної обстановки у приземному шарі та на робочих висотах польоту.
      </p>
    </main>
  )
}