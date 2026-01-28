import { sha1 } from "@/lib/alunbrig/executiveCardFactory"
import type { ExecutiveCardsResponse } from "@/lib/alunbrig/executiveCardFactory"

type CardsCacheEntry = {
  ts: number
  data: ExecutiveCardsResponse
  index: Map<
    string,
    {
      bucket: string
      normalizedTitle: string
      clusterKey: string
      view: string
      week: string
      periodStartDate: string
      periodEndDate: string
      filters: any
    }
  >
}

type WeeksCacheEntry = {
  ts: number
  data: { weeks: Array<{ week: string; startDate: string; endDate: string; posts: number }>; defaultWeek: string }
}

const TTL_MS = 15 * 60 * 1000

function now() {
  return Date.now()
}

function getStore() {
  const g = globalThis as any
  if (!g.__eviq_exec_cards_cache) g.__eviq_exec_cards_cache = new Map<string, CardsCacheEntry>()
  if (!g.__eviq_exec_weeks_cache) g.__eviq_exec_weeks_cache = new Map<string, WeeksCacheEntry>()
  if (!g.__eviq_exec_card_index) g.__eviq_exec_card_index = new Map<string, any>()
  return {
    cards: g.__eviq_exec_cards_cache as Map<string, CardsCacheEntry>,
    weeks: g.__eviq_exec_weeks_cache as Map<string, WeeksCacheEntry>,
    index: g.__eviq_exec_card_index as Map<
      string,
      {
        ts: number
        bucket: string
        normalizedTitle: string
        clusterKey: string
        view: string
        week: string
        periodStartDate: string
        periodEndDate: string
        filters: any
      }
    >,
  }
}

export function makeCacheKey(obj: any) {
  return sha1(JSON.stringify(obj))
}

export function getCachedWeeks(key: string) {
  const store = getStore()
  const hit = store.weeks.get(key)
  if (!hit) return null
  if (now() - hit.ts > TTL_MS) {
    store.weeks.delete(key)
    return null
  }
  return hit.data
}

export function setCachedWeeks(key: string, data: WeeksCacheEntry["data"]) {
  const store = getStore()
  store.weeks.set(key, { ts: now(), data })
}

export function getCachedCards(key: string) {
  const store = getStore()
  const hit = store.cards.get(key)
  if (!hit) return null
  if (now() - hit.ts > TTL_MS) {
    store.cards.delete(key)
    return null
  }
  for (const [cardId, info] of hit.index.entries()) {
    store.index.set(cardId, { ts: hit.ts, ...info })
  }
  return hit.data
}

export function setCachedCards(key: string, data: ExecutiveCardsResponse) {
  const store = getStore()

  const index = new Map<string, any>()
  for (const section of data.sections || []) {
    for (const c of section.cards || []) {
      const clusterKey = c.drilldown?.cluster?.clusterKey || ""
      const bucket = c.drilldown?.cluster?.bucket || c.bucket || ""
      const normalizedTitle = clusterKey.includes("::") ? clusterKey.split("::").slice(1).join("::") : ""
      index.set(c.cardId, {
        bucket,
        normalizedTitle,
        clusterKey,
        view: data.meta.view,
        week: data.meta.week,
        periodStartDate: c.drilldown?.period?.startDate || "",
        periodEndDate: c.drilldown?.period?.endDate || "",
        filters: data.meta.filters,
      })
    }
  }

  const entry: CardsCacheEntry = { ts: now(), data, index }
  store.cards.set(key, entry)
  for (const [cardId, info] of index.entries()) store.index.set(cardId, { ts: entry.ts, ...info })
}

export function getCardIndex(cardId: string) {
  const store = getStore()
  const hit = store.index.get(cardId)
  if (!hit) return null
  if (now() - hit.ts > TTL_MS) {
    store.index.delete(cardId)
    return null
  }
  return hit
}
