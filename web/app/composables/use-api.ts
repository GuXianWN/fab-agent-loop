import type { Chat, ChatSummary, ChatVisibility, ChatVote } from '~/types/chat';
import type { Session } from '~/types/session';

interface UpdateChatInput {
  title?: string | null;
  visibility?: ChatVisibility;
}

interface CreateChatInput {
  input?: string;
}

export function useApi() {
  const { public: publicConfig } = useRuntimeConfig();
  const baseURL = publicConfig.apiBase.replace(/\/$/, '');
  const request = $fetch.create({ baseURL });

  return {
    chatStreamUrl: `${baseURL}/ai/chat`,
    getSession: () => request<Session>('/session'),
    login: () => request<Session>('/session/login', { method: 'POST' }),
    logout: () => request<Session>('/session/logout', { method: 'POST' }),
    listChats: () => request<ChatSummary[]>('/chats'),
    createChat: (body: CreateChatInput) => request<Chat>('/chats', { method: 'POST', body }),
    getChat: (id: string) => request<Chat>(`/chats/${id}`),
    updateChat: (id: string, body: UpdateChatInput) => request<Chat>(`/chats/${id}`, { method: 'PATCH', body }),
    removeChat: (id: string) => request<void>(`/chats/${id}`, { method: 'DELETE' }),
    listVotes: (id: string) => request<ChatVote[]>(`/chats/${id}/votes`),
    setVote: (id: string, body: { messageId: string; isUpvoted?: boolean }) => request<ChatVote | null>(`/chats/${id}/votes`, { method: 'POST', body }),
    removeMessage: (chatId: string, messageId: string) => request<void>(`/chats/${chatId}/messages/${messageId}`, { method: 'DELETE' }),
  };
}
