"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

const ashPreData = [
  { theme: "Efficacy", mentions: 145 },
  { theme: "Safety", mentions: 98 },
  { theme: "Durability", mentions: 67 },
  { theme: "QoL", mentions: 54 },
]

const ashPostData = [
  { theme: "Efficacy", mentions: 312 },
  { theme: "Safety", mentions: 187 },
  { theme: "Durability", mentions: 245 },
  { theme: "QoL", mentions: 89 },
]

const topThemes = [
  { theme: "Bispecific Durability Data", sentiment: "Positive", change: "+156%" },
  { theme: "CAR-T Long-term Outcomes", sentiment: "Mixed", change: "+89%" },
  { theme: "Zynlonta Real-world Evidence", sentiment: "Positive", change: "+67%" },
  { theme: "CRS Management Strategies", sentiment: "Neutral", change: "+92%" },
]

export function CongressTracker() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">ASH 2025 Congress Impact</CardTitle>
        <p className="text-sm text-muted-foreground">Pre vs post‑congress discourse analysis</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="comparison" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comparison">Pre/Post Comparison</TabsTrigger>
            <TabsTrigger value="themes">Top Themes</TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Pre‑Congress (Dec 4–5, 2025)</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={ashPreData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="theme" stroke="#666" style={{ fontSize: "11px" }} />
                    <YAxis stroke="#666" style={{ fontSize: "11px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="mentions" fill="#6b7280" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Core + Post (Dec 6–11, 2025)</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={ashPostData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="theme" stroke="#666" style={{ fontSize: "11px" }} />
                    <YAxis stroke="#666" style={{ fontSize: "11px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #333",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="mentions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="themes" className="mt-4">
            <div className="space-y-3">
              {topThemes.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{item.theme}</span>
                      <Badge
                        variant={
                          item.sentiment === "Positive"
                            ? "default"
                            : item.sentiment === "Negative"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {item.sentiment}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-chart-2">
                    {item.change}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
