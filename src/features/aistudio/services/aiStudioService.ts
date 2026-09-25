import {
  type AiProfile,
  type AiChatSession,
  type AiChatGroup,
  type N8nChatPayload,
  type TokenUsage,
} from '../types'
import { BUILT_IN_PROFILES, N8N_CHAT_WEBHOOK_URL } from '../defaultProfiles'

const STORAGE_KEYS = {
  PROFILES: 'meteo_aistudio_profiles_v3',
  GROUPS: 'meteo_aistudio_groups_v3',
  SESSIONS: 'meteo_aistudio_sessions_v3',
  ACTIVE_SESSION_ID: 'meteo_aistudio_active_session_id',
  ACTIVE_PROFILE_ID: 'meteo_aistudio_active_profile_id',
}

export class AiStudioStorage {
  // --- Профілі (Profiles) ---
  static getProfiles(): AiProfile[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILES)
      if (raw) {
        const parsed: AiProfile[] = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed
      }
    } catch (e) {
      console.error('Помилка читання профілів:', e)
    }
    return BUILT_IN_PROFILES
  }

  static saveProfile(profile: AiProfile): AiProfile[] {
    const all = this.getProfiles()
    const index = all.findIndex((p) => p.id === profile.id)
    let updated: AiProfile[]

    if (index >= 0) {
      updated = [...all]
      updated[index] = { ...profile }
    } else {
      updated = [...all, { ...profile, createdAt: Date.now() }]
    }

    try {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(updated))
    } catch (e) {
      console.error('Помилка збереження профілю:', e)
    }
    return updated
  }

  static deleteProfile(profileId: string): AiProfile[] {
    const all = this.getProfiles()
    const updated = all.filter((p) => p.id !== profileId)
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(updated))
    } catch (e) {
      console.error('Помилка видалення профілю:', e)
    }
    return updated
  }

  // --- Групи / Папки чатів (Chat Groups) ---
  static getGroups(): AiChatGroup[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.GROUPS)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed
      }
    } catch (e) {
      console.error('Помилка читання груп чатів:', e)
    }
    return []
  }

  static saveGroups(groups: AiChatGroup[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups))
    } catch (e) {
      console.error('Помилка збереження груп:', e)
    }
  }

  static createGroup(name: string): AiChatGroup[] {
    const groups = this.getGroups()
    const newGroup: AiChatGroup = {
      id: `group_${Date.now()}`,
      name: name.trim(),
      createdAt: Date.now(),
    }
    const updated = [...groups, newGroup]
    this.saveGroups(updated)
    return updated
  }

  static renameGroup(groupId: string, newName: string): AiChatGroup[] {
    const groups = this.getGroups().map((g) =>
      g.id === groupId ? { ...g, name: newName.trim() } : g
    )
    this.saveGroups(groups)
    return groups
  }

  static deleteGroup(groupId: string): AiChatGroup[] {
    const groups = this.getGroups().filter((g) => g.id !== groupId)
    this.saveGroups(groups)

    // При видаленні групи переносимо чати в збережені (без папки)
    const sessions = this.getSessions().map((s) =>
      s.groupId === groupId ? { ...s, groupId: null } : s
    )
    this.saveSessions(sessions)

    return groups
  }

  // --- Сесії чатів (Sessions) ---
  static getSessions(): AiChatSession[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          return parsed.sort((a, b) => b.updatedAt - a.updatedAt)
        }
      }
    } catch (e) {
      console.error('Помилка читання сесій:', e)
    }
    return []
  }

  static saveSessions(sessions: AiChatSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))
    } catch (e) {
      console.error('Помилка збереження сесій:', e)
    }
  }

  static saveSession(session: AiChatSession): AiChatSession[] {
    const sessions = this.getSessions()
    const index = sessions.findIndex((s) => s.id === session.id)
    let updated: AiChatSession[]

    if (index >= 0) {
      updated = [...sessions]
      updated[index] = { ...session, updatedAt: Date.now() }
    } else {
      updated = [{ ...session, updatedAt: Date.now() }, ...sessions]
    }

    updated.sort((a, b) => b.updatedAt - a.updatedAt)
    this.saveSessions(updated)
    return updated
  }

  static moveSessionToGroup(sessionId: string, groupId: string | null): AiChatSession[] {
    const sessions = this.getSessions().map((s) =>
      s.id === sessionId ? { ...s, groupId, updatedAt: Date.now() } : s
    )
    this.saveSessions(sessions)
    return sessions
  }

  static deleteSession(sessionId: string): AiChatSession[] {
    const sessions = this.getSessions().filter((s) => s.id !== sessionId)
    this.saveSessions(sessions)
    return sessions
  }

  // --- Активні стани ---
  static getActiveSessionId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION_ID)
  }

  static setActiveSessionId(id: string | null): void {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION_ID, id)
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION_ID)
    }
  }

  static getActiveProfileId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE_ID)
  }

  static setActiveProfileId(id: string | null): void {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, id)
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROFILE_ID)
    }
  }
}

// Головна функція відправки повідомлення на n8n webhook
export async function sendAiStudioMessage(params: {
  session: AiChatSession
  profile: AiProfile | null
  userMessage: string
  attachments?: Array<{ name: string; type: string; size: number }>
  userProfile?: {
    id: string
    nickname: string
    email?: string | null
    isPro: boolean
  }
}): Promise<{ text: string; usage: TokenUsage | null }> {
  const { session, profile, userMessage, attachments, userProfile } = params

  const payload: N8nChatPayload = {
    chatInput: userMessage,
    message: userMessage,
    sessionId: session.id,
    sessionTitle: session.title,
    history: session.messages.slice(-10).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
    profile: profile
      ? {
          id: profile.id,
          name: profile.name,
          systemInstructions: profile.systemInstructions,
        }
      : null,
    systemInstructions: profile ? profile.systemInstructions : '',
    attachments,
    user: userProfile,
    timestamp: new Date().toISOString(),
  }

  try {
    const response = await fetch(N8N_CHAT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`n8n webhook помилка ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const json = await response.json()
      let extracted = ''
      let usage: TokenUsage | null = null

      // --- Парсинг тексту відповіді ---
      if (typeof json === 'string') {
        extracted = json
      } else if (Array.isArray(json) && json[0]) {
        const item = json[0]
        extracted =
          item.output ||
          item.text ||
          item.message ||
          item.response ||
          item.json?.output ||
          item.json?.text ||
          item.json?.message ||
          JSON.stringify(item, null, 2)
        // Шукаємо usage в першому елементі
        const raw = item.usage || item.tokenUsage || item.json?.usage || item.json?.tokenUsage
        if (raw) usage = parseUsage(raw)
      } else if (typeof json === 'object' && json !== null) {
        extracted =
          json.output ||
          json.text ||
          json.message ||
          json.response ||
          json.result ||
          JSON.stringify(json, null, 2)
        // Шукаємо usage на верхньому рівні
        const raw = json.usage || json.tokenUsage
        if (raw) usage = parseUsage(raw)
      }

      return {
        text: extracted || 'Отримано порожню відповідь від n8n.',
        usage,
      }
    } else {
      const text = await response.text()
      return {
        text: text || 'Отримано відповідь без тексту.',
        usage: null,
      }
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('Помилка надсилання на n8n webhook:', errorMsg)
    throw new Error(`Не вдалося з'єднатися з n8n: ${errorMsg}`)
  }
}

// Допоміжна функція: нормалізує різні формати usage що повертає n8n
function parseUsage(raw: Record<string, number>): TokenUsage | null {
  if (!raw || typeof raw !== 'object') return null
  // Підтримуємо назви полів від n8n AI-нод і OpenAI-сумісних провайдерів
  const inputTokens =
    raw.inputTokens ??
    raw.input_tokens ??
    raw.promptTokens ??
    raw.prompt_tokens ??
    raw.totalInputTokens ??
    0
  const outputTokens =
    raw.outputTokens ??
    raw.output_tokens ??
    raw.completionTokens ??
    raw.completion_tokens ??
    raw.totalOutputTokens ??
    0
  const totalTokens =
    raw.totalTokens ??
    raw.total_tokens ??
    (inputTokens + outputTokens)
  return { inputTokens, outputTokens, totalTokens }
}
