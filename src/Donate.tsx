import React from 'react'

export const Donate: React.FC = () => {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold text-white mb-2">Підтримка проєкту</h1>
      <p className="text-slate-400 text-sm max-w-md">
        Добровільні внески на покриття витрат серверної інфраструктури та підтримку API метеомоделей. Розділ на стадії підключення.
      </p>
    </main>
  )
}