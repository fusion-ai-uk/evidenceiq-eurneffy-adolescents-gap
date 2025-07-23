"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Users, Smile, CalendarDays } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function EvidenceIQHomeClient() {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
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
            <Image
              src="/evidenceiq-logo.png"
              alt="evidenceIQ"
              width={140}
              height={45}
              className="brightness-0 invert drop-shadow-[0_0_10px_rgba(56,189,248,0.3)]"
            />
          </div>
          <div className="text-sm text-sky-300/80 font-medium tracking-wide">DLBCL Treatment Content Strategy</div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-4 flex flex-col items-center justify-center">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-8">
            <Image
              src="/evidenceiq-logo.png"
              alt="evidenceIQ"
              width={360}
              height={72}
              className="mx-auto mb-6 drop-shadow-[0_0_30px_rgba(56,189,248,0.3)]"
            />
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="h-px w-20 bg-gradient-to-r from-transparent to-sky-500/50"></div>
              <div className="text-6xl font-bold text-white mb-2 animate-float">Zynlonta</div>
              <div className="h-px w-20 bg-gradient-to-l from-transparent to-sky-500/50"></div>
            </div>
          </div>

          <div className="mb-8 relative">
            <div className="relative inline-block mb-6">
              <h1 className="text-4xl font-bold text-white mb-4">
                Breakthrough ADC Therapy for Relapsed/Refractory DLBCL in the UK
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
                First-in-class CD19-directed antibody-drug conjugate delivering targeted treatment for heavily
                pretreated diffuse large B-cell lymphoma patients across the NHS.
              </p>
            </div>

            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-12 py-6 rounded-full text-lg font-medium shadow-[0_0_30px_rgba(56,189,248,0.3)] hover:shadow-[0_0_40px_rgba(56,189,248,0.5)] transition-all duration-300 border border-sky-500/30 group mb-8"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <span className="mr-2">Explore the Clinical Evidence</span>
                <ArrowRight
                  className={`h-5 w-5 transition-transform duration-300 ${isHovering ? "translate-x-1" : ""}`}
                />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-black/80 border border-sky-500/20 backdrop-blur-xl shadow-[0_0_20px_rgba(56,189,248,0.1)] hover:shadow-[0_0_30px_rgba(56,189,248,0.2)] transition-all duration-500 group">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-sky-500/30">
                <Users className="h-5 w-5 text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">48% Overall Response Rate</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Demonstrated efficacy in heavily pretreated DLBCL patients with ≥2 prior therapies in the pivotal LOTIS-2
              trial.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-black/80 border border-sky-500/20 backdrop-blur-xl shadow-[0_0_20px_rgba(56,189,248,0.1)] hover:shadow-[0_0_30px_rgba(56,189,248,0.2)] transition-all duration-500 group">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-sky-500/30">
                <Smile className="h-5 w-5 text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">25% Complete Remission</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Complete remission rate achieved in LOTIS-2 trial, with 68% of complete responders remaining disease-free
              at 2 years.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-gray-900/80 to-black/80 border border-sky-500/20 backdrop-blur-xl shadow-[0_0_20px_rgba(56,189,248,0.1)] hover:shadow-[0_0_30px_rgba(56,189,248,0.2)] transition-all duration-500 group">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-sky-500/30">
                <CalendarDays className="h-5 w-5 text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">NICE & SMC Approved</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Rapid regulatory approval within 11 days (January-February 2024) across England, Wales, and Scotland.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-sky-500/20 bg-black/80 backdrop-blur-xl py-8 mt-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">© 2024 evidenceIQ. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
