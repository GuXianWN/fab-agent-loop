import { Injectable } from '@nestjs/common';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { Agent } from '@mastra/core/agent';
import { ChatMemoryService } from '../database/chat-memory.service';
import { modelConfig } from './model.config';
import { getCurrentTimeTool } from './tools/get-current-time.tool';

@Injectable()
export class RecoveryAgent {
  readonly instance: Agent;

  constructor(memory: ChatMemoryService) {
    const deepSeek = createDeepSeek({
      apiKey: modelConfig.apiKey,
      baseURL: modelConfig.baseURL,
    });

    this.instance = new Agent({
      id: modelConfig.agent.id,
      name: modelConfig.agent.name,
      instructions: modelConfig.agent.instructions,
      model: deepSeek(modelConfig.model),
      memory: memory.memory,
      tools: { getCurrentTime: getCurrentTimeTool },
    });
  }
}
