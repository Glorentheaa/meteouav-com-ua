import React, { useState } from 'react'
import { supabase } from './supabaseClient'

interface AuthProps {
  onSuccess: () => void
}

export const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        })
        if (signUpError) throw signUpError
        setMessage('Реєстрація успішна! Перевір пошту для підтвердження або увійди.')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (signInError) throw signInError
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'Виникла помилка під час автентифікації')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl backdrop-blur">
      <h2 className="text-xl font-bold text-white mb-2 text-center">
        {isSignUp ? 'Реєстрація пілота' : 'Вхід до MeteoUAV'}
      </h2>
      <p className="text-sm text-slate-400 mb-6 text-center">
        {isSignUp ? 'Створіть обліковий запис для доступу' : 'Увійдіть під своїм акаунтом'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Позивний або ім'я
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Наприклад, Сокіл"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition text-sm"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="pilot@example.com"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
            Пароль
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 transition text-sm"
          />
        </div>

        {error && (
          <div className="text-rose-400 bg-rose-950/40 border border-rose-900 rounded p-2.5 text-xs">
            {error}
          </div>
        )}

        {message && (
          <div className="text-emerald-400 bg-emerald-950/40 border border-emerald-900 rounded p-2.5 text-xs">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-medium rounded-lg transition duration-150 shadow text-sm"
        >
          {loading ? 'Обробка...' : isSignUp ? 'Зареєструватися' : 'Увійти'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp)
            setError(null)
            setMessage(null)
          }}
          className="text-xs text-cyan-400 hover:underline"
        >
          {isSignUp ? 'Вже маєте акаунт? Увійти' : 'Немає акаунта? Зареєструватися'}
        </button>
      </div>
    </div>
  )
}