export const modelConfig = {
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: process.env.OPENAI_BASE_URL!,
  model: process.env.OPENAI_MODEL!,
  contextWindow: 1_000_000,
  agent: {
    id: 'recovery-assistant',
    name: 'Recovery Assistant',
    instructions: 'Answer the user clearly and accurately. Use the get-current-time tool when the answer depends on the current date or time.',
    maxSteps: 5,
    reasoning: 'high',
  },
  title: {
    instructions: 'Generate a concise title under 30 characters for the user message. Return plain text without quotes, punctuation, or markdown.',
    maxOutputTokens: 80,
    maxLength: 30,
    reasoning: 'none',
  },
} as const;
