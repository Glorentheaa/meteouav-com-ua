import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronDown,
  RotateCcw,
  Check,
  Plus,
  Edit2,
  CloudSun,
  PanelLeftClose,
  PanelLeftOpen,
  Bot,
} from 'lucide-react'
import { type AiProfile } from '../types'
import { GemIcon, getProfileColorClasses } from './GemIcon'
import { ThemeSwitcher, type Theme } from '../../../components/common/ThemeSwitcher'

interface AiStudioHeaderProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  activeProfile: AiProfile | null
  profiles: AiProfile[]
  onSelectProfile: (profileId: string | null) => void
  onOpenProfileManager: (profile?: AiProfile) => void
  onClearChat: () => void
  hasMessages: boolean
  theme: Theme
  onThemeChange: (theme: Theme) => void
}

export const AiStudioHeader: React.FC<AiStudioHeaderProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  activeProfile,
  profiles,
  onSelectProfile,
  onOpenProfileManager,
  onClearChat,
  hasMessages,
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
    <header className="h-16 border-b border-slate-300 dark:border-slate-800 bg-slate-200 dark:bg-slate-950 px-3 sm:px-5 flex items-center justify-between z-20 shrink-0 select-none">
      {/* Ліва частина: Кнопка сайдбару + Логотип сайту + Спадне меню профілів */}
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
        {/* Кнопка згортання/розгортання бічної панелі — ліворуч від логотипа */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-1.5 sm:p-2 rounded-xl text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors shrink-0"
          title={isSidebarOpen ? 'Згорнути бічну панель' : 'Розгорнути бічну панель'}
          aria-label="Перемкнути панель чатів"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          ) : (
            <PanelLeftOpen className="w-5 h-5 text-emerald-500" />
          )}
        </button>

        {/* Логотип MeteoUAV | AI Studio */}
        <Link
          to="/app"
          className="flex items-center gap-2 font-logo select-none hover:opacity-85 transition-opacity shrink-0"
          title="Повернутися до MeteoUAV"
        >
          <CloudSun className="text-emerald-500 shrink-0 w-6 h-6 sm:w-7 sm:h-7" />
          <span className="text-base sm:text-xl tracking-wide flex items-center gap-1 sm:gap-1.5">
            <span className="text-slate-700 dark:text-slate-400 font-semibold">Meteo</span>
            <span className="text-emerald-500 font-extrabold">UAV</span>
            <span className="text-slate-400 dark:text-slate-600 font-light hidden xs:inline">|</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold tracking-tight text-xs sm:text-base hidden xs:inline">
              AI Studio
            </span>
          </span>
        </Link>

        {/* Спадне меню профілів (без слова "(профілі)", ширина адаптується) */}
        <div className="relative ml-1 sm:ml-2" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 transition-all text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 shadow-2xs whitespace-nowrap"
            title="Оберіть або налаштуйте профіль"
          >
            {activeProfile ? (
              <div className={`p-1 rounded-lg ${getProfileColorClasses(activeProfile.color)} shrink-0`}>
                <GemIcon iconName={activeProfile.iconName} className="w-3.5 h-3.5" />
              </div>
            ) : (
              <div className="p-1 rounded-lg bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <span className="truncate max-w-[140px] sm:max-w-[240px]">
              {activeProfile ? activeProfile.name : 'Оберіть профіль'}
            </span>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-max min-w-[220px] max-w-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 mb-1">
                <span>Профілі</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false)
                    onOpenProfileManager()
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline capitalize"
                >
                  <Plus className="w-3 h-3" />
                  <span>Новий</span>
                </button>
              </div>

              {/* Опція: Профіль не обраний */}
              <div
                onClick={() => {
                  onSelectProfile(null)
                  setIsDropdownOpen(false)
                }}
                className={`flex items-center justify-between p-2 rounded-xl text-left cursor-pointer transition-colors text-xs ${
                  activeProfile === null
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-500">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <span>Профіль не обраний</span>
                </div>
                {activeProfile === null && <Check className="w-3.5 h-3.5 text-emerald-500" />}
              </div>

              {/* Список створених профілів */}
              <div className="max-h-60 overflow-y-auto space-y-0.5 my-1">
                {profiles.map((p) => {
                  const isSelected = activeProfile?.id === p.id
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectProfile(p.id)
                        setIsDropdownOpen(false)
                      }}
                      className={`group flex items-center justify-between gap-2 p-2 rounded-xl text-left cursor-pointer transition-colors text-xs ${
                        isSelected
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-1 rounded-lg ${getProfileColorClasses(p.color)} shrink-0`}>
                          <GemIcon iconName={p.iconName} className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{p.name}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsDropdownOpen(false)
                            onOpenProfileManager(p)
                          }}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          title="Редагувати профіль"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Кнопка створення, якщо профілів ще немає */}
              {profiles.length === 0 && (
                <div className="p-2 text-center text-xs text-slate-400">
                  <p className="mb-2">Немає створених профілів</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false)
                      onOpenProfileManager()
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Створити перший профіль</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Права частина: Очистити діалог + Тема */}
      <div className="flex items-center gap-2 sm:gap-3">
        {hasMessages && (
          <button
            type="button"
            onClick={onClearChat}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-300/70 dark:hover:bg-slate-800 transition-colors"
            title="Очистити поточний діалог"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        <ThemeSwitcher theme={theme} onThemeChange={onThemeChange} />
      </div>
    </header>
  )
}
