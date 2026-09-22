import { Injectable } from '@nestjs/common';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { Agent } from '@mastra/core/agent';
import type { MessageListInput } from '@mastra/core/agent/message-list';
import type { UIMessage } from 'ai';
import { AiConfig, CHAT_TITLE_PROMPT } from './ai.config';

@Injectable()
export class RecoveryAgent {
  private readonly agent: Agent;

  constructor(config: AiConfig) {
    const deepSeek = createDeepSeek({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });

    this.agent = new Agent({
      id: 'recovery-assistant',
      name: 'Recovery Assistant',
      instructions: 'Answer the user clearly and accurately.',
      model: deepSeek(config.model),
    });
  }

  stream(messages: UIMessage[]) {
    return this.agent.stream(this.toMastraMessages(messages), {
      modelSettings: { reasoning: 'high' },
    });
  }

  async generateTitle(message: UIMessage): Promise<string | null> {
    const { text } = await this.agent.generate(this.toMastraMessages([message]), {
      instructions: CHAT_TITLE_PROMPT,
      modelSettings: {
        maxOutputTokens: 80,
        reasoning: 'none',
      },
    });

    return text.trim().slice(0, 30) || null;
  }

  private toMastraMessages(messages: UIMessage[]): MessageListInput {
    // Mastra 1.67 bundles its own AI SDK v7 types; the wire shapes are identical.
    return messages as unknown as MessageListInput;
  }
}
