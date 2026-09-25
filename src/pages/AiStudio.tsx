import React, { useState, useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2, CloudSun } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import {
  type AiProfile,
  type AiChatSession,
  type AiChatGroup,
  type AiMessage,
  type AiMessageAttachment,
} from '../features/aistudio/types'
import {
  AiStudioStorage,
  sendAiStudioMessage,
} from '../features/aistudio/services/aiStudioService'
import { AiStudioSidebar } from '../features/aistudio/components/AiStudioSidebar'
import { AiStudioHeader } from '../features/aistudio/components/AiStudioHeader'
import { AiStudioChatArea } from '../features/aistudio/components/AiStudioChatArea'
import { AiStudioInput } from '../features/aistudio/components/AiStudioInput'
import { ProfileManagerModal } from '../features/aistudio/components/ProfileManagerModal'
import { type Theme } from '../components/common/ThemeSwitcher'

export const AiStudio: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth()

  // Керування темою
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system'
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      localStorage.removeItem('theme')
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark')
      }
    } else {
      localStorage.setItem('theme', theme)
      root.classList.add(theme)
    }
  }, [theme])

  // Бічна панель: відкрита за замовчуванням на екранах від 1024px
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024
    }
    return true
  })

  // Стан профілів
  const [profiles, setProfiles] = useState<AiProfile[]>(() =>
    AiStudioStorage.getProfiles()
  )
  const [activeProfileId, setActiveProfileId] = useState<string | null>(() =>
    AiStudioStorage.getActiveProfileId()
  )

  // Стан груп та сесій
  const [groups, setGroups] = useState<AiChatGroup[]>(() =>
    AiStudioStorage.getGroups()
  )
  const [sessions, setSessions] = useState<AiChatSession[]>(() =>
    AiStudioStorage.getSessions()
  )
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() =>
    AiStudioStorage.getActiveSessionId()
  )

  // Модальне вікно редагування / створення профілю
  const [isProfileManagerOpen, setIsProfileManagerOpen] = useState(false)
  const [profileToEdit, setProfileToEdit] = useState<AiProfile | null>(null)

  // Стан генерації
  const [isGenerating, setIsGenerating] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Активний профіль (може бути null, якщо не обрано)
  const activeProfile =
    profiles.find((p) => p.id === activeProfileId) || null

  // Активна сесія
  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || null
  const currentMessages = activeSession?.messages || []

  // Накопичений підрахунок токенів за поточну сесію
  const sessionTokenUsage = currentMessages.reduce(
    (acc, msg) => {
      if (msg.role === 'assistant' && msg.usage) {
        acc.inputTokens += msg.usage.inputTokens
        acc.outputTokens += msg.usage.outputTokens
        acc.totalTokens += msg.usage.totalTokens
      }
      return acc
    },
    { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
  )

  // Зміна активного профілю
  const handleSelectProfile = (profileId: string | null) => {
    setActiveProfileId(profileId)
    AiStudioStorage.setActiveProfileId(profileId)
  }

  // Новий чат (скидання активної сесії до початкового стану)
  const handleNewSession = () => {
    setActiveSessionId(null)
    AiStudioStorage.setActiveSessionId(null)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  // Вибір сесії
  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId)
    AiStudioStorage.setActiveSessionId(sessionId)
    const session = sessions.find((s) => s.id === sessionId)
    if (session) {
      if (session.profileId) {
        setActiveProfileId(session.profileId)
        AiStudioStorage.setActiveProfileId(session.profileId)
      } else {
        setActiveProfileId(null)
        AiStudioStorage.setActiveProfileId(null)
      }
    }
  }

  // Видалення сесії
  const handleDeleteSession = (sessionId: string) => {
    const updated = AiStudioStorage.deleteSession(sessionId)
    setSessions(updated)
    if (activeSessionId === sessionId) {
      setActiveSessionId(null)
      AiStudioStorage.setActiveSessionId(null)
    }
  }

  // Перейменування сесії
  const handleRenameSession = (sessionId: string, newTitle: string) => {
    const session = sessions.find((s) => s.id === sessionId)
    if (session) {
      const updatedSession = { ...session, title: newTitle }
      const updatedList = AiStudioStorage.saveSession(updatedSession)
      setSessions(updatedList)
    }
  }

  // Переміщення сесії в іншу папку / корінь
  const handleMoveSession = (sessionId: string, targetGroupId: string | null) => {
    const updatedList = AiStudioStorage.moveSessionToGroup(sessionId, targetGroupId)
    setSessions(updatedList)
  }

  // Створення кастомної групи/папки
  const handleCreateGroup = (name: string) => {
    const updated = AiStudioStorage.createGroup(name)
    setGroups(updated)
  }

  // Перейменування групи
  const handleRenameGroup = (groupId: string, newName: string) => {
    const updated = AiStudioStorage.renameGroup(groupId, newName)
    setGroups(updated)
  }

  // Видалення групи
  const handleDeleteGroup = (groupId: string) => {
    const updatedGroups = AiStudioStorage.deleteGroup(groupId)
    setGroups(updatedGroups)
    setSessions(AiStudioStorage.getSessions())
  }

  // Очищення поточного діалогу
  const handleClearChat = () => {
    if (!activeSessionId) return
    if (confirm('Очистити всі повідомлення в цьому чаті?')) {
      const session = sessions.find((s) => s.id === activeSessionId)
      if (session) {
        const updatedSession: AiChatSession = {
          ...session,
          messages: [],
          updatedAt: Date.now(),
        }
        const updatedList = AiStudioStorage.saveSession(updatedSession)
        setSessions(updatedList)
      }
    }
  }

  // Збереження профілю
  const handleSaveProfile = (p: AiProfile) => {
    const updated = AiStudioStorage.saveProfile(p)
    setProfiles(updated)
    setActiveProfileId(p.id)
    AiStudioStorage.setActiveProfileId(p.id)
  }

  // Видалення профілю
  const handleDeleteProfile = (profileId: string) => {
    const updated = AiStudioStorage.deleteProfile(profileId)
    setProfiles(updated)
    if (activeProfileId === profileId) {
      setActiveProfileId(null)
      AiStudioStorage.setActiveProfileId(null)
    }
  }

  // Відправка повідомлення на n8n webhook
  const handleSendMessage = async (
    text: string,
    attachments: AiMessageAttachment[] = []
  ) => {
    if (!text.trim() && attachments.length === 0) return

    let currentSession = activeSession
    let currentSessionId = activeSessionId

    // Якщо сесії ще немає — створюємо нову
    if (!currentSession) {
      const title = text.trim().slice(0, 45) || 'Новий діалог'
      const newSession: AiChatSession = {
        id: `session_${Date.now()}`,
        title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        profileId: activeProfile?.id || null,
        groupId: null, // Усі нові чати спочатку йдуть у "Збережені чати", користувач сам переміщує
        messages: [],
      }
      currentSession = newSession
      currentSessionId = newSession.id
      setActiveSessionId(currentSessionId)
      AiStudioStorage.setActiveSessionId(currentSessionId)
    }

    const userMessage: AiMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments,
    }

    const updatedMessagesWithUser = [...currentSession.messages, userMessage]
    const updatedSessionWithUser: AiChatSession = {
      ...currentSession,
      messages: updatedMessagesWithUser,
      updatedAt: Date.now(),
    }

    const updatedList = AiStudioStorage.saveSession(updatedSessionWithUser)
    setSessions(updatedList)

    setIsGenerating(true)

    try {
      const response = await sendAiStudioMessage({
        session: updatedSessionWithUser,
        profile: activeProfile,
        userMessage: text,
        attachments: attachments.map((a) => ({
          name: a.name,
          type: a.type,
          size: a.size,
        })),
        userProfile: profile
          ? {
              id: profile.id,
              nickname: profile.nickname || 'Користувач',
              email: profile.email,
              isPro: profile.is_pro,
            }
          : undefined,
      })

      const assistantMessage: AiMessage = {
        id: `msg_ai_${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        profileId: activeProfile?.id || null,
        profileName: activeProfile?.name || null,
        usage: response.usage || null,
      }

      const finalSession: AiChatSession = {
        ...updatedSessionWithUser,
        messages: [...updatedMessagesWithUser, assistantMessage],
        updatedAt: Date.now(),
      }

      const finalSessionsList = AiStudioStorage.saveSession(finalSession)
      setSessions(finalSessionsList)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      const errorMessage: AiMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Помилка зв'язку з n8n**:\n\n${errorMsg}`,
        timestamp: Date.now(),
        profileId: activeProfile?.id || null,
        profileName: activeProfile?.name || null,
        isError: true,
      }

      const errorSession: AiChatSession = {
        ...updatedSessionWithUser,
        messages: [...updatedMessagesWithUser, errorMessage],
        updatedAt: Date.now(),
      }

      const errorSessionsList = AiStudioStorage.saveSession(errorSession)
      setSessions(errorSessionsList)
    } finally {
      setIsGenerating(false)
    }
  }

  // Захист сторінки (тільки після успішного входу)
  if (authLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-200 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow text-emerald-500 mb-4 animate-pulse">
          <CloudSun className="w-8 h-8" />
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mb-2" />
        <p className="text-sm text-slate-500">Авторизація AI Studio...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-slate-200 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans">
      {/* Ліва бічна панель (Історія чатів, папки, без профілів) */}
      <AiStudioSidebar
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        sessions={sessions}
        groups={groups}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onMoveSession={handleMoveSession}
        onCreateGroup={handleCreateGroup}
        onRenameGroup={handleRenameGroup}
        onDeleteGroup={handleDeleteGroup}
        userProfile={profile}
      />

      {/* Головна робоча область */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Верхній заголовок: кнопка панелі, логотип, спадне меню профілів */}
        <AiStudioHeader
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          activeProfile={activeProfile}
          profiles={profiles}
          onSelectProfile={handleSelectProfile}
          onOpenProfileManager={(p) => {
            setProfileToEdit(p || null)
            setIsProfileManagerOpen(true)
          }}
          onClearChat={handleClearChat}
          hasMessages={currentMessages.length > 0}
          theme={theme}
          onThemeChange={setTheme}
        />

        {/* Область повідомлень */}
        <AiStudioChatArea
          messages={currentMessages}
          activeProfile={activeProfile}
          userName={profile?.nickname || user.email?.split('@')[0] || 'Користувачу'}
          userAvatar={profile?.avatar_url}
          isGenerating={isGenerating}
          sessionTokenUsage={sessionTokenUsage}
          onCopyMessage={(_text) => {}}
        />

        {/* Поле введення */}
        <AiStudioInput
          inputRef={inputRef}
          onSendMessage={handleSendMessage}
          onStopGeneration={() => setIsGenerating(false)}
          isGenerating={isGenerating}
          activeProfile={activeProfile}
        />
      </div>

      {/* Модальне вікно створення / редагування профілю */}
      <ProfileManagerModal
        isOpen={isProfileManagerOpen}
        onClose={() => setIsProfileManagerOpen(false)}
        initialProfile={profileToEdit}
        onSaveProfile={handleSaveProfile}
        onDeleteProfile={handleDeleteProfile}
      />
    </div>
  )
}

export default AiStudio
