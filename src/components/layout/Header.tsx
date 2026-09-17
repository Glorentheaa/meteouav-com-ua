import React, { useState, useEffect } from 'react'
import { Menu, Smartphone, Download } from 'lucide-react'
import { Logo } from '../common/Logo'
import { ThemeSwitcher, type Theme } from '../common/ThemeSwitcher'
import { useLocation } from 'react-router-dom'
import { usePwaInstall } from '../../hooks/usePwaInstall'

export const Header: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
  const location = useLocation()
  const isHome = location.pathname === '/'

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system'
  })

  const { canInstall, installPwa } = usePwaInstall()

  // Обробка теми
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      localStorage.removeItem('theme')
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark')
      }
    } else {
      localStorage.setItem('theme', theme)
      root.classList.add(theme)
    }
  }, [theme])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-300 dark:border-slate-800 bg-slate-200 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        <div className="flex w-full items-center justify-between gap-2">
          {/* Ліва частина: Меню + Лого + Перемикач тем в один нерозривний ряд */}
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            {!isHome && (
              <button
                type="button"
                onClick={onMenuClick}
                className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors shrink-0"
                aria-label="Відкрити меню"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
            <Logo />
            <div className="ml-1 sm:ml-2 shrink-0">
              <ThemeSwitcher theme={theme} onThemeChange={setTheme} />
            </div>
          </div>

          {/* Права частина: Кнопка «Встановити» для планшетів / широких мобільних екранів (на ПК не відображається) */}
          {!isHome && canInstall && (
            <div className="hidden md:flex items-center">
              <button
                type="button"
                onClick={installPwa}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 transition-all shadow-xs text-xs font-semibold"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Встановити</span>
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
