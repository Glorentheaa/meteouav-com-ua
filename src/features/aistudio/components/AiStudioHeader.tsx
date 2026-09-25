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
} from 'lucide-react'
import { type AiProfile } from '../types'
import { GemIcon } from './GemIcon'
import { ThemeSwitcher, type Theme } from '../../../components/common/ThemeSwitcher'

interface AiStudioHeaderProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  activeProfile: AiProfile
  profiles: AiProfile[]
  onSelectProfile: (profileId: string) => void
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
      {/* Ліва частина: Кнопка сайдбару + Логотип сайту з написом AI Studio + Селектор профілів */}
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
        {/* Кнопка розгортання/згортання панелі — доступна на всіх екранах! */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-1.5 sm:p-2 rounded-lg text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors"
          title={isSidebarOpen ? 'Згорнути панель чатів' : 'Розгорнути панель чатів'}
          aria-label="Перемкнути бічну панель"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-5 h-5" />
          ) : (
            <PanelLeftOpen className="w-5 h-5 text-emerald-500" />
          )}
        </button>

        {/* Логотип у стилі сайту з додаванням AI Studio */}
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

        {/* Спадне меню: Профілі (Profiles Dropdown) */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 transition-all text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 shadow-2xs"
            title="Оберіть активний профіль або налаштуйте його"
          >
            <div className="p-1 rounded-md bg-emerald-500 text-white shrink-0">
              <GemIcon iconName={activeProfile.iconName} className="w-3.5 h-3.5" />
            </div>
            <span className="truncate max-w-[100px] sm:max-w-[180px]">
              {activeProfile.name}
            </span>
            <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 hidden md:inline">
              (Профіль)
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span>Профілі</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false)
                    onOpenProfileManager()
                  }}
                  className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline capitalize"
                >
                  <Plus className="w-3 h-3" />
                  <span>Новий</span>
                </button>
              </div>

              {/* Список профілів */}
              <div className="max-h-64 overflow-y-auto space-y-1 my-1">
                {profiles.map((p) => {
                  const isSelected = p.id === activeProfile.id
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectProfile(p.id)
                        setIsDropdownOpen(false)
                      }}
                      className={`group w-full flex items-center justify-between gap-2 p-2 rounded-xl text-left cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shrink-0">
                          <GemIcon iconName={p.iconName} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{p.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {p.role}
                          </p>
                        </div>
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
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-opacity"
                          title="Редагувати системні інструкції"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Нижня кнопка швидкого редагування активного профілю */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false)
                    onOpenProfileManager(activeProfile)
                  }}
                  className="w-full text-center py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Налаштувати системні інструкції: {activeProfile.name}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Права частина: Очистити чат + Тема */}
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
