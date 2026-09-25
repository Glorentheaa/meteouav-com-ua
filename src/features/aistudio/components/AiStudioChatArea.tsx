import React, { useRef, useEffect } from 'react'
import {
  Sparkles,
  Copy,
  Check,
  FileText,
} from 'lucide-react'
import { type AiGem, type AiMessage } from '../types'
import { GemIcon } from './GemIcon'
import { GeminiMarkdown } from './GeminiMarkdown'
import { getInitials } from '../../../utils/gravatar'

interface AiStudioChatAreaProps {
  messages: AiMessage[]
  activeGem: AiGem
  userName?: string
  userAvatar?: string | null
  isGenerating: boolean
  onSelectPrompt: (prompt: string) => void
  onCopyMessage: (text: string) => void
}

export const AiStudioChatArea: React.FC<AiStudioChatAreaProps> = ({
  messages,
  activeGem,
  userName = 'Пілоте',
  userAvatar,
  isGenerating,
  onSelectPrompt,
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

  // --- СТАН 1: СТАРТОВА СТОРІНКА / НОВА СЕСІЯ (GEMINI HERO) ---
  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
        {/* Gemini Iridescent Gradient Header */}
        <div className="text-center space-y-3 mb-8 sm:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 shadow-2xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-spin" />
            <span>MeteoUAV Інтелектуальна Студія</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Привіт, {userName}
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-slate-500 dark:text-slate-400 font-medium">
            Чим я можу допомогти вам сьогодні?
          </p>

          {/* Плашка активного фахівця */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm mt-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <div className="p-1.5 rounded-lg bg-sky-500 text-white shrink-0">
              <GemIcon iconName={activeGem.iconName} className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {activeGem.name}
              </span>
              <span className="text-slate-400 dark:text-slate-500 ml-2">({activeGem.role})</span>
            </div>
          </div>
        </div>

        {/* Картки швидких підказок (Prompt Suggestion Cards) */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl animate-in fade-in slide-in-from-bottom-6 duration-700">
          {activeGem.suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(prompt)}
              className="group p-4 rounded-2xl bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-sky-500 dark:hover:border-sky-500/60 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between"
            >
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug">
                {prompt}
              </p>
              <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
                <span>Швидкий запуск</span>
                <Sparkles className="w-3.5 h-3.5 text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // --- СТАН 2: АКТИВНИЙ ДІАЛОГ (CHAT THREAD) ---
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-1">
                  {getInitials(userName)}
                </div>
              )
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-md shadow-sky-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            {/* Тіло повідомлення */}
            <div className={`flex-1 min-w-0 ${isUser ? 'flex flex-col items-end' : ''}`}>
              {/* Автор + Час */}
              <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {isUser ? userName : message.gemName || activeGem.name}
                </span>
                {!isUser && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    Gem
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
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs text-slate-700 dark:text-slate-200"
                    >
                      <FileText className="w-3.5 h-3.5 text-sky-500" />
                      <span className="max-w-[150px] truncate">{att.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Бульбашка тексту або Markdown */}
              {isUser ? (
                <div className="inline-block bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl rounded-tr-none px-4 py-3 max-w-[85%] sm:max-w-[75%] shadow-2xs leading-relaxed text-sm sm:text-base whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              ) : (
                <div className="space-y-2">
                  <div
                    className={`rounded-2xl rounded-tl-none p-4 sm:p-5 shadow-xs border ${
                      message.isError
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                        : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    <GeminiMarkdown content={message.content} />
                  </div>

                  {/* Панель дій для відповіді ШІ */}
                  {!message.isError && (
                    <div className="flex items-center gap-2 pt-1 pl-1">
                      <button
                        type="button"
                        onClick={() => handleCopy(message.id, message.content)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
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

      {/* Анімація мислення / генерації відповіді (Gemini shimmer) */}
      {isGenerating && (
        <div className="flex items-start gap-3 sm:gap-4 animate-in fade-in duration-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-md shadow-sky-500/20">
            <Sparkles className="w-4 h-4 animate-spin" />
          </div>
          <div className="flex-1 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl rounded-tl-none p-4 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold bg-gradient-to-r from-sky-500 to-purple-500 bg-clip-text text-transparent">
                {activeGem.name} генерує аналіз...
              </span>
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-3 w-3/4 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
              <div className="h-3 w-5/6 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse delay-75" />
              <div className="h-3 w-1/2 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse delay-150" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
