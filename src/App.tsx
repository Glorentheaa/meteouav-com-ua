import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { Auth } from './Auth'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: string
  is_subscribed: boolean
}

export function App() {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err) {
      console.error('Помилка завантаження профілю:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-mono text-sm">
        Завантаження системи...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center space-y-2">
        <span className="px-3 py-1 bg-cyan-950/60 border border-cyan-800 text-cyan-400 text-xs tracking-widest uppercase font-mono rounded-full">
          MeteoUAV Platform
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Метеосервіс БпЛА
        </h1>
      </div>

      {!session ? (
        <Auth onSuccess={() => {}} />
      ) : (
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-5">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white">Кабінет оператора</h2>
            <p className="text-xs text-slate-400">{profile?.email || session.user.email}</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Позивний:</span>
              <span className="font-semibold text-white">{profile?.full_name || '—'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Роль:</span>
              <span className="font-mono text-cyan-400 uppercase text-xs px-2 py-0.5 bg-cyan-950/50 rounded">
                {profile?.role || 'pilot'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Статус підписки:</span>
              <span className={profile?.is_subscribed ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
                {profile?.is_subscribed ? "Активна" : "Базовий доступ"}
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
      )}
    </main>
  )
}

export default App