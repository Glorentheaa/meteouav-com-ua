import React, { useState, useRef, useEffect } from 'react'
import {
  Menu,
  ChevronDown,
  RotateCcw,
  Check,
} from 'lucide-react'
import { type AiGem } from '../types'
import { GemIcon } from './GemIcon'
import { ThemeSwitcher, type Theme } from '../../../components/common/ThemeSwitcher'

interface AiStudioHeaderProps {
  onToggleSidebar: () => void
  activeGem: AiGem
  gems: AiGem[]
  onSelectGem: (gemId: string) => void
  onClearChat: () => void
  hasMessages: boolean
  webhookUrl: string
  onOpenSettings: () => void
  theme: Theme
  onThemeChange: (theme: Theme) => void
}

export const AiStudioHeader: React.FC<AiStudioHeaderProps> = ({
  onToggleSidebar,
  activeGem,
  gems,
  onSelectGem,
  onClearChat,
  hasMessages,
  webhookUrl,
  onOpenSettings,
  theme,
  onThemeChange,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-20 shrink-0">
      {/* Ліва частина: Бургер (мобільний) + Селектор фахівця (Gemini model selector) */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
          title="Меню"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dropdown перемикання фахівця (Gem) */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 transition-all text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 shadow-2xs"
          >
            <div className="p-1 rounded-full bg-sky-500 text-white shrink-0">
              <GemIcon iconName={activeGem.iconName} className="w-3.5 h-3.5" />
            </div>
            <span className="truncate max-w-[130px] sm:max-w-[200px]">{activeGem.name}</span>
            <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 hidden sm:inline">
              (Gem)
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Оберіть фахівця для сесії:
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {gems.map((g) => {
                  const isSelected = g.id === activeGem.id
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        onSelectGem(g.id)
                        setIsDropdownOpen(false)
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors ${
                        isSelected
                          ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0 mt-0.5">
                        <GemIcon iconName={g.iconName} className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold truncate">{g.name}</p>
                          {isSelected && <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {g.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Права частина: Статус зв'язку + Очищення + Перемикач теми */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Індикатор n8n або локальної емуляції */}
        <button
          type="button"
          onClick={onOpenSettings}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            webhookUrl
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
          }`}
          title={webhookUrl ? `n8n підключено: ${webhookUrl}` : 'Локальний симуляційний режим (натисніть для налаштування n8n)'}
        >
          <span className={`w-2 h-2 rounded-full ${webhookUrl ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="hidden md:inline">
            {webhookUrl ? 'n8n активний' : 'Локальний режим'}
          </span>
        </button>

        {/* Очищення поточної розмови */}
        {hasMessages && (
          <button
            type="button"
            onClick={onClearChat}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Очистити поточний діалог"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* Перемикач теми */}
        <ThemeSwitcher theme={theme} onThemeChange={onThemeChange} />
      </div>
    </header>
  )
}
