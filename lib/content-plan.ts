export type SentimentRange = { min: number; max: number }

export const headlineMetrics = {
  totalTopics: { zynlonta: 3, epcoritamab: 12, glofitamab: 8 },
  audienceSplit: {
    hcp: 35.7,
    patient: 75.4,
    caregiver: 36.2,
  },
  sentimentRanges: {
    zynlonta: { min: 0.32, max: 0.6 } as SentimentRange,
    epcoritamab: { min: -0.1, max: 0.46 } as SentimentRange,
    glofitamab: { min: 0.14, max: 0.46 } as SentimentRange,
  },
  insight:
    "Zynlonta maintains consistently positive sentiment but generates only 1/4 the discourse volume of bispecifics. This suggests a recognition problem, not a reputation problem.",
}

export const treatmentTimeline = {
  baseline: {
    cartTopics: 30,
    bispecificTopics: 20,
    zynlontaTopics: 3,
  },
  keyEvents: [
    { label: "NICE TA947 approval", month: "Jan 2024" },
    { label: "ASH", month: "Dec 2024" },
    { label: "Bispecifics into 2L (expected)", month: "Mar 2025" },
  ],
  insight:
    "The treatment landscape is CAR-T-dominated (8M views for general CAR-T discussion alone). Bispecifics are rapidly building narrative momentum with 'durability' framing appearing in 4+ distinct topics. Zynlonta's timeline presence is minimal—opportunity exists to mark future milestones proactively.",
}

export const topTrendingThemes = {
  items: [
    {
      title: "Bispecific Durability Narrative (highest threat)",
      bullets: ["5 topics explicitly mention durable/long-term/fixed-duration", "Combined reach: 600K+ views"],
    },
    {
      title: "CAR-T Safety Concerns (potential differentiator)",
      bullets: ["6,980 retweets on safety challenges", "2.9M views on neurotoxicity/CRS/deaths"],
    },
    {
      title: "Patient Misinformation Crisis (education gap)",
      bullets: [
        "5,383 retweets on ivermectin/fenbendazole (highest engagement)",
        "641K views—double Zynlonta's total reach",
      ],
    },
    {
      title: "Treatment Sequencing Silence (positioning vacuum)",
      bullets: ["246 retweets on sequencing; Zynlonta absent"],
    },
  ],
  insight:
    "The discourse is polarized: HCPs discuss bispecific efficacy while patients engage with alternative treatments. The middle ground—accessible, evidence-based 3L options—is a content desert.",
}

export const trendsExplorer = {
  filters: {
    timeframe: {
      current: "Month 0 Baseline",
      options: ["Month 0 Baseline", "Pre-ASH Dec 2024", "Post-ASH Dec 2024"],
    },
    geography: {
      default: "UK",
      options: [
        { name: "UK", enabled: true },
        { name: "Germany", enabled: false },
        { name: "Italy", enabled: false },
      ],
      dataGapNote: "Current dataset lacks geographic tagging.",
    },
    audienceThresholds: {
      hcp: 10,
      patient: 10,
      caregiver: 5,
    },
  },
  trendlinesInsight:
    "Epcoritamab and Glofitamab generate more volume and more diverse narratives. 12 distinct epcoritamab themes vs Zynlonta's 3 create more recall hooks.",
}

export const durabilityTheme = {
  zynlontaMentions: 0,
  bispecificMentions: [
    "Long-term remissions with epcoritamab in LBCL",
    "Durable responses with epcoritamab duobody",
    "Fixed-duration epcoritamab plus rituximab in FL",
    "Glofitamab and Columvi reinforce bispecific potential → fixed-duration regimens",
  ],
  insight:
    "The 'durability' narrative is bispecific-owned. This positions bispecifics as potentially curative (like CAR-T). Zynlonta lacks a counterpositioning narrative (bridging/preservation/optimization).",
}


