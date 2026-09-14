import React from 'react'
import { CloudSun } from 'lucide-react'
import { Link } from 'react-router-dom'

export const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center px-4 py-12">
      <CloudSun className="w-20 h-20 text-slate-300 dark:text-slate-800 mb-6" />
      
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-800 dark:text-white mb-4">
        Сервіс у стадії розробки
      </h1>
      
      <p className="max-w-xl text-slate-600 dark:text-slate-400 text-base leading-relaxed mb-8">
        MeteoUAV знаходиться на етапі закритого калібрування та створення архітектури. 
        Основний робочий простір тимчасово доступний за посиланням нижче.
      </p>
      
      <Link 
        to="/app" 
        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-sm"
      >
        Перейти до МетеоКонсолі
      </Link>
    </div>
  )
}