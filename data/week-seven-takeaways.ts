import { Activity, TrendingUp, Key, Shield, HeartPulse, Eye, MessageSquare, Meh, ThumbsUp } from "lucide-react"
import type { ExecTakeaway } from "./week-one-takeaways"

// Week Seven – Executive Summary tiles
export const weekSevenTakeaways: ExecTakeaway[] = [
  {
    title: "Post–CAR‑T uncertainty remains a dominant unresolved issue",
    summary:
      "Posts this week stressed that outcomes continue to fall once CAR‑T fails and there is still no clear standard for what comes next. The tone is less about short‑term logistics and more about a persistent durability gap, with clinicians documenting the problem and remaining open to genuinely new, longer‑lasting options.",
    icons: [Activity, Meh, Eye],
    views: 0, likes: 0, replies: 0, sentiment: -0.02,
  },
  {
    title: "CAR‑T innovation stays active, but scrutiny around durability and safety is rising",
    summary:
      "Novel constructs, armoring approaches, and earlier‑line strategies drew attention; at the same time, long‑term durability, infection risk, and toxicity management were questioned more openly. The conversation is maturing from excitement to careful evaluation of what lasts and who benefits.",
    icons: [TrendingUp, Shield, Activity],
    views: 0, likes: 0, replies: 0, sentiment: 0.03,
  },
  {
    title: "Time burden and patient experience emerge as credible decision factors",
    summary:
      "Patient‑reported time toxicity, visit frequency, and overall care burden—especially on continuous bispecific regimens—featured repeatedly. Comparisons between fixed‑duration and ongoing treatment models resonated, showing convenience and daily‑life disruption are now part of the decision set alongside efficacy.",
    icons: [HeartPulse, MessageSquare, Key],
    views: 0, likes: 0, replies: 0, sentiment: 0.06,
  },
  {
    title: "Real‑world evidence continues to challenge trial‑era expectations",
    summary:
      "New datasets highlighted how response durability, sequencing success, and toxicity management are tougher in routine practice than in tightly selected trials. The tone leaned pragmatic and experience‑led, with clinicians prioritising guidance that reflects the reality of their patient mix.",
    icons: [Eye, Activity, MessageSquare],
    views: 0, likes: 0, replies: 0, sentiment: -0.01,
  },
  {
    title: "Diagnostic and biological literacy content remains highly engaging",
    summary:
      "Educational posts covering morphology, molecular drivers, and ctDNA interpretation drew steady engagement. The appetite for clear, foundational biology persists because it helps clinicians interpret complex cases and contextualise emerging therapies.",
    icons: [MessageSquare, Eye, ThumbsUp],
    views: 0, likes: 0, replies: 0, sentiment: 0.08,
  },
  {
    title: "The therapy landscape feels active but fragmented rather than settled",
    summary:
      "Across CAR‑T, bispecifics, ADCs and other immune platforms, the feed read as innovative but not converged. Clinicians are comparing options, stress‑testing assumptions, and acknowledging trade‑offs—more evaluation than endorsement of any single dominant strategy.",
    icons: [TrendingUp, Meh, MessageSquare],
    views: 0, likes: 0, replies: 0, sentiment: 0.02,
  },
]

