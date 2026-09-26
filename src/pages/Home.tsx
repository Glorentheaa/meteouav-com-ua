import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, UserPlus } from 'lucide-react'
import { ThemeSwitcher, type Theme } from '../components/common/ThemeSwitcher'
import { useAuth } from '../context/useAuth'

export const Home: React.FC = () => {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  const [theme, setTheme] = React.useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system'
  })

  React.useEffect(() => {
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

  // Якщо вже залогінений — відразу до MeteoApp
  React.useEffect(() => {
    if (!loading && user) {
      navigate('/app', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-200 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-200 dark:bg-slate-950 transition-colors duration-300">
      {/* Перемикач тем у правому верхньому куті */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeSwitcher theme={theme} onThemeChange={setTheme} />
      </div>

      {/* Центральний контент */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        {/* Логотип великий */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <img
            src="/favicon.svg"
            alt="MeteoUAV"
            className="w-28 h-28 sm:w-36 sm:h-36 mx-auto drop-shadow-xl"
          />
        </div>

        {/* Назва */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
            Meteo<span className="text-emerald-500">UAV</span>
          </h1>
          <p className="text-sm sm:text-base font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-6">
            Метеорологічна розвідка для пілотів БПЛА
          </p>
        </div>

        {/* Опис сервісу */}
        <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed mb-10">
            Закрита платформа для тактичної метеорологічної розвідки. Аналіз погоди, AI-асистент
            та оперативні дані для безпечних польотів БПЛА на полі бою.
          </p>
        </div>

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 w-full max-w-sm">
          <button
            type="button"
            onClick={() => navigate('/auth?mode=login')}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all duration-200"
          >
            <LogIn className="w-5 h-5" />
            <span>Увійти</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/auth?mode=register')}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 text-slate-900 dark:text-white font-bold rounded-2xl border border-slate-300 dark:border-slate-700 shadow-sm transition-all duration-200"
          >
            <UserPlus className="w-5 h-5" />
            <span>Зареєструватись</span>
          </button>
        </div>

        {/* Підказка про систему запрошень */}
        <p className="mt-6 text-xs text-slate-500 dark:text-slate-500 animate-in fade-in duration-500 delay-500">
          Реєстрація доступна лише за ключем запрошення від чинного учасника.
        </p>
      </div>

      {/* Підвал */}
      <div className="pb-6 text-center text-xs text-slate-400 dark:text-slate-600">
        © {new Date().getFullYear()} MeteoUAV · Закрита платформа
      </div>
    </div>
  )
}
