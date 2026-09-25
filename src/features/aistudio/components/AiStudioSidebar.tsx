import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  MessageSquare,
  Sparkles,
  Settings as SettingsIcon,
  Bot,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  ArrowLeft,
  Check,
  X,
} from 'lucide-react'
import { type AiGem, type AiChatSession } from '../types'
import { GemIcon } from './GemIcon'
import { getInitials } from '../../../utils/gravatar'

interface AiStudioSidebarProps {
  isOpen: boolean
  onToggleOpen: () => void
  gems: AiGem[]
  activeGemId: string
  onSelectGem: (gemId: string) => void
  onOpenGemManager: (gem?: AiGem) => void
  sessions: AiChatSession[]
  activeSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onNewSession: () => void
  onDeleteSession: (sessionId: string) => void
  onRenameSession: (sessionId: string, newTitle: string) => void
  onOpenSettings: () => void
  userProfile?: {
    nickname?: string | null
    avatar_url?: string | null
    is_pro?: boolean
  } | null
}

export const AiStudioSidebar: React.FC<AiStudioSidebarProps> = ({
  isOpen,
  onToggleOpen,
  gems,
  activeGemId,
  onSelectGem,
  onOpenGemManager,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onOpenSettings,
  userProfile,
}) => {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  // Групування сесій: Сьогодні, Вчора, Раніше
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000

  const todaySessions = sessions.filter((s) => s.updatedAt >= todayStart)
  const yesterdaySessions = sessions.filter(
    (s) => s.updatedAt >= yesterdayStart && s.updatedAt < todayStart
  )
  const olderSessions = sessions.filter((s) => s.updatedAt < yesterdayStart)

  const handleStartRename = (session: AiChatSession, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingSessionId(session.id)
    setEditingTitle(session.title)
  }

  const handleSaveRename = (sessionId: string, e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (editingTitle.trim()) {
      onRenameSession(sessionId, editingTitle.trim())
    }
    setEditingSessionId(null)
  }

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingSessionId(null)
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onToggleOpen}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col bg-slate-100 dark:bg-slate-900/95 border-r border-slate-300 dark:border-slate-800 transition-all duration-300 ease-in-out select-none ${
          isOpen ? 'w-72 sm:w-80 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-18'
        }`}
      >
        {/* Верхній рядок: Лого + Перемикач відкриття/згортання */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 text-white shadow-md shadow-sky-500/20 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            {isOpen && (
              <div className="truncate">
                <span className="font-bold text-base bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 dark:from-sky-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  AI Studio
                </span>
                <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  GEMS
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleOpen}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title={isOpen ? 'Згорнути панель' : 'Розгорнути панель'}
          >
            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Кнопка: Новий чат (Gemini Style Pill) */}
        <div className="p-3">
          <button
            type="button"
            onClick={onNewSession}
            className={`flex items-center justify-center gap-2.5 w-full py-2.5 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 shadow-sm hover:shadow transition-all group font-medium text-sm ${
              !isOpen && 'md:p-2.5 md:rounded-xl'
            }`}
            title="Нова сесія"
          >
            <Plus className="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform shrink-0" />
            {isOpen && <span>Новий чат</span>}
          </button>
        </div>

        {/* Прокручуваний контент бічної панелі */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4">
          {/* СЕКЦІЯ 1: ПРОФІЛЬНІ ФАХІВЦІ (GEMS) */}
          <div className="space-y-1">
            {isOpen ? (
              <div className="flex items-center justify-between px-2 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-purple-500" />
                  Фахівці (Gems)
                </span>
                <button
                  type="button"
                  onClick={() => onOpenGemManager()}
                  className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                  title="Додати власного фахівця"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="h-2" />
            )}

            <div className="space-y-0.5">
              {gems.map((gem) => {
                const isActive = gem.id === activeGemId
                return (
                  <div
                    key={gem.id}
                    onClick={() => onSelectGem(gem.id)}
                    className={`group relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer transition-all ${
                      isActive
                        ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800/70'
                    } ${!isOpen && 'justify-center px-1.5'}`}
                    title={`${gem.name} — ${gem.role}`}
                  >
                    <div
                      className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                        isActive
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-300 dark:group-hover:bg-slate-700'
                      }`}
                    >
                      <GemIcon iconName={gem.iconName} className="w-4 h-4" />
                    </div>

                    {isOpen && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs truncate">{gem.name}</p>
                          {!gem.isBuiltIn && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-normal">
                          {gem.role}
                        </p>
                      </div>
                    )}

                    {isOpen && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpenGemManager(gem)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-300/60 dark:hover:bg-slate-700 transition-opacity"
                        title={gem.isBuiltIn ? 'Переглянути інструкції' : 'Редагувати'}
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Розділювач */}
          <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />

          {/* СЕКЦІЯ 2: ЗБЕРЕЖЕНІ СЕСІЇ (SAVED CHATS) */}
          <div className="space-y-2">
            {isOpen && (
              <div className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
                  Сесії ({sessions.length})
                </span>
              </div>
            )}

            {sessions.length === 0 ? (
              isOpen && (
                <div className="px-3 py-4 text-center text-xs text-slate-400">
                  Немає збережених чатів. Натисніть "+ Новий чат", щоб розпочати.
                </div>
              )
            ) : (
              <div className="space-y-3">
                {/* Сьогодні */}
                {todaySessions.length > 0 && (
                  <div>
                    {isOpen && (
                      <div className="px-2 pb-1 text-[11px] font-medium text-slate-400">Сьогодні</div>
                    )}
                    <div className="space-y-0.5">
                      {todaySessions.map((session) => renderSessionItem(session))}
                    </div>
                  </div>
                )}

                {/* Вчора */}
                {yesterdaySessions.length > 0 && (
                  <div>
                    {isOpen && (
                      <div className="px-2 pb-1 text-[11px] font-medium text-slate-400">Вчора</div>
                    )}
                    <div className="space-y-0.5">
                      {yesterdaySessions.map((session) => renderSessionItem(session))}
                    </div>
                  </div>
                )}

                {/* Раніше */}
                {olderSessions.length > 0 && (
                  <div>
                    {isOpen && (
                      <div className="px-2 pb-1 text-[11px] font-medium text-slate-400">Раніше</div>
                    )}
                    <div className="space-y-0.5">
                      {olderSessions.map((session) => renderSessionItem(session))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* НИЖНІЙ БЛОК: НАЛАШТУВАННЯ + ПОВЕРНЕННЯ + ПРОФІЛЬ */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
          {/* Кнопка налаштувань n8n / Моделі */}
          <button
            type="button"
            onClick={onOpenSettings}
            className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors text-xs font-medium ${
              !isOpen && 'justify-center px-1'
            }`}
            title="Налаштування моделі та n8n Webhook"
          >
            <SettingsIcon className="w-4 h-4 text-sky-500 shrink-0" />
            {isOpen && <span>Налаштування n8n & ШІ</span>}
          </button>

          {/* Повернутися на сайт MeteoUAV */}
          <Link
            to="/app"
            className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors text-xs font-medium ${
              !isOpen && 'justify-center px-1'
            }`}
            title="Повернутися до MeteoUAV"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            {isOpen && <span>До застосунку MeteoUAV</span>}
          </Link>

          {/* Профіль користувача */}
          {userProfile && (
            <div
              className={`flex items-center gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/80 ${
                !isOpen && 'justify-center'
              }`}
            >
              {userProfile.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt={userProfile.nickname || 'Користувач'}
                  className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-300 dark:ring-slate-700"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {getInitials(userProfile.nickname || 'К')}
                </div>
              )}
              {isOpen && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {userProfile.nickname || 'Користувач'}
                    </p>
                    {userProfile.is_pro && (
                      <span className="text-[9px] font-bold px-1 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30">
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">Авторизовано</p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  )

  function renderSessionItem(session: AiChatSession) {
    const isSelected = session.id === activeSessionId
    const isEditing = session.id === editingSessionId

    if (isEditing) {
      return (
        <form
          key={session.id}
          onSubmit={(e) => handleSaveRename(session.id, e)}
          className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 rounded-lg border border-sky-500"
        >
          <input
            type="text"
            autoFocus
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
          />
          <button
            type="button"
            onClick={(e) => handleSaveRename(session.id, e)}
            className="p-1 text-emerald-500 hover:text-emerald-600"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleCancelRename}
            className="p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3 h-3" />
          </button>
        </form>
      )
    }

    return (
      <div
        key={session.id}
        onClick={() => onSelectSession(session.id)}
        className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition-all ${
          isSelected
            ? 'bg-slate-200 dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-medium'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
        } ${!isOpen && 'justify-center px-1'}`}
        title={session.title}
      >
        <div className="flex items-center gap-2 min-w-0">
          <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
          {isOpen && <span className="text-xs truncate">{session.title}</span>}
        </div>

        {isOpen && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => handleStartRename(session, e)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              title="Перейменувати"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`Видалити сесію "${session.title}"?`)) {
                  onDeleteSession(session.id)
                }
              }}
              className="p-1 rounded text-slate-400 hover:text-rose-500"
              title="Видалити сесію"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    )
  }
}
