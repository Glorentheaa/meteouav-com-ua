import React, { useState, useRef, useEffect } from 'react'
import { MapPin, Settings2, Wind, Sunrise, Moon, CloudLightning, Activity, CalendarDays, ChevronDown, Map, List } from 'lucide-react'

// Компонент рядка налаштувань лімітів
const LimitRow = ({ label, type = 'number', defaultValue, options }: any) => {
  const borderColor = type === 'select' && defaultValue === 'Дозволено' ? 'border-l-emerald-500' : 'border-l-rose-500'
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 border-l-4 ${borderColor}`}>
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {type === 'select' ? (
          <select className="flex-1 sm:w-28 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-emerald-500 dark:text-slate-200">
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input type="number" defaultValue={defaultValue} className="flex-1 sm:w-20 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-emerald-500 text-center dark:text-slate-200" />
        )}
        <button className="px-2 py-1 text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors">
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
  
  const [isAdvancedEnabled, setIsAdvancedEnabled] = useState(false)
  const [isMoreSettingsOpen, setIsMoreSettingsOpen] = useState(false)
  const [isLimitsOpen, setIsLimitsOpen] = useState(false)
  const [isLocMenuOpen, setIsLocMenuOpen] = useState(false)
  
  const locMenuRef = useRef<HTMLDivElement>(null)
  
  const todayDate = new Date().toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' })

  // Закриття меню локацій при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locMenuRef.current && !locMenuRef.current.contains(event.target as Node)) {
        setIsLocMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

        {/* Основна панель керування */}
        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm mt-2 flex flex-col">
          
          {/* Ряд 1: Локація (1/3) та Перемикач додаткових налаштувань (2/3) */}
          <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x divide-slate-200 dark:divide-slate-700">
            
            {/* Ліва колонка: Локація */}
            <div className="p-4 relative" ref={locMenuRef}>
              <button 
                onClick={() => setIsLocMenuOpen(!isLocMenuOpen)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-slate-50 dark:bg-slate-900 transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-medium text-sm text-slate-700 dark:text-slate-200 truncate">Запоріжжя</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isLocMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1.5 ml-1">Оберіть потрібну локацію</span>
              
              {/* Спадне меню локацій */}
              {isLocMenuOpen && (
                <div className="absolute top-[70px] left-4 right-4 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
                  <div className="p-1.5 border-b border-slate-100 dark:border-slate-800">
                    <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"><Map className="w-4 h-4 text-emerald-500" /> Обрати на мапі</button>
                    <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"><List className="w-4 h-4 text-emerald-500" /> Редагувати список місць</button>
                  </div>
                  <div className="p-1.5 max-h-48 overflow-y-auto">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">Закріплені</div>
                    <button className="w-full text-left px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">Київ</button>
                    <button className="w-full text-left px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">Запоріжжя</button>
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase mt-1">Збережені</div>
                    <button className="w-full text-left px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">Дніпро</button>
                    <button className="w-full text-left px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">Одеса</button>
                  </div>
                </div>
              )}
            </div>

            {/* Права колонка: Тогл налаштувань */}
            <div className="p-4 md:col-span-2 flex flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-700 md:border-t-0">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Увімкнути додаткові налаштування</span>
              <button 
                onClick={() => setIsAdvancedEnabled(!isAdvancedEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${isAdvancedEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAdvancedEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {/* Ряд 2: Відкриті налаштування (якщо увімкнено) */}
          {isAdvancedEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x divide-slate-200 dark:divide-slate-700 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              
              {/* Ліва колонка: Перемикачі */}
              <div className="p-4 flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-1">Деталізація</label>
                  <div className="flex bg-slate-200 dark:bg-slate-900 rounded p-0.5 inline-flex">
                    <button onClick={() => setDetail('1')} className={`px-2 py-1 text-xs font-medium rounded transition-colors ${detail === '1' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>1 год</button>
                    <button onClick={() => setDetail('3')} className={`px-2 py-1 text-xs font-medium rounded transition-colors ${detail === '3' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>3 год</button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-1">Глибина</label>
                  <div className="flex bg-slate-200 dark:bg-slate-900 rounded p-0.5 inline-flex">
                    <button onClick={() => setDepth('24')} className={`px-2 py-1 text-xs font-medium rounded transition-colors ${depth === '24' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>24 год</button>
                    <button onClick={() => setDepth('48')} className={`px-2 py-1 text-xs font-medium rounded transition-colors ${depth === '48' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>48 год</button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase block mb-1">Ешелони</label>
                  <div className="flex bg-slate-200 dark:bg-slate-900 rounded p-0.5 inline-flex">
                    <button onClick={() => setLevels('300')} className={`px-2 py-1 text-xs font-medium rounded transition-colors ${levels === '300' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>до 300</button>
                    <button onClick={() => setLevels('1000')} className={`px-2 py-1 text-xs font-medium rounded transition-colors ${levels === '1000' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>до 1000</button>
                    <button onClick={() => setLevels('3000')} className={`px-2 py-1 text-xs font-medium rounded transition-colors ${levels === '3000' ? 'bg-white dark:bg-slate-700 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>до 3000</button>
                  </div>
                </div>
              </div>

              {/* Права колонка: Більше налаштувань */}
              <div className="p-4 md:col-span-2 border-t border-slate-200 dark:border-slate-700 md:border-t-0">
                <button 
                  onClick={() => setIsMoreSettingsOpen(!isMoreSettingsOpen)}
                  className="flex items-center gap-2 group w-full text-left outline-none"
                >
                  <Settings2 className="w-4 h-4 text-slate-500 group-hover:text-emerald-500 transition-colors" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Більше налаштувань
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 ml-auto transition-transform ${isMoreSettingsOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMoreSettingsOpen && (
                  <div className="mt-4 pl-0 sm:pl-6 border-l-2 border-transparent sm:border-slate-200 dark:sm:border-slate-700">
                    <button 
                      onClick={() => setIsLimitsOpen(!isLimitsOpen)}
                      className="flex items-center justify-between w-full group py-1 outline-none mb-2"
                    >
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        Параметри засобу / заборона вильоту
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isLimitsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isLimitsOpen && (
                      <div className="flex flex-col gap-2 mb-4">
                        <LimitRow label="Макс. вітер (м/с)" defaultValue="12" />
                        <LimitRow label="Макс. пориви (м/с)" defaultValue="14" />
                        <LimitRow label="Опади" type="select" defaultValue="Заборонено" options={["Заборонено", "Дозволено"]} />
                        <LimitRow label="Мін. темп. (°C)" defaultValue="-20" />
                        <LimitRow label="Макс. темп. (°C)" defaultValue="40" />
                      </div>
                    )}
                    
                    <button className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline decoration-slate-300 dark:decoration-slate-600 underline-offset-4 transition-colors">
                      Повернутись до базових налаштувань
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ряд 3: Кнопка Оновлення */}
          <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-700 flex justify-center">
            <button className="px-6 py-2.5 sm:px-8 sm:py-3 text-sm sm:text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow flex items-center justify-center gap-2 w-full sm:w-auto">
              <Activity className="w-5 h-5" />
              Оновити прогноз погоди
            </button>
          </div>
        </div>
      </header>

      {/* Розділювач та Дата */}
      <div className="flex flex-col items-center my-2">
        <div className="w-full h-px bg-slate-300 dark:bg-slate-700 mb-2"></div>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Оновлено {todayDate}</span>
      </div>

      {/* Дашборд з інформаційними блоками (світліший фон dark:bg-slate-800) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-5 rounded-xl flex flex-col h-64 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
            <CloudLightning className="w-5 h-5 text-emerald-500" /> Прогноз на добу
          </h2>
          <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center">
            <span className="text-slate-400 text-sm">Таблиця погодних явищ</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 text-right">Оновлено 00:10:05 назад</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-5 rounded-xl flex flex-col h-64 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
            <Wind className="w-5 h-5 text-emerald-500" /> Зріз вітру по ешелонах
          </h2>
          <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center">
            <span className="text-slate-400 text-sm">Графік шарів вітру (0-1000м)</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 text-right">Оновлено 00:10:05 назад</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-5 rounded-xl flex flex-col h-64 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-emerald-500" /> Вікна для польотів (доба)
          </h2>
          <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center">
            <span className="text-slate-400 text-sm">Таймлайн безпечних зон</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 text-right">Оновлено 00:10:05 назад</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-5 rounded-xl flex flex-col h-64 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
            <Sunrise className="w-5 h-5 text-emerald-500" /> Схід / Захід
          </h2>
          <div className="flex-1 grid grid-cols-2 gap-4">
             <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center">
                <Sunrise className="w-8 h-8 text-amber-500 mb-2" />
                <span className="text-sm font-semibold">05:40 - 20:15</span>
             </div>
             <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center">
                <Moon className="w-8 h-8 text-indigo-400 mb-2" />
                <span className="text-sm font-semibold">22:10 - 06:30</span>
             </div>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 text-right">Оновлено 00:10:05 назад</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-5 rounded-xl flex flex-col h-64 lg:col-span-2 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-emerald-500" /> Висновки ШІ
          </h2>
          <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-600 dark:text-slate-300 italic">
              "Очікується погіршення умов після 14:00 через проходження холодного фронту. 
              Прогнозуються пориви вітру до 16 м/с на висоті 200м."
            </p>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 text-right">Оновлено 00:10:05 назад</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-5 rounded-xl flex flex-col h-64 lg:col-span-2 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-emerald-500" /> Прогноз на тиждень
          </h2>
          <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center">
            <span className="text-slate-400 text-sm">Спрощений потижневий огляд</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 text-right">Оновлено 00:10:05 назад</p>
        </div>
      </section>
    </div>
  )
}