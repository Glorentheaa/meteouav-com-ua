import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Plus,
  Trash2,
  Pin,
  ArrowLeft,
  CheckCircle2,
  Globe,
} from 'lucide-react'

const DEFAULT_PINNED = ['Київ', 'Запоріжжя']
const DEFAULT_SAVED = ['Дніпро', 'Одеса', 'Харків', 'Львів']

const PINNED_STORAGE_KEY = 'meteo_pinned_locations'
const SAVED_STORAGE_KEY = 'meteo_saved_locations'

export const Settings: React.FC = () => {
  const [pinnedLocations, setPinnedLocations] = useState<string[]>(() => {
    const saved = localStorage.getItem(PINNED_STORAGE_KEY)
    return saved ? JSON.parse(saved) : DEFAULT_PINNED
  })

  const [savedLocations, setSavedLocations] = useState<string[]>(() => {
    const saved = localStorage.getItem(SAVED_STORAGE_KEY)
    return saved ? JSON.parse(saved) : DEFAULT_SAVED
  })

  const [newCity, setNewCity] = useState('')
  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify(pinnedLocations))
  }, [pinnedLocations])

  useEffect(() => {
    localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedLocations))
  }, [savedLocations])

  const showNotification = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 2500)
  }

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newCity.trim()
    if (!trimmed) return

    if (pinnedLocations.includes(trimmed) || savedLocations.includes(trimmed)) {
      showNotification('Ця локація вже є у вашому списку')
      return
    }

    setSavedLocations((prev) => [...prev, trimmed])
    setNewCity('')
    showNotification(`Локацію "${trimmed}" додано`)
  }

  const handleDeleteLocation = (city: string) => {
    setSavedLocations((prev) => prev.filter((item) => item !== city))
    showNotification(`Локацію "${city}" видалено`)
  }

  const handleTogglePin = (city: string) => {
    if (pinnedLocations.includes(city)) {
      if (pinnedLocations.length <= 1) {
        showNotification('Має залишатися хоча б одна закріплена локація')
        return
      }
      setPinnedLocations((prev) => prev.filter((item) => item !== city))
      setSavedLocations((prev) => [...prev, city])
    } else {
      setSavedLocations((prev) => prev.filter((item) => item !== city))
      setPinnedLocations((prev) => [...prev, city])
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 py-4">
      {/* Шапка */}
      <header className="border-b border-slate-300 dark:border-slate-800 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/account"
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Назад до акаунту"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Керування збереженими локаціями
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Налаштування оперативних пунктів для швидкого моніторингу погоди.
            </p>
          </div>
        </div>
      </header>

      {/* Спливаюче сповіщення */}
      {notification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Форма додавання нової локації */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-500" />
          Додати нову локацію
        </h2>
        <form onSubmit={handleAddLocation} className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Наприклад: Полтава, Вінниця, Бахмут..."
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-all shadow shrink-0 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Додати</span>
          </button>
        </form>
      </div>

      {/* Закріплені локації */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-emerald-500 fill-emerald-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Закріплені локації
            </h2>
          </div>
          <span className="text-xs text-slate-500">Завжди на початку списку</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {pinnedLocations.map((city) => (
            <div
              key={city}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {city}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleTogglePin(city)}
                className="text-xs text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Відкріпити"
              >
                Відкріпити
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Збережені локації */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Усі збережені локації
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {savedLocations.length} локацій
          </span>
        </div>

        {savedLocations.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-2">
            Список порожній. Додайте нову локацію вище.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {savedLocations.map((city) => (
              <div
                key={city}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {city}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleTogglePin(city)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title="Закріпити"
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteLocation(city)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title="Видалити"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
