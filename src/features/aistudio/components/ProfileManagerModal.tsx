import React, { useState } from 'react'
import {
  X,
  Trash2,
  Check,
} from 'lucide-react'
import { type AiProfile } from '../types'
import { GemIcon, getProfileColorClasses } from './GemIcon'

interface ProfileManagerModalProps {
  isOpen: boolean
  onClose: () => void
  initialProfile?: AiProfile | null
  onSaveProfile: (profile: AiProfile) => void
  onDeleteProfile?: (profileId: string) => void
}

const AVAILABLE_ICONS = [
  'bot',
  'sparkles',
  'brain',
  'cpu',
  'zap',
  'flame',
  'shield',
  'code',
  'terminal',
  'file-text',
  'compass',
  'plane',
  'cloud',
  'eye',
  'layers',
  'settings',
  'radio',
  'search',
  'message-square',
  'rocket',
  'heart',
  'bookmark',
  'atom',
  'coffee',
  'wrench',
  'lightbulb',
  'globe',
]

const AVAILABLE_COLORS = [
  { name: 'emerald', label: 'Смарагдовий', bg: 'bg-emerald-500' },
  { name: 'sky', label: 'Небесний', bg: 'bg-sky-500' },
  { name: 'cyan', label: 'Ціан', bg: 'bg-cyan-500' },
  { name: 'teal', label: 'Тіл', bg: 'bg-teal-500' },
  { name: 'indigo', label: 'Індиго', bg: 'bg-indigo-500' },
  { name: 'purple', label: 'Фіолетовий', bg: 'bg-purple-500' },
  { name: 'violet', label: 'Віолетовий', bg: 'bg-violet-500' },
  { name: 'pink', label: 'Рожевий', bg: 'bg-pink-500' },
  { name: 'rose', label: 'Трояндовий', bg: 'bg-rose-500' },
  { name: 'amber', label: 'Бурштиновий', bg: 'bg-amber-500' },
  { name: 'orange', label: 'Помаранчевий', bg: 'bg-orange-500' },
  { name: 'slate', label: 'Графітовий', bg: 'bg-slate-600' },
]

export const ProfileManagerModal: React.FC<ProfileManagerModalProps> = ({
  isOpen,
  onClose,
  initialProfile,
  onSaveProfile,
  onDeleteProfile,
}) => {
  const isEditing = Boolean(initialProfile)

  const [name, setName] = useState(initialProfile?.name || '')
  const [iconName, setIconName] = useState(initialProfile?.iconName || 'bot')
  const [color, setColor] = useState(initialProfile?.color || 'emerald')
  const [description, setDescription] = useState(initialProfile?.description || '')
  const [systemInstructions, setSystemInstructions] = useState(
    initialProfile?.systemInstructions || ''
  )
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null
  if (initialProfile?.id === 'tea' || initialProfile?.isBuiltIn) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Вкажіть назву профілю.')
      return
    }

    const profileToSave: AiProfile = {
      id: initialProfile ? initialProfile.id : `profile_${Date.now()}`,
      name: name.trim(),
      iconName,
      color,
      description: description.trim(),
      systemInstructions: systemInstructions.trim(),
      createdAt: initialProfile?.createdAt || Date.now(),
    }

    onSaveProfile(profileToSave)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Шапка модалки */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${getProfileColorClasses(color)}`}>
              <GemIcon iconName={iconName} className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                {isEditing ? 'Редагувати профіль' : 'Створити новий профіль'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Персональні інструкції для ШІ агента
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

          {/* Назва профілю (підзаголовок прибрано) */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
              Назва профілю *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="напр. Розробник, Аналітик, Асистент"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
            />
          </div>

          {/* Вибір кольору акценту іконки */}
          <div className="space-y-1.5 pt-1">
            <label className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
              Колір іконки профілю
            </label>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {AVAILABLE_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  className={`w-7 h-7 rounded-full ${c.bg} transition-all ${
                    color === c.name
                      ? 'ring-4 ring-slate-400 dark:ring-slate-500 scale-110 shadow-md'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Вибір іконки */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                Іконка профілю
              </label>
              <span className="text-[11px] text-slate-400">
                Обрано: {iconName}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              {AVAILABLE_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setIconName(icon)}
                  className={`p-2 rounded-lg border transition-all ${
                    iconName === icon
                      ? `${getProfileColorClasses(color)} border-transparent ring-2 ring-offset-1`
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title={icon}
                >
                  <GemIcon iconName={icon} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Короткий опис */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
              Короткий опис (опціонально)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Коротке призначення або сфера знань..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-xs"
            />
          </div>

          {/* Системна інструкція */}
          <div className="space-y-1">
            <label className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 text-xs">
              <span>Системна інструкція</span>
              <span className="text-[11px] font-normal text-slate-500">
                Передається в n8n для цього профілю
              </span>
            </label>
            <textarea
              rows={6}
              value={systemInstructions}
              onChange={(e) => setSystemInstructions(e.target.value)}
              placeholder="Опишіть спеціалізацію, тон спілкування, правила відповідей та обов'язки цього профілю..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-xs leading-relaxed"
            />
          </div>
        </form>

        {/* Дії */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/80">
          <div>
            {isEditing && onDeleteProfile && initialProfile?.id !== 'tea' && !initialProfile?.isBuiltIn && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Ви дійсно бажаєте видалити профіль "${initialProfile?.name}"?`)) {
                    onDeleteProfile(initialProfile!.id)
                    onClose()
                  }
                }}
                className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 text-xs font-semibold px-2.5 py-2 rounded-xl hover:bg-rose-500/10 transition-colors"
                title="Видалити цей профіль"
              >
                <Trash2 className="w-4 h-4" />
                <span>Видалити профіль</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 font-medium transition-colors text-sm"
            >
              Скасувати
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md shadow-emerald-600/20 transition-all text-sm flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Зберегти зміни' : 'Створити профіль'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
