import { CloudSun, Radio, ShieldCheck } from 'lucide-react'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 antialiased selection:bg-emerald-500 selection:text-slate-950">
      <header className="flex items-center justify-between max-w-4xl mx-auto w-full py-4">
        <div className="flex items-center gap-2 font-mono tracking-wider font-semibold text-lg">
          <CloudSun className="text-emerald-400 h-6 w-6" />
          <span>METEO<span className="text-emerald-400">UAV</span></span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-slate-400">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
          DEV IN PROGRESS
        </div>
      </header>

      <main className="max-w-xl mx-auto text-center flex flex-col items-center justify-center my-auto">
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl mb-6 shadow-inner">
          <Radio className="h-10 w-10 text-emerald-400" />
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          Тактичний метеосервіс для операторів БпЛА
        </h1>
        
        <p className="text-slate-400 leading-relaxed mb-8 text-sm sm:text-base">
          Платформа знаходиться на етапі закритої розробки та розгортання інфраструктури. 
          Аналіз вітру по висотах, розрахунок польотних параметрів і PWA-доступ будуть відкриті найближчим часом.
        </p>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-lg">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>meteouav.com.ua • Інфраструктура підключена</span>
        </div>
      </main>

      <footer className="text-center text-xs font-mono text-slate-500 max-w-4xl mx-auto w-full py-4 border-t border-slate-900">
        &copy; {new Date().getFullYear()} MeteoUAV. All rights reserved.
      </footer>
    </div>
  )
}