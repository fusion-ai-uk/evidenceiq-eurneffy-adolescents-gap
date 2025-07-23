"use client"
import { ContentSpotlightGrid } from "@/components/content-spotlight-grid"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

export function Access() {
  const contentIdeas = [
    {
      title: "Zynlonta in the UK: Rapid Regulatory Success",
      description:
        "Create a timeline infographic detailing the coordinated UK regulatory journey, from NICE approval (TA947) on January 31, 2024, to SMC approval just 11 days later, and the successful 90-day implementation across all UK nations including Northern Ireland.",
    },
    {
      title: "NHS Access Excellence: No Postcode Lottery",
      description:
        "Develop content highlighting the successful elimination of geographic disparities in Zynlonta access. Showcase how the coordinated NICE/SMC approval process and NHS implementation mandate ensured uniform availability across England, Wales, Scotland, and Northern Ireland.",
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
            <h3 className="text-xl font-semibold text-white mb-4">UK Regulatory Timeline</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li>
                <span className="font-bold text-sky-400">January 31, 2024:</span> NICE final guidance (TA947) - England
                & Wales approval.
              </li>
              <li>
                <span className="font-bold text-sky-400">February 12, 2024:</span> SMC approval - Scotland (11 days
                after NICE).
              </li>
              <li>
                <span className="font-bold text-sky-400">February 2024:</span> Northern Ireland Department of Health
                endorsement.
              </li>
              <li>
                <span className="font-bold text-sky-400">Spring 2024:</span> Implementation across all UK nations within
                90 days.
              </li>
              <li>
                <span className="font-bold text-sky-400">Ongoing:</span> Routine NHS commissioning - not Cancer Drugs
                Fund.
              </li>
            </ul>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6 rounded-xl bg-gradient-to-br from-gray-900/40 to-black/40 border border-sky-500/20 h-full">
            <h3 className="text-xl font-semibold text-white mb-4">Regulatory & Patient Advocacy Statements</h3>
            <blockquote className="text-gray-300 border-l-2 border-sky-500 pl-3 italic text-xs mb-4">
              "The most likely cost-effectiveness estimates are below what NICE normally considers acceptable" (after
              adjusting for disease severity and end-of-life criteria)
            </blockquote>
            <p className="text-right text-gray-400 text-xs mb-4">- NICE Assessment Committee</p>
            <blockquote className="text-gray-300 border-l-2 border-sky-500 pl-3 italic text-xs">
              "We are delighted that another treatment is available... It offers a new option for people where previous
              treatment courses have not been effective."
            </blockquote>
            <p className="text-right text-gray-400 text-xs mt-2">- Lymphoma Action</p>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
