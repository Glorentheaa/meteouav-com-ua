export interface AiGem {
  id: string
  name: string
  role: string
  iconName: string // 'sparkles' | 'cloud' | 'plane' | 'compass' | 'cpu' | 'shield' | 'bot'
  color: string // Tailwind color accent, e.g. 'emerald', 'sky', 'indigo', 'amber', 'rose'
  description: string
  systemPromptAddon: string // Окреме доповнення до глобальних інструкцій
  suggestedPrompts: string[]
  isBuiltIn?: boolean
  createdAt?: number
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
  gemId?: string
  gemName?: string
  attachments?: AiMessageAttachment[]
  isError?: boolean
}

export interface AiChatSession {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  gemId: string // Current or initial Gem used
  messages: AiMessage[]
}

export interface AiStudioSettings {
  webhookUrl: string
  bearerToken: string
  globalInstructions: string
  defaultModel: string
  temperature: number
}

export interface N8nAiStudioPayload {
  sessionId: string
  sessionTitle: string
  message: string
  history: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  agent: {
    id: string
    name: string
    role: string
    systemPromptAddon: string
  }
  globalInstructions: string
  effectiveSystemPrompt: string
  model: string
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
