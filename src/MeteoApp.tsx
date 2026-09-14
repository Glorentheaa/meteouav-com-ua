import React, { useState, useRef, useEffect } from 'react'
import { MapPin, Wind, Sunrise, Moon, CloudLightning, Activity, CalendarDays, ChevronDown, Map, List, Settings2 } from 'lucide-react'

// Компонент рядка налаштувань лімітів
const LimitRow = ({ label, type = 'number', defaultValue, options }: any) => {
  const borderColor = type === 'select' && defaultValue === 'Дозволено' ? 'border-l-emerald-500' : 'border-l-rose-500'
  return (
    <div className={`flex items-center justify-between gap-3 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 border-l-4 ${borderColor}`}>
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        {type === 'select' ? (
          <select 
            defaultValue={defaultValue} 
            className="w-24 sm:w-28 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-emerald-500 dark:text-slate-200 transition-colors"
          >
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input 
            type="number" 
            defaultValue={defaultValue} 
            className="w-16 sm:w-20 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-emerald-500 text-center dark:text-slate-200 transition-colors" 
          />
        )}
        <button className="px-2 py-1 text-[10px] sm:text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors">
          Зберегти
        </button>
      </div>
    </div>
  )
}

export const MeteoApp: React.FC = () => {
  // Базові значення
  const [depth, setDepth] = useState<'24' | '48'>('24')
  const [detail, setDetail] = useState<'1' | '3'>('3')
  const [levels, setLevels] = useState<'300' | '1000' | '3000'>('1000')
  
  const [isLocMenuOpen, setIsLocMenuOpen] = useState(false)
  const locMenuRef = useRef<HTMLDivElement>(null)
  
  // Стани видимості блоків
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [showDeviceParams, setShowDeviceParams] = useState(false)
  
  // Ключ для примусового ререндера неконтрольованих інпутів
  const [resetKey, setResetKey] = useState(0)

  const todayDate = new Date().toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locMenuRef.current && !locMenuRef.current.contains(event.target as Node)) {
        setIsLocMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleFactoryReset = () => {
    // Скидання лівих параметрів
    setDepth('24')
    setDetail('3')
    setLevels('1000')
    // Форсування перемальовування LimitRow для скидання правих параметрів
    setResetKey(prev => prev + 1)
  }

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

        {/* Основна панель налаштувань */}
        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm mt-2 flex flex-col overflow-hidden transition-all duration-300">
          
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-700">
            
            {/* Ліва колонка (1/3) */}
            <div className="p-4 sm:p-5 flex flex-col gap-5">
              
              {/* Локація (Завжди видима) */}
              <div className="relative" ref={locMenuRef}>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                  Локація
                </label>
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
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1 ml-1">Оберіть потрібну локацію</span>
                
                {isLocMenuOpen && (
                  <div className="absolute top-[65px] left-0 right-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
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

              {/* Додаткові параметри лівої колонки (Ховаються) */}
              {showAdvancedSettings && (
                <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Глибина (год)</label>
                      <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-0.5">
                        <button onClick={() => setDepth('24')} className={`px-4 py-1 text-xs font-medium rounded transition-colors ${depth === '24' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>24</button>
                        <button onClick={() => setDepth('48')} className={`px-4 py-1 text-xs font-medium rounded transition-colors ${depth === '48' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>48</button>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Деталізація (год)</label>
                      <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-0.5">
                        <button onClick={() => setDetail('1')} className={`px-4 py-1 text-xs font-medium rounded transition-colors ${detail === '1' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>1</button>
                        <button onClick={() => setDetail('3')} className={`px-4 py-1 text-xs font-medium rounded transition-colors ${detail === '3' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>3</button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Ешелони (до ... м)</label>
                    <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-0.5 w-max">
                      <button onClick={() => setLevels('300')} className={`px-4 py-1 text-xs font-medium rounded transition-colors ${levels === '300' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>300</button>
                      <button onClick={() => setLevels('1000')} className={`px-4 py-1 text-xs font-medium rounded transition-colors ${levels === '1000' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 border border-transparent'}`}>1000</button>
                      <button onClick={() => setLevels('3000')} className={`px-4 py-1 text-xs font-medium rounded transition-colors ${levels === '3000' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>3000</button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Права колонка (2/3) */}
            <div className="p-4 sm:p-5 md:col-span-2 flex flex-col gap-4">
              
              {/* Головний тумблер увімкнення налаштувань */}
              <label className="flex items-center cursor-pointer w-max gap-3">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={showAdvancedSettings} 
                    onChange={() => setShowAdvancedSettings(!showAdvancedSettings)} 
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${showAdvancedSettings ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showAdvancedSettings ? 'translate-x-4' : ''}`}></div>
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 select-none">
                  Увімкнути додаткові налаштування
                </span>
              </label>
              
              {/* Блок з параметрами засобу */}
              {showAdvancedSettings && (
                <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  
                  {/* Шапка/Тумблер Параметрів Засобу */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Параметри засобу / заборона вильоту</span>
                    </div>
                    <label className="flex items-center cursor-pointer gap-3">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={showDeviceParams} 
                          onChange={() => setShowDeviceParams(!showDeviceParams)} 
                        />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${showDeviceParams ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showDeviceParams ? 'translate-x-4' : ''}`}></div>
                      </div>
                    </label>
                  </div>

                  {/* Список лімітів */}
                  {showDeviceParams && (
                    <div key={resetKey} className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <LimitRow label="Макс. вітер (м/с)" defaultValue="12" />
                      <LimitRow label="Макс. пориви (м/с)" defaultValue="14" />
                      <LimitRow label="Опади / Дощ" type="select" defaultValue="Заборонено" options={["Заборонено", "Дозволено"]} />
                      <LimitRow label="Макс. вологість (%)" defaultValue="98" />
                      <LimitRow label="Наявність туману" type="select" defaultValue="Заборонено" options={["Заборонено", "Дозволено"]} />
                      <LimitRow label="Мін. темп. (°C)" defaultValue="-20" />
                      <LimitRow label="Макс. темп. (°C)" defaultValue="40" />
                    </div>
                  )}

                  {/* Кнопка скидання (завжди видима під шапкою, якщо увімкнені додаткові налаштування загалом) */}
                  <div className="flex justify-end mt-1">
                    <button 
                      onClick={handleFactoryReset}
                      className="px-4 py-1.5 text-xs font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md transition-colors shadow-sm"
                    >
                      Скинути до заводських
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>

          {/* Кнопка Оновлення (Низ блоку) */}
          <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-700 flex justify-center bg-slate-50/50 dark:bg-slate-900/20">
            <button className="px-8 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto">
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

      {/* Дашборд */}
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