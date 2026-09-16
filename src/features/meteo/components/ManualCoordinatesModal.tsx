import React, { useState, useEffect } from 'react'
import { X, Navigation, MapPin, Check, Loader2 } from 'lucide-react'
import { snapToSector, fetchNearestSettlement, addOrUpdateLocation } from '../utils/geoUtils'
import type { SavedLocation } from '../types/location'

interface ManualCoordinatesModalProps {
  isOpen: boolean
  onClose: () => void
  onLocationSelected: (location: SavedLocation) => void
  initialLat?: number
  initialLon?: number
}

export const ManualCoordinatesModal: React.FC<ManualCoordinatesModalProps> = ({
  isOpen,
  onClose,
  onLocationSelected,
  initialLat = 47.85,
  initialLon = 35.10,
}) => {
  const [latInput, setLatInput] = useState(initialLat.toString())
  const [lonInput, setLonInput] = useState(initialLon.toString())
  const [customName, setCustomName] = useState('')
  const [saveToList, setSaveToList] = useState(true)

  const [settlement, setSettlement] = useState<string>('')
  const [isLoadingGeo, setIsLoadingGeo] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parsedLat = parseFloat(latInput.replace(',', '.'))
  const parsedLon = parseFloat(lonInput.replace(',', '.'))
  const isValidCoords =
    !isNaN(parsedLat) &&
    !isNaN(parsedLon) &&
    parsedLat >= -90 &&
    parsedLat <= 90 &&
    parsedLon >= -180 &&
    parsedLon <= 180

  const sectorInfo = isValidCoords ? snapToSector(parsedLat, parsedLon) : null

  // Дебаунс для запиту назви населеного пункту
  useEffect(() => {
    if (!sectorInfo) {
      setSettlement('')
      return
    }

    let isMounted = true
    setIsLoadingGeo(true)

    const timer = setTimeout(async () => {
      try {
        const name = await fetchNearestSettlement(sectorInfo.lat, sectorInfo.lon)
        if (isMounted) {
          setSettlement(name)
          setIsLoadingGeo(false)
        }
      } catch {
        if (isMounted) {
          setSettlement(`Сектор ${sectorInfo.lat}, ${sectorInfo.lon}`)
          setIsLoadingGeo(false)
        }
      }
    }, 400)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [sectorInfo?.lat, sectorInfo?.lon])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidCoords || !sectorInfo) {
      setError('Будь ласка, введіть коректні координати')
      return
    }

    const finalName = customName.trim() || settlement || `Сектор ${sectorInfo.sectorId}`
    const locationData: Omit<SavedLocation, 'id' | 'createdAt'> = {
      name: finalName,
      settlement: settlement || finalName,
      lat: sectorInfo.lat,
      lon: sectorInfo.lon,
      rawLat: parsedLat,
      rawLon: parsedLon,
      sectorId: sectorInfo.sectorId,
      isPinned: false,
    }

    let resultingLocation: SavedLocation

    if (saveToList) {
      resultingLocation = addOrUpdateLocation(locationData)
    } else {
      resultingLocation = {
        ...locationData,
        id: `temp_${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
    }

    onLocationSelected(resultingLocation)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Заголовок */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Введення координат
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Автоматична прив'язка до тактичного квадрата (~5х8 км)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Широта (Lat)
              </label>
              <input
                type="text"
                placeholder="47.8500"
                value={latInput}
                onChange={(e) => {
                  setLatInput(e.target.value)
                  setError(null)
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Довгота (Lon)
              </label>
              <input
                type="text"
                placeholder="35.1000"
                value={lonInput}
                onChange={(e) => {
                  setLonInput(e.target.value)
                  setError(null)
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Плашка розрахованого сектора */}
          {sectorInfo && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Сектор: {sectorInfo.sectorId}
                </span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                  {sectorInfo.approxSizeKm}
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <span>Найближчий н.п.:</span>
                {isLoadingGeo ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                ) : (
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {settlement || 'Визначається...'}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                Заокруглені координати: {sectorInfo.lat.toFixed(2)}° N, {sectorInfo.lon.toFixed(2)}° E. Точні координати не надсилаються в мережу.
              </p>
            </div>
          )}

          {/* Власна назва */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Власна назва / позиція (необов'язково)
            </label>
            <input
              type="text"
              placeholder={settlement ? `Наприклад: ${settlement} (Позиція 1)` : 'Наприклад: База Альфа'}
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Галочка збереження в список */}
          <label className="flex items-center gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={saveToList}
              onChange={(e) => setSaveToList(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300 select-none">
              Зберегти в мої місця для швидкого доступу
            </span>
          </label>

          {/* Кнопки */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Скасувати
            </button>
            <button
              type="submit"
              disabled={!isValidCoords}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Застосувати сектор</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
