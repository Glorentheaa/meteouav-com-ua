import React from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2, CloudSun } from 'lucide-react'
import { useAuth } from '../../context/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Захищений маршрут: якщо користувач не авторизований — перенаправляє на головну сторінку (/).
 * Поки триває завантаження сесії — показує екран завантаження.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-200 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow text-emerald-500 mb-4 animate-pulse">
          <CloudSun className="w-8 h-8" />
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mb-2" />
        <p className="text-sm text-slate-500">Перевірка авторизації...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
