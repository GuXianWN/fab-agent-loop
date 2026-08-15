import type { UIMessage } from 'ai';
import type { Chat as SharedChat, ChatSummary } from '#shared';

export type { ChatSummary, ChatVisibility, ChatVote } from '#shared';

export type Chat = SharedChat<UIMessage>;

export interface ChatNavigationItem extends ChatSummary {
  label: string;
  to: string;
  icon: string;
}
