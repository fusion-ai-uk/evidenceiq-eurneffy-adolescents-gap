"use client"
import { ContentSpotlightGrid } from "@/components/content-spotlight-grid"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

export function Trends() {
  const contentIdeas = [
    {
      title: "Transforming DLBCL Care: The ADC Revolution",
      description:
        "Write a thought leadership article on how Zynlonta represents a paradigm shift in DLBCL treatment. Discuss the move from broad cytotoxic chemotherapy to targeted ADC therapy, addressing the critical unmet need in heavily pretreated patients where traditional options have limited efficacy.",
    },
    {
      title: "Beyond DLBCL: The Future of CD19-Directed Therapy",
      description:
        "Create a forward-looking content piece about the expanding potential of CD19-directed ADCs. Explore combination studies with immunotherapy, earlier-line integration research, and the potential for treating other CD19-positive hematologic malignancies.",
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
            <h3 className="text-xl font-semibold text-white mb-4">Innovation Impact: Addressing Healthcare Gaps</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-400">Current challenges in relapsed/refractory DLBCL:</p>
              <ul className="space-y-1 text-gray-300 list-disc list-inside pl-2">
                <li>Limited treatment options after 2+ prior therapies.</li>
                <li>Poor tolerability of intensive combination chemotherapy.</li>
                <li>CAR-T therapy not suitable for all patients.</li>
              </ul>
              <p className="text-sky-400 pt-2">Zynlonta's solutions:</p>
              <ul className="space-y-1 text-gray-300 list-disc list-inside pl-2">
                <li>Targeted therapy with manageable single-agent profile.</li>
                <li>Off-the-shelf availability for urgent treatment needs.</li>
                <li>Outpatient administration improving quality of life.</li>
              </ul>
            </div>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6 rounded-xl bg-gradient-to-br from-gray-900/40 to-black/40 border border-sky-500/20 h-full">
            <h3 className="text-xl font-semibold text-white mb-4">Future Outlook</h3>
            <ul className="space-y-3 text-gray-300 text-sm list-disc list-inside">
              <li>Combination studies with bispecific antibodies and immunotherapy.</li>
              <li>Earlier-line integration research in first and second-line settings.</li>
              <li>Real-world evidence collection through NHS data systems.</li>
              <li>Pediatric applications investigation for younger patients.</li>
              <li>Next-generation ADCs deploying UK-invented PBD technology.</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
