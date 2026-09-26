import { createContext, useContext } from 'react'
import type { User, Session } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string | null
  nickname: string | null
  avatar_url: string | null
  is_pro: boolean
  pro_until: string | null
  created_at?: string
  // Поля системи запрошень
  invite_key_generated?: string | null    // Ключ, який згенерував цей користувач (або null)
  registered_with_key?: string | null     // Ключ, з яким зареєструвався цей користувач
}

export interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  avatarUrl: string
  loading: boolean
  isPro: boolean
  proUntil: string | null
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (
    email: string,
    password: string,
    nickname: string,
    inviteKey: string
  ) => Promise<{
    error: Error | null
    needsEmailConfirmation?: boolean
    userAlreadyExists?: boolean
    invalidInviteKey?: boolean
  }>
  signOut: () => Promise<void>
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updateNickname: (newNickname: string) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
  generateInviteKey: () => Promise<{ key: string | null; error: Error | null }>
  validateInviteKey: (inviteKey: string) => Promise<{ valid: boolean; error: Error | null }>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth повинен використовуватись усередині AuthProvider')
  }
  return context
}
