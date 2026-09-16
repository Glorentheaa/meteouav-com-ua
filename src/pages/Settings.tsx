import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  MapPin,
  Plus,
  Trash2,
  Pin,
  ArrowLeft,
  CheckCircle2,
  Globe,
  Edit2,
  Check,
  X,
  Map,
  Loader2,
} from 'lucide-react'
import type { SavedLocation } from '../features/meteo/types/location'
import {
  getStoredLocations,
  deleteStoredLocation,
  togglePinStoredLocation,
  updateStoredLocationName,
  addOrUpdateLocation,
  snapToSector,
  fetchNearestSettlement,
  DEFAULT_LOCATIONS,
} from '../features/meteo/utils/geoUtils'
import { parseCoordinatePair } from '../features/meteo/utils/coordParser'

export const Settings: React.FC = () => {
  const navigate = useNavigate()
  const [locations, setLocations] = useState<SavedLocation[]>(() => getStoredLocations())
  const [newCity, setNewCity] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  // Стан інлайн-редагування назви
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const showNotification = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 3000)
  }

  const handleStartEdit = (loc: SavedLocation) => {
    setEditingId(loc.id)
    setEditingName(loc.name)
  }

  const handleSaveEdit = (id: string) => {
    if (!editingName.trim()) return
    const updated = updateStoredLocationName(id, editingName.trim())
    setLocations(updated)
    setEditingId(null)
    showNotification('Назву локації успішно оновлено')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
  }

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newCity.trim()
    if (!trimmed) return

    setIsAdding(true)

    try {
      // Перевірка введення координат у будь-якому форматі (DD, DMS, DDM, N/E, кирилиця)
      const parsedCoord = parseCoordinatePair(trimmed)

      let lat = 49.0
      let lon = 31.0
      let name = trimmed
      let settlement = trimmed

      if (parsedCoord) {
        lat = parsedCoord.lat
        lon = parsedCoord.lon
        const sector = snapToSector(lat, lon)
        settlement = await fetchNearestSettlement(sector.lat, sector.lon)
        name = settlement || `Сектор ${sector.sectorId}`
      } else {
        // Перевірка серед дефолтних міст
        const defaultMatch = DEFAULT_LOCATIONS.find(
          (d) => d.name.toLowerCase() === trimmed.toLowerCase()
        )
        if (defaultMatch) {
          lat = defaultMatch.lat
          lon = defaultMatch.lon
          settlement = defaultMatch.settlement
        } else {
          // Якщо назва довільна — спробуємо знайти координати через OSM
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                trimmed + ', Україна'
              )}&limit=1&accept-language=uk`
            )
            const data = await res.json()
            if (data && data.length > 0) {
              lat = parseFloat(data[0].lat)
              lon = parseFloat(data[0].lon)
              settlement = data[0].name || trimmed
            }
          } catch (e) {
            console.warn('Помилка геокодування при додаванні:', e)
          }
        }
      }

      const sector = snapToSector(lat, lon)

      // Перевірка дублікатів за сектором
      const exists = locations.some((l) => l.sectorId === sector.sectorId)
      if (exists) {
        showNotification(`Локація для сектора ${sector.sectorId} вже є у вашому списку`)
        setIsAdding(false)
        return
      }

      const newLoc = addOrUpdateLocation({
        name,
        settlement,
        lat: sector.lat,
        lon: sector.lon,
        sectorId: sector.sectorId,
        isPinned: false,
      })

      setLocations(getStoredLocations())
      setNewCity('')
      showNotification(`Локацію "${newLoc.name}" додано`)
    } catch (e) {
      console.error(e)
      showNotification('Помилка при додаванні локації')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteLocation = (id: string, name: string) => {
    const updated = deleteStoredLocation(id)
    setLocations(updated)
    showNotification(`Локацію "${name}" видалено`)
  }

  const handleTogglePin = (id: string) => {
    const loc = locations.find((l) => l.id === id)
    if (!loc) return

    if (loc.isPinned && locations.filter((l) => l.isPinned).length <= 1) {
      showNotification('Має залишатися хоча б одна закріплена локація')
      return
    }

    const updated = togglePinStoredLocation(id)
    setLocations(updated)
  }

  const pinnedLocations = locations.filter((l) => l.isPinned)
  const savedLocations = locations.filter((l) => !l.isPinned)

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
              Налаштування оперативних пунктів, тактичних секторів та власних назв позицій.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/map?returnTo=/settings')}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
        >
          <Map className="w-4 h-4" />
          <span className="hidden sm:inline">Обрати на мапі</span>
        </button>
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
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-500" />
          Додати нову локацію
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Введіть назву населеного пункту або координати (наприклад: 47.85, 35.10). Точка автоматично прив'яжеться до квадрата ~5х8 км.
        </p>
        <form onSubmit={handleAddLocation} className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              disabled={isAdding}
              placeholder="Наприклад: Полтава, Вінниця, або 48.45, 35.00"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={isAdding || !newCity.trim()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-all shadow shrink-0 flex items-center gap-1.5 disabled:opacity-50"
          >
            {isAdding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
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
          <span className="text-xs text-slate-500">Завжди у верхній частині списку</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pinnedLocations.map((loc) => (
            <div
              key={loc.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 gap-2"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                {editingId === loc.id ? (
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-emerald-500 rounded-lg text-slate-900 dark:text-white w-full focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(loc.id)}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="p-1 text-slate-400 hover:bg-slate-200 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                        {loc.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                        {loc.sectorId}
                      </span>
                    </div>
                    {loc.settlement && loc.settlement !== loc.name && (
                      <p className="text-[11px] text-slate-400 truncate">
                        н.п. {loc.settlement}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {editingId !== loc.id && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(loc)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title="Змінити власну назву"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTogglePin(loc.id)}
                    className="p-1.5 text-emerald-600 hover:text-slate-500 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title="Відкріпити"
                  >
                    <Pin className="w-3.5 h-3.5 fill-emerald-600" />
                  </button>
                </div>
              )}
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
            Список порожній. Додайте нову локацію вище або оберіть її на карті.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedLocations.map((loc) => (
              <div
                key={loc.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  {editingId === loc.id ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-emerald-500 rounded-lg text-slate-900 dark:text-white w-full focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(loc.id)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="p-1 text-slate-400 hover:bg-slate-200 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {loc.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                          {loc.sectorId}
                        </span>
                      </div>
                      {loc.settlement && loc.settlement !== loc.name && (
                        <p className="text-[11px] text-slate-400 truncate">
                          н.п. {loc.settlement}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {editingId !== loc.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(loc)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      title="Змінити назву"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTogglePin(loc.id)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      title="Закріпити"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteLocation(loc.id, loc.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      title="Видалити"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
