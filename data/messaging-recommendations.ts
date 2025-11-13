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
        rationale: 'Do this because the data shows CD20 loss and short durability after CD20 bispecifics in real‑world use. That makes target‑switch guidance useful now for HCPs in community and centre settings. Use it immediately after congress/data peaks and in routine clinic weeks.',
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
        rationale: 'Do this because clinic teams move faster with one approved line. For APPs/front desk. Use every time a patient progresses on a CD20 bispecific.',
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
        rationale: 'Do this because short captioned videos are saved and re‑watched more than long clips. For HCP social/email embeds. Use within 24–48h after comparator/data spikes (“shadow the comparator”).',
        actions: [
          'Show four scenes with captions: Problem (short durability after BsAb) → Re‑biopsy CD20 → Change target to CD19 ADC if CD20−/short durability → Outpatient care + book 3‑week review.',
          'End screen: “Order biopsy” and “Premed checklist.”',
        ],
        language: ['Order', 'Switch', 'Monitor', 'Review'],
        kpis: ['Completion rate ≥70%'],
        icon: Target,
        tone: 'positive',
      },
      {
        id: 'hcp-1d',
        title: 'Why re‑biopsy first?',
        rationale: 'Do this because HCPs ask “why” before they act. Point to evidence without head‑to‑head claims. For all HCP channels; pin beside the algorithm card.',
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
        rationale: 'Do this because patients engage with simple timelines and one link, not many. For later‑line patients and carers. Use at consent and in follow‑up messages.',
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
        rationale: 'Do this because hard thresholds reduce anxious calls and improve right‑time calls. For patients and carers. Use on day 0 and resend at 48h.',
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
        rationale: 'Do this because checklists improve preparedness and reduce last‑minute questions. For patients and carers. Send the day before treatment.',
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
        rationale: 'Do this because carers want dates, tasks and a number to call. For family members. Share at the first visit.',
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
        rationale: 'Do this because a simple routine builds confidence. For carers at home. Print or save once; reuse weekly.',
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
        rationale: 'Do this because packing guidance reduces delays and stress. For carers arranging transport. Send the day before.',
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
        rationale: 'Do this because access teams respond to clear criteria and predictable flows. For referrers and service leads. Use in referral packs and partner emails.',
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
        rationale: 'Do this because predictable steps reduce friction for services. For pathway owners. Share on intranet or as a one‑pager.',
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
        rationale: 'Do this because BsAb use is moving earlier; teams need a neutral note that keeps re‑biopsy + target‑switch as the fallback. For policy and education decks.',
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


