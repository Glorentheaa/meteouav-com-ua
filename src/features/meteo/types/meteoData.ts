export type AltitudeLevel = 10 | 50 | 80 | 120 | 200 | 300 | 500 | 800 | 1000 | 1500 | 2000 | 3000

export const ALL_ALTITUDE_LEVELS: readonly AltitudeLevel[] = [
  10, 50, 80, 120, 200, 300, 500, 800, 1000, 1500, 2000, 3000,
]

export interface AltitudeWindData {
  speed: number           // швидкість вітру, м/с
  gusts?: number          // пориви вітру, м/с (лише для ешелонів <= 500м)
  directionDeg: number    // напрямок вітру (0-360°)
  cloudCoverPct?: number  // % хмарного покриття на цьому рівні
}

export type FogRisk = 'none' | 'low' | 'high'

export interface HourlyForecastPoint {
  time: string            // наприклад, "14:00"
  fullDate: string        // "2026-09-16"
  timestamp: number       // Unix timestamp (секунди)
  temp: number            // температура біля поверхні, °C
  surfaceWind: number     // швидкість вітру біля поверхні (10м), м/с
  surfaceGusts: number    // пориви вітру (10м), м/с
  windDirectionDeg: number // напрямок вітру, градуси
  precipMm: number        // опади, мм/год
  humidity: number        // вологість, %
  visibilityKm: number    // видимість, км
  fogRisk: FogRisk        // ризик туману
  cloudBaseM: number      // висота нижньої кромки хмар, метри
  cloudCoverPct?: number  // % загального хмарного покриття (0-100)
  kpIndex: number         // геомагнітна активність КР-індекс (0 - 9)
  levels: Record<AltitudeLevel, AltitudeWindData>
}

export type WarningSeverity = 'safe' | 'warning' | 'danger'

export interface HourEvaluation {
  severity: WarningSeverity
  issues: string[]        // текстові причини попередження (наприклад: "Пориви вітру 14 м/с")
}

export interface AiMeteorologistSummary {
  status: WarningSeverity
  title: string
  brief: string
  recommendations: string[]
}

export interface SunData {
  sunrise: string             // "05:42"
  sunset: string              // "19:28"
  daylightDuration: string    // "13 год 46 хв"
  civilTwilightStart: string  // "05:10" (початок навігаційних/цивільних сутінків)
  civilTwilightEnd: string    // "20:00" (завершення сутінків)
}

export interface MoonData {
  moonrise: string            // "21:15"
  moonset: string             // "07:30"
  phaseName: string           // "Зростаючий місяць"
  illuminationPct: number     // 74%
}

export interface AstronomyData {
  sun: SunData
  moon: MoonData
}

export interface FullMeteoForecastResponse {
  version: string
  updatedAt: string           // ISO рядок або формат часу
  sectorId: string
  locationName: string
  hourly: HourlyForecastPoint[]
  aiSummary: AiMeteorologistSummary
  weeklyChartUrl?: string
  astronomy: AstronomyData
}
