import React, { useState } from 'react'
import { Sparkles, Copy, Check } from 'lucide-react'
import { ForecastCard } from './ForecastCard'
import type { AiMeteorologistSummary } from '../../types/meteoData'

interface MeteorologistCardProps {
  aiSummary?: AiMeteorologistSummary
  className?: string
}

export const MeteorologistCard: React.FC<MeteorologistCardProps> = ({
  aiSummary,
  className = '',
}) => {
  const [copied, setCopied] = useState(false)

  // Текстовий прогноз від ШІ метеоролога
  const textContent =
    aiSummary?.brief ||
    'Сприятливі вікна для польотів легких БПЛА очікуються переважно у першій половині доби до 14:00. Після 14:00 очікується посилення вітру на робочих ешелонах 200–500м до 14–17 м/с та локальні опади. Геомагнітна обстановка ускладнена (КР=4..5). Рекомендовано завершити критичні завдання до погіршення метеоумов.'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Помилка копіювання тексту:', err)
    }
  }

  // Кнопка копіювання в правому кутку (Вимога 4)
  const copyButton = (
    <button
      type="button"
      onClick={handleCopy}
      className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all flex items-center gap-1.5 shadow-xs ${
        copied
          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/60 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300'
      }`}
      title="Скопіювати прогноз у буфер обміну"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          <span>Скопійовано!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Копіювати</span>
        </>
      )}
    </button>
  )

  return (
    <ForecastCard
      title="Висновки метеолога"
      icon={Sparkles}
      headerAction={copyButton}
      className={`w-full ${className}`}
    >
      <div className="flex-1 flex flex-col justify-start min-h-0">
        {/* Поле для простої текстової відповіді від ШІ */}
        <div className="flex-1 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap select-text overflow-y-auto min-h-[160px]">
          {textContent}
        </div>
      </div>
    </ForecastCard>
  )
}
