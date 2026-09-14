import React, { useState } from 'react'
import { MapPin, Settings2, Wind, Sunrise, Moon, CloudLightning, Activity, CalendarDays, ChevronDown } from 'lucide-react'

// Допоміжний компонент для рядка налаштувань
const LimitRow = ({ label, type = 'number', defaultValue, options }: any) => {
  const borderColor = type === 'select' && defaultValue === 'Дозволено' ? 'border-l-emerald-500' : 'border-l-rose-500'
  
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800 border-l-4 ${borderColor}`}>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {type === 'select' ? (
          <select className="flex-1 sm:w-32 px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:border-emerald-500 dark:text-slate-200 transition-colors">
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input type="number" defaultValue={defaultValue} className="flex-1 sm:w-24 px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:border-emerald-500 text-center dark:text-slate-200 transition-colors" />
        )}
        <button className="px-3 py-1.5 text-sm font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-md hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors shadow-sm">
          Зберегти
        </button>
      </div>
    </div>
  )
}

export const MeteoApp: React.FC = () => {
  const [depth, setDepth] = useState<'24' | '48'>('48')
  const [detail, setDetail] = useState<'1' | '3'>('3')
  const [levels, setLevels] = useState<'300' | '1000' | '3000'>('1000')
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLimitsOpen, setIsLimitsOpen] = useState(false)
  
  const todayDate = new Date().toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Шапка сторінки */}
      <header className="flex flex-col gap-4">
        <div className="max-w-3xl">
          <p className="text-base font-medium text-emerald-600 dark:text-emerald-500 mb-2">
            Тактичний прогноз погоди MeteoUAV необхідний пілотам і не тільки.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Просте використання, найточніші дані, легка доступність в поєднанні з розширеними можливостями.
          </p>
        </div>

        {/* Панель параметрів */}
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm mt-2 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Оберіть параметри прогнозу</h2>
          
          {/* Локація (Завжди видима) */}
          <div>
            <button className="flex items-center gap-2 px-3 py-2 w-full sm:max-w-xs rounded-lg border border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-slate-50 dark:bg-slate-950 transition-colors text-left">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-medium text-sm text-slate-700 dark:text-slate-200 truncate">Поточна геопозиція (Запоріжжя)</span>
            </button>
          </div>

          {/* Розгортання налаштувань */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
            <button 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="flex items-center justify-between w-full group py-1 outline-none"
            >
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Налаштування
                </span>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isSettingsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSettingsOpen && (
              <div className="mt-4 flex flex-col gap-5 pl-0 sm:pl-7 border-l-2 border-transparent sm:border-slate-100 dark:sm:border-slate-800">
                {/* Глибина, Деталізація, Ешелони */}
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Деталізація</label>
                    <div className="flex bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-0.5">
                      <button onClick={() => setDetail('1')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${detail === '1' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>1 год</button>
                      <button onClick={() => setDetail('3')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${detail === '3' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>3 год</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Глибина</label>
                    <div className="flex bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-0.5">
                      <button onClick={() => setDepth('24')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${depth === '24' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>24 год</button>
                      <button onClick={() => setDepth('48')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${depth === '48' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>48 год</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Ешелони</label>
                    <div className="flex bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-0.5">
                      <button onClick={() => setLevels('300')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${levels === '300' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>до 300</button>
                      <button onClick={() => setLevels('1000')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${levels === '1000' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>до 1000</button>
                      <button onClick={() => setLevels('3000')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${levels === '3000' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>до 3000</button>
                    </div>
                  </div>
                </div>

                {/* Вкладене розгортання: Параметри засобу */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-3 mt-2">
                  <button 
                    onClick={() => setIsLimitsOpen(!isLimitsOpen)}
                    className="flex items-center justify-between w-full group py-1 outline-none"
                  >
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Параметри засобу / заборона вильоту
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isLimitsOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isLimitsOpen && (
                    <div className="mt-3 flex flex-col gap-2">
                      <LimitRow label="Максимальний вітер (м/с)" defaultValue="12" />
                      <LimitRow label="Максимальні пориви (м/с)" defaultValue="14" />
                      <LimitRow label="Опади / Дощ" type="select" defaultValue="Заборонено" options={["Заборонено", "Дозволено"]} />
                      <LimitRow label="Максимальна вологість (%)" defaultValue="98" />
                      <LimitRow label="Наявність туману" type="select" defaultValue="Заборонено" options={["Заборонено", "Дозволено"]} />
                      <LimitRow label="Температура мін. (°C)" defaultValue="-20" />
                      <LimitRow label="Температура макс. (°C)" defaultValue="40" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Кнопки керування (Завжди видимі) */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors">
              За замовчуванням
            </button>
            <button className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2">
              <Activity className="w-4 h-4" />
              Прогнозувати
            </button>
          </div>
        </div>
      </header>

      {/* Розділювач та Дата */}
      <div className="flex flex-col items-center my-2">
        <div className="w-full h-px bg-slate-300 dark:bg-slate-800 mb-3"></div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Оновлено {todayDate}</span>
      </div>

      {/* Дашборд з інформаційними блоками */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-5 rounded-xl flex flex-col h-64">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
            <CloudLightning className="w-5 h-5 text-emerald-500" /> Прогноз на добу
          </h2>
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg flex items-center justify-center">
            <span className="text-slate-400 text-sm">Таблиця погодних явищ</span>
          </div>
          <p className="text-xs text-slate-500 mt-3 text-right">Оновлено 00:10:05 назад</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-5 rounded-xl flex flex-col h-64">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
            <Wind className="w-5 h-5 text-emerald-500" /> Зріз вітру по ешелонах
          </h2>
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg flex items-center justify-center">
            <span className="text-slate-400 text-sm">Графік шарів вітру (0-1000м)</span>
          </div>
          <p className="text-xs text-slate-500 mt-3 text-right">Оновлено 00:10:05 назад</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-5 rounded-xl flex flex-col h-64">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-emerald-500" /> Вікна для польотів (доба)
          </h2>
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg flex items-center justify-center">
            <span className="text-slate-400 text-sm">Таймлайн безпечних зон</span>
          </div>
          <p className="text-xs text-slate-500 mt-3 text-right">Оновлено 00:10:05 назад</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-5 rounded-xl flex flex-col h-64">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
            <Sunrise className="w-5 h-5 text-emerald-500" /> Схід / Захід
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
          <p className="text-xs text-slate-500 mt-3 text-right">Оновлено 00:10:05 назад</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-5 rounded-xl flex flex-col h-64 lg:col-span-2">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-emerald-500" /> Висновки ШІ
          </h2>
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 italic">
              "Очікується погіршення умов після 14:00 через проходження холодного фронту. 
              Прогнозуються пориви вітру до 16 м/с на висоті 200м."
            </p>
          </div>
          <p className="text-xs text-slate-500 mt-3 text-right">Оновлено 00:10:05 назад</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-5 rounded-xl flex flex-col h-64 lg:col-span-2">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-emerald-500" /> Прогноз на тиждень
          </h2>
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg flex items-center justify-center">
            <span className="text-slate-400 text-sm">Спрощений потижневий огляд</span>
          </div>
          <p className="text-xs text-slate-500 mt-3 text-right">Оновлено 00:10:05 назад</p>
        </div>
      </section>
    </div>
  )
}