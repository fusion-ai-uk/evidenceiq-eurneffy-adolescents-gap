import { Eye, Key, Shield, Target } from "lucide-react"

export type Recommendation = {
  id: string
  title: string
  rationale: string
  actions: string[]
  language: string[]
  kpis?: string[]
  icon?: any
  tone?: 'positive' | 'neutral' | 'warning'
}

export type AudienceRecommendations = {
  audience: 'HCP' | 'Patient' | 'Caregiver' | 'Payer'
  items: Recommendation[]
}

export const messagingRecommendations: AudienceRecommendations[] = [
  {
    audience: 'HCP',
    items: [
      {
        id: 'hcp-1',
        title: 'Post‑BsAb pathway: Re‑biopsy → if CD20− or short durability → CD19 ADC',
        rationale:
          'Week‑One shows RWE dampening BsAb durability and frequent CD20 loss. HCPs respond to clear, single‑step sequences that convert attention into action.',
        actions: [
          'Publish a single‑tile algorithm with the rule above',
          'Add clinic script: “Don’t BiTE→BiTE—change target or modality”',
          'Pin a 30‑second captioned explainer of the flow',
        ],
        language: ['Re‑biopsy first', 'CD20 loss', 'Change target', 'CD19 ADC'],
        kpis: ['Algorithm saves', 'Explainer completion rate'],
        icon: Target,
        tone: 'positive',
      },
    ],
  },
  {
    audience: 'Patient',
    items: [
      {
        id: 'patient-1',
        title: 'Safety made simple: Photosensitivity routine + outpatient rhythm',
        rationale:
          'Patients share better engagement when content is calm, check‑list driven, and lifestyle‑oriented. Week‑One emphasises clarity and convenience.',
        actions: [
          'Create a one‑screen daily routine for sun care',
          'Show a dosing calendar with what to expect on visit days',
          'Add “when to call” thresholds with icons',
        ],
        language: ['Manageable at home', 'Outpatient dosing', 'Clear steps'],
        kpis: ['Save rate', 'Average watch time'],
        icon: Shield,
        tone: 'positive',
      },
    ],
  },
  {
    audience: 'Caregiver',
    items: [
      {
        id: 'care-1',
        title: 'Care checklist: What to watch and how to help each week',
        rationale:
          'Caregivers seek concrete tasks and reassurance. Turning safety into a routine improves tone and confidence.',
        actions: [
          'Weekly checklist (skin checks, temperature, fatigue)',
          'Text‑first “what to bring” for clinic days',
          'Link to 24/7 contact and red‑flag guide',
        ],
        language: ['Check once daily', 'Call if fever ≥38°C', 'Pack list'],
        kpis: ['Checklist downloads', 'Forward rate'],
        icon: Eye,
        tone: 'neutral',
      },
    ],
  },
  {
    audience: 'Payer',
    items: [
      {
        id: 'payer-1',
        title: 'Eligibility clarity: fast path to appropriate outpatient care',
        rationale:
          'Access narratives improve when criteria are explicit and predictable. Map referral steps to reduce uncertainty.',
        actions: [
          'Create a one‑pager: eligibility criteria and referral steps',
          'Show outpatient capacity benefits vs inpatient alternatives',
          'Add a short justification note linking to guidance',
        ],
        language: ['Eligible 3L+', 'Outpatient pathway', 'Predictable visits'],
        kpis: ['FAQ views', 'Referral form clicks'],
        icon: Key,
        tone: 'positive',
      },
    ],
  },
]


