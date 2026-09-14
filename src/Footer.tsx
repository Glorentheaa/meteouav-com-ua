import React from 'react'
import { Link } from 'react-router-dom'
import { Logo } from './Logo'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex flex-col items-center sm:items-start gap-2">
          <Logo />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {currentYear} MeteoUAV. Усі права захищено.
          </p>
        </div>

        <nav className="flex gap-6 text-slate-600 dark:text-slate-300 text-sm font-medium">
          <Link to="/about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Про проєкт
          </Link>
          <Link to="/legal" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Правова інформація
          </Link>
        </nav>
        
      </div>
    </footer>
  )
}