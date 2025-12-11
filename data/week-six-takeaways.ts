import { Activity, TrendingUp, Key, Shield, HeartPulse, Eye, MessageSquare, Sparkles, Smile } from "lucide-react"
import type { ExecTakeaway } from "./week-one-takeaways"

// Week Six (Dec 3–9, 2025) – ASH‑specific Executive Summary tiles
export const weekSixTakeaways: ExecTakeaway[] = [
  {
    title: "Consolidation after CAR‑T emerges as the clearest gap in care",
    summary:
      "At ASH, many clinicians described the post‑CAR‑T partial response moment as a ‘decision vacuum.’ Early Zynlonta‑based consolidation data resonated because it gives a practical option to deepen responses while pathways are still being written.",
    icons: [Sparkles, Activity, TrendingUp],
    views: 0, likes: 0, replies: 0, sentiment: 0.12,
  },
  {
    title: "Bispecific excitement softens as real‑world outcomes look tougher",
    summary:
      "Real‑world data showed shorter durability and management load versus trials, with CD20 loss rising as a theme. Clinicians increasingly asked what to use after a bsAb fails, pulling attention toward CD19‑targeted options such as Zynlonta.",
    icons: [Sparkles, Eye, MessageSquare],
    views: 0, likes: 0, replies: 0, sentiment: -0.05,
  },
  {
    title: "ADC‑anchored combinations are seen as the ‘next wave’",
    summary:
      "ASH25 felt like a turn toward combinations. Discussions focused on how ADCs, bispecifics and CAR‑T might work together to deepen responses. LOTIS‑7 was cited as an example: strong early activity with manageable immune‑related safety.",
    icons: [Sparkles, TrendingUp, Shield],
    views: 0, likes: 0, replies: 0, sentiment: 0.10,
  },
  {
    title: "Operational strain quietly reshapes treatment preferences",
    summary:
      "Posts highlighted staffing gaps, CRS monitoring, infusion time and appointment bottlenecks. This practical pressure increased interest in predictable, outpatient‑friendly options that fit clinic flow without complex infrastructure.",
    icons: [Sparkles, Key, HeartPulse],
    views: 0, likes: 0, replies: 0, sentiment: 0.04,
  },
  {
    title: "Early Waldenström signals open a new mental space for Zynlonta",
    summary:
      "WM‑NET1 updates drew more attention than expected. Deep responses in high‑risk subgroups reminded experts that a CD19‑ADC can have relevance beyond aggressive lymphoma, prompting interest from new sub‑audiences.",
    icons: [Sparkles, Activity, Eye],
    views: 0, likes: 0, replies: 0, sentiment: 0.08,
  },
  {
    title: "Market noise rises, but clinical discussion stays on the science",
    summary:
      "Investor commentary was loud around ASH, yet clinical engagement for Zynlonta stayed steady and centered in high‑credibility accounts. The pattern suggests enduring curiosity about the science despite short‑term market volatility.",
    icons: [Sparkles, MessageSquare, TrendingUp],
    views: 0, likes: 0, replies: 0, sentiment: -0.02,
  },
]

// Week Six – General therapy/brand takeaways (non‑ASH specific)
export const weekSixGeneral: ExecTakeaway[] = [
  {
    title: "Durability still sets the reference point for value",
    summary:
      "Across lymphoma threads, durability remains the lens. Even when safety or logistics lead, the question returns to ‘how long does it last?’ This helps Zynlonta when presented as a dependable option alongside agents with uneven real‑world durability.",
    icons: [Activity, Eye, MessageSquare],
    views: 0, likes: 0, replies: 0, sentiment: 0.06,
  },
  {
    title: "Simple ‘who qualifies for what’ guidance outperforms everything else",
    summary:
      "Plain ‘start here’ rules — eligibility, checks, next steps — win engagement. Busy clinicians share and bookmark clear access explanations that reduce friction in increasingly complex sequencing.",
    icons: [Key, Eye, MessageSquare],
    views: 0, likes: 0, replies: 0, sentiment: 0.10,
  },
  {
    title: "Real‑world practicality now rivals raw clinical data in importance",
    summary:
      "Threads cite appointment shortages, caregiver burden, monitoring needs and clinic time. Therapies that fit smoothly into routine delivery attract more positive reactions even when efficacy headlines are similar.",
    icons: [HeartPulse, MessageSquare, Eye],
    views: 0, likes: 0, replies: 0, sentiment: 0.08,
  },
  {
    title: "Straightforward sequencing rules build the most trust",
    summary:
      "Visual ‘what comes before what’ content — avoid back‑to‑back CD20 therapies; plan for CAR‑T timing — drives stronger sharing and saves in‑thread debate. Clarity reduces uncertainty in a crowded landscape.",
    icons: [Key, MessageSquare, TrendingUp],
    views: 0, likes: 0, replies: 0, sentiment: 0.09,
  },
  {
    title: "Quality‑of‑life themes are small but rising steadily",
    summary:
      "Caregiver fatigue, travel demands and visit complexity show up more often. While not dominant, the consistency signals growing attention to day‑to‑day realities alongside survival curves.",
    icons: [HeartPulse, Smile, Eye],
    views: 0, likes: 0, replies: 0, sentiment: 0.05,
  },
  {
    title: "The field assumes combinations will become central, not optional",
    summary:
      "Experts increasingly frame combinations as the path to deeper and more durable responses. Mechanistic pairs — for example ADCs with immune‑engagers — are treated as strategically important even before late‑phase data arrive.",
    icons: [TrendingUp, Activity, Shield],
    views: 0, likes: 0, replies: 0, sentiment: 0.11,
  },
]


