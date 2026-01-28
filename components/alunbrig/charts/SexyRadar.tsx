"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react"
import { useTheme } from "next-themes"

// Ensure we resolve the actual component across module formats (CJS/ESM).
const ReactApexChart = dynamic(() => import("react-apexcharts").then((m: any) => m?.default ?? m), { ssr: false })

export function SexyRadar({
  title,
  categories,
  values,
  height = 210,
  seriesName = "Signal mix",
}: {
  title?: string
  categories: string[]
  /** 0–100 values */
  values: number[]
  height?: number
  seriesName?: string
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const { options, series } = useMemo(() => {
    const vals = values.map((v) => Math.max(0, Math.min(100, Number(v || 0))))
    const maxVal = vals.reduce((m, v) => (v > m ? v : m), 0)
    // If everything is low-signal (e.g. single digits), keep the plot readable by shrinking the axis max.
    // We keep data values in true % units; only the axis range changes.
    const axisMax = maxVal > 25 ? 100 : Math.min(100, Math.max(10, Math.ceil(maxVal / 5) * 5))
    const primary = isDark ? "#38bdf8" : "#0284c7" // sky-400 / sky-600
    const glow = isDark ? "rgba(56,189,248,0.35)" : "rgba(2,132,199,0.22)"
    const grid = isDark ? "rgba(148,163,184,0.18)" : "rgba(15,23,42,0.12)"
    const label = isDark ? "rgba(226,232,240,0.78)" : "rgba(15,23,42,0.72)"

    return {
      series: [{ name: seriesName, data: vals }],
      options: {
        theme: { mode: isDark ? "dark" : "light" },
        chart: {
          type: "radar",
          background: "transparent",
          toolbar: { show: false },
          animations: { enabled: true, speed: 650 },
          dropShadow: {
            enabled: true,
            blur: 10,
            left: 0,
            top: 2,
            opacity: 0.22,
          },
          fontFamily: "Inter, ui-sans-serif, system-ui",
        },
        stroke: { width: 2.5, curve: "smooth", colors: [primary] },
        fill: {
          type: "gradient",
          gradient: {
            shade: isDark ? "dark" : "light",
            type: "vertical",
            shadeIntensity: 0.4,
            opacityFrom: 0.32,
            opacityTo: 0.06,
            stops: [0, 65, 100],
            colorStops: [
              { offset: 0, color: glow, opacity: 0.32 },
              { offset: 65, color: glow, opacity: 0.14 },
              { offset: 100, color: glow, opacity: 0.06 },
            ],
          },
        },
        markers: {
          size: 3.5,
          strokeWidth: 0,
          colors: [primary],
          hover: { size: 5.5 },
        },
        grid: { show: false },
        xaxis: {
          categories,
          labels: {
            style: { colors: categories.map(() => label), fontSize: "11px", fontWeight: 600 },
          },
        },
        yaxis: { show: false, min: 0, max: axisMax, tickAmount: 4 },
        plotOptions: {
          radar: {
            size: 98,
            polygons: {
              strokeColor: grid,
              connectorColors: grid,
              fill: { colors: ["transparent"] },
            },
          },
        },
        tooltip: {
          theme: "dark",
          y: { formatter: (v: number) => `${Math.round(Number(v || 0))}%` },
        },
        dataLabels: { enabled: false },
        colors: [primary],
      },
    }
  }, [values, categories, isDark, seriesName])

  return (
    <div className="rounded-xl border border-border/60 bg-gradient-to-b from-background/70 via-background/50 to-background/30 shadow-[0_10px_40px_-18px_rgba(0,0,0,0.65)] backdrop-blur">
      {title ? <div className="px-4 pt-3 text-xs font-medium text-muted-foreground">{title}</div> : null}
      <div className="px-2 pb-2">
        <ReactApexChart type="radar" height={height} options={options as any} series={series as any} />
      </div>
    </div>
  )
}

