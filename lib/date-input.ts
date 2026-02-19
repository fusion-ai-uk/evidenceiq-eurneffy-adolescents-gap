export function toDateInputValue(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function normalizeDateRange(startDate: string, endDate: string) {
  if (!startDate || !endDate) return { startDate, endDate }
  if (startDate <= endDate) return { startDate, endDate }
  return { startDate: endDate, endDate: startDate }
}

