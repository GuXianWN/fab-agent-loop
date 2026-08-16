<script setup lang="ts">
import { DefaultChatTransport, type UIMessage } from 'ai';
import { useChat } from '@ai-sdk/vue';
import type { ChatContext, ChatMessageMetadata, ChatStreamRequest } from '@recovery-assistant/shared';
import type { Chat, ChatMessage, ChatVote } from '~/types/chat';

const route = useRoute();
const api = useApi();
const toast = useToast();
const { refresh: refreshChats } = useChats();
const chatId = computed(() => String(route.params.id));
const chat = ref<Chat | null>(null);
const votes = ref<ChatVote[]>([]);
const context = ref<ChatContext | null>(null);
const title = ref<string | null>(null);
const input = ref('');
const editingMessageId = ref<string | null>(null);
const loading = ref(true);

const { messages, status, error, sendMessage, regenerate, stop } = useChat<ChatMessage>(() => ({
  id: chat.value?.id,
  messages: chat.value?.messages,
  generateId: () => crypto.randomUUID(),
  transport: new DefaultChatTransport({
    api: api.chatStreamUrl,
    prepareSendMessagesRequest: ({ messages }) => ({ body: { chatId: chatId.value, messages } satisfies ChatStreamRequest<UIMessage<ChatMessageMetadata>> }),
  }),
  onError(streamError) {
    toast.add({ description: streamError.message, icon: 'i-lucide-alert-circle', color: 'error', duration: 0 });
  },
}));

async function loadContext(id: string) {
  context.value = await api.getChatContext(id);
}

async function waitForMessage(messageId: string): Promise<void> {
  if (messages.value.some((message) => message.id === messageId)) return;

  await new Promise<void>((resolve) => {
    const stop = watch(messages, (currentMessages) => {
      if (currentMessages.some((message) => message.id === messageId)) {
        stop();
        resolve();
      }
    });
  });
}

async function loadChat() {
  const id = chatId.value;
  loading.value = true;
  editingMessageId.value = null;

  try {
    const nextChat = await api.getChat(id);
    const nextVotes = await api.listVotes(id);
    const nextContext = await api.getChatContext(id);

    if (chatId.value !== id) return;

    chat.value = nextChat;
    votes.value = nextVotes;
    context.value = nextContext;
    title.value = nextChat.title;

    const initialMessage = nextChat.messages[0];
    if (nextChat.messages.length === 1 && initialMessage?.role === 'user') {
      await waitForMessage(initialMessage.id);
      if (chatId.value === id && chat.value?.id === id) regenerate();
    }
  } catch {
    if (chatId.value === id) chat.value = null;
  } finally {
    if (chatId.value === id) loading.value = false;
  }
}

watch(chatId, loadChat, { immediate: true });

watch(status, async (currentStatus, previousStatus) => {
  if (currentStatus === 'ready' && previousStatus !== 'ready' && chat.value) {
    const id = chat.value.id;
    const [nextChat, nextContext] = await Promise.all([api.getChat(id), api.getChatContext(id)]);

    if (chat.value?.id === id) {
      title.value = nextChat.title;
      context.value = nextContext;
      await refreshChats();
    }
  }
});

function submit(event: Event) {
  event.preventDefault();
  const text = input.value.trim();

  if (!text || status.value !== 'ready') return;
  sendMessage({ text });
  input.value = '';
}

function getVote(messageId: string) {
  return votes.value.find((vote) => vote.messageId === messageId)?.isUpvoted ?? null;
}

async function vote(message: UIMessage, isUpvoted: boolean) {
  const current = getVote(message.id);
  const next = current === isUpvoted ? undefined : isUpvoted;
  const snapshot = votes.value;

  votes.value = next === undefined
    ? votes.value.filter((vote) => vote.messageId !== message.id)
    : [...votes.value.filter((vote) => vote.messageId !== message.id), { chatId: chatId.value, messageId: message.id, isUpvoted: next }];

  try {
    await api.setVote(chatId.value, message.id, { isUpvoted: next });
  } catch {
    votes.value = snapshot;
    toast.add({ description: 'Failed to save vote', icon: 'i-lucide-alert-circle', color: 'error' });
  }
}

function startEdit(message: UIMessage) {
  if (status.value === 'ready' && !editingMessageId.value) editingMessageId.value = message.id;
}

function cancelEdit() {
  editingMessageId.value = null;
}

async function saveEdit(message: UIMessage, text: string) {
  if (status.value !== 'ready') return;
  await api.removeMessage(chatId.value, message.id);
  editingMessageId.value = null;
  sendMessage({ text, messageId: message.id });
}

async function regenerateMessage(message: UIMessage) {
  if (status.value !== 'ready') return;
  await api.removeMessage(chatId.value, message.id);
  regenerate({ messageId: message.id });
}

function reload() {
  if (status.value === 'ready') regenerate();
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
        <UChatMessages should-auto-scroll :messages="messages" :status="status" class="pt-(--ui-header-height) pb-4 sm:pb-6">
          <template #indicator>
            <div class="flex items-center gap-1.5"><ChatIndicator /><UChatShimmer text="Thinking..." class="text-sm" /></div>
          </template>
          <template #content="{ message }">
            <ChatMessageContent :message="message" :editing="status === 'ready' && editingMessageId === message.id" @save="saveEdit" @cancel-edit="cancelEdit" />
          </template>
          <template #actions="{ message }">
            <ChatMessageActions :message="message" :streaming="status === 'streaming' && message.id === messages.at(-1)?.id" :locked="status !== 'ready'" :editing="editingMessageId === message.id" :vote="getVote(message.id)" @edit="startEdit" @regenerate="regenerateMessage" @vote="vote" />
          </template>
        </UChatMessages>

        <UChatPrompt v-model="input" :error="error" color="neutral" variant="subtle" class="sticky bottom-0 [view-transition-name:chat-prompt] rounded-b-none z-10" :ui="{ base: 'px-1.5 pt-[24px]' }" @submit="submit">
          <template #default>
            <ChatContextUsage :context="context" class="absolute right-3.5" />
          </template>
          <template #footer>
            <ModelSelect />
            <UChatPromptSubmit :status="status" color="neutral" size="sm" @stop="stop()" @reload="reload" />
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
