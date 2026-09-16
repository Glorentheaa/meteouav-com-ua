import type { MeteoWarnings } from '../types/meteo'
import type {
  HourlyForecastPoint,
  WarningSeverity,
  HourEvaluation,
  FogRisk,
} from '../types/meteoData'

/**
 * Оцінка швидкості вітру відносно ліміту
 */
export function evaluateWind(speed: number, limit: number): WarningSeverity {
  if (speed > limit) return 'danger'
  if (speed >= limit * 0.8) return 'warning'
  return 'safe'
}

/**
 * Оцінка поривів вітру
 */
export function evaluateGusts(gusts: number, limit: number): WarningSeverity {
  if (gusts > limit) return 'danger'
  if (gusts >= limit * 0.8) return 'warning'
  return 'safe'
}

/**
 * Оцінка температури
 */
export function evaluateTemp(temp: number, minTemp: number, maxTemp: number): WarningSeverity {
  if (temp < minTemp || temp > maxTemp) return 'danger'
  if (temp <= minTemp + 2 || temp >= maxTemp - 2) return 'warning'
  return 'safe'
}

/**
 * Оцінка опадів
 */
export function evaluatePrecip(precipMm: number, setting: string): WarningSeverity {
  if (setting === 'вимкнути') return 'safe'
  if (setting === '>0.1 мм' && precipMm > 0.1) return 'danger'
  if (setting === '>0.3 мм' && precipMm > 0.3) return 'danger'
  if (precipMm > 0) return 'warning'
  return 'safe'
}

/**
 * Оцінка туману та видимості
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
  if (fogRisk === 'low' || visibilityKm <= minVisibilityKm * 1.25) return 'warning'
  return 'safe'
}

/**
 * Оцінка вологості
 */
export function evaluateHumidity(humidity: number, limit: number): WarningSeverity {
  if (humidity > limit) return 'danger'
  if (humidity >= limit * 0.9) return 'warning'
  return 'safe'
}

/**
 * Оцінка геомагнітної активності (КР-індекс 0..9)
 * КР >= 5 - геомагнітна буря (високий ризик втрати або дрейфу супутників GPS/ГЛОНАСС)
 * КР 4 - помірні збурення
 */
export function evaluateKpIndex(kp: number): WarningSeverity {
  if (kp >= 5) return 'danger'
  if (kp >= 4) return 'warning'
  return 'safe'
}

/**
 * Оцінка кромки хмар відносно робочого ешелону польоту
 */
export function evaluateCloudBase(cloudBaseM: number, targetAltitudeM: number): WarningSeverity {
  if (cloudBaseM <= targetAltitudeM) return 'danger' // БПЛА всередині хмари
  if (cloudBaseM <= targetAltitudeM + 150) return 'warning' // на межі кромки
  return 'safe'
}

/**
 * Комплексна інтегральна оцінка безпеки конкретної години
 */
export function evaluateHour(
  point: HourlyForecastPoint,
  warnings: MeteoWarnings,
  maxFlightLevelM: number = 300
): HourEvaluation {
  const issues: string[] = []
  let severity: WarningSeverity = 'safe'

  const elevate = (sev: WarningSeverity, reason?: string) => {
    if (sev === 'danger') {
      severity = 'danger'
      if (reason) issues.push(reason)
    } else if (sev === 'warning' && severity !== 'danger') {
      severity = 'warning'
      if (reason) issues.push(reason)
    }
  }

  // 1. Вітер на поверхні
  const windSev = evaluateWind(point.surfaceWind, warnings.wind)
  elevate(windSev, windSev !== 'safe' ? `Вітер ${point.surfaceWind.toFixed(1)} м/с (ліміт ${warnings.wind})` : undefined)

  // 2. Пориви на поверхні
  const gustSev = evaluateGusts(point.surfaceGusts, warnings.gusts)
  elevate(gustSev, gustSev !== 'safe' ? `Пориви ${point.surfaceGusts.toFixed(1)} м/с (ліміт ${warnings.gusts})` : undefined)

  // 3. Вітер та пориви по ешелонах до maxFlightLevelM
  for (const [lvlStr, lvlData] of Object.entries(point.levels)) {
    const lvlNum = parseInt(lvlStr, 10)
    if (lvlNum <= maxFlightLevelM) {
      const lvlWindSev = evaluateWind(lvlData.speed, warnings.wind)
      elevate(lvlWindSev, lvlWindSev === 'danger' ? `Вітер ${lvlData.speed.toFixed(1)} м/с на ${lvlNum}м` : undefined)

      if (lvlData.gusts !== undefined) {
        const lvlGustSev = evaluateGusts(lvlData.gusts, warnings.gusts)
        elevate(lvlGustSev, lvlGustSev === 'danger' ? `Пориви ${lvlData.gusts.toFixed(1)} м/с на ${lvlNum}м` : undefined)
      }
    }
  }

  // 4. Опади
  const precipSev = evaluatePrecip(point.precipMm, warnings.precip)
  elevate(precipSev, precipSev !== 'safe' ? `Опади ${point.precipMm.toFixed(1)} мм/год` : undefined)

  // 5. Туман / Видимість
  const fogSev = evaluateFog(point.fogRisk, point.visibilityKm, warnings.fog, warnings.visibility)
  elevate(fogSev, fogSev !== 'safe' ? `Видимість ${point.visibilityKm.toFixed(1)} км (туман: ${point.fogRisk})` : undefined)

  // 6. Вологість
  const humSev = evaluateHumidity(point.humidity, warnings.humidity)
  elevate(humSev, humSev === 'danger' ? `Вологість ${point.humidity}%` : undefined)

  // 7. Температура
  const tempSev = evaluateTemp(point.temp, warnings.minTemp, warnings.maxTemp)
  elevate(tempSev, tempSev === 'danger' ? `Температура ${point.temp.toFixed(1)}°C поза нормою` : undefined)

  // 8. КР-індекс (геомагнітна активність)
  const kpSev = evaluateKpIndex(point.kpIndex)
  elevate(kpSev, kpSev === 'danger' ? `КР-індекс ${point.kpIndex} (ризик відмови GPS)` : undefined)

  // 9. Кромка хмар
  const cloudSev = evaluateCloudBase(point.cloudBaseM, maxFlightLevelM)
  elevate(cloudSev, cloudSev === 'danger' ? `Кромка хмар ${point.cloudBaseM}м нижче ешелону ${maxFlightLevelM}м` : undefined)

  return { severity, issues }
}

/**
 * CSS-класи для бейджів та індикаторів
 */
export function getSeverityBadgeClass(severity: WarningSeverity): string {
  switch (severity) {
    case 'danger':
      return 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
    case 'warning':
      return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
    case 'safe':
    default:
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
  }
}

/**
 * CSS-класи для табличних ячеєк (фон і текст)
 */
export function getSeverityCellClass(severity: WarningSeverity): string {
  switch (severity) {
    case 'danger':
      return 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-900/50'
    case 'warning':
      return 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-semibold border border-amber-200 dark:border-amber-900/50'
    case 'safe':
    default:
      return 'text-slate-700 dark:text-slate-300'
  }
}
