import type { MeteoWarnings, WarningKey } from '../types/meteo'
import type {
  HourlyForecastPoint,
  WarningSeverity,
  HourEvaluation,
  FogRisk,
} from '../types/meteoData'

/**
 * Перевірка чи активовано параметр попередження користувачем
 */
export function isWarningEnabled(warnings: MeteoWarnings, key: WarningKey): boolean {
  if (!warnings.enabled) return true
  return warnings.enabled[key] !== false
}

/**
 * Оцінка швидкості вітру відносно ліміту (5 градацій)
 */
export function evaluateWind(speed: number, limit: number): WarningSeverity {
  if (speed > limit) return 'danger'
  if (speed >= limit * 0.85) return 'warning'
  if (speed >= limit * 0.65) return 'attention'
  if (speed >= limit * 0.35) return 'favorable'
  return 'ideal'
}

/**
 * Оцінка поривів вітру (5 градацій)
 */
export function evaluateGusts(gusts: number, limit: number): WarningSeverity {
  if (gusts > limit) return 'danger'
  if (gusts >= limit * 0.85) return 'warning'
  if (gusts >= limit * 0.65) return 'attention'
  if (gusts >= limit * 0.35) return 'favorable'
  return 'ideal'
}

/**
 * Оцінка температури (5 градацій)
 */
export function evaluateTemp(temp: number, minTemp: number, maxTemp: number): WarningSeverity {
  if (temp < minTemp || temp > maxTemp) return 'danger'
  if (temp <= minTemp + 2 || temp >= maxTemp - 2) return 'warning'
  if (temp <= minTemp + 5 || temp >= maxTemp - 5) return 'attention'
  if (temp >= 15 && temp <= 25) return 'ideal'
  return 'favorable'
}

/**
 * Оцінка опадів (5 градацій)
 */
export function evaluatePrecip(precipMm: number, setting: string): WarningSeverity {
  if (setting === 'вимкнути') return 'ideal'
  if (setting === '>0.1 мм' && precipMm > 0.1) return 'danger'
  if (setting === '>0.3 мм' && precipMm > 0.3) return 'danger'
  if (precipMm >= 0.1) return 'warning'
  if (precipMm > 0) return 'attention'
  return 'ideal'
}

/**
 * Оцінка туману та видимості (5 градацій)
 */
export function evaluateFog(
  fogRisk: FogRisk,
  visibilityKm: number,
  fogSetting: string,
  minVisibilityKm: number
): WarningSeverity {
  if (visibilityKm < minVisibilityKm) return 'danger'
  if (fogSetting === 'висока вірогідність' && fogRisk === 'high') return 'danger'
  if (fogSetting === 'мала вірогідність' && (fogRisk === 'high' || fogRisk === 'low')) return 'danger'
  if (visibilityKm <= minVisibilityKm * 1.25 || fogRisk === 'high') return 'warning'
  if (visibilityKm <= minVisibilityKm * 1.6 || fogRisk === 'low') return 'attention'
  if (visibilityKm < 10) return 'favorable'
  return 'ideal'
}

/**
 * Оцінка вологості (5 градацій)
 */
export function evaluateHumidity(humidity: number, limit: number): WarningSeverity {
  if (humidity > limit) return 'danger'
  if (humidity >= limit * 0.95) return 'warning'
  if (humidity >= limit * 0.85) return 'attention'
  if (humidity >= 70) return 'favorable'
  return 'ideal'
}

/**
 * Оцінка геомагнітної активності (КР-індекс 0..9)
 * Згідно з правилами MeteoUAV: КР-індекс не є в найвищому пріоритеті і не блокує в червоний (danger).
 */
export function evaluateKpIndex(kp: number, limit: number = 5): WarningSeverity {
  if (kp >= limit) return 'warning'
  if (kp >= Math.max(1, limit - 1)) return 'attention'
  if (kp >= 2) return 'favorable'
  return 'ideal'
}

/**
 * Оцінка кромки хмар відносно робочого ешелону польоту або ліміту (5 градацій)
 */
export function evaluateCloudBase(cloudBaseM: number, limitM: number = 300): WarningSeverity {
  if (cloudBaseM <= limitM) return 'danger' // БПЛА всередині хмари або нижче безпечного ліміту
  if (cloudBaseM <= limitM + 100) return 'warning'
  if (cloudBaseM <= limitM + 250) return 'attention'
  if (cloudBaseM <= limitM + 500) return 'favorable'
  return 'ideal'
}

const SEVERITY_RANK: Record<WarningSeverity, number> = {
  ideal: 0,
  safe: 0,
  favorable: 1,
  attention: 2,
  warning: 3,
  danger: 4,
}

/**
 * Комплексна інтегральна оцінка безпеки конкретної години (5 градацій)
 * Враховує ввімкнені/вимкнені галочками параметри користувача
 */
export function evaluateHour(
  point: HourlyForecastPoint,
  warnings: MeteoWarnings,
  maxFlightLevelM: number = 300
): HourEvaluation {
  const issues: string[] = []
  let severity: WarningSeverity = 'ideal'

  const elevate = (sev: WarningSeverity, reason?: string) => {
    if (SEVERITY_RANK[sev] > SEVERITY_RANK[severity]) {
      severity = sev
    }
    if (reason && SEVERITY_RANK[sev] >= SEVERITY_RANK.attention) {
      issues.push(reason)
    }
  }

  // 1. Вітер на поверхні (якщо увімкнено)
  if (isWarningEnabled(warnings, 'wind')) {
    const windSev = evaluateWind(point.surfaceWind, warnings.wind)
    elevate(windSev, `Вітер ${point.surfaceWind.toFixed(1)} м/с (ліміт ${warnings.wind})`)
  }

  // 2. Пориви на поверхні (якщо увімкнено)
  if (isWarningEnabled(warnings, 'gusts')) {
    const gustSev = evaluateGusts(point.surfaceGusts, warnings.gusts)
    elevate(gustSev, `Пориви ${point.surfaceGusts.toFixed(1)} м/с (ліміт ${warnings.gusts})`)
  }

  // 3. Вітер та пориви по ешелонах до maxFlightLevelM (якщо увімкнено відповідні галочки)
  const windActive = isWarningEnabled(warnings, 'wind')
  const gustsActive = isWarningEnabled(warnings, 'gusts')
  if (windActive || gustsActive) {
    for (const [lvlStr, lvlData] of Object.entries(point.levels)) {
      const lvlNum = parseInt(lvlStr, 10)
      if (lvlNum <= maxFlightLevelM) {
        if (windActive) {
          const lvlWindSev = evaluateWind(lvlData.speed, warnings.wind)
          elevate(lvlWindSev, `Вітер ${lvlData.speed.toFixed(1)} м/с на ${lvlNum}м`)
        }

        if (gustsActive && lvlData.gusts !== undefined) {
          const lvlGustSev = evaluateGusts(lvlData.gusts, warnings.gusts)
          elevate(lvlGustSev, `Пориви ${lvlData.gusts.toFixed(1)} м/с на ${lvlNum}м`)
        }
      }
    }
  }

  // 4. Опади (якщо увімкнено)
  if (isWarningEnabled(warnings, 'precip')) {
    const precipSev = evaluatePrecip(point.precipMm, warnings.precip)
    elevate(precipSev, `Опади ${point.precipMm.toFixed(1)} мм/год`)
  }

  // 5. Туман / Видимість (якщо хоча б одне увімкнено)
  const fogActive = isWarningEnabled(warnings, 'fog')
  const visActive = isWarningEnabled(warnings, 'visibility')
  if (fogActive || visActive) {
    const fogSetting = fogActive ? warnings.fog : 'вимкнути'
    const visLimit = visActive ? warnings.visibility : 0
    const fogSev = evaluateFog(point.fogRisk, point.visibilityKm, fogSetting, visLimit)
    elevate(fogSev, `Видимість ${point.visibilityKm.toFixed(1)} км (туман: ${point.fogRisk})`)
  }

  // 6. Вологість (якщо увімкнено)
  if (isWarningEnabled(warnings, 'humidity')) {
    const humSev = evaluateHumidity(point.humidity, warnings.humidity)
    elevate(humSev, `Вологість ${point.humidity}%`)
  }

  // 7. Температура (якщо увімкнено min або max)
  const minTempActive = isWarningEnabled(warnings, 'minTemp')
  const maxTempActive = isWarningEnabled(warnings, 'maxTemp')
  if (minTempActive || maxTempActive) {
    const minT = minTempActive ? warnings.minTemp : -999
    const maxT = maxTempActive ? warnings.maxTemp : 999
    const tempSev = evaluateTemp(point.temp, minT, maxT)
    elevate(tempSev, `Температура ${point.temp.toFixed(1)}°C`)
  }

  // 8. КР-індекс (геомагнітна активність, якщо увімкнено)
  if (isWarningEnabled(warnings, 'kpIndex')) {
    const kpLimit = warnings.kpIndex ?? 5
    const kpSev = evaluateKpIndex(point.kpIndex, kpLimit)
    elevate(kpSev, `КР-індекс ${point.kpIndex} (ліміт ${kpLimit})`)
  }

  // 9. Кромка хмар (якщо увімкнено)
  if (isWarningEnabled(warnings, 'cloudBase')) {
    const cloudLimit = warnings.cloudBase ?? maxFlightLevelM
    const cloudSev = evaluateCloudBase(point.cloudBaseM, cloudLimit)
    elevate(cloudSev, `Кромка хмар ${point.cloudBaseM}м (ліміт ${cloudLimit}м)`)
  }

  return { severity, issues }
}

/**
 * CSS-класи для бейджів та індикаторів (5 градацій)
 */
export function getSeverityBadgeClass(severity: WarningSeverity): string {
  switch (severity) {
    case 'danger':
      return 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
    case 'warning':
      return 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/30'
    case 'attention':
      return 'bg-yellow-400/20 text-yellow-800 dark:text-yellow-300 border border-yellow-400/40'
    case 'favorable':
      return 'bg-emerald-800/15 text-emerald-900 dark:text-emerald-400 border border-emerald-800/30'
    case 'ideal':
    case 'safe':
    default:
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
  }
}

/**
 * CSS-класи для табличних ячеєк (фон і текст у 5 градаціях)
 */
export function getSeverityCellClass(severity: WarningSeverity): string {
  switch (severity) {
    case 'danger':
      return 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 font-extrabold border border-rose-300 dark:border-rose-800/60'
    case 'warning':
      return 'bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-200 font-bold border border-orange-300 dark:border-orange-800/60'
    case 'attention':
      return 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-200 font-semibold border border-yellow-300 dark:border-yellow-700/60'
    case 'favorable':
      return 'bg-emerald-800/15 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 font-medium border border-emerald-800/25 dark:border-emerald-800/50'
    case 'ideal':
    case 'safe':
    default:
      return 'bg-emerald-500/15 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 font-medium border border-emerald-500/30 dark:border-emerald-700/40'
  }
}
