import type {
  FullMeteoForecastResponse,
  HourlyForecastPoint,
  AltitudeLevel,
  AltitudeWindData,
} from '../types/meteoData'

/**
 * Генератор реалістичного прогнозу погоди для тактичного планування БПЛА
 */
export function generateMockForecast(
  sectorId: string = '36U_YA',
  locationName: string = 'Сектор 36U_YA'
): FullMeteoForecastResponse {
  const now = new Date()
  const hourly: HourlyForecastPoint[] = []

  // Базовий напрямок вітру (наприклад, західний 250°)
  let baseDirection = 240 + Math.floor(Math.random() * 40 - 20)


  for (let i = 0; i < 48; i++) {
    const pointDate = new Date(now.getTime() + i * 3600 * 1000)
    const hour = pointDate.getHours()
    const timeStr = `${hour.toString().padStart(2, '0')}:00`
    const dateStr = pointDate.toISOString().split('T')[0]

    // Добовий хід температури (мінімум о 05:00, максимум о 15:00)
    const dailyTempWave = Math.sin(((hour - 9) / 24) * 2 * Math.PI)
    const temp = Number((18 + dailyTempWave * 6 + (Math.random() * 0.8 - 0.4)).toFixed(1))

    // Демонстраційний добовий цикл з повною шкалою попереджень:
    // ideal (зелений), favorable (темно-зелений), attention (жовтий), warning (помаранчевий), danger (червоний)
    let surfaceWind: number
    let surfaceGusts: number
    let targetMaxAltWind: number
    let targetMaxAltGust: number
    let precipMm = 0.0
    let fogRisk: 'none' | 'low' | 'high' = 'none'
    let visibilityKm = 10.0
    let cloudBaseM = 1800
    let cloudCoverPct = 20
    let kpIndex = 2

    if ((hour >= 7 && hour < 9) || (hour >= 19 && hour < 21)) {
      // 07:00-09:00 та 19:00-21:00: Небезпечні умови (DANGER - червоний)
      surfaceWind = 10.8
      surfaceGusts = 15.5
      targetMaxAltWind = 14.5
      targetMaxAltGust = 17.2
      precipMm = 0.5
      cloudBaseM = 650
      cloudCoverPct = 90
      visibilityKm = 5.5
      kpIndex = 4
    } else if ((hour >= 5 && hour < 7) || (hour >= 17 && hour < 19)) {
      // 05:00-07:00 та 17:00-19:00: Наближення до лімітів (WARNING - помаранчевий)
      surfaceWind = 7.6
      surfaceGusts = 11.6
      targetMaxAltWind = 10.8
      targetMaxAltGust = 12.2
      cloudBaseM = 1350
      cloudCoverPct = 70
      visibilityKm = 7.5
      kpIndex = 3
    } else if ((hour >= 3 && hour < 5) || (hour >= 15 && hour < 17)) {
      // 03:00-05:00 та 15:00-17:00: Звернути увагу на пориви (ATTENTION - жовтий)
      surfaceWind = 5.2
      surfaceGusts = 9.2
      targetMaxAltWind = 8.5
      targetMaxAltGust = 9.8
      cloudBaseM = 1500
      cloudCoverPct = 50
      visibilityKm = 8.5
      kpIndex = 3
    } else if ((hour >= 9 && hour < 12) || (hour >= 21 && hour < 24)) {
      // 09:00-12:00 та 21:00-24:00: Ідеальні умови (IDEAL - яскраво-зелений)
      surfaceWind = 1.8
      surfaceGusts = 2.5
      targetMaxAltWind = 3.5
      targetMaxAltGust = 4.0
      cloudBaseM = 2200
      cloudCoverPct = 15
      visibilityKm = 10.0
      kpIndex = 1
    } else {
      // 00:00-03:00 та 12:00-15:00: Сприятливі умови (FAVORABLE - темно-зелений)
      surfaceWind = 3.2
      surfaceGusts = 4.6
      targetMaxAltWind = 6.0
      targetMaxAltGust = 7.4
      cloudBaseM = 1800
      cloudCoverPct = 30
      visibilityKm = 10.0
      kpIndex = 2
    }

    // Напрямок руху вітру
    const currentWindDirection = Math.round((45 + i * 25) % 360)

    const hasRain = precipMm > 0.1
    const humidity = hasRain
      ? Math.min(95, Math.floor(82 + Math.random() * 8))
      : Math.floor(58 - dailyTempWave * 15 + Math.random() * 5)

    // Розрахунок вітру по всіх 12 ешелонах від 10м до 3000м
    const levelsRecord = {} as Record<AltitudeLevel, AltitudeWindData>
    const altitudeLevels: AltitudeLevel[] = [
      10, 50, 80, 120, 200, 300, 500, 800, 1000, 1500, 2000, 3000,
    ]

    for (const alt of altitudeLevels) {
      // Плавне зростання вітру від приземного до targetMaxAltWind на висоті 800м
      const ratio = Math.min(1.0, Math.log10(alt / 10 + 1) / Math.log10(800 / 10 + 1))
      const baseAltSpeed = surfaceWind + (targetMaxAltWind - surfaceWind) * ratio
      const highAltExtra = alt > 800 ? (alt - 800) * 0.0015 * targetMaxAltWind : 0
      const altWindSpeed = Number((baseAltSpeed + highAltExtra).toFixed(1))

      const altDirection = Math.round((baseDirection + (alt / 3000) * 35) % 360)

      const levelData: AltitudeWindData = {
        speed: altWindSpeed,
        directionDeg: altDirection,
        cloudCoverPct: alt >= cloudBaseM ? Math.min(100, Math.floor(70 + Math.random() * 30)) : 0,
      }

      // Пориви на малих і середніх висотах (до 500м)
      if (alt <= 500) {
        const gustRatio = Math.min(1.0, alt / 500)
        levelData.gusts = Number(
          (surfaceGusts + (targetMaxAltGust - surfaceGusts) * gustRatio).toFixed(1)
        )
      }

      levelsRecord[alt] = levelData
    }

    hourly.push({
      time: timeStr,
      fullDate: dateStr,
      timestamp: Math.floor(pointDate.getTime() / 1000),
      temp,
      surfaceWind,
      surfaceGusts,
      windDirectionDeg: currentWindDirection,
      precipMm,
      humidity,
      visibilityKm,
      fogRisk,
      cloudBaseM,
      cloudCoverPct,
      kpIndex,
      levels: levelsRecord,
    })
  }

  return {
    version: '1.0',
    updatedAt: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
    sectorId,
    locationName,
    hourly,
    aiSummary: {
      status: 'warning',
      title: 'Умови польотів помірно складні (є обмеження)',
      brief:
        'Сприятливі вікна для легких БПЛА очікуються в першій половині доби. Після 14:00 посилення вітру на ешелонах 200–500м до 14–17 м/с та локальні опади. Геомагнітна обстановка ускладнена (КР=5).',
      recommendations: [
        'Для БПЛА коптерного типу робочі висоти обмежити до 150м через пориви до 13 м/с.',
        'Після 14:00 можливий дрейф координат GPS/RTK через підвищений КР-індекс (5 балів). Забезпечити резервні методи навігації.',
        'Нижня кромка хмар 600–850м, у разі опадів зниження до 400м — ризик втрати оптичної видимості.',
      ],
    },
    weeklyChartUrl: undefined, // Може бути URL або рендериться SVG-метеограма
    astronomy: {
      sun: {
        sunrise: '05:46',
        sunset: '19:24',
        daylightDuration: '13 год 38 хв',
        civilTwilightStart: '05:14',
        civilTwilightEnd: '19:56',
      },
      moon: {
        moonrise: '20:48',
        moonset: '07:12',
        phaseName: 'Перша чверть',
        illuminationPct: 54,
      },
    },
  }
}
