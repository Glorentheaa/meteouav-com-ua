/**
 * Повертає поточний час у форматі української локалі за київським часом (Europe/Kyiv)
 * Приклад: "16.09.2026 о 11:00"
 */
export const getUaTime = (): string => {
  return new Date().toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Kyiv'
  }).replace(',', ' о')
}

/**
 * Форматує дати для прогнозу на сьогодні й завтра.
 * Приклад: "15-16 вересня" або "30 вересня - 01 жовтня"
 */
export const getForecastDatesText = (): string => {
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const d1 = today.getDate()
  const m1 = today.toLocaleDateString('uk-UA', { month: 'long' })
  const d2 = tomorrow.getDate()
  const m2 = tomorrow.toLocaleDateString('uk-UA', { month: 'long' })

  return m1 === m2 ? `${d1}-${d2} ${m1}` : `${d1} ${m1} - ${d2} ${m2}`
}
