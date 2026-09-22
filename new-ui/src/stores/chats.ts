import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChatSummary } from '@recovery-assistant/shared'
import { useApi } from '~/api/use-api'

export const useChatsStore = defineStore('chats', () => {
  const chats = ref<ChatSummary[]>([])
  async function refresh() {
    chats.value = await useApi().listChats()
  }
  return { chats, refresh }
})
