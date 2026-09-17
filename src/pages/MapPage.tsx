import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import L from 'leaflet'
import {
  ArrowLeft,
  Layers,
  MapPin,
  Check,
  Plus,
  Loader2,
  Crosshair,
  ShieldAlert,
} from 'lucide-react'
import {
  snapToSector,
  fetchNearestSettlement,
  getActiveLocation,
  setActiveLocation,
  addOrUpdateLocation,
} from '../features/meteo/utils/geoUtils'
import type { SavedLocation, SectorInfo } from '../features/meteo/types/location'
import { useAuth } from '../context/useAuth'

// Виправлення шляхів до стандартних іконок маркерів Leaflet у Vite
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

type MapLayerType = 'street' | 'satellite'

export const MapPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/app'

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const sectorRectRef = useRef<L.Rectangle | null>(null)
  const tileLayerRef = useRef<L.TileLayer | null>(null)

  const [activeLayer, setActiveLayer] = useState<MapLayerType>('street')
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [sectorInfo, setSectorInfo] = useState<SectorInfo | null>(null)
  const [settlement, setSettlement] = useState<string>('')
  const [customName, setCustomName] = useState<string>('')
  const [isLoadingGeo, setIsLoadingGeo] = useState(false)
  const [isSavedInList, setIsSavedInList] = useState(false)

  // Початкові координати з активної локації
  const initialLocation = useRef<SavedLocation>(getActiveLocation())

  // Ініціалізація карти Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const initialLat = initialLocation.current.lat || 48.3794
    const initialLon = initialLocation.current.lon || 31.1656
    const initialZoom = initialLocation.current.lat ? 10 : 6

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: initialZoom,
      zoomControl: false,
    })

    // Додаємо зум-контрол у зручний кут (знизу праворуч)
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Базовий тайловий шар
    const streetTiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }
    ).addTo(map)

    tileLayerRef.current = streetTiles
    mapInstanceRef.current = map

    // Функція встановлення вибору точки
    const handlePickPoint = (lat: number, lon: number) => {
      setSelectedCoords({ lat, lon })
      const sector = snapToSector(lat, lon)
      setSectorInfo(sector)
      setIsSavedInList(false)

      // Оновлюємо маркер
      if (markerRef.current) {
        markerRef.current.setLatLng([sector.lat, sector.lon])
      } else {
        markerRef.current = L.marker([sector.lat, sector.lon]).addTo(map)
      }

      // Малюємо рамку тактичного сектора ~5х8 км
      const bounds: L.LatLngBoundsExpression = [
        [sector.bbox.minLat, sector.bbox.minLon],
        [sector.bbox.maxLat, sector.bbox.maxLon],
      ]

      if (sectorRectRef.current) {
        sectorRectRef.current.setBounds(bounds)
      } else {
        sectorRectRef.current = L.rectangle(bounds, {
          color: '#10b981',
          weight: 2,
          fillColor: '#10b981',
          fillOpacity: 0.15,
          dashArray: '4, 4',
        }).addTo(map)
      }

      // Зворотне геокодування
      setIsLoadingGeo(true)
      fetchNearestSettlement(sector.lat, sector.lon)
        .then((name) => {
          setSettlement(name)
          setCustomName(name)
          setIsLoadingGeo(false)
        })
        .catch(() => {
          const fallback = `Сектор ${sector.sectorId}`
          setSettlement(fallback)
          setCustomName(fallback)
          setIsLoadingGeo(false)
        })
    }

    // Початкове відображення точки, якщо є активна локація
    if (initialLocation.current.lat && initialLocation.current.lon) {
      handlePickPoint(initialLocation.current.lat, initialLocation.current.lon)
    }

    // Клік мишею
    map.on('click', (e: L.LeafletMouseEvent) => {
      handlePickPoint(e.latlng.lat, e.latlng.lng)
    })

    // Довгий тап на мобільних пристроях (contextmenu в Leaflet викликається при touch hold)
    map.on('contextmenu', (e: L.LeafletMouseEvent) => {
      handlePickPoint(e.latlng.lat, e.latlng.lng)
    })

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Перемикання шарів мапи (Вулиці / Супутник)
  const handleChangeLayer = (layer: MapLayerType) => {
    if (!mapInstanceRef.current || layer === activeLayer) return

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current)
    }

    let newTileLayer: L.TileLayer
    if (layer === 'satellite') {
      newTileLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 18,
        }
      )
    } else {
      newTileLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18,
        }
      )
    }

    newTileLayer.addTo(mapInstanceRef.current)
    tileLayerRef.current = newTileLayer
    setActiveLayer(layer)
  }

  // Центрування на поточну геолокацію пристрою
  const handleCurrentGeolocation = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        mapInstanceRef.current?.setView([latitude, longitude], 12)
        // Також вибираємо цю точку
        const sector = snapToSector(latitude, longitude)
        setSectorInfo(sector)
        setSelectedCoords({ lat: latitude, lon: longitude })
      },
      (err) => {
        console.warn('Не вдалося отримати GPS-координати:', err)
      }
    )
  }

  // Застосувати локацію для розрахунку погоди
  const handleApplyLocation = () => {
    if (!sectorInfo) return

    const finalName = customName.trim() || settlement || `Сектор ${sectorInfo.sectorId}`
    const loc: SavedLocation = {
      id: `loc_${Date.now()}`,
      name: finalName,
      settlement: settlement || finalName,
      lat: sectorInfo.lat,
      lon: sectorInfo.lon,
      rawLat: selectedCoords?.lat,
      rawLon: selectedCoords?.lon,
      sectorId: sectorInfo.sectorId,
      isPinned: false,
      createdAt: new Date().toISOString(),
    }

    // Зберігаємо як активну локацію
    setActiveLocation(loc)

    // Якщо користувач також захотів додати у список збережених
    if (user && isSavedInList) {
      addOrUpdateLocation(loc)
    }

    navigate(returnTo)
  }

  // Зберегти у список постійних місць
  const handleSaveToMyPlaces = () => {
    if (!user || !sectorInfo) return
    const finalName = customName.trim() || settlement || `Сектор ${sectorInfo.sectorId}`
    const loc = addOrUpdateLocation({
      name: finalName,
      settlement: settlement || finalName,
      lat: sectorInfo.lat,
      lon: sectorInfo.lon,
      rawLat: selectedCoords?.lat,
      rawLon: selectedCoords?.lon,
      sectorId: sectorInfo.sectorId,
      isPinned: false,
    })
    setIsSavedInList(true)
    setActiveLocation(loc)
  }

  return (
    <div className="relative w-full h-[calc(100vh-80px)] min-h-[500px] flex flex-col overflow-hidden">
      {/* Верхня плашка управління картою */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(returnTo)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 font-semibold text-xs shadow-lg backdrop-blur-md border border-slate-200/80 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>До прогнозу</span>
        </button>

        {/* Перемикач шарів */}
        <div className="flex bg-white/95 dark:bg-slate-900/95 rounded-xl shadow-lg backdrop-blur-md border border-slate-200/80 dark:border-slate-800 p-0.5">
          <button
            type="button"
            onClick={() => handleChangeLayer('street')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeLayer === 'street'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Схема</span>
          </button>
          <button
            type="button"
            onClick={() => handleChangeLayer('satellite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeLayer === 'satellite'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Супутник</span>
          </button>
        </div>

        {/* Кнопка "Моя локація" */}
        <button
          type="button"
          onClick={handleCurrentGeolocation}
          className="p-2 rounded-xl bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold shadow-lg backdrop-blur-md border border-slate-200/80 dark:border-slate-800 transition-all"
          title="Моє місцезнаходження"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Підказка щодо вибору точки */}
      <div className="absolute top-4 right-4 z-20 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 text-white text-[11px] font-medium backdrop-blur-md border border-white/10 shadow-md">
        <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
        <span>Клік або довгий тап встановлює центр тактичного сектора (~5х8 км)</span>
      </div>

      {/* Контейнер Leaflet */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Нижня плашка вибору сектора */}
      {sectorInfo && (
        <div className="absolute bottom-5 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-md z-20 bg-white/95 dark:bg-slate-900/95 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Сектор: {sectorInfo.sectorId}
                </h3>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                  {sectorInfo.approxSizeKm}
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1.5">
                <span>Населений пункт:</span>
                {isLoadingGeo ? (
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                ) : (
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {settlement || 'Визначається...'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Власна назва локації {!user && <span className="text-amber-500 lowercase font-normal">(потрібна авторизація)</span>}
              </label>
              <input
                type="text"
                disabled={!user}
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={!user ? "Збереження назви доступне після авторизації" : "Наприклад: База 1 або Вільнянськ Південь"}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSaveToMyPlaces}
                disabled={!user || isSavedInList}
                title={!user ? "Збереження в «Мої місця» доступне лише після авторизації" : undefined}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                  !user
                    ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
                    : isSavedInList
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                {isSavedInList ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{isSavedInList ? 'Збережено' : 'В мої місця'}</span>
              </button>

              <button
                type="button"
                onClick={handleApplyLocation}
                className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Застосувати для прогнозу</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
