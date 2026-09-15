import React from 'react'
import { Link } from 'react-router-dom'
import { Logo } from './Logo'

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-300 dark:border-slate-800 bg-slate-200 dark:bg-slate-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col items-center justify-center">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <Logo isSmall={true} />
          <span className="hidden sm:inline text-slate-400 dark:text-slate-600">|</span>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-center">
            &copy; 2026{' '}
            <Link to="/about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors underline decoration-slate-400 dark:decoration-slate-600 underline-offset-4">
              MeteoUAV
            </Link>
            . <Link to="/legal" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors underline decoration-slate-400 dark:decoration-slate-600 underline-offset-4">
              Усі права захищено
            </Link>.
          </p>
        </div>
      </div>
    </footer>
  )
}