import React from 'react'
import { Sparkles, CheckCircle2, AlertTriangle, XCircle, ShieldAlert } from 'lucide-react'
import { ForecastCard } from './ForecastCard'
import type { AiMeteorologistSummary } from '../../types/meteoData'

interface MeteorologistCardProps {
  aiSummary?: AiMeteorologistSummary
}

export const MeteorologistCard: React.FC<MeteorologistCardProps> = ({ aiSummary }) => {
  const summary = aiSummary || {
    status: 'warning',
    title: 'Умови польотів помірно складні (є обмеження)',
    brief:
      'Сприятливі вікна для легких БПЛА очікуються в першій половині доби. Після 14:00 можливе посилення вітру на робочих ешелонах та локальні опади. Геомагнітна обстановка потребує уваги.',
    recommendations: [
      'Для БПЛА коптерного типу обмежити робочі висоти через пориви вітру.',
      'Перевіряти кількість супутників та якість зв\'язку перед стартом (можливі геомагнітні збурення).',
      'Враховувати висоту нижньої кромки хмар для уникнення обмерзання та втрати оптичної видимості.',
    ],
  }

  const StatusIcon =
    summary.status === 'danger'
      ? XCircle
      : summary.status === 'warning'
      ? AlertTriangle
      : CheckCircle2

  const badgeStyles =
    summary.status === 'danger'
      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30'
      : summary.status === 'warning'
      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
      : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'

  return (
    <ForecastCard title="Висновок від ШІ метеоролога" icon={Sparkles}>
      <div className="flex-1 flex flex-col gap-3 p-1">
        {/* Статус-бейдж */}
        <div className="flex items-center justify-between">
          <div className={`px-2.5 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${badgeStyles}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{summary.title}</span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span>AI Тактичний аналіз</span>
          </span>
        </div>

        {/* Основне резюме */}
        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
            "{summary.brief}"
          </p>
        </div>

        {/* Рекомендації оператору */}
        {summary.recommendations && summary.recommendations.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-0.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Вказівки для екіпажу БПЛА:
            </span>
            <ul className="space-y-1.5">
              {summary.recommendations.map((rec, idx) => (
                <li
                  key={idx}
                  className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2 bg-white dark:bg-slate-800/40 p-2 rounded border border-slate-200/60 dark:border-slate-800/80"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span className="leading-snug">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ForecastCard>
  )
}
