import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderPlus,
  FolderOpen,
  Trash2,
  Edit2,
  ArrowLeft,
  Check,
  X,
  CornerDownRight,
  PanelLeftClose,
} from 'lucide-react'
import {
  type AiProfile,
  type AiChatSession,
  type AiChatGroup,
} from '../types'
import { GemIcon } from './GemIcon'
import { getInitials } from '../../../utils/gravatar'

interface AiStudioSidebarProps {
  isOpen: boolean
  onToggleOpen: () => void
  profiles: AiProfile[]
  sessions: AiChatSession[]
  groups: AiChatGroup[]
  activeSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onNewSession: () => void
  onDeleteSession: (sessionId: string) => void
  onRenameSession: (sessionId: string, newTitle: string) => void
  onMoveSession: (sessionId: string, targetGroupId: string | null) => void
  onCreateGroup: (name: string) => void
  onRenameGroup: (groupId: string, newName: string) => void
  onDeleteGroup: (groupId: string) => void
  userProfile?: {
    nickname?: string | null
    avatar_url?: string | null
    is_pro?: boolean
  } | null
}

export const AiStudioSidebar: React.FC<AiStudioSidebarProps> = ({
  isOpen,
  onToggleOpen,
  profiles,
  sessions,
  groups,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onMoveSession,
  onCreateGroup,
  onRenameGroup,
  onDeleteGroup,
  userProfile,
}) => {
  // Стани редагування
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editingSessionTitle, setEditingSessionTitle] = useState('')
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingGroupTitle, setEditingGroupTitle] = useState('')
  const [movingSessionId, setMovingSessionId] = useState<string | null>(null)

  // Стан згорнутих папок (за замовчуванням усі відкриті)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }))
  }

  // Обробка створення кастомної папки
  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newFolderName.trim()) {
      onCreateGroup(newFolderName.trim())
      setNewFolderName('')
      setIsCreatingFolder(false)
    }
  }

  // Обробка збереження назви чату
  const handleSaveSessionRename = (sessionId: string, e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (editingSessionTitle.trim()) {
      onRenameSession(sessionId, editingSessionTitle.trim())
    }
    setEditingSessionId(null)
  }

  // Обробка збереження назви групи
  const handleSaveGroupRename = (groupId: string, e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (editingGroupTitle.trim()) {
      onRenameGroup(groupId, editingGroupTitle.trim())
    }
    setEditingGroupId(null)
  }

  // 1. Кореневі чати: або явно без папки, або базової моделі (якщо немає іншої призначеної групи)
  const rootSessions = sessions.filter((s) => {
    if (s.groupId) return false
    return true
  })

  // 2. Папки профілів (автопапки для кожного профілю крім базової моделі)
  const nonGeneralProfiles = profiles.filter((p) => p.id !== 'general-profile')

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggleOpen}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Головний контейнер сайдбару */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col bg-slate-200 dark:bg-slate-950 border-r border-slate-300 dark:border-slate-800 transition-all duration-300 ease-in-out select-none ${
          isOpen
            ? 'w-72 sm:w-80 translate-x-0'
            : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden md:border-r-0'
        }`}
      >
        {/* Верхня панель сайдбару: Заголовок + Згорнути */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-300 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Збережені чати
            </span>
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {sessions.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleOpen}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors"
            title="Згорнути панель"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* Кнопки дій: Новий чат + Нова папка */}
        <div className="p-3 space-y-2 border-b border-slate-300/70 dark:border-slate-800/80">
          <button
            type="button"
            onClick={onNewSession}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm hover:shadow transition-all group"
            title="Почати нову сесію"
          >
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Новий чат</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreatingFolder(true)}
            className="flex items-center justify-center gap-2 w-full py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-800 font-medium text-xs transition-colors"
            title="Створити нову папку для сортування чатів"
          >
            <FolderPlus className="w-3.5 h-3.5 text-emerald-500" />
            <span>+ Створити папку</span>
          </button>

          {/* Форма швидкого створення папки */}
          {isCreatingFolder && (
            <form
              onSubmit={handleCreateGroupSubmit}
              className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-emerald-500 shadow-sm space-y-2 animate-in fade-in duration-150"
            >
              <input
                type="text"
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Назва нової папки..."
                className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none"
              />
              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingFolder(false)
                    setNewFolderName('')
                  }}
                  className="px-2 py-0.5 text-xs text-slate-500 hover:text-slate-700"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-0.5 text-xs bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700"
                >
                  Створити
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Прокручуваний список чатів з папками */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {/* СЕКЦІЯ 1: КАСТОМНІ ПАПКИ КОРИСТУВАЧА */}
          {groups.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Мої папки
              </div>
              {groups.map((group) => {
                const groupSessions = sessions.filter((s) => s.groupId === group.id)
                const isCollapsed = Boolean(collapsedGroups[group.id])
                const isEditingThisGroup = editingGroupId === group.id

                return (
                  <div key={group.id} className="rounded-xl overflow-hidden">
                    {/* Заголовок папки */}
                    {isEditingThisGroup ? (
                      <form
                        onSubmit={(e) => handleSaveGroupRename(group.id, e)}
                        className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 rounded-lg border border-emerald-500"
                      >
                        <input
                          type="text"
                          autoFocus
                          value={editingGroupTitle}
                          onChange={(e) => setEditingGroupTitle(e.target.value)}
                          className="flex-1 text-xs bg-transparent px-1 text-slate-800 dark:text-slate-100 outline-none"
                        />
                        <button
                          type="submit"
                          className="p-1 text-emerald-500 hover:text-emerald-600"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingGroupId(null)}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </form>
                    ) : (
                      <div
                        onClick={() => toggleGroupCollapse(group.id)}
                        className="group flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-300/70 dark:hover:bg-slate-900 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isCollapsed ? (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          {isCollapsed ? (
                            <Folder className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <FolderOpen className="w-4 h-4 text-emerald-500 shrink-0" />
                          )}
                          <span className="truncate">{group.name}</span>
                          <span className="text-[10px] font-normal text-slate-400">
                            ({groupSessions.length})
                          </span>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingGroupId(group.id)
                              setEditingGroupTitle(group.name)
                            }}
                            className="p-1 hover:text-slate-900 dark:hover:text-slate-100"
                            title="Перейменувати папку"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm(`Видалити папку "${group.name}"? Чати перейдуть у корінь.`)) {
                                onDeleteGroup(group.id)
                              }
                            }}
                            className="p-1 hover:text-rose-500"
                            title="Видалити папку"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Вміст папки */}
                    {!isCollapsed && (
                      <div className="pl-4 pr-1 py-0.5 space-y-0.5 border-l-2 border-emerald-500/20 ml-3.5 my-0.5">
                        {groupSessions.length === 0 ? (
                          <div className="px-2 py-1 text-[11px] text-slate-400 italic">
                            Папка порожня
                          </div>
                        ) : (
                          groupSessions.map((session) => renderSessionItem(session))
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* СЕКЦІЯ 2: АВТОМАТИЧНІ ПАПКИ ПРОФІЛІВ */}
          <div className="space-y-1">
            <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Папки профілів
            </div>

            {nonGeneralProfiles.map((profile) => {
              // Чати цього профілю, що зберігаються в його папці (або без кастомної групи)
              const profileSessions = sessions.filter(
                (s) => s.profileId === profile.id && (!s.groupId || s.groupId === `profile_${profile.id}`)
              )
              const folderId = `profile_folder_${profile.id}`
              const isCollapsed = Boolean(collapsedGroups[folderId])

              return (
                <div key={profile.id} className="rounded-xl overflow-hidden">
                  {/* Заголовок папки профілю */}
                  <div
                    onClick={() => toggleGroupCollapse(folderId)}
                    className="group flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-300/70 dark:hover:bg-slate-900 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <div className="p-1 rounded-md bg-slate-300 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <GemIcon iconName={profile.iconName} className="w-3 h-3" />
                      </div>
                      <span className="truncate">{profile.name}</span>
                      <span className="text-[10px] font-normal text-slate-400">
                        ({profileSessions.length})
                      </span>
                    </div>
                  </div>

                  {/* Список чатів усередині папки профілю */}
                  {!isCollapsed && (
                    <div className="pl-4 pr-1 py-0.5 space-y-0.5 border-l-2 border-slate-300 dark:border-slate-800 ml-3.5 my-0.5">
                      {profileSessions.length === 0 ? (
                        <div className="px-2 py-1 text-[11px] text-slate-400 italic">
                          Немає чатів з цим профілем
                        </div>
                      ) : (
                        profileSessions.map((session) => renderSessionItem(session))
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* СЕКЦІЯ 3: КОРЕНЕВІ ЧАТИ (БАЗОВА МОДЕЛЬ / БЕЗ ПАПКИ) */}
          <div className="space-y-1">
            <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Базові чати (Корінь)</span>
              <span className="text-[10px] font-normal text-slate-400">
                ({rootSessions.filter((s) => s.profileId === 'general-profile').length})
              </span>
            </div>

            {rootSessions.filter((s) => s.profileId === 'general-profile').length === 0 ? (
              <div className="px-3 py-2 text-center text-xs text-slate-400">
                Немає базових чатів
              </div>
            ) : (
              <div className="space-y-0.5">
                {rootSessions
                  .filter((s) => s.profileId === 'general-profile')
                  .map((session) => renderSessionItem(session))}
              </div>
            )}
          </div>
        </div>

        {/* НИЖНЯ ПАНЕЛЬ: ПРОФІЛЬ + ПОВЕРНЕННЯ ДО METEOUAV */}
        <div className="p-3 border-t border-slate-300 dark:border-slate-800 space-y-2 bg-slate-200/60 dark:bg-slate-950">
          <Link
            to="/app"
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-300/80 dark:hover:bg-slate-900 transition-colors text-xs font-semibold"
            title="Повернутися до застосунку MeteoUAV"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>До MeteoUAV</span>
          </Link>

          {userProfile && (
            <div className="flex items-center gap-2.5 pt-2 border-t border-slate-300/70 dark:border-slate-800/80">
              {userProfile.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt={userProfile.nickname || 'Користувач'}
                  className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-400 dark:ring-slate-700"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {getInitials(userProfile.nickname || 'К')}
                </div>
              )}
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
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  Авторизований сеанс
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )

  // Функція рендерингу одного елемента чату
  function renderSessionItem(session: AiChatSession) {
    const isSelected = session.id === activeSessionId
    const isEditing = session.id === editingSessionId
    const isMoving = session.id === movingSessionId

    if (isEditing) {
      return (
        <form
          key={session.id}
          onSubmit={(e) => handleSaveSessionRename(session.id, e)}
          className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-900 rounded-lg border border-emerald-500"
        >
          <input
            type="text"
            autoFocus
            value={editingSessionTitle}
            onChange={(e) => setEditingSessionTitle(e.target.value)}
            className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
          />
          <button
            type="button"
            onClick={(e) => handleSaveSessionRename(session.id, e)}
            className="p-1 text-emerald-500 hover:text-emerald-600"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setEditingSessionId(null)}
            className="p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3 h-3" />
          </button>
        </form>
      )
    }

    return (
      <div key={session.id} className="relative group">
        <div
          onClick={() => onSelectSession(session.id)}
          className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition-all ${
            isSelected
              ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-semibold'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300/60 dark:hover:bg-slate-900/60'
          }`}
          title={session.title}
        >
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
            <span className="text-xs truncate">{session.title}</span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Кнопка переміщення в іншу папку */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setMovingSessionId(isMoving ? null : session.id)
              }}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              title="Перемістити в іншу папку"
            >
              <CornerDownRight className="w-3 h-3" />
            </button>

            {/* Перейменувати */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setEditingSessionId(session.id)
                setEditingSessionTitle(session.title)
              }}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              title="Перейменувати"
            >
              <Edit2 className="w-3 h-3" />
            </button>

            {/* Видалити */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`Видалити сесію "${session.title}"?`)) {
                  onDeleteSession(session.id)
                }
              }}
              className="p-1 rounded text-slate-400 hover:text-rose-500"
              title="Видалити"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Спливаюче меню вибору папки для переміщення */}
        {isMoving && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-4 right-4 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl shadow-xl p-2 z-30 space-y-1 text-xs animate-in fade-in duration-100"
          >
            <div className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 uppercase">
              Перемістити у:
            </div>
            <button
              type="button"
              onClick={() => {
                onMoveSession(session.id, null)
                setMovingSessionId(null)
              }}
              className="w-full text-left px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
            >
              <Folder className="w-3 h-3 text-slate-400" />
              <span>Корінь (без папки)</span>
            </button>
            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  onMoveSession(session.id, g.id)
                  setMovingSessionId(null)
                }}
                className="w-full text-left px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 truncate"
              >
                <Folder className="w-3 h-3 text-emerald-500" />
                <span className="truncate">{g.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
}
