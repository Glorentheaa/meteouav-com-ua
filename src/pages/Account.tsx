import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User as UserIcon,
  Mail,
  Calendar,
  KeyRound,
  MapPin,
  Heart,
  Crown,
  LogOut,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit2,
  Check,
  X,
  Map,
  Copy,
  Ticket,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { getInitials } from '../utils/gravatar'
import { getStoredLocations } from '../features/meteo/utils/geoUtils'

export const Account: React.FC = () => {
  const navigate = useNavigate()
  const {
    user,
    profile,
    avatarUrl,
    loading,
    isPro,
    proUntil,
    signOut,
    updatePassword,
    updateNickname,
    generateInviteKey,
  } = useAuth()

  // Стан форми зміни пароля
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Стан редагування нікнейму
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [nicknameInput, setNicknameInput] = useState('')
  const [isSavingNickname, setIsSavingNickname] = useState(false)

  // Стан генерації ключа запрошення
  const [isGeneratingKey, setIsGeneratingKey] = useState(false)
  const [keyCopied, setKeyCopied] = useState(false)
  const [keyError, setKeyError] = useState<string | null>(null)

  // Якщо дані ще завантажуються
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  // Якщо користувач не увійшов
  if (!user) {
    return (
      <div className="w-full max-w-md mx-auto py-12 px-4 text-center">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <UserIcon className="w-8 h-8" />
          </div>

          {/* ========================================================================= */}
          {/* [STATIC_TEXT] ПОВІДОМЛЕННЯ ДЛЯ НЕАВТОРИЗОВАНОГО КОРИСТУВАЧА               */}
          {/* ========================================================================= */}
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Ви не авторизовані
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Увійдіть або створіть новий акаунт, щоб керувати профілем та збереженими точками.
          </p>

          {/* ========================================================================= */}
          {/* [STATIC_TEXT] КНОПКА ПЕРЕХОДУ НА СТОРІНКУ АВТОРИЗАЦІЇ                     */}
          {/* ========================================================================= */}
          <Link
            to="/auth"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow transition-all"
          >
            Авторизуватись
          </Link>
        </div>
      </div>
    )
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordStatus(null)

    if (newPassword.length < 6) {
      setPasswordStatus({
        type: 'error',
        text: 'Новий пароль повинен містити не менше 6 символів.',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({
        type: 'error',
        text: 'Паролі не збігаються.',
      })
      return
    }

    setIsChangingPassword(true)
    const { error } = await updatePassword(newPassword)
    setIsChangingPassword(false)

    if (error) {
      setPasswordStatus({
        type: 'error',
        text: error.message || 'Помилка зміни паролю.',
      })
    } else {
      setPasswordStatus({
        type: 'success',
        text: 'Пароль успішно змінено!',
      })
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const handleStartEditNickname = () => {
    setNicknameInput(profile?.nickname || '')
    setIsEditingNickname(true)
  }

  const handleSaveNickname = async () => {
    if (!nicknameInput.trim()) return
    setIsSavingNickname(true)
    await updateNickname(nicknameInput.trim())
    setIsSavingNickname(false)
    setIsEditingNickname(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleGenerateInviteKey = async () => {
    setIsGeneratingKey(true)
    setKeyError(null)
    const { key, error } = await generateInviteKey()
    setIsGeneratingKey(false)
    if (error) {
      setKeyError(error.message)
    }
    // key буде оновлено через profile
    void key
  }

  const handleCopyInviteKey = () => {
    if (!profile?.invite_key_generated) return
    navigator.clipboard.writeText(profile.invite_key_generated)
    setKeyCopied(true)
    setTimeout(() => setKeyCopied(false), 2000)
  }

  // Форматування дати створення акаунта
  const registrationDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '—'

  // Форматування дати закінчення PRO
  const proExpirationDate = proUntil
    ? new Date(proUntil).toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 py-4">
      {/* ========================================================================= */}
      {/* [STATIC_TEXT] ШАПКА КАБІНЕТУ КОРИСТУВАЧА                                  */}
      {/* ========================================================================= */}
      <header className="border-b border-slate-300 dark:border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Мій акаунт</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Керування реєстраційними даними та безпекою.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl transition-colors border border-rose-200 dark:border-rose-900/50"
        >
          <LogOut className="w-4 h-4" />
          <span>Вийти</span>
        </button>
      </header>

      {/* ========================================================================= */}
      {/* [STATIC_TEXT] БЛОК 1: ДАНІ ПРОФІЛЮ ТА АВАТАРКА GRAVATAR                   */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Аватар з Gravatar за адресою пошти */}
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500 shadow-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={profile?.nickname || 'Avatar'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Якщо Gravatar не завантажився — показуємо заглушку
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <span className="text-2xl font-bold text-slate-700 dark:text-slate-200">
                  {getInitials(profile?.nickname || user.email)}
                </span>
              )}
            </div>
            {isPro && (
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full shadow border-2 border-white dark:border-slate-900">
                <Crown className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              {isEditingNickname ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    className="px-3 py-1 text-lg font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNickname}
                    disabled={isSavingNickname}
                    className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    title="Зберегти"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingNickname(false)}
                    className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300"
                    title="Скасувати"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {profile?.nickname || 'Користувач'}
                  </h2>
                  <button
                    type="button"
                    onClick={handleStartEditNickname}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    title="Змінити нікнейм"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-slate-600 dark:text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-emerald-500" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span>Зареєстровано: {registrationDate}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Аватарка прив'язана до вашої поштової скриньки через сервіс Gravatar.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* [STATIC_TEXT] БЛОК 2: СТАТУС PRO / КНОПКА ДОПОМОГИ ПРОЄКТУ                */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
        {isPro ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border border-amber-500/30">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-slate-950">
                  <Crown className="w-3.5 h-3.5" /> PRO Статус
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Активний
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 pt-1">
                {proExpirationDate
                  ? `Доступ діє до: ${proExpirationDate}`
                  : 'Безстроковий преміум доступ'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Дякуємо вам за відчутну підтримку розвитку комплексу MeteoUAV!
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Базовий статус
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Допоможіть підтримати проект
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md">
                Ваші донати допомагають оплачувати погодні сервери та розвивати нові модулі для пілотів. Отримайте PRO статус для свого акаунту.
              </p>
            </div>
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow transition-all shrink-0"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Підтримати проект</span>
            </Link>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* [STATIC_TEXT] БЛОК 3: КЕРУВАННЯ ЗБЕРЕЖЕНИМИ ЛОКАЦІЯМИ                     */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <MapPin className="w-5 h-5 text-emerald-500" />
              <span>Керування збереженими локаціями ({getStoredLocations().length})</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg">
              Налаштуйте список улюблених позицій та тактичних секторів для швидкого вибору у погодній консолі.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              to="/map?returnTo=/account"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-500/30 hover:bg-emerald-100 transition-colors"
            >
              <Map className="w-3.5 h-3.5" />
              <span>Мапа</span>
            </Link>
            <Link
              to="/settings"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            >
              <span>Налаштування місць</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Список закріплених секторів для швидкого перегляду */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
          {getStoredLocations().map((loc) => (
            <div
              key={loc.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
            >
              <span className="font-semibold text-slate-700 dark:text-slate-300">{loc.name}</span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                [{loc.sectorId}]
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* [STATIC_TEXT] БЛОК 4: ФОРМА ЗМІНИ ПАРОЛЯ                                  */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <KeyRound className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Зміна пароля</h2>
        </div>

        {passwordStatus && (
          <div
            className={`p-3.5 rounded-xl flex items-start gap-2.5 text-sm ${
              passwordStatus.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400'
            }`}
          >
            {passwordStatus.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <span>{passwordStatus.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Новий пароль
            </label>
            <input
              type="password"
              required
              placeholder="Мінімум 6 символів"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Повторіть новий пароль
            </label>
            <input
              type="password"
              required
              placeholder="Підтвердження нового паролю"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-semibold rounded-xl shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Оновлення...</span>
              </>
            ) : (
              <span>Оновити пароль</span>
            )}
          </button>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* БЛОК 5: СИСТЕМА КЛЮЧІВ ЗАПРОШЕНЬ                                          */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
          <Ticket className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ключ запрошення</h2>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          Кожен учасник може згенерувати один ключ запрошення та передати його довіреній людині.
          Ключ закріплюється за вашим акаунтом назавжди.
        </p>

        {keyError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-600 dark:text-rose-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{keyError}</span>
          </div>
        )}

        {profile?.invite_key_generated ? (
          // Ключ вже згенеровано — показуємо його
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-sm text-slate-800 dark:text-slate-200 tracking-wider select-all">
              {profile.invite_key_generated}
            </div>
            <button
              type="button"
              onClick={handleCopyInviteKey}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow transition-all"
              title="Скопіювати ключ"
            >
              {keyCopied ? (
                <><Check className="w-4 h-4" /><span>Скопійовано</span></>
              ) : (
                <><Copy className="w-4 h-4" /><span>Копіювати</span></>
              )}
            </button>
          </div>
        ) : (
          // Ключ ще не згенеровано — показуємо кнопку
          <button
            type="button"
            onClick={handleGenerateInviteKey}
            disabled={isGeneratingKey}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-semibold rounded-xl shadow transition-all disabled:opacity-50"
          >
            {isGeneratingKey ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Генерація...</span></>
            ) : (
              <><Ticket className="w-4 h-4" /><span>Згенерувати ключ запрошення</span></>
            )}
          </button>
        )}

        {profile?.registered_with_key && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Ви зареєструвались за ключем: <span className="font-mono">{profile.registered_with_key}</span>
          </p>
        )}
      </div>

      {/* 6. Додаткова інформація про сесію */}
      <div className="text-center text-xs text-slate-400 dark:text-slate-500 pb-4">
        Тривалість поточної сесії авторизації: 31 день від моменту входу.
      </div>
    </div>
  )
}
