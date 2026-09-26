import React, { useState, useEffect, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../services/supabaseClient'
import { getGravatarUrl } from '../utils/gravatar'
import { AuthContext, type UserProfile } from './authContextDef'

const LOGIN_TIMESTAMP_KEY = 'meteo_auth_login_timestamp'
const SESSION_MAX_AGE_MS = 31 * 24 * 60 * 60 * 1000 // 31 день у мілісекундах

/** Генерує унікальний ключ запрошення формату XXXX-XXXX-XXXX-XXXX */
function generateRandomKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const seg = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${seg()}-${seg()}-${seg()}-${seg()}`
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // Перевірка 31-денного терміну сесії
  const checkSessionExpiry = useCallback(async (): Promise<boolean> => {
    const savedTimestamp = localStorage.getItem(LOGIN_TIMESTAMP_KEY)
    if (!savedTimestamp) return false

    const loginTime = parseInt(savedTimestamp, 10)
    const now = Date.now()
    if (now - loginTime > SESSION_MAX_AGE_MS) {
      console.warn('Термін дії сесії (31 день) закінчився. Виконується вихід.')
      localStorage.removeItem(LOGIN_TIMESTAMP_KEY)
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setProfile(null)
      return true
    }
    return false
  }, [])

  // Отримання профілю користувача з Supabase або фолбек на метадані
  const fetchProfile = useCallback(async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (error) {
        console.warn('Не вдалося завантажити профіль з таблиці profiles:', error.message)
      }

      const nickname =
        data?.nickname ||
        currentUser.user_metadata?.nickname ||
        currentUser.email?.split('@')[0] ||
        'Користувач'

      const userProfile: UserProfile = {
        id: currentUser.id,
        email: currentUser.email ?? null,
        nickname,
        avatar_url: data?.avatar_url || currentUser.user_metadata?.avatar_url || null,
        is_pro: Boolean(data?.is_pro),
        pro_until: data?.pro_until ?? null,
        created_at: data?.created_at || currentUser.created_at,
        invite_key_generated: data?.invite_key_generated ?? null,
        registered_with_key: data?.registered_with_key ?? null,
      }

      setProfile(userProfile)

      // Отримуємо або генеруємо Gravatar URL
      if (currentUser.email) {
        const gravatar = await getGravatarUrl(currentUser.email)
        setAvatarUrl(data?.avatar_url || gravatar)
      }
    } catch (err) {
      console.error('Помилка в fetchProfile:', err)
    }
  }, [])

  // Ініціалізація та підписка на зміни сесії
  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        const isExpired = await checkSessionExpiry()
        if (isExpired) {
          if (mounted) setLoading(false)
          return
        }

        const { data: { session: currentSession } } = await supabase.auth.getSession()

        if (mounted) {
          if (currentSession?.user) {
            setSession(currentSession)
            setUser(currentSession.user)
            await fetchProfile(currentSession.user)
          } else {
            setSession(null)
            setUser(null)
            setProfile(null)
          }
        }
      } catch (e) {
        console.error('Помилка ініціалізації сесії:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return

      if (event === 'SIGNED_OUT' || !newSession) {
        localStorage.removeItem(LOGIN_TIMESTAMP_KEY)
        setUser(null)
        setSession(null)
        setProfile(null)
        setAvatarUrl('')
        setLoading(false)
        return
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        const isExpired = await checkSessionExpiry()
        if (isExpired) return

        if (!localStorage.getItem(LOGIN_TIMESTAMP_KEY)) {
          localStorage.setItem(LOGIN_TIMESTAMP_KEY, Date.now().toString())
        }

        setSession(newSession)
        setUser(newSession.user)
        await fetchProfile(newSession.user)
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [checkSessionExpiry, fetchProfile])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!error && data.session) {
      localStorage.setItem(LOGIN_TIMESTAMP_KEY, Date.now().toString())
      setUser(data.user)
      setSession(data.session)
      if (data.user) {
        await fetchProfile(data.user)
      }
      return { error: null }
    }

    return { error: error ? new Error(error.message) : null }
  }

  const signUp = async (email: string, password: string, nickname: string, inviteKey: string) => {
    // 1. Перевіряємо ключ запрошення в таблиці profiles
    const trimmedKey = inviteKey.trim().toUpperCase()
    if (!trimmedKey) {
      return {
        error: new Error('Необхідно вказати ключ запрошення.'),
        invalidInviteKey: true,
      }
    }

    // Шукаємо ключ у базі (у полі invite_key_generated)
    const { data: keyOwner, error: keyError } = await supabase
      .from('profiles')
      .select('id, invite_key_generated')
      .eq('invite_key_generated', trimmedKey)
      .maybeSingle()

    if (keyError) {
      console.error('Помилка перевірки ключа:', keyError.message)
      return {
        error: new Error('Помилка перевірки ключа запрошення. Спробуйте пізніше.'),
        invalidInviteKey: false,
      }
    }

    if (!keyOwner) {
      return {
        error: new Error('Ключ запрошення не дійсний або не існує.'),
        invalidInviteKey: true,
      }
    }

    // 2. Реєструємо користувача
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname,
        },
      },
    })

    if (error) {
      const msg = error.message.toLowerCase()
      const isAlreadyRegistered =
        msg.includes('already registered') ||
        msg.includes('already exists') ||
        msg.includes('user_already_exists') ||
        msg.includes('already in use')

      return {
        error: new Error(error.message),
        userAlreadyExists: isAlreadyRegistered,
      }
    }

    // Захист від розкриття користувачів у Supabase:
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return {
        error: new Error('Користувач з такою поштою вже існує.'),
        userAlreadyExists: true,
      }
    }

    // 3. Зберігаємо registered_with_key у профілі
    if (data.user) {
      await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: email,
          nickname: nickname,
          registered_with_key: trimmedKey,
        })
    }

    if (data.session && data.user) {
      localStorage.setItem(LOGIN_TIMESTAMP_KEY, Date.now().toString())
      setUser(data.user)
      setSession(data.session)
      await fetchProfile(data.user)
      return { error: null, needsEmailConfirmation: false, userAlreadyExists: false }
    }

    return { error: null, needsEmailConfirmation: true, userAlreadyExists: false }
  }

  const signOut = async () => {
    localStorage.removeItem(LOGIN_TIMESTAMP_KEY)
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
    setAvatarUrl('')
  }

  const resetPassword = async (email: string) => {
    const redirectTo = `${window.location.origin}/auth?mode=reset`
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })
    return { error: error ? new Error(error.message) : null }
  }

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { error: error ? new Error(error.message) : null }
  }

  const updateNickname = async (newNickname: string) => {
    if (!user) return { error: new Error('Користувач не авторизований') }

    const { error: metaError } = await supabase.auth.updateUser({
      data: { nickname: newNickname },
    })

    if (metaError) {
      return { error: new Error(metaError.message) }
    }

    await supabase.from('profiles').update({ nickname: newNickname }).eq('id', user.id)

    setProfile((prev) => (prev ? { ...prev, nickname: newNickname } : null))
    return { error: null }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user)
    }
  }

  /** Генерує унікальний ключ запрошення для поточного користувача (одноразово) */
  const generateInviteKey = async (): Promise<{ key: string | null; error: Error | null }> => {
    if (!user) return { key: null, error: new Error('Користувач не авторизований') }
    if (profile?.invite_key_generated) {
      return { key: profile.invite_key_generated, error: null }
    }

    const newKey = generateRandomKey()

    const { error } = await supabase
      .from('profiles')
      .update({ invite_key_generated: newKey })
      .eq('id', user.id)

    if (error) {
      return { key: null, error: new Error(error.message) }
    }

    setProfile((prev) => (prev ? { ...prev, invite_key_generated: newKey } : null))
    return { key: newKey, error: null }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        avatarUrl,
        loading,
        isPro: Boolean(profile?.is_pro),
        proUntil: profile?.pro_until ?? null,
        signIn,
        signUp,
        signOut,
        updatePassword,
        resetPassword,
        updateNickname,
        refreshProfile,
        generateInviteKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
