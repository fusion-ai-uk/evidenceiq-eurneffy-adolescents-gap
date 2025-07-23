"use client"
import { ContentSpotlightGrid } from "@/components/content-spotlight-grid"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { ShieldCheck, Thermometer } from "lucide-react"

export function SideEffects() {
  const contentIdeas = [
    {
      title: "PBD-Specific Safety: A Manageable Profile",
      description:
        "Create an infographic highlighting Zynlonta's manageable safety profile with proper monitoring. Emphasize the established protocols for photosensitivity management, fluid retention monitoring, and the comprehensive NHS support systems that ensure patient safety.",
    },
    {
      title: "Sun Safety with Zynlonta: Protecting Patients",
      description:
        "Develop patient education materials on photosensitivity management during Zynlonta treatment. Include practical advice on daily sunscreen use, protective clothing, and lifestyle modifications, supported by NHS patient support services.",
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
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <ShieldCheck className="mr-2 text-sky-400" />
              Safety Profile
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sky-400">PBD-Specific Effects</h4>
                <p className="text-gray-300 text-sm">
                  Photosensitivity and fluid retention are key monitoring points, managed through established NHS
                  protocols.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sky-400">Hematologic Monitoring</h4>
                <p className="text-gray-300 text-sm">
                  Regular FBC and LFT surveillance with dose modification guidelines for cytopenias and liver enzyme
                  elevations.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-green-400">Key Advantage</h4>
                <p className="text-gray-300 text-sm">
                  Manageable safety profile with proper monitoring and pre-medication protocols, supported by 24/7 NHS
                  contact systems.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="p-6 rounded-xl bg-gradient-to-br from-gray-900/40 to-black/40 border border-sky-500/20 h-full">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Thermometer className="mr-2 text-sky-400" />
              Treatment & Monitoring
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sky-400">Treatment Protocol</h4>
                <p className="text-gray-300 text-sm">
                  150 μg/kg IV cycles 1-2, then 75 μg/kg from cycle 3. 30-minute outpatient infusion every 21 days.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sky-400">Pre-medication</h4>
                <p className="text-gray-300 text-sm">
                  Dexamethasone 4mg twice daily for 3 days reduces cytokine-mediated reactions and improves
                  tolerability.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-green-400">NHS Support</h4>
                <p className="text-gray-300 text-sm">
                  Comprehensive safety monitoring protocols with 24/7 emergency contact systems and specialist lymphoma
                  nurse support.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
