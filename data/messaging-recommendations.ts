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
        title: '3L after a CD20 bispecific: the next‑step playbook',
        rationale: '',
        actions: [
          'When a patient progresses after a CD20 bispecific, the brand shows up with one simple rule and one clean next step. We say it in calm English: re‑biopsy to check CD20; if CD20 is absent—or the last response was short—switch the target to a CD19 ADC (Zynlonta) and keep care outpatient with standard premeds, LFTs, an edema check and straightforward photosensitivity guidance. We package this as a fast, HCP‑gated single‑page website that puts the rule at the top and fixes two big buttons to the bottom of the screen—“Order biopsy” and “Start premed checklist.” To reach the right people, we send a short post‑congress email within forty‑eight hours of major data moments, run geofenced banners around cancer centres and congress hotels that deep‑link to the page, and mirror the same experience on booth screens with a large QR code. Success looks like steady traffic to the page, visible clicks on the two buttons, and comments that stay neutral‑calm rather than argumentative.'
        ],
        language: [],
        kpis: [],
        icon: Target,
        tone: 'positive',
      },
      {
        id: 'hcp-1b',
        title: 'Clinic script you can paste into the EHR',
        rationale: '',
        actions: [
          'Teams move faster when everyone shares the same line. We provide a paste‑ready sentence for APPs and front‑desk staff: “After a CD20 bispecific, re‑biopsy CD20. If CD20 is lost or the last response was short, switch the target to a CD19 ADC. Use standard premeds and monitoring. Book the three‑week review today.” We distribute this through a quick “copy‑to‑clipboard” email, a short screen‑capture showing how to add the dot‑phrase, and a small desk card with a QR that opens the text on a phone. The measure of success here is simple: dot‑phrase inserts and replies from clinics telling us they used it.'
        ],
        language: [],
        kpis: [],
        icon: Target,
        tone: 'positive',
      },
      {
        id: 'hcp-1c',
        title: 'Thirty‑second explainer (captioned)',
        rationale: '',
        actions: [
          'Busy feeds reward short, captioned video that says one thing clearly. Our clip opens on the problem—short durability after a CD20 bispecific—then shows the rule to re‑biopsy, the moment to switch to a CD19 ADC if CD20 is absent or the last response was brief, and the reassurance that care stays outpatient with a booked review at three weeks. The end screen repeats the two actions from the website, so viewers know exactly what to do next. We run the video on HCP social, embed it in the follow‑up email, and loop it at the booth. We judge it on completion rate and the number of viewers who land on the single‑page site from the end screen.'
        ],
        language: [],
        kpis: [],
        icon: Target,
        tone: 'positive',
      },
      {
        id: 'hcp-1d',
        title: 'Why re‑biopsy first? (brand explainer)',
        rationale: '',
        actions: [
          'Clinicians act faster when the “why” is uncomplicated. We explain, in plain language, that CD20 can be lost after CD20 bispecifics and that changing target is the simplest way to keep care moving when that happens. We tell this story as a three‑minute podcast minisode with a community voice, a two‑page PDF titled “Evidence at a glance,” and a short talk in the mini‑theatre at congress. Journal banners and LinkedIn Document posts point to the PDF rather than a data dump. We watch for downloads, listens and time‑on‑document to confirm that the rationale is landing without turning into a debate.'
        ],
        language: [],
        kpis: [],
        icon: Target,
        tone: 'positive',
      },
      {
        id: 'hcp-1e',
        title: '2L exploration: the “simple clinic weeks” map',
        rationale: '',
        actions: [
          'For second line, we frame Zynlonta around fit and flow rather than head‑to‑head claims. We publish a small, interactive map that shows where Zynlonta belongs when continuity, outpatient cadence and straightforward monitoring matter. The same map appears as a LinkedIn Document carousel and powers a five‑minute podcast conversation that sounds like a friendly tumour board. At congress we host a coffee‑break huddle with a QR back to the map, and afterwards we retarget visitors who hovered on the 2L section with a short email that simply says, “Here’s where the weeks look simple.”'
        ],
        language: [],
        kpis: [],
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
        title: 'Your next four weeks',
        rationale: '',
        actions: [
          'Patients and carers do better when the month ahead fits on one screen. We create a friendly, single‑page site that shows Week 0 as treatment day—how long it takes and how it usually feels—Weeks 1 and 2 as ordinary life with sun care, a quick swelling check and a gentle energy note, and Week 3 as the clinic review with the actual date pre‑filled. We send the link in a consent‑day email and text, show a matching loop on clinic screens, and keep one large button fixed to the page that saves daytime and after‑hours numbers to the phone. We judge the asset on save rate and how long people stay on the page.'
        ],
        language: [],
        kpis: [],
        icon: Shield,
        tone: 'positive',
      },
      {
        id: 'patient-1b',
        title: 'When to call us',
        rationale: '',
        actions: [
          'Uncertainty causes unnecessary calls; hard thresholds reduce worry and improve timing. We stick to four lines that anyone can remember: a fever of thirty‑eight degrees or higher—call now; new or worsening swelling—call now; yellow eyes or skin—call now; if you are worried—call now. The same words appear in a day‑zero email, a forty‑eight‑hour reminder text, a wallet card and a poster with a large QR code that dials the clinic. The indicator of success is a healthier call mix: fewer anxious “just checking” calls and more right‑time calls.'
        ],
        language: [],
        kpis: [],
        icon: Shield,
        tone: 'positive',
      },
      {
        id: 'patient-1c',
        title: 'Dosing‑day checklist',
        rationale: '',
        actions: [
          'The calmest treatment day starts the day before. We write a short checklist in human language—any food or medicines notes from the team, a hat and sunscreen, ID, water or snacks, a phone charger, a plan for the ride home and a realistic sense of time in clinic—and we send it automatically the afternoon before by email and text. The same list is a printable PDF and a quick visual the nurse can run through on an iPad at check‑in. We watch saves and, more importantly, fewer last‑minute questions.'
        ],
        language: [],
        kpis: [],
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
        rationale: '',
        actions: [
          'Families want dates, simple checks and a number that works. We give them a small page they can bookmark with the treatment date and time, a reminder that the review is roughly three weeks later, and four daily look‑ins—skin, ankle or leg swelling, temperature and energy. We add the weekday nurse line and the after‑hours number and let people save both to contacts in one tap. We email a calendar invite for the review visit and supply a WhatsApp‑ready image so relatives can share the essentials easily. We track calendar adds, number saves and forwards to other family members.'
        ],
        language: [],
        kpis: [],
        icon: Eye,
        tone: 'neutral',
      },
      {
        id: 'care-1b',
        title: 'Weekly home checklist',
        rationale: '',
        actions: [
          'Confidence grows when the routine is the same each week. We offer a printable and a phone‑sized image that ask carers to tick skin, edema, temperature and fatigue, with a small strip along the bottom that says “If X happens, call [number].” Nurses attach the file to their follow‑up email, and the clinic kiosk lets carers email the checklist to themselves before they leave. Downloads and repeat opens tell us if the habit is forming.'
        ],
        language: [],
        kpis: [],
        icon: Eye,
        tone: 'neutral',
      },
      {
        id: 'care-1c',
        title: 'Dosing‑day pack list',
        rationale: '',
        actions: [
          'Nothing fancy—just the things that matter. We remind carers to bring ID, a medicines list, snacks or water and a charger, and to check parking or valet details and set a pickup time for the ride home. The reminder goes out by text the day before, appears on the clinic Wi‑Fi splash page, and sits on reception as a small counter card with a QR code. Forwards from the text message and fewer forgotten‑item delays show it’s doing its job.'
        ],
        language: [],
        kpis: [],
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
        rationale: '',
        actions: [
          'Referral moves faster when the steps look predictable. We publish a clean, single‑page site that sets the trigger as progression after a CD20 bispecific or relapse after CAR‑T, points to re‑biopsy as the first step, and shows the decision point clearly: if CD20 is lost or the prior response was short, move to a CD19 ADC in an outpatient setting with a treatment day and a three‑week review. A prominent button offers “Download referral criteria,” and the same content lives as a PDF for packs and intranets. We mail the link to referrers and pathway owners, run targeted banners during weekday clinic hours, and equip the booth team with a kiosk where visitors can scan and leave with the file. We measure criteria downloads, completed referral forms and, where services share data, time‑to‑referral.'
        ],
        language: [],
        kpis: [],
        icon: Key,
        tone: 'positive',
      },
      {
        id: 'payer-1b',
        title: 'Predictable outpatient flow',
        rationale: '',
        actions: [
          'Services run better when visits are planned. We map the standard premedication, the key monitoring checkpoints and the calendar cadence so unplanned contacts drop. The flow sits on the hospital intranet as a short page, becomes a poster for workrooms and plays as a forty‑five‑second animation on internal screens. After monthly ops meetings, service leads send a short email linking to the page. Page views and staff feedback tell us whether the flow is clear; a reduction in unscheduled contacts is the longer‑term signal.'
        ],
        language: [],
        kpis: [],
        icon: Key,
        tone: 'positive',
      },
      {
        id: 'payer-1c',
        title: 'Planning for earlier exposure',
        rationale: '',
        actions: [
          'If bispecifics move earlier, re‑biopsy plus target switch remains the built‑in fallback when CD20 is absent or prior benefit was short. We keep this neutral and useful: a small microsite with a non‑head‑to‑head sequencing map, a short webinar that lives on the same page and a roundtable at congress titled “If BsAbs move earlier.” We follow up with an email that simply says, “Here is the map in one place.” Map views and webinar replays show whether the note is doing its quiet job.'
        ],
        language: [],
        kpis: [],
        icon: Key,
        tone: 'positive',
      },
    ],
  },
]


