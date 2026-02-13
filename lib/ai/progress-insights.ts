import { generateText, Output } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { z } from "zod"

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

const insightSchema = z.object({
  summary: z.string(),
  trends: z.array(z.object({
    metric: z.string(),
    change: z.string(),
    percentage: z.string(),
    interpretation: z.string(),
  })),
  goalPrediction: z.object({
    estimatedCompletion: z.string(),
    onTrack: z.boolean(),
    factors: z.array(z.string()),
  }),
  recommendations: z.array(z.string()),
})

export type ProgressInsight = z.infer<typeof insightSchema>

interface MeasurementData {
  date: string
  weight: number | null
  bodyFat: number | null
  chest: number | null
  waist: number | null
  hips: number | null
  arms: number | null
  thighs: number | null
}

interface PersonalRecordData {
  date: string
  exerciseName: string
  weight: number | null
  reps: number | null
}

export async function generateProgressInsights(params: {
  measurements: MeasurementData[]
  personalRecords: PersonalRecordData[]
  goal?: string
}): Promise<ProgressInsight> {
  const { measurements, personalRecords, goal } = params

  const measurementList = measurements
    .slice(-10)
    .map(m => {
      const parts = []
      if (m.weight) parts.push(`Weight: ${m.weight}kg`)
      if (m.bodyFat) parts.push(`Body Fat: ${m.bodyFat}%`)
      if (m.waist) parts.push(`Waist: ${m.waist}cm`)
      if (m.chest) parts.push(`Chest: ${m.chest}cm`)
      return `${m.date}: ${parts.join(", ")}`
    })
    .join("\n")

  const prList = personalRecords
    .slice(-10)
    .map(pr => `${pr.date}: ${pr.exerciseName} - ${pr.weight}kg x ${pr.reps} reps`)
    .join("\n")

  const prompt = `You are a professional fitness coach AI. Analyze the member's progress data and provide insights.

MEMBER GOAL: ${goal || "General fitness improvement"}

MEASUREMENT HISTORY (last 10 entries, oldest to newest):
${measurementList || "No measurements recorded"}

PERSONAL RECORDS:
${prList || "No personal records yet"}

INSTRUCTIONS:
1. Analyze trends by comparing earliest vs latest measurements
2. Calculate percentage changes for key metrics
3. Provide meaningful interpretations (e.g., "weight down but waist down more = good fat loss")
4. Predict goal completion if there's enough data (need at least 3 measurements)
5. Give actionable recommendations
6. Always provide all fields in your response`

  const { output } = await generateText({
    model: openrouter("openrouter/aurora-alpha"),
    output: Output.object({
      schema: insightSchema,
    }),
    prompt,
  })

  return output
}
