"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb } from "lucide-react"
import { motion } from "framer-motion"

interface Spotlight {
  title: string
  description: string
  icon?: React.ReactNode
}

interface ContentSpotlightGridProps {
  spotlights: Spotlight[]
}

export function ContentSpotlightGrid({ spotlights }: ContentSpotlightGridProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      {spotlights.map((spotlight, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="bg-gradient-to-br from-pink-500/10 to-purple-600/10 border border-pink-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(236,72,153,0.1)] hover:shadow-[0_0_40px_rgba(236,72,153,0.2)] transition-all duration-500 h-full">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-600/20 border border-pink-500/30">
                  <Lightbulb className="h-5 w-5 text-pink-400" />
                </div>
                <Badge variant="outline" className="text-pink-400 border-pink-400 bg-pink-500/10 font-medium">
                  CONTENT IDEA
                </Badge>
              </div>
              <CardTitle className="text-white text-lg leading-tight">{spotlight.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm leading-relaxed">{spotlight.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
