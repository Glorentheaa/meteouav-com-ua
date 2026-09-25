import React, { useState, useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2, Sparkles } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import {
  type AiGem,
  type AiChatSession,
  type AiStudioSettings,
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
import { AiStudioSettingsModal } from '../features/aistudio/components/AiStudioSettingsModal'
import { GemManagerModal } from '../features/aistudio/components/GemManagerModal'
import { type Theme } from '../components/common/ThemeSwitcher'

export const AiStudio: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth()

  // Тема
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

  // Бічна панель: за замовчуванням відкрита на десктопі
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024
    }
    return true
  })

  // Стан даних AI Studio
  const [settings, setSettings] = useState<AiStudioSettings>(() =>
    AiStudioStorage.getSettings()
  )
  const [gems, setGems] = useState<AiGem[]>(() => AiStudioStorage.getGems())
  const [activeGemId, setActiveGemId] = useState<string>(() =>
    AiStudioStorage.getActiveGemId()
  )
  const [sessions, setSessions] = useState<AiChatSession[]>(() =>
    AiStudioStorage.getSessions()
  )
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() =>
    AiStudioStorage.getActiveSessionId()
  )

  // Модальні вікна
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isGemManagerOpen, setIsGemManagerOpen] = useState(false)
  const [gemToEdit, setGemToEdit] = useState<AiGem | null>(null)

  // Стан запиту
  const [isGenerating, setIsGenerating] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Отримуємо активного фахівця
  const activeGem = gems.find((g) => g.id === activeGemId) || gems[0]

  // Отримуємо активну сесію
  const activeSession = sessions.find((s) => s.id === activeSessionId) || null
  const currentMessages = activeSession?.messages || []

  // Зміна фахівця
  const handleSelectGem = (gemId: string) => {
    setActiveGemId(gemId)
    AiStudioStorage.setActiveGemId(gemId)
  }

  // Створення нової сесії
  const handleNewSession = () => {
    setActiveSessionId(null)
    AiStudioStorage.setActiveSessionId(null)
    // Фокус на поле вводу
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  // Вибір сесії
  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId)
    AiStudioStorage.setActiveSessionId(sessionId)
    const session = sessions.find((s) => s.id === sessionId)
    if (session && session.gemId) {
      setActiveGemId(session.gemId)
      AiStudioStorage.setActiveGemId(session.gemId)
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

  // Збереження фахівця
  const handleSaveGem = (gem: AiGem) => {
    const updated = AiStudioStorage.saveCustomGem(gem)
    setGems(updated)
    setActiveGemId(gem.id)
    AiStudioStorage.setActiveGemId(gem.id)
  }

  // Видалення фахівця
  const handleDeleteGem = (gemId: string) => {
    const updated = AiStudioStorage.deleteCustomGem(gemId)
    setGems(updated)
    if (activeGemId === gemId) {
      setActiveGemId(updated[0].id)
      AiStudioStorage.setActiveGemId(updated[0].id)
    }
  }

  // Збереження налаштувань n8n
  const handleSaveSettings = (newSettings: AiStudioSettings) => {
    setSettings(newSettings)
    AiStudioStorage.saveSettings(newSettings)
  }

  // Відправка повідомлення
  const handleSendMessage = async (
    text: string,
    attachments: AiMessageAttachment[] = []
  ) => {
    if (!text.trim() && attachments.length === 0) return

    // Якщо сесії ще немає — створюємо нову
    let currentSession = activeSession
    let currentSessionId = activeSessionId

    if (!currentSession) {
      const title = text.trim().slice(0, 45) || 'Нова сесія'
      const newSession: AiChatSession = {
        id: `session_${Date.now()}`,
        title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        gemId: activeGem.id,
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

    // Оновлюємо стан відразу для миттєвого відображення
    const updatedList = AiStudioStorage.saveSession(updatedSessionWithUser)
    setSessions(updatedList)

    // Запускаємо генерацію відповіді
    setIsGenerating(true)

    try {
      const response = await sendAiStudioMessage({
        session: updatedSessionWithUser,
        gem: activeGem,
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
        gemId: activeGem.id,
        gemName: activeGem.name,
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
        content: `⚠️ **Помилка отримання відповіді**:\n\n${errorMsg}\n\n*Перевірте налаштування вебхука n8n або доступність мережі в налаштуваннях ⚙️.*`,
        timestamp: Date.now(),
        gemId: activeGem.id,
        gemName: activeGem.name,
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

  // Обробка кліку на швидку підказку зі стартового екрану
  const handleSelectPrompt = (prompt: string) => {
    handleSendMessage(prompt, [])
  }

  // --- ЗАХИСТ СТОРІНКИ (Тільки після авторизації) ---
  if (authLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100">
        <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 mb-4 animate-pulse">
          <Sparkles className="w-8 h-8" />
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-sky-400 mb-2" />
        <p className="text-sm text-slate-400">Перевірка автентифікації AI Studio...</p>
      </div>
    )
  }

  // Якщо користувач не увійшов у систему — блокуємо доступ та перенаправляємо на /auth
  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans">
      {/* Ліва бічна панель (Gemini Sidebar) */}
      <AiStudioSidebar
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        gems={gems}
        activeGemId={activeGemId}
        onSelectGem={handleSelectGem}
        onOpenGemManager={(gem) => {
          setGemToEdit(gem || null)
          setIsGemManagerOpen(true)
        }}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
        userProfile={profile}
      />

      {/* Головна робоча зона */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Верхній заголовок */}
        <AiStudioHeader
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          activeGem={activeGem}
          gems={gems}
          onSelectGem={handleSelectGem}
          onClearChat={handleClearChat}
          hasMessages={currentMessages.length > 0}
          webhookUrl={settings.webhookUrl}
          onOpenSettings={() => setIsSettingsOpen(true)}
          theme={theme}
          onThemeChange={setTheme}
        />

        {/* Область повідомлень */}
        <AiStudioChatArea
          messages={currentMessages}
          activeGem={activeGem}
          userName={profile?.nickname || user.email?.split('@')[0] || 'Пілоте'}
          userAvatar={profile?.avatar_url}
          isGenerating={isGenerating}
          onSelectPrompt={handleSelectPrompt}
          onCopyMessage={(_text) => {
            // Опціональний тост або зворотний зв'язок
          }}
        />

        {/* Плаваюче поле введення Gemini */}
        <AiStudioInput
          inputRef={inputRef}
          onSendMessage={handleSendMessage}
          onStopGeneration={() => setIsGenerating(false)}
          isGenerating={isGenerating}
          activeGem={activeGem}
        />
      </div>

      {/* Модальне вікно налаштувань n8n та моделі */}
      <AiStudioSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* Модальне вікно створення/редагування фахівця (Gems) */}
      <GemManagerModal
        isOpen={isGemManagerOpen}
        onClose={() => setIsGemManagerOpen(false)}
        initialGem={gemToEdit}
        onSaveGem={handleSaveGem}
        onDeleteGem={handleDeleteGem}
      />
    </div>
  )
}

export default AiStudio
