import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { Home } from './pages/Home'
import { Settings } from './pages/Settings'
import { Auth } from './pages/Auth'
import { Account } from './pages/Account'
import { Donate } from './pages/Donate'
import { About } from './pages/About'
import { Legal } from './pages/Legal'
import { MeteoApp } from './pages/MeteoApp'

// Заглушка для сторінки мапи
const MapPlaceholder = () => (
  <div className="flex items-center justify-center h-full min-h-[50vh] text-slate-500 dark:text-slate-400">
    Мапа в розробці... (тут буде інтерактивна карта)
  </div>
)

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Головний Layout огортає всі дочірні сторінки */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/app" element={<MeteoApp />} />
          <Route path="/map" element={<MapPlaceholder />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/account" element={<Account />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/about" element={<About />} />
          <Route path="/legal" element={<Legal />} />
        </Route>

        {/* Редирект для невідомих адрес */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App