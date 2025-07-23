"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

export function ExecutiveSummary() {
  const comparisonData = [
    { feature: "Mechanism", zynlonta: "CD19-directed ADC", traditional: "Broad cytotoxic chemotherapy" },
    { feature: "Targeting", zynlonta: "Targeted to lymphoma cells", traditional: "Non-selective cell killing" },
    { feature: "Administration", zynlonta: "30-minute IV infusion", traditional: "Multi-hour combination regimens" },
    { feature: "Schedule", zynlonta: "Every 21 days", traditional: "Multiple weekly treatments" },
    { feature: "Hair Loss", zynlonta: "Minimal", traditional: "Significant alopecia" },
    { feature: "Nausea/Vomiting", zynlonta: "Reduced compared to chemo", traditional: "Severe with combinations" },
    { feature: "Treatment Setting", zynlonta: "Outpatient", traditional: "Often requires hospitalization" },
    { feature: "Duration", zynlonta: "Up to 12 cycles (8-9 months)", traditional: "Variable, often longer" },
  ]

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6 rounded-xl bg-gradient-to-r from-gray-900/60 to-black/60 border border-sky-500/20"
      >
        <h3 className="text-2xl font-semibold text-white mb-4">Clinical Evidence Summary</h3>
        <p className="text-sky-400 mb-4 font-medium">
          Efficacy data from the pivotal LOTIS-2 trial in heavily pretreated DLBCL patients.
        </p>
        <p className="text-gray-300 leading-relaxed">
          NICE and SMC concluded that Zynlonta's benefits outweigh its risks, supported by robust clinical trial data
          from LOTIS-2. The CD19-directed antibody-drug conjugate demonstrated a 48% overall response rate and 25%
          complete remission rate in patients with ≥2 prior therapies, with durable responses lasting up to 2 years.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="p-6 rounded-xl bg-gradient-to-br from-gray-900/40 to-black/40 border border-sky-500/20"
        >
          <h4 className="text-xl font-semibold text-white mb-4">LOTIS-2 Trial Results</h4>
          <ul className="space-y-3 text-gray-300 text-sm list-disc list-inside">
            <li>48% overall response rate in heavily pretreated patients</li>
            <li>24-25% complete remission rate achieved</li>
            <li>68% of complete responders disease-free at 2 years</li>
            <li>Effective regardless of CD19 expression levels</li>
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-6 rounded-xl bg-gradient-to-br from-gray-900/40 to-black/40 border border-sky-500/20"
        >
          <h4 className="text-xl font-semibold text-white mb-4">UK Regulatory Success</h4>
          <ul className="space-y-3 text-gray-300 text-sm list-disc list-inside">
            <li>NICE approval (TA947) - January 31, 2024</li>
            <li>SMC Scotland approval - February 12, 2024</li>
            <li>11-day coordinated approval timeline</li>
            <li>Routine NHS commissioning - not Cancer Drugs Fund</li>
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="p-6 rounded-xl bg-gradient-to-br from-gray-900/40 to-black/40 border border-sky-500/20"
        >
          <h4 className="text-xl font-semibold text-white mb-4">NHS Implementation</h4>
          <ul className="space-y-3 text-gray-300 text-sm list-disc list-inside">
            <li>90-day implementation across all UK nations</li>
            <li>Available at NHS trusts with hematology expertise</li>
            <li>30-minute outpatient infusion every 21 days</li>
            <li>24/7 NHS contact support for patients</li>
          </ul>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-2xl font-semibold text-white mb-4 text-center">Zynlonta vs. Traditional Chemotherapy</h3>
        <Card className="bg-gradient-to-br from-gray-900/40 to-black/40 border border-sky-500/20">
          <Table>
            <TableHeader>
              <TableRow className="border-sky-500/20">
                <TableHead className="text-white">Feature</TableHead>
                <TableHead className="text-white">Zynlonta</TableHead>
                <TableHead className="text-white">Traditional Chemotherapy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonData.map((row) => (
                <TableRow key={row.feature} className="border-sky-500/10">
                  <TableCell className="font-medium text-gray-300">{row.feature}</TableCell>
                  <TableCell className="text-sky-400">
                    {row.feature === "Targeting" ? row.zynlonta : row.zynlonta}
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {row.feature === "Targeting" ? row.traditional : row.traditional}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </motion.div>
    </div>
  )
}
