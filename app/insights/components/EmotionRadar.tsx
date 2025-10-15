"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Tooltip, ResponsiveContainer } from "recharts";
import type { EmotionRadar as EmotionRadarType, EmotionKey } from "@/types/insights";

const BRAND_COLORS: Record<string, string> = {
  Zynlonta: "#2563eb",
  Epcoritamab: "#22c55e",
  Glofitamab: "#f59e0b",
  "CAR-T": "#ef4444",
};

type Props = { selected?: string[]; onChangeSelected?: (brands: string[]) => void; frameless?: boolean; className?: string }

export default function EmotionRadar({ selected: controlled, onChangeSelected, frameless = false, className = "" }: Props) {
  const [data, setData] = useState<EmotionRadarType | null>(null);
  const [uncontrolled, setUncontrolled] = useState<string[]>([])
  const selected = controlled ?? uncontrolled

  useEffect(() => {
    fetch("/nlp_artifacts/emotion_radar.json").then((r) => r.json()).then(setData);
  }, []);

  const chartData = useMemo(() => {
    if (!data) return [] as any[];
    return data.emotions.map((emo: EmotionKey) => {
      const row: any = { emotion: emo };
      const brands = selected.length ? data.brands.filter(b => selected.includes(b.brand)) : data.brands
      brands.forEach((b) => (row[b.brand] = Number(b.scores[emo]?.toFixed(3)) || 0));
      return row;
    });
  }, [data]);

  const brandsToShow = useMemo(() => (data ? (selected.length ? data.brands.filter(b => selected.includes(b.brand)) : data.brands) : []), [data, selected])

  if (!data) return <div className="text-sm text-muted-foreground">Loading emotion radar…</div>;

  return (
    <div className={(frameless ? "w-full h-[480px] p-3 " : "w-full h-[480px] border rounded-xl p-3 bg-card/60 ") + className}>
      {/* Multi-select brand filter */}
      {data && (
        <div className="mb-2 flex flex-wrap gap-2 text-[12px]">
          {data.brands.map(b => {
            const active = selected.includes(b.brand)
            return (
              <button
                key={b.brand}
                className={`px-2 py-1 rounded-md border ${active ? 'bg-primary/20 text-primary' : 'bg-background/40 hover:bg-accent/40'}`}
                onClick={() => {
                  const next = selected.includes(b.brand)
                    ? selected.filter(x => x !== b.brand)
                    : [...selected, b.brand]
                  if (onChangeSelected) onChangeSelected(next)
                  else setUncontrolled(next)
                }}
              >
                {b.brand}
              </button>
            )
          })}
          {selected.length > 0 && (
            <button className="ml-2 px-2 py-1 rounded-md border bg-background/40 hover:bg-accent/40" onClick={() => {
              if (onChangeSelected) onChangeSelected([])
              else setUncontrolled([])
            }}>All</button>
          )}
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="emotion" />
          <PolarRadiusAxis angle={30} domain={[0, 1]} tickCount={6} />
          {brandsToShow.map((b) => (
            <Radar
              key={b.brand}
              name={b.brand}
              dataKey={b.brand}
              stroke={BRAND_COLORS[b.brand]}
              fill={BRAND_COLORS[b.brand]}
              fillOpacity={0.25}
            />
          ))}
          <Legend />
          <Tooltip formatter={(v: any) => Number(v).toFixed(2)} />
        </RadarChart>
      </ResponsiveContainer>
      <p className="mt-2 mb-6 text-xs text-muted-foreground">
        Scale: {data.meta?.scale ?? "0–1"} — {data.meta?.note}
      </p>
    </div>
  );
}


