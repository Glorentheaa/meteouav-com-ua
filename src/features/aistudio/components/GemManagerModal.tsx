import React, { useState } from 'react'
import {
  X,
  Bot,
  Trash2,
  Check,
} from 'lucide-react'
import { type AiGem } from '../types'
import { GemIcon } from './GemIcon'

interface GemManagerModalProps {
  isOpen: boolean
  onClose: () => void
  initialGem?: AiGem | null
  onSaveGem: (gem: AiGem) => void
  onDeleteGem?: (gemId: string) => void
}

const AVAILABLE_ICONS = [
  'sparkles',
  'cloud',
  'plane',
  'compass',
  'cpu',
  'shield',
  'wind',
  'zap',
  'radio',
  'bot',
]

const AVAILABLE_COLORS = [
  { name: 'sky', label: 'Небесний', bg: 'bg-sky-500' },
  { name: 'emerald', label: 'Смарагдовий', bg: 'bg-emerald-500' },
  { name: 'amber', label: 'Бурштиновий', bg: 'bg-amber-500' },
  { name: 'indigo', label: 'Індиго', bg: 'bg-indigo-500' },
  { name: 'rose', label: 'Трояндовий', bg: 'bg-rose-500' },
  { name: 'purple', label: 'Фіолетовий', bg: 'bg-purple-500' },
]

export const GemManagerModal: React.FC<GemManagerModalProps> = ({
  isOpen,
  onClose,
  initialGem,
  onSaveGem,
  onDeleteGem,
}) => {
  const isEditing = Boolean(initialGem)
  const isBuiltIn = Boolean(initialGem?.isBuiltIn)

  const [name, setName] = useState(initialGem?.name || '')
  const [role, setRole] = useState(initialGem?.role || '')
  const [iconName, setIconName] = useState(initialGem?.iconName || 'bot')
  const [color, setColor] = useState(initialGem?.color || 'sky')
  const [description, setDescription] = useState(initialGem?.description || '')
  const [systemPromptAddon, setSystemPromptAddon] = useState(initialGem?.systemPromptAddon || '')
  const [suggestedPromptsText, setSuggestedPromptsText] = useState(
    initialGem?.suggestedPrompts.join('\n') || ''
  )
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Вкажіть назву агента-фахівця.')
      return
    }
    if (!role.trim()) {
      setError('Вкажіть коротку роль або спеціалізацію.')
      return
    }
    if (!systemPromptAddon.trim()) {
      setError('Вкажіть доповнення до системних інструкцій.')
      return
    }

    const suggestedPrompts = suggestedPromptsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)

    const gemToSave: AiGem = {
      id: initialGem ? initialGem.id : `gem_${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      iconName,
      color,
      description: description.trim(),
      systemPromptAddon: systemPromptAddon.trim(),
      suggestedPrompts: suggestedPrompts.length > 0 ? suggestedPrompts : ['Як ти можеш мені допомогти?'],
      isBuiltIn: isBuiltIn,
      createdAt: initialGem?.createdAt || Date.now(),
    }

    onSaveGem(gemToSave)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Заголовок */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                {isEditing ? (isBuiltIn ? 'Перегляд фахівця' : 'Редагування фахівця') : 'Створити нового фахівця (Gem)'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Профільний агент з персоналізованими системними інструкціями
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

        {/* Форма */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Назва та Роль */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                Назва фахівця (Gem) *
              </label>
              <input
                type="text"
                disabled={isBuiltIn}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="напр. Метеоролог БПЛА"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm disabled:opacity-60"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                Спеціалізація / Підзаголовок *
              </label>
              <input
                type="text"
                disabled={isBuiltIn}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="напр. Профільний авіаметеоролог"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm disabled:opacity-60"
              />
            </div>
          </div>

          {/* Вибір іконки та кольору */}
          {!isBuiltIn && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  Іконка
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setIconName(icon)}
                      className={`p-2 rounded-lg border transition-all ${
                        iconName === icon
                          ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-2 ring-sky-500/30'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <GemIcon iconName={icon} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  Колір акценту
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {AVAILABLE_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setColor(c.name)}
                      className={`w-6 h-6 rounded-full ${c.bg} transition-transform ${
                        color === c.name ? 'ring-3 ring-sky-400 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Короткий опис */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
              Короткий опис (відображається в картці)
            </label>
            <input
              type="text"
              disabled={isBuiltIn}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Для чого призначений цей фахівець..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm disabled:opacity-60"
            />
          </div>

          {/* Системні інструкції (Addon) */}
          <div className="space-y-1">
            <label className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 text-xs">
              <span>Доповнення до системних інструкцій (System Prompt Addon) *</span>
              <span className="text-[11px] font-normal text-slate-500">
                Додається до базового промпту
              </span>
            </label>
            <textarea
              rows={5}
              disabled={isBuiltIn}
              value={systemPromptAddon}
              onChange={(e) => setSystemPromptAddon(e.target.value)}
              placeholder="Опишіть спеціальні знання, алгоритм розрахунків, тон відповіді та специфічні правила для цього фахівця..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono text-xs leading-relaxed disabled:opacity-60"
            />
          </div>

          {/* Підказки / Стартові запитання */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
              Швидкі запитання (по одному на рядок)
            </label>
            <textarea
              rows={3}
              disabled={isBuiltIn}
              value={suggestedPromptsText}
              onChange={(e) => setSuggestedPromptsText(e.target.value)}
              placeholder="Який ризик обледеніння?&#10;Оціни вітрове навантаження на висоті 300м"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 focus:outline-none text-xs disabled:opacity-60"
            />
          </div>
        </form>

        {/* Дії */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <div>
            {isEditing && !isBuiltIn && onDeleteGem && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Ви дійсно бажаєте видалити фахівця "${initialGem?.name}"?`)) {
                    onDeleteGem(initialGem!.id)
                    onClose()
                  }
                }}
                className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 text-xs font-medium px-2 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Видалити</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 font-medium transition-colors text-sm"
            >
              {isBuiltIn ? 'Закрити' : 'Скасувати'}
            </button>
            {!isBuiltIn && (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-medium shadow-md shadow-sky-500/20 transition-all text-sm flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'Зберегти зміни' : 'Створити фахівця'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
