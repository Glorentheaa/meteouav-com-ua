import React, { useState } from 'react'
import { RefreshCw, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

// Hooks & utils
import { useAuth } from '../context/useAuth'
import { useMeteoSettings } from '../features/meteo/hooks/useMeteoSettings'
import { useMeteoBlocks } from '../features/meteo/hooks/useMeteoBlocks'
import { getUaTime, getForecastDatesText } from '../utils/dateUtils'
import { getActiveLocation, setActiveLocation } from '../features/meteo/utils/geoUtils'
import type { SavedLocation } from '../features/meteo/types/location'
import { buildMeteoPayload, sendMeteoRequest } from '../services/meteoService'

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

  const [currentLocation, setCurrentLocation] = useState<SavedLocation>(() => getActiveLocation())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [statusFeedback, setStatusFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const [lastUpdated, setLastUpdated] = useState(getUaTime)
  const [autoUpdated] = useState(getUaTime)
  const [forecastDates, setForecastDates] = useState(getForecastDatesText)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setStatusFeedback(null)

    // Формуємо повне корисне навантаження для n8n
    const payload = buildMeteoPayload({
      location: currentLocation,
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
      setLastUpdated(getUaTime())
      setForecastDates(getForecastDatesText())
      setStatusFeedback({
        type: res.success ? 'success' : 'error',
        message: res.message,
      })
    } catch (e) {
      console.error('Помилка оновлення прогнозу:', e)
      setStatusFeedback({
        type: 'error',
        message: 'Помилка надсилання запиту до погодного сервісу',
      })
    } finally {
      setIsRefreshing(false)
      setTimeout(() => {
        setStatusFeedback(null)
      }, 5000)
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

        {/* Сповіщення про статус відправки запиту */}
        {statusFeedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
              statusFeedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
            }`}
          >
            {statusFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusFeedback.message}</span>
          </div>
        )}

        {/* Основна панель керування */}
        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm mt-2 flex flex-col transition-all duration-300">
          {/* Верхній блок (Локація + Інфо + Оновлення) */}
          <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-3 gap-5 items-end">
            {/* Локація */}
            <LocationSelector
              currentLocation={currentLocation}
              onSelectLocation={(loc) => {
                setCurrentLocation(loc)
                setActiveLocation(loc)
              }}
            />

            {/* Інфо-текст (Середина) */}
            <div className="w-full h-full flex items-center lg:px-2">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                <p>
                  Будь який прогноз погоди оновлюється 1 раз на 3 години. Для отримання свіжої інформації враховуйте розклад оновлень: 00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00. Не забувайте тиснути "Оновити прогноз погоди" для отримання свіжої інформації!
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
                  className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 w-full h-[42px] disabled:opacity-75 disabled:cursor-not-allowed"
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
              onFactoryReset={handleFactoryReset}
              onSave={handleSave}
            />
          )}
        </div>
      </header>

      {/* Розділювач та Дата (Грід 1) */}
      {hasGrid1Cards && (
        <>
          <SectionDivider
            isOpen={showGrid1}
            onToggle={() => setShowGrid1(!showGrid1)}
            label={`Деталізований прогноз погоди для сектора ${currentLocation.sectorId} (${currentLocation.name}) на ${forecastDates}. Останнє оновлення ${lastUpdated}`}
          />

          {showGrid1 && (
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
              {blocks.shortTerm && <ShortTermCard />}
              {blocks.wind && <WindAltitudeCard />}
              {blocks.windows && <FlightWindowsCard />}
              {blocks.conclusion && <MeteorologistCard />}
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

          {showGrid2 && (
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
              {blocks.weekly && (
                <WeeklyForecastCard isSunMoonVisible={blocks.sunMoon} />
              )}
              {blocks.sunMoon && (
                <SunMoonCard isWeeklyVisible={blocks.weekly} />
              )}
            </section>
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
