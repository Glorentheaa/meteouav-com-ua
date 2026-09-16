import React, { useState } from 'react'
import { CalendarDays, Maximize2, X, ZoomIn } from 'lucide-react'
import { ForecastCard } from './ForecastCard'

interface WeeklyForecastCardProps {
  isSunMoonVisible?: boolean
  chartUrl?: string
}

export const WeeklyForecastCard: React.FC<WeeklyForecastCardProps> = ({
  isSunMoonVisible = true,
  chartUrl,
}) => {
  const [isZoomOpen, setIsZoomOpen] = useState(false)

  // Дні для SVG-метеограми (якщо картинки з n8n ще немає)
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']

  return (
    <>
      <ForecastCard
        title="Тижневий прогноз (метеограма)"
        icon={CalendarDays}
        className={isSunMoonVisible ? 'lg:col-span-2' : 'lg:col-span-3'}
      >
        <div className="flex-1 flex flex-col justify-between">
          <div
            onClick={() => setIsZoomOpen(true)}
            className="relative group w-full h-[180px] sm:h-[220px] bg-slate-900 rounded-lg overflow-hidden border border-slate-700/80 cursor-pointer shadow-inner flex items-center justify-center transition-all hover:border-emerald-500/50"
            title="Натисніть для збільшення графіка на весь екран"
          >
            {chartUrl ? (
              <img
                src={chartUrl}
                alt="Тижневий прогноз погоди MeteoUAV"
                className="w-full h-full object-cover object-center"
              />
            ) : (
              /* Векторна прев'ю-метеограма для тактичного огляду */
              <div className="w-full h-full p-3 flex flex-col justify-between select-none">
                {/* Верхня шкала днів */}
                <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-300 border-b border-slate-700 pb-1">
                  {days.map((d, i) => (
                    <div key={d} className="flex flex-col items-center">
                      <span>{d}</span>
                      <span className="text-[9px] text-slate-400 font-normal">
                        {16 + i}.09
                      </span>
                    </div>
                  ))}
                </div>

                {/* Графік температур та вітру */}
                <div className="relative flex-1 w-full flex items-center justify-center py-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 700 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Сітка висот/тиску */}
                    <line x1="0" y1="30" x2="700" y2="30" stroke="#334155" strokeDasharray="3 3" />
                    <line x1="0" y1="60" x2="700" y2="60" stroke="#334155" strokeDasharray="3 3" />
                    <line x1="0" y1="90" x2="700" y2="90" stroke="#334155" strokeDasharray="3 3" />

                    {/* Крива температури */}
                    <path
                      d="M 50 70 Q 150 40 250 55 T 450 35 T 650 65"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                    />
                    <path
                      d="M 50 70 Q 150 40 250 55 T 450 35 T 650 65 L 650 110 L 50 110 Z"
                      fill="url(#tempGradient)"
                    />

                    {/* Стовпчики опадів */}
                    <rect x="135" y="80" width="30" height="30" fill="#38bdf8" opacity="0.6" rx="2" />
                    <rect x="335" y="65" width="30" height="45" fill="#38bdf8" opacity="0.8" rx="2" />
                    <rect x="535" y="90" width="30" height="20" fill="#38bdf8" opacity="0.4" rx="2" />

                    {/* Точки значень */}
                    <circle cx="50" cy="70" r="4" fill="#34d399" />
                    <circle cx="250" cy="55" r="4" fill="#34d399" />
                    <circle cx="450" cy="35" r="4" fill="#34d399" />
                    <circle cx="650" cy="65" r="4" fill="#34d399" />
                  </svg>
                </div>

                {/* Нижня легенда */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800 pt-1.5 px-1">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-0.5 bg-emerald-400" />
                      <span>Темп. (+14..+21°C)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-sky-400/80 rounded-sm" />
                      <span>Опади</span>
                    </span>
                  </div>
                  <span className="text-slate-400 italic">Оновлення 1 раз на 48 год</span>
                </div>
              </div>
            )}

            {/* Оверлей при наведенні для зуму */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-medium text-xs backdrop-blur-[1px]">
              <ZoomIn className="w-4 h-4 text-emerald-400" />
              <span>Збільшити графік</span>
            </div>
          </div>
        </div>
      </ForecastCard>

      {/* Модальне вікно перегляду графіка на весь екран */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-900 border border-slate-700 rounded-xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold">
                <Maximize2 className="w-4 h-4 text-emerald-400" />
                <span>Тижнева метеограма сектора (деталізовано)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full h-[350px] sm:h-[450px] bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center p-4">
              {chartUrl ? (
                <img
                  src={chartUrl}
                  alt="Збільшений тижневий графік"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col justify-between">
                  <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
                    {days.map((d, i) => (
                      <div key={d}>
                        <span className="text-emerald-400">{d}</span> ({16 + i}.09)
                        <div className="text-[11px] text-slate-400 font-normal">
                          +{15 + (i % 3)}° / вітер 4-9 м/с
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-slate-400 text-sm italic">
                      Після підключення n8n тут буде відображатись згенероване повнорозмірне зображення метеограми високої роздільної здатності.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
