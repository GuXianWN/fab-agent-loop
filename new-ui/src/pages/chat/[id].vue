<script setup lang="ts">
import type { ChatContext } from '@recovery-assistant/shared'
import type { UIMessage } from 'ai'
import type { Chat, ChatMessage, ChatVote } from '~/types/chat'
import ChatTitle from '~/components/chat/ChatTitle.vue'
import ChatIndicator from '~/components/chat/Indicator.vue'
import ChatContextUsage from '~/components/chat/ContextUsage.vue'
import ChatMessageContent from '~/components/chat/message/MessageContent.vue'
import ChatMessageActions from '~/components/chat/message/MessageActions.vue'

const route = useRoute()
const api = useApi()
const toast = useToast()
const chatId = computed(() => String((route.params as Record<string, string>).id))
const chat = ref<Chat | null>(null)
const votes = ref<ChatVote[]>([])
const context = ref<ChatContext | null>(null)
const title = ref<string | null>(null)
const input = ref('')
const editingMessageId = ref<string | null>(null)
const loading = ref(true)

async function loadChat() {
  const id = chatId.value
  loading.value = true
  editingMessageId.value = null

  try {
    const [nextChat, nextVotes, nextContext] = await Promise.all([
      api.getChat(id),
      api.listVotes(id),
      api.getChatContext(id),
    ])

    if (chatId.value !== id) return

    chat.value = nextChat
    votes.value = nextVotes
    context.value = nextContext
    title.value = nextChat.title
  } catch (error) {
    if (chatId.value === id) {
      chat.value = null
      const message = error instanceof Error ? error.message : 'Failed to load chat'
      toast.add({ description: message, icon: 'i-lucide-alert-circle', color: 'error' })
    }
  } finally {
    if (chatId.value === id) loading.value = false
  }
}

watch(chatId, loadChat, { immediate: true })

function getVote(messageId: string) {
  return votes.value.find(vote => vote.messageId === messageId)?.isUpvoted ?? null
}

async function vote(message: UIMessage, isUpvoted: boolean) {
  const current = getVote(message.id)
  const next = current === isUpvoted ? undefined : isUpvoted
  const snapshot = votes.value

  votes.value = next === undefined
    ? votes.value.filter(vote => vote.messageId !== message.id)
    : [...votes.value.filter(vote => vote.messageId !== message.id), { chatId: chatId.value, messageId: message.id, isUpvoted: next }]

  try {
    await api.setVote(chatId.value, message.id, { isUpvoted: next })
  } catch (error) {
    votes.value = snapshot
    toast.add({ description: error instanceof Error ? error.message : 'Failed to save vote', icon: 'i-lucide-alert-circle', color: 'error' })
  }
}

function startEdit(message: UIMessage) {
  if (!editingMessageId.value) editingMessageId.value = message.id
}

function cancelEdit() {
  editingMessageId.value = null
}

async function saveEdit(message: UIMessage, text: string) {
  try {
    await api.removeMessage(chatId.value, message.id)
    editingMessageId.value = null
    input.value = text
    toast.add({ description: 'Message branch updated. Sending is available after chat streaming is migrated.' })
  } catch (error) {
    toast.add({ description: error instanceof Error ? error.message : 'Failed to update message', icon: 'i-lucide-alert-circle', color: 'error' })
  }
}
</script>

<template>
  <UDashboardPanel v-if="loading" id="chat" class="relative min-h-0" :ui="{ body: 'p-0 sm:p-0 overscroll-none' }">
    <template #header><Navbar /></template>

    <template #body>
      <UContainer class="flex-1 flex flex-col gap-4 sm:gap-6 pt-(--ui-header-height)">
        <USkeleton class="h-5 w-32" />
        <USkeleton class="h-24 w-full" />
        <USkeleton class="h-5 w-2/3" />
      </UContainer>
    </template>
  </UDashboardPanel>

  <UDashboardPanel v-else-if="chat" id="chat" class="relative min-h-0" :ui="{ body: 'p-0 sm:p-0 overscroll-none' }">
    <template #header>
      <Navbar>
        <template #title>
          <ChatTitle :chat-id="chat.id" :title="title" @update="title = $event" />
        </template>
      </Navbar>
    </template>

    <template #body>
      <UContainer class="flex-1 flex flex-col gap-4 sm:gap-6">
        <UChatMessages should-auto-scroll :messages="chat.messages" status="ready" class="pt-(--ui-header-height) pb-4 sm:pb-6">
          <template #indicator>
            <div class="flex items-center gap-1.5"><ChatIndicator /><UChatShimmer text="Thinking..." class="text-sm" /></div>
          </template>
          <template #content="{ message }">
            <ChatMessageContent :message="message" :editing="editingMessageId === message.id" @save="saveEdit" @cancel-edit="cancelEdit" />
          </template>
          <template #actions="{ message }">
            <ChatMessageActions :message="message" :streaming="false" :locked="false" :editing="editingMessageId === message.id" :vote="getVote(message.id)" @edit="startEdit" @regenerate="() => {}" @vote="vote" />
          </template>
        </UChatMessages>

        <UChatPrompt v-model="input" color="neutral" variant="subtle" class="sticky bottom-0 [view-transition-name:chat-prompt] rounded-b-none z-10" :ui="{ base: 'px-1.5 pt-[24px]' }">
          <template #default>
            <ChatContextUsage :context="context" class="absolute right-3.5" />
          </template>
          <template #footer>
            <ModelSelect />
            <UChatPromptSubmit status="ready" color="neutral" size="sm" />
          </template>
        </UChatPrompt>
      </UContainer>
    </template>
  </UDashboardPanel>

  <UContainer v-else class="flex-1 flex flex-col gap-4 sm:gap-6">
    <UError :error="{ statusMessage: 'Chat not found', statusCode: 404 }" class="min-h-full">
      <template #links><UButton to="/" size="lg" label="Back to home" /></template>
    </UError>
  </UContainer>
</template>
