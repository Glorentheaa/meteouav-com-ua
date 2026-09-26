import type { AiProfile } from './types'

export const N8N_CHAT_WEBHOOK_URL =
  import.meta.env.VITE_N8N_AI_STUDIO_WEBHOOK_URL ||
  'https://shurgen01.app.n8n.cloud/webhook/0b0030d6-d466-44e2-9bcd-b7735241dfa6'

export const DEFAULT_TEA_PROFILE: AiProfile = {
  id: 'tea',
  name: 'Теа',
  iconName: 'sparkles',
  color: 'emerald',
  description: 'Базовий асистент MeteoUAV',
  systemInstructions:
    'Ти — Теа, інтелектуальний тактичний метеорологічний асистент платформи MeteoUAV для пілотів БПЛА. Твоя мета — допомагати в аналізі погодних умов, розрахунку ризиків польотів та прийнятті оперативних рішень.',
  createdAt: 0,
  isBuiltIn: true,
}

// Базовий профіль "Теа" за замовчуванням без можливості редагування
export const BUILT_IN_PROFILES: AiProfile[] = [DEFAULT_TEA_PROFILE]
