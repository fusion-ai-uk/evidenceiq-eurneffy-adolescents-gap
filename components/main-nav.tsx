"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, TrendingUp, Users, Calendar, MessageSquare, MessageCircle, Target, Shuffle } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navigation = [
  { name: "Executive Summary", href: "/dashboard", icon: LayoutDashboard },
  { name: "General Themes", href: "/themes", icon: MessageCircle },
  { name: "Trends Explorer", href: "/trends", icon: TrendingUp },
  { name: "Audience Insights", href: "/audience", icon: Users },
  { name: "Competitor Lens", href: "/competitors", icon: Target },
  { name: "Sequencing & Pathways", href: "/sequencing", icon: Shuffle },
  { name: "Events Tracker", href: "/events", icon: Calendar, comingSoon: true },
  { name: "Content Recommendations", href: "/messaging", icon: MessageSquare, comingSoon: true },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/60">
      <SidebarHeader className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-primary/15 ring-1 ring-primary/20" />
          <span className="text-sm font-semibold tracking-tight">evidenceIQ</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigate</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.name}>
                    {item.comingSoon ? (
                      <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground/70 bg-muted/10 ring-1 ring-border/50 cursor-not-allowed">
                        <Icon className="opacity-60" />
                        <span>{item.name}</span>
                        <span className="ml-auto text-[10px] uppercase tracking-wide rounded-sm px-1.5 py-0.5 bg-muted/20 text-muted-foreground/60">Coming soon</span>
                      </div>
                    ) : (
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
