import { generateObject } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { z } from "zod"

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

const exerciseSchema = z.object({
  name: z.string(),
  category: z.string(),
  muscleGroup: z.string(),
  sets: z.number(),
  reps: z.string(),
  restSeconds: z.number(),
  notes: z.string().optional(),
})

const workoutPlanSchema = z.object({
  name: z.string(),
  description: z.string(),
  exercises: z.array(exerciseSchema),
})

export type GeneratedExercise = z.infer<typeof exerciseSchema>
export type GeneratedWorkoutPlan = z.infer<typeof workoutPlanSchema>

const EXERCISE_CATEGORIES = [
  "strength",
  "cardio",
  "flexibility",
  "hiit",
  "balance",
  "plyometric"
]

const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "legs",
  "core",
  "full body",
  "glutes",
  "calves"
]

export async function generateWorkoutPlan(params: {
  goals: string
  fitnessLevel: string
  injuries: string
  equipment: string
  experienceLevel: string
  availableExercises: { name: string; category: string; muscleGroup: string }[]
}): Promise<GeneratedWorkoutPlan> {
  const { goals, fitnessLevel, injuries, equipment, experienceLevel, availableExercises } = params

  const exerciseList = availableExercises
    .map(e => `- ${e.name} (${e.category}, ${e.muscleGroup})`)
    .join("\n")

  const prompt = `You are a professional fitness trainer AI. Generate a personalized workout plan based on the member's profile.

MEMBER PROFILE:
- Goals: ${goals}
- Fitness Level: ${fitnessLevel}
- Experience Level: ${experienceLevel}
- Injuries/Limitations: ${injuries || "None"}
- Available Equipment: ${equipment || "Full gym"}

AVAILABLE EXERCISES IN THE SYSTEM:
${exerciseList}

INSTRUCTIONS:
1. Create a workout plan with 6-10 exercises that targets the member's goals
2. Use ONLY exercises from the available list above
3. Adjust sets/reps/rest based on fitness level:
   - Beginner: 2-3 sets, 10-15 reps, 60-90 sec rest
   - Intermediate: 3-4 sets, 8-12 reps, 45-60 sec rest  
   - Advanced: 4-5 sets, 6-10 reps, 30-45 sec rest
4. If the member has injuries, avoid exercises that could aggravate them
5. Include appropriate warm-up and cool-down exercises
6. For each exercise, provide specific notes about form or technique
7. Structure the workout logically (e.g., big muscles first, compound movements before isolation)
8. Generate a creative, descriptive plan name

Respond with a JSON object containing:
{
  "name": "Creative workout plan name",
  "description": "2-3 sentence description explaining the plan's purpose and who it's for",
  "exercises": [
    {
      "name": "Exercise name (must match exactly from available list)",
      "category": "category from the list",
      "muscleGroup": "muscle group from the list",
      "sets": number,
      "reps": "string like '10-12' or '15'",
      "restSeconds": number,
      "notes": "form tips or technique notes"
    }
  ]
}`

  const result = await generateObject({
    model: openrouter("openrouter/aurora-alpha"),
    schema: workoutPlanSchema,
    prompt,
  })

  return result.object
}
