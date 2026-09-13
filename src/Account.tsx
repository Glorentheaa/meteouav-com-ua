import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: string
  is_subscribed: boolean
}

export const Account: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/auth')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!error && data) {
        setProfile(data)
      }
      setLoading(false)
    }

    checkUser()
  }, [navigate])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-mono text-sm">
        Завантаження кабінету...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-5">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-white">Кабінет оператора</h2>
          <p className="text-xs text-slate-400">{profile?.email}</p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Позивний / Ім'я:</span>
            <span className="font-semibold text-white">{profile?.full_name || '—'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/60">
            <span className="text-slate-400">Роль:</span>
            <span className="font-mono text-cyan-400 uppercase text-xs px-2 py-0.5 bg-cyan-950/50 rounded">
              {profile?.role || 'pilot'}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Статус:</span>
            <span className={profile?.is_subscribed ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
              {profile?.is_subscribed ? 'Активна підтримка' : 'Базовий доступ'}
            </span>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg transition"
        >
          Вийти з акаунта
        </button>
      </div>
    </main>
  )
}