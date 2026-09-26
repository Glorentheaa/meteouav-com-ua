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
  Key,
  ArrowRight,
  CloudSun,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { Captcha } from '../components/common/Captcha'
import { supabase } from '../services/supabaseClient'

type AuthMode = 'login' | 'invite-check' | 'register' | 'forgot' | 'reset'

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
    if (modeParam === 'register') return 'invite-check'
    return 'login'
  })()

  const [mode, setMode] = useState<AuthMode>(initialMode)
  const { user, signIn, signUp, resetPassword, updatePassword, loading: authLoading } = useAuth()

  // Поля форм
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [inviteKey, setInviteKey] = useState('')

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
    return () => { subscription.unsubscribe() }
  }, [])

  // Якщо користувач уже увійшов — перенаправляємо на /app
  useEffect(() => {
    const isRecovery =
      mode === 'reset' ||
      window.location.hash.includes('type=recovery') ||
      searchParams.get('mode') === 'reset'

    if (!authLoading && user && !isRecovery) {
      navigate('/app', { replace: true })
    }
  }, [user, authLoading, navigate, mode, searchParams])

  const clearMessages = () => {
    setErrorMsg(null)
    setSuccessMsg(null)
  }

  // ─── КРОК 1 реєстрації: перевірка ключа ─────────────────────────────────
  const handleInviteKeyCheck = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()

    const trimmedKey = inviteKey.trim().toUpperCase()
    if (!trimmedKey) {
      setErrorMsg('Будь ласка, введіть ключ запрошення.')
      return
    }

    setIsSubmitting(true)
    const { data: keyOwner, error: keyError } = await supabase
      .from('profiles')
      .select('id')
      .eq('invite_key_generated', trimmedKey)
      .maybeSingle()
    setIsSubmitting(false)

    if (keyError) {
      setErrorMsg('Помилка перевірки ключа. Спробуйте пізніше.')
      return
    }
    if (!keyOwner) {
      setErrorMsg('Ключ запрошення не дійсний або не існує. Перевірте і спробуйте ще раз.')
      return
    }

    // Ключ валідний → переходимо до форми реєстрації
    setMode('register')
    clearMessages()
  }

  // ─── КРОК 2: Реєстрація ──────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()

    if (!nickname.trim()) { setErrorMsg('Будь ласка, введіть нікнейм.'); return }
    if (!email.trim()) { setErrorMsg('Будь ласка, введіть електронну пошту.'); return }
    if (password.length < 6) { setErrorMsg('Пароль має містити щонайменше 6 символів.'); return }
    if (password !== confirmPassword) { setErrorMsg('Введені паролі не збігаються.'); return }
    if (!isCaptchaVerified) { setErrorMsg('Будь ласка, пройдіть перевірку безпеки (капчу).'); return }

    setIsSubmitting(true)
    const res = await signUp(email.trim(), password, nickname.trim(), inviteKey.trim().toUpperCase())
    setIsSubmitting(false)

    if (res.invalidInviteKey) {
      setMode('invite-check')
      setErrorMsg('Ключ запрошення більше не дійсний. Спробуйте ще раз.')
      return
    }

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
        'Реєстрація успішна! Ми надіслали лист для підтвердження на вашу пошту. Перейдіть за посиланням у листі.'
      )
    } else {
      navigate('/app')
    }
  }

  // ─── Вхід у систему ───────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()

    if (!email.trim()) { setErrorMsg('Будь ласка, введіть електронну пошту.'); return }
    if (!password) { setErrorMsg('Будь ласка, введіть пароль.'); return }

    setIsSubmitting(true)
    const res = await signIn(email.trim(), password)
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
    navigate('/app')
  }

  // ─── Відновлення пароля ──────────────────────────────────────────────────
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()
    if (!email.trim()) { setErrorMsg('Будь ласка, введіть електронну пошту.'); return }

    setIsSubmitting(true)
    const res = await resetPassword(email.trim())
    setIsSubmitting(false)

    if (res.error) {
      setErrorMsg(res.error.message || 'Не вдалося надіслати лист. Спробуйте пізніше.')
      return
    }
    setSuccessMsg(
      'Лист із посиланням для відновлення пароля успішно надіслано! Перевірте поштову скриньку (зокрема папку «Спам»).'
    )
  }

  // ─── Встановлення нового пароля ──────────────────────────────────────────
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()
    if (!password) { setErrorMsg('Будь ласка, введіть новий пароль.'); return }
    if (password.length < 6) { setErrorMsg('Пароль має містити щонайменше 6 символів.'); return }
    if (password !== confirmPassword) { setErrorMsg('Введені паролі не збігаються.'); return }

    setIsSubmitting(true)
    const res = await updatePassword(password)
    setIsSubmitting(false)

    if (res.error) {
      setErrorMsg(res.error.message || 'Помилка збереження нового паролю.')
      return
    }
    setSuccessMsg('Пароль успішно оновлено! Перенаправляємо...')
    setTimeout(() => navigate('/app'), 1500)
  }

  const onSubmit =
    mode === 'login' ? handleLogin :
    mode === 'invite-check' ? handleInviteKeyCheck :
    mode === 'register' ? handleRegister :
    mode === 'forgot' ? handleForgot :
    handleReset

  const isTabMode = mode === 'login' || mode === 'invite-check' || mode === 'register'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-200 dark:bg-slate-950 px-4 py-10 transition-colors duration-300">

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ЛОГОТИП — великий, такий самий як у хедері, просто більший         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="mb-8 flex flex-col items-center gap-3 select-none animate-in fade-in slide-in-from-bottom-4 duration-400">
        <CloudSun className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-500 drop-shadow-md" />
        <span className="text-4xl sm:text-5xl tracking-wide flex items-center font-logo">
          <span className="text-slate-700 dark:text-slate-300 font-semibold">Meteo</span>
          <span className="text-emerald-500 font-extrabold">UAV</span>
        </span>
      </div>

      {/* ─── Картка форми ──────────────────────────────────────────────── */}
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all">

          {/* Перемикач Вхід / Реєстрація */}
          {isTabMode && (
            <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-1.5 gap-1.5">
              <button
                type="button"
                onClick={() => { setMode('login'); clearMessages() }}
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
                onClick={() => { setMode('invite-check'); clearMessages() }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  mode === 'invite-check' || mode === 'register'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Реєстрація
              </button>
            </div>
          )}

          {/* Верхній рядок для forgot/reset */}
          {(mode === 'forgot' || mode === 'reset') && (
            <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-4 py-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setMode('login'); clearMessages() }}
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

          {/* Підрядок-бейдж для кроку 2 реєстрації */}
          {mode === 'register' && (
            <div className="border-b border-slate-200 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setMode('invite-check'); clearMessages() }}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Назад
              </button>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Ключ прийнято ·{' '}
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {inviteKey.toUpperCase()}
                </span>
              </span>
            </div>
          )}

          <div className="p-6">
            {/* Заголовок */}
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {mode === 'login' && 'Вхід у систему'}
                {mode === 'invite-check' && 'Ключ запрошення'}
                {mode === 'register' && 'Створення акаунту'}
                {mode === 'forgot' && 'Відновлення пароля'}
                {mode === 'reset' && 'Новий пароль'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {mode === 'login' && 'Увійдіть, щоб отримати доступ до платформи'}
                {mode === 'invite-check' && 'Введіть ключ, отриманий від учасника платформи'}
                {mode === 'register' && 'Заповніть дані для завершення реєстрації'}
                {mode === 'forgot' && 'Введіть пошту — надішлемо посилання для відновлення'}
                {mode === 'reset' && 'Введіть новий надійний пароль для вашого акаунту'}
              </p>
            </div>

            {/* Помилка */}
            {errorMsg && (
              <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-600 dark:text-rose-400 text-sm animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Успіх */}
            {successMsg && (
              <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-emerald-700 dark:text-emerald-400 text-sm animate-in fade-in duration-200">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">

              {/* ─── КРОК 1: Ключ запрошення ─────────────────────────── */}
              {mode === 'invite-check' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Ключ запрошення
                  </label>
                  <div className="relative">
                    <Key className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      value={inviteKey}
                      onChange={(e) => setInviteKey(e.target.value.toUpperCase())}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all font-mono tracking-wider"
                      spellCheck={false}
                      autoComplete="off"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                    Отримайте ключ від діючого учасника платформи MeteoUAV.
                  </p>
                </div>
              )}

              {/* ─── КРОК 2: Форма реєстрації ────────────────────────── */}
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Нікнейм
                    </label>
                    <div className="relative">
                      <UserIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        autoFocus
                        placeholder="Ваш позивний або ім'я"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                      />
                    </div>
                  </div>
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
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Пароль
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Мінімум 6 символів"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-11 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
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
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                      />
                    </div>
                  </div>
                  <div className="pt-1">
                    <Captcha isVerified={isCaptchaVerified} onVerify={(v) => setIsCaptchaVerified(v)} />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center pt-1">
                    Сесія зберігається на пристрої протягом 31 дня.
                  </div>
                </>
              )}

              {/* ─── Вхід ─────────────────────────────────────────────── */}
              {mode === 'login' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Електронна пошта
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        autoFocus
                        placeholder="pilot@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Пароль
                      </label>
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); clearMessages() }}
                        className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                      >
                        Забули пароль?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Введіть пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-11 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center pt-1">
                    Сесія зберігається на пристрої протягом 31 дня.
                  </div>
                </>
              )}

              {/* ─── Forgot ────────────────────────────────────────────── */}
              {mode === 'forgot' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Електронна пошта
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      autoFocus
                      placeholder="pilot@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                    />
                  </div>
                </div>
              )}

              {/* ─── Reset ─────────────────────────────────────────────── */}
              {mode === 'reset' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Новий пароль
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Введіть новий пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-11 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Повторіть пароль
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Повторіть пароль"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ─── Кнопка відправки ─────────────────────────────────── */}
              <button
                type="submit"
                disabled={isSubmitting || (mode === 'register' && !isCaptchaVerified)}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /><span>Обробка...</span></>
                ) : mode === 'login' ? (
                  <><LogIn className="w-5 h-5" /><span>Увійти</span></>
                ) : mode === 'invite-check' ? (
                  <><ArrowRight className="w-5 h-5" /><span>Перевірити ключ</span></>
                ) : mode === 'register' ? (
                  <><UserPlus className="w-5 h-5" /><span>Зареєструватися</span></>
                ) : mode === 'forgot' ? (
                  <><Send className="w-4 h-4" /><span>Надіслати лист</span></>
                ) : (
                  <><KeyRound className="w-5 h-5" /><span>Зберегти новий пароль</span></>
                )}
              </button>

              {mode === 'forgot' && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); clearMessages() }}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                  >
                    Згадали пароль?{' '}
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Увійти</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-slate-500 dark:text-slate-500">
          Реєстрація доступна лише за ключем запрошення від чинного учасника.
        </p>
      </div>
    </div>
  )
}
