import { useState } from 'react'
import type {
  ForecastDepth,
  ForecastDetail,
  FlightLevels,
  MeteoWarnings
} from '../types/meteo'

const DEFAULT_SETTINGS = {
  depth: '24' as ForecastDepth,
  detail: '3' as ForecastDetail,
  levels: '800' as FlightLevels,
}

const DEFAULT_WARNINGS: MeteoWarnings = {
  wind: 12,
  gusts: 13,
  precip: '>0.1 мм',
  fog: 'висока вірогідність',
  humidity: 98,
  visibility: 1,
  minTemp: -20,
  maxTemp: 40,
}

export function useMeteoSettings() {
  const [depth, setDepth] = useState<ForecastDepth>(DEFAULT_SETTINGS.depth)
  const [detail, setDetail] = useState<ForecastDetail>(DEFAULT_SETTINGS.detail)
  const [levels, setLevels] = useState<FlightLevels>(DEFAULT_SETTINGS.levels)
  const [warnings, setWarnings] = useState<MeteoWarnings>(DEFAULT_WARNINGS)

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [showWarnings, setShowWarnings] = useState(false)

  const updateWarning = <K extends keyof MeteoWarnings>(
    key: K,
    value: MeteoWarnings[K]
  ) => {
    setWarnings((prev) => ({ ...prev, [key]: value }))
  }

  const handleFactoryReset = () => {
    setDepth(DEFAULT_SETTINGS.depth)
    setDetail(DEFAULT_SETTINGS.detail)
    setLevels(DEFAULT_SETTINGS.levels)
    setWarnings(DEFAULT_WARNINGS)
  }

  const handleSave = () => {
    setShowAdvancedSettings(false)
  }

  return {
    depth,
    setDepth,
    detail,
    setDetail,
    levels,
    setLevels,
    warnings,
    updateWarning,
    showAdvancedSettings,
    setShowAdvancedSettings,
    showWarnings,
    setShowWarnings,
    handleFactoryReset,
    handleSave,
  }
}
