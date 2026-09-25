import React, { useState, useRef, useEffect } from 'react'
import {
  ArrowUp,
  Square,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
} from 'lucide-react'
import { type AiProfile, type AiMessageAttachment } from '../types'
import { GemIcon, getProfileColorClasses } from './GemIcon'

interface AiStudioInputProps {
  onSendMessage: (text: string, attachments: AiMessageAttachment[]) => void
  onStopGeneration?: () => void
  isGenerating: boolean
  activeProfile: AiProfile | null
  disabled?: boolean
  inputRef?: React.RefObject<HTMLTextAreaElement | null>
}

export const AiStudioInput: React.FC<AiStudioInputProps> = ({
  onSendMessage,
  onStopGeneration,
  isGenerating,
  activeProfile,
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

            {/* Бейдж обраного профілю з його кольором */}
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

      {/* Дисклеймер у стилі сайту */}
      <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mt-2 px-2">
        AI Studio може припускатися неточностей. Перевіряйте важливу інформацію.
      </p>
    </div>
  )
}
