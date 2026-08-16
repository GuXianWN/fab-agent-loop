export interface ChatTokenUsage {
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  totalTokens: number;
}

export interface ChatMessageMetadata {
  contextWindow: number;
  usage: ChatTokenUsage;
}

export interface ChatSummary {
  id: string;
  title: string | null;
  createdAt: string;
}

export interface Chat<TMessage = unknown> extends ChatSummary {
  messages: TMessage[];
}

export interface ChatVote {
  chatId: string;
  messageId: string;
  isUpvoted: boolean;
}

export interface CreateChatInput {
  input?: string;
}

export interface UpdateChatInput {
  title?: string | null;
}

export interface SetChatVoteInput {
  messageId: string;
  isUpvoted?: boolean;
}

export interface ChatStreamRequest<TMessage = unknown> {
  chatId: string;
  messages: TMessage[];
}
