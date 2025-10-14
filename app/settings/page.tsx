"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Download, RefreshCw, Shield, Users } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1>Settings & Access</h1>
        <p className="lead">Manage user access, data refresh, export options, and compliance settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>Control access to the evidenceIQ platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Access Mode</Label>
            <Select defaultValue="generic">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="generic">Generic Login (Default)</SelectItem>
                <SelectItem value="named">Named User Accounts</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Generic login allows shared access. Named accounts enable individual user tracking.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-user">Add New User</Label>
            <div className="flex gap-2">
              <Input id="add-user" placeholder="user@example.com" />
              <Button>Add User</Button>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h4 className="mb-2 text-sm font-medium">Current Users</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>generic@evidenceiq.com (Active)</span>
                <Button variant="ghost" size="sm">Remove</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Data Refresh Settings
          </CardTitle>
          <CardDescription>Configure automatic data updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatic Weekly Refresh</Label>
              <p className="text-xs text-muted-foreground">Data updates every Monday at 6:00 AM GMT</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label>Refresh Frequency</Label>
            <Select defaultValue="weekly">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly (Default)</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Last Data Refresh</p>
                <p className="text-xs text-muted-foreground">Monday, 27 January 2025 at 6:00 AM GMT</p>
                <p className="text-xs text-muted-foreground mt-1">Next scheduled: Monday, 3 February 2025 at 6:00 AM GMT</p>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Options
          </CardTitle>
          <CardDescription>Configure default export formats and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default Export Format</Label>
            <Select defaultValue="pdf">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="ppt">PowerPoint (PPT)</SelectItem>
                <SelectItem value="csv">CSV (Data Only)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Include Anonymized Quotes</Label>
              <p className="text-xs text-muted-foreground">Add patient/HCP quotes to exports</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Include Visualizations</Label>
              <p className="text-xs text-muted-foreground">Embed charts and graphs in exports</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance & Pharmacovigilance
          </CardTitle>
          <CardDescription>GDPR and PV flagging configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
            <h4 className="text-sm font-medium">Data Collection</h4>
            <p className="text-xs text-muted-foreground">
              All data is collected from open social media, forums, public HCP discussions, patient communities,
              congress streams, and patient organization sites (Lymphoma Action UK, Blood Cancer UK). No direct outreach to patients or HCPs is conducted.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
            <h4 className="text-sm font-medium">Data Privacy</h4>
            <p className="text-xs text-muted-foreground">
              All data is aggregated and anonymized. No personally identifiable information is stored or displayed.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pv-contact">PV Contact Email</Label>
            <Input id="pv-contact" placeholder="pv-contact@company.com" defaultValue="pv@sobi.com" />
            <p className="text-xs text-muted-foreground">Flagged adverse events will be routed to this contact per SOP</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatic AE Flagging</Label>
              <p className="text-xs text-muted-foreground">Auto-flag photosensitivity, CRS, ICANS, infections</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Button variant="outline" className="w-full bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Download Compliance Report
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Download, RefreshCw, Shield, Users } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Header */}
            <div>
          <h1>Settings & Access</h1>
          <p className="lead">
                Manage user access, data refresh, export options, and compliance settings
              </p>
            </div>

            {/* User Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>Control access to the evidenceIQ platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Access Mode</Label>
                  <Select defaultValue="generic">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="generic">Generic Login (Default)</SelectItem>
                      <SelectItem value="named">Named User Accounts</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Generic login allows shared access. Named accounts enable individual user tracking.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-user">Add New User</Label>
                  <div className="flex gap-2">
                    <Input id="add-user" placeholder="user@example.com" />
                    <Button>Add User</Button>
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <h4 className="mb-2 text-sm font-medium">Current Users</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>generic@evidenceiq.com (Active)</span>
                      <Button variant="ghost" size="sm">
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Refresh */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Data Refresh Settings
                </CardTitle>
                <CardDescription>Configure automatic data updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatic Weekly Refresh</Label>
                    <p className="text-xs text-muted-foreground">Data updates every Monday at 6:00 AM GMT</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Refresh Frequency</Label>
                  <Select defaultValue="weekly">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly (Default)</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Last Data Refresh</p>
                      <p className="text-xs text-muted-foreground">Monday, 27 January 2025 at 6:00 AM GMT</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Next scheduled: Monday, 3 February 2025 at 6:00 AM GMT
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Options
                </CardTitle>
                <CardDescription>Configure default export formats and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Export Format</Label>
                  <Select defaultValue="pdf">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="ppt">PowerPoint (PPT)</SelectItem>
                      <SelectItem value="csv">CSV (Data Only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Anonymized Quotes</Label>
                    <p className="text-xs text-muted-foreground">Add patient/HCP quotes to exports</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Visualizations</Label>
                    <p className="text-xs text-muted-foreground">Embed charts and graphs in exports</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Compliance & PV */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance & Pharmacovigilance
                </CardTitle>
                <CardDescription>GDPR and PV flagging configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
                  <h4 className="text-sm font-medium">Data Collection</h4>
                  <p className="text-xs text-muted-foreground">
                    All data is collected from open social media, forums, public HCP discussions, patient communities,
                    congress streams, and patient organization sites (Lymphoma Action UK, Blood Cancer UK). No direct
                    outreach to patients or HCPs is conducted.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-2">
                  <h4 className="text-sm font-medium">Data Privacy</h4>
                  <p className="text-xs text-muted-foreground">
                    All data is aggregated and anonymized. No personally identifiable information is stored or
                    displayed.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pv-contact">PV Contact Email</Label>
                  <Input id="pv-contact" placeholder="pv-contact@company.com" defaultValue="pv@sobi.com" />
                  <p className="text-xs text-muted-foreground">
                    Flagged adverse events will be routed to this contact per SOP
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatic AE Flagging</Label>
                    <p className="text-xs text-muted-foreground">Auto-flag photosensitivity, CRS, ICANS, infections</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button variant="outline" className="w-full bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Download Compliance Report
                </Button>
              </CardContent>
            </Card>
          </div>
      </div>
    </div>
  )
}
