import React, { useState } from 'react'
import {
  X,
  UserCheck,
  Trash2,
  Check,
  Sliders,
} from 'lucide-react'
import { type AiProfile } from '../types'
import { GemIcon } from './GemIcon'

interface ProfileManagerModalProps {
  isOpen: boolean
  onClose: () => void
  initialProfile?: AiProfile | null
  onSaveProfile: (profile: AiProfile) => void
  onDeleteProfile?: (profileId: string) => void
}

const AVAILABLE_ICONS = [
  'cloud',
  'plane',
  'compass',
  'cpu',
  'shield',
  'wind',
  'zap',
  'bot',
  'sparkles',
]

const AVAILABLE_COLORS = [
  { name: 'emerald', label: 'Смарагдовий', bg: 'bg-emerald-500' },
  { name: 'sky', label: 'Небесний', bg: 'bg-sky-500' },
  { name: 'indigo', label: 'Індиго', bg: 'bg-indigo-500' },
  { name: 'amber', label: 'Бурштиновий', bg: 'bg-amber-500' },
  { name: 'rose', label: 'Трояндовий', bg: 'bg-rose-500' },
  { name: 'purple', label: 'Фіолетовий', bg: 'bg-purple-500' },
]

export const ProfileManagerModal: React.FC<ProfileManagerModalProps> = ({
  isOpen,
  onClose,
  initialProfile,
  onSaveProfile,
  onDeleteProfile,
}) => {
  const isEditing = Boolean(initialProfile)
  const isBuiltIn = Boolean(initialProfile?.isBuiltIn)

  const [name, setName] = useState(initialProfile?.name || '')
  const [role, setRole] = useState(initialProfile?.role || '')
  const [iconName, setIconName] = useState(initialProfile?.iconName || 'bot')
  const [color, setColor] = useState(initialProfile?.color || 'emerald')
  const [description, setDescription] = useState(initialProfile?.description || '')
  const [systemInstructions, setSystemInstructions] = useState(
    initialProfile?.systemInstructions || ''
  )
  const [temperature, setTemperature] = useState(initialProfile?.temperature ?? 0.7)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Вкажіть назву профілю.')
      return
    }
    if (!role.trim()) {
      setError('Вкажіть спеціалізацію чи коротку роль.')
      return
    }
    if (!systemInstructions.trim()) {
      setError('Вкажіть системні інструкції для цього профілю.')
      return
    }

    const profileToSave: AiProfile = {
      id: initialProfile ? initialProfile.id : `profile_${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      iconName,
      color,
      description: description.trim(),
      systemInstructions: systemInstructions.trim(),
      temperature,
      isBuiltIn: isBuiltIn,
      createdAt: initialProfile?.createdAt || Date.now(),
    }

    onSaveProfile(profileToSave)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Шапка */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                {isEditing ? (isBuiltIn ? 'Налаштування профілю' : 'Редагувати профіль') : 'Створити новий профіль'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Персоналізовані системні інструкції та параметри для n8n
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

          {/* Назва та Спеціалізація */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                Назва профілю *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="напр. Метеоролог БПЛА"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                Спеціалізація / Підзаголовок *
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="напр. Профільний авіаметеоролог"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Іконка та Колір */}
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
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/30'
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
                      color === c.name
                        ? 'ring-3 ring-emerald-400 ring-offset-2 scale-110'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Короткий опис */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
              Короткий опис (відображається в списку)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Коротко про завдання цього профілю..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
            />
          </div>

          {/* Системні інструкції */}
          <div className="space-y-1">
            <label className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 text-xs">
              <span>Системні інструкції профілю (System Instructions) *</span>
              <span className="text-[11px] font-normal text-slate-500">
                Передаються в n8n з кожним повідомленням
              </span>
            </label>
            <textarea
              rows={6}
              value={systemInstructions}
              onChange={(e) => setSystemInstructions(e.target.value)}
              placeholder="Опишіть спеціальні знання, алгоритм розрахунків, тон відповіді та специфічні правила для цього профілю..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-xs leading-relaxed"
            />
          </div>

          {/* Температура / Параметри генерації */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 text-xs">
                <Sliders className="w-3.5 h-3.5 text-emerald-500" />
                Температура (Temperature): {temperature}
              </span>
              <span className="text-xs text-slate-500">
                {temperature < 0.4 ? 'Сувора/Точна' : temperature > 0.8 ? 'Креативна' : 'Збалансована'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 mt-1"
            />
          </div>
        </form>

        {/* Дії */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/80">
          <div>
            {isEditing && !isBuiltIn && onDeleteProfile && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Ви дійсно бажаєте видалити профіль "${initialProfile?.name}"?`)) {
                    onDeleteProfile(initialProfile!.id)
                    onClose()
                  }
                }}
                className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 text-xs font-medium px-2 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
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
