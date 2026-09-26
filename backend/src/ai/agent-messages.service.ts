import { Injectable } from '@nestjs/common';
import type { MessageListInput } from '@mastra/core/agent/message-list';
import type { UIMessage } from 'ai';
import { modelConfig } from './model.config';
import { RecoveryAgent } from './recovery.agent';

@Injectable()
export class AgentMessagesService {
  constructor(private readonly agent: RecoveryAgent) {}

  stream(chatId: string, resourceId: string, message: UIMessage, abortSignal: AbortSignal) {
    return this.agent.instance.stream(this.toMastraMessages(message), {
      abortSignal,
      memory: { thread: chatId, resource: resourceId },
      maxSteps: modelConfig.agent.maxSteps,
      savePerStep: true,
      modelSettings: { reasoning: modelConfig.agent.reasoning },
    });
  }

  async generateTitle(message: UIMessage): Promise<string | null> {
    const { text } = await this.agent.instance.generate(this.toMastraMessages(message), {
      instructions: modelConfig.title.instructions,
      toolChoice: 'none',
      modelSettings: {
        maxOutputTokens: modelConfig.title.maxOutputTokens,
        reasoning: modelConfig.title.reasoning,
      },
    });

    return text.trim().slice(0, modelConfig.title.maxLength) || null;
  }

  private toMastraMessages(message: UIMessage): MessageListInput {
    // Mastra 1.67 bundles its own AI SDK v7 types; the wire shapes are identical.
    return [message] as unknown as MessageListInput;
  }
}
