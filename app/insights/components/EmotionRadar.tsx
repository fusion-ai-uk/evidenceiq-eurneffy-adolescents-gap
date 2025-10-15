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

export default function EmotionRadar() {
  const [data, setData] = useState<EmotionRadarType | null>(null);

  useEffect(() => {
    fetch("/nlp_artifacts/emotion_radar.json").then((r) => r.json()).then(setData);
  }, []);

  const chartData = useMemo(() => {
    if (!data) return [] as any[];
    return data.emotions.map((emo: EmotionKey) => {
      const row: any = { emotion: emo };
      data.brands.forEach((b) => (row[b.brand] = Number(b.scores[emo]?.toFixed(3)) || 0));
      return row;
    });
  }, [data]);

  if (!data) return <div className="text-sm text-muted-foreground">Loading emotion radar…</div>;

  return (
    <div className="w-full h-[420px] border rounded-xl p-3 bg-card/60">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="emotion" />
          <PolarRadiusAxis angle={30} domain={[0, 1]} tickCount={6} />
          {data.brands.map((b) => (
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
      <p className="mt-2 text-xs text-muted-foreground">
        Scale: {data.meta?.scale ?? "0–1"} — {data.meta?.note}
      </p>
    </div>
  );
}


