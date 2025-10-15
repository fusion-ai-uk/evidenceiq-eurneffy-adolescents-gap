export type EmotionKey = "hope" | "trust" | "fear" | "frustration";

export type EmotionRadar = {
  emotions: EmotionKey[];
  brands: { brand: "Zynlonta" | "Epcoritamab" | "Glofitamab" | "CAR-T"; scores: Record<EmotionKey, number> }[];
  meta?: { scale?: string; note?: string };
};

export type BrandNarrative = {
  brand: "Zynlonta" | "Epcoritamab" | "Glofitamab" | "CAR-T";
  keyThemes: string[];
  narrativeSummary: string;
  sentiment: string;
  emotionalTone: string[];
};

