import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { AuthProvider } from './context/AuthProvider'
import { Home } from './pages/Home'
import { Settings } from './pages/Settings'
import { Auth } from './pages/Auth'
import { Account } from './pages/Account'
import { Donate } from './pages/Donate'
import { About } from './pages/About'
import { Legal } from './pages/Legal'
import { MeteoApp } from './pages/MeteoApp'
import { MapPage } from './pages/MapPage'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Головний Layout огортає всі дочірні сторінки */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/app" element={<MeteoApp />} />
            <Route path="/map" element={<MapPage />} />
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
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App