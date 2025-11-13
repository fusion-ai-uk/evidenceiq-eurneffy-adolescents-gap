"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import type { Recommendation } from "@/data/messaging-recommendations"

export function RecommendationCarousel({ title, subtitle, items }: { title: string; subtitle?: string; items: Recommendation[] }) {
  const slides = useMemo(() => items, [items])
  const isSingle = slides.length <= 1
  return (
    <div className="relative">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="relative">
        <Carousel opts={{ align: isSingle ? "center" : "start", loop: true, containScroll: 'trimSnaps' }} className="[--carousel-nav-offset:theme(spacing.4)]">
          <CarouselContent className={isSingle ? "justify-center" : undefined}>
          {slides.map((rec) => {
            const Icon = rec.icon as any
            return (
              <CarouselItem key={rec.id} className={isSingle ? "basis-[96%] md:basis-[76%] xl:basis-[52%]" : "md:basis-1/2 xl:basis-1/3"}>
                <Card className={`relative overflow-hidden bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-700/30 dark:border-cyan-400/30 p-0 shadow-[0_0_0_1px_rgba(6,182,212,0.12),0_10px_28px_rgba(6,182,212,0.06)] dark:shadow-[0_0_0_1px_rgba(6,182,212,0.2),0_12px_36px_rgba(6,182,212,0.08)] hover:shadow-[0_0_0_1px_rgba(6,182,212,0.2),0_14px_44px_rgba(6,182,212,0.1)] dark:hover:shadow-[0_0_0_1px_rgba(6,182,212,0.3),0_18px_60px_rgba(6,182,212,0.12)] transition-all duration-300 will-change-transform hover:-translate-y-0.5 hover:scale-[1.01] min-h-[260px]`}> 
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-2">
                      {Icon && (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/60 ring-1 ring-cyan-600/30 dark:ring-cyan-400/40">
                          <Icon className="h-5 w-5" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-semibold tracking-tight">{rec.title}</div>
                        <div className="mt-1 text-[12px] text-muted-foreground">{rec.rationale}</div>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div>
                        <div className="text-[11px] font-medium text-muted-foreground mb-1">Do next</div>
                        <ul className="list-disc pl-4 space-y-1">
                          {rec.actions.map((a, i) => (
                            <li key={i} className="text-[13px] leading-5">{a}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-muted-foreground mb-1">Use this language</div>
                        <div className="flex flex-wrap gap-1.5">
                          {rec.language.map((l, i) => (
                            <Badge key={i} variant="outline" className="text-[11px] border-cyan-700/30 dark:border-cyan-400/40 text-cyan-800 dark:text-cyan-100">
                              {l}
                            </Badge>
                          ))}
                        </div>
                        {!!rec.kpis?.length && (
                          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-cyan-700 dark:text-cyan-200/90">
                            {rec.kpis.map((k, i) => (
                              <span key={i} className="inline-flex items-center gap-1 rounded-md border border-cyan-700/30 dark:border-cyan-400/30 px-2 py-0.5 bg-cyan-500/10 dark:bg-cyan-500/5">{k}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            )
          })}
          </CarouselContent>
          <CarouselPrevious className="-left-10 border-cyan-700/30 dark:border-cyan-400/40 text-cyan-700 dark:text-cyan-300 bg-background/60 hover:bg-cyan-500/10" />
          <CarouselNext className="-right-10 border-cyan-700/30 dark:border-cyan-400/40 text-cyan-700 dark:text-cyan-300 bg-background/60 hover:bg-cyan-500/10" />
        </Carousel>

        {/* Edge fade/blur for a dynamic carousel feel (scoped to carousel only) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background via-background/80 to-transparent backdrop-blur-[2px]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background via-background/80 to-transparent backdrop-blur-[2px]" />
      </div>
    </div>
  )
}


