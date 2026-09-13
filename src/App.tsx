import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Home } from './Home'
import { Settings } from './Settings'
import { Auth } from './Auth'
import { Account } from './Account'
import { Donate } from './Donate'
import { About } from './About'
import { Legal } from './Legal'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/account" element={<Account />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/about" element={<About />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App