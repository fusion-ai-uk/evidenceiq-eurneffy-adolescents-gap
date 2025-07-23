"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ExecutiveSummary } from "@/components/dashboard/executive-summary"
import { Prescribing } from "@/components/dashboard/prescribing"
import { Patients } from "@/components/dashboard/patients"
import { Access } from "@/components/dashboard/access"
import { Trends } from "@/components/dashboard/trends"
import { Mechanism } from "@/components/dashboard/mechanism"
import { SideEffects } from "@/components/dashboard/side-effects"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("clinical-evidence")

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900/30 to-black">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-sky-500/5 to-transparent rounded-full"></div>
        <div className="absolute inset-0 bg-stars opacity-30"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-sky-500/20 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <ArrowLeft className="h-5 w-5 text-sky-400 group-hover:translate-x-[-2px] transition-transform" />
              <Image
                src="/evidenceiq-logo.png"
                alt="evidenceIQ"
                width={140}
                height={45}
                className="brightness-0 invert drop-shadow-[0_0_10px_rgba(56,189,248,0.3)]"
              />
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-sky-300/80 font-medium tracking-wide">
              Clinical Evidence & Patient Insights
            </div>
            <div className="text-2xl font-bold text-white">Zynlonta</div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900/60 to-black/60 border border-sky-500/20 rounded-2xl backdrop-blur-xl shadow-[0_0_50px_rgba(56,189,248,0.1)]">
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-8 p-4 rounded-xl bg-gradient-to-r from-sky-500/10 to-blue-600/10 border border-sky-500/20">
                <p className="text-gray-300 text-sm leading-relaxed">
                  This dashboard provides a comprehensive overview of Zynlonta, the first-in-class CD19-directed
                  antibody-drug conjugate. Explore the clinical evidence, patient experience data, and regulatory
                  milestones that establish Zynlonta as a breakthrough therapy for relapsed/refractory DLBCL treatment
                  across the NHS.
                </p>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full bg-black/60 border border-sky-500/20 rounded-xl p-1 backdrop-blur-xl h-auto">
                  <div className="grid grid-cols-7 gap-1 w-full">
                    <TabsTrigger
                      value="clinical-evidence"
                      className="flex flex-col items-center justify-center p-3 text-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(56,189,248,0.3)] rounded-lg transition-all duration-300 h-16 w-full"
                    >
                      <span className="font-medium text-xs leading-none">Clinical Evidence</span>
                      <span className="text-[10px] opacity-60 mt-1 leading-none">Efficacy & Trials</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="patient-experience"
                      className="flex flex-col items-center justify-center p-3 text-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(56,189,248,0.3)] rounded-lg transition-all duration-300 h-16 w-full"
                    >
                      <span className="font-medium text-xs leading-none">Patient Experience</span>
                      <span className="text-[10px] opacity-60 mt-1 leading-none">QoL & Preference</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="hcp-perspectives"
                      className="flex flex-col items-center justify-center p-3 text-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(56,189,248,0.3)] rounded-lg transition-all duration-300 h-16 w-full"
                    >
                      <span className="font-medium text-xs leading-none">HCP Perspectives</span>
                      <span className="text-[10px] opacity-60 mt-1 leading-none">Adoption & Protocols</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="safety-stability"
                      className="flex flex-col items-center justify-center p-3 text-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(56,189,248,0.3)] rounded-lg transition-all duration-300 h-16 w-full"
                    >
                      <span className="font-medium text-xs leading-none">Safety & Stability</span>
                      <span className="text-[10px] opacity-60 mt-1 leading-none">Profile & Storage</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="market-access"
                      className="flex flex-col items-center justify-center p-3 text-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(56,189,248,0.3)] rounded-lg transition-all duration-300 h-16 w-full"
                    >
                      <span className="font-medium text-xs leading-none">Market Access</span>
                      <span className="text-[10px] opacity-60 mt-1 leading-none">Regulatory & Launch</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="scientific-foundation"
                      className="flex flex-col items-center justify-center p-3 text-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(56,189,248,0.3)] rounded-lg transition-all duration-300 h-16 w-full"
                    >
                      <span className="font-medium text-xs leading-none">Scientific Foundation</span>
                      <span className="text-[10px] opacity-60 mt-1 leading-none">MoA & Development</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="innovation-future"
                      className="flex flex-col items-center justify-center p-3 text-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_20px_rgba(56,189,248,0.3)] rounded-lg transition-all duration-300 h-16 w-full"
                    >
                      <span className="font-medium text-xs leading-none">Innovation & Future</span>
                      <span className="text-[10px] opacity-60 mt-1 leading-none">Impact & Outlook</span>
                    </TabsTrigger>
                  </div>
                </TabsList>

                <TabsContent value="clinical-evidence" className="mt-8">
                  <ExecutiveSummary />
                </TabsContent>
                <TabsContent value="patient-experience" className="mt-8">
                  <Patients />
                </TabsContent>
                <TabsContent value="hcp-perspectives" className="mt-8">
                  <Prescribing />
                </TabsContent>
                <TabsContent value="safety-stability" className="mt-8">
                  <SideEffects />
                </TabsContent>
                <TabsContent value="market-access" className="mt-8">
                  <Access />
                </TabsContent>
                <TabsContent value="scientific-foundation" className="mt-8">
                  <Mechanism />
                </TabsContent>
                <TabsContent value="innovation-future" className="mt-8">
                  <Trends />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-sky-500/20 bg-black/80 backdrop-blur-xl py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">© 2024 evidenceIQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
