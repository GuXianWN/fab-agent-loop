<script setup lang="ts">
import { isReasoningUIPart, isTextUIPart, isToolUIPart, type UIMessage } from 'ai';
import { isPartStreaming } from '@nuxt/ui/utils/ai';
import ChatComark from '../Comark';
import MessageEdit from './MessageEdit.vue';

defineProps<{ message: UIMessage; editing: boolean }>();
const emit = defineEmits<{ save: [message: UIMessage, text: string]; cancelEdit: [] }>();

function formatTime(output: unknown): string {
  return typeof output === 'object' && output !== null && 'dateTime' in output && typeof output.dateTime === 'string'
    ? `${output.dateTime}（北京时间）`
    : '已获取当前时间';
}
</script>

<template>
  <template v-for="(part, index) in message.parts" :key="`${message.id}-${part.type}-${index}`">
    <UChatReasoning v-if="isReasoningUIPart(part)" :text="part.text" :streaming="isPartStreaming(part)" chevron="leading">
      <Suspense>
        <ChatComark :value="part.text" :streaming="isPartStreaming(part)" />
      </Suspense>
    </UChatReasoning>

    <UChatTool
      v-else-if="isToolUIPart(part)"
      :text="part.type === 'tool-getCurrentTime' ? '获取北京时间' : part.type === 'dynamic-tool' ? part.toolName : part.type.slice(5)"
      :loading="part.state === 'input-streaming' || part.state === 'input-available'"
      :suffix="part.state === 'output-error' ? '失败' : part.state === 'output-available' ? '已完成' : '执行中'"
    >
      <p v-if="part.state === 'output-available' && part.type === 'tool-getCurrentTime'" class="text-sm text-muted">{{ formatTime(part.output) }}</p>
      <p v-else-if="part.state === 'output-error'" class="text-sm text-error">{{ part.errorText }}</p>
    </UChatTool>

    <template v-else-if="isTextUIPart(part)">
      <Suspense v-if="message.role === 'assistant'">
        <ChatComark :value="part.text" :streaming="isPartStreaming(part)" />
      </Suspense>
      <template v-else>
        <MessageEdit v-if="editing" :message="message" :text="part.text" @save="(item, text) => emit('save', item, text)" @cancel="emit('cancelEdit')" />
        <p v-else class="whitespace-pre-wrap">{{ part.text }}</p>
      </template>
    </template>
  </template>
</template>
