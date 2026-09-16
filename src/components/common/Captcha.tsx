import React, { useState } from 'react'
import { CheckCircle2, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react'

interface CaptchaProps {
  onVerify: (verified: boolean) => void
  isVerified: boolean
}

interface Challenge {
  num1: number
  num2: number
  op: '+' | '-'
  answer: number
  options: number[]
}

function createChallenge(): Challenge {
  const num1 = Math.floor(Math.random() * 8) + 4
  const num2 = Math.floor(Math.random() * 4) + 1
  const isAddition = Math.random() > 0.3
  const op: '+' | '-' = isAddition ? '+' : '-'
  const answer = isAddition ? num1 + num2 : num1 - num2

  const distractors = new Set<number>()
  while (distractors.size < 3) {
    const offset = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1)
    const fakeAnswer = answer + offset
    if (fakeAnswer !== answer && fakeAnswer >= 0) {
      distractors.add(fakeAnswer)
    }
  }

  const options = Array.from(distractors)
  options.push(answer)
  options.sort(() => Math.random() - 0.5)

  return { num1, num2, op, answer, options }
}

export const Captcha: React.FC<CaptchaProps> = ({ onVerify, isVerified }) => {
  const [challenge, setChallenge] = useState<Challenge>(createChallenge)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [hasError, setHasError] = useState(false)

  const handleRefresh = () => {
    setChallenge(createChallenge())
    setSelectedAnswer(null)
    setHasError(false)
  }

  const handleSelectOption = (value: number) => {
    if (!challenge || isVerified) return
    setSelectedAnswer(value)

    if (value === challenge.answer) {
      setHasError(false)
      onVerify(true)
    } else {
      setHasError(true)
      onVerify(false)
      setTimeout(() => {
        handleRefresh()
      }, 700)
    }
  }

  if (isVerified) {
    return (
      <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
        <span className="text-sm font-medium">Перевірку на людину успішно пройдено</span>
      </div>
    )
  }

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Перевірка безпеки: оберіть результат</span>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          title="Оновити запитання"
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-base font-semibold text-slate-800 dark:text-slate-100 tracking-wider">
          {challenge.num1} {challenge.op} {challenge.num2} = ?
        </div>
        <div className="grid grid-cols-4 gap-2 flex-1">
          {challenge.options.map((opt) => {
            const isSelected = selectedAnswer === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelectOption(opt)}
                className={`py-1.5 text-sm font-medium rounded-lg border transition-all ${
                  isSelected && hasError
                    ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                }`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>

      {hasError && (
        <div className="flex items-center gap-1.5 text-xs text-rose-500">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Невірна відповідь. Спробуйте ще раз!</span>
        </div>
      )}
    </div>
  )
}
