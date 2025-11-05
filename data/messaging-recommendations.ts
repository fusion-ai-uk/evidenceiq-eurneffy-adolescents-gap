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
        title: '3L after a CD20 bispecific: re‑biopsy first → if CD20 lost or short durability, switch target to a CD19 ADC (Zynlonta). Keep it outpatient and protocol‑calm.',
        rationale:
          'HCP engagement rises on eligibility clarity (who/when/next). RWE flags CD20 loss + shorter BsAb durability, legitimising target‑switch. Zynlonta tone improves with calm, checklist‑based safety; one‑job micro‑tiles travel further.',
        actions: [
          'Algorithm tile — Header: “Post‑BsAb 3L: Simple Next Step”',
          'Steps: (1) Re‑biopsy CD20 (2) If CD20– or short durability → change target to CD19 ADC (3) Outpatient safety: dex premed → LFTs → edema watch → photosensitivity (4) Book 3‑week review',
          'Primary CTA: Order biopsy · Secondary CTA: Start premed checklist',
          'Clinic script card for APPs/front desk — concise one‑liner',
          '30‑sec explainer — Problem → Step → Decision → Flow (with on‑screen verbs: Order, Switch, Monitor, Review)',
          'Evidence micro‑tile — “Why re‑biopsy first?” (RWE: CD20 loss → change target). CTA: Read antigen‑loss note (non‑H2H)',
        ],
        language: ['Re‑biopsy first', 'CD20 loss', 'Change target', 'CD19 ADC', 'Protocol‑based', 'Outpatient plan', 'Clear next step'],
        kpis: ['Algorithm saves', 'Explainer completion ≥70%', 'Biopsy order clicks / dot‑phrase inserts', 'Comment tone: neutral‑calm'],
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
        title: 'Later‑line Zynlonta fits a steady clinic routine. Simple safety at home, and clear “when to call”.',
        rationale:
          'Patients respond to day‑to‑day expectations (appointments, side‑effects, what’s normal vs call). One useful link beats three; plain words beat slogans. Predictable outpatient experience + QoL cues are strong.',
        actions: [
          '“Your next 4 weeks” card — Week 0 treatment day (time/what happens); Week 1–2 at‑home routine (sun care, energy diary, swelling check); Week 3 review pre‑booked [DATE]; single link to clinic numbers/after‑hours',
          '“When to call” thresholds — icons + short labels: Fever ≥38°C, new/worse swelling, yellow eyes/skin, anything worrying → Call now',
          'Dosing‑day checklist — meds/food, sun protection, what to bring, ride timing, time in clinic',
          'Sample copy (editable) with one link and hard thresholds',
        ],
        language: ['Manageable at home', 'Outpatient dosing', 'Clear steps', 'Save these numbers', 'When to call'],
        kpis: ['Save rate', 'Average watch time (30‑sec)', 'Call mix: more right‑time calls'],
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
        title: 'Your quick plan: rides, reminders and who to call. One weekly checklist; a 3‑week rhythm.',
        rationale:
          'Caregivers ask for transport, scheduling, and contacts. Concrete tasks reduce anxiety more than general reassurance.',
        actions: [
          'Caregiver Quick Card — Dates & rides (treatment [DATE/TIME]; review ~3 weeks [DATE]); at‑home checks (skin, ankle/leg swelling, temperature, energy); contacts (weekday nurse line, after‑hours)',
          'Primary CTA: Add to calendar · Secondary: Save numbers',
          'Weekly checklist (downloadable) — Mon/Wed/Fri tick‑boxes with an “If X then call” strip',
          'Dosing‑day pack list — ID, meds list, snacks/water, charger, parking/valet note, return ride time',
          'Sample copy (editable) with fever ≥38°C call rule',
        ],
        language: ['Check once daily', 'Call if fever ≥38°C', 'Pack list', 'Checklist downloads', 'Forward rate'],
        kpis: ['Checklist downloads', 'Forward rate (family/GP)', 'Calendar add rate'],
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
        title: 'Clear 3L place with a predictable outpatient pathway: re‑biopsy first; switch target after CD20 bispecifics when appropriate; simple monitoring supports continuity.',
        rationale:
          'Access positivity tracks with simple pathway explanations and eligibility clarity. The market reads efficacy through a durability lens; protocol‑based safety keeps tone steady. Zynlonta performs well on QoL/continuity cues.',
        actions: [
          '3L Pathway Map (policy view) — Trigger: post‑CD20 BsAb or post‑CAR‑T relapse → re‑biopsy; Decision: CD20 loss/short durability → CD19 ADC (Zynlonta); Setting: outpatient with checklist safety; Cadence: treatment day + 3‑week review',
          'Primary CTA: Download referral criteria · Secondary: View outpatient flow',
          'Continuity‑of‑care note — predictable clinic time, standardised monitoring, fewer unplanned contacts (process language only; no claims)',
          'Future‑proofing tile — “Planning for earlier exposure”: when BsAbs move earlier, re‑biopsy + target‑switch is the built‑in fallback. CTA: neutral sequencing map (non‑H2H)',
        ],
        language: ['Predictable outpatient pathway', 'Protocol‑based monitoring', 'Clear referral criteria', 'Continuity of care', 'Non‑H2H outcomes context'],
        kpis: ['Referral criteria downloads', 'Outpatient flow views', 'Time‑to‑referral (where measurable)'],
        icon: Key,
        tone: 'positive',
      },
    ],
  },
]


