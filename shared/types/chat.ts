export type ChatVisibility = 'private' | 'public';

export interface ChatSummary {
  id: string;
  title: string | null;
  createdAt: string;
}

export interface Chat<TMessage = unknown> extends ChatSummary {
  visibility: ChatVisibility;
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
  visibility?: ChatVisibility;
}

export interface SetChatVoteInput {
  messageId: string;
  isUpvoted?: boolean;
}

export interface ChatStreamRequest<TMessage = unknown> {
  chatId: string;
  messages: TMessage[];
}
