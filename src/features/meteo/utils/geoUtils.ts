import type { SavedLocation, SectorInfo } from '../types/location'
import { formatMGRS } from './coordParser'

export const LAT_STEP = 0.05 // ~5.56 км
export const LON_STEP = 0.10 // ~7.3 км на 48-50° широти

export const METEO_LOCATIONS_STORAGE_KEY = 'meteo_user_locations_v2'
export const METEO_ACTIVE_LOCATION_KEY = 'meteo_active_location_v2'

// Базові локації за замовчуванням
export const DEFAULT_LOCATIONS: SavedLocation[] = [
  {
    id: 'loc_kyiv',
    name: 'Київ',
    settlement: 'Київ',
    lat: 50.45,
    lon: 30.50,
    sectorId: '50.45_30.50',
    mgrs: '36U UA 22520 91652',
    isPinned: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'loc_zp',
    name: 'Запоріжжя',
    settlement: 'Запоріжжя',
    lat: 47.85,
    lon: 35.10,
    sectorId: '47.85_35.10',
    mgrs: '36T XU 57100 01763',
    isPinned: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'loc_dnipro',
    name: 'Дніпро',
    settlement: 'Дніпро',
    lat: 48.45,
    lon: 35.00,
    sectorId: '48.45_35.00',
    mgrs: '36U XU 47885 68249',
    isPinned: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'loc_odesa',
    name: 'Одеса',
    settlement: 'Одеса',
    lat: 46.50,
    lon: 30.70,
    sectorId: '46.50_30.70',
    mgrs: '36T US 23519 52173',
    isPinned: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'loc_kharkiv',
    name: 'Харків',
    settlement: 'Харків',
    lat: 50.00,
    lon: 36.20,
    sectorId: '50.00_36.20',
    mgrs: '37U BR 99345 42387',
    isPinned: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'loc_lviv',
    name: 'Львів',
    settlement: 'Львів',
    lat: 49.85,
    lon: 24.00,
    sectorId: '49.85_24.00',
    mgrs: '35U KR 84347 26270',
    isPinned: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]

/**
 * Розрахунок тактичного сектора (~5х8 км) за координатами:
 * заокруглення до фіксованої сітки (LAT_STEP = 0.05°, LON_STEP = 0.10°)
 */
export function snapToSector(lat: number, lon: number): SectorInfo {
  const roundedLat = parseFloat((Math.round(lat / LAT_STEP) * LAT_STEP).toFixed(4))
  const roundedLon = parseFloat((Math.round(lon / LON_STEP) * LON_STEP).toFixed(4))

  const minLat = parseFloat((roundedLat - LAT_STEP / 2).toFixed(4))
  const maxLat = parseFloat((roundedLat + LAT_STEP / 2).toFixed(4))
  const minLon = parseFloat((roundedLon - LON_STEP / 2).toFixed(4))
  const maxLon = parseFloat((roundedLon + LON_STEP / 2).toFixed(4))

  // 1 градус широти ≈ 111.13 км
  const latKm = 111.13 * LAT_STEP
  // 1 градус довготи ≈ 111.32 * cos(lat)
  const lonKm = LON_STEP * 111.32 * Math.cos((roundedLat * Math.PI) / 180)

  const approxSizeKm = `${latKm.toFixed(1)} × ${lonKm.toFixed(1)} км`
  const sectorId = `${roundedLat.toFixed(2)}_${roundedLon.toFixed(2)}`

  return {
    lat: roundedLat,
    lon: roundedLon,
    sectorId,
    bbox: { minLat, maxLat, minLon, maxLon },
    approxSizeKm,
  }
}

/**
 * Кеш геокодування в пам'яті для уникнення повторних запитів
 */
const geocodeCache = new Map<string, string>()

/**
 * Зворотне геокодування (Reverse Geocoding) через OpenStreetMap Nominatim
 * Визначає назву найближчого міста/селища/села українською мовою
 */
export async function fetchNearestSettlement(lat: number, lon: number): Promise<string> {
  const cacheKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1&accept-language=uk`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MeteoUAV-Web/1.0',
        },
      }
    )

    if (!res.ok) {
      throw new Error(`Nominatim error: ${res.status}`)
    }

    const data = await res.json()
    const address = data.address || {}

    const settlement =
      address.city ||
      address.town ||
      address.village ||
      address.hamlet ||
      address.suburb ||
      address.municipality ||
      address.county ||
      data.name ||
      `Сектор ${lat.toFixed(2)}, ${lon.toFixed(2)}`

    geocodeCache.set(cacheKey, settlement)
    return settlement
  } catch (err) {
    console.warn('Не вдалося визначити назву населеного пункту через геокодер:', err)
    return `Сектор ${lat.toFixed(2)}, ${lon.toFixed(2)}`
  }
}

/**
 * Отримання списку збережених локацій з міграцією старих даних
 */
export function getStoredLocations(): SavedLocation[] {
  try {
    const raw = localStorage.getItem(METEO_LOCATIONS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }

    // Перевірка на стару структуру (масиви рядків 'meteo_pinned_locations' та 'meteo_saved_locations')
    const oldPinned = localStorage.getItem('meteo_pinned_locations')
    const oldSaved = localStorage.getItem('meteo_saved_locations')

    if (oldPinned || oldSaved) {
      const pinnedNames: string[] = oldPinned ? JSON.parse(oldPinned) : []
      const savedNames: string[] = oldSaved ? JSON.parse(oldSaved) : []

      const migrated: SavedLocation[] = []

      // Знаходимо у DEFAULT_LOCATIONS або створюємо
      const allNames = Array.from(new Set([...pinnedNames, ...savedNames]))
      for (const name of allNames) {
        const defaultMatch = DEFAULT_LOCATIONS.find(
          (d) => d.name.toLowerCase() === name.toLowerCase()
        )
        if (defaultMatch) {
          migrated.push({
            ...defaultMatch,
            isPinned: pinnedNames.includes(name),
          })
        } else {
          // Якщо місто не з дефолтного списку — створюємо точку з базовими координатами України
          const sector = snapToSector(49.0, 31.0)
          migrated.push({
            id: `loc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name,
            settlement: name,
            lat: sector.lat,
            lon: sector.lon,
            sectorId: sector.sectorId,
            isPinned: pinnedNames.includes(name),
            createdAt: new Date().toISOString(),
          })
        }
      }

      if (migrated.length > 0) {
        localStorage.setItem(METEO_LOCATIONS_STORAGE_KEY, JSON.stringify(migrated))
        return migrated
      }
    }
  } catch (e) {
    console.error('Помилка завантаження збережених локацій:', e)
  }

  // Якщо даних немає — записуємо базові
  localStorage.setItem(METEO_LOCATIONS_STORAGE_KEY, JSON.stringify(DEFAULT_LOCATIONS))
  return DEFAULT_LOCATIONS
}

/**
 * Збереження всього списку локацій
 */
export function saveStoredLocations(locations: SavedLocation[]): void {
  try {
    localStorage.setItem(METEO_LOCATIONS_STORAGE_KEY, JSON.stringify(locations))
    // Для зворотної сумісності також оновлюємо старі ключі
    const pinned = locations.filter((l) => l.isPinned).map((l) => l.name)
    const saved = locations.filter((l) => !l.isPinned).map((l) => l.name)
    localStorage.setItem('meteo_pinned_locations', JSON.stringify(pinned))
    localStorage.setItem('meteo_saved_locations', JSON.stringify(saved))
  } catch (e) {
    console.error('Помилка збереження локацій:', e)
  }
}

/**
 * Отримання поточної активної локації
 */
export function getActiveLocation(): SavedLocation {
  try {
    const raw = localStorage.getItem(METEO_ACTIVE_LOCATION_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    // fallback
  }

  const all = getStoredLocations()
  const defaultLoc = all.find((l) => l.name === 'Запоріжжя') || all[0] || DEFAULT_LOCATIONS[1]
  setActiveLocation(defaultLoc)
  return defaultLoc
}

/**
 * Збереження активної локації
 */
export function setActiveLocation(location: SavedLocation): void {
  try {
    const updated = {
      ...location,
      lastUsedAt: new Date().toISOString(),
    }
    localStorage.setItem(METEO_ACTIVE_LOCATION_KEY, JSON.stringify(updated))
  } catch (e) {
    console.error('Помилка запису активної локації:', e)
  }
}

/**
 * Додавання або оновлення локації
 */
export function addOrUpdateLocation(
  loc: Omit<SavedLocation, 'id' | 'createdAt'> & { id?: string }
): SavedLocation {
  const list = getStoredLocations()
  const id = loc.id || `loc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
  const now = new Date().toISOString()

  const mgrsVal = loc.mgrs || formatMGRS(loc.lat, loc.lon).formatted
  const existingIndex = list.findIndex((item) => item.id === id || item.sectorId === loc.sectorId)

  let savedItem: SavedLocation

  if (existingIndex >= 0) {
    savedItem = {
      ...list[existingIndex],
      ...loc,
      mgrs: mgrsVal,
      id: list[existingIndex].id,
      createdAt: list[existingIndex].createdAt || now,
      lastUsedAt: now,
    }
    list[existingIndex] = savedItem
  } else {
    savedItem = {
      ...loc,
      mgrs: mgrsVal,
      id,
      createdAt: now,
      lastUsedAt: now,
    }
    list.push(savedItem)
  }

  saveStoredLocations(list)
  return savedItem
}

/**
 * Видалення локації за ID
 */
export function deleteStoredLocation(id: string): SavedLocation[] {
  const list = getStoredLocations()
  const updated = list.filter((item) => item.id !== id)
  saveStoredLocations(updated)
  return updated
}

/**
 * Закріплення/відкріплення локації
 */
export function togglePinStoredLocation(id: string): SavedLocation[] {
  const list = getStoredLocations()
  const updated = list.map((item) => {
    if (item.id === id) {
      return { ...item, isPinned: !item.isPinned }
    }
    return item
  })
  saveStoredLocations(updated)
  return updated
}

/**
 * Зміна користувацької назви локації
 */
export function updateStoredLocationName(id: string, newName: string): SavedLocation[] {
  const list = getStoredLocations()
  const updated = list.map((item) => {
    if (item.id === id) {
      return { ...item, name: newName.trim() }
    }
    return item
  })
  saveStoredLocations(updated)
  return updated
}
