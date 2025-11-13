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
        title: '3L after a CD20 bispecific: what to do next',
        rationale: 'Make one simple “next‑step” card the team can post or print.',
        actions: [
          'Say plainly: “Re‑biopsy first to check CD20.”',
          'If CD20 is lost or durability was short, switch target to a CD19 ADC (Zynlonta).',
          'Keep care outpatient: premed, LFTs, edema check, photosensitivity care.',
          'End with a clear instruction: “Book the 3‑week review today.”',
          'Buttons: Order biopsy (primary) · Start premed checklist (secondary).',
        ],
        language: ['Re‑biopsy first', 'CD20 loss', 'Change target', 'CD19 ADC', 'Protocol‑based', 'Outpatient plan', 'Clear next step'],
        kpis: ['Algorithm saves', 'Explainer completion ≥70%', 'Biopsy order clicks / dot‑phrase inserts', 'Comment tone: neutral‑calm'],
        icon: Target,
        tone: 'positive',
      },
      {
        id: 'hcp-1b',
        title: 'Clinic script you can paste into the EHR',
        rationale: 'Give staff one ready‑to‑use sentence.',
        actions: [
          'Text to paste: “After a CD20 bispecific, re‑biopsy CD20. If CD20 is lost or durability was short, switch target to a CD19 ADC. Use standard premed + monitoring. Book the 3‑week review today.”',
        ],
        language: ['Re‑biopsy first', 'Change target', 'Outpatient plan'],
        kpis: ['Dot‑phrase inserts'],
        icon: Target,
        tone: 'positive',
      },
      {
        id: 'hcp-1c',
        title: '30‑second explainer video (captioned)',
        rationale: 'Create a short video that shows the pathway in four plain steps.',
        actions: [
          'Open with the problem: “Short durability after BsAb.”',
          'Step 1: “Re‑biopsy CD20.”',
          'Step 2: “If CD20 is lost or durability was short, switch target to a CD19 ADC.”',
          'Step 3: “Outpatient care with premed + routine monitoring.”',
          'Close with the action: “Book the 3‑week review today.”',
        ],
        language: ['Order', 'Switch', 'Monitor', 'Review'],
        kpis: ['Completion rate ≥70%'],
        icon: Target,
        tone: 'positive',
      },
      {
        id: 'hcp-1d',
        title: 'Why re‑biopsy first?',
        rationale: 'Add a small “why it matters” tile the team can point to.',
        actions: [
          'Say: “Real‑world evidence shows CD20 loss can follow CD20 bispecifics.”',
          'Then: “If CD20 is absent, changing target is the clean next step.”',
          'Link to your non‑H2H antigen‑loss note.',
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
        rationale: 'A single card that explains what happens and when.',
        actions: [
          'Week 0: Treatment day — how long it takes and what to expect.',
          'Week 1–2: At home — sun care, light swelling check, simple energy note.',
          'Week 3: Clinic review — show the actual date.',
          'Only one link: clinic and after‑hours numbers.',
        ],
        language: ['Manageable at home', 'Outpatient dosing', 'Save these numbers'],
        kpis: ['Save rate', 'Average watch time'],
        icon: Shield,
        tone: 'positive',
      },
      {
        id: 'patient-1b',
        title: 'When to call us',
        rationale: 'Make the “call now” rules crystal‑clear with big icons.',
        actions: [
          'Fever 38 °C or higher — call now.',
          'New or worse swelling — call now.',
          'Yellow eyes or skin — call now.',
          'If you are worried — call now.',
        ],
        language: ['When to call', 'Clear steps'],
        kpis: ['Call mix (right‑time calls)'],
        icon: Shield,
        tone: 'positive',
      },
      {
        id: 'patient-1c',
        title: 'Dosing‑day checklist',
        rationale: 'What to bring and how to plan your visit.',
        actions: [
          'Any food/meds notes from your team. Hat and sunscreen.',
          'Bring ID, water/snacks, and a phone charger.',
          'Plan your ride and the expected time in clinic.',
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
        title: 'Quick plan for carers',
        rationale: 'One card with dates, daily checks and who to call.',
        actions: [
          'Dates and rides: treatment on [DATE/TIME]; review about 3 weeks later.',
          'Daily checks: skin, ankle/leg swelling, temperature and energy.',
          'Contacts: weekday nurse [#]; after‑hours [#].',
          'Buttons: add to calendar and save numbers.',
        ],
        language: ['Check once daily', 'Call if fever ≥38°C', 'Pack list', 'Checklist downloads', 'Forward rate'],
        kpis: ['Checklist downloads', 'Forward rate (family/GP)', 'Calendar add rate'],
        icon: Eye,
        tone: 'neutral',
      },
      {
        id: 'care-1b',
        title: 'Weekly checklist (download)',
        rationale: 'Simple Mon/Wed/Fri tick‑boxes.',
        actions: [
          'Tick skin, edema, temperature, fatigue.',
          'Add a strip at the bottom: “If X then call”.',
        ],
        language: ['Checklist downloads'],
        kpis: ['Downloads'],
        icon: Eye,
        tone: 'neutral',
      },
      {
        id: 'care-1c',
        title: 'Dosing‑day pack list',
        rationale: 'What to bring so the day runs smoothly.',
        actions: [
          'ID, medicines list, snacks or water, and a phone charger.',
          'Note parking or valet info and plan a return ride time.',
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
        title: '3L pathway on one page',
        rationale: 'A simple referral page that shows triggers, decision and setting.',
        actions: [
          'Trigger: progression after a CD20 bispecific or post‑CAR‑T relapse → re‑biopsy.',
          'Decision: CD20 loss or short durability → CD19 ADC (Zynlonta).',
          'Setting: outpatient with a treatment day and a 3‑week review.',
          'Include a clear “Download referral criteria” button.',
        ],
        language: ['Predictable outpatient pathway', 'Protocol‑based monitoring', 'Clear referral criteria', 'Continuity of care', 'Non‑H2H outcomes context'],
        kpis: ['Referral criteria downloads', 'Outpatient flow views', 'Time‑to‑referral (where measurable)'],
        icon: Key,
        tone: 'positive',
      },
      {
        id: 'payer-1b',
        title: 'Outpatient flow (predictable care)',
        rationale: 'Show the steps without claims or comparisons.',
        actions: [
          'Standard premed and monitoring check‑points.',
          'Calendarised visits to reduce unplanned contacts.',
          'Add a “View outpatient flow” button.',
        ],
        language: ['Continuity of care', 'Protocol‑based monitoring'],
        kpis: ['Outpatient flow views'],
        icon: Key,
        tone: 'positive',
      },
      {
        id: 'payer-1c',
        title: 'Planning for earlier exposure',
        rationale: 'Position a neutral “future” note.',
        actions: [
          'If BsAbs move earlier, re‑biopsy + target‑switch remains the built‑in fallback.',
          'Link to a neutral, non‑H2H sequencing map.',
        ],
        language: ['Non‑H2H outcomes context', 'Predictable pathway'],
        kpis: ['Map views'],
        icon: Key,
        tone: 'positive',
      },
    ],
  },
]


