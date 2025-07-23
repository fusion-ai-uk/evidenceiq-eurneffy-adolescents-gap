"use client"
import { ContentSpotlightGrid } from "@/components/content-spotlight-grid"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

export function Mechanism() {
  const contentIdeas = [
    {
      title: "The Science of ADC Technology: Targeted Precision",
      description:
        "Create an animated explainer video illustrating Zynlonta's mechanism of action. Show how the CD19-directed antibody delivers the pyrrolobenzodiazepine (PBD) dimer warhead directly to lymphoma cells, achieving targeted cytotoxicity while sparing healthy tissue.",
    },
    {
      title: "British Innovation: From Lab to Patient",
      description:
        "Develop a detailed story about the UK scientific heritage behind Zynlonta. Cover the pyrrolobenzodiazepine warhead technology co-invented by UK academics, the role of Cancer Research UK funding, and the 20-year journey from research to approved therapy.",
    },
  ]

  return (
    <div className="space-y-8">
      <ContentSpotlightGrid spotlights={contentIdeas} />

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6 rounded-xl bg-gradient-to-br from-gray-900/40 to-black/40 border border-sky-500/20 h-full">
            <h3 className="text-xl font-semibold text-white mb-4">Mechanism of Action</h3>
            <ul className="space-y-3 text-gray-300 text-sm list-disc list-inside">
              <li>CD19-directed antibody-drug conjugate (ADC) with targeted delivery.</li>
              <li>Pyrrolobenzodiazepine (PBD) dimer warhead technology for potent cytotoxicity.</li>
              <li>Selective binding to CD19 on B-cell lymphomas ensures targeted therapy.</li>
              <li>Single-agent therapy - no combination chemotherapy required.</li>
            </ul>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6 rounded-xl bg-gradient-to-br from-gray-900/40 to-black/40 border border-sky-500/20 h-full">
            <h3 className="text-xl font-semibold text-white mb-4">UK Scientific Heritage</h3>
            <ul className="space-y-3 text-gray-300 text-sm list-disc list-inside">
              <li>Pyrrolobenzodiazepine warhead technology co-invented by UK academics.</li>
              <li>Cancer Research UK funding supported original research development.</li>
              <li>Professor John Hartley (UCL) and Professor David Thurston - key inventors.</li>
              <li>20-year journey from CRUK-funded research to approved NHS therapy.</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
