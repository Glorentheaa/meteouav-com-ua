import React, { useState, useEffect } from 'react'
import { Menu, Sun, Moon, Monitor, Smartphone, Download } from 'lucide-react'
import { Logo } from './Logo'
import { useLocation } from 'react-router-dom'

type Theme = 'light' | 'dark' | 'system'

export const Header: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
  const location = useLocation()
  const isHome = location.pathname === '/'
  
  // Тема з 3 станами
  const [theme, setTheme] = useState<Theme>(() => 
    (localStorage.getItem('theme') as Theme) || 'system'
  )

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
    <header className="sticky top-0 z-50 w-full border-b border-slate-300 dark:border-slate-800 bg-slate-200 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-wrap items-center justify-between">
          
          <div className="flex items-center gap-4">
            {!isHome && (
              <button 
                onClick={onMenuClick}
                className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <Logo />
            
            {/* 3-позиційний перемикач теми */}
            <div className="hidden sm:flex bg-slate-300/50 dark:bg-slate-900 rounded-lg p-1 border border-slate-300 dark:border-slate-800">
              <button onClick={() => setTheme('light')} className={`p-1.5 rounded-md transition-colors ${theme === 'light' ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-500' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
                <Sun className="w-4 h-4" />
              </button>
              <button onClick={() => setTheme('system')} className={`p-1.5 rounded-md transition-colors ${theme === 'system' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-500' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
                <Monitor className="w-4 h-4" />
              </button>
              <button onClick={() => setTheme('dark')} className={`p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
                <Moon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isHome && (
            <div className="w-full mt-3 sm:w-auto sm:mt-0 ml-0 sm:ml-12 flex justify-start sm:justify-end">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-all w-full sm:w-auto justify-center">
                <Smartphone className="w-4 h-4" />
                <span className="font-semibold text-sm">Встановити</span>
                <Download className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}