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
  ArrowLeft,
  KeyRound,
  Send,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { Captcha } from '../components/common/Captcha'
import { supabase } from '../services/supabaseClient'

type AuthMode = 'login' | 'register' | 'forgot' | 'reset'

export const Auth: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialMode: AuthMode = (() => {
    const modeParam = searchParams.get('mode')
    const hasRecoveryHash =
      window.location.hash.includes('type=recovery') ||
      window.location.hash.includes('access_token')
    if (modeParam === 'reset' || hasRecoveryHash) return 'reset'
    if (modeParam === 'forgot') return 'forgot'
    if (modeParam === 'register') return 'register'
    return 'login'
  })()

  const [mode, setMode] = useState<AuthMode>(initialMode)
  const { user, signIn, signUp, resetPassword, updatePassword, loading: authLoading } = useAuth()

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

  // Підписка на подію PASSWORD_RECOVERY від Supabase
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset')
        setErrorMsg(null)
        setSuccessMsg(null)
      }
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Якщо користувач уже увійшов — перенаправляємо на /account,
  // АЛЕ НЕ перенаправляємо, якщо користувач перейшов за посиланням відновлення пароля (mode === 'reset')
  useEffect(() => {
    const isRecovery =
      mode === 'reset' ||
      window.location.hash.includes('type=recovery') ||
      searchParams.get('mode') === 'reset'

    if (!authLoading && user && !isRecovery) {
      navigate('/account', { replace: true })
    }
  }, [user, authLoading, navigate, mode, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    const trimmedEmail = email.trim()

    // 1. РЕЖИМ: Відновлення пароля ("Забули пароль?")
    if (mode === 'forgot') {
      if (!trimmedEmail) {
        setErrorMsg('Будь ласка, введіть електронну пошту.')
        return
      }

      setIsSubmitting(true)
      const res = await resetPassword(trimmedEmail)
      setIsSubmitting(false)

      if (res.error) {
        setErrorMsg(res.error.message || 'Не вдалося надіслати лист для відновлення. Спробуйте пізніше.')
        return
      }

      setSuccessMsg(
        'Лист із посиланням для відновлення пароля успішно надіслано! Будь ласка, перевірте поштову скриньку (зокрема папку «Спам»).'
      )
      return
    }

    // 2. РЕЖИМ: Встановлення нового пароля після переходу з листа
    if (mode === 'reset') {
      if (!password) {
        setErrorMsg('Будь ласка, введіть новий пароль.')
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

      setIsSubmitting(true)
      const res = await updatePassword(password)
      setIsSubmitting(false)

      if (res.error) {
        setErrorMsg(res.error.message || 'Помилка збереження нового паролю. Спробуйте ще раз.')
        return
      }

      setSuccessMsg('Пароль успішно оновлено! Перенаправляємо в особистий кабінет...')
      setTimeout(() => {
        navigate('/account')
      }, 1500)
      return
    }

    // Перевірка обов'язкових полів для входу та реєстрації
    if (!trimmedEmail) {
      setErrorMsg('Будь ласка, введіть електронну пошту.')
      return
    }

    if (!password) {
      setErrorMsg('Будь ласка, введіть пароль.')
      return
    }

    // 3. РЕЖИМ: Реєстрація нового користувача
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

      // Якщо пошта вже є в базі: відкриваємо вкладку входу та виводимо повідомлення
      const isAlreadyRegistered =
        res.userAlreadyExists ||
        (res.error &&
          (res.error.message.toLowerCase().includes('already registered') ||
            res.error.message.toLowerCase().includes('already exists') ||
            res.error.message.toLowerCase().includes('user_already_exists') ||
            res.error.message.toLowerCase().includes('already in use')))

      if (isAlreadyRegistered) {
        setMode('login')
        setPassword('')
        setConfirmPassword('')
        setErrorMsg('Користувач з такою поштою вже існує. Будь ласка, увійдіть.')
        return
      }

      if (res.error) {
        setErrorMsg(res.error.message || 'Помилка реєстрації. Спробуйте ще раз.')
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
      return
    }

    // 4. РЕЖИМ: Вхід у систему
    if (mode === 'login') {
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all">
        {/* ========================================================================= */}
        {/* [STATIC_TEXT] ВЕРХНЯ ПАНЕЛЬ: ПЕРЕМИКАЧ ВХІД / РЕЄСТРАЦІЯ                  */}
        {/* ========================================================================= */}
        {mode === 'login' || mode === 'register' ? (
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
        ) : (
          <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-4 py-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setErrorMsg(null)
                setSuccessMsg(null)
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Повернутися до входу</span>
            </button>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {mode === 'forgot' ? 'Відновлення' : 'Скидання'}
            </span>
          </div>
        )}

        <div className="p-6">
          {/* ========================================================================= */}
          {/* [STATIC_TEXT] ЗАГОЛОВКИ ТА ПІДКАЗКИ ДЛЯ РІЗНИХ РЕЖИМІВ ВХОДУ              */}
          {/* ========================================================================= */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {mode === 'login' && 'Вхід у систему'}
              {mode === 'register' && 'Створення акаунту'}
              {mode === 'forgot' && 'Відновлення пароля'}
              {mode === 'reset' && 'Новий пароль'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {mode === 'login' && 'Увійдіть, щоб отримати доступ до персональних налаштувань'}
              {mode === 'register' && 'Зареєструйтеся для збереження локацій та розширених функцій'}
              {mode === 'forgot' &&
                'Введіть вашу пошту, і ми надішлемо безпечне посилання для встановлення нового пароля.'}
              {mode === 'reset' && 'Введіть новий надійний пароль для вашого облікового запису.'}
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
            {/* Поле нікнейму (лише для реєстрації) */}
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

            {/* Email (для login, register та forgot) */}
            {mode !== 'reset' && (
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
            )}

            {/* Пароль (для login, register та reset) */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {mode === 'reset' ? 'Новий пароль' : 'Пароль'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot')
                        setErrorMsg(null)
                        setSuccessMsg(null)
                      }}
                      className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      Забули пароль?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={mode === 'reset' ? 'Введіть новий пароль' : 'Введіть пароль'}
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
            )}

            {/* Повторення паролю (для register та reset) */}
            {(mode === 'register' || mode === 'reset') && (
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

            {/* ========================================================================= */}
            {/* [STATIC_TEXT] ПОВІДОМЛЕННЯ ПРО ТРИВАЛІСТЬ СЕСІЇ (31 ДЕНЬ)                 */}
            {/* ========================================================================= */}
            {(mode === 'login' || mode === 'register') && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center pt-1">
                Сесія зберігається на пристрої протягом 31 дня.
              </div>
            )}

            {/* ========================================================================= */}
            {/* [STATIC_TEXT] КНОПКА ВІДПРАВКИ ФОРМИ В ЗАЛЕЖНОСТІ ВІД РЕЖИМУ              */}
            {/* ========================================================================= */}
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
              ) : mode === 'register' ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Зареєструватися</span>
                </>
              ) : mode === 'forgot' ? (
                <>
                  <Send className="w-4 h-4" />
                  <span>Надіслати лист для відновлення</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-5 h-5" />
                  <span>Зберегти новий пароль</span>
                </>
              )}
            </button>

            {/* Додаткове посилання повернення для forgot */}
            {mode === 'forgot' && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setErrorMsg(null)
                    setSuccessMsg(null)
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  Згадали пароль? <span className="text-emerald-600 dark:text-emerald-400 font-medium">Увійти</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

