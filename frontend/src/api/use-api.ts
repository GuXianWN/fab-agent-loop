import type { AxiosRequestConfig } from 'axios'
import type {
  Chat,
  ChatContext,
  ChatMessageMetadata,
  ChatSummary,
  ChatVote,
  CreateChatInput,
  R as ApiResponse,
  Session,
  SetMessageVoteInput,
  UpdateChatInput,
} from '@recovery-assistant/shared'
import type { UIMessage } from 'ai'
import { ApiError, apiBaseUrl, http } from './http'

type ChatDetail = Chat<UIMessage<ChatMessageMetadata>>

async function requestData<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await http.request<ApiResponse<T>>(config)
  const payload = response.data

  if (!payload || typeof payload.code !== 'number') {
    throw new ApiError('Invalid API response', response.status)
  }

  if (payload.code !== 0) {
    throw new ApiError(payload.msg || 'Request failed', payload.code)
  }

  return payload.data
}

export function useApi() {
  return {
    chatStreamUrl: `${apiBaseUrl}/ai/chat`,
    getChatContext: (id: string) => requestData<ChatContext>({ url: `/ai/chats/${id}/context` }),
    getSession: () => requestData<Session>({ url: '/session' }),
    login: () => requestData<Session>({ url: '/session/login', method: 'POST' }),
    logout: () => requestData<Session>({ url: '/session/logout', method: 'POST' }),
    listChats: () => requestData<ChatSummary[]>({ url: '/chats' }),
    createChat: (data: CreateChatInput) => requestData<ChatDetail>({ url: '/chats', method: 'POST', data }),
    getChat: (id: string) => requestData<ChatDetail>({ url: `/chats/${id}` }),
    updateChat: (id: string, data: UpdateChatInput) => requestData<ChatDetail>({ url: `/chats/${id}/update`, method: 'POST', data }),
    removeChat: (id: string) => requestData<null>({ url: `/chats/${id}/delete`, method: 'POST' }),
    listVotes: (id: string) => requestData<ChatVote[]>({ url: `/chats/${id}/votes` }),
    setVote: (chatId: string, messageId: string, data: SetMessageVoteInput) => requestData<null>({ url: `/chats/${chatId}/messages/${messageId}/vote`, method: 'POST', data }),
    removeMessage: (chatId: string, messageId: string) => requestData<null>({ url: `/chats/${chatId}/messages/${messageId}/delete`, method: 'POST' }),
  }
}
