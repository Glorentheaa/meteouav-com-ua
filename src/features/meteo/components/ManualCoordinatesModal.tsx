import React, { useState, useEffect, useMemo } from 'react'
import {
  X,
  Navigation,
  MapPin,
  Check,
  Loader2,
  ArrowLeftRight,
  Sparkles,
  SlidersHorizontal,
  Copy,
  ClipboardPaste,
  ShieldCheck,
  Compass,
} from 'lucide-react'
import { snapToSector, fetchNearestSettlement, addOrUpdateLocation } from '../utils/geoUtils'
import {
  parseCoordinatePair,
  parseSingleCoordinate,
  formatMGRS,
  type CoordinateFormat,
} from '../utils/coordParser'
import type { SavedLocation } from '../types/location'
import { useAuth } from '../../../context/useAuth'

interface ManualCoordinatesModalProps {
  isOpen: boolean
  onClose: () => void
  onLocationSelected: (location: SavedLocation) => void
  initialLat?: number
  initialLon?: number
}

const FORMAT_CONFIG: Record<
  CoordinateFormat,
  { label: string; badgeClass: string }
> = {
  MGRS: {
    label: 'MGRS (НАТО / Дельта)',
    badgeClass: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  },
  UTM: {
    label: 'UTM (WGS-84)',
    badgeClass: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
  },
  SK42: {
    label: 'СК-42 (Гауса-Крюгера)',
    badgeClass: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
  },
  DD: {
    label: 'DD (Десяткові градуси)',
    badgeClass: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
  },
  DMS: {
    label: 'DMS (Градуси, мінути, сек)',
    badgeClass: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
  },
  DDM: {
    label: 'DDM (Градуси, десяткові мін)',
    badgeClass: 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
  },
  GEO_URL: {
    label: 'Картографічне посилання',
    badgeClass: 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30',
  },
  UNKNOWN: {
    label: 'Координати розпізнано',
    badgeClass: 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30',
  },
}

const SAMPLE_FORMATS = [
  { label: 'MGRS', value: '36TXU 57100 01763', hint: 'НАТО / Дельта' },
  { label: 'DD', value: '47.8500, 35.1000', hint: 'GPS / Maps' },
  { label: 'DMS', value: '47°51\'04"N 35°06\'35"E', hint: 'Авіація' },
  { label: 'UTM', value: '36T 657101 5301764', hint: 'WGS-84' },
  { label: 'СК-42', value: 'X: 5303987 Y: 6657295', hint: 'Артилерія / Кропива' },
]

export const ManualCoordinatesModal: React.FC<ManualCoordinatesModalProps> = ({
  isOpen,
  onClose,
  onLocationSelected,
  initialLat = 47.85,
  initialLon = 35.10,
}) => {
  const { user } = useAuth()

  // Режим вводу: 'unified' (єдиний універсальний рядок) або 'split' (окремі поля)
  const [inputMode, setInputMode] = useState<'unified' | 'split'>('unified')

  // Стан єдиного рядка
  const [unifiedInput, setUnifiedInput] = useState(`${initialLat}, ${initialLon}`)

  // Стан окремих полів
  const [latInput, setLatInput] = useState(initialLat.toString())
  const [lonInput, setLonInput] = useState(initialLon.toString())

  const [customName, setCustomName] = useState('')
  const [saveToList, setSaveToList] = useState(true)
  const [fetchedSettlement, setFetchedSettlement] = useState<string>('')
  const [isLoadingGeo, setIsLoadingGeo] = useState(false)
  const [customError, setCustomError] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Обчислення розпізнаних координат та помилки валідації без каскадних рендерів
  const { parsedCoords, parseError } = useMemo(() => {
    if (inputMode === 'unified') {
      const trimmed = unifiedInput.trim()
      if (!trimmed) {
        return { parsedCoords: null, parseError: null }
      }

      const result = parseCoordinatePair(trimmed)
      if (result) {
        return { parsedCoords: result, parseError: null }
      }

      return {
        parsedCoords: null,
        parseError:
          trimmed.length > 5
            ? 'Формат не розпізнано. Перевірте ввід: підтримуються MGRS (напр. 36TXU 57100 01763), UTM, СК-42, DD (47.85, 35.10), DMS, або посилання карт.'
            : null,
      }
    }

    // inputMode === 'split'
    const trimmedLat = latInput.trim()
    const trimmedLon = lonInput.trim()

    if (!trimmedLat && !trimmedLon) {
      return { parsedCoords: null, parseError: null }
    }

    // Якщо користувач вставив повний MGRS/рядок у поле широти
    if (trimmedLat && !trimmedLon) {
      const fullParsed = parseCoordinatePair(trimmedLat)
      if (fullParsed && fullParsed.rawFormat !== 'DD') {
        return { parsedCoords: fullParsed, parseError: null }
      }
      return { parsedCoords: null, parseError: null }
    }

    if (!trimmedLat || !trimmedLon) {
      return { parsedCoords: null, parseError: null }
    }

    const lat = parseSingleCoordinate(trimmedLat, false)
    const lon = parseSingleCoordinate(trimmedLon, true)

    if (lat !== null && lon !== null) {
      const full = parseCoordinatePair(`${lat}, ${lon}`)
      if (full) {
        return { parsedCoords: full, parseError: null }
      }
      return {
        parsedCoords: {
          lat: parseFloat(lat.toFixed(6)),
          lon: parseFloat(lon.toFixed(6)),
          rawFormat: 'DD' as const,
          formattedText: `${lat.toFixed(5)}° N, ${lon.toFixed(5)}° E`,
        },
        parseError: null,
      }
    }

    return {
      parsedCoords: null,
      parseError: 'Некоректні координати в полях широти/довготи',
    }
  }, [inputMode, unifiedInput, latInput, lonInput])

  const error = customError || parseError

  // Розрахунок тактичного сектора
  const sectorInfo = parsedCoords ? snapToSector(parsedCoords.lat, parsedCoords.lon) : null
  const settlement = sectorInfo ? fetchedSettlement : ''

  // Дебаунс для геокодування назви населеного пункту
  useEffect(() => {
    if (!sectorInfo) {
      return
    }

    let isMounted = true

    const timer = setTimeout(async () => {
      setIsLoadingGeo(true)
      try {
        const name = await fetchNearestSettlement(sectorInfo.lat, sectorInfo.lon)
        if (isMounted) {
          setFetchedSettlement(name)
          setIsLoadingGeo(false)
        }
      } catch {
        if (isMounted) {
          setFetchedSettlement(`Сектор ${sectorInfo.sectorId}`)
          setIsLoadingGeo(false)
        }
      }
    }, 400)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [sectorInfo])

  if (!isOpen) return null

  // Копіювання у буфер обміну
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Швидка вставка з буфера обміну
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setUnifiedInput(text.trim())
      }
    } catch {
      // Fallback
    }
  }

  // Поміняти місцями широту і довготу (помилка lon, lat)
  const handleSwapCoords = () => {
    if (!parsedCoords) return
    const swappedLat = parsedCoords.lon
    const swappedLon = parsedCoords.lat

    if (Math.abs(swappedLat) <= 90 && Math.abs(swappedLon) <= 180) {
      const updated = parseCoordinatePair(`${swappedLat}, ${swappedLon}`)
      if (updated) {
        setUnifiedInput(`${swappedLat}, ${swappedLon}`)
        setLatInput(swappedLat.toString())
        setLonInput(swappedLon.toString())
        setCustomError(null)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!parsedCoords || !sectorInfo) {
      setCustomError('Будь ласка, введіть коректні координати')
      return
    }

    const calculatedMgrs =
      parsedCoords.allFormats?.mgrs || formatMGRS(parsedCoords.lat, parsedCoords.lon).formatted

    const finalName = customName.trim() || settlement || `Сектор ${sectorInfo.sectorId}`
    const locationData: Omit<SavedLocation, 'id' | 'createdAt'> = {
      name: finalName,
      settlement: settlement || finalName,
      lat: sectorInfo.lat,
      lon: sectorInfo.lon,
      rawLat: parsedCoords.lat,
      rawLon: parsedCoords.lon,
      sectorId: sectorInfo.sectorId,
      mgrs: calculatedMgrs,
      isPinned: false,
    }

    let resultingLocation: SavedLocation

    if (user && saveToList) {
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
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Заголовок */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Введення координат
                </h3>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  Універсальний ввід
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                MGRS, UTM, СК-42, DD, DMS, DDM, посилання Google Maps / OSM
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Тіло форми з прокруткою */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Режим вводу та швидкі дії */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Compass className="w-3.5 h-3.5 text-emerald-500" />
              <span>{inputMode === 'unified' ? 'Швидкий ввід рядком (будь-який формат)' : 'Роздільні поля Lat / Lon'}</span>
            </div>
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
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline flex items-center gap-1 font-medium transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>{inputMode === 'unified' ? 'Розділити на широту/довготу' : 'Універсальний рядок'}</span>
            </button>
          </div>

          {/* Ввід єдиним рядком */}
          {inputMode === 'unified' ? (
            <div className="space-y-2">
              <div className="relative flex items-center">
                <input
                  type="text"
                  autoFocus
                  placeholder="Вставте: 36TXU 57100 01763, 47.8512, 35.1098 або посилання..."
                  value={unifiedInput}
                  onChange={(e) => setUnifiedInput(e.target.value)}
                  className="w-full pl-3.5 pr-20 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  {unifiedInput && (
                    <button
                      type="button"
                      onClick={() => setUnifiedInput('')}
                      title="Очистити поле"
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handlePaste}
                    title="Вставити з буфера обміну"
                    className="flex items-center gap-1 px-2 py-1 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-200/60 dark:bg-slate-800 rounded-lg hover:bg-emerald-500/10 transition-colors"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium hidden sm:inline">Вставити</span>
                  </button>
                </div>
              </div>

              {/* Швидкі зразки форматів (чіпи) */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mr-1">
                  Приклади:
                </span>
                {SAMPLE_FORMATS.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setUnifiedInput(s.value)}
                    title={`Вставити приклад ${s.label}: ${s.value} (${s.hint})`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700/60 transition-colors"
                  >
                    <span className="font-bold text-slate-700 dark:text-slate-200">{s.label}</span>
                  </button>
                ))}
              </div>
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Повідомлення про помилку */}
          {error && !parsedCoords && (
            <div className="p-3 text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl leading-relaxed animate-in fade-in duration-150">
              {error}
            </div>
          )}

          {/* Плашка успішно розпізнаних координат та конвертацій */}
          {parsedCoords && sectorInfo && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-slate-900/10 border border-emerald-500/30 space-y-3 animate-in fade-in duration-150">
              {/* Верхня стрічка розпізнаного результату */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Розпізнано:</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                      FORMAT_CONFIG[parsedCoords.rawFormat as CoordinateFormat]?.badgeClass ||
                      'bg-slate-500/20 text-slate-300 border-slate-500/30'
                    }`}
                  >
                    {FORMAT_CONFIG[parsedCoords.rawFormat as CoordinateFormat]?.label || parsedCoords.rawFormat}
                  </span>
                </div>

                {/* Кнопка "Ш ⇄ Д" для випадків переплутаних широти та довготи */}
                <button
                  type="button"
                  onClick={handleSwapCoords}
                  title="Поміняти місцями широту і довготу"
                  className="text-[11px] text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/60 dark:bg-slate-800/80 hover:bg-emerald-500/20 border border-slate-200 dark:border-slate-700/60 transition-colors"
                >
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>Ш ⇄ Д</span>
                </button>
              </div>

              {/* Сітка представлень у всіх військових та картографічних системах */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* 1. MGRS (Головна військова координата) */}
                <div className="p-2.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between sm:col-span-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>MGRS (НАТО / Дельта)</span>
                    </div>
                    <div className="font-mono text-sm font-bold text-emerald-900 dark:text-emerald-100 select-all">
                      {parsedCoords.allFormats?.mgrs ||
                        formatMGRS(parsedCoords.lat, parsedCoords.lon).formatted}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        parsedCoords.allFormats?.mgrs ||
                          formatMGRS(parsedCoords.lat, parsedCoords.lon).formatted,
                        'mgrs'
                      )
                    }
                    className="p-1.5 text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white rounded-lg hover:bg-emerald-500/20 transition-colors"
                    title="Скопіювати MGRS"
                  >
                    {copiedKey === 'mgrs' ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        Скопійовано!
                      </span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* 2. Десяткові градуси (DD) */}
                <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      Десяткові (DD)
                    </div>
                    <div className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 select-all">
                      {parsedCoords.lat.toFixed(5)}°, {parsedCoords.lon.toFixed(5)}°
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        `${parsedCoords.lat.toFixed(5)}, ${parsedCoords.lon.toFixed(5)}`,
                        'dd'
                      )
                    }
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Скопіювати DD"
                  >
                    {copiedKey === 'dd' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* 3. Градуси, мінути, секунди (DMS) */}
                <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      Градуси / сек (DMS)
                    </div>
                    <div className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 select-all">
                      {parsedCoords.allFormats?.dms || '—'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      parsedCoords.allFormats?.dms &&
                      handleCopy(parsedCoords.allFormats.dms, 'dms')
                    }
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Скопіювати DMS"
                  >
                    {copiedKey === 'dms' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* 4. UTM */}
                <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      UTM (WGS-84)
                    </div>
                    <div className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 select-all">
                      {parsedCoords.allFormats?.utm || '—'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      parsedCoords.allFormats?.utm &&
                      handleCopy(parsedCoords.allFormats.utm, 'utm')
                    }
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Скопіювати UTM"
                  >
                    {copiedKey === 'utm' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* 5. СК-42 (Гауса-Крюгера) */}
                <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      СК-42 (Гауса-Крюгера)
                    </div>
                    <div className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 select-all">
                      {parsedCoords.allFormats?.sk42 || '—'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      parsedCoords.allFormats?.sk42 &&
                      handleCopy(parsedCoords.allFormats.sk42, 'sk42')
                    }
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Скопіювати СК-42"
                  >
                    {copiedKey === 'sk42' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Тактичний сектор та населений пункт */}
              <div className="pt-2 border-t border-emerald-500/20 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Тактичний сектор: {sectorInfo.sectorId}</span>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md font-bold">
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

                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Заокруглений центр: {sectorInfo.lat.toFixed(2)}° N, {sectorInfo.lon.toFixed(2)}° E.
                  Точні координати захищені (OPSEC).
                </p>
              </div>
            </div>
          )}

          {/* Власна назва */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Власна назва / позиція (необов'язково) {!user && <span className="text-amber-500 lowercase font-normal">(потрібна авторизація)</span>}
            </label>
            <input
              type="text"
              disabled={!user}
              placeholder={
                !user
                  ? 'Збереження назви доступне після авторизації'
                  : settlement
                  ? `Наприклад: ${settlement} (Позиція 1)`
                  : 'Наприклад: База Схід / Позиція Альфа'
              }
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Чекбокс збереження в список */}
          <label className={`flex items-center gap-2.5 pt-0.5 ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              disabled={!user}
              checked={Boolean(user && saveToList)}
              onChange={(e) => setSaveToList(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 disabled:cursor-not-allowed"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300 select-none">
              Зберегти в мої місця для швидкого доступу {!user && <span className="text-amber-500 font-normal">(потрібна авторизація)</span>}
            </span>
          </label>

          {/* Кнопки дій */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/80">
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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
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
