import React, { useRef, useEffect } from 'react'
import {
  Copy,
  Check,
  FileText,
  Bot,
  Sparkles,
  Scissors,
  EyeOff,
  Eye,
} from 'lucide-react'
import { type AiProfile, type AiMessage } from '../types'
import { GemIcon, getProfileColorClasses } from './GemIcon'
import { GeminiMarkdown } from './GeminiMarkdown'
import { getInitials } from '../../../utils/gravatar'

interface AiStudioChatAreaProps {
  messages: AiMessage[]
  activeProfile: AiProfile | null
  userName?: string
  userAvatar?: string | null
  isGenerating: boolean
  sessionTokenUsage: { inputTokens: number; outputTokens: number; totalTokens: number }
  onCopyMessage: (text: string) => void
  onUpdateMessage?: (messageId: string, patch: { isExcludedFromHistory?: boolean; isCutPoint?: boolean }) => void
}

export const AiStudioChatArea: React.FC<AiStudioChatAreaProps> = ({
  messages,
  activeProfile,
  userName = 'Користувачу',
  userAvatar,
  isGenerating,
  onCopyMessage,
  onUpdateMessage,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  // Автоскрол до останнього повідомлення
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isGenerating])

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    onCopyMessage(text)
  }

  const handleToggleCutPoint = (msg: AiMessage) => {
    onUpdateMessage?.(msg.id, { isCutPoint: !msg.isCutPoint })
  }

  const handleToggleExclude = (msg: AiMessage) => {
    onUpdateMessage?.(msg.id, { isExcludedFromHistory: !msg.isExcludedFromHistory })
  }

  // --- СТАН 1: СТАРТОВИЙ ЕКРАН / НОВА СЕСІЯ ---
  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-12 flex flex-col items-center justify-center max-w-3xl mx-auto w-full select-none">
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Іконка по центру: активного профілю або базовий бот */}
          {activeProfile ? (
            <div
              className={`inline-flex p-3.5 rounded-2xl ${getProfileColorClasses(
                activeProfile.color
              )} shadow-lg mb-1`}
            >
              <GemIcon iconName={activeProfile.iconName} className="w-10 h-10" />
            </div>
          ) : (
            <div className="inline-flex p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-md text-emerald-500 mb-1">
              <Sparkles className="w-10 h-10" />
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 font-logo">
            <span>Привіт, </span>
            <span className="text-emerald-500">{userName}</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium max-w-md mx-auto">
            Чим я можу допомогти вам сьогодні?
          </p>

          {/* Плашка поточного активного профілю (якщо обрано) */}
          {activeProfile && (
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-2xs mt-2 text-xs sm:text-sm">
              <div
                className={`p-1 rounded-md ${getProfileColorClasses(activeProfile.color)} shrink-0`}
              >
                <GemIcon iconName={activeProfile.iconName} className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {activeProfile.name}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- СТАН 2: АКТИВНИЙ ДІАЛОГ ---
  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 space-y-6 max-w-4xl mx-auto w-full">
      {messages.map((message) => {
        const isUser = message.role === 'user'
        const isExcluded = !!message.isExcludedFromHistory
        const isCut = !!message.isCutPoint

        return (
          <div
            key={message.id}
            className={`flex items-start gap-3 sm:gap-4 animate-in fade-in duration-200 ${
              isUser ? 'flex-row-reverse' : 'flex-row'
            } ${isExcluded ? 'opacity-40' : ''}`}
          >
            {/* Аватар */}
            {isUser ? (
              userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-300 dark:ring-slate-700 mt-1"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-1">
                  {getInitials(userName)}
                </div>
              )
            ) : (
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-2xs ${
                  activeProfile
                    ? getProfileColorClasses(activeProfile.color)
                    : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500'
                }`}
              >
                {activeProfile ? (
                  <GemIcon iconName={activeProfile.iconName} className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
            )}

            {/* Тіло повідомлення */}
            <div className={`flex-1 min-w-0 ${isUser ? 'flex flex-col items-end' : ''}`}>
              {/* Автор + Час */}
              <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {isUser
                    ? userName
                    : message.profileName || activeProfile?.name || 'AI Assistant'}
                </span>
                {!isUser && message.profileName && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {message.profileName}
                  </span>
                )}
                <span>•</span>
                <span>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {isCut && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    ✂ Відсік
                  </span>
                )}
                {isExcluded && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-300/50 text-slate-500 border border-slate-400/30">
                    Виключено
                  </span>
                )}
              </div>

              {/* Прикріплені файли */}
              {isUser && message.attachments && message.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2 justify-end">
                  {message.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-300 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="max-w-[150px] truncate">{att.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Текст повідомлення */}
              {isUser ? (
                <div className="inline-block bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl rounded-tr-none px-4 py-3 max-w-[85%] sm:max-w-[75%] shadow-2xs leading-relaxed text-sm sm:text-base whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              ) : (
                <div
                  className={`rounded-2xl rounded-tl-none p-4 sm:p-5 shadow-2xs border ${
                    message.isError
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <GeminiMarkdown content={message.content} />
                </div>
              )}

              {/* Кнопки під повідомленням */}
              <div className={`flex items-center gap-1 mt-1.5 ${isUser ? 'justify-end' : 'justify-start pl-1'}`}>
                {/* Кнопка копіювання (для відповідей AI) */}
                {!isUser && !message.isError && (
                  <button
                    type="button"
                    onClick={() => handleCopy(message.id, message.content)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title="Скопіювати відповідь"
                  >
                    {copiedId === message.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}

                {/* ✂ Ножиці — відсікає історію від цього повідомлення */}
                <button
                  type="button"
                  onClick={() => handleToggleCutPoint(message)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isCut
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                      : 'text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                  title={isCut ? 'Зняти відсік' : 'Відсікти тут — history надсилається тільки після цього повідомлення'}
                >
                  <Scissors className="w-3.5 h-3.5" />
                </button>

                {/* 👁 Oko — виключити повідомлення з history */}
                <button
                  type="button"
                  onClick={() => handleToggleExclude(message)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isExcluded
                      ? 'text-slate-600 dark:text-slate-400 bg-slate-300/50 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                  title={isExcluded ? 'Включити назад у history' : 'Виключити це повідомлення з history (AI не бачитиме)'}
                >
                  {isExcluded ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      })}

      {/* Генерація відповіді */}
      {isGenerating && (
        <div className="flex items-start gap-3 sm:gap-4 animate-in fade-in duration-200">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-2xs ${
              activeProfile
                ? getProfileColorClasses(activeProfile.color)
                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500'
            }`}
          >
            <Bot className="w-4 h-4 animate-spin" />
          </div>
          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl rounded-tl-none p-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {activeProfile ? activeProfile.name : 'AI'} формує відповідь...
              </span>
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-3 w-3/4 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="h-3 w-5/6 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse delay-75" />
              <div className="h-3 w-1/2 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse delay-150" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
