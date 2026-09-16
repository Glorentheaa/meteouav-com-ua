import React from 'react'
import { CloudSun } from 'lucide-react'

export const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center px-4 py-12">
      <CloudSun className="w-20 h-20 text-slate-300 dark:text-slate-800 mb-6" />
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-800 dark:text-white mb-4">
        Сервіс у стадії розробки
      </h1>
      <p className="max-w-xl text-slate-600 dark:text-slate-400 text-base leading-relaxed mb-8">
        MeteoUAV знаходиться на етапі закритого калібрування та створення архітектури.
      </p>
    </div>
  )
}
