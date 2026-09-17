/**
 * Універсальний парсер координат для широкого спектра систем і форматів:
 * - MGRS (Military Grid Reference System, стандарт НАТО / «Дельта»): 36TXU 57100 01763 / 36TXU5710001763 / 37TCL123456
 * - UTM (Universal Transverse Mercator, WGS-84): 36T 657101 5301764 / 36N 657101 5301764
 * - СК-42 (Гауса-Крюгера / Красовського 1940 / «Кропива»): X: 5303987 Y: 6657295 / 5303987 6657295
 * - Десяткові градуси (DD): 47.8512, 35.1098 / 47,8512 35,1098 / 47.8512N 35.1098E
 * - Градуси, мінути, секунди (DMS): 47°51'04.4"N 35°06'35.6"E / 47 51 04 N, 35 06 35 E
 * - Градуси, десяткові мінути (DDM): 47°51.072'N 35°06.588'E / 47 51.072 N 35 06.588 E
 * - Кириличні позначення: 47°51'04"Пн 35°06'35"Сх / 47.8512 пн.ш., 35.1098 сх.д.
 * - Посилання картографічних сервісів: Google Maps, DeepStateMap, OpenStreetMap, geo: URI
 * - Автоматичне вилучення координат із довільного тексту повідомлень/донесень
 */

import * as mgrsModule from 'mgrs'

interface MgrsLib {
  forward?: (ll: [number, number], accuracy?: number) => string
  toPoint?: (mgrsStr: string) => [number, number]
  default?: {
    forward?: (ll: [number, number], accuracy?: number) => string
    toPoint?: (mgrsStr: string) => [number, number]
  }
}

const mgrsRaw = mgrsModule as unknown as MgrsLib
const mgrsForward = mgrsRaw.forward || mgrsRaw.default?.forward
const mgrsToPoint = mgrsRaw.toPoint || mgrsRaw.default?.toPoint

export type CoordinateFormat =
  | 'MGRS'
  | 'UTM'
  | 'SK42'
  | 'DD'
  | 'DMS'
  | 'DDM'
  | 'GEO_URL'
  | 'UNKNOWN'

export interface FormattedCoordinatesAll {
  mgrs: string
  mgrsRaw: string
  utm: string
  sk42: string
  dd: string
  dms: string
  ddm: string
}

export interface ParsedCoordinates {
  lat: number
  lon: number
  rawFormat: CoordinateFormat
  formattedText: string
  allFormats?: FormattedCoordinatesAll
}

/**
 * Нормалізація символів (лапки, мінути, градуси, пробіли)
 */
function cleanString(str: string): string {
  return str
    .replace(/[\u201C\u201D\u2033]/g, '"') // різні подвійні лапки -> "
    .replace(/[\u2018\u2019\u2032']/g, "'") // різні одинарні лапки -> '
    .replace(/[\u00B0\u00BA]/g, '°') // градуси
    .replace(/[\t\r\n]+/g, ' ')
    .trim()
}

/**
 * Перевірка валідності діапазону широти і довготи (WGS-84)
 */
export function isValidRange(lat: number, lon: number): boolean {
  return (
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180 &&
    (lat !== 0 || lon !== 0) // виключаємо 0,0 Null Island
  )
}

// -------------------------------------------------------------
// КОНВЕРТАЦІЯ ТА ФОРМАТУВАННЯ У ВСІ СИСТЕМИ
// -------------------------------------------------------------

/**
 * Конвертація WGS-84 Lat/Lon у MGRS із гарним форматуванням із пробілами
 */
export function formatMGRS(lat: number, lon: number): { formatted: string; raw: string } {
  try {
    if (!mgrsForward) {
      return { formatted: 'N/A', raw: 'N/A' }
    }
    const raw = mgrsForward([lon, lat], 5) // 5 = точність 1м (10 цифр)
    // raw виглядає як: "36TXU5710101764"
    const match = raw.match(/^([0-9]{1,2}[A-Z])([A-Z]{2})([0-9]{5})([0-9]{5})$/)
    if (match) {
      const formatted = `${match[1]} ${match[2]} ${match[3]} ${match[4]}`
      return { formatted, raw }
    }
    return { formatted: raw, raw }
  } catch {
    return { formatted: 'N/A', raw: 'N/A' }
  }
}

/**
 * Конвертація WGS-84 Lat/Lon у UTM рядок
 */
export function latLonToUtm(lat: number, lon: number): {
  zone: number
  band: string
  hemisphere: 'N' | 'S'
  easting: number
  northing: number
  text: string
} {
  const a = 6378137.0
  const f = 1 / 298.257223563
  const b = a * (1 - f)
  const e2 = (a * a - b * b) / (a * a)
  const ePrime2 = (a * a - b * b) / (b * b)
  const k0 = 0.9996

  let zone = Math.floor((lon + 180) / 6) + 1
  if (zone > 60) zone = 60
  if (zone < 1) zone = 1

  const lon0 = ((zone - 1) * 6 - 180 + 3) * (Math.PI / 180)
  const latRad = lat * (Math.PI / 180)
  const lonRad = lon * (Math.PI / 180)

  const N = a / Math.sqrt(1 - e2 * Math.sin(latRad) * Math.sin(latRad))
  const T = Math.tan(latRad) * Math.tan(latRad)
  const C = ePrime2 * Math.cos(latRad) * Math.cos(latRad)
  const A = Math.cos(latRad) * (lonRad - lon0)

  const M =
    a *
    ((1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 * e2 * e2) / 256) * latRad -
      ((3 * e2) / 8 + (3 * e2 * e2) / 32 + (45 * e2 * e2 * e2) / 1024) * Math.sin(2 * latRad) +
      ((15 * e2 * e2) / 256 + (45 * e2 * e2 * e2) / 1024) * Math.sin(4 * latRad) -
      ((35 * e2 * e2 * e2) / 3072) * Math.sin(6 * latRad))

  const easting =
    k0 *
      N *
      (A +
        ((1 - T + C) * Math.pow(A, 3)) / 6 +
        ((5 - 18 * T + T * T + 72 * C - 58 * ePrime2) * Math.pow(A, 5)) / 120) +
    500000

  let northing =
    k0 *
    (M +
      N *
        Math.tan(latRad) *
        ((A * A) / 2 +
          ((5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4)) / 24 +
          ((61 - 58 * T + T * T + 600 * C - 330 * ePrime2) * Math.pow(A, 6)) / 720))

  if (lat < 0) {
    northing += 10000000
  }

  const letters = 'CDEFGHJKLMNPQRSTUVWXX'
  const bandIndex = Math.min(letters.length - 1, Math.max(0, Math.floor((lat + 80) / 8)))
  const band = letters[bandIndex] || 'U'

  const roundedE = Math.round(easting)
  const roundedN = Math.round(northing)

  return {
    zone,
    band,
    hemisphere: lat >= 0 ? 'N' : 'S',
    easting: roundedE,
    northing: roundedN,
    text: `${zone}${band} ${roundedE} ${roundedN}`,
  }
}

/**
 * Конвертація UTM у WGS-84 Lat/Lon
 */
export function utmToLatLon(
  zone: number,
  hemisphere: 'N' | 'S',
  easting: number,
  northing: number
): { lat: number; lon: number } {
  const a = 6378137.0
  const f = 1 / 298.257223563
  const b = a * (1 - f)
  const e2 = (a * a - b * b) / (a * a)
  const ePrime2 = (a * a - b * b) / (b * b)
  const k0 = 0.9996

  const x = easting - 500000
  const y = hemisphere === 'S' ? northing - 10000000 : northing

  const M = y / k0
  const mu = M / (a * (1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 * e2 * e2) / 256))
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2))

  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * Math.pow(e1, 3)) / 32) * Math.sin(2 * mu) +
    ((21 * Math.pow(e1, 2)) / 16 - (55 * Math.pow(e1, 4)) / 32) * Math.sin(4 * mu) +
    ((151 * Math.pow(e1, 3)) / 96) * Math.sin(6 * mu) +
    ((1097 * Math.pow(e1, 4)) / 512) * Math.sin(8 * mu)

  const N1 = a / Math.sqrt(1 - e2 * Math.sin(phi1) * Math.sin(phi1))
  const T1 = Math.tan(phi1) * Math.tan(phi1)
  const C1 = ePrime2 * Math.cos(phi1) * Math.cos(phi1)
  const R1 = (a * (1 - e2)) / Math.pow(1 - e2 * Math.sin(phi1) * Math.sin(phi1), 1.5)
  const D = x / (N1 * k0)

  const latRad =
    phi1 -
    ((N1 * Math.tan(phi1)) / R1) *
      ((D * D) / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ePrime2) * Math.pow(D, 4)) / 24 +
        ((61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * ePrime2 - 3 * C1 * C1) * Math.pow(D, 6)) /
          720)

  const lon0 = ((zone - 1) * 6 - 180 + 3) * (Math.PI / 180)
  const lonRad =
    lon0 +
    (D -
      ((1 + 2 * T1 + C1) * Math.pow(D, 3)) / 6 +
      ((5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * ePrime2 + 24 * T1 * T1) * Math.pow(D, 5)) / 120) /
      Math.cos(phi1)

  return {
    lat: (latRad * 180) / Math.PI,
    lon: (lonRad * 180) / Math.PI,
  }
}

/**
 * Конвертація WGS-84 у СК-42 (Гауса-Крюгера, еліпсоїд Красовського 1940)
 */
export function wgs84ToSk42(latWgs: number, lonWgs: number): {
  x: number
  y: number
  zone: number
  text: string
} {
  // Зсув датуму WGS84 -> СК-42 (ДСТУ / ГОСТ)
  const da = 6378245.0 - 6378137.0 // +108
  const df = 1 / 298.3 - 1 / 298.257223563
  const dx = -23.57
  const dy = 140.95
  const dz = 79.8

  const latRad = (latWgs * Math.PI) / 180
  const lonRad = (lonWgs * Math.PI) / 180
  const a = 6378137.0
  const f = 1 / 298.257223563
  const e2 = 2 * f - f * f

  const sinLat = Math.sin(latRad)
  const cosLat = Math.cos(latRad)
  const sinLon = Math.sin(lonRad)
  const cosLon = Math.cos(lonRad)

  const W = Math.sqrt(1 - e2 * sinLat * sinLat)
  const M_mol = (a * (1 - e2)) / Math.pow(W, 3)
  const N_mol = a / W

  const dLatSec =
    (-dx * sinLat * cosLon -
      dy * sinLat * sinLon +
      dz * cosLat +
      (a * df + f * da) * Math.sin(2 * latRad)) /
    (M_mol * Math.sin(((1 / 3600) * Math.PI) / 180))
  const dLonSec =
    (-dx * sinLon + dy * cosLon) / (N_mol * cosLat * Math.sin(((1 / 3600) * Math.PI) / 180))

  const latSk42 = latWgs + dLatSec / 3600
  const lonSk42 = lonWgs + dLonSec / 3600

  // Проекція Гауса-Крюгера на еліпсоїді Красовського
  const a_k = 6378245.0
  const f_k = 1 / 298.3
  const b_k = a_k * (1 - f_k)
  const e2_k = (a_k * a_k - b_k * b_k) / (a_k * a_k)
  const ePrime2_k = (a_k * a_k - b_k * b_k) / (b_k * b_k)

  const zone = Math.floor(lonSk42 / 6) + 1
  const lon0 = ((zone * 6 - 3) * Math.PI) / 180
  const phi = (latSk42 * Math.PI) / 180
  const lam = (lonSk42 * Math.PI) / 180

  const N = a_k / Math.sqrt(1 - e2_k * Math.sin(phi) * Math.sin(phi))
  const T = Math.tan(phi) * Math.tan(phi)
  const C = ePrime2_k * Math.cos(phi) * Math.cos(phi)
  const A = Math.cos(phi) * (lam - lon0)

  const M =
    a_k *
    ((1 - e2_k / 4 - (3 * e2_k * e2_k) / 64 - (5 * e2_k * e2_k * e2_k) / 256) * phi -
      ((3 * e2_k) / 8 + (3 * e2_k * e2_k) / 32 + (45 * e2_k * e2_k * e2_k) / 1024) *
        Math.sin(2 * phi) +
      ((15 * e2_k * e2_k) / 256 + (45 * e2_k * e2_k * e2_k) / 1024) * Math.sin(4 * phi) -
      ((35 * e2_k * e2_k * e2_k) / 3072) * Math.sin(6 * phi))

  const easting =
    N *
      (A +
        ((1 - T + C) * Math.pow(A, 3)) / 6 +
        ((5 - 18 * T + T * T + 72 * C - 58 * ePrime2_k) * Math.pow(A, 5)) / 120) +
    500000
  const northing =
    M +
    N *
      Math.tan(phi) *
      ((A * A) / 2 +
        ((5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4)) / 24 +
        ((61 - 58 * T + T * T + 600 * C - 330 * ePrime2_k) * Math.pow(A, 6)) / 720)

  const yWithZone = zone * 1000000 + Math.round(easting)
  const x = Math.round(northing)

  return {
    x,
    y: yWithZone,
    zone,
    text: `X: ${x} Y: ${yWithZone}`,
  }
}

/**
 * Конвертація СК-42 (Гауса-Крюгера) у WGS-84
 */
export function sk42ToWgs84(x: number, yWithZone: number): { lat: number; lon: number } {
  const zone = Math.floor(yWithZone / 1000000)
  const y = yWithZone % 1000000

  const a_k = 6378245.0
  const f_k = 1 / 298.3
  const b_k = a_k * (1 - f_k)
  const e2_k = (a_k * a_k - b_k * b_k) / (a_k * a_k)
  const ePrime2_k = (a_k * a_k - b_k * b_k) / (b_k * b_k)

  const x_gk = x
  const y_gk = y - 500000

  const M = x_gk
  const mu = M / (a_k * (1 - e2_k / 4 - (3 * e2_k * e2_k) / 64 - (5 * e2_k * e2_k * e2_k) / 256))
  const e1 = (1 - Math.sqrt(1 - e2_k)) / (1 + Math.sqrt(1 - e2_k))

  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * Math.pow(e1, 3)) / 32) * Math.sin(2 * mu) +
    ((21 * Math.pow(e1, 2)) / 16 - (55 * Math.pow(e1, 4)) / 32) * Math.sin(4 * mu) +
    ((151 * Math.pow(e1, 3)) / 96) * Math.sin(6 * mu) +
    ((1097 * Math.pow(e1, 4)) / 512) * Math.sin(8 * mu)

  const N1 = a_k / Math.sqrt(1 - e2_k * Math.sin(phi1) * Math.sin(phi1))
  const T1 = Math.tan(phi1) * Math.tan(phi1)
  const C1 = ePrime2_k * Math.cos(phi1) * Math.cos(phi1)
  const R1 = (a_k * (1 - e2_k)) / Math.pow(1 - e2_k * Math.sin(phi1) * Math.sin(phi1), 1.5)
  const D = y_gk / N1

  const latSk42Rad =
    phi1 -
    ((N1 * Math.tan(phi1)) / R1) *
      ((D * D) / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ePrime2_k) * Math.pow(D, 4)) / 24 +
        ((61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * ePrime2_k - 3 * C1 * C1) * Math.pow(D, 6)) /
          720)

  const lon0 = ((zone * 6 - 3) * Math.PI) / 180
  const lonSk42Rad =
    lon0 +
    (D -
      ((1 + 2 * T1 + C1) * Math.pow(D, 3)) / 6 +
      ((5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * ePrime2_k + 24 * T1 * T1) * Math.pow(D, 5)) /
        120) /
      Math.cos(phi1)

  const latSk42 = (latSk42Rad * 180) / Math.PI
  const lonSk42 = (lonSk42Rad * 180) / Math.PI

  // Молоденський СК-42 -> WGS84
  const da = 6378137.0 - 6378245.0
  const df = 1 / 298.257223563 - 1 / 298.3
  const dx = 23.57
  const dy = -140.95
  const dz = -79.8

  const sinLat = Math.sin(latSk42Rad)
  const cosLat = Math.cos(latSk42Rad)
  const sinLon = Math.sin(lonSk42Rad)
  const cosLon = Math.cos(lonSk42Rad)

  const W = Math.sqrt(1 - e2_k * sinLat * sinLat)
  const M_mol = (a_k * (1 - e2_k)) / Math.pow(W, 3)
  const N_mol = a_k / W

  const dLatSec =
    (-dx * sinLat * cosLon -
      dy * sinLat * sinLon +
      dz * cosLat +
      (a_k * df + f_k * da) * Math.sin(2 * latSk42Rad)) /
    (M_mol * Math.sin(((1 / 3600) * Math.PI) / 180))
  const dLonSec =
    (-dx * sinLon + dy * cosLon) / (N_mol * cosLat * Math.sin(((1 / 3600) * Math.PI) / 180))

  const latWgs84 = latSk42 + dLatSec / 3600
  const lonWgs84 = lonSk42 + dLonSec / 3600

  return { lat: latWgs84, lon: lonWgs84 }
}

/**
 * Форматування координат у градуси, мінути, секунди (DMS)
 */
export function formatDMS(lat: number, lon: number): string {
  const formatCoord = (val: number, isLon: boolean) => {
    const dir = isLon ? (val >= 0 ? 'E' : 'W') : val >= 0 ? 'N' : 'S'
    const absVal = Math.abs(val)
    const deg = Math.floor(absVal)
    const minFloat = (absVal - deg) * 60
    const min = Math.floor(minFloat)
    const sec = (minFloat - min) * 60
    return `${deg}°${min.toString().padStart(2, '0')}'${sec.toFixed(1).padStart(4, '0')}"${dir}`
  }
  return `${formatCoord(lat, false)} ${formatCoord(lon, true)}`
}

/**
 * Форматування координат у градуси, десяткові мінути (DDM)
 */
export function formatDDM(lat: number, lon: number): string {
  const formatCoord = (val: number, isLon: boolean) => {
    const dir = isLon ? (val >= 0 ? 'E' : 'W') : val >= 0 ? 'N' : 'S'
    const absVal = Math.abs(val)
    const deg = Math.floor(absVal)
    const min = (absVal - deg) * 60
    return `${deg}°${min.toFixed(3).padStart(6, '0')}'${dir}`
  }
  return `${formatCoord(lat, false)} ${formatCoord(lon, true)}`
}

/**
 * Генерація представлення точки у всіх географічних та військових системах
 */
export function formatAllCoordinates(lat: number, lon: number): FormattedCoordinatesAll {
  const mgrsInfo = formatMGRS(lat, lon)
  const utmInfo = latLonToUtm(lat, lon)
  const sk42Info = wgs84ToSk42(lat, lon)

  return {
    mgrs: mgrsInfo.formatted,
    mgrsRaw: mgrsInfo.raw,
    utm: utmInfo.text,
    sk42: sk42Info.text,
    dd: `${lat.toFixed(5)}°, ${lon.toFixed(5)}°`,
    dms: formatDMS(lat, lon),
    ddm: formatDDM(lat, lon),
  }
}

/**
 * Створення фінального об'єкта розпізнаних координат
 */
function formatResult(
  lat: number,
  lon: number,
  rawFormat: CoordinateFormat
): ParsedCoordinates {
  const roundedLat = parseFloat(lat.toFixed(6))
  const roundedLon = parseFloat(lon.toFixed(6))
  const allFormats = formatAllCoordinates(roundedLat, roundedLon)

  let formattedText = `${roundedLat.toFixed(5)}° N, ${roundedLon.toFixed(5)}° E`
  if (rawFormat === 'MGRS') {
    formattedText = allFormats.mgrs
  } else if (rawFormat === 'UTM') {
    formattedText = allFormats.utm
  } else if (rawFormat === 'SK42') {
    formattedText = allFormats.sk42
  } else if (rawFormat === 'DMS') {
    formattedText = allFormats.dms
  } else if (rawFormat === 'DDM') {
    formattedText = allFormats.ddm
  }

  return {
    lat: roundedLat,
    lon: roundedLon,
    rawFormat,
    formattedText,
    allFormats,
  }
}

// -------------------------------------------------------------
// ПАРСИНГ ОКРЕМИХ ФОРМАТІВ
// -------------------------------------------------------------

/**
 * Спроба парсингу MGRS рядка (наприклад: 36TXU5710001763 або 36TXU 57100 01763)
 */
export function tryParseMGRS(text: string): ParsedCoordinates | null {
  // Видаляємо пробіли, коми, дефіси, крапки
  const stripped = text.replace(/[\s,.-]+/g, '').toUpperCase()

  // MGRS формат: 1-2 цифри зони, літера широтної смуги (C-X крім I, O), 2 літери 100k квадрата (A-Z крім I, O),
  // і парна кількість цифр (0, 2, 4, 6, 8, 10)
  const mgrsRegex = /^([0-9]{1,2})([C-HJ-NP-X])([A-HJ-NP-Z]{2})([0-9]{2,10})?$/
  if (!mgrsRegex.test(stripped)) {
    return null
  }

  try {
    if (!mgrsToPoint) {
      return null
    }
    const point = mgrsToPoint(stripped) // returns [lon, lat]
    if (point && Array.isArray(point) && point.length === 2) {
      const lon = point[0]
      const lat = point[1]
      if (isValidRange(lat, lon)) {
        return formatResult(lat, lon, 'MGRS')
      }
    }
  } catch {
    // Не вдалося розпарсити через помилку в квадраті/зоні
  }

  return null
}

/**
 * Спроба парсингу UTM рядка (наприклад: 36T 657101 5301764 або UTM 36N 657101 5301764)
 */
export function tryParseUTM(text: string): ParsedCoordinates | null {
  // Паттерн UTM: (UTM | Zone) [1-60] [C-X або N/S] [easting: 5-7 цифр] [northing: 6-8 цифр]
  const utmRegex =
    /(?:UTM\s+|Zone\s+)?([0-9]{1,2})\s*([C-HJ-NP-XNnSs])\s+([0-9]{5,7}(?:\.[0-9]+)?)\s*(?:m?E)?\s+([0-9]{6,8}(?:\.[0-9]+)?)\s*(?:m?N)?/i
  const match = text.match(utmRegex)
  if (match) {
    const zone = parseInt(match[1], 10)
    const bandLetter = match[2].toUpperCase()
    const easting = parseFloat(match[3])
    const northing = parseFloat(match[4])

    if (zone >= 1 && zone <= 60 && easting >= 100000 && easting <= 900000) {
      // Визначаємо півкулю: якщо 'S' або літера південної півкулі (C-M)
      const isSouth = bandLetter === 'S' || ('CDEFGHJKLM'.includes(bandLetter) && bandLetter !== 'N')
      const hemisphere: 'N' | 'S' = isSouth ? 'S' : 'N'

      try {
        const { lat, lon } = utmToLatLon(zone, hemisphere, easting, northing)
        if (isValidRange(lat, lon)) {
          return formatResult(lat, lon, 'UTM')
        }
      } catch {
        // помилка перетворення
      }
    }
  }
  return null
}

/**
 * Спроба парсингу СК-42 Гауса-Крюгера (наприклад: X: 5303987 Y: 6657295 або 5303987 6657295)
 */
export function tryParseSK42(text: string): ParsedCoordinates | null {
  // 1. Явні мітки X та Y (латиницею чи кирилицею)
  const labeledRegex =
    /(?:X|Х)[:=\s]+([4-6][0-9]{6}(?:\.[0-9]+)?)[,\s]+(?:Y|У)[:=\s]+([4-8][0-9]{6}(?:\.[0-9]+)?)/i
  const labeledMatch = text.match(labeledRegex)
  if (labeledMatch) {
    const x = parseFloat(labeledMatch[1])
    const y = parseFloat(labeledMatch[2])
    const { lat, lon } = sk42ToWgs84(x, y)
    if (isValidRange(lat, lon)) {
      return formatResult(lat, lon, 'SK42')
    }
  }

  // Зворотній порядок: Y потім X
  const reversedRegex =
    /(?:Y|У)[:=\s]+([4-8][0-9]{6}(?:\.[0-9]+)?)[,\s]+(?:X|Х)[:=\s]+([4-6][0-9]{6}(?:\.[0-9]+)?)/i
  const reversedMatch = text.match(reversedRegex)
  if (reversedMatch) {
    const y = parseFloat(reversedMatch[1])
    const x = parseFloat(reversedMatch[2])
    const { lat, lon } = sk42ToWgs84(x, y)
    if (isValidRange(lat, lon)) {
      return formatResult(lat, lon, 'SK42')
    }
  }

  // 2. Дві 7-значні цифри без міток: перша X (~5 000 000..5 800 000), друга Y (зони 4-8 в Україні: ~4 000 000..8 900 000)
  const numbers = text.match(/\b([4-6][0-9]{6})\b[\s,;]+\b([4-8][0-9]{6})\b/)
  if (numbers) {
    const x = parseFloat(numbers[1])
    const y = parseFloat(numbers[2])
    const { lat, lon } = sk42ToWgs84(x, y)
    if (isValidRange(lat, lon)) {
      return formatResult(lat, lon, 'SK42')
    }
  }

  return null
}

/**
 * Парсинг одного географічного компонента (тільки широти або тільки довготи)
 */
export function parseSingleCoordinate(text: string, isLongitude = false): number | null {
  if (!text || typeof text !== 'string') return null
  const cleaned = cleanString(text)

  // Перевірка на напрямок
  const hasSouth = /([SЅ]|ПД|Ю)/i.test(cleaned)
  const hasWest = /([WШ]|ЗХ|З)/i.test(cleaned)
  const isNegative = cleaned.startsWith('-') || (isLongitude ? hasWest : hasSouth)

  // 1. Формат DMS: 47° 51' 04.4" або 47 51 04.4
  const dmsMatch = cleaned.match(
    /([+-]?\d+)[°\s]+(\d+(?:[.,]\d+)?)[′'\s]+(\d+(?:[.,]\d+)?)[″"]?/
  )
  if (dmsMatch) {
    const deg = Math.abs(parseFloat(dmsMatch[1].replace(',', '.')))
    const min = parseFloat(dmsMatch[2].replace(',', '.'))
    const sec = parseFloat(dmsMatch[3].replace(',', '.'))
    if (!isNaN(deg) && !isNaN(min) && !isNaN(sec)) {
      const val = deg + min / 60 + sec / 3600
      return isNegative ? -val : val
    }
  }

  // 2. Формат DDM: 47° 51.072' або 47 51.072
  const ddmMatch = cleaned.match(/([+-]?\d+)[°\s]+(\d+(?:[.,]\d+)?)[′']?/)
  if (ddmMatch && ddmMatch[2] !== undefined) {
    const deg = Math.abs(parseFloat(ddmMatch[1].replace(',', '.')))
    const min = parseFloat(ddmMatch[2].replace(',', '.'))
    if (!isNaN(deg) && !isNaN(min)) {
      const val = deg + min / 60
      return isNegative ? -val : val
    }
  }

  // 3. Формат DD (десяткові градуси): 47.8512 або 47,8512
  const ddMatch = cleaned.match(/([+-]?\d+[.,]\d+)|([+-]?\d+)/)
  if (ddMatch) {
    const val = Math.abs(parseFloat(ddMatch[0].replace(',', '.')))
    if (!isNaN(val)) {
      return isNegative ? -val : val
    }
  }

  return null
}

/**
 * Визначення формату традиційних градусних координат
 */
function detectDegreeFormat(text: string): 'DD' | 'DMS' | 'DDM' {
  if (/″|"/.test(text)) return 'DMS'
  if (/′|'/.test(text)) return 'DDM'
  return 'DD'
}

/**
 * Універсальний парсинг координат із рядка будь-якого формату
 */
export function parseCoordinatePair(rawInput: string): ParsedCoordinates | null {
  if (!rawInput || typeof rawInput !== 'string') return null

  const text = cleanString(rawInput)
  if (!text) return null

  // 1. MGRS (NATO Military Grid) — наприклад: 36TXU 57100 01763 або 36TXU5710001763
  const mgrsResult = tryParseMGRS(text)
  if (mgrsResult) return mgrsResult

  // 2. UTM — наприклад: 36T 657101 5301764 або UTM 36N 657101 5301764
  const utmResult = tryParseUTM(text)
  if (utmResult) return utmResult

  // 3. СК-42 (Гауса-Крюгера) — наприклад: X: 5303987 Y: 6657295
  const sk42Result = tryParseSK42(text)
  if (sk42Result) return sk42Result

  // 4. Посилання картографічних сервісів:
  // Google Maps: q=47.8512,35.1098 або @47.8512,35.1098 або place/47.8512,35.1098
  const gmapsMatch =
    text.match(/[?&]q=([+-]?\d+[.,]\d+)[,\s]+([+-]?\d+[.,]\d+)/i) ||
    text.match(/@([+-]?\d+[.,]\d+),([+-]?\d+[.,]\d+)/i) ||
    text.match(/place\/([+-]?\d+[.,]\d+)[,+]+([+-]?\d+[.,]\d+)/i)
  if (gmapsMatch) {
    const lat = parseFloat(gmapsMatch[1].replace(',', '.'))
    const lon = parseFloat(gmapsMatch[2].replace(',', '.'))
    if (isValidRange(lat, lon)) {
      return formatResult(lat, lon, 'GEO_URL')
    }
  }

  // OpenStreetMap: #map=16/47.8512/35.1098
  const osmMatch = text.match(/#map=\d+\/([+-]?\d+[.,]\d+)\/([+-]?\d+[.,]\d+)/i)
  if (osmMatch) {
    const lat = parseFloat(osmMatch[1].replace(',', '.'))
    const lon = parseFloat(osmMatch[2].replace(',', '.'))
    if (isValidRange(lat, lon)) {
      return formatResult(lat, lon, 'GEO_URL')
    }
  }

  // DeepStateMap: #14/47.8512/35.1098
  const deepStateMatch = text.match(/deepstatemap\.live\/.*?#\d+\/([+-]?\d+[.,]\d+)\/([+-]?\d+[.,]\d+)/i)
  if (deepStateMatch) {
    const lat = parseFloat(deepStateMatch[1].replace(',', '.'))
    const lon = parseFloat(deepStateMatch[2].replace(',', '.'))
    if (isValidRange(lat, lon)) {
      return formatResult(lat, lon, 'GEO_URL')
    }
  }

  // Geo URI: geo:47.8512,35.1098
  const geoUriMatch = text.match(/geo:([+-]?\d+[.,]\d+)[,\s]+([+-]?\d+[.,]\d+)/i)
  if (geoUriMatch) {
    const lat = parseFloat(geoUriMatch[1].replace(',', '.'))
    const lon = parseFloat(geoUriMatch[2].replace(',', '.'))
    if (isValidRange(lat, lon)) {
      return formatResult(lat, lon, 'GEO_URL')
    }
  }

  // 5. Явні мітки широти/довготи: lat: 47.85, lon: 35.10 або Ш: 47.85, Д: 35.10
  const labeledMatch = text.match(
    /(?:lat|широта|ш)[:\s=]+([^\s,;]+)[,\s;]+(?:lon|lng|довгота|д)[:\s=]+([^\s,;]+)/i
  )
  if (labeledMatch) {
    const lat = parseSingleCoordinate(labeledMatch[1], false)
    const lon = parseSingleCoordinate(labeledMatch[2], true)
    if (lat !== null && lon !== null && isValidRange(lat, lon)) {
      return formatResult(lat, lon, detectDegreeFormat(text))
    }
  }

  // Зворотні мітки: Д: 35.10, Ш: 47.85
  const revLabeledMatch = text.match(
    /(?:lon|lng|довгота|д)[:\s=]+([^\s,;]+)[,\s;]+(?:lat|широта|ш)[:\s=]+([^\s,;]+)/i
  )
  if (revLabeledMatch) {
    const lon = parseSingleCoordinate(revLabeledMatch[1], true)
    const lat = parseSingleCoordinate(revLabeledMatch[2], false)
    if (lat !== null && lon !== null && isValidRange(lat, lon)) {
      return formatResult(lat, lon, detectDegreeFormat(text))
    }
  }

  // 6. Розділення символами розділення: ; / \n |
  const separators = [';', '\n', '/', '|']
  for (const sep of separators) {
    if (text.includes(sep)) {
      const parts = text.split(sep).map((p) => p.trim()).filter(Boolean)
      if (parts.length === 2) {
        const lat = parseSingleCoordinate(parts[0], false)
        const lon = parseSingleCoordinate(parts[1], true)
        if (lat !== null && lon !== null && isValidRange(lat, lon)) {
          return formatResult(lat, lon, detectDegreeFormat(text))
        }
      }
    }
  }

  // 7. Розділення за сторонами світу (наприклад: 47°51'04"N 35°06'35"E або 47°51'04"Пн 35°06'35"Сх)
  const dirMatch = text.match(/^(.+?[NSNSEWWEПнпнПДпдСХсхЗХзхСсЮюВвЗз])\s+(.+)$/i)
  if (dirMatch) {
    const isFirstLon = /([WE]|СХ|ЗХ|В|З)/i.test(dirMatch[1])
    const coord1 = parseSingleCoordinate(dirMatch[1], isFirstLon)
    const coord2 = parseSingleCoordinate(dirMatch[2], !isFirstLon)
    if (coord1 !== null && coord2 !== null) {
      const lat = isFirstLon ? coord2 : coord1
      const lon = isFirstLon ? coord1 : coord2
      if (isValidRange(lat, lon)) {
        return formatResult(lat, lon, detectDegreeFormat(text))
      }
    }
  }

  // 8. Розділення комою (наприклад: 47.8512, 35.1098 або 47,8512, 35,1098)
  if (text.includes(',')) {
    const commaParts = text.split(',')
    if (commaParts.length === 2) {
      const lat = parseSingleCoordinate(commaParts[0], false)
      const lon = parseSingleCoordinate(commaParts[1], true)
      if (lat !== null && lon !== null && isValidRange(lat, lon)) {
        return formatResult(lat, lon, detectDegreeFormat(text))
      }
    } else if (commaParts.length === 4) {
      // 47,8512, 35,1098
      const part1 = `${commaParts[0]}.${commaParts[1]}`
      const part2 = `${commaParts[2]}.${commaParts[3]}`
      const lat = parseSingleCoordinate(part1, false)
      const lon = parseSingleCoordinate(part2, true)
      if (lat !== null && lon !== null && isValidRange(lat, lon)) {
        return formatResult(lat, lon, 'DD')
      }
    }
  }

  // 9. Розбір послідовностей чисел
  const numbers = text.match(/[+-]?\d+(?:[.,]\d+)?/g)
  if (numbers) {
    // 2 числа: 47.8512 35.1098
    if (numbers.length === 2) {
      const lat = parseFloat(numbers[0].replace(',', '.'))
      const lon = parseFloat(numbers[1].replace(',', '.'))
      if (isValidRange(lat, lon)) {
        return formatResult(lat, lon, 'DD')
      }
    }

    // 4 числа: 47 51.072 35 06.588 (DDM)
    if (numbers.length === 4) {
      const latDeg = parseFloat(numbers[0].replace(',', '.'))
      const latMin = parseFloat(numbers[1].replace(',', '.'))
      const lonDeg = parseFloat(numbers[2].replace(',', '.'))
      const lonMin = parseFloat(numbers[3].replace(',', '.'))
      const lat = latDeg + latMin / 60
      const lon = lonDeg + lonMin / 60
      if (isValidRange(lat, lon)) {
        return formatResult(lat, lon, 'DDM')
      }
    }

    // 6 чисел: 47 51 04 35 06 35 (DMS)
    if (numbers.length === 6) {
      const latDeg = parseFloat(numbers[0].replace(',', '.'))
      const latMin = parseFloat(numbers[1].replace(',', '.'))
      const latSec = parseFloat(numbers[2].replace(',', '.'))
      const lonDeg = parseFloat(numbers[3].replace(',', '.'))
      const lonMin = parseFloat(numbers[4].replace(',', '.'))
      const lonSec = parseFloat(numbers[5].replace(',', '.'))
      const lat = latDeg + latMin / 60 + latSec / 3600
      const lon = lonDeg + lonMin / 60 + lonSec / 3600
      if (isValidRange(lat, lon)) {
        return formatResult(lat, lon, 'DMS')
      }
    }
  }

  // 10. Вилучення координат із довільного тексту повідомлення (наприклад: "Ціль: 36TXU 57100 01763 висота 120")
  // Спроба знайти MGRS у тексті:
  const mgrsInText = text.match(/\b([0-9]{1,2}\s*[C-HJ-NP-X]\s*[A-HJ-NP-Z]{2}\s*(?:[0-9]{2,5}\s*[0-9]{2,5})?)\b/i)
  if (mgrsInText) {
    const res = tryParseMGRS(mgrsInText[1])
    if (res) return res
  }

  // Спроба знайти пару десяткових чисел у тексті:
  const ddInText = text.match(/([+-]?\d{1,2}[.,]\d{2,8})[,\s]+([+-]?\d{1,3}[.,]\d{2,8})/)
  if (ddInText) {
    const lat = parseFloat(ddInText[1].replace(',', '.'))
    const lon = parseFloat(ddInText[2].replace(',', '.'))
    if (isValidRange(lat, lon)) {
      return formatResult(lat, lon, 'DD')
    }
  }

  return null
}
