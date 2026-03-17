export const PILLARS = [
  { key: "teen_issues", label: "Teen Issues", description: "Adolescent lived experience, behaviour, and transition-specific frictions." },
  { key: "device_issues", label: "Device Issues", description: "Device handling, training, switching, and practical usability constraints." },
  { key: "multiple_barriers", label: "Multiple Barriers", description: "Compounded psychosocial, practical, and pathway barriers." },
  { key: "high_risk", label: "High Risk", description: "Risk amplification, delay points, and consequence-sensitive contexts." },
  { key: "improve_outcomes", label: "Improve Outcomes", description: "Evidence linked to better preparedness, response, and continuity." },
] as const

export const TOPICS = [
  { key: "carriage_adherence", label: "Carriage & Adherence", description: "Carrying behaviour, two-device readiness, and practical adherence." },
  { key: "dosing_transitions", label: "Dosing Transitions", description: "Dose thresholds, switching, and under-dosing/over-dosing transition risk." },
  { key: "recognition_response", label: "Recognition & Response", description: "Symptom recognition, escalation, treatment delay, and execution." },
  { key: "settings_of_risk", label: "Settings of Risk", description: "Where events and barriers emerge across real-world contexts." },
  { key: "equity_access", label: "Equity & Access", description: "Access differences, deprivation, and care inequity signals." },
  { key: "evidence_gaps", label: "Evidence Gaps", description: "What remains unresolved and where supplementary research is needed." },
] as const

export const PAGE_SECTION_DESCRIPTIONS = {
  pillars: "Compare support strength and gap pressure across the five narrative pillars.",
  topics: "Map what is known vs what is missing across the six topic axes.",
  barriers: "Understand barrier mechanisms and their behavioural and setting context.",
  dosingResponseSettings: "Operational view of dosing transitions, response execution, and risk settings.",
  opportunity: "Cautious evidence-to-opportunity workbench with explicit support and caution framing.",
} as const

export const BARRIER_FAMILIES = [
  {
    key: "psychosocial_identity",
    label: "Psychosocial / Identity Barriers",
    tags: [
      "embarrassment",
      "stigma_visibility",
      "peer_pressure",
      "desire_to_be_normal",
      "risk_taking",
      "invincibility",
      "bullying",
      "parent_transition_friction",
      "transition_to_independence",
    ],
  },
  {
    key: "device_practical",
    label: "Device / Practical Barriers",
    tags: [
      "device_bulk",
      "inconvenience",
      "needle_fear",
      "expiry_shelf_life",
      "storage_constraints",
      "not_carrying_device",
      "not_having_two_devices",
      "supply_shortage",
      "cost_access",
    ],
  },
  {
    key: "training_technique",
    label: "Training / Technique Barriers",
    tags: [
      "training_gap",
      "technique_error",
      "uncertain_when_to_use",
      "symptom_miscalculation",
      "incorrect_device_demonstration",
      "forgets_steps_under_stress",
      "uncertain_device_technique",
      "hcp_training_gap",
      "first_responder_gap",
    ],
  },
  {
    key: "response_execution",
    label: "Response Execution Barriers",
    tags: [
      "delay_in_adrenaline",
      "antihistamine_first",
      "fear_of_side_effects",
      "panic_under_stress",
      "hesitates_to_call_emergency_services",
      "does_not_recognise_anaphylaxis",
      "uncertain_symptom_severity",
    ],
  },
  {
    key: "system_access",
    label: "System / Access Barriers",
    tags: [
      "specialist_access",
      "education_gap",
      "regional_variation",
      "deprivation",
      "socioeconomic_status",
      "transport_cost",
      "device_cost",
      "race_ethnicity",
    ],
  },
] as const

export const SETTING_FAMILIES = [
  {
    key: "community_daily",
    label: "Community / Daily Life",
    tags: ["home_domestic", "friends_house", "community_general", "outdoor", "weekend_after_hours"],
  },
  {
    key: "education_transition",
    label: "Education & Transition",
    tags: ["school", "school_to_community_transition"],
  },
  {
    key: "activity_exposure",
    label: "Activity / Exposure Contexts",
    tags: ["sport", "travel", "restaurant_food_out"],
  },
  {
    key: "healthcare_pathway",
    label: "Healthcare Pathway",
    tags: ["emergency_department", "primary_care"],
  },
] as const

export const OPPORTUNITY_FAMILIES = [
  {
    key: "portability_discretion",
    label: "Portability & Discretion",
    tags: ["needle_free_relevance", "discreet_portability_relevance", "reduced_device_bulk_relevance"],
  },
  {
    key: "adherence_training",
    label: "Adherence & Training",
    tags: ["reduced_needle_fear_relevance", "training_reengagement_opportunity", "adherence_convenience_relevance"],
  },
  {
    key: "storage_practicality",
    label: "Storage & Practical Constraints",
    tags: ["storage_shelf_life_relevance"],
  },
] as const

export const FLAG_LABELS: Record<string, string> = {
  flag_pillar_teen_issues: "Pillar: Teen Issues",
  flag_pillar_device_issues: "Pillar: Device Issues",
  flag_pillar_multiple_barriers: "Pillar: Multiple Barriers",
  flag_pillar_high_risk: "Pillar: High Risk",
  flag_pillar_improve_outcomes: "Pillar: Improve Outcomes",
  flag_topic_carriage_adherence: "Topic: Carriage & Adherence",
  flag_topic_dosing_transitions: "Topic: Dosing Transitions",
  flag_topic_recognition_response: "Topic: Recognition & Response",
  flag_topic_settings_of_risk: "Topic: Settings of Risk",
  flag_topic_equity_access: "Topic: Equity & Access",
  flag_topic_evidence_gaps: "Topic: Evidence Gaps",
}

export const VALUE_LABELS: Record<string, string> = {
  needle_free_relevance: "Needle-free relevance",
  discreet_portability_relevance: "Discreet portability relevance",
  reduced_device_bulk_relevance: "Reduced device bulk relevance",
  reduced_needle_fear_relevance: "Reduced needle fear relevance",
  training_reengagement_opportunity: "Training re-engagement opportunity",
  storage_shelf_life_relevance: "Storage/shelf-life relevance",
  adherence_convenience_relevance: "Adherence convenience relevance",
}

