import React from 'react'
import { NavLink } from 'react-router-dom'
import { X, CloudRain, LogIn, Heart, Info, Crown, Smartphone, Download } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { getInitials } from '../../utils/gravatar'
import { usePwaInstall } from '../../hooks/usePwaInstall'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, profile, avatarUrl, isPro } = useAuth()
  const { canInstall, installPwa } = usePwaInstall()

  const sidebarClass = isOpen ? 'translate-x-0' : '-translate-x-full'
  const overlayClass = isOpen
    ? 'opacity-100 pointer-events-auto'
    : 'opacity-0 pointer-events-none'

  // Динамічний пункт меню: "Авторизуватись" для гостей або нікнейм для авторизованих
  const accountItem = user
    ? {
        to: '/account',
        label: profile?.nickname || user.email?.split('@')[0] || 'Мій профіль',
        isAuthorized: true,
      }
    : {
        to: '/auth',
        label: 'Авторизуватись',
        isAuthorized: false,
      }

  return (
    <>
      {/* Затемнення фону (Overlay) */}
      <div
        className={`fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${overlayClass}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Панель меню */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-[70] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${sidebarClass}`}
      >
        {/* ========================================================================= */}
        {/* [STATIC_TEXT] SIDEBAR: TITLE                                              */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <span className="font-semibold text-lg text-slate-800 dark:text-slate-200">
            Меню
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Закрити меню"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* [STATIC_TEXT] SIDEBAR: NAVIGATION_ITEMS                                   */}
        {/* ========================================================================= */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {/* Консоль погоди */}
          <NavLink
            to="/app"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <CloudRain className="w-5 h-5" />
            Консоль погоди
          </NavLink>

          {/* Пункт акаунту: Авторизуватись або нікнейм користувача */}
          <NavLink
            to={accountItem.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {accountItem.isAuthorized ? (
                <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 flex items-center justify-center border border-emerald-500/50">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {getInitials(profile?.nickname || user?.email)}
                    </span>
                  )}
                </div>
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              <span className="truncate">{accountItem.label}</span>
            </div>

            {accountItem.isAuthorized && isPro && (
              <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <Crown className="w-3 h-3" /> PRO
              </span>
            )}
          </NavLink>

          {/* Підтримати */}
          <NavLink
            to="/donate"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <Heart className="w-5 h-5" />
            Підтримати
          </NavLink>

          {/* Про проєкт */}
          <NavLink
            to="/about"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <Info className="w-5 h-5" />
            Про проєкт
          </NavLink>

          {/* ========================================================================= */}
          {/* [STATIC_TEXT] SIDEBAR: PWA_INSTALL                                        */}
          {/* ========================================================================= */}
          {canInstall && (
            <div className="pt-3">
              <button
                type="button"
                onClick={() => {
                  onClose()
                  installPwa()
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-semibold bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Встановити</span>
                </div>
                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </button>
            </div>
          )}
        </nav>
      </aside>
    </>
  )
}
