import React from 'react'

interface AviationWindBarbProps {
  speedMs: number           // швидкість вітру, м/с
  directionDeg: number      // напрямок руху вітру (куди дме), градуси (0-360)
  size?: number             // розмір іконки в пікселях
  className?: string
  showText?: boolean        // чи показувати числовий азимут
}

/**
 * Авіаційний символ "пір'їнка" (Aviation Vector Barb):
 * Вказує вектор руху повітряних мас (звідки -> куди дме вітер).
 * Вістря стрілки вказує куди дме вітер, а хвіст з пір'ям показує силу вітру.
 */
export const AviationWindBarb: React.FC<AviationWindBarbProps> = ({
  speedMs,
  directionDeg,
  size = 24,
  className = '',
  showText = true,
}) => {
  const speedKnots = Math.round(speedMs * 1.94384)

  let remaining = speedKnots
  const pennants = Math.floor(remaining / 50)
  remaining %= 50
  const barbs = Math.floor(remaining / 10)
  remaining %= 10
  const halfBarbs = remaining >= 3 ? 1 : 0

  const getCompassDirection = (deg: number) => {
    const directions = ['Пн', 'Пн-Сх', 'Сх', 'Пд-Сх', 'Пд', 'Пд-Зх', 'Зх', 'Пн-Зх']
    const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8
    return directions[index]
  }

  // Нормалізований кут 0-359
  const normDeg = ((directionDeg % 360) + 360) % 360

  return (
    <div
      className={`flex flex-col items-center justify-center select-none ${className}`}
      title={`Азимут руху вітру: ${normDeg}° (${getCompassDirection(normDeg)}), швидкість: ${speedMs.toFixed(1)} м/с (${speedKnots} вузлів)`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        className="overflow-visible transition-transform duration-300"
        style={{ transform: `rotate(${normDeg}deg)` }}
      >
        {/* Древко стрілки: йде від хвоста (y=34) до вістря (y=7) */}
        <line
          x1="20"
          y1="34"
          x2="20"
          y2="8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-slate-700 dark:text-slate-200"
        />

        {/* Вістря стрілки (наконечник, вказує КУДИ дме вітер) */}
        <path
          d="M 16 13 L 20 6 L 24 13"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-700 dark:text-slate-200"
        />

        {/* Якщо вітер майже штиль (< 2.5 м/с) - малюємо спокійне коло */}
        {speedKnots < 3 && (
          <circle
            cx="20"
            cy="20"
            r="4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-slate-500 dark:text-slate-400"
          />
        )}

        {/* Оперення (пір'їнки) на хвості стрілки (y від 20 до 34) */}
        <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-cyan-600 dark:text-cyan-400">
          {/* Прапорець для 50 вузлів */}
          {Array.from({ length: pennants }).map((_, i) => {
            const y = 33 - i * 6
            return (
              <polygon
                key={`pennant-${i}`}
                points={`20,${y} 28,${y - 2} 20,${y - 5}`}
                className="fill-cyan-600 dark:fill-cyan-400 stroke-none"
              />
            )
          })}

          {/* Довгі пір'їнки (10 вузлів) */}
          {Array.from({ length: barbs }).map((_, i) => {
            const y = 33 - pennants * 6 - i * 4.5
            return (
              <line
                key={`barb-${i}`}
                x1="20"
                y1={y}
                x2="29"
                y2={y + 3}
              />
            )
          })}

          {/* Коротке пір'я (5 вузлів) */}
          {halfBarbs > 0 && (
            <line
              x1="20"
              y1={33 - pennants * 6 - barbs * 4.5}
              x2="25"
              y2={33 - pennants * 6 - barbs * 4.5 + 2}
            />
          )}
        </g>
      </svg>

      {/* Числове значення азимуту без значка градуса (винесено в заголовок параметра) */}
      {showText && (
        <div className="flex items-center justify-center mt-0.5 leading-none">
          <span className="text-[9px] font-semibold text-slate-600 dark:text-slate-400">
            {normDeg}
          </span>
        </div>
      )}
    </div>
  )
}
