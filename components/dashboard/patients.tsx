"use client"
import { ContentSpotlightGrid } from "@/components/content-spotlight-grid"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

export function Patients() {
  const contentIdeas = [
    {
      title: "A New Hope: Life After Multiple Relapses",
      description:
        "Develop a video series sharing stories from DLBCL patients who have experienced multiple treatment failures. Highlight the psychological relief and renewed hope that Zynlonta provides as a targeted, chemotherapy-free option. Feature testimonials about returning to normal life and work after treatment.",
    },
    {
      title: "Gentle Yet Powerful: The ADC Advantage",
      description:
        "Create educational content showcasing how Zynlonta's targeted approach delivers powerful anti-cancer effects while preserving quality of life. Feature patient testimonials about maintaining hair, reduced nausea, and the convenience of outpatient treatment every 3 weeks.",
    },
  ]

  return (
    <div className="space-y-8">
      <ContentSpotlightGrid spotlights={contentIdeas} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="p-6 rounded-xl bg-gradient-to-r from-gray-900/60 to-black/60 border border-sky-500/20"
      >
        <h3 className="text-2xl font-semibent text-white mb-4">Real Patient Testimonial</h3>
        <blockquote className="text-sky-400 border-l-4 border-sky-500 pl-4 italic">
          "After multiple treatments failed, I was losing hope. Zynlonta gave me my life back - I was able to return to
          work and feel normal again. The treatment was so much easier than chemotherapy, and knowing it was
          specifically targeting my lymphoma cells gave me confidence."
        </blockquote>
        <p className="text-right text-gray-400 mt-2">- DLBCL Patient, NHS Treatment</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6 rounded-xl bg-gradient-to-br from-gray-900/40 to-black/40 border border-sky-500/20 h-full">
            <h4 className="text-xl font-semibold text-white mb-4">Quality of Life Improvements</h4>
            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-sky-400">Treatment Comfort</h5>
                <p className="text-gray-300 text-sm">
                  30-minute outpatient infusions every 3 weeks, avoiding the intensive schedules and hospitalizations of
                  traditional chemotherapy combinations.
                </p>
              </div>
              <div>
                <h5 className="font-semibold text-sky-400">Preserved Appearance</h5>
                <p className="text-gray-300 text-sm">
                  Minimal hair loss and reduced nausea/vomiting compared to combination chemotherapy, helping patients
                  maintain their sense of self during treatment.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6 rounded-xl bg-gradient-to-br from-gray-900/40 to-black/40 border border-sky-500/20 h-full">
            <h4 className="text-xl font-semibold text-white mb-4">Treatment Outcomes</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-black/40 border border-sky-500/10">
                <span className="text-gray-300 text-sm">Overall Response Rate</span>
                <span className="text-xl font-bold text-sky-400">48%</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-black/40 border border-sky-500/10">
                <span className="text-gray-300 text-sm">Complete Remission Rate</span>
                <span className="text-xl font-bold text-sky-400">25%</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-black/40 border border-sky-500/10">
                <span className="text-gray-300 text-sm">2-Year Disease-Free Survival</span>
                <span className="text-xl font-bold text-sky-400">68%</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
