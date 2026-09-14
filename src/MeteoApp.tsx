import React, { useState } from 'react'
import { MapPin, Settings2, Wind, Sunrise, Moon, CloudLightning, Activity, CalendarDays } from 'lucide-react'

export const MeteoApp: React.FC = () => {
  const [depth, setDepth] = useState<'24' | '48'>('48')
  const [detail, setDetail] = useState<'1' | '3'>('3')

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Шапка сторінки */}
      <header className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-wide mb-2">
              Консоль MeteoUAV
            </h1>
            <p className="text-base font-medium text-emerald-600 dark:text-emerald-500 mb-3">
              Тактичний прогноз погоди для БпЛА розроблений для територій України
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Забезпечує більш точне прогнозування завдяки власній математичній моделі обчислення сирих даних, врахування рельєфу України, а також використовуючи історичні стани погоди для порівняння. Просто налаштуйте власні параметри й отримайте результат.
            </p>
          </div>
          <span className="shrink-0 self-start text-xs font-mono px-2.5 py-1 bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 rounded">
            DEV ENVIRONMENT
          </span>
        </div>

        {/* Панель налаштувань */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm mt-2">
          <div className="flex flex-col lg:flex-row gap-6 mb-5">
            {/* Локація */}
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Оберіть локацію</label>
              <button className="flex items-center gap-2 px-3 py-2 w-full sm:max-w-xs rounded-lg border border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-slate-50 dark:bg-slate-950 transition-colors text-left">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-medium text-sm text-slate-700 dark:text-slate-200 truncate">Поточна геопозиція (Запоріжжя)</span>
              </button>
            </div>
            
            {/* Перемикачі глибини та деталізації */}
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Глибина</label>
                <div className="flex bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-0.5">
                  <button onClick={() => setDepth('24')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${depth === '24' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>24 год</button>
                  <button onClick={() => setDepth('48')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${depth === '48' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>48 год</button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Деталізація</label>
                <div className="flex bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-0.5">
                  <button onClick={() => setDetail('1')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${detail === '1' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>1 год</button>
                  <button onClick={() => setDetail('3')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${detail === '3' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>3 год</button>
                </div>
              </div>
            </div>
          </div>

          {/* Критичні показники */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Settings2 className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Критичні показники засобу (заборона вильоту)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-md text-xs font-semibold">Вітер &gt; 12 м/с</span>
              <span className="px-3 py-1 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-md text-xs font-semibold">Пориви &gt; 14 м/с</span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-md text-xs font-semibold">Опади / Дощ</span>
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold">Вологість &gt; 98%</span>
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold">Туман</span>
              <span className="px-3 py-1 bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 rounded-md text-xs font-semibold">-20°C / +40°C</span>
            </div>
          </div>
        </div>
      </header>

      {/* Дашборд з інформаційними блоками */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-2">
        
        {/* Блок 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-5 rounded-xl flex flex-col h-64">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
            <CloudLightning className="w-5 h-5 text-emerald-500" /> Прогноз на добу
          </h2>
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg flex items-center justify-center">
            <span className="text-slate-400 text-sm">Таблиця погодних явищ</span>
          </div>
          <p className="text-xs text-slate-500 mt-3 text-right">Оновлено: 10 хв тому</p>
        </div>

        {/* Блок 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-5 rounded-xl flex flex-col h-64">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
            <Wind className="w-5 h-5 text-emerald-500" /> Зріз вітру по ешелонах
          </h2>
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg flex items-center justify-center">
            <span className="text-slate-400 text-sm">Графік шарів вітру (0-1000м)</span>
          </div>
          <p className="text-xs text-slate-500 mt-3 text-right">Модель: ICON-EU</p>
        </div>

        {/* Блок 3 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-5 rounded-xl flex flex-col h-64">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-emerald-500" /> Вікна для польотів (доба)
          </h2>
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg flex items-center justify-center">
            <span className="text-slate-400 text-sm">Таймлайн безпечних зон</span>
          </div>
          <p className="text-xs text-slate-500 mt-3 text-right">Враховано критичні показники</p>
        </div>

        {/* Блок 4 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-5 rounded-xl flex flex-col h-64">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
            <Sunrise className="w-5 h-5 text-emerald-500" /> Схід / Захід (Сонце та Місяць)
          </h2>
          <div className="flex-1 grid grid-cols-2 gap-4">
             <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col items-center justify-center">
                <Sunrise className="w-8 h-8 text-amber-500 mb-2" />
                <span className="text-sm font-semibold">05:40 - 20:15</span>
             </div>
             <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col items-center justify-center">
                <Moon className="w-8 h-8 text-indigo-400 mb-2" />
                <span className="text-sm font-semibold">22:10 - 06:30</span>
             </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 text-right">Освітленість: 84%</p>
        </div>

        {/* Блок 5 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-5 rounded-xl flex flex-col h-64 lg:col-span-2">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-emerald-500" /> Висновки ШІ
          </h2>
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 italic">
              "Очікується погіршення умов після 14:00 через проходження холодного фронту. 
              Прогнозуються пориви вітру до 16 м/с на висоті 200м. Оптимальне вікно для виконання завдань: з 06:00 до 11:30. 
              Імовірність опадів у вечірній час перевищує 80%."
            </p>
          </div>
          <p className="text-xs text-slate-500 mt-3 text-right">Згенеровано моделлю MeteoLLM</p>
        </div>

        {/* Блок 6 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-5 rounded-xl flex flex-col h-64 lg:col-span-2">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-emerald-500" /> Прогноз на тиждень
          </h2>
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg flex items-center justify-center">
            <span className="text-slate-400 text-sm">Спрощений потижневий огляд</span>
          </div>
          <p className="text-xs text-slate-500 mt-3 text-right">Тенденція: зниження тиску</p>
        </div>

      </section>
    </div>
  )
}