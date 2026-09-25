export interface AiProfile {
  id: string
  name: string
  role: string
  iconName: string // 'cloud' | 'plane' | 'compass' | 'cpu' | 'shield' | 'bot' | 'wind' | 'zap' | 'sparkles'
  color: string // 'emerald' | 'sky' | 'indigo' | 'amber' | 'rose' | 'purple'
  description: string
  systemInstructions: string // Системні інструкції профілю
  temperature?: number
  isBuiltIn?: boolean
  createdAt?: number
}

// Псевдонім для зворотної сумісності за потреби
export type AiGem = AiProfile

export interface AiChatGroup {
  id: string
  name: string
  profileId?: string // Прив'язка до профілю (для автопапок)
  isCustom?: boolean // Користувацька папка
  createdAt: number
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
  profileId?: string
  profileName?: string
  attachments?: AiMessageAttachment[]
  isError?: boolean
}

export interface AiChatSession {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  profileId: string // Профіль, з яким ведеться діалог
  groupId?: string | null // null / 'root' — у корені чатів; інакше ID папки/групи
  messages: AiMessage[]
}

export interface N8nChatPayload {
  chatInput: string
  message: string
  sessionId: string
  sessionTitle: string
  history: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  profile: {
    id: string
    name: string
    role: string
    systemInstructions: string
  }
  systemInstructions: string
  temperature: number
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
}
