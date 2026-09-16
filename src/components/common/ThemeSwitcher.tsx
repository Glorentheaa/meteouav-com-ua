import React from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeSwitcherProps {
  theme: Theme
  onThemeChange: (theme: Theme) => void
  isMobile?: boolean
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  theme,
  onThemeChange,
  isMobile = false,
}) => {
  return (
    <div
      className={`flex bg-slate-300/50 dark:bg-slate-900/80 rounded-lg p-1 border border-slate-300 dark:border-slate-800 ${
        isMobile ? 'w-full sm:hidden' : 'hidden sm:flex'
      }`}
    >
      <button
        type="button"
        onClick={() => onThemeChange('light')}
        aria-label="Світла тема"
        className={`flex-1 flex justify-center p-1.5 rounded-md transition-colors ${
          theme === 'light'
            ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-500'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
        }`}
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onThemeChange('system')}
        aria-label="Системна тема"
        className={`flex-1 flex justify-center p-1.5 rounded-md transition-colors ${
          theme === 'system'
            ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-500'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
        }`}
      >
        <Monitor className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onThemeChange('dark')}
        aria-label="Темна тема"
        className={`flex-1 flex justify-center p-1.5 rounded-md transition-colors ${
          theme === 'dark'
            ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-400'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
        }`}
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  )
}
