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
        id: 'hcp-1a',
        title: 'Post‑BsAb 3L: simple next step',
        rationale: 'Keep it clear and outpatient‑friendly.',
        actions: [
          'Re‑biopsy first (confirm CD20).',
          'CD20− or short durability → change target to CD19 ADC (Zynlonta).',
          'Premed → LFTs → edema watch → photosensitivity care.',
          'Book the 3‑week review now.',
          'Primary CTA: Order biopsy · Secondary: Start premed checklist',
        ],
        language: ['Re‑biopsy first', 'CD20 loss', 'Change target', 'CD19 ADC', 'Protocol‑based', 'Outpatient plan', 'Clear next step'],
        kpis: ['Algorithm saves', 'Explainer completion ≥70%', 'Biopsy order clicks / dot‑phrase inserts', 'Comment tone: neutral‑calm'],
        icon: Target,
        tone: 'positive',
      },
      {
        id: 'hcp-1b',
        title: 'Clinic script (print this)',
        rationale: 'One sentence for APPs/front desk.',
        actions: [
          '“Progressed on a CD20 bispecific? Re‑biopsy.',
          'If CD20 is lost or durability was short, switch target to a CD19 ADC.',
          'Standard premed + monitoring. 3‑week review booked today.”',
        ],
        language: ['Re‑biopsy first', 'Change target', 'Outpatient plan'],
        kpis: ['Dot‑phrase inserts'],
        icon: Target,
        tone: 'positive',
      },
      {
        id: 'hcp-1c',
        title: '30‑sec explainer (captioned)',
        rationale: 'Four beats, big verbs.',
        actions: [
          'Problem: short durability after BsAb.',
          'Step: Re‑biopsy CD20.',
          'Decision: change target if CD20−/short durability.',
          'Flow: Order • Switch • Monitor • Review.',
        ],
        language: ['Order', 'Switch', 'Monitor', 'Review'],
        kpis: ['Completion rate ≥70%'],
        icon: Target,
        tone: 'positive',
      },
      {
        id: 'hcp-1d',
        title: 'Why re‑biopsy first?',
        rationale: 'Evidence micro‑tile (non‑H2H).',
        actions: [
          'RWE: CD20 loss can follow CD20 bispecifics.',
          'If CD20 is absent, changing target is a clean next step.',
          'CTA: Read antigen‑loss note.',
        ],
        language: ['CD20 loss', 'Change target', 'Non‑H2H'],
        kpis: ['Note views'],
        icon: Target,
        tone: 'positive',
      },
    ],
  },
  {
    audience: 'Patient',
    items: [
      {
        id: 'patient-1a',
        title: 'Your next 4 weeks',
        rationale: 'Plain steps, one link.',
        actions: [
          'Week 0: Treatment day (how long + what to expect).',
          'Week 1–2: At‑home routine — sun care, swelling check, energy diary.',
          'Week 3: Clinic review already booked: [DATE].',
          'One link: Clinic numbers & after‑hours.',
        ],
        language: ['Manageable at home', 'Outpatient dosing', 'Save these numbers'],
        kpis: ['Save rate', 'Average watch time'],
        icon: Shield,
        tone: 'positive',
      },
      {
        id: 'patient-1b',
        title: 'When to call (icons)',
        rationale: 'Hard thresholds beat vague advice.',
        actions: [
          'Fever ≥38 °C → Call now.',
          'New/worse swelling → Call now.',
          'Yellow eyes/skin → Call now.',
          'Anything worrying → Call now.',
        ],
        language: ['When to call', 'Clear steps'],
        kpis: ['Call mix (right‑time calls)'],
        icon: Shield,
        tone: 'positive',
      },
      {
        id: 'patient-1c',
        title: 'Dosing‑day checklist',
        rationale: 'Short and practical.',
        actions: [
          'Eat/meds notes; bring hat/sunscreen.',
          'Bring: ID, water/snacks, charger.',
          'Ride timing + time in clinic.',
        ],
        language: ['Outpatient dosing', 'Clear steps'],
        kpis: ['Save rate'],
        icon: Shield,
        tone: 'positive',
      },
    ],
  },
  {
    audience: 'Caregiver',
    items: [
      {
        id: 'care-1a',
        title: 'Quick plan',
        rationale: 'Rides, reminders, contacts.',
        actions: [
          'Dates & rides: Treatment [DATE/TIME]; review ~3 weeks [DATE].',
          'Daily checks: skin, ankle/leg swelling, temperature, energy.',
          'Contacts: Weekday nurse [#], After‑hours [#].',
          'CTA: Add to calendar · Save numbers',
        ],
        language: ['Check once daily', 'Call if fever ≥38°C', 'Pack list', 'Checklist downloads', 'Forward rate'],
        kpis: ['Checklist downloads', 'Forward rate (family/GP)', 'Calendar add rate'],
        icon: Eye,
        tone: 'neutral',
      },
      {
        id: 'care-1b',
        title: 'Weekly checklist (download)',
        rationale: 'Mon/Wed/Fri tick‑boxes.',
        actions: [
          'Skin/edema/temperature/fatigue.',
          'Strip: “If X then call”.',
        ],
        language: ['Checklist downloads'],
        kpis: ['Downloads'],
        icon: Eye,
        tone: 'neutral',
      },
      {
        id: 'care-1c',
        title: 'Dosing‑day pack list',
        rationale: 'Keep it light and clear.',
        actions: [
          'ID, meds list, snacks/water, charger.',
          'Parking/valet note, return ride time.',
        ],
        language: ['Pack list'],
        kpis: ['Forward rate'],
        icon: Eye,
        tone: 'neutral',
      },
    ],
  },
  {
    audience: 'Payer',
    items: [
      {
        id: 'payer-1a',
        title: '3L pathway (one page)',
        rationale: 'Clear criteria and steps.',
        actions: [
          'Trigger: after CD20 bispecific or post‑CAR‑T relapse → re‑biopsy.',
          'Decision: CD20 loss/short durability → CD19 ADC (Zynlonta).',
          'Setting: outpatient; Cadence: treatment day + 3‑week review.',
          'CTA: Download referral criteria.',
        ],
        language: ['Predictable outpatient pathway', 'Protocol‑based monitoring', 'Clear referral criteria', 'Continuity of care', 'Non‑H2H outcomes context'],
        kpis: ['Referral criteria downloads', 'Outpatient flow views', 'Time‑to‑referral (where measurable)'],
        icon: Key,
        tone: 'positive',
      },
      {
        id: 'payer-1b',
        title: 'Outpatient flow (predictable care)',
        rationale: 'Process language only.',
        actions: [
          'Standard premed + monitoring check‑points.',
          'Calendarised visits reduce unplanned contacts.',
          'CTA: View outpatient flow.',
        ],
        language: ['Continuity of care', 'Protocol‑based monitoring'],
        kpis: ['Outpatient flow views'],
        icon: Key,
        tone: 'positive',
      },
      {
        id: 'payer-1c',
        title: 'Planning for earlier exposure',
        rationale: 'Future‑proofing tile.',
        actions: [
          'When BsAbs are used earlier, keep re‑biopsy + target‑switch as the built‑in fallback.',
          'CTA: See sequencing map (neutral, non‑H2H).',
        ],
        language: ['Non‑H2H outcomes context', 'Predictable pathway'],
        kpis: ['Map views'],
        icon: Key,
        tone: 'positive',
      },
    ],
  },
]


