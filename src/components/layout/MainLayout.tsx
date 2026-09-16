import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { Sidebar } from './Sidebar'

export const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-slate-200 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Шапка, передаємо функцію відкриття меню */}
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Виїзне меню */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Головний контейнер для сторінок */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 flex flex-col">
        {/* Сюди React Router підставлятиме вміст конкретних сторінок */}
        <Outlet />
      </main>

      {/* Підвал */}
      <Footer />
    </div>
  )
}
