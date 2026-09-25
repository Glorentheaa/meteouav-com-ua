import React, { useState, useRef, useEffect } from 'react'
import {
  ArrowUp,
  Square,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
} from 'lucide-react'
import { type AiGem, type AiMessageAttachment } from '../types'
import { GemIcon } from './GemIcon'

interface AiStudioInputProps {
  onSendMessage: (text: string, attachments: AiMessageAttachment[]) => void
  onStopGeneration?: () => void
  isGenerating: boolean
  activeGem: AiGem
  disabled?: boolean
  inputRef?: React.RefObject<HTMLTextAreaElement | null>
}

export const AiStudioInput: React.FC<AiStudioInputProps> = ({
  onSendMessage,
  onStopGeneration,
  isGenerating,
  activeGem,
  disabled = false,
  inputRef: externalInputRef,
}) => {
  const [text, setText] = useState('')
  const [attachments, setAttachments] = useState<AiMessageAttachment[]>([])
  const internalRef = useRef<HTMLTextAreaElement>(null)
  const textareaRef = externalInputRef || internalRef
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    onSendMessage(text.trim(), attachments)
    setText('')
    setAttachments([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
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

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pb-4">
      {/* Контейнер форми Gemini */}
      <div className="relative bg-slate-100/90 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700/80 rounded-3xl shadow-lg focus-within:ring-2 focus-within:ring-sky-500/50 focus-within:border-sky-500 transition-all backdrop-blur-md overflow-hidden">
        {/* Прикріплені файли (прев'ю чіпси) */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3 pb-1 border-b border-slate-200 dark:border-slate-700/60">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs text-slate-800 dark:text-slate-200 shadow-2xs"
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="w-3.5 h-3.5 text-sky-500" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                )}
                <span className="max-w-[120px] truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(file.id)}
                  className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
            placeholder={`Запитайте ${activeGem.name} про погоду, вітер, польоти...`}
            className="w-full bg-transparent resize-none border-none outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm sm:text-base leading-relaxed max-h-44"
          />
        </div>

        {/* Нижня панель інструментів інпуту */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          {/* Ліва частина: Кнопка прикріплення + Чіп поточного фахівця */}
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
              className="p-2 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
              title="Прикріпити файл або лог польоту"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Чіп активного агента */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs font-medium border border-sky-500/20">
              <GemIcon iconName={activeGem.iconName} className="w-3 h-3" />
              <span>{activeGem.name}</span>
            </div>
          </div>

          {/* Права частина: Кнопка відправки або зупинки генерації */}
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
                className={`p-2 sm:p-2.5 rounded-full transition-all ${
                  text.trim() || attachments.length > 0
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25 hover:scale-105 active:scale-95'
                    : 'bg-slate-300/60 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
                title="Відправити повідомлення (Enter)"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Дисклеймер внизу сторінки як у Gemini */}
      <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-2 px-2">
        AI Studio може припускатися неточностей. Обов'язково перевіряйте критичні метеодані перед польотом.
      </p>
    </div>
  )
}
