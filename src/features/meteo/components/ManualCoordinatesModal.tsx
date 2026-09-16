import React, { useState, useEffect } from 'react'
import {
  X,
  Navigation,
  MapPin,
  Check,
  Loader2,
  ArrowLeftRight,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react'
import { snapToSector, fetchNearestSettlement, addOrUpdateLocation } from '../utils/geoUtils'
import {
  parseCoordinatePair,
  parseSingleCoordinate,
  type ParsedCoordinates,
} from '../utils/coordParser'
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
  // Режим вводу: 'unified' (єдиний рядок для будь-якого формату) або 'split' (окремі поля)
  const [inputMode, setInputMode] = useState<'unified' | 'split'>('unified')

  // Стан єдиного рядка
  const [unifiedInput, setUnifiedInput] = useState(`${initialLat}, ${initialLon}`)

  // Стан окремих полів
  const [latInput, setLatInput] = useState(initialLat.toString())
  const [lonInput, setLonInput] = useState(initialLon.toString())

  // Розпізнані координати
  const [parsedCoords, setParsedCoords] = useState<ParsedCoordinates | null>(null)

  const [customName, setCustomName] = useState('')
  const [saveToList, setSaveToList] = useState(true)
  const [settlement, setSettlement] = useState<string>('')
  const [isLoadingGeo, setIsLoadingGeo] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Парсинг при зміні єдиного рядка
  useEffect(() => {
    if (inputMode === 'unified') {
      const trimmed = unifiedInput.trim()
      if (!trimmed) {
        setParsedCoords(null)
        setError(null)
        return
      }

      const result = parseCoordinatePair(trimmed)
      if (result) {
        setParsedCoords(result)
        setError(null)
      } else {
        setParsedCoords(null)
        if (trimmed.length > 5) {
          setError('Формат не розпізнано. Перевірте ввід або використовуйте кому між широтою і довготою')
        }
      }
    }
  }, [unifiedInput, inputMode])

  // Парсинг при зміні окремих полів
  useEffect(() => {
    if (inputMode === 'split') {
      const trimmedLat = latInput.trim()
      const trimmedLon = lonInput.trim()

      if (!trimmedLat || !trimmedLon) {
        setParsedCoords(null)
        setError(null)
        return
      }

      // Якщо користувач вставив повний рядок у поле широти
      if (trimmedLat.includes(',') || trimmedLat.includes(' ') || trimmedLat.includes('°')) {
        const fullParsed = parseCoordinatePair(trimmedLat)
        if (fullParsed) {
          setParsedCoords(fullParsed)
          setLatInput(fullParsed.lat.toString())
          setLonInput(fullParsed.lon.toString())
          setError(null)
          return
        }
      }

      const lat = parseSingleCoordinate(trimmedLat, false)
      const lon = parseSingleCoordinate(trimmedLon, true)

      if (lat !== null && lon !== null) {
        setParsedCoords({
          lat: parseFloat(lat.toFixed(6)),
          lon: parseFloat(lon.toFixed(6)),
          rawFormat: 'DD',
          formattedText: `${lat.toFixed(5)}° N, ${lon.toFixed(5)}° E`,
        })
        setError(null)
      } else {
        setParsedCoords(null)
        setError('Некоректні координати в полях')
      }
    }
  }, [latInput, lonInput, inputMode])

  // Розрахунок сектора
  const sectorInfo = parsedCoords ? snapToSector(parsedCoords.lat, parsedCoords.lon) : null

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
          setSettlement(`Сектор ${sectorInfo.sectorId}`)
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

  // Поміняти місцями широту і довготу (часта помилка при копіюванні lon, lat)
  const handleSwapCoords = () => {
    if (!parsedCoords) return
    const swappedLat = parsedCoords.lon
    const swappedLon = parsedCoords.lat

    if (Math.abs(swappedLat) <= 90 && Math.abs(swappedLon) <= 180) {
      setParsedCoords({
        ...parsedCoords,
        lat: swappedLat,
        lon: swappedLon,
        formattedText: `${swappedLat.toFixed(5)}° N, ${swappedLon.toFixed(5)}° E`,
      })
      setUnifiedInput(`${swappedLat}, ${swappedLon}`)
      setLatInput(swappedLat.toString())
      setLonInput(swappedLon.toString())
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!parsedCoords || !sectorInfo) {
      setError('Будь ласка, введіть коректні координати')
      return
    }

    const finalName = customName.trim() || settlement || `Сектор ${sectorInfo.sectorId}`
    const locationData: Omit<SavedLocation, 'id' | 'createdAt'> = {
      name: finalName,
      settlement: settlement || finalName,
      lat: sectorInfo.lat,
      lon: sectorInfo.lon,
      rawLat: parsedCoords.lat,
      rawLon: parsedCoords.lon,
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
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
                Підтримка будь-яких форматів: DD, DMS, DDM, N/E, кирилиця
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
          {/* Перемикач режимів вводу */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {inputMode === 'unified' ? 'Швидкий ввід одним рядком' : 'Роздільні поля'}
            </span>
            <button
              type="button"
              onClick={() => {
                if (inputMode === 'unified') {
                  setInputMode('split')
                  if (parsedCoords) {
                    setLatInput(parsedCoords.lat.toString())
                    setLonInput(parsedCoords.lon.toString())
                  }
                } else {
                  setInputMode('unified')
                  if (latInput && lonInput) {
                    setUnifiedInput(`${latInput}, ${lonInput}`)
                  }
                }
              }}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>{inputMode === 'unified' ? 'Розділити на широту/довготу' : 'Ввести одним рядком'}</span>
            </button>
          </div>

          {/* Ввід одним рядком (Unified) */}
          {inputMode === 'unified' ? (
            <div>
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  placeholder="Вставте: 47.8512, 35.1098 або 47°51'04&quot;N 35°06'35&quot;E..."
                  value={unifiedInput}
                  onChange={(e) => setUnifiedInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Приймає формати: <span className="font-mono">48.12, 37.34</span> | <span className="font-mono">48°12'34"N 37°34'12"E</span> | <span className="font-mono">48 12.34N 37 34.12E</span> | <span className="font-mono">посилання Google Maps</span>
              </p>
            </div>
          ) : (
            /* Роздільні поля (Split) */
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Широта (Lat)
                </label>
                <input
                  type="text"
                  placeholder="47.8500 або 47°51'04&quot;N"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Довгота (Lon)
                </label>
                <input
                  type="text"
                  placeholder="35.1000 або 35°06'35&quot;E"
                  value={lonInput}
                  onChange={(e) => setLonInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Помилка розпізнавання */}
          {error && !parsedCoords && (
            <div className="p-2.5 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl">
              {error}
            </div>
          )}

          {/* Плашка успішно розпізнаних координат та сектора */}
          {parsedCoords && sectorInfo && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Розпізнано: {parsedCoords.lat.toFixed(5)}°, {parsedCoords.lon.toFixed(5)}°
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                    {parsedCoords.rawFormat}
                  </span>
                </div>

                {/* Кнопка "Поміняти місцями" */}
                <button
                  type="button"
                  onClick={handleSwapCoords}
                  title="Поміняти місцями широту і довготу"
                  className="text-[11px] text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-emerald-500/20 transition-colors"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>Ш ⇄ Д</span>
                </button>
              </div>

              {/* Тактичний сектор */}
              <div className="pt-1.5 border-t border-emerald-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Тактичний сектор: {sectorInfo.sectorId}</span>
                </div>
                <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                  {sectorInfo.approxSizeKm}
                </span>
              </div>

              {/* Найближчий н.п. */}
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

              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Заокруглений центр: {sectorInfo.lat.toFixed(2)}° N, {sectorInfo.lon.toFixed(2)}° E. Точні координати захищені (OPSEC).
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
              disabled={!parsedCoords}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
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
