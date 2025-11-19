import { Eye, ThumbsUp, TrendingUp, Activity, MessageSquare, Key, Shield, HeartPulse } from "lucide-react"
import type { ExecTakeaway } from "./week-one-takeaways"

// Week Three (Nov 12–18, 2025) – Executive Summary tiles
export const weekThreeTakeaways: ExecTakeaway[] = [
  {
    title: "UK moves Glofitamab earlier; access grows faster than in US",
    summary:
      "NICE approved Glofitamab + GemOx after one prior therapy. That means more people in the UK can get a bispecific sooner, often in regular clinics. In the US, this use is still not approved, so access moves slower. Patient stories this week reinforced the simple message: earlier access and an easier outpatient path. Signal: Access wins · Earlier‑line shift · Positive momentum.",
    icons: [Key, TrendingUp, Eye],
    views: 0,
    likes: 0,
    replies: 0,
    sentiment: 0.10,
  },
  {
    title: "Epcoritamab combo wins OK in FL; confidence in bispecifics grows",
    summary:
      "The FDA approved Epkinly with rituximab + lenalidomide for follicular lymphoma in second line. It is the first bispecific combination approval and it uses a time‑limited schedule. While not DLBCL, it boosts trust in the whole class and restarts a clear comparison: fixed‑duration courses versus continuous dosing that goes on until progression. Expect that discussion to shape DLBCL use too. Signal: Class momentum · Durability focus · Cost/duration debate returns.",
    icons: [ThumbsUp, Activity, MessageSquare],
    views: 0,
    likes: 0,
    replies: 0,
    sentiment: 0.12,
  },
  {
    title: "Zynlonta stays a steady 3L option; combos point to what’s next",
    summary:
      "Zynlonta remains a dependable third‑line choice, especially in community clinics. It is a short infusion every three weeks and does not cause CRS or ICANS. Side effects like photosensitivity and fluid retention are known and manageable with precautions. Combination studies are the growth story: LOTIS‑5 (with rituximab) and LOTIS‑7 (with Glofitamab, high CRs) outline how use could broaden over time. Signal: Reliable 3L · Combination upside · Calm safety tone.",
    icons: [Shield, Key, Activity],
    views: 0,
    likes: 0,
    replies: 0,
    sentiment: 0.08,
  },
  {
    title: "Choosing CAR‑T or a bispecific: access and clinic time matter",
    summary:
      "Long‑term results keep CAR‑T’s cure potential in view. But some patients cannot reach a CAR‑T center in time, so off‑the‑shelf bispecifics remain the practical choice. New work compares a one‑time, intense treatment (CAR‑T) with ongoing visits over many months (bispecifics). The best option often comes down to access, care setting, and the patient’s preference about time in clinic. Signal: Shared decision‑making · Access constraints · QoL/time balance.",
    icons: [HeartPulse, Key, TrendingUp],
    views: 0,
    likes: 0,
    replies: 0,
    sentiment: 0.00,
  },
]


