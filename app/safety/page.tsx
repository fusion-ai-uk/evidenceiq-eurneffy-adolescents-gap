import { AERadar } from "@/components/safety/ae-radar"
import { FlaggedSignals } from "@/components/safety/flagged-signals"
import { PatientQuotes } from "@/components/safety/patient-quotes"
import { NHSTrustMentions } from "@/components/safety/nhs-trust-mentions"
import { PhotosensitivityDeepDive } from "@/components/safety/photosensitivity-deep-dive"

export default function SafetyPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Safety & AE Monitor</h1>
        <p className="lead">
          Surface emerging safety signals and track adverse event discussions across therapies
        </p>
      </div>

      <PhotosensitivityDeepDive />

      {/* AE Tracking */}
      <AERadar />

      {/* Flagged Signals and Patient Quotes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FlaggedSignals />
        <PatientQuotes />
      </div>

      <NHSTrustMentions />
    </div>
  )
}
