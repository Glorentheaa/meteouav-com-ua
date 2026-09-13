import React from 'react'

export const Settings: React.FC = () => {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold text-white mb-2">Параметри системи</h1>
      <p className="text-slate-400 text-sm max-w-md">
        Розділ локальних конфігурацій, вибору одиниць вимірювання (м/с, вузли) та інтеграцій. Доступний без авторизації. Знаходиться в розробці.
      </p>
    </main>
  )
}