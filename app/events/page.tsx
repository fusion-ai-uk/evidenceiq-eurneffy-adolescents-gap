import Link from "next/link"
import { CongressTracker } from "@/components/events/congress-tracker"
import { CongressSessions } from "@/components/events/congress-sessions"
import { KOLMentions } from "@/components/events/kol-mentions"
import { AshShareOfVoice } from "@/components/events/ash-sov"
import { TimelineChart } from "@/components/timeline-chart"

export default function EventsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1>Events Tracker — ASH 2025</h1>
        <p className="lead">Focused congress analysis with charts and report‑style UI.</p>
        <div className="text-xs text-muted-foreground">67th ASH Annual Meeting · Dec 6–9, 2025 · Orlando + Virtual</div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <MiniStat label="Attendees" value="30k+"></MiniStat>
        <MiniStat label="Accepted abstracts" value="8k+"></MiniStat>
        <MiniStat label="#ASH25 posts sampled" value="142"></MiniStat>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CongressTracker />
        <AshShareOfVoice />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CongressSessions />
        <KOLMentions />
      </div>

      <TimelineChart />

      <div className="text-xs text-muted-foreground">
        Source context: ASH Annual Meeting —{" "}
        <Link href="https://annualmeeting.hematology.org" className="text-primary underline" target="_blank" rel="noreferrer">
          annualmeeting.hematology.org
        </Link>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  )
}
