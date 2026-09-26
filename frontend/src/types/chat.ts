import type { UIMessage } from 'ai';
import type { Chat as SharedChat, ChatMessageMetadata, ChatSummary } from '@recovery-assistant/shared';

export type { ChatContext, ChatMessageMetadata, ChatSummary, ChatTokenUsage, ChatVote } from '@recovery-assistant/shared';

export type ChatMessage = UIMessage<ChatMessageMetadata>;
export type Chat = SharedChat<ChatMessage>;

export interface ChatNavigationItem extends ChatSummary {
  label: string;
  to: string;
  icon: string;
}
