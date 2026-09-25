import React, { useState } from 'react'
import {
  X,
  Settings as SettingsIcon,
  Check,
  RotateCcw,
  Sparkles,
  Link as LinkIcon,
  Key,
  Cpu,
  FileCode,
  Copy,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { type AiStudioSettings } from '../types'
import { DEFAULT_AI_STUDIO_SETTINGS } from '../defaultGems'

interface AiStudioSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: AiStudioSettings
  onSave: (newSettings: AiStudioSettings) => void
}

export const AiStudioSettingsModal: React.FC<AiStudioSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<AiStudioSettings>(settings)
  const [isCopiedPayload, setIsCopiedPayload] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [testMessage, setTestMessage] = useState('')

  if (!isOpen) return null

  const handleResetInstructions = () => {
    setFormData((prev) => ({
      ...prev,
      globalInstructions: DEFAULT_AI_STUDIO_SETTINGS.globalInstructions,
    }))
  }

  const handleTestConnection = async () => {
    if (!formData.webhookUrl.trim()) {
      setTestStatus('error')
      setTestMessage('Будь ласка, введіть URL вебхука n8n перед тестуванням.')
      return
    }

    setTestStatus('testing')
    setTestMessage('')

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (formData.bearerToken.trim()) {
        headers['Authorization'] = `Bearer ${formData.bearerToken.trim()}`
      }

      const res = await fetch(formData.webhookUrl.trim(), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'PING_TEST',
          message: 'Перевірка підключення від MeteoUAV AI Studio',
          timestamp: new Date().toISOString(),
        }),
      })

      if (res.ok) {
        setTestStatus('success')
        setTestMessage(`З'єднання успішне! n8n відповів кодом ${res.status}.`)
      } else {
        setTestStatus('error')
        setTestMessage(`n8n повернув статус ${res.status}: ${res.statusText}`)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setTestStatus('error')
      setTestMessage(`Помилка запиту: ${msg}. Перевірте CORS та доступність вашого інстансу n8n.`)
    }
  }

  const samplePayloadJson = JSON.stringify(
    {
      sessionId: 'session_123',
      sessionTitle: 'Оцінка вітру',
      message: 'Який ризик обледеніння на 600м?',
      agent: {
        id: 'uav-meteorologist',
        name: 'Метеоролог БПЛА',
        role: 'Профільний авіаметеоролог',
        systemPromptAddon: 'Твоя експертиза: розрахунок вітру, ризики обледеніння...',
      },
      globalInstructions: 'Ти — помічник MeteoUAV...',
      effectiveSystemPrompt: 'Глобальні інструкції + спеціалізація обраного агента',
      model: formData.defaultModel || 'gemini-2.0-flash',
      temperature: formData.temperature,
      timestamp: '2026-09-25T10:00:00Z',
    },
    null,
    2
  )

  const copyPayload = async () => {
    try {
      await navigator.clipboard.writeText(samplePayloadJson)
      setIsCopiedPayload(true)
      setTimeout(() => setIsCopiedPayload(false), 2000)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Заголовок модалки */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                Налаштування AI Studio & n8n
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Конфігурація глобальних інструкцій моделі та зв'язку з бекендом
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Тіло форми */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
          {/* n8n Webhook URL */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-sky-500" />
                n8n Webhook URL
              </span>
              <span className="text-xs font-normal text-slate-500">
                {formData.webhookUrl ? '🟢 Підключено' : '⚪ Локальний режим'}
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.webhookUrl}
                onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                placeholder="https://n8n.yourdomain.com/webhook/ai-studio"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-xs sm:text-sm"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 font-medium text-slate-700 dark:text-slate-200 transition-colors shrink-0 text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {testStatus === 'testing' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Тест...</span>
                  </>
                ) : (
                  <span>Тест зв'язку</span>
                )}
              </button>
            </div>
            {testMessage && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                  testStatus === 'success'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}
              >
                {testStatus === 'success' ? (
                  <Check className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{testMessage}</span>
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Якщо поле порожнє, AI Studio працює в локальному симуляційному режимі з готовими фаховими моделями.
            </p>
          </div>

          {/* Bearer Token (опціонально) */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <Key className="w-4 h-4 text-amber-500" />
              API Ключ / Bearer Token (необов'язково)
            </label>
            <input
              type="password"
              value={formData.bearerToken}
              onChange={(e) => setFormData({ ...formData, bearerToken: e.target.value })}
              placeholder="Введіть токен авторизації для n8n header Authorization..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-xs sm:text-sm"
            />
          </div>

          {/* Назва моделі та Температура */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <Cpu className="w-4 h-4 text-indigo-500" />
                Модель за замовчуванням
              </label>
              <input
                type="text"
                value={formData.defaultModel}
                onChange={(e) => setFormData({ ...formData, defaultModel: e.target.value })}
                placeholder="gemini-2.0-flash"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs sm:text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-800 dark:text-slate-200">
                  Температура: {formData.temperature}
                </label>
                <span className="text-xs text-slate-500">
                  {formData.temperature < 0.4 ? 'Точна' : formData.temperature > 0.8 ? 'Креативна' : 'Збалансована'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                className="w-full accent-sky-500 mt-2"
              />
            </div>
          </div>

          {/* Глобальні системні інструкції */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <Sparkles className="w-4 h-4 text-sky-500" />
                Глобальні інструкції для моделі (Базовий системний промпт)
              </label>
              <button
                type="button"
                onClick={handleResetInstructions}
                className="text-xs text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1 transition-colors"
                title="Відновити стандартні інструкції"
              >
                <RotateCcw className="w-3 h-3" />
                <span>За замовчуванням</span>
              </button>
            </div>
            <textarea
              rows={6}
              value={formData.globalInstructions}
              onChange={(e) => setFormData({ ...formData, globalInstructions: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-xs leading-relaxed"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ці інструкції передаються у кожному запиті до n8n як фундаментальна основа поведінки моделі. Додаткові інструкції обраного агента-фахівця автоматично доповнюють їх.
            </p>
          </div>

          {/* Зразок JSON контракту для n8n */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <FileCode className="w-3.5 h-3.5 text-sky-500" />
                JSON Payload контракт для n8n Webhook:
              </span>
              <button
                type="button"
                onClick={copyPayload}
                className="flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 hover:underline"
              >
                {isCopiedPayload ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopiedPayload ? 'Скопійовано' : 'Копіювати JSON'}</span>
              </button>
            </div>
            <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-300 font-mono text-[11px] leading-tight overflow-x-auto max-h-36">
              {samplePayloadJson}
            </pre>
          </div>
        </form>

        {/* Кнопки збереження */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 font-medium transition-colors text-sm"
          >
            Скасувати
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-medium shadow-md shadow-sky-500/20 transition-all text-sm flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Зберегти налаштування</span>
          </button>
        </div>
      </div>
    </div>
  )
}
