import React from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeSwitcherProps {
  theme: Theme
  onThemeChange: (theme: Theme) => void
  className?: string
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  theme,
  onThemeChange,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center bg-slate-300/60 dark:bg-slate-900/90 rounded-lg p-0.5 border border-slate-300 dark:border-slate-800 shadow-2xs ${className}`}
    >
      <button
        type="button"
        onClick={() => onThemeChange('light')}
        aria-label="Світла тема"
        title="Світла тема"
        className={`flex items-center justify-center p-1 rounded-md transition-colors ${
          theme === 'light'
            ? 'bg-white dark:bg-slate-700 shadow-xs text-amber-500'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onThemeChange('system')}
        aria-label="Системна тема"
        title="Системна тема"
        className={`flex items-center justify-center p-1 rounded-md transition-colors ${
          theme === 'system'
            ? 'bg-white dark:bg-slate-700 shadow-xs text-emerald-500'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
        }`}
      >
        <Monitor className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onThemeChange('dark')}
        aria-label="Темна тема"
        title="Темна тема"
        className={`flex items-center justify-center p-1 rounded-md transition-colors ${
          theme === 'dark'
            ? 'bg-white dark:bg-slate-700 shadow-xs text-indigo-400'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
