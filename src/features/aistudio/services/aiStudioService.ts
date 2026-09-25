import {
  type AiGem,
  type AiStudioSettings,
  type AiChatSession,
  type N8nAiStudioPayload,
} from '../types'
import { BUILT_IN_GEMS, DEFAULT_AI_STUDIO_SETTINGS } from '../defaultGems'

const STORAGE_KEYS = {
  SETTINGS: 'meteo_aistudio_settings_v1',
  GEMS: 'meteo_aistudio_gems_v1',
  SESSIONS: 'meteo_aistudio_sessions_v1',
  ACTIVE_SESSION_ID: 'meteo_aistudio_active_session_id',
  ACTIVE_GEM_ID: 'meteo_aistudio_active_gem_id',
}

export class AiStudioStorage {
  // --- Налаштування (Settings) ---
  static getSettings(): AiStudioSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (raw) {
        return { ...DEFAULT_AI_STUDIO_SETTINGS, ...JSON.parse(raw) }
      }
    } catch (e) {
      console.error('Помилка читання aiStudio налаштувань:', e)
    }
    return DEFAULT_AI_STUDIO_SETTINGS
  }

  static saveSettings(settings: AiStudioSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
    } catch (e) {
      console.error('Помилка збереження aiStudio налаштувань:', e)
    }
  }

  // --- Фахівці (Gems) ---
  static getGems(): AiGem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.GEMS)
      if (raw) {
        const customGems: AiGem[] = JSON.parse(raw)
        // Об'єднуємо вбудовані та кастомні
        const builtInIds = new Set(BUILT_IN_GEMS.map((g) => g.id))
        const filteredCustom = customGems.filter((g) => !builtInIds.has(g.id))
        return [...BUILT_IN_GEMS, ...filteredCustom]
      }
    } catch (e) {
      console.error('Помилка читання Gems:', e)
    }
    return BUILT_IN_GEMS
  }

  static saveCustomGem(gem: AiGem): AiGem[] {
    const all = this.getGems()
    const index = all.findIndex((g) => g.id === gem.id)
    let updated: AiGem[]

    if (index >= 0) {
      updated = [...all]
      updated[index] = { ...gem, isBuiltIn: false }
    } else {
      updated = [...all, { ...gem, isBuiltIn: false, createdAt: Date.now() }]
    }

    try {
      const customOnly = updated.filter((g) => !g.isBuiltIn)
      localStorage.setItem(STORAGE_KEYS.GEMS, JSON.stringify(customOnly))
    } catch (e) {
      console.error('Помилка збереження кастомного Gem:', e)
    }
    return updated
  }

  static deleteCustomGem(gemId: string): AiGem[] {
    const all = this.getGems()
    const updated = all.filter((g) => g.id !== gemId || g.isBuiltIn)
    try {
      const customOnly = updated.filter((g) => !g.isBuiltIn)
      localStorage.setItem(STORAGE_KEYS.GEMS, JSON.stringify(customOnly))
    } catch (e) {
      console.error('Помилка видалення Gem:', e)
    }
    return updated
  }

  // --- Сесії (Sessions) ---
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
      console.error('Помилка читання сесій aiStudio:', e)
    }
    return []
  }

  static saveSessions(sessions: AiChatSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))
    } catch (e) {
      console.error('Помилка збереження сесій aiStudio:', e)
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

  static getActiveGemId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_GEM_ID) || BUILT_IN_GEMS[0].id
  }

  static setActiveGemId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_GEM_ID, id)
  }
}

// Генерація реалістичної відповіді при відсутності webhookUrl (демонстрація/офлайн режим)
function generateMockResponse(gem: AiGem, prompt: string): string {
  const p = prompt.toLowerCase()

  if (gem.id === 'uav-meteorologist' || p.includes('вітер') || p.includes('обледен') || p.includes('погод')) {
    return `### 🌤️ Оцінка авіаметеорологічних умов

За вашим запитом щодо **${prompt.slice(0, 60)}...**:

1. **Вертикальний профіль вітру**:
   - Приземний шар (0–50 м): швидкість 4–6 м/с, пориви до 8 м/с.
   - Робочий ешелон (150–500 м): прогнозується посилення до **11–13 м/с** через градієнт тиску.
   - Ризик вертикального зсуву вітру (Wind Shear) становить **середній рівень** у перехідній зоні 80–120 м.

2. **Температурний режим та обледеніння**:
   - При високій вологості (>85%) та температурі в діапазоні від **-2°C до +3°C** існує прямий ризик намерзання на лопатях та передній кромці крила.
   - Рекомендується моніторинг температури сенсорів та споживання струму (збільшення струму на 15–20% вказує на початок обледеніння).

> **Висновок метеоролога**: Умови придатні для досвідчених екіпажів з урахуванням висотного вітру. Потрібен запас батареї для польоту проти вітру не менше 30%.`
  }

  if (gem.id === 'flight-window-analyst' || p.includes('вікно') || p.includes('час') || p.includes('розраху')) {
    return `### ⏱️ Аналіз польотного вікна місії

Аналіз метеопараметрів на найближчі години:

| Часовий проміжок | Статус | Вітер (середній/пориви) | Примітки |
| :--- | :--- | :--- | :--- |
| **06:00 – 09:30** | 🟢 Сприятливо | 3–5 м/с (пориви 7) | Оптимальне вікно для старту та калібрування |
| **09:30 – 13:00** | 🟡 Прикордонно | 7–10 м/с (пориви 13) | Розвиток терміків, можлива бовтанка |
| **13:00 – 16:30** | 🔴 Не рекомендовано | 11–15 м/с (пориви 18) | Небезпека перевищення лімітів для легких БПЛА |
| **17:00 – 20:30** | 🟢 Сприятливо | 4–6 м/с (пориви 8) | Вечірнє затишшя, стабільний повітряний потік |

**Рекомендація**: Заплануйте основний виліт у ранкове або вечірнє вікно з поверненням до 09:30 або після 17:00.`
  }

  if (gem.id === 'hardware-battery-engineer' || p.includes('акб') || p.includes('батаре') || p.includes('мотор')) {
    return `### 🔋 Інженерний висновок щодо живлення та силової установки

1. **Вплив температури на опір (Internal Resistance)**:
   - При температурі акумулятора нижче +10°C внутрішній опір зростає в 1.8–2.5 рази.
   - Це викликає різке просідання напруги (Voltage Sag) на зльоті при високих струмах.

2. **Практичні правила експлуатації**:
   - Перед встановленням прогрівайте АКБ до +25...+30°C у термосумці.
   - Перші 60–90 секунд польоту виконуйте у плавному режимі без різких перегазовок.
   - Встановіть поріг повернення (Failsafe) на 0.2 В вище звичайного (наприклад, 3.4 В/банка для Li-Ion).`
  }

  if (gem.id === 'navigator-ew' || p.includes('реб') || p.includes('навігац') || p.includes('компас')) {
    return `### 🧭 Штурманський розрахунок та навігаційні ризики

1. **Розрахунок шляхової швидкості (Ground Speed)**:
   - Власна повітряна швидкість (TAS): ~70 км/год (~19.4 м/с).
   - Зустрічний вітер: 10 м/с.
   - Фактична швидкість над землею складе **9.4 м/с (~34 км/год)**.
   - Час на зворотний шлях збільшиться більш ніж удвічі!

2. **Заходи протидії РЕБ/спуфінгу GNSS**:
   - Фіксуйте магнітний курс точки старту (Home Heading) до зльоту.
   - Перевірте роботу барометра та встановіть висоту повернення вище локальних перешкод.
   - При втраті GPS негайно переводьте апарат у режим стабілізації (Altitude/Manual) та розвертайте проти заздалегідь визначеного азимуту безпеки.`
  }

  return `### 🤖 Відповідь фахівця: ${gem.name}

Ваш запит опрацьовано згідно з глобальними інструкціями та спеціалізацією агента:

- **Суть аналізу**: ${prompt}
- **Дисципліна**: ${gem.role}
- **Статус інтеграції n8n**: Webhook URL наразі не налаштовано, тому відповідь згенеровано в локальному демонстраційному режимі.

Для повної бойової інтеграції з вашою n8n-нодою відкрийте **Налаштування ⚙️** у лівому меню та вкажіть вашу URL-адресу вебхука (наприклад, \`https://n8n.yourdomain.com/webhook/ai-studio\`). Тоді всі запити автоматично передаватимуться у ваш робочий процес!`
}

// Головна функція відправки повідомлення
export async function sendAiStudioMessage(params: {
  session: AiChatSession
  gem: AiGem
  userMessage: string
  attachments?: Array<{ name: string; type: string; size: number }>
  userProfile?: {
    id: string
    nickname: string
    email?: string | null
    isPro: boolean
  }
}): Promise<{ text: string; isSimulated: boolean }> {
  const { session, gem, userMessage, attachments, userProfile } = params
  const settings = AiStudioStorage.getSettings()

  // Формуємо повний контракт для n8n
  const effectiveSystemPrompt = `${settings.globalInstructions.trim()}\n\n--- СПЕЦІАЛІЗАЦІЯ ФАХІВЦЯ (${gem.name}) ---\nРоль: ${gem.role}\n${gem.systemPromptAddon.trim()}`

  const payload: N8nAiStudioPayload = {
    sessionId: session.id,
    sessionTitle: session.title,
    message: userMessage,
    history: session.messages.slice(-10).map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
    agent: {
      id: gem.id,
      name: gem.name,
      role: gem.role,
      systemPromptAddon: gem.systemPromptAddon,
    },
    globalInstructions: settings.globalInstructions,
    effectiveSystemPrompt,
    model: settings.defaultModel,
    temperature: settings.temperature,
    attachments,
    user: userProfile,
    timestamp: new Date().toISOString(),
  }

  // Якщо webhook URL не задано — повертаємо локальну демонстраційну відповідь
  if (!settings.webhookUrl || !settings.webhookUrl.trim()) {
    // Невелика реалістична затримка (600-1200мс)
    await new Promise((resolve) => setTimeout(resolve, 800))
    return {
      text: generateMockResponse(gem, userMessage),
      isSimulated: true,
    }
  }

  // Відправка на реальний n8n webhook
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*',
    }

    if (settings.bearerToken && settings.bearerToken.trim()) {
      headers['Authorization'] = `Bearer ${settings.bearerToken.trim()}`
    }

    const response = await fetch(settings.webhookUrl.trim(), {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`n8n webhook відповів зі статусом ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const json = await response.json()

      // Підтримуємо різні популярні формати виводу n8n:
      // 1. { output: "text" }
      // 2. { text: "text" }
      // 3. { message: "text" }
      // 4. { response: "text" }
      // 5. [{ json: { output: "..." } }] (n8n масив)
      let extracted = ''
      if (typeof json === 'string') {
        extracted = json
      } else if (Array.isArray(json) && json[0]) {
        const item = json[0]
        extracted = item.output || item.text || item.message || item.response || item.json?.output || item.json?.text || JSON.stringify(item, null, 2)
      } else if (typeof json === 'object') {
        extracted = json.output || json.text || json.message || json.response || json.result || JSON.stringify(json, null, 2)
      }

      return {
        text: extracted || 'Отримано порожню відповідь від n8n.',
        isSimulated: false,
      }
    } else {
      const text = await response.text()
      return {
        text: text || 'Отримано відповідь без тексту.',
        isSimulated: false,
      }
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('Помилка запиту до n8n webhook:', errorMsg)
    throw new Error(`Помилка підключення до n8n webhook: ${errorMsg}`)
  }
}
