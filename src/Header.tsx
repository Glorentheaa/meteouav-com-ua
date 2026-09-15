import React, { useState, useEffect } from 'react'
import { Menu, Sun, Moon, Monitor, Smartphone, Download } from 'lucide-react'
import { Logo } from './Logo'
import { useLocation } from 'react-router-dom'

type Theme = 'light' | 'dark' | 'system'

export const Header: React.FC<{ onMenuClick?: () => void }> = ({ onMenuClick }) => {
  const location = useLocation()
  const isHome = location.pathname === '/'
  
  const [theme, setTheme] = useState<Theme>(() => 
    (localStorage.getItem('theme') as Theme) || 'system'
  )
  const [isScrolled, setIsScrolled] = useState(false)

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

// Обробка скролінгу для мобільного меню з авто-дотягуванням
  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>
    let lastScrollY = window.scrollY
    let isScrollingUp = false

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Визначаємо напрямок скролу
      isScrollingUp = currentScrollY < lastScrollY
      lastScrollY = currentScrollY > 0 ? currentScrollY : 0
      
      if (currentScrollY > 80) {
        // Ховаємо з безпечним запасом
        setIsScrolled(true)
      } else if (currentScrollY === 0) {
        // Відкриваємо елементи ВИКЛЮЧНО на абсолютному нулі сторінки
        setIsScrolled(false)
      }

      // Очищаємо попередній таймер при кожному мікрорусі
      clearTimeout(scrollTimeout)
      
      // Встановлюємо новий таймер, який спрацює, коли скрол зупиниться
      scrollTimeout = setTimeout(() => {
        const finalScrollY = window.scrollY
        // Якщо зупинилися "майже" нагорі (між 1 та 50 пікселями) І напрямок був ВГОРУ
        if (finalScrollY > 0 && finalScrollY < 50 && isScrollingUp) {
          // Плавно дотягуємо сторінку на самий верх
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }, 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  const ThemeSwitcher = ({ isMobile }: { isMobile?: boolean }) => (
    <div className={`flex bg-slate-300/50 dark:bg-slate-900/80 rounded-lg p-1 border border-slate-300 dark:border-slate-800 ${isMobile ? 'w-full sm:hidden' : 'hidden sm:flex'}`}>
      <button onClick={() => setTheme('light')} className={`flex-1 flex justify-center p-1.5 rounded-md transition-colors ${theme === 'light' ? 'bg-white dark:bg-slate-700 shadow-sm text-amber-500' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
        <Sun className="w-4 h-4" />
      </button>
      <button onClick={() => setTheme('system')} className={`flex-1 flex justify-center p-1.5 rounded-md transition-colors ${theme === 'system' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-500' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
        <Monitor className="w-4 h-4" />
      </button>
      <button onClick={() => setTheme('dark')} className={`flex-1 flex justify-center p-1.5 rounded-md transition-colors ${theme === 'dark' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
        <Moon className="w-4 h-4" />
      </button>
    </div>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-300 dark:border-slate-800 bg-slate-200 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center">
          
          <div className="flex items-center justify-between w-full sm:w-auto z-10 bg-slate-200 dark:bg-slate-950">
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
            </div>
            <div className="ml-6">
              <ThemeSwitcher />
            </div>
          </div>

          {/* Контейнер, який ховається при скролінгу на мобілках */}
          <div className={`flex flex-col sm:flex-row items-center w-full sm:w-auto gap-3 transition-all duration-300 origin-top overflow-hidden sm:overflow-visible ${isScrolled ? 'max-h-0 opacity-0 sm:max-h-20 sm:opacity-100 mt-0' : 'max-h-40 opacity-100 mt-3 sm:mt-0'}`}>
            <ThemeSwitcher isMobile />
            
            {!isHome && (
              <button className="flex items-center justify-center gap-2 px-3 py-2 sm:py-1.5 rounded-lg border border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 transition-all w-full sm:w-auto shadow-sm">
                <Smartphone className="w-4 h-4" />
                <span className="font-semibold text-sm">Встановити</span>
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}