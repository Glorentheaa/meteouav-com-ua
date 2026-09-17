import React, { useState, useEffect } from 'react'
import { RefreshCw, Loader2, Radar, MapPin } from 'lucide-react'

// Hooks & utils
import { useAuth } from '../context/useAuth'
import { useMeteoSettings } from '../features/meteo/hooks/useMeteoSettings'
import { useMeteoBlocks } from '../features/meteo/hooks/useMeteoBlocks'
import { getUaTime, getForecastDatesText } from '../utils/dateUtils'
import { setActiveLocation } from '../features/meteo/utils/geoUtils'
import type { SavedLocation } from '../features/meteo/types/location'
import type { FullMeteoForecastResponse } from '../features/meteo/types/meteoData'
import type { ForecastDepth, ForecastDetail, FlightLevels, MeteoWarnings } from '../features/meteo/types/meteo'
import { buildMeteoPayload, sendMeteoRequest } from '../services/meteoService'
import { generateMockForecast } from '../features/meteo/utils/mockMeteoData'

// Components
import { LocationSelector } from '../features/meteo/components/LocationSelector'
import { AdvancedSettingsDrawer } from '../features/meteo/components/AdvancedSettingsDrawer'
import { SectionDivider } from '../features/meteo/components/SectionDivider'
import { BlockVisibilityBar } from '../features/meteo/components/BlockVisibilityBar'

// Cards
import { ShortTermCard } from '../features/meteo/components/cards/ShortTermCard'
import { WindAltitudeCard } from '../features/meteo/components/cards/WindAltitudeCard'
import { FlightWindowsCard } from '../features/meteo/components/cards/FlightWindowsCard'
import { MeteorologistCard } from '../features/meteo/components/cards/MeteorologistCard'
import { WeeklyForecastCard } from '../features/meteo/components/cards/WeeklyForecastCard'
import { SunMoonCard } from '../features/meteo/components/cards/SunMoonCard'

const APPLIED_STATE_STORAGE_KEY = 'meteo_applied_state_v4'

interface AppliedForecastState {
  location: SavedLocation
  forecastData: FullMeteoForecastResponse
  depth: ForecastDepth
  detail: ForecastDetail
  levels: FlightLevels
  warnings: MeteoWarnings
  lastUpdated: string
  forecastDates: string
}

export const MeteoApp: React.FC = () => {
  const { user, isPro } = useAuth()

  const {
    depth,
    setDepth,
    detail,
    setDetail,
    levels,
    setLevels,
    warnings,
    updateWarning,
    showAdvancedSettings,
    setShowAdvancedSettings,
    showWarnings,
    setShowWarnings,
    handleFactoryReset,
    handleSave,
  } = useMeteoSettings()

  const {
    blocks,
    handleToggleBlock,
    showGrid1,
    setShowGrid1,
    showGrid2,
    setShowGrid2,
    controlsRef,
    hasGrid1Cards,
    hasGrid2Cards,
  } = useMeteoBlocks()

  // Збережений застосований стан блоків (відновлюється після перезавантаження F5)
  const [appliedForecast, setAppliedForecast] = useState<AppliedForecastState | null>(() => {
    try {
      const saved = localStorage.getItem(APPLIED_STATE_STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
      // Міграція зі старого кешу (v3): автоматично оновлюємо дані прогнозу для показу всієї градації
      const oldSaved = localStorage.getItem('meteo_applied_state_v3')
      if (oldSaved) {
        const parsed = JSON.parse(oldSaved)
        if (parsed?.location) {
          const freshData = generateMockForecast(parsed.location.sectorId, parsed.location.name)
          const freshState: AppliedForecastState = {
            ...parsed,
            forecastData: freshData,
            lastUpdated: getUaTime(),
            forecastDates: getForecastDatesText(),
          }
          localStorage.setItem(APPLIED_STATE_STORAGE_KEY, JSON.stringify(freshState))
          return freshState
        }
      }
    } catch (e) {
      console.error('Помилка читання збереженого прогнозу:', e)
    }
    return null
  })

  // Поточний вибір у селекторі локацій (якщо є активна локація або збережений прогноз)
  const [selectedLocation, setSelectedLocation] = useState<SavedLocation | null>(() => {
    try {
      const active = localStorage.getItem('meteo_active_location_v2')
      if (active) {
        const parsed = JSON.parse(active)
        if (parsed?.sectorId) return parsed
      }
    } catch {}

    try {
      const saved = localStorage.getItem(APPLIED_STATE_STORAGE_KEY) || localStorage.getItem('meteo_applied_state_v3')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.location) return parsed.location
      }
    } catch {}
    return null
  })

  // Синхронізація активної локації при поверненні з мапи або зміні в localStorage
  useEffect(() => {
    const syncActiveLocation = () => {
      try {
        const active = localStorage.getItem('meteo_active_location_v2')
        if (active) {
          const parsed = JSON.parse(active)
          if (parsed?.sectorId && parsed.sectorId !== selectedLocation?.sectorId) {
            setSelectedLocation(parsed)
          }
        }
      } catch (e) {
        console.error('Помилка синхронізації локації:', e)
      }
    }

    syncActiveLocation()
    window.addEventListener('focus', syncActiveLocation)
    return () => window.removeEventListener('focus', syncActiveLocation)
  }, [selectedLocation?.sectorId])

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoUpdated] = useState(getUaTime)

  // Обробник збереження налаштувань у висувній панелі
  const handleDrawerSave = () => {
    handleSave()
  }

  const handleDrawerFactoryReset = () => {
    handleFactoryReset()
  }

  // Обробник натискання кнопки "Оновити прогноз"
  const handleRefresh = async () => {
    if (!selectedLocation) {
      return
    }

    setIsRefreshing(true)

    // Формуємо корисне навантаження на базі збережених/активних параметрів користувача
    const payload = buildMeteoPayload({
      location: selectedLocation,
      depth,
      detail,
      levels,
      warnings,
      user: user
        ? {
            id: user.id,
            email: user.email ?? null,
            isPro,
          }
        : undefined,
    })

    try {
      const res = await sendMeteoRequest(payload)
      const data = res.data || generateMockForecast(selectedLocation.sectorId, selectedLocation.name)

      const newAppliedState: AppliedForecastState = {
        location: selectedLocation,
        forecastData: data,
        depth,
        detail,
        levels,
        warnings,
        lastUpdated: getUaTime(),
        forecastDates: getForecastDatesText(),
      }

      setAppliedForecast(newAppliedState)
      localStorage.setItem(APPLIED_STATE_STORAGE_KEY, JSON.stringify(newAppliedState))
      setActiveLocation(selectedLocation)
    } catch (e) {
      console.error('Помилка оновлення прогнозу:', e)
      // Автономний фолбек на мок-дані для безперервної роботи
      const fallbackData = generateMockForecast(selectedLocation.sectorId, selectedLocation.name)
      const fallbackAppliedState: AppliedForecastState = {
        location: selectedLocation,
        forecastData: fallbackData,
        depth,
        detail,
        levels,
        warnings,
        lastUpdated: getUaTime(),
        forecastDates: getForecastDatesText(),
      }
      setAppliedForecast(fallbackAppliedState)
      localStorage.setItem(APPLIED_STATE_STORAGE_KEY, JSON.stringify(fallbackAppliedState))
      setActiveLocation(selectedLocation)
    } finally {
      setIsRefreshing(false)
    }
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
            <LocationSelector
              currentLocation={selectedLocation}
              onSelectLocation={(loc) => {
                setSelectedLocation(loc)
              }}
            />

            {/* Інфо-текст (Середина) */}
            <div className="w-full h-full flex items-center lg:px-2">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                <p>
                  Будь який прогноз погоди оновлюється 1 раз на 3 години. Для отримання свіжої інформації враховуйте розклад оновлень: 00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00. Не забувайте тиснути "Оновити прогноз" для отримання актуальної інформації!
                </p>
                <p className="mt-1 italic">
                  *Прогноз на тиждень оновлюється автоматично раз на 48 годин.
                </p>
              </div>
            </div>

            {/* Правий підблок: Вмикач + Оновлення */}
            <div className="flex flex-col w-full items-center justify-end h-full">
              <div className="flex flex-col w-full sm:w-max">
                <label className="flex items-center justify-between cursor-pointer gap-3 group mb-1.5 px-1">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors select-none">
                    Показати додаткові параметри
                  </span>
                  <div className="relative flex items-center shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={showAdvancedSettings}
                      onChange={() => setShowAdvancedSettings(!showAdvancedSettings)}
                    />
                    <div
                      className={`block w-8 h-4.5 rounded-full transition-colors ${
                        showAdvancedSettings ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    />
                    <div
                      className={`absolute left-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform ${
                        showAdvancedSettings ? 'translate-x-3.5' : ''
                      }`}
                    />
                  </div>
                </label>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 w-full h-[42px] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isRefreshing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Формування...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Оновити прогноз</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Розгорнутий блок додаткових налаштувань */}
          {showAdvancedSettings && (
            <AdvancedSettingsDrawer
              depth={depth}
              setDepth={setDepth}
              detail={detail}
              setDetail={setDetail}
              levels={levels}
              setLevels={setLevels}
              warnings={warnings}
              updateWarning={updateWarning}
              showWarnings={showWarnings}
              setShowWarnings={setShowWarnings}
              onFactoryReset={handleDrawerFactoryReset}
              onSave={handleDrawerSave}
            />
          )}
        </div>
      </header>

      {/* Якщо стан прогнозу ще не сформований — показуємо стильну заглушку першого входу */}
      {!appliedForecast ? (
        <div className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl p-8 sm:p-12 shadow-sm flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300 my-2">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400 shadow-inner">
            <Radar className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Тактичний метеопрогноз MeteoUAV готовий до формування
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mb-6 leading-relaxed">
            Для початку роботи оберіть вашу локацію у спадному меню вище та натисніть кнопку{' '}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">«Оновити прогноз»</span>.
            Погодні дані та обрані параметри будуть зафіксовані та зберігатимуться між сесіями.
          </p>
          <div className="flex flex-col items-center justify-center gap-2.5 w-full max-w-xs sm:max-w-sm">
            <div className="w-full px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>1. Оберіть локацію або введіть координати</span>
            </div>
            <div className="w-full px-4 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>2. Натисніть «Оновити прогноз»</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Розділювач та Дата (Грід 1) */}
          {hasGrid1Cards && (
            <>
              <SectionDivider
                isOpen={showGrid1}
                onToggle={() => setShowGrid1(!showGrid1)}
                label={`Деталізований прогноз погоди для сектора ${appliedForecast.location.sectorId} (${appliedForecast.location.name}) на ${appliedForecast.forecastDates}. Останнє оновлення ${appliedForecast.lastUpdated}`}
              />

              {/* 
                Два вертикальних контейнери (лівий і правий).
                На широких екранах (lg:) контейнери мають items-stretch,
                а нижні картки (FlightWindowsCard та MeteorologistCard) розширюються через flex-1,
                тому обидві колонки закінчуються на абсолютно однаковому рівні внизу.
              */}
              {showGrid1 && (
                <section className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-stretch w-full animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Лівий вертикальний контейнер (Прогноз + Вікна) */}
                  <div className="flex flex-col gap-4 sm:gap-6 w-full lg:w-1/2 min-w-0">
                    {blocks.shortTerm && (
                      <ShortTermCard
                        hourly={appliedForecast.forecastData?.hourly}
                        warnings={appliedForecast.warnings}
                        depth={appliedForecast.depth}
                        detail={appliedForecast.detail}
                        levels={appliedForecast.levels}
                      />
                    )}
                    {blocks.windows && (
                      <FlightWindowsCard
                        hourly={appliedForecast.forecastData?.hourly}
                        warnings={appliedForecast.warnings}
                        levels={appliedForecast.levels}
                        depth={appliedForecast.depth}
                        detail={appliedForecast.detail}
                        className="flex-1"
                      />
                    )}
                  </div>

                  {/* Правий вертикальний контейнер (Вітер + Висновки) */}
                  <div className="flex flex-col gap-4 sm:gap-6 w-full lg:w-1/2 min-w-0">
                    {blocks.wind && (
                      <WindAltitudeCard
                        hourly={appliedForecast.forecastData?.hourly}
                        warnings={appliedForecast.warnings}
                        levels={appliedForecast.levels}
                        depth={appliedForecast.depth}
                        detail={appliedForecast.detail}
                      />
                    )}
                    {blocks.conclusion && (
                      <MeteorologistCard
                        aiSummary={appliedForecast.forecastData?.aiSummary}
                        className="flex-1"
                      />
                    )}
                  </div>
                </section>
              )}
            </>
          )}

          {/* Блок з тижневим прогнозом та сонцем/місяцем (Грід 2) */}
          {hasGrid2Cards && (
            <>
              <SectionDivider
                isOpen={showGrid2}
                onToggle={() => setShowGrid2(!showGrid2)}
                label={`Загальні параметри прогнозу з автоматичним оновленням. Останнє оновлення ${autoUpdated}`}
                className="mt-4 mb-2"
              />

              {/* 
                На широких екранах WeeklyForecastCard та SunMoonCard мають однакову висоту через items-stretch та h-full
              */}
              {showGrid2 && (
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch animate-in fade-in slide-in-from-top-2 duration-300">
                  {blocks.weekly && (
                    <WeeklyForecastCard
                      isSunMoonVisible={blocks.sunMoon}
                      chartUrl={appliedForecast.forecastData?.weeklyChartUrl}
                      hourly={appliedForecast.forecastData?.hourly}
                      className="h-full"
                    />
                  )}
                  {blocks.sunMoon && (
                    <SunMoonCard
                      isWeeklyVisible={blocks.weekly}
                      astronomy={appliedForecast.forecastData?.astronomy}
                      className="h-full"
                    />
                  )}
                </section>
              )}
            </>
          )}
        </>
      )}

      {/* Довідкова інформація та Меню видимості блоків */}
      <div className="flex flex-col mt-4" ref={controlsRef}>
        <div className="w-full h-px bg-slate-300 dark:bg-slate-700 mb-4" />
        <div className="max-w-3xl mb-6">
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-500 mb-2">
            Довідкова інформація
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Погодні дані надані виключно для попереднього планування та можуть містити похибки.
            Завжди враховуйте локальні мікрокліматичні зміни перед виконанням завдань.
          </p>
        </div>

        <BlockVisibilityBar
          blocks={blocks}
          onToggleBlock={handleToggleBlock}
        />
      </div>
    </div>
  )
}

export default MeteoApp
