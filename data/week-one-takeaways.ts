import { Eye, ThumbsUp, TrendingUp, Activity, MessageSquare, Key, Shield } from "lucide-react"

export type ExecTakeaway = {
  title: string
  summary: string
  icons: any[]
  views: number
  likes: number
  replies: number
  sentiment?: number
}

export const weekOneTakeaways: ExecTakeaway[] = [
  {
    title: "Glofitamab + Polatuzumab sets the week’s reference point",
    summary:
      "Conversation clustered around the JCO data; engagement lifted across bispecific themes. Tone stayed confident and explanatory with short summaries travelling furthest. Zynlonta appears at the edges of this peak, showing how a clear efficacy story can temporarily set the frame for the whole category. Signal: High momentum · Positive tone · Durability‑led.",
    icons: [TrendingUp, Eye, Activity],
    views: 0,
    likes: 0,
    replies: 0,
    sentiment: 0.18,
  },
  {
    title: "Real‑world bispecific posts pull durability tone back to earth",
    summary:
      "RWE and CD20‑loss discussions gained traction, highlighting short PFS/OS figures and incomplete durability. Posts carry measured concern rather than negativity—readers read this as realism, not alarm. Tone suggests the community is re‑calibrating BsAb expectations in practice. Signal: Moderating tone · High attention · Durability frame shifting.",
    icons: [Activity, Eye, MessageSquare],
    views: 0,
    likes: 0,
    replies: 0,
    sentiment: -0.06,
  },
  {
    title: "“Avoid BiTE→BiTE” becomes an easy rule to share",
    summary:
      "The sequencing cue (avoid sequential CD20 bispecifics) reached broad visibility with neutral‑positive tone. Clinicians repeat it as a simple operational line, often paired with ‘re‑biopsy CD20’. Clarity on one point outperforms mixed‑message threads. Signal: Clarity wins · Stable tone · Access + Sequencing momentum.",
    icons: [Key, MessageSquare, TrendingUp],
    views: 0,
    likes: 0,
    replies: 0,
    sentiment: 0.04,
  },
  {
    title: "Safety tone remains calm but skews toward competitors",
    summary:
      "Epcoritamab and Pola‑linked content holds the most positive safety sentiment, built on ‘manageable’ and ‘protocol‑based’ phrasing. Zynlonta appears in cautionary sequencing language which reads slightly negative algorithmically. Overall sentiment is steady—confidence in safety handling persists. Signal: Safety stable · Tone divergence · Factual sharing.",
    icons: [Shield, Eye, ThumbsUp],
    views: 0,
    likes: 0,
    replies: 0,
    sentiment: -0.02,
  },
  {
    title: "Frontline & next‑gen threads surface as curiosity spikes",
    summary:
      "Mentions of ctDNA‑guided escalation and early co‑stimulation/CD8‑engager work enter the feed with small but high‑positivity pockets. Readers engage for interest and novelty rather than debate. These signals extend discussion upstream without displacing late‑line attention. Signal: Low volume · High positivity · Future‑oriented curiosity.",
    icons: [TrendingUp, Eye, Activity],
    views: 0,
    likes: 0,
    replies: 0,
    sentiment: 0.22,
  },
  {
    title: "One‑job posts continue to outperform multi‑purpose assets",
    summary:
      "Top‑performing content again does one clear job—either share a single result or explain a single decision rule. Longer or mixed‑topic threads underperform even during high‑momentum weeks. Simplicity sustains reach and tone between data peaks. Signal: Consistent pattern · Positive engagement · Baseline clarity holding.",
    icons: [ThumbsUp, Eye, MessageSquare],
    views: 0,
    likes: 0,
    replies: 0,
    sentiment: 0.1,
  },
]


