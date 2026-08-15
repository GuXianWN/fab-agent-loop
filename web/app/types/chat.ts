import type { UIMessage } from 'ai';

export type ChatVisibility = 'private' | 'public';

export interface ChatSummary {
  id: string;
  title: string | null;
  createdAt: string;
}

export interface Chat extends ChatSummary {
  visibility: ChatVisibility;
  messages: UIMessage[];
}

export interface ChatVote {
  chatId: string;
  messageId: string;
  isUpvoted: boolean;
}

export interface ChatNavigationItem extends ChatSummary {
  label: string;
  to: string;
  icon: string;
}
