export type ForecastDepth = '24' | '48'
export type ForecastDetail = '1' | '3' | '6'
export type FlightLevels = '300' | '500' | '800' | '3000'

export type PrecipOption = '>0.1 мм' | '>0.3 мм' | 'вимкнути'
export type FogOption = 'висока вірогідність' | 'мала вірогідність' | 'вимкнути'

export type WarningKey =
  | 'wind'
  | 'gusts'
  | 'cloudBase'
  | 'visibility'
  | 'precip'
  | 'fog'
  | 'humidity'
  | 'minTemp'
  | 'maxTemp'
  | 'kpIndex'

export interface MeteoWarnings {
  wind: number
  gusts: number
  cloudBase: number
  visibility: number
  precip: PrecipOption | string
  fog: FogOption | string
  humidity: number
  minTemp: number
  maxTemp: number
  kpIndex: number
  enabled?: Partial<Record<WarningKey, boolean>>
}

export interface MeteoBlocksState {
  shortTerm: boolean
  wind: boolean
  windows: boolean
  conclusion: boolean
  weekly: boolean
  sunMoon: boolean
}

export type MeteoBlockKey = keyof MeteoBlocksState

export interface BlockMeta {
  key: MeteoBlockKey
  label: string
}
