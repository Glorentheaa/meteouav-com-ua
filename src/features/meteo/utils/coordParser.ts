/**
 * Універсальний парсер координат для широкого спектра форматів:
 * - Десяткові градуси (DD): 47.8512, 35.1098 / 47,8512 35,1098 / 47.8512N 35.1098E
 * - Градуси, мінути, секунди (DMS): 47°51'04.4"N 35°06'35.6"E / 47 51 04 N, 35 06 35 E
 * - Градуси, десяткові мінути (DDM): 47°51.072'N 35°06.588'E / 47 51.072 N 35 06.588 E
 * - Кириличні позначення: 47°51'04"Пн 35°06'35"Сх / 47.8512 пн.ш., 35.1098 сх.д.
 * - Посилання Google Maps: https://maps.google.com/?q=47.8512,35.1098
 * - Введення як єдиним рядком, так і в окремі поля
 */

export interface ParsedCoordinates {
  lat: number
  lon: number
  rawFormat: 'DD' | 'DMS' | 'DDM' | 'UNKNOWN'
  formattedText: string
}

/**
 * Нормалізація символів (лапки, мінути, градуси, коми)
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
 * Перевірка валідності діапазону широти і довготи
 */
function isValidRange(lat: number, lon: number): boolean {
  return (
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180 &&
    (lat !== 0 || lon !== 0) // виключаємо 0,0 за замовчуванням
  )
}

/**
 * Визначення формату
 */
function detectFormat(text: string): 'DD' | 'DMS' | 'DDM' {
  if (/″|"/.test(text)) return 'DMS'
  if (/′|'/.test(text)) return 'DDM'
  return 'DD'
}

/**
 * Форматування результату
 */
function formatResult(
  lat: number,
  lon: number,
  rawFormat: 'DD' | 'DMS' | 'DDM'
): ParsedCoordinates {
  const roundedLat = parseFloat(lat.toFixed(6))
  const roundedLon = parseFloat(lon.toFixed(6))

  const formattedText = `${roundedLat.toFixed(5)}° N, ${roundedLon.toFixed(5)}° E`

  return {
    lat: roundedLat,
    lon: roundedLon,
    rawFormat,
    formattedText,
  }
}

/**
 * Парсинг одного компонента (тільки широти або тільки довготи)
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
 * Універсальний парсинг пари координат із рядка довільного формату
 */
export function parseCoordinatePair(rawInput: string): ParsedCoordinates | null {
  if (!rawInput || typeof rawInput !== 'string') return null

  const text = cleanString(rawInput)

  // 1. URL Google Maps або схожий: q=47.8512,35.1098
  const urlMatch = text.match(/q=([+-]?\d+[.,]\d+)[,\s]+([+-]?\d+[.,]\d+)/i)
  if (urlMatch) {
    const lat = parseFloat(urlMatch[1].replace(',', '.'))
    const lon = parseFloat(urlMatch[2].replace(',', '.'))
    if (isValidRange(lat, lon)) {
      return formatResult(lat, lon, 'DD')
    }
  }

  // 2. Явні мітки широти/довготи: lat: 47.85, lon: 35.10 або Ш: 47.85, Д: 35.10
  const labeledMatch = text.match(
    /(?:lat|широта|ш)[:\s=]+([^\s,;]+)[,\s;]+(?:lon|lng|довгота|д)[:\s=]+([^\s,;]+)/i
  )
  if (labeledMatch) {
    const lat = parseSingleCoordinate(labeledMatch[1], false)
    const lon = parseSingleCoordinate(labeledMatch[2], true)
    if (lat !== null && lon !== null && isValidRange(lat, lon)) {
      return formatResult(lat, lon, detectFormat(text))
    }
  }

  // 3. Розділення чіткими роздільниками: ; / \n |
  const separators = [';', '\n', '/', '|']
  for (const sep of separators) {
    if (text.includes(sep)) {
      const parts = text.split(sep).map((p) => p.trim()).filter(Boolean)
      if (parts.length === 2) {
        const lat = parseSingleCoordinate(parts[0], false)
        const lon = parseSingleCoordinate(parts[1], true)
        if (lat !== null && lon !== null && isValidRange(lat, lon)) {
          return formatResult(lat, lon, detectFormat(text))
        }
      }
    }
  }

  // 4. Розділення за напрямками (наприклад: 47°51'04"N 35°06'35"E або 47°51'04"Пн 35°06'35"Сх)
  const dirMatch = text.match(/^(.+?[NSNSEWWEПнпнПДпдСХсхЗХзхСсЮюВвЗз])\s+(.+)$/i)
  if (dirMatch) {
    const isFirstLon = /([WE]|СХ|ЗХ|В|З)/i.test(dirMatch[1])
    const coord1 = parseSingleCoordinate(dirMatch[1], isFirstLon)
    const coord2 = parseSingleCoordinate(dirMatch[2], !isFirstLon)
    if (coord1 !== null && coord2 !== null) {
      const lat = isFirstLon ? coord2 : coord1
      const lon = isFirstLon ? coord1 : coord2
      if (isValidRange(lat, lon)) {
        return formatResult(lat, lon, detectFormat(text))
      }
    }
  }

  // 5. Розділення комою
  if (text.includes(',')) {
    const commaParts = text.split(',')
    if (commaParts.length === 2) {
      const lat = parseSingleCoordinate(commaParts[0], false)
      const lon = parseSingleCoordinate(commaParts[1], true)
      if (lat !== null && lon !== null && isValidRange(lat, lon)) {
        return formatResult(lat, lon, detectFormat(text))
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

  // 6. Розбір послідовностей чисел
  const numbers = text.match(/[+-]?\d+(?:[.,]\d+)?/g)
  if (numbers) {
    // 2 числа: 47.8512 35.1098 або 47,8512 35,1098
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

  return null
}
