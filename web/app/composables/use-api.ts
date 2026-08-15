import type {
  ChatSummary,
  ChatVote,
  CreateChatInput,
  R as ApiResponse,
  Session,
  SetChatVoteInput,
  UpdateChatInput,
} from '#shared';
import type { UIMessage } from 'ai';

type Chat = import('#shared').Chat<UIMessage>;

export function useApi() {
  const { public: publicConfig } = useRuntimeConfig();
  const baseURL = publicConfig.apiBase.replace(/\/$/, '');
  const request = $fetch.create({ baseURL });

  async function requestData<T>(url: string, options?: Parameters<typeof request>[1]): Promise<T> {
    const response = await request<ApiResponse<T>>(url, { ...options, ignoreResponseError: true });

    if (response.code !== 0) {
      throw createError({ statusCode: response.code, statusMessage: response.msg });
    }

    return response.data;
  }

  return {
    chatStreamUrl: `${baseURL}/ai/chat`,
    getSession: () => requestData<Session>('/session'),
    login: () => requestData<Session>('/session/login', { method: 'POST' }),
    logout: () => requestData<Session>('/session/logout', { method: 'POST' }),
    listChats: () => requestData<ChatSummary[]>('/chats'),
    createChat: (body: CreateChatInput) => requestData<Chat>('/chats', { method: 'POST', body }),
    getChat: (id: string) => requestData<Chat>(`/chats/${id}`),
    updateChat: (id: string, body: UpdateChatInput) => requestData<Chat>(`/chats/${id}/update`, { method: 'POST', body }),
    removeChat: (id: string) => requestData<null>(`/chats/${id}/delete`, { method: 'POST' }),
    listVotes: (id: string) => requestData<ChatVote[]>(`/chats/${id}/votes`),
    setVote: (id: string, body: SetChatVoteInput) => requestData<ChatVote | null>(`/chats/${id}/votes`, { method: 'POST', body }),
    removeMessage: (chatId: string, messageId: string) => requestData<null>(`/chats/${chatId}/messages/${messageId}/delete`, { method: 'POST' }),
  };
}
