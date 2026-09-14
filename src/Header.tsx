import React, { useState, useEffect, useRef } from 'react'
import { Menu, Sun, Moon, MapPin, ChevronDown, Map, Settings } from 'lucide-react'
import { Logo } from './Logo'
import { useNavigate } from 'react-router-dom'

export const Header: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || 
           window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  // Закриття меню при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsLocationMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLocationSelect = (path: string) => {
    setIsLocationMenuOpen(false)
    navigate(path)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-wrap items-center justify-between">
          
          {/* Ліва група */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onMenuClick}
              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              aria-label="Відкрити меню"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <Logo />
            
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              aria-label="Змінити тему"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Права група: Меню локацій */}
          <div className="w-full mt-3 sm:w-auto sm:mt-0 ml-0 sm:ml-12 flex justify-start sm:justify-end relative" ref={menuRef}>
            
            <button 
              onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-slate-900 transition-colors w-full sm:w-auto justify-between"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span className="font-medium text-sm sm:text-base text-slate-700 dark:text-slate-200">Поточна локація</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isLocationMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Випадаючий список */}
            {isLocationMenuOpen && (
              <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden z-50">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => handleLocationSelect('/map')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                  >
                    <Map className="w-4 h-4 text-slate-400" />
                    Обрати на мапі
                  </button>
                  <button 
                    onClick={() => handleLocationSelect('/settings')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Керувати збереженими
                  </button>
                </div>
                
                <div className="p-2 max-h-48 overflow-y-auto">
                  <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Закріплені</div>
                  <button className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                    Київ
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                    Дніпро
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </header>
  )
}