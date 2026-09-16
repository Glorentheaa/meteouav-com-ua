import type { SavedLocation } from '../features/meteo/types/location'
import type { ForecastDepth, ForecastDetail, FlightLevels, MeteoWarnings } from '../features/meteo/types/meteo'
import { snapToSector } from '../features/meteo/utils/geoUtils'

export interface MeteoRequestPayload {
  version: string
  timestamp: string
  user: {
    id: string | null
    email: string | null
    is_pro: boolean
  }
  location: {
    id: string
    name: string
    settlement: string
    sector_id: string
    sector: {
      lat: number
      lon: number
      bbox: {
        min_lat: number
        max_lat: number
        min_lon: number
        max_lon: number
      }
      approx_size_km: string
    }
  }
  parameters: {
    depth_hours: number
    detail_hours: number
    flight_levels_m: number
  }
  warnings: {
    wind_speed_limit: number
    gust_limit: number
    precipitation: string
    fog: string
    humidity_limit: number
    min_visibility_km: number
    min_temp_c: number
    max_temp_c: number
  }
}

export interface MeteoResponse {
  success: boolean
  message: string
  data?: unknown
  error?: string
}

export const METEO_LAST_PAYLOAD_KEY = 'meteo_last_n8n_payload'

/**
 * Побудова стандартизованого об'єкта запиту для n8n
 */
export function buildMeteoPayload(params: {
  location: SavedLocation
  depth: ForecastDepth
  detail: ForecastDetail
  levels: FlightLevels
  warnings: MeteoWarnings
  user?: {
    id: string | null
    email: string | null
    isPro: boolean
  }
}): MeteoRequestPayload {
  const { location, depth, detail, levels, warnings, user } = params
  const sectorInfo = snapToSector(location.lat, location.lon)

  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    user: {
      id: user?.id || null,
      email: user?.email || null,
      is_pro: Boolean(user?.isPro),
    },
    location: {
      id: location.id,
      name: location.name,
      settlement: location.settlement,
      sector_id: sectorInfo.sectorId,
      sector: {
        lat: sectorInfo.lat,
        lon: sectorInfo.lon,
        bbox: {
          min_lat: sectorInfo.bbox.minLat,
          max_lat: sectorInfo.bbox.maxLat,
          min_lon: sectorInfo.bbox.minLon,
          max_lon: sectorInfo.bbox.maxLon,
        },
        approx_size_km: sectorInfo.approxSizeKm,
      },
    },
    parameters: {
      depth_hours: parseInt(depth, 10),
      detail_hours: parseInt(detail, 10),
      flight_levels_m: parseInt(levels, 10),
    },
    warnings: {
      wind_speed_limit: warnings.wind,
      gust_limit: warnings.gusts,
      precipitation: warnings.precip,
      fog: warnings.fog,
      humidity_limit: warnings.humidity,
      min_visibility_km: warnings.visibility,
      min_temp_c: warnings.minTemp,
      max_temp_c: warnings.maxTemp,
    },
  }
}

/**
 * Відправка запиту на n8n webhook або імітація / логування за відсутності URL
 */
export async function sendMeteoRequest(payload: MeteoRequestPayload): Promise<MeteoResponse> {
  const webhookUrl = import.meta.env.VITE_N8N_WEATHER_WEBHOOK_URL

  // Зберігаємо останній запит у localStorage для дебагу та перегляду
  try {
    localStorage.setItem(METEO_LAST_PAYLOAD_KEY, JSON.stringify(payload, null, 2))
  } catch (e) {
    console.error('Помилка кешування останнього payload:', e)
  }

  console.group('📡 [MeteoUAV -> n8n] Підготовка та відправка погодного запиту')
  console.log('Сектор:', payload.location.sector_id, `(${payload.location.settlement})`)
  console.log('Параметри:', payload.parameters)
  console.log('Попередження:', payload.warnings)
  console.log('Повний Payload:', payload)
  console.groupEnd()

  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`n8n webhook error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      return {
        success: true,
        message: 'Прогноз успішно отримано від n8n',
        data: result,
      }
    } catch (err) {
      console.error('Помилка відправки на n8n webhook:', err)
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Помилка з\'єднання з n8n',
        error: String(err),
      }
    }
  }

  // За відсутності налаштованого вебхука повертаємо готовність даних
  return {
    success: true,
    message: `Дані для сектора ${payload.location.sector_id} сформовано. n8n webhook не підключено (демо-режим).`,
    data: payload,
  }
}
