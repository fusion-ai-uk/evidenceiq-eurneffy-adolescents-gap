import EmotionRadar from "./components/EmotionRadar";

export default function InsightsPage() {
  return (
    <main className="p-6 space-y-10">
      <h1 className="text-2xl font-bold">Zynlonta Competitive NLP Insights</h1>
      <section>
        <h2 className="text-xl font-semibold mb-3">Emotional Tone Comparison</h2>
        <EmotionRadar />
      </section>
    </main>
  )
}


