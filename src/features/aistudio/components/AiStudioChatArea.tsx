import React, { useRef, useEffect } from 'react'
import {
  Copy,
  Check,
  FileText,
  CloudSun,
} from 'lucide-react'
import { type AiProfile, type AiMessage } from '../types'
import { GemIcon } from './GemIcon'
import { GeminiMarkdown } from './GeminiMarkdown'
import { getInitials } from '../../../utils/gravatar'

interface AiStudioChatAreaProps {
  messages: AiMessage[]
  activeProfile: AiProfile
  userName?: string
  userAvatar?: string | null
  isGenerating: boolean
  onCopyMessage: (text: string) => void
}

export const AiStudioChatArea: React.FC<AiStudioChatAreaProps> = ({
  messages,
  activeProfile,
  userName = 'Пілоте',
  userAvatar,
  isGenerating,
  onCopyMessage,
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

  // --- СТАН 1: СТАРТОВИЙ ЕКРАН / НОВА СЕСІЯ (БЕЗ ШАБЛОННИХ ПИТАНЬ) ---
  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-12 flex flex-col items-center justify-center max-w-3xl mx-auto w-full select-none">
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Фірмова іконка MeteoUAV */}
          <div className="inline-flex p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-md text-emerald-500 mb-1">
            <CloudSun className="w-10 h-10" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 font-logo">
            <span>Привіт, </span>
            <span className="text-emerald-500">{userName}</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium max-w-md mx-auto">
            Чим я можу допомогти вам сьогодні щодо метео чи планування польотів?
          </p>

          {/* Плашка поточного активного профілю */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-2xs mt-2 text-xs sm:text-sm">
            <div className="p-1 rounded-md bg-emerald-500 text-white shrink-0">
              <GemIcon iconName={activeProfile.iconName} className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {activeProfile.name}
              </span>
              <span className="text-slate-500 dark:text-slate-400 ml-2">({activeProfile.role})</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- СТАН 2: АКТИВНИЙ ДІАЛОГ ---
  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 space-y-6 max-w-4xl mx-auto w-full">
      {messages.map((message) => {
        const isUser = message.role === 'user'

        return (
          <div
            key={message.id}
            className={`flex items-start gap-3 sm:gap-4 animate-in fade-in duration-200 ${
              isUser ? 'flex-row-reverse' : 'flex-row'
            }`}
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
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                <CloudSun className="w-4 h-4" />
              </div>
            )}

            {/* Тіло повідомлення */}
            <div className={`flex-1 min-w-0 ${isUser ? 'flex flex-col items-end' : ''}`}>
              {/* Автор + Час */}
              <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {isUser ? userName : message.profileName || activeProfile.name}
                </span>
                {!isUser && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Профіль
                  </span>
                )}
                <span>•</span>
                <span>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Прикріплені файли користувача */}
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

              {/* Бульбашка повідомлення */}
              {isUser ? (
                <div className="inline-block bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl rounded-tr-none px-4 py-3 max-w-[85%] sm:max-w-[75%] shadow-2xs leading-relaxed text-sm sm:text-base whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              ) : (
                <div className="space-y-2">
                  <div
                    className={`rounded-2xl rounded-tl-none p-4 sm:p-5 shadow-2xs border ${
                      message.isError
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    <GeminiMarkdown content={message.content} />
                  </div>

                  {/* Кнопка копіювання відповіді */}
                  {!message.isError && (
                    <div className="flex items-center gap-2 pt-0.5 pl-1">
                      <button
                        type="button"
                        onClick={() => handleCopy(message.id, message.content)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        title="Скопіювати відповідь"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Анімація мислення / генерації */}
      {isGenerating && (
        <div className="flex items-start gap-3 sm:gap-4 animate-in fade-in duration-200">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0 mt-1 shadow-2xs">
            <CloudSun className="w-4 h-4 animate-spin" />
          </div>
          <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl rounded-tl-none p-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {activeProfile.name} формує відповідь через n8n...
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
