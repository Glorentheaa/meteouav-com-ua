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
    const temp = Number((14 + dailyTempWave * 7 + (Math.random() * 1.2 - 0.6)).toFixed(1))

    // Симуляція реалістичного добового та фронтального циклу:
    // Повний спектр попереджень (ideal, favorable, attention, warning, danger)
    let surfaceWind: number
    let surfaceGusts: number
    let precipMm = 0.0
    let fogRisk: 'none' | 'low' | 'high' = 'none'
    let visibilityKm = 10.0
    let cloudBaseM = 1200
    let cloudCoverPct = 20
    let kpIndex = 2

    if (hour >= 17 && hour < 19) {
      // 17:00 - 19:00: Фронтальний шквал (DANGER - червоний)
      surfaceWind = 11.2
      surfaceGusts = 16.8
      precipMm = 0.8
      cloudBaseM = 220
      cloudCoverPct = 95
      kpIndex = 3
    } else if (hour >= 15 && hour < 17) {
      // 15:00 - 17:00: Наближення фронту / піковий денний вітер (WARNING - помаранчевий)
      surfaceWind = 8.8
      surfaceGusts = 13.2
      cloudBaseM = 380
      cloudCoverPct = 75
      kpIndex = 3
    } else if ((hour >= 13 && hour < 15) || (hour >= 19 && hour < 21)) {
      // 13:00 - 15:00 та 19:00 - 21:00: Помірний вітер (ATTENTION - жовтий)
      surfaceWind = 7.0
      surfaceGusts = 10.5
      cloudBaseM = 650
      cloudCoverPct = 50
      kpIndex = 4
    } else if (hour >= 5 && hour < 6) {
      // 05:00 - 06:00: Густий ранковий туман (DANGER - червоний)
      surfaceWind = 2.2
      surfaceGusts = 3.0
      fogRisk = 'high'
      visibilityKm = 1.6
      cloudBaseM = 150
      cloudCoverPct = 90
    } else if (hour >= 4 && hour < 5) {
      // 04:00 - 05:00: Початок туману (WARNING - помаранчевий)
      surfaceWind = 2.4
      surfaceGusts = 3.2
      fogRisk = 'high'
      visibilityKm = 2.4
      cloudBaseM = 280
      cloudCoverPct = 80
    } else if (hour >= 6 && hour < 7) {
      // 06:00 - 07:00: Розсіювання туману (ATTENTION - жовтий)
      surfaceWind = 2.6
      surfaceGusts = 3.5
      fogRisk = 'low'
      visibilityKm = 3.2
      cloudBaseM = 450
      cloudCoverPct = 60
    } else if (hour >= 7 && hour < 11) {
      // 07:00 - 11:00: Ідеальний ясний ранок (IDEAL - зелений)
      surfaceWind = 2.5
      surfaceGusts = 3.4
      visibilityKm = 10.0
      cloudBaseM = 1400
      cloudCoverPct = 15
      kpIndex = 1
    } else if (hour >= 21 && hour < 24) {
      // 21:00 - 24:00: Спокійний вечір (IDEAL - зелений)
      surfaceWind = 2.8
      surfaceGusts = 3.8
      visibilityKm = 10.0
      cloudBaseM = 1200
      cloudCoverPct = 20
      kpIndex = 1
    } else {
      // 00:00 - 04:00 та 11:00 - 13:00: Сприятливі умови (FAVORABLE - темно-зелений)
      surfaceWind = 4.5
      surfaceGusts = 6.2
      visibilityKm = 9.0
      cloudBaseM = 950
      cloudCoverPct = 35
      kpIndex = 2
    }

    // Напрямок руху вітру (плавний поворот по осі часу)
    const currentWindDirection = Math.round((45 + i * 25) % 360)

    const hasRain = precipMm > 0.1
    const humidity = hasRain
      ? Math.min(98, Math.floor(84 + Math.random() * 12))
      : Math.floor(55 - dailyTempWave * 20 + Math.random() * 8)

    // Розрахунок вітру по всіх 12 ешелонах
    // Вітер логарифмічно/степенево зростає з висотою
    const levelsRecord = {} as Record<AltitudeLevel, AltitudeWindData>

    const altitudeLevels: AltitudeLevel[] = [
      10, 50, 80, 120, 200, 300, 500, 800, 1000, 1500, 2000, 3000,
    ]

    for (const alt of altitudeLevels) {
      // Коефіцієнт зростання вітру з висотою
      const heightFactor = 1 + Math.log10(alt / 10 + 1) * 0.85
      const altWindSpeed = Number((surfaceWind * heightFactor + (Math.random() * 0.8 - 0.4)).toFixed(1))
      // Правий поворот вітру з висотою (спіраль Екмана: за годинниковою стрілкою на 10-30°)
      const altDirection = Math.round((baseDirection + (alt / 3000) * 35) % 360)

      const levelData: AltitudeWindData = {
        speed: altWindSpeed,
        directionDeg: altDirection,
        cloudCoverPct: alt >= cloudBaseM ? Math.min(100, Math.floor(70 + Math.random() * 30)) : 0,
      }

      // Пориви рахуються лише для малих і середніх ешелонів (до 500м включно)
      if (alt <= 500) {
        levelData.gusts = Number((altWindSpeed * (1.25 + Math.random() * 0.25)).toFixed(1))
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
