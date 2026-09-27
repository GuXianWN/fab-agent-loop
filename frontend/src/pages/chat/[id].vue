<script setup lang="ts">
import { DefaultChatTransport, type UIMessage } from 'ai';
import { useChat } from '@ai-sdk/vue';
import { useMutationObserver } from '@vueuse/core';
import { useChatsStore } from '~/stores/chats';
import ChatMessageContent from '~/components/chat/message/MessageContent.vue';
import ChatMessageActions from '~/components/chat/message/MessageActions.vue';
import ChatContextUsage from '~/components/chat/ContextUsage.vue';
import type {
  ChatContext,
  ChatMessageMetadata,
  ChatStreamRequest,
} from '@recovery-assistant/shared';
import type { Chat, ChatMessage, ChatVote } from '~/types/chat';

const route = useRoute('/chat/[id]');
const api = useApi();
const chatsStore = useChatsStore();
const toast = useToast();
const chatId = computed(() => route.params.id);
const chat = ref<Chat | null>(null);
const votes = ref<ChatVote[]>([]);
const context = ref<ChatContext | null>(null);
const title = ref<string | null>(null);
const input = ref('');
const editingMessageId = ref<string | null>(null);
const loading = ref(true);
const scrollElement = ref<HTMLElement>();

function scrollToBottom() {
  scrollElement.value?.scrollTo({ top: scrollElement.value.scrollHeight });
}

useMutationObserver(scrollElement, scrollToBottom, {
  childList: true,
  subtree: true,
  characterData: true,
});

const { messages, status, error, sendMessage, regenerate, stop } =
  useChat<ChatMessage>(() => ({
    id: chat.value?.id,
    messages: chat.value?.messages,
    generateId: () => crypto.randomUUID(),
    transport: new DefaultChatTransport({
      api: api.chatStreamUrl,
      prepareSendMessagesRequest: ({ messages }) => {
        const message = messages.at(-1);
        if (message?.role !== 'user')
          throw new Error('Expected a user message');
        return {
          body: { chatId: chatId.value, message } satisfies ChatStreamRequest<
            UIMessage<ChatMessageMetadata>
          >,
        };
      },
    }),
    onError(streamError) {
      toast.add({
        description: streamError.message,
        icon: 'i-lucide-alert-circle',
        color: 'error',
        duration: 0,
      });
    },
  }));

async function waitForMessage(messageId: string): Promise<void> {
  if (messages.value.some(({ id }) => id === messageId)) return;
  await new Promise<void>((resolve) => {
    const unwatch = watch(messages, (current) => {
      if (current.some(({ id }) => id === messageId)) {
        unwatch();
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
    const [nextChat, nextVotes, nextContext] = await Promise.all([
      api.getChat(id),
      api.listVotes(id),
      api.getChatContext(id),
    ]);
    if (chatId.value !== id) return;
    chat.value = nextChat;
    votes.value = nextVotes;
    context.value = nextContext;
    title.value = nextChat.title;

    const first = nextChat.messages[0];
    if (nextChat.messages.length === 1 && first?.role === 'user') {
      await waitForMessage(first.id);
      if (chatId.value === id && chat.value?.id === id) regenerate();
    }
  } catch (loadError) {
    if (chatId.value === id) chat.value = null;
    toast.add({
      description:
        loadError instanceof Error ? loadError.message : '加载对话失败',
      color: 'error',
    });
  } finally {
    if (chatId.value === id) loading.value = false;
  }
}

watch(chatId, loadChat, { immediate: true });
watch(
  messages,
  async () => {
    await nextTick();
    scrollToBottom();
  },
  { deep: true },
);
onBeforeUnmount(() => stop());

watch(status, async (current, previous) => {
  if (current !== 'ready' || previous === 'ready' || !chat.value) return;
  const id = chat.value.id;
  const [nextChat, nextContext] = await Promise.all([
    api.getChat(id),
    api.getChatContext(id),
  ]);
  if (chat.value?.id !== id) return;
  title.value = nextChat.title;
  context.value = nextContext;
  await chatsStore.refresh();
});

function submit() {
  const text = input.value.trim();
  if (!text || status.value !== 'ready') return;
  sendMessage({ text });
  input.value = '';
}

function getVote(messageId: string) {
  return (
    votes.value.find(({ messageId: id }) => id === messageId)?.isUpvoted ?? null
  );
}

async function vote(message: UIMessage, isUpvoted: boolean) {
  const next = getVote(message.id) === isUpvoted ? undefined : isUpvoted;
  const snapshot = votes.value;
  votes.value =
    next === undefined
      ? votes.value.filter(({ messageId }) => messageId !== message.id)
      : [
          ...votes.value.filter(({ messageId }) => messageId !== message.id),
          { chatId: chatId.value, messageId: message.id, isUpvoted: next },
        ];
  try {
    await api.setVote(chatId.value, message.id, { isUpvoted: next });
  } catch {
    votes.value = snapshot;
    toast.add({ description: '保存评价失败', color: 'error' });
  }
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
</script>

<template>
  <div v-if="loading" class="h-full p-3 md:p-5">
    <div class="panel p-5 text-[#647586]">正在加载对话…</div>
  </div>
  <div v-else-if="chat" class="flex h-full min-h-0 flex-col gap-3 p-3 md:p-5">
    <!-- 会话上下文固定在顶部，消息区独立滚动。 -->
    <header
      class="panel flex min-h-[58px] shrink-0 items-center gap-3 px-4 py-2"
    >
      <UIcon name="i-lucide-cpu" class="size-6 shrink-0 text-[#087e80]" />
      <h1 class="min-w-0 truncate text-lg font-semibold">
        {{ title || '新对话' }}
      </h1>
      <span
        class="hidden shrink-0 rounded-md border border-[#dfe9eb] px-2 py-1 text-xs text-[#536476] sm:inline"
        >实时对话</span
      >
      <div class="ml-auto hidden shrink-0 sm:block">
        <ChatContextUsage :context="context" />
      </div>
    </header>

    <!-- 历史消息与流式回复沿用现有 AI SDK 数据源。 -->
    <div
      ref="scrollElement"
      class="min-h-0 flex-1 overflow-y-auto px-1 md:px-[4%]"
    >
      <div
        v-for="message in messages"
        :key="message.id"
        class="my-4 flex"
        :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[92%] min-w-0 transition-all duration-200 md:max-w-[85%]"
          :class="
            message.role === 'user'
              ? 'rounded-xl bg-[#e7f3f5] px-4 py-3'
              : 'panel w-full p-4 md:p-5'
          "
        >
          <div
            v-if="message.role === 'assistant'"
            class="mb-2 flex items-center gap-2 text-xs font-semibold text-[#087e80]"
          >
            <UIcon name="i-lucide-sparkles" class="size-4" />调机助手
          </div>
          <ChatMessageContent
            :message="message"
            :editing="editingMessageId === message.id"
            :streaming="
              status === 'streaming' && message.id === messages.at(-1)?.id
            "
            @save="saveEdit"
            @cancel-edit="editingMessageId = null"
          />
          <div class="mt-2 flex justify-end gap-1">
            <ChatMessageActions
              :message="message"
              :streaming="
                status === 'streaming' && message.id === messages.at(-1)?.id
              "
              :locked="status !== 'ready'"
              :editing="editingMessageId === message.id"
              :vote="getVote(message.id)"
              @edit="editingMessageId = message.id"
              @regenerate="regenerateMessage"
              @vote="vote"
            />
          </div>
        </div>
      </div>
      <div
        v-if="status === 'submitted'"
        class="flex items-center gap-2 py-2 text-sm text-[#647586]"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="size-4 animate-spin"
        />正在分析…
      </div>
      <p v-if="error" class="py-2 text-sm text-red-600">{{ error.message }}</p>
    </div>

    <!-- 输入区始终可见；生成期间可停止流式回复。 -->
    <form
      class="panel flex shrink-0 items-center gap-2 p-2 md:gap-3"
      @submit.prevent="submit"
    >
      <span
        class="hidden whitespace-nowrap rounded-md border border-[#dfe9eb] px-3 py-2 text-sm text-[#415565] sm:inline-flex"
        >调机分析</span
      ><input
        v-model="input"
        class="min-w-0 flex-1 px-2 py-2 text-sm outline-none placeholder:text-[#9aabb8]"
        aria-label="继续对话"
        placeholder="继续追问或补充批次信息…"
        :disabled="status !== 'ready'"
      /><UButton
        v-if="status !== 'ready'"
        type="button"
        class="send-button"
        icon="i-lucide-square"
        label="停止"
        @click="stop()"
      /><UButton
        v-else
        type="submit"
        class="send-button"
        icon="i-lucide-send"
        label="发送"
        :disabled="!input.trim()"
      />
    </form>
  </div>
  <div v-else class="h-full p-3 md:p-5">
    <div class="panel p-5">
      对话不存在。<RouterLink
        to="/"
        class="ml-2 font-semibold text-[#087e80] hover:underline"
        >返回新对话</RouterLink
      >
    </div>
  </div>
</template>

<style scoped>
.panel {
  border: 1px solid #dfe9eb;
  border-radius: 7px;
  background: white;
  box-shadow: 0 5px 20px rgba(25, 64, 78, 0.055);
}
.send-button {
  background: #087e80;
  color: white;
  transition:
    background 0.2s,
    transform 0.2s;
}
.send-button:hover {
  background: #066d70;
  transform: translateY(-1px);
}
@media (prefers-reduced-motion: reduce) {
  .send-button {
    transition: none;
  }
}
</style>
