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

    // Вітровий цикл з реалістичними поривами та фронтальними зонами
    // Створимо хвилю проходження атмосферного фронту (наприклад, з 13-ї по 20-ту годину та через добу)
    const isFrontZone = (i >= 12 && i <= 18) || (i >= 34 && i <= 39)
    const isMarginalZone = (i >= 9 && i <= 11) || (i >= 19 && i <= 22)

    let surfaceWind: number
    let surfaceGusts: number
    let precipMm = 0.0

    if (isFrontZone) {
      // Фронт: посилений вітер і пориви до критичних/небезпечних
      surfaceWind = Number((9.5 + Math.sin((i - 12) / 6 * Math.PI) * 2.8 + (Math.random() * 1.0 - 0.5)).toFixed(1))
      surfaceGusts = Number((surfaceWind * (1.4 + Math.random() * 0.25)).toFixed(1))
      precipMm = Number((0.6 + Math.random() * 1.4).toFixed(1))
    } else if (isMarginalZone) {
      // Наближення фронту: помітний вітер (зона уваги / жовтий-помаранчевий)
      surfaceWind = Number((7.2 + Math.random() * 1.8).toFixed(1))
      surfaceGusts = Number((surfaceWind * (1.3 + Math.random() * 0.2)).toFixed(1))
      precipMm = Math.random() > 0.6 ? 0.3 : 0.0
    } else {
      // Сприятливі/ідеальні умови (ранок, спокійна погода)
      const dayWindFactor = 1 + Math.max(0, Math.sin(((hour - 6) / 18) * Math.PI)) * 0.3
      surfaceWind = Number((3.5 * dayWindFactor + (Math.random() * 1.4 - 0.7)).toFixed(1))
      surfaceGusts = Number((surfaceWind * (1.25 + Math.random() * 0.15)).toFixed(1))
      precipMm = 0.0
    }

    // Напрямок руху вітру (плавний поворот по всій осі часу для наочної перевірки індикатора)
    const currentWindDirection = Math.round((45 + i * 25) % 360)

    const hasRain = precipMm > 0.1

    // Вологість (вища вночі та під час дощу)
    const humidity = hasRain
      ? Math.min(98, Math.floor(84 + Math.random() * 12))
      : Math.floor(55 - dailyTempWave * 20 + Math.random() * 8)

    // Туман та видимість
    const isEarlyMorning = hour >= 4 && hour <= 7
    const fogRisk = isEarlyMorning && humidity > 85 ? (humidity > 92 ? 'high' : 'low') : 'none'
    const visibilityKm = fogRisk === 'high' ? 1.8 : fogRisk === 'low' ? 4.5 : Number((9.5 + Math.random() * 3).toFixed(1))

    // Висота кромки хмар (м)
    const cloudBaseM = isFrontZone
      ? Math.floor(350 + Math.random() * 200)
      : isMarginalZone
      ? Math.floor(650 + Math.random() * 250)
      : Math.floor(950 + Math.random() * 550)

    // Загальна хмарність (%)
    let cloudCoverPct = 25
    if (isFrontZone) {
      cloudCoverPct = Math.min(100, Math.floor(88 + Math.random() * 12))
    } else if (fogRisk !== 'none' || isMarginalZone) {
      cloudCoverPct = Math.min(100, Math.floor(65 + Math.random() * 25))
    } else if (cloudBaseM < 800) {
      cloudCoverPct = Math.floor(50 + Math.random() * 20)
    } else {
      cloudCoverPct = Math.floor(10 + Math.random() * 30)
    }

    // КР-індекс геомагнітної активності (0..9)
    let kpIndex = 2
    if (i >= 14 && i <= 17) {
      kpIndex = 5 // Геомагнітне збурення
    } else if (i >= 11 && i <= 20) {
      kpIndex = 4
    } else {
      kpIndex = Math.floor(1 + Math.random() * 2)
    }

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
