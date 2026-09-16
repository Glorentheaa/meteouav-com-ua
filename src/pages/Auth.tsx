import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { Captcha } from '../components/common/Captcha'

export const Auth: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login'

  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const { user, signIn, signUp, loading: authLoading } = useAuth()

  // Поля форм
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')

  // Стан інтерфейсу
  const [showPassword, setShowPassword] = useState(false)
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Якщо користувач уже увійшов — перенаправляємо на /account
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/account', { replace: true })
    }
  }, [user, authLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setErrorMsg('Будь ласка, введіть електронну пошту.')
      return
    }

    if (!password) {
      setErrorMsg('Будь ласка, введіть пароль.')
      return
    }

    if (mode === 'register') {
      if (!nickname.trim()) {
        setErrorMsg('Будь ласка, введіть нікнейм.')
        return
      }

      if (password.length < 6) {
        setErrorMsg('Пароль має містити щонайменше 6 символів.')
        return
      }

      if (password !== confirmPassword) {
        setErrorMsg('Введені паролі не збігаються.')
        return
      }

      if (!isCaptchaVerified) {
        setErrorMsg('Будь ласка, пройдіть перевірку безпеки (капчу).')
        return
      }

      setIsSubmitting(true)
      const res = await signUp(trimmedEmail, password, nickname.trim())
      setIsSubmitting(false)

      if (res.error) {
        // Локалізація частих помилок Supabase
        if (res.error.message.includes('already registered')) {
          setErrorMsg('Користувач з такою адресою вже зареєстрований.')
        } else {
          setErrorMsg(res.error.message || 'Помилка реєстрації. Спробуйте ще раз.')
        }
        return
      }

      if (res.needsEmailConfirmation) {
        setSuccessMsg(
          'Реєстрація успішна! Ми надіслали лист для підтвердження на вашу пошту. Будь ласка, перейдіть за посиланням у листі для завершення входу.'
        )
      } else {
        setSuccessMsg('Акаунт успішно створено!')
        navigate('/account')
      }
    } else {
      // Режим входу
      setIsSubmitting(true)
      const res = await signIn(trimmedEmail, password)
      setIsSubmitting(false)

      if (res.error) {
        if (res.error.message.includes('Invalid login credentials')) {
          setErrorMsg('Невірний логін або пароль.')
        } else if (res.error.message.includes('Email not confirmed')) {
          setErrorMsg('Електронну пошту ще не підтверджено. Перевірте вхідні повідомлення.')
        } else {
          setErrorMsg(res.error.message || 'Помилка входу в систему.')
        }
        return
      }

      navigate('/account')
    }
  }

  return (
    <div className="w-full max-w-md mx-auto py-6 px-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Перемикач вкладок Вхід / Реєстрація */}
        <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setErrorMsg(null)
              setSuccessMsg(null)
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Вхід
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register')
              setErrorMsg(null)
              setSuccessMsg(null)
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Реєстрація
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {mode === 'login' ? 'Вхід у систему' : 'Створення акаунту'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {mode === 'login'
                ? 'Увійдіть, щоб отримати доступ до персональних налаштувань'
                : 'Зареєструйтеся для збереження локацій та розширених функцій'}
            </p>
          </div>

          {/* Повідомлення про помилку */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-600 dark:text-rose-400 text-sm animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Повідомлення про успіх */}
          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-emerald-700 dark:text-emerald-400 text-sm animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Поле нікнейму для реєстрації */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Нікнейм
                </label>
                <div className="relative">
                  <UserIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Ваш позивний або ім'я"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Електронна пошта
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="pilot@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            {/* Пароль */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Пароль
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Введіть надійний пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Повторення паролю (лише реєстрація) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Повторіть пароль
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Повторіть пароль ще раз"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>
            )}

            {/* Капча при реєстрації */}
            {mode === 'register' && (
              <div className="pt-1">
                <Captcha
                  isVerified={isCaptchaVerified}
                  onVerify={(verified) => setIsCaptchaVerified(verified)}
                />
              </div>
            )}

            {/* Інформація про тривалість сесії */}
            <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center pt-1">
              Сесія зберігається на пристрої протягом 31 дня.
            </div>

            {/* Кнопка відправки */}
            <button
              type="submit"
              disabled={isSubmitting || (mode === 'register' && !isCaptchaVerified)}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Обробка...</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Увійти</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Зареєструватися</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
