import { Activity, TrendingUp, Key, Shield, HeartPulse, Eye, MessageSquare, Clock } from "lucide-react"
import type { ExecTakeaway } from "./week-one-takeaways"

// Week Eight & Xmas Period – Executive Summary tiles (8)
export const weekEightTakeaways: ExecTakeaway[] = [
  {
    title: "The field is asking for “different trials,” not just more trials",
    summary:
      "Frustration with slow learning cycles stood out. Posts argued the bottleneck is design, not patients—calling for faster first‑in‑human and investigator‑led studies that compare CAR‑T edits and design variants directly in people. The emphasis is learning speed with safety, not defaulting to bigger registrational programs.",
    icons: [TrendingUp, MessageSquare, Eye],
    views: 0, likes: 0, replies: 0, sentiment: 0.06,
  },
  {
    title: "2025 is being framed as a true turning‑point year across blood cancers",
    summary:
      "Year‑in‑review posts described 2025 as genuinely practice‑changing—precision therapy momentum in AML, bispecific advances reshaping myeloma and lymphoma, and fresh thinking for high‑risk smoldering myeloma. While not lymphoma‑only, the tone lifts confidence that expectations are rising across hematology.",
    icons: [TrendingUp, Activity, Eye],
    views: 0, likes: 0, replies: 0, sentiment: 0.10,
  },
  {
    title: "CAR‑T still dominates attention, but limitations are discussed more openly",
    summary:
      "CAR‑T remains the anchor, with interest in relapse settings, allo ‘off‑the‑shelf’ approaches, and earlier‑line use. The tone is more candid: delayed neurotoxicity, infections, and blood toxicity are treated as real constraints—especially in older or fragile patients.",
    icons: [Activity, Shield, Eye],
    views: 0, likes: 0, replies: 0, sentiment: 0.02,
  },
  {
    title: "Toxicity mechanisms move centre‑stage, not side‑notes",
    summary:
      "Several threads dug into the ‘why’ of toxicities—linking cytokine patterns, immune imbalance and marrow effects to severe outcomes. This shift toward prevention and targeted mitigation is shaping what gets called ‘next‑gen’ versus ‘same‑gen’.",
    icons: [Shield, Activity, MessageSquare],
    views: 0, likes: 0, replies: 0, sentiment: 0.05,
  },
  {
    title: "Time burden is turning into a serious outcome measure",
    summary:
      "Time toxicity—contact days and hours spent on care—was repeatedly compared for CAR‑T and bispecifics. The message is that convenience and life disruption are now part of the value equation, not a soft extra, and they influence choices alongside PFS and ORR.",
    icons: [Clock, HeartPulse, Key],
    views: 0, likes: 0, replies: 0, sentiment: 0.07,
  },
  {
    title: "Bispecifics keep moving earlier; convenience upgrades land quickly",
    summary:
      "Signals point to earlier use for patients without CAR‑T access or ineligible for transplant/CAR‑T. Subcutaneous options and similar upgrades draw fast attention because they reduce administration time and clinic burden—‘practical wins’ that create momentum.",
    icons: [Key, TrendingUp, HeartPulse],
    views: 0, likes: 0, replies: 0, sentiment: 0.08,
  },
  {
    title: "Real‑world data and prediction tools are shaping confidence",
    summary:
      "More reliance on RWE, claims analyses and risk tools (MRD pipelines, AI models, apheresis immune profiling). The aim is earlier warning and clearer sequencing so teams act sooner and avoid being surprised by early relapse.",
    icons: [Eye, Activity, MessageSquare],
    views: 0, likes: 0, replies: 0, sentiment: 0.09,
  },
  {
    title: "The holidays amplify human stories, making quality‑of‑life feel more urgent",
    summary:
      "Patient and caregiver stories during the holidays brought remission, fear, fatigue and end‑of‑life experiences into focus. They don’t change guidelines, but they reinforce that impact is also appetite, cognition, family time, function, and disruption—strengthening the case for patient‑experience as a real lens.",
    icons: [HeartPulse, MessageSquare, Eye],
    views: 0, likes: 0, replies: 0, sentiment: 0.11,
  },
]

