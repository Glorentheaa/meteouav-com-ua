import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { AuthProvider } from './context/AuthProvider'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { Home } from './pages/Home'
import { Settings } from './pages/Settings'
import { Auth } from './pages/Auth'
import { Account } from './pages/Account'
import { Donate } from './pages/Donate'
import { About } from './pages/About'
import { Legal } from './pages/Legal'
import { MeteoApp } from './pages/MeteoApp'
import { MapPage } from './pages/MapPage'
import { AiStudio } from './pages/AiStudio'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Сторінка привітання (публічна, тільки для незалогінених) */}
          <Route path="/" element={<Home />} />

          {/* Сторінка авторизації (публічна) */}
          <Route path="/auth" element={<Auth />} />

          {/* Захищений Layout огортає всі дочірні сторінки що потребують авторизацію */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/app" element={<MeteoApp />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/account" element={<Account />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/about" element={<About />} />
            <Route path="/legal" element={<Legal />} />
          </Route>

          {/* AI Studio (доступна виключно за прямим посиланням після авторизації) */}
          <Route path="/aistudio" element={<AiStudio />} />

          {/* Редирект для невідомих адрес */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App