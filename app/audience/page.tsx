import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HCPInsights } from "@/components/audience/hcp-insights"
import { PatientInsights } from "@/components/audience/patient-insights"
import { CaregiverInsights } from "@/components/audience/caregiver-insights"
import { PayerCostDiscussions } from "@/components/payer-cost-discussions"
import { Users, Activity, Heart, Banknote } from "lucide-react"
import { ContentSOV } from "@/components/audience/content-sov"
import { TopicLeaderboard } from "@/components/audience/topic-leaderboard"

export default function AudiencePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Audience Insights</h1>
        <p className="lead">
          Segmentation by role and patient journey stage across HCPs, patients, and caregivers
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3 items-start">
        <div className="xl:col-span-1"><ContentSOV /></div>
        <div className="xl:col-span-2"><TopicLeaderboard /></div>
      </div>

      {/* Audience Tabs */}
      <Tabs defaultValue="hcp" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hcp">
            <Users className="mr-2 h-4 w-4" />
            HCP Insights
          </TabsTrigger>
          <TabsTrigger value="patient">
            <Activity className="mr-2 h-4 w-4" />
            Patient Insights
          </TabsTrigger>
          <TabsTrigger value="caregiver">
            <Heart className="mr-2 h-4 w-4" />
            Caregiver Insights
          </TabsTrigger>
          <TabsTrigger value="payer">
            <Banknote className="mr-2 h-4 w-4" />
            Payer & Cost
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hcp" className="mt-6">
          <HCPInsights />
        </TabsContent>

        <TabsContent value="patient" className="mt-6">
          <PatientInsights />
        </TabsContent>

        <TabsContent value="caregiver" className="mt-6">
          <CaregiverInsights />
        </TabsContent>
        <TabsContent value="payer" className="mt-6">
          <PayerCostDiscussions />
        </TabsContent>
      </Tabs>

    </div>
  )
}
