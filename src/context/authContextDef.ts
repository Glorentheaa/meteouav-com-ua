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
    nickname: string
  ) => Promise<{ error: Error | null; needsEmailConfirmation?: boolean }>
  signOut: () => Promise<void>
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>
  updateNickname: (newNickname: string) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth повинен використовуватись усередині AuthProvider')
  }
  return context
}
