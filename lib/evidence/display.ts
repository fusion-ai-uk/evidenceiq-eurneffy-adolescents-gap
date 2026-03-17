const ACRONYMS = new Map<string, string>([
  ["uk", "UK"],
  ["eur", "EUR"],
  ["kol", "KOL"],
  ["hcp", "HCP"],
  ["aya", "AYA"],
  ["aai", "AAI"],
  ["eurneffy", "EURneffy"],
  ["mhra", "MHRA"],
  ["nice", "NICE"],
  ["bsaci", "BSACI"],
  ["nhs", "NHS"],
  ["gp", "GP"],
  ["ed", "ED"],
])

function normalizeAcronyms(text: string): string {
  return text.replace(/\b[a-zA-Z]{2,}\b/g, (word) => {
    const mapped = ACRONYMS.get(word.toLowerCase())
    if (!mapped) return word
    const plural = /s$/i.test(word) ? "s" : ""
    return `${mapped}${plural}`
  })
}

export function humanizeLabel(input: string): string {
  if (!input) return ""
  const raw = input.trim()
  const cleaned = raw
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  // Preserve natural-language phrases (questions/sentences) and only normalize acronyms.
  // This avoids turning sentence text into Title Case and corrupting acronym casing.
  const looksLikeNaturalLanguage =
    !/[._-]/.test(raw) &&
    (/[?!,:;]/.test(cleaned) || cleaned.split(" ").length >= 6)

  if (looksLikeNaturalLanguage) {
    return normalizeAcronyms(cleaned.charAt(0).toUpperCase() + cleaned.slice(1))
  }

  return cleaned
    .split(" ")
    .map((word) => {
      // Preserve words that already have intentional casing (e.g., AAIs, iPhone, eURneffy).
      if (/[A-Z].*[A-Z]/.test(word) || /[a-z][A-Z]|[A-Z][a-z].*[A-Z]/.test(word)) {
        return word
      }
      const lower = word.toLowerCase()
      if (ACRONYMS.has(lower)) return ACRONYMS.get(lower)!
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(" ")
    .replace(/\bAais\b/g, "AAIs")
}

export function formatShare(value: number, total: number, decimals = 0): string {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) {
    const zero = decimals > 0 ? `0.${"0".repeat(decimals)}` : "0"
    return `${zero}%`
  }
  const pct = (value / total) * 100
  return `${pct.toFixed(decimals)}%`
}

