import { EntityNetworkViz } from "@/components/network/entity-network-viz"
import { EntityList } from "@/components/network/entity-list"
import { MisspellingsTracker } from "@/components/network/misspellings-tracker"
import { TrialReferences } from "@/components/network/trial-references"

export default function NetworkPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Entity Network</h1>
        <p className="lead">
          Explore connections between drugs, institutions, trials, payers, and events
        </p>
      </div>

      {/* Network Visualization and Entity List */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EntityNetworkViz />
        </div>
        <div>
          <EntityList />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MisspellingsTracker />
        <TrialReferences />
      </div>
    </div>
  )
}
