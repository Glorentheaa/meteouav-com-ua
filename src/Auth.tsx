import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

export const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    if (isSignUp && password !== confirmPassword) {
      setError('Введені паролі не збігаються')
      setLoading(false)
      return
    }

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: nickname }
          }
        })
        if (signUpError) throw signUpError
        setMessage('Реєстрація успішна. Перевірте пошту для підтвердження.')
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (signInError) throw signInError
        navigate('/account')
      }
    } catch (err: any) {
      setError(err.message || 'Помилка авторизації')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-2 text-center">
          {isSignUp ? 'Реєстрація оператора' : 'Вхід до системи'}
        </h2>
        <p className="text-xs text-slate-400 mb-6 text-center">
          {isSignUp ? 'Створення облікового запису' : 'Авторизація за email та паролем'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Нікнейм / Позивний
              </label>
              <input
                type="text"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Введіть нікнейм"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Пароль
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-sm"
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Повторіть пароль
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 text-sm"
              />
            </div>
          )}

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
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-medium rounded-lg transition text-sm shadow"
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
            {isSignUp ? 'Вже є акаунт? Увійти' : 'Немає акаунта? Реєстрація'}
          </button>
        </div>
      </div>
    </main>
  )
}