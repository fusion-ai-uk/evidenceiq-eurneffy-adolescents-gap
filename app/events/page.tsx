import { ArrowRight, Activity, Shield, Key, HeartPulse, Eye, ThumbsUp, MessageSquare, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function EventsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1>Events Tracker — ASH 2025</h1>
        <p className="lead">Congress‑specific analysis aligned to the EvidenceIQ narrative.</p>
        <div className="text-xs text-muted-foreground">67th ASH Annual Meeting · Dec 6–9, 2025 · Orlando + Virtual</div>
      </div>

      {/* Quick metrics */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="Attendees" value="30k+"></MiniStat>
        <MiniStat label="Accepted abstracts" value="8k+"></MiniStat>
        <MiniStat label="Posts sampled (#ASH25)" value="142"></MiniStat>
        <MiniStat label="Peak day (DLBCL)" value="Dec 8"></MiniStat>
      </div>

      {/* Event overview */}
      <Section title="Event headline" subtitle="What ASH 2025 meant for DLBCL + Zynlonta">
        <InfoCard title="The three big narratives" icons={[Activity, TrendingUp, Eye]}>
          CAR‑T durability and attempts to move earlier; real‑world “stress testing” of CD20×CD3 bispecifics; ADC strategies positioning Zynlonta as a partner and bridge around CAR‑T (e.g., combinations and consolidation).
        </InfoCard>
        <InfoCard title="Where Zynlonta fits" icons={[Key, HeartPulse, MessageSquare]}>
          Less about headline phase‑3 news; more about refining role in late‑line DLBCL, CAR‑T consolidation, bispecific combinations, and selective expansion signals (e.g., WM).
        </InfoCard>
      </Section>

      {/* Conversation pulse */}
      <Section title="Digital conversation pulse" subtitle="#ASH25 sample (Dec 4–11)">
        <InfoCard title="Volume and timing" icons={[Eye, TrendingUp, MessageSquare]}>
          142 posts sampled. Low pre‑meeting chatter, peak on Dec 8 with DLBCL orals, and a second spike Dec 11 driven by recap threads and LOTIS‑7 coverage.
        </InfoCard>
        <InfoCard title="Share of voice" icons={[Eye, ThumbsUp, MessageSquare]}>
          CAR‑T (~19%), epcoritamab (~16%), glofitamab (~13%), bispecifics generic (~8%), Zynlonta (~5%). Zynlonta’s volume is small but engagement per post is higher than average, reflecting centre‑of‑excellence accounts.
        </InfoCard>
      </Section>

      {/* Zynlonta data call‑outs */}
      <Section title="Zynlonta data spotlight" subtitle="Key items at / around ASH 2025">
        <InfoCard title="CAR‑T PR consolidation (phase II futility analysis supports continuation)" icons={[Activity, Shield, TrendingUp]}>
          Short‑course loncastuximab after CAR‑T partial response aims to deepen remissions without undermining CAR‑T. Frames Zynlonta as a CAR‑T companion, not only salvage.
        </InfoCard>
        <InfoCard title="Real‑world Lonca in high‑risk LBCL" icons={[HeartPulse, Eye, Activity]}>
          Multicentre analyses showed outcomes consistent with LOTIS‑2 in older/comorbid patients, reinforcing everyday usability in “messy” practice.
        </InfoCard>
        <InfoCard title="WM‑NET1 (Waldenström) signal" icons={[TrendingUp, Eye, ThumbsUp]}>
          Deep responses reported, including high‑risk subgroups — supports a broader CD19‑ADC platform story beyond DLBCL.
        </InfoCard>
        <InfoCard title="LOTIS‑7 (Zynlonta + Glofitamab) update context" icons={[Activity, TrendingUp, Shield]}>
          Early datasets show high ORR/CR with manageable CRS/ICANS. Clinical momentum positive; investor commentary was mixed, creating noise separate from the clinical story.
        </InfoCard>
      </Section>

      {/* Competitive lens */}
      <Section title="Competitive lens @ ASH 2025" subtitle="What stole the spotlight">
        <InfoCard title="Bispecifics reality check" icons={[Activity, Shield, HeartPulse]}>
          Real‑world epcoritamab/glofitamab: ORR ~50%, modest PFS/OS vs trials; CD20 loss at progression reported frequently. Reinforces a post‑CD20 role for CD19 approaches like Zynlonta.
        </InfoCard>
        <InfoCard title="CAR‑T remains the durability benchmark" icons={[Activity, TrendingUp, Key]}>
          Durable responders continue to anchor the efficacy frame, but capacity, toxicity, and the need for bridging/consolidation keep adjacent options in focus.
        </InfoCard>
      </Section>

      {/* Signals to watch */}
      <Section title="Signals to watch" subtitle="Risks and opportunities surfaced at ASH 2025">
        <InfoCard title="Post‑CD20 niche" icons={[Key, Eye, Activity]}>
          CD20 loss after bispecifics creates a clear CD19 window; Zynlonta should show up explicitly in post‑bsAb algorithms.
        </InfoCard>
        <InfoCard title="CAR‑T adjacency" icons={[TrendingUp, Activity, HeartPulse]}>
          Consolidation for PR, bridging cytoreduction, and relapse salvage remain practical lanes where ADCs fit clinical workflows.
        </InfoCard>
        <InfoCard title="Combination future" icons={[TrendingUp, ThumbsUp, Shield]}>
          ADC + bispecific regimens (e.g., LOTIS‑7) represent a new therapeutic pair with encouraging efficacy and manageable immune‑toxicity.
        </InfoCard>
      </Section>

      {/* Footer link to congress site */}
      <div className="text-xs text-muted-foreground">
        Source context: ASH Annual Meeting —{" "}
        <Link href="https://annualmeeting.hematology.org" className="text-primary underline" target="_blank" rel="noreferrer">
          annualmeeting.hematology.org
        </Link>
      </div>
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        </div>
        {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </div>
  )
}

function InfoCard({ title, icons = [], children }: { title: string; icons?: any[]; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="text-sm font-semibold tracking-tight">{title}</div>
        <div className="flex items-center gap-1 text-muted-foreground">
          {icons.slice(0, 3).map((Ic, i) => (
            <span key={i} className="inline-flex"><Ic className="h-4 w-4" /></span>
          ))}
        </div>
      </div>
      <p className="text-[13px] leading-6 text-muted-foreground">{children}</p>
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
