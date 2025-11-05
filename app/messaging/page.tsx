"use client"

import { RecommendationCarousel } from "@/components/messaging/recommendation-carousel"
import { messagingRecommendations } from "@/data/messaging-recommendations"
import { Container } from "@/components/ui/container"

export default function MessagingPage() {
  const hcp = messagingRecommendations.find((g) => g.audience === 'HCP')!
  const patient = messagingRecommendations.find((g) => g.audience === 'Patient')!
  const caregiver = messagingRecommendations.find((g) => g.audience === 'Caregiver')!
  const payer = messagingRecommendations.find((g) => g.audience === 'Payer')!
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1>Messaging Recommendations</h1>
        <p className="lead">Audience‑specific creative guidance you can ship today. Designed to add new cards over time.</p>
      </div>

      <RecommendationCarousel title="HCP – Clinic Rules & Sequencing" subtitle="Operational clarity that converts" items={hcp.items} />
      <RecommendationCarousel title="Patients – Safety & Routine" subtitle="Calm, checklist‑first assets" items={patient.items} />
      <RecommendationCarousel title="Caregivers – Weekly Support" subtitle="Concrete tasks and reassurance" items={caregiver.items} />
      <RecommendationCarousel title="Payers – Eligibility & Pathway" subtitle="Make referral predictable" items={payer.items} />

      {/* bottom spacer for comfortable scroll finish */}
      <div className="h-24 md:h-32" />
    </div>
  )
}
