"use client"
import { ContentSpotlightGrid } from "@/components/content-spotlight-grid"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

export function Prescribing() {
  const contentIdeas = [
    {
      title: "Integrating Zynlonta into DLBCL Treatment Pathways",
      description:
        "Create comprehensive resources for hematologists on positioning Zynlonta in third-line DLBCL treatment. Highlight the NICE criteria (post-polatuzumab vedotin) and SMC criteria (CAR-T unsuitable/failed), with practical guidance on patient selection and sequencing with other therapies.",
    },
    {
      title: "ADC Safety Excellence: Managing PBD-Specific Toxicities",
      description:
        "Develop a clinical webinar series for NHS hematology teams on managing Zynlonta's unique safety profile. Cover photosensitivity protocols, fluid retention monitoring, and the established 24/7 NHS contact systems for patient support.",
    },
  ]

  return (
    <div className="space-y-8">
      <ContentSpotlightGrid spotlights={contentIdeas} />

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6 rounded-xl bg-gradient-to-br from-gray-900/40 to-black/40 border border-sky-500/20 h-full">
            <h3 className="text-xl font-semibold text-white mb-4">Expert Quotes</h3>
            <blockquote className="text-sky-400 border-l-4 border-sky-500 pl-4 italic text-sm mb-4">
              "With its off-the-shelf availability, [loncastuximab] provides additional options for patients
              experiencing rapid disease progression and requiring urgent care."
            </blockquote>
            <p className="text-right text-gray-400 text-xs mb-6">
              - Professor Andrew Davies (University of Southampton)
            </p>
            <blockquote className="text-sky-400 border-l-4 border-sky-500 pl-4 italic text-sm">
              "We are delighted that another treatment is available... It offers a new option for people where previous
              treatment courses have not been effective."
            </blockquote>
            <p className="text-right text-gray-400 text-xs mt-2">- Lymphoma Action</p>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6 rounded-xl bg-gradient-to-br from-gray-900/40 to-black/40 border border-sky-500/20 h-full">
            <h3 className="text-xl font-semibold text-white mb-4">Clinical Adoption & NHS Integration</h3>
            <ul className="space-y-3 text-gray-300 text-sm list-disc list-inside">
              <li>Third-line therapy positioning after polatuzumab vedotin (England/Wales).</li>
              <li>Alternative to CAR-T for ineligible patients (Scotland).</li>
              <li>Single-agent approach ideal for frail, heavily pretreated patients.</li>
              <li>Major UK cancer centers successfully integrated into lymphoma pathways.</li>
              <li>MDT protocols established across regional cancer networks.</li>
              <li>Electronic prescribing systems updated (ARIA/ChemoCare integration).</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
