import React from 'react'

interface AviationWindBarbProps {
  speedMs: number           // швидкість вітру, м/с
  directionDeg: number      // напрямок вітру, градуси (0-360)
  size?: number             // розмір іконки в пікселях
  className?: string
  showText?: boolean        // чи показувати градуси
}

/**
 * Авіаційний символ "пір'їнка" (Wind Barb) для відображення напрямку та сили вітру.
 * Древко повертається за кутом вітру, оперення (пір'їнки) відображає силу вітру.
 */
export const AviationWindBarb: React.FC<AviationWindBarbProps> = ({
  speedMs,
  directionDeg,
  size = 26,
  className = '',
  showText = true,
}) => {
  // Переведення м/с у вузли (1 м/с ≈ 1.94384 вузлів)
  const speedKnots = Math.round(speedMs * 1.94384)

  // Розрахунок елементів пір'я (50 kt, 10 kt, 5 kt)
  let remaining = speedKnots
  const pennants = Math.floor(remaining / 50)
  remaining %= 50
  const barbs = Math.floor(remaining / 10)
  remaining %= 10
  const halfBarbs = remaining >= 3 ? 1 : 0

  // Румби світу для підказки
  const getCompassDirection = (deg: number) => {
    const directions = ['Пн', 'Пн-Сх', 'Сх', 'Пд-Сх', 'Пд', 'Пд-Зх', 'Зх', 'Пн-Зх']
    const index = Math.round(((deg %= 360) < 0 ? deg + 360 : deg) / 45) % 8
    return directions[index]
  }

  return (
    <div
      className={`flex flex-col items-center justify-center select-none ${className}`}
      title={`Напрямок: ${directionDeg}°, ${getCompassDirection(directionDeg)}, швидкість: ${speedMs.toFixed(1)} м/с (${speedKnots} вузлів)`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        className="overflow-visible transition-transform duration-300"
        style={{ transform: `rotate(${directionDeg}deg)` }}
      >
        {/* Центральна точка кріплення / основа станції */}
        <circle cx="20" cy="30" r="2.5" className="fill-slate-700 dark:fill-slate-200" />

        {/* Древко стрілки (прямує вгору від точки кріплення до хвоста) */}
        <line
          x1="20"
          y1="30"
          x2="20"
          y2="8"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          className="text-slate-700 dark:text-slate-200"
        />

        {/* Якщо вітер майже нульовий (< 2.5 м/с) - малюємо коло довкола станції */}
        {speedKnots < 3 && (
          <circle
            cx="20"
            cy="30"
            r="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-slate-600 dark:text-slate-300"
          />
        )}

        {/* Пір'я / насічки вітру на хвості (верхній край древка, y від 8 до 20) */}
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-cyan-600 dark:text-cyan-400">
          {/* Трикутні прапорці (pennants) для 50 вузлів */}
          {Array.from({ length: pennants }).map((_, i) => {
            const y = 8 + i * 6
            return (
              <polygon
                key={`pennant-${i}`}
                points={`20,${y} 28,${y + 2} 20,${y + 5}`}
                className="fill-cyan-600 dark:fill-cyan-400 stroke-none"
              />
            )
          })}

          {/* Довгі штрихи (10 вузлів) */}
          {Array.from({ length: barbs }).map((_, i) => {
            const y = 8 + pennants * 6 + i * 4.5
            return (
              <line
                key={`barb-${i}`}
                x1="20"
                y1={y}
                x2="30"
                y2={y - 3}
              />
            )
          })}

          {/* Короткий штрих (5 вузлів) */}
          {halfBarbs > 0 && (
            <line
              x1="20"
              y1={8 + pennants * 6 + barbs * 4.5}
              x2="25.5"
              y2={8 + pennants * 6 + barbs * 4.5 - 2}
            />
          )}
        </g>
      </svg>

      {showText && (
        <div className="flex items-center gap-0.5 mt-0.5 leading-none">
          <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">
            {directionDeg}°
          </span>
        </div>
      )}
    </div>
  )
}
