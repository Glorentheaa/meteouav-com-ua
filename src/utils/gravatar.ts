/**
 * Генерує URL аватарки Gravatar на основі хешу SHA-256 електронної пошти.
 * Використовує нативний Web Crypto API без зовнішніх залежностей.
 */
export async function getGravatarUrl(email: string, size = 160): Promise<string> {
  const trimmed = email.trim().toLowerCase()
  if (!trimmed) {
    return `https://www.gravatar.com/avatar/0000000000000000000000000000000000000000000000000000000000000000?d=mp&s=${size}`
  }

  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(trimmed)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    return `https://www.gravatar.com/avatar/${hashHex}?d=identicon&s=${size}`
  } catch {
    return `https://www.gravatar.com/avatar/0000000000000000000000000000000000000000000000000000000000000000?d=mp&s=${size}`
  }
}

/**
 * Генерує ініціали для заглушки, якщо аватар ще завантажується
 */
export function getInitials(nameOrEmail?: string): string {
  if (!nameOrEmail) return 'U'
  const clean = nameOrEmail.trim()
  if (clean.includes('@')) {
    return clean[0].toUpperCase()
  }
  const parts = clean.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return clean.slice(0, 2).toUpperCase()
}
