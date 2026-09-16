import { useState, useEffect } from 'react'
import type {
  ForecastDepth,
  ForecastDetail,
  FlightLevels,
  MeteoWarnings
} from '../types/meteo'

const SETTINGS_STORAGE_KEY = 'meteo_advanced_settings_v2'
const WARNINGS_STORAGE_KEY = 'meteo_warnings_v2'

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
  const [depth, setDepth] = useState<ForecastDepth>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.depth) return parsed.depth
      }
    } catch {}
    return DEFAULT_SETTINGS.depth
  })

  const [detail, setDetail] = useState<ForecastDetail>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.detail) return parsed.detail
      }
    } catch {}
    return DEFAULT_SETTINGS.detail
  })

  const [levels, setLevels] = useState<FlightLevels>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.levels) return parsed.levels
      }
    } catch {}
    return DEFAULT_SETTINGS.levels
  })

  const [warnings, setWarnings] = useState<MeteoWarnings>(() => {
    try {
      const saved = localStorage.getItem(WARNINGS_STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {}
    return DEFAULT_WARNINGS
  })

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [showWarnings, setShowWarnings] = useState(false)

  // Збереження налаштувань при зміні
  useEffect(() => {
    try {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({ depth, detail, levels })
      )
    } catch (e) {
      console.error('Помилка збереження налаштувань:', e)
    }
  }, [depth, detail, levels])

  useEffect(() => {
    try {
      localStorage.setItem(WARNINGS_STORAGE_KEY, JSON.stringify(warnings))
    } catch (e) {
      console.error('Помилка збереження попереджень:', e)
    }
  }, [warnings])

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
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY)
      localStorage.removeItem(WARNINGS_STORAGE_KEY)
    } catch {}
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
