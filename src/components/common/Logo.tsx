import React from 'react'
import { CloudSun } from 'lucide-react'
import { Link } from 'react-router-dom'

interface LogoProps {
  isSmall?: boolean
  size?: 'small' | 'medium' | 'large'
  asLink?: boolean
  className?: string
}

export const Logo: React.FC<LogoProps> = ({
  isSmall = false,
  size,
  asLink = true,
  className = '',
}) => {
  const effectiveSize = size || (isSmall ? 'small' : 'medium')

  let iconSize = 'w-6 h-6 sm:w-7 sm:h-7'
  let textSize = 'text-xl sm:text-2xl'
  let gapSize = 'gap-2'

  if (effectiveSize === 'small') {
    iconSize = 'w-5 h-5 sm:w-6 sm:h-6'
    textSize = 'text-lg sm:text-xl'
    gapSize = 'gap-2'
  } else if (effectiveSize === 'large') {
    iconSize = 'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20'
    textSize = 'text-4xl sm:text-5xl md:text-6xl'
    gapSize = 'gap-3 sm:gap-4'
  }

  const content = (
    <>
      <CloudSun className={`text-emerald-500 shrink-0 ${iconSize}`} />
      <span
        className={`${textSize} ${
          effectiveSize === 'large'
            ? 'tracking-tight font-extrabold text-slate-800 dark:text-white'
            : 'tracking-wide'
        } flex items-center`}
      >
        {effectiveSize === 'large' ? (
          <>
            <span>Meteo</span>
            <span className="text-emerald-500 font-black">UAV</span>
          </>
        ) : (
          <>
            <span className="text-slate-700 dark:text-slate-400 font-semibold">Meteo</span>
            <span className="text-emerald-500 font-extrabold">UAV</span>
          </>
        )}
      </span>
    </>
  )

  const combinedClass = `inline-flex items-center ${gapSize} font-logo select-none ${
    asLink ? 'hover:opacity-80 transition-opacity' : ''
  } ${className}`

  if (!asLink) {
    return <div className={combinedClass}>{content}</div>
  }

  return (
    <Link to="/" className={combinedClass}>
      {content}
    </Link>
  )
}
