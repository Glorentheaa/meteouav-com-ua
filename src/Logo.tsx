import React from 'react'
import { CloudSun } from 'lucide-react'
import { Link } from 'react-router-dom'

interface LogoProps {
  isSmall?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ isSmall = false }) => {
  const iconSize = isSmall ? "w-5 h-5 sm:w-6 sm:h-6" : "w-6 h-6 sm:w-7 sm:h-7";
  const textSize = isSmall ? "text-lg sm:text-xl" : "text-xl sm:text-2xl";

  return (
    <Link to="/" className="flex items-center gap-2 font-logo select-none hover:opacity-80 transition-opacity">
      <CloudSun className={`text-emerald-500 shrink-0 ${iconSize}`} />
      <span className={`${textSize} tracking-wide flex items-center`}>
        <span className="text-slate-700 dark:text-slate-400 font-semibold">Meteo</span>
        <span className="text-emerald-500 font-extrabold">UAV</span>
      </span>
    </Link>
  )
}