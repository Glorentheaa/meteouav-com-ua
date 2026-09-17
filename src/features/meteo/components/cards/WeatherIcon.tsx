import React from 'react'
import {
  Sun,
  Moon,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
} from 'lucide-react'
import type { FogRisk } from '../../types/meteoData'

interface WeatherIconProps {
  cloudCoverPct?: number
  precipMm?: number
  fogRisk?: FogRisk
  visibilityKm?: number
  time?: string // наприклад, "14:00"
  className?: string
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  cloudCoverPct = 20,
  precipMm = 0,
  fogRisk = 'none',
  visibilityKm = 10,
  time = '12:00',
  className = 'w-5 h-5',
}) => {
  const hour = parseInt(time.split(':')[0] || '12', 10)
  const isNight = hour >= 22 || hour < 6

  // 1. Опади (пріоритет 1)
  if (precipMm >= 2.0) {
    return (
      <div title={`Злива / сильний дощ (${precipMm.toFixed(1)} мм/год)`} className="flex items-center justify-center">
        <CloudLightning className={`${className} text-blue-500 dark:text-blue-400 drop-shadow-[0_0_6px_rgba(59,130,246,0.5)] animate-pulse`} />
      </div>
    )
  }
  if (precipMm > 0.05) {
    return (
      <div title={`Дощ (${precipMm.toFixed(1)} мм/год)`} className="flex items-center justify-center">
        <CloudRain className={`${className} text-sky-500 dark:text-sky-400 drop-shadow-[0_0_4px_rgba(56,189,248,0.4)]`} />
      </div>
    )
  }

  // 2. Туман / імла (пріоритет 2)
  if (fogRisk === 'high' || (visibilityKm < 3 && fogRisk !== 'none')) {
    return (
      <div title={`Густий туман / видимість ${visibilityKm.toFixed(1)} км`} className="flex items-center justify-center">
        <CloudFog className={`${className} text-slate-500 dark:text-slate-300 drop-shadow-[0_0_4px_rgba(203,213,225,0.4)]`} />
      </div>
    )
  }

  // 3. Хмарність
  if (cloudCoverPct >= 80) {
    return (
      <div title={`Суцільна хмарність (${cloudCoverPct}%)`} className="flex items-center justify-center">
        <Cloud className={`${className} text-slate-500 dark:text-slate-300 drop-shadow-[0_0_3px_rgba(203,213,225,0.3)]`} />
      </div>
    )
  }

  if (cloudCoverPct >= 35) {
    return (
      <div title={`Мінлива хмарність (${cloudCoverPct}%)`} className="flex items-center justify-center">
        {isNight ? (
          <Cloud className={`${className} text-slate-500 dark:text-slate-400`} />
        ) : (
          <CloudSun className={`${className} text-amber-500 dark:text-amber-300 drop-shadow-[0_0_4px_rgba(252,211,77,0.4)]`} />
        )}
      </div>
    )
  }

  // 4. Ясно / безхмарно
  return (
    <div title={`Ясно (${cloudCoverPct}%)`} className="flex items-center justify-center">
      {isNight ? (
        <Moon className={`${className} text-indigo-500 dark:text-indigo-300 drop-shadow-[0_0_4px_rgba(165,180,252,0.4)]`} />
      ) : (
        <Sun className={`${className} text-amber-500 dark:text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]`} />
      )}
    </div>
  )
}
