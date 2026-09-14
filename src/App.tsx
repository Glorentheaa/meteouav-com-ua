import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './MainLayout'
import { Home } from './Home'
import { Settings } from './Settings'
import { Auth } from './Auth'
import { Account } from './Account'
import { Donate } from './Donate'
import { About } from './About'
import { Legal } from './Legal'
import { MeteoApp } from './MeteoApp'

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