import React from 'react'
import { NavLink } from 'react-router-dom'
import { X, CloudRain, User, Heart, Info } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const sidebarClass = isOpen ? 'translate-x-0' : '-translate-x-full'
  const overlayClass = isOpen
    ? 'opacity-100 pointer-events-auto'
    : 'opacity-0 pointer-events-none'

  const navItems = [
    { to: '/app', icon: CloudRain, label: 'Консоль погоди' },
    { to: '/account', icon: User, label: 'Акаунт' },
    { to: '/donate', icon: Heart, label: 'Підтримати' },
    { to: '/about', icon: Info, label: 'Про проєкт' },
  ]

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

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
