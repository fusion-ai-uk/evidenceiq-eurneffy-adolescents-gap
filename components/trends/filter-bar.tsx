"use client"
import { useEffect, useMemo, useState } from "react"
import { GroupFilter } from "@/components/trends/group-filter"
import { HintIcon } from "@/components/ui/hint"

type Props = {
  groups?: string[]
  metric: string
  audience: string
  selectedGroups: string[]
  minSentiment: number
  search: string
  onChange: (v: { groups: string[]; metric: string; audience: string; minSentiment: number; search: string }) => void
}

export function FilterBar({ groups = [], metric, audience, selectedGroups, minSentiment, search, onChange }: Props) {
  const [local, setLocal] = useState({ groups: selectedGroups, metric, audience, minSentiment, search })

  useEffect(() => {
    setLocal({ groups: selectedGroups, metric, audience, minSentiment, search })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metric, audience, minSentiment, search])

  const onInput = (patch: Partial<typeof local>) => {
    const next = { ...local, ...patch }
    setLocal(next)
    onChange(next)
  }

  return (
    <div className="grid gap-3 md:grid-cols-3 sticky top-14 z-[100000] bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 rounded-md p-3 border">
      <div id="metric-select" className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Metric
          <HintIcon
            className="ml-2 align-middle"
            content={"Views: estimated reach. Engagement: likes + replies + reshares. Mentions: raw post count. Tip: Views shape perceptions; Engagement shows what’s persuasive or contentious."}
          />
        </span>
        <select
          value={local.metric}
          onChange={(e) => onInput({ metric: e.target.value })}
          className="h-8 bg-background text-foreground border border-input rounded-md px-2 text-sm"
        >
          <option value="viewCount">Views</option>
          <option value="likeCount">Likes</option>
          <option value="replyCount">Replies</option>
          <option value="retweetCount">Reshares</option>
        </select>
        <span className="text-[10px] text-muted-foreground">Weighted by audience selection</span>
      </div>
      <div id="group-select" className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Group
          <HintIcon
            className="ml-2 align-middle"
            content={"Themes cluster into Efficacy, Access, and Quality of Life. Compare where attention concentrates vs where sentiment is strong/weak to guide 3L now and 2L prep."}
          />
        </span>
        <select
          value={local.groups.length === 1 ? local.groups[0] : "__all"}
          onChange={(e) => onInput({ groups: e.target.value === "__all" ? [] : [e.target.value] })}
          className="h-8 bg-background text-foreground border border-input rounded-md px-2 text-sm"
        >
          <option value="__all">All groups</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
      <div id="audience-select" className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Audience
          <HintIcon
            className="ml-2 align-middle"
            content={"Audience is probabilistic. Scores weight posts by likelihood (HCP, patient, caregiver, payer). Use it to see how the same theme reads differently."}
          />
        </span>
        <select
          value={local.audience}
          onChange={(e) => onInput({ audience: e.target.value })}
          className="h-8 bg-background text-foreground border border-input rounded-md px-2 text-sm"
        >
          <option value="all">All</option>
          <option value="hcp">HCP</option>
          <option value="patient">Patient</option>
          <option value="caregiver">Caregiver</option>
          <option value="payer">Payer / NHS</option>
        </select>
      </div>
      <div id="topic-search" className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Search
          <HintIcon
            className="ml-2 align-middle"
            content={"Matches Topic Title and Summary. Try entities (“NICE TA947”) or needs (“capacity”, “rash”). Combine with audience to see who’s driving it."}
          />
        </span>
        <input
          value={local.search}
          onChange={(e) => onInput({ search: e.target.value })}
          placeholder="Find a topic"
          className="h-8 bg-background text-foreground border border-input rounded-md px-2 text-sm"
        />
      </div>
      <div id="min-sentiment" className="md:col-span-4 flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-40">Min sentiment ({local.minSentiment.toFixed(2)})
          <HintIcon
            className="ml-2 align-middle"
            content={"Filter by tone, not topic. Push higher—if a theme disappears, it draws attention but isn’t liked (prime for message work)."}
          />
        </span>
        <input
          type="range"
          min={-1}
          max={1}
          step={0.05}
          value={local.minSentiment}
          onChange={(e) => onInput({ minSentiment: parseFloat(e.target.value) })}
          className="w-64"
        />
      </div>
    </div>
  )
}


