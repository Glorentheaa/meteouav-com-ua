import React, { useState, useRef, useEffect } from 'react'
import {
  ArrowUp,
  Square,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  Scissors,
  Code2,
  Search,
  BrainCircuit,
  Zap,
} from 'lucide-react'
import { type AiProfile, type AiMessageAttachment } from '../types'
import { GemIcon, getProfileColorClasses } from './GemIcon'

// Ліміт контекстного вікна
const CONTEXT_WINDOW_LIMIT_TOTAL = 1_048_576

interface AiStudioInputProps {
  onSendMessage: (
    text: string,
    attachments: AiMessageAttachment[],
    commandFlags?: { codeOnly?: boolean; search?: boolean; thinking?: boolean }
  ) => void
  onStopGeneration?: () => void
  isGenerating: boolean
  activeProfile: AiProfile | null
  disabled?: boolean
  inputRef?: React.RefObject<HTMLTextAreaElement | null>
  sessionTokenUsage?: { inputTokens: number; outputTokens: number; totalTokens: number }
}

export const AiStudioInput: React.FC<AiStudioInputProps> = ({
  onSendMessage,
  onStopGeneration,
  isGenerating,
  activeProfile,
  disabled = false,
  inputRef: externalInputRef,
  sessionTokenUsage,
}) => {
  const [text, setText] = useState('')
  const [attachments, setAttachments] = useState<AiMessageAttachment[]>([])
  const internalRef = useRef<HTMLTextAreaElement>(null)
  const textareaRef = externalInputRef || internalRef
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Стан команд
  const [codeOnly, setCodeOnly] = useState(false)
  const [search, setSearch] = useState(false)
  const [thinking, setThinking] = useState(false)

  // Автопідлаштування висоти textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const newHeight = Math.min(textareaRef.current.scrollHeight, 180)
      textareaRef.current.style.height = `${newHeight}px`
    }
  }, [text, textareaRef])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    if ((!text.trim() && attachments.length === 0) || isGenerating || disabled) return

    let finalText = text.trim()

    // Додаємо суфікси команд до тексту
    if (codeOnly) finalText += ' /codeonly'
    if (search) finalText += ' /search'
    if (thinking) finalText += ' /thinking'

    onSendMessage(finalText, attachments, { codeOnly, search, thinking })
    setText('')
    setAttachments([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  // Summarize & Compress — відправка команди /summarize
  const handleSummarize = () => {
    if (isGenerating || disabled) return
    onSendMessage('/summarize', [], {})
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const attachment: AiMessageAttachment = {
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: reader.result as string,
        }
        setAttachments((prev) => [...prev, attachment])
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  // Форматування числа
  const fmtNum = (n: number) => n.toLocaleString('uk-UA')

  const totalTokens = sessionTokenUsage?.totalTokens || 0
  const pct = totalTokens > 0 ? Math.min((totalTokens / CONTEXT_WINDOW_LIMIT_TOTAL) * 100, 100) : 0
  const barColor =
    pct >= 85 ? 'bg-rose-500' : pct >= 60 ? 'bg-amber-400' : 'bg-emerald-500'

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pb-4">
      {/* Лічильник токенів над полем вводу — ліва сторона */}
      {totalTokens > 0 && (
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 select-none">
          <Zap className="w-3 h-3 text-emerald-500 shrink-0" />
          <span className="whitespace-nowrap">
            <span className="text-slate-600 dark:text-slate-300 font-medium">Вхід:</span>{' '}
            {fmtNum(sessionTokenUsage?.inputTokens || 0)}
          </span>
          <span className="text-slate-400 dark:text-slate-600">|</span>
          <span className="whitespace-nowrap">
            <span className="text-slate-600 dark:text-slate-300 font-medium">Вихід:</span>{' '}
            {fmtNum(sessionTokenUsage?.outputTokens || 0)}
          </span>
          <span className="text-slate-400 dark:text-slate-600">|</span>
          <span className="whitespace-nowrap font-semibold text-slate-700 dark:text-slate-300">
            {fmtNum(totalTokens)}
          </span>
          {/* Мінімальний прогрес-бар */}
          <div className="flex-1 min-w-[40px] max-w-[100px] h-1 rounded-full bg-slate-300 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[10px] opacity-60">{pct.toFixed(1)}%</span>
        </div>
      )}

      {/* Контейнер форми введення */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-md focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:border-emerald-500 transition-all overflow-hidden">
        {/* Прикріплені файли */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3 pb-1 border-b border-slate-200 dark:border-slate-800">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 shadow-2xs"
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                )}
                <span className="max-w-[120px] truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(file.id)}
                  className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Текстове поле введення */}
        <div className="px-4 pt-3 pb-2">
          <textarea
            ref={textareaRef}
            rows={1}
            disabled={disabled}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeProfile
                ? `Запитайте ${activeProfile.name}...`
                : 'Запитайте що завгодно...'
            }
            className="w-full bg-transparent resize-none border-none outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm sm:text-base leading-relaxed max-h-44"
          />
        </div>

        {/* Нижня панель дій */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          {/* Ліва частина: Прикріплення файлу + Бейдж активного профілю */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Прикріпити файл або документ"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Бейдж обраного профілю */}
            {activeProfile && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700">
                <div
                  className={`p-0.5 rounded-full ${getProfileColorClasses(
                    activeProfile.color
                  )} shrink-0`}
                >
                  <GemIcon iconName={activeProfile.iconName} className="w-2.5 h-2.5" />
                </div>
                <span>{activeProfile.name}</span>
              </div>
            )}
          </div>

          {/* Права частина: Кнопка відправки */}
          <div>
            {isGenerating ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="p-2 sm:p-2.5 rounded-full bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-md hover:scale-105 transition-transform"
                title="Зупинити генерацію"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={(!text.trim() && attachments.length === 0) || disabled}
                className={`p-2 sm:p-2.5 rounded-xl transition-all ${
                  text.trim() || attachments.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 hover:scale-105 active:scale-95'
                    : 'bg-slate-300/60 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }`}
                title="Відправити повідомлення (Enter)"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Рядок команд — розміщений під полем вводу в самому низу */}
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        {/* Summarize & Compress */}
        <button
          type="button"
          onClick={handleSummarize}
          disabled={isGenerating || disabled}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:border-emerald-500 text-[11px] font-medium transition-colors disabled:opacity-40"
          title="Стиснути і підсумувати контекст (надсилає /summarize)"
        >
          <Scissors className="w-3 h-3 text-emerald-500" />
          <span>Summarize &amp; Compress</span>
        </button>

        {/* Чекбокс "Тільки код" */}
        <button
          type="button"
          onClick={() => setCodeOnly((v) => !v)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
            codeOnly
              ? 'bg-sky-500/15 border-sky-500/60 text-sky-700 dark:text-sky-400'
              : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-sky-400'
          }`}
          title="Додає /codeonly до запиту — відповідь лише з кодом"
        >
          <Code2 className="w-3 h-3" />
          <span>Тільки код</span>
        </button>

        {/* Чекбокс "Пошук" */}
        <button
          type="button"
          onClick={() => setSearch((v) => !v)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
            search
              ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-700 dark:text-emerald-400'
              : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-400'
          }`}
          title="Додає /search до запиту — увімкнути пошук"
        >
          <Search className="w-3 h-3" />
          <span>Пошук</span>
        </button>

        {/* Чекбокс "Thinking" */}
        <button
          type="button"
          onClick={() => setThinking((v) => !v)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
            thinking
              ? 'bg-purple-500/15 border-purple-500/60 text-purple-700 dark:text-purple-400'
              : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-purple-400'
          }`}
          title="Додає /thinking до запиту — глибоке мислення"
        >
          <BrainCircuit className="w-3 h-3" />
          <span>Thinking</span>
        </button>
      </div>
    </div>
  )
}
