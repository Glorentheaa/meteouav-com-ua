import React, { useState, useRef, useEffect } from 'react'
import { MapPin, Wind, Sunrise, Moon, CloudLightning, Activity, CalendarDays, ChevronDown, ChevronUp, Map, List, Settings2, RefreshCw } from 'lucide-react'

// Компонент рядка налаштувань лімітів з єдиним розміром поля
const LimitRow = ({ label, type = 'number', value, onChange, options }: any) => {
  const isOff = value === 'вимкнути'
  const borderColor = isOff ? 'border-l-emerald-500' : 'border-l-amber-500'

  return (
    <div className={`flex items-center justify-between gap-3 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 border-l-4 ${borderColor}`}>
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate pr-2">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        {type === 'select' ? (
          <select 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-48 px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-emerald-500 dark:text-slate-200 transition-colors"
          >
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <div className="flex items-center w-48 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus-within:border-emerald-500 transition-colors overflow-hidden">
            <input 
              type="number" 
              value={value} 
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-full px-2 py-1.5 text-xs bg-transparent focus:outline-none text-center dark:text-slate-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
            />
            <div className="flex flex-col border-l border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 shrink-0">
              <button 
                onClick={() => onChange(Number(value) + 1)}
                className="px-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors border-b border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button 
                onClick={() => onChange(Number(value) - 1)}
                className="px-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-slate-600 dark:text-slate-300"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const MeteoApp: React.FC = () => {
  // Стани перемикачів
  const [depth, setDepth] = useState<'24' | '48'>('24')
  const [detail, setDetail] = useState<'1' | '3' | '6'>('3')
  const [levels, setLevels] = useState<'300' | '500' | '800' | '3000'>('800')
  
  // Стани попереджень (за замовчуванням)
  const [wind, setWind] = useState(12)
  const [gusts, setGusts] = useState(13)
  const [precip, setPrecip] = useState('>0.1 мм')
  const [fog, setFog] = useState('висока вірогідність')
  const [humidity, setHumidity] = useState(98)
  const [visibility, setVisibility] = useState(1)
  const [minTemp, setMinTemp] = useState(-20)
  const [maxTemp, setMaxTemp] = useState(40)

  // UI стани
  const [isLocMenuOpen, setIsLocMenuOpen] = useState(false)
  const locMenuRef = useRef<HTMLDivElement>(null)
  
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [showWarnings, setShowWarnings] = useState(false)

const getUaTime = () => {
    return new Date().toLocaleString('uk-UA', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'Europe/Kyiv'
    }).replace(',', ' о')
  }

  // Функція для форматування дати у формат "15-16 вересня"
  const getForecastDatesText = () => {
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const d1 = today.getDate()
    const m1 = today.toLocaleDateString('uk-UA', { month: 'long' })
    const d2 = tomorrow.getDate()
    const m2 = tomorrow.toLocaleDateString('uk-UA', { month: 'long' })

    return m1 === m2 ? `${d1}-${d2} ${m1}` : `${d1} ${m1} - ${d2} ${m2}`
  }

  const [lastUpdated, setLastUpdated] = useState(getUaTime())
  const [autoUpdated] = useState(getUaTime())
  const [forecastDates, setForecastDates] = useState(getForecastDatesText())

  // Стани для згортання/розгортання сіток
  const [showGrid1, setShowGrid1] = useState(true)
  const [showGrid2, setShowGrid2] = useState(true)

  // Реф для компенсації стрибків скролу
  const controlsRef = useRef<HTMLDivElement>(null)

  const [blocks, setBlocks] = useState({
    shortTerm: true,
    wind: true,
    windows: true,
    conclusion: true,
    weekly: true,
    sunMoon: true
  })

  // Оновлена функція перемикання з компенсацією скролу
  const handleToggleBlock = (key: keyof typeof blocks) => {
    const activeCount = Object.values(blocks).filter(Boolean).length
    if (activeCount === 1 && blocks[key]) return 
    
    const prevTop = controlsRef.current?.getBoundingClientRect().top

    setBlocks(prev => ({ ...prev, [key]: !prev[key] }))

    setTimeout(() => {
      if (controlsRef.current && prevTop !== undefined) {
        const newTop = controlsRef.current.getBoundingClientRect().top
        window.scrollBy(0, newTop - prevTop)
      }
    }, 0)
  }

  const handleRefresh = () => {
    setLastUpdated(getUaTime())
    setForecastDates(getForecastDatesText())
  }

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
    setDepth('24')
    setDetail('3')
    setLevels('800')
    setWind(12)
    setGusts(13)
    setPrecip('>0.1 мм')
    setFog('висока вірогідність')
    setHumidity(98)
    setVisibility(1)
    setMinTemp(-20)
    setMaxTemp(40)
  }

  const handleSave = () => {
    setShowAdvancedSettings(false)
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

        {/* Основна панель керування */}
        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm mt-2 flex flex-col transition-all duration-300">
          
          {/* Верхній блок (Локація + Інфо + Оновлення) */}
          <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-3 gap-5 items-end">
            
            {/* Локація */}
            <div className="relative w-full" ref={locMenuRef}>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                Оберіть локацію
              </label>
              <button 
                onClick={() => setIsLocMenuOpen(!isLocMenuOpen)}
                className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-slate-50 dark:bg-slate-900 transition-colors h-[42px]"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-medium text-sm text-slate-700 dark:text-slate-200 truncate">Запоріжжя</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isLocMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isLocMenuOpen && (
                <div className="absolute top-[70px] left-0 right-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
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

            {/* Інфо-текст (Середина) */}
            <div className="w-full h-full flex items-center lg:px-2">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                <p>Будь який прогноз погоди оновлюється 1 раз на 3 години. Для отримання свіжої інформації враховуйте розклад оновлень: 00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00. Не забувайте тиснути "Оновити прогноз погоди" для отримання свіжої інформації!</p>
                <p className="mt-1 italic">*Прогноз на тиждень оновлюється автоматично раз на 48 годин.</p>
              </div>
            </div>

            {/* Правий підблок: Вмикач + Оновлення */}
            <div className="flex flex-col w-full lg:items-end justify-end h-full">
              <label className="flex items-center lg:justify-end cursor-pointer gap-2 group mb-1.5 lg:mr-1">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors select-none">
                  Показати додаткові параметри
                </span>
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={showAdvancedSettings} 
                    onChange={() => setShowAdvancedSettings(!showAdvancedSettings)} 
                  />
                  <div className={`block w-8 h-4.5 rounded-full transition-colors ${showAdvancedSettings ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                  <div className={`absolute left-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform ${showAdvancedSettings ? 'translate-x-3.5' : ''}`}></div>
                </div>
              </label>
              
              <button 
                onClick={handleRefresh}
                className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 w-full lg:w-auto h-[42px]"
              >
                <RefreshCw className="w-4 h-4" />
                Оновити прогноз
              </button>
            </div>
          </div>

          {/* Розгорнутий блок додаткових налаштувань */}
          {showAdvancedSettings && (
            <div className="p-4 sm:p-5 flex flex-col gap-6 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-4 duration-300">
              
              {/* Перемикачі в ряд */}
              <div className="flex flex-wrap gap-5 lg:gap-8">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Глибина (год)</label>
                  <div className="flex bg-slate-200/50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-0.5 shadow-inner">
                    {['24', '48'].map((val) => (
                      <button key={val} onClick={() => setDepth(val as any)} className={`px-4 py-1 text-xs font-medium rounded transition-colors ${depth === val ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'text-slate-600 dark:text-slate-400 border border-transparent'}`}>{val}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Деталізація (год)</label>
                  <div className="flex bg-slate-200/50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-0.5 shadow-inner">
                    {['1', '3', '6'].map((val) => (
                      <button key={val} onClick={() => setDetail(val as any)} className={`px-4 py-1 text-xs font-medium rounded transition-colors ${detail === val ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'text-slate-600 dark:text-slate-400 border border-transparent'}`}>{val}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Ешелони (до ... м)</label>
                  <div className="flex bg-slate-200/50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-0.5 shadow-inner flex-wrap">
                    {['300', '500', '800', '3000'].map((val) => (
                      <button key={val} onClick={() => setLevels(val as any)} className={`px-4 py-1 text-xs font-medium rounded transition-colors ${levels === val ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'text-slate-600 dark:text-slate-400 border border-transparent'}`}>{val}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Підменю "Попередження" */}
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setShowWarnings(!showWarnings)}
                  className="flex items-center justify-between w-full max-w-sm p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Попередження</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showWarnings ? 'rotate-180' : ''}`} />
                </button>

                {showWarnings && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-3 mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <LimitRow label="Макс. вітер (м/с)" value={wind} onChange={setWind} />
                    <LimitRow label="Макс. пориви (м/с)" value={gusts} onChange={setGusts} />
                    <LimitRow label="Опади" type="select" value={precip} onChange={setPrecip} options={[">0.1 мм", ">0.3 мм", "вимкнути"]} />
                    <LimitRow label="Наявність туману" type="select" value={fog} onChange={setFog} options={["висока вірогідність", "мала вірогідність", "вимкнути"]} />
                    <LimitRow label="Вологість вище (%)" value={humidity} onChange={setHumidity} />
                    <LimitRow label="Видимість менше (км)" value={visibility} onChange={setVisibility} />
                    <LimitRow label="Мін. темп. (°C)" value={minTemp} onChange={setMinTemp} />
                    <LimitRow label="Макс. темп. (°C)" value={maxTemp} onChange={setMaxTemp} />
                  </div>
                )}
              </div>

              {/* Кнопки збереження та скидання */}
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={handleFactoryReset}
                  className="px-5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors shadow-sm"
                >
                  Скинути до базових
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-2 text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-lg transition-colors shadow-sm"
                >
                  Зберегти
                </button>
              </div>

            </div>
          )}
        </div>
      </header>

      {/* Розділювач та Дата */}
      {/* Розділювач та Дата (Грід 1) */}
      {(blocks.shortTerm || blocks.wind || blocks.windows || blocks.conclusion) && (
        <>
          <div 
            onClick={() => setShowGrid1(!showGrid1)}
            className="flex flex-col items-center my-2 cursor-pointer group select-none"
          >
            <div className="w-full h-px bg-slate-300 dark:bg-slate-700 mb-2 group-hover:bg-emerald-500/50 transition-colors"></div>
            <div className="flex items-center justify-center gap-3 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors px-4 w-full">
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${showGrid1 ? 'rotate-180' : ''}`} />
              <span className="text-[11px] font-medium text-center">
                Деталізований прогноз погоди на {forecastDates}. Останнє оновлення {lastUpdated}
              </span>
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${showGrid1 ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {showGrid1 && (
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
              {blocks.shortTerm && (
                <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-5 rounded-xl flex flex-col h-64 shadow-sm">
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
                    <CloudLightning className="w-5 h-5 text-emerald-500" /> Прогноз на найближчий час
                  </h2>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center">
                    <span className="text-slate-400 text-sm">Таблиця погодних явищ</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 text-right">Оновлено 00:10:05 назад</p>
                </div>
              )}

              {blocks.wind && (
                <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-5 rounded-xl flex flex-col h-64 shadow-sm">
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
                    <Wind className="w-5 h-5 text-emerald-500" /> Вітер та кромка хмар по ешелонах
                  </h2>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center">
                    <span className="text-slate-400 text-sm">Графік шарів вітру (0-1000м)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 text-right">Оновлено 00:10:05 назад</p>
                </div>
              )}

              {blocks.windows && (
                <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-5 rounded-xl flex flex-col h-64 shadow-sm">
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-emerald-500" /> Вікна для польотів
                  </h2>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center">
                    <span className="text-slate-400 text-sm">Таймлайн безпечних зон</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 text-right">Оновлено 00:10:05 назад</p>
                </div>
              )}

              {blocks.conclusion && (
                <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-5 rounded-xl flex flex-col h-64 shadow-sm">
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-emerald-500" /> Висновок від метеолога
                  </h2>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                      "Очікується погіршення умов після 14:00 через проходження холодного фронту. 
                      Прогнозуються пориви вітру до 16 м/с на висоті 200м."
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 text-right">Оновлено 00:10:05 назад</p>
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* Блок з тижневим прогнозом та сонцем/місяцем (Грід 2) */}
      {(blocks.weekly || blocks.sunMoon) && (
        <>
          <div 
            onClick={() => setShowGrid2(!showGrid2)}
            className="flex flex-col items-center mt-4 mb-2 cursor-pointer group select-none"
          >
            <div className="w-full h-px bg-slate-300 dark:bg-slate-700 mb-2 group-hover:bg-emerald-500/50 transition-colors"></div>
            <div className="flex items-center justify-center gap-3 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors px-4 w-full">
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${showGrid2 ? 'rotate-180' : ''}`} />
              <span className="text-[11px] font-medium text-center">
                Загальні параметри прогнозу з автоматичним оновленням. Останнє оновлення {autoUpdated}
              </span>
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${showGrid2 ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {showGrid2 && (
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
              {blocks.weekly && (
                <div className={`bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-5 rounded-xl flex flex-col h-64 shadow-sm ${blocks.sunMoon ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
                    <CalendarDays className="w-5 h-5 text-emerald-500" /> Тижневий прогноз
                  </h2>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center">
                    <span className="text-slate-400 text-sm">Спрощений потижневий огляд</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 text-right">Оновлено 00:10:05 назад</p>
                </div>
              )}

              {blocks.sunMoon && (
                <div className={`bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 p-5 rounded-xl flex flex-col h-64 shadow-sm ${blocks.weekly ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
                  <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
                    <Sunrise className="w-5 h-5 text-emerald-500" /> Схід/Захід сонця та луни
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
              )}
            </section>
          )}
        </>
      )}

      {/* Нижній текст та Меню видимості з рефом */}
      <div className="flex flex-col mt-4" ref={controlsRef}>
        <div className="w-full h-px bg-slate-300 dark:bg-slate-700 mb-4"></div>
        <div className="max-w-3xl mb-6">
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-500 mb-2">
            Довідкова інформація
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Погодні дані надані виключно для попереднього планування та можуть містити похибки. 
            Завжди враховуйте локальні мікрокліматичні зміни перед виконанням завдань.
          </p>
        </div>

        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-2 w-full lg:w-auto">Відображення:</span>
          {[
            { key: 'shortTerm', label: 'Найближчий час' },
            { key: 'wind', label: 'Вітер/Хмари' },
            { key: 'windows', label: 'Вікна польотів' },
            { key: 'conclusion', label: 'Висновок' },
            { key: 'weekly', label: 'Тижневий' },
            { key: 'sunMoon', label: 'Сонце/Місяць' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleToggleBlock(key as keyof typeof blocks)}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-full transition-colors border ${
                blocks[key as keyof typeof blocks]
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}