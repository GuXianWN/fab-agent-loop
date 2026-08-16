import { Injectable } from '@nestjs/common';

export const CHAT_TITLE_PROMPT = 'Generate a concise title under 30 characters for the user message. Return plain text without quotes, punctuation, or markdown.';

@Injectable()
export class AiConfig {
  readonly apiKey = process.env.OPENAI_API_KEY!;
  readonly baseURL = process.env.OPENAI_BASE_URL!;
  readonly model = process.env.OPENAI_MODEL!;
  readonly contextWindow = 1_000_000;
}
