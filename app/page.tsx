import type { Metadata } from "next/types"
import EvidenceIQHomeClient from "./evidence-iq-home"

export const metadata: Metadata = {
  title: "evidenceIQ | Zynlonta",
  description: "First-in-class CD19-directed antibody-drug conjugate for relapsed/refractory DLBCL treatment.",
  generator: "v0.dev",
}

export default function EvidenceIQHome() {
  return <EvidenceIQHomeClient />
}
