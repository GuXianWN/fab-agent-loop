import { Injectable } from '@nestjs/common';

@Injectable()
export class AiConfig {
  readonly apiKey = process.env.OPENAI_API_KEY!;
  readonly baseURL = process.env.OPENAI_BASE_URL!;
  readonly model = process.env.OPENAI_MODEL!;
}
