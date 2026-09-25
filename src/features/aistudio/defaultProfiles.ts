import type { AiProfile } from './types'

export const N8N_CHAT_WEBHOOK_URL =
  import.meta.env.VITE_N8N_AI_STUDIO_WEBHOOK_URL ||
  'https://shurgen01.app.n8n.cloud/webhook-test/0b0030d6-d466-44e2-9bcd-b7735241dfa6'

// Усі попередні шаблонні профілі видалено згідно з вимогами користувача.
// Користувач створює та видаляє власні профілі через інтерфейс.
export const BUILT_IN_PROFILES: AiProfile[] = []
