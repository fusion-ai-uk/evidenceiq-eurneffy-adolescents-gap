"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type TakeawayCard = {
  title: string
  summary: string
  signalsShown: string
  tags: string[]
}

const GENERAL_THEMES_TAKEAWAYS: TakeawayCard[] = [
  {
    title: "CNS and brain mets are a dominant conversation anchor",
    summary:
      "Across the topic list, brain/CNS content is consistently high-volume. Brain and CNS framing appears repeatedly (brain metastases, CNS activity, intracranial activity), suggesting CNS is a structural lens in the dataset, not a one-off spike.",
    signalsShown:
      "Signals shown: brain metastases ( Sentiment 58.2; CNS 100%; Neurotox 15%; QoL 21%; top stakeholders: HCP, Media, Org/Institution). CNS activity ( Sentiment 71.4; CNS 100%; Neurotox 12%). Intracranial activity ( Sentiment 70.9; CNS 100%; Neurotox 9%).",
    tags: ["Sentiment", "CNS", "Neurotox", "QoL", "Stakeholders"],
  },
  {
    title: "Sequencing is explicitly named and shows up as a strong signal",
    summary:
      "Sequencing is not just implied. It shows up directly as top-row themes (sequencing, treatment sequencing) and appears connected to first-line framing and endpoints (PFS, OS benefit). Net: sequencing is both a direct theme and a repeated lens across outcomes/decisions.",
    signalsShown:
      "Signals shown: sequencing ( Sentiment 56.6; Seq 100%; QoL 14%; CNS 11%). Treatment sequencing ( Sentiment 54.1; Seq 100%). First-line therapy ( Sentiment 61.9; Seq 59%). PFS ( Sentiment 65.9; Seq 50%). OS benefit ( Sentiment 72.3; Seq 85%).",
    tags: ["Sequencing", "Sentiment", "Outcomes framing", "Stakeholders"],
  },
  {
    title: "Quality-of-life and survivorship have clear patient/advocacy fingerprints",
    summary:
      "QoL is high-volume and consistently QoL-tagged (QoL, quality of life, quality_of_life). There is also a visible patient/advocacy presence in the stakeholder mix (survivorship, patient advocacy, ALK community), indicating these themes are not purely HCP-coded.",
    signalsShown:
      "Signals shown: QoL ( Sentiment 64.4; QoL 100%; top stakeholders: HCP, Org/Institution, Advocacy). Survivorship ( Sentiment 78.4; QoL 100%; top stakeholders: Patient, Advocacy, Org/Institution). Patient advocacy ( Sentiment 70.0; QoL 64%; UK access 32%). ALK community ( Sentiment 79.1; QoL 54%; UK access 25%).",
    tags: ["QoL", "Audience", "UK access (where present)", "Sentiment"],
  },
  {
    title: "Testing / diagnostics / biomarkers are a steady backbone theme",
    summary:
      "Testing and precision language shows up repeatedly at meaningful volumes (biomarkers, biomarker testing, diagnostics, precision medicine, molecular testing). These rows also show sequencing overlap, suggesting testing is often discussed in a pathway/decision context.",
    signalsShown:
      "Signals shown: biomarkers ( Sentiment 56.9; Seq 52%; CNS 15%). Biomarker testing ( Sentiment 71.4; Seq 50%; QoL 33%). Diagnostics ( Sentiment 64.9; Seq 35%). Precision medicine ( Sentiment 68.4; Seq 43%). Molecular testing ( Sentiment 59.7; Seq 55%).",
    tags: ["Biomarkers/Testing", "Sequencing", "Sentiment", "Stakeholders"],
  },
  {
    title: "Tolerability/toxicity is present and sentiment is more mixed than other themes",
    summary:
      "Safety-adjacent language is visible (toxicity, tolerability, safety). Toxicity has a lower sentiment index than many other themes, while tolerability is higher and shows a large CNS tag share. A competitor-specific row (lorlatinib) also aligns with tracked neurotox/CNS lenses.",
    signalsShown:
      "Signals shown: toxicity ( Sentiment 52.3; Seq 52%; QoL 36%; Neurotox 2%; CNS 11%). Tolerability ( Sentiment 69.6; Neurotox 5%; CNS 45%). Safety ( Sentiment 64.7; CNS 28%). Lorlatinib ( Sentiment 57.4; Neurotox 18%; CNS 35%).",
    tags: ["Safety", "Neurotox", "CNS", "Sentiment", "Sequencing (where tagged)"],
  },
]

const TRENDS_EXPLORER_TAKEAWAYS: TakeawayCard[] = [
  {
    title: "Spikes are driven by CNS + outcomes + safety moments (mostly HCP-led)",
    summary:
      "Across the biggest above-baseline weeks, the same trio keeps surfacing: CNS/intracranial activity, hard outcomes (OS, PFS, ORR), and manageable safety. When conversation jumps, it is usually because people are reacting to clinically anchored signals rather than broader awareness chatter.",
    signalsShown:
      "Signals seen in the alerts list: CNS activity; intracranial ORR; high ORR; OS trend/OS improvement; PFS benefit; manageable safety; efficacy/safety framing; trial-result moments.",
    tags: ["Conversation", "Momentum", "CNS", "Safety", "Durability"],
  },
  {
    title: "Sequencing + post-TKI therapy is a rising narrative",
    summary:
      "In the Theme evolution panel, sequencing and post-TKI therapy are explicitly moving up. That suggests the market is increasingly thinking beyond best first-line drug and toward pathway logic (what comes next, what options remain later).",
    signalsShown: "Signals seen in theme evolution: sequencing rising; post-TKI therapy rising.",
    tags: ["Momentum", "Durability", "Conversation"],
  },
  {
    title: "Competitor names are increasingly part of the trend signal",
    summary:
      "The rising list includes lorlatinib and alectinib, implying the trend conversation is not happening in a vacuum. People are comparing, referencing, and contextualizing choices against named options.",
    signalsShown: "Signals seen in theme evolution: lorlatinib rising; alectinib rising.",
    tags: ["Conversation", "Momentum", "Attention"],
  },
  {
    title: "Intracranial/CNS performance is a consistent attention magnet",
    summary:
      "CNS shows up twice in the trend view: it is rising as a theme and it is a repeat driver behind the biggest above-baseline alerts. When the community has something new or notable to react to, CNS/intracranial performance is one of the most reliable triggers for attention and discussion.",
    signalsShown:
      "Signals seen across both panels: intracranial activity rising; CNS activity rising; repeated spikes driven by CNS activity/intracranial ORR/brain mets context.",
    tags: ["Attention", "Conversation", "Momentum", "CNS"],
  },
  {
    title: "Some baseline pillars are cooling: Access/UK + Safety/Neuro + education",
    summary:
      "The Falling panel shows Access/UK, Safety/Neuro, and education trending down (with PFS also declining). That does not mean they are unimportant; it means they are less likely to be the headline driver right now versus sequencing/post-TKI logic, intracranial/CNS emphasis, and outcome-anchored updates.",
    signalsShown: "Signals seen in theme evolution: Access/UK falling; Safety/Neuro falling; education falling; PFS falling.",
    tags: ["Cooling", "Access", "Safety", "Durability", "Conversation"],
  },
]

const AUDIENCE_INSIGHTS_TAKEAWAYS: TakeawayCard[] = [
  {
    title: "The conversation is HCP-led - but QoL is where patients/caregivers own the room",
    summary:
      "The audience split is dominated by HCP, but the HCP vs Patient vs Caregiver panel shows QoL skewing heavily to patients and caregivers relative to HCP. Practical implication: QoL messaging will land best when it is structured for patient/caregiver reality, not just clinical endpoints.",
    signalsShown: "Signals seen in the audience panel: QoL skews toward Patient/Caregiver versus HCP.",
    tags: ["Audience", "QoL", "Conversation"],
  },
  {
    title: "Sequencing is the primary decision frame (patient selection + toxicity management sit inside it)",
    summary:
      "Sequencing shows up as the top organizing bucket. Sequencing driver-tags include patient selection, toxicity management, access to NGS, and biomarker-driven sequencing. Market language is already order-of-therapy shaped.",
    signalsShown: "Signals seen in sequencing drivers: patient selection; toxicity management; access to NGS; biomarker-driven sequencing.",
    tags: ["Sequencing", "Biomarkers", "Momentum"],
  },
  {
    title: "CNS / brain mets is a high-salience value area - framed as intracranial control and relapse risk",
    summary:
      "The CNS/Brain Mets bucket driver-tags emphasize intracranial efficacy/responses, CNS activity, on-treatment CNS relapse, and improve intracranial control. CNS is being discussed as control, durability in the brain, and unmet need.",
    signalsShown:
      "Signals seen in CNS drivers: intracranial efficacy/responses; CNS activity; on-treatment CNS relapse; improve intracranial control.",
    tags: ["CNS", "Durability", "Conversation"],
  },
  {
    title: "Safety/Neuro is framed as tradeoffs + monitoring - with explicit caregiver support needs",
    summary:
      "The Safety/Neuro bucket driver-tags highlight efficacy vs toxicity tradeoff, AE-driven discontinuation, plus education on cognitive monitoring and caregiver support needs. The audience is not just worried about AEs; they are discussing the work of detecting and managing them.",
    signalsShown:
      "Signals seen in Safety/Neuro drivers: efficacy vs toxicity tradeoff; AE-driven discontinuation; cognitive monitoring; caregiver support.",
    tags: ["Safety", "Neuro", "Audience", "QoL"],
  },
  {
    title: "Brand stance is rarely explicit - most context stays class or competitor-led",
    summary:
      "Competitive context and stance toward Alunbrig skew toward class discussion, competitor-only, or unclear, with limited direct stance toward Alunbrig. Opportunity: create clearer why-this-choice-for-this-patient language that ties sequencing and CNS/QoL drivers back to Alunbrig, without forcing brand into conversations where it is not naturally present yet.",
    signalsShown:
      "Signals seen in competitive panels: class discussion / competitor-only / unclear; limited explicit stance toward Alunbrig.",
    tags: ["Competitive", "Sequencing", "Attention"],
  },
]

const COMPETITOR_LENS_TAKEAWAYS: TakeawayCard[] = [
  {
    title: "Competitive conversation is a large share of the overall discussion",
    summary:
      "The Competitive Landscape panel shows share competitive at 68.2% and an overall sentiment index of 63. Competitive framing is not an occasional sidebar; it is a dominant lens with generally mid-positive tone.",
    signalsShown: "Signals seen in the landscape panel: share competitive 68.2%. Sentiment index 63.",
    tags: ["Competitive lens", "Share signal", "Sentiment"],
  },
  {
    title: "Top competitors by share: alectinib and lorlatinib lead the field",
    summary:
      "The comparator table ranks alectinib and lorlatinib at the top (both around ~10% share), followed by osimertinib, brigatinib, crizotinib, and broader categories like chemotherapy. This defines the default comparator set the market places in the same conversation space.",
    signalsShown:
      "Signals seen in the comparator table: alectinib and lorlatinib lead by share, followed by osimertinib, brigatinib, crizotinib, and chemotherapy category.",
    tags: ["Comparator set", "Landscape mapping"],
  },
  {
    title: "Attribute drivers skew toward Efficacy + Sequencing, with Safety/QoL/CNS as supporting frames",
    summary:
      "Attribute drivers are led by Efficacy (39.8%) and Sequencing (35.6%). Efficacy connects to tags like high ORR, CNS activity, and manageable safety, while Sequencing connects to outcome framing such as PFS improvement and OS improvement. Supporting frames include Safety (19.8%), QoL (17.6%), and CNS (16.1%), meaning positioning is won largely on outcomes + sequencing rationale and reinforced via tolerability, QoL, and CNS.",
    signalsShown:
      "Signals seen in attribute drivers: Efficacy 39.8%; Sequencing 35.6%; Safety 19.8%; QoL 17.6%; CNS 16.1%.",
    tags: ["Efficacy", "Sequencing", "Safety", "QoL", "CNS"],
  },
  {
    title: "Opportunities are education + decision support; hurdles are implementation + evidence translation",
    summary:
      "Opportunities cluster around educational outreach, combination strategies, biomarker-driven selection, supportive care messaging, shared decision-making tools, patient education, and patient support/assistance programs. Hurdles cluster around toxicity management, translation to clinic, testing access/uptake, confirmatory trials, patient selection, implementation, generalizability, and the need for confirmatory data. The gap is not interest; it is operationalization and confidence-building through testing, confirmatory evidence, and clinical translation.",
    signalsShown:
      "Signals seen in opportunities/hurdles panels: education and decision support opportunities; testing access/uptake, confirmatory trials, and implementation hurdles.",
    tags: ["Education", "Decision tools", "Testing", "Confirmatory trials", "Implementation"],
  },
  {
    title: "Weekly competitor mix shifts, but repeatedly includes ALK TKIs plus broader oncology agents",
    summary:
      "Top competitors by period rotate week-to-week, repeatedly showing osimertinib, lorlatinib, and alectinib, while sometimes surfacing broader agents (for example immunotherapy brands and HER2 TKIs). This suggests competitor conversations can bleed across adjacent treatment paradigms, not only within a single narrow comparator set.",
    signalsShown:
      "Signals seen by period: recurring osimertinib, lorlatinib, alectinib; occasional broader oncology agents and adjacent paradigms.",
    tags: ["Period shifts", "Mix changes", "Adjacent paradigms"],
  },
]

const SEQUENCING_PATHWAYS_TAKEAWAYS: TakeawayCard[] = [
  {
    title: "Sequencing is the dominant frame; PFS/PFS2 and attrition are major secondary frames",
    summary:
      "Top-line tiles show Sequencing at 56.5% share, with PFS/PFS2 at 22.6% and Attrition at 15.2%. This confirms sequencing is not just a theme; it is the primary organizing logic of the pathway conversation.",
    signalsShown: "Signals seen in top-line tiles: Sequencing 56.5%. PFS/PFS2 22.6%. Attrition 15.2%.",
    tags: ["Sequencing", "PFS/PFS2", "Attrition"],
  },
  {
    title: "Where sequencing is explicit, the clearest named transition is Alectinib -> Lorlatinib (caregiver-weighted)",
    summary:
      "In the matrix heatmap (row share), Alectinib_to_Lorlatinib shows Caregiver at 33.3%, HCP at 1.6%, and Patient at 7.7%. When this specific transition appears, it is relatively more concentrated in caregiver-coded content compared with the large unknown/other bulk.",
    signalsShown:
      "Signals seen in matrix row share: Alectinib_to_Lorlatinib is 33.3% for Caregiver, 1.6% for HCP, and 7.7% for Patient.",
    tags: ["Alectinib to Lorlatinib", "Caregiver-weighted", "Specific pathway"],
  },
  {
    title: "Rationales emphasize tradeoffs and decision rules, not slogans",
    summary:
      "Top rationales repeatedly reflect efficacy versus toxicity tradeoffs in first-line combinations, a preference for TKI-first approaches in mutation-driven settings, timing of local therapy such as SRS alongside systemic TKI, and resistance-driven sequencing logic after progression. Overall, rationales read as decision rules rather than brand slogans.",
    signalsShown:
      "Signals seen in top rationales: efficacy vs toxicity tradeoffs, TKI-first stance, local therapy timing, and resistance-driven sequencing logic.",
    tags: ["Tradeoffs", "Toxicity", "Efficacy", "CNS/local therapy", "Sequencing rules"],
  },
  {
    title: "UK overlay highlights access and admin language, with England-specific Blueteq/NICE signals",
    summary:
      "UK access overlay panels show distinct signal clusters. UK_general includes meeting references and explicit need-access language. England includes Blueteq reimbursement criteria and policy adjustment language alongside NICE appraisal/refusal and NHS England pathway/approval signals. Not_uk_or_unknown emphasizes accessibility and cost pressure, reimbursement assumptions, and local approval or implementation obstacles.",
    signalsShown:
      "Signals seen in UK overlay: UK_general need-access language; England Blueteq and NICE signals; not_uk_or_unknown cost pressure and implementation obstacles.",
    tags: ["UK access", "Blueteq/NICE", "Cost/access pressure", "Pathway implementation"],
  },
]

function TakeawaySection({ title, subtitle, cards }: { title: string; subtitle: string; cards: TakeawayCard[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-sm font-semibold tracking-tight">{title}</div>
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.title} className="border-border/60 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base leading-tight">{c.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">{c.summary}</div>
              <div className="rounded-md border border-border/60 bg-background/30 p-2">
                <div className="text-xs font-medium text-foreground">Signals seen</div>
                <div className="mt-1 text-xs text-muted-foreground">{c.signalsShown}</div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {c.tags.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function ExecutiveSummaryExplorer() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/[0.10] via-card/40 to-card/40 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Executive Summary</h1>
        </div>
      </div>

      <TakeawaySection title="General Themes - key takeaways" subtitle="Executive takeaways (General Themes)." cards={GENERAL_THEMES_TAKEAWAYS} />
      <TakeawaySection title="Trends Explorer - key takeaways" subtitle="Executive takeaways (Trends Explorer)." cards={TRENDS_EXPLORER_TAKEAWAYS} />
      <TakeawaySection title="Audience Insights - key takeaways" subtitle="Executive takeaways (Audience Insights)." cards={AUDIENCE_INSIGHTS_TAKEAWAYS} />
      <TakeawaySection title="Competitor Lens - key takeaways" subtitle="Executive takeaways (Competitor Lens)." cards={COMPETITOR_LENS_TAKEAWAYS} />
      <TakeawaySection title="Sequencing and Pathways - key takeaways" subtitle="Executive takeaways (Sequencing and Pathways)." cards={SEQUENCING_PATHWAYS_TAKEAWAYS} />
    </div>
  )
}





