export interface AiProfile {
  id: string
  name: string
  iconName: string
  color: string // 'emerald' | 'sky' | 'indigo' | 'purple' | 'pink' | 'rose' | 'amber' | 'orange' | 'teal' | 'cyan' | 'violet' | 'slate'
  description?: string
  systemInstructions: string
  createdAt?: number
  isBuiltIn?: boolean
}

// Псевдонім для зворотної сумісності
export type AiGem = AiProfile

export interface AiChatGroup {
  id: string
  name: string
  createdAt: number
}

export interface TokenUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

export interface AiMessageAttachment {
  id: string
  name: string
  size: number
  type: string
  dataUrl?: string
}

export interface AiMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  profileId?: string | null
  profileName?: string | null
  attachments?: AiMessageAttachment[]
  isError?: boolean
  usage?: TokenUsage | null // токени за цей запит (лише у повідомленнях асистента)
  // Модерація повідомлень
  isExcludedFromHistory?: boolean // Якщо true — повідомлення виключено з відправки в history
  isCutPoint?: boolean            // Якщо true — повідомлення є точкою відсіку (history надсилається лише після нього)
}

export interface AiChatSession {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  profileId?: string | null // Може бути null, якщо профіль не обрано
  groupId?: string | null // null — у списку збережених чатів; інакше ID папки
  messages: AiMessage[]
}

/** Команди для бекенду AI агента */
export type AiCommand =
  | '/summarize'   // Стиснути і підсумувати контекст
  | '/codeonly'    // Лише код у відповіді
  | '/search'      // Увімкнути пошук
  | '/thinking'    // Увімкнути глибоке мислення

export interface N8nChatPayload {
  chatInput: string
  message: string
  sessionId: string
  sessionTitle: string
  history: Array<{
    role: 'user' | 'assistant'
    content: string
    excluded?: boolean   // якщо true — це повідомлення виключене з контексту
  }>
  profile?: {
    id: string
    name: string
    systemInstructions: string
  } | null
  systemInstructions?: string
  attachments?: Array<{
    name: string
    type: string
    size: number
  }>
  user?: {
    id: string
    nickname: string
    email?: string | null
    isPro: boolean
  }
  timestamp: string
  // Прапори команд
  commands?: {
    codeOnly?: boolean
    search?: boolean
    thinking?: boolean
  }
}
