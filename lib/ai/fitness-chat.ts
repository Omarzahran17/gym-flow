import { generateText, Output } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { z } from "zod"

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

const chatResponseSchema = z.object({
  response: z.string(),
  suggestions: z.array(z.string()).optional(),
})

export type ChatResponse = z.infer<typeof chatResponseSchema>

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface MemberData {
  name: string
  fitnessLevel?: string
  goals?: string
  injuries?: string
}

export async function generateChatResponse(params: {
  messages: ChatMessage[]
  memberData?: MemberData
}): Promise<ChatResponse> {
  const { messages, memberData } = params

  const memberInfo = memberData ? `
MEMBER PROFILE:
- Name: ${memberData.name}
- Fitness Level: ${memberData.fitnessLevel || "Not specified"}
- Goals: ${memberData.goals || "Not specified"}
- Injuries/Limitations: ${memberData.injuries || "None"}
` : ""

  const conversationHistory = messages
    .map(m => `${m.role === "user" ? "User" : "AI Coach"}: ${m.content}`)
    .join("\n\n")

  const systemPrompt = `You are FitCoach AI, a professional fitness coach available 24/7 to help gym members with their fitness journey.

YOUR ROLE:
- Provide accurate, safe fitness advice
- Answer questions about workouts, nutrition, and exercise form
- Motivate and encourage members
- Always prioritize safety and proper form

GUIDELINES:
1. Keep responses concise but informative (2-4 sentences for simple questions, longer for complex topics)
2. Ask clarifying questions when needed
3. Provide specific, actionable advice
4. If someone asks about an injury or pain, always recommend consulting a professional
5. Be encouraging and supportive
6. Suggest related topics when helpful

${memberInfo}

CONVERSATION HISTORY:
${conversationHistory}

Respond with a JSON object containing:
{
  "response": "Your helpful response to the user",
  "suggestions": ["Optional follow-up question 1", "Optional follow-up question 2"]
}`

  const { output } = await generateText({
    model: openrouter("openrouter/aurora-alpha"),
    output: Output.object({
      schema: chatResponseSchema,
    }),
    prompt: systemPrompt,
  })

  return output
}
