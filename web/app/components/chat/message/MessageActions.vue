<script setup lang="ts">
import { getTextFromMessage } from '@nuxt/ui/utils/ai';
import { isFileUIPart, type UIMessage } from 'ai';
import { useClipboard } from '@vueuse/core';

const props = defineProps<{
  message: UIMessage & { createdAt?: string | Date };
  streaming: boolean;
  locked: boolean;
  editing: boolean;
  vote: boolean | null;
}>();

const emit = defineEmits<{
  edit: [message: UIMessage];
  regenerate: [message: UIMessage];
  vote: [message: UIMessage, isUpvoted: boolean];
}>();

const clipboard = useClipboard();
const copied = ref(false);
const hasFiles = computed(() => props.message.parts.some(isFileUIPart));
const formattedDate = computed(() => {
  if (!props.message.createdAt) return null;

  const date = new Date(props.message.createdAt);
  return {
    time: date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
    full: date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }),
    iso: date.toISOString(),
  };
});

function copy() {
  clipboard.copy(getTextFromMessage(props.message));
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
}
</script>

<template>
  <template v-if="message.role === 'assistant' && !streaming">
    <UTooltip text="Copy response"><UButton size="sm" :color="copied ? 'primary' : 'neutral'" variant="ghost" :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'" aria-label="Copy response" @click="copy" /></UTooltip>
    <UTooltip text="Good response"><UButton size="sm" :color="vote === true ? 'success' : 'neutral'" variant="ghost" icon="i-lucide-thumbs-up" aria-label="Good response" @click="emit('vote', message, true)" /></UTooltip>
    <UTooltip text="Bad response"><UButton size="sm" :color="vote === false ? 'error' : 'neutral'" variant="ghost" icon="i-lucide-thumbs-down" aria-label="Bad response" @click="emit('vote', message, false)" /></UTooltip>
    <UTooltip text="Regenerate response"><UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-rotate-cw" aria-label="Regenerate response" :disabled="locked" @click="emit('regenerate', message)" /></UTooltip>
  </template>

  <template v-if="message.role === 'user' && !streaming && !editing">
    <UTooltip v-if="formattedDate" :text="formattedDate.full"><time :datetime="formattedDate.iso" class="text-xs text-muted mr-1.5">{{ formattedDate.time }}</time></UTooltip>
    <UTooltip v-if="!hasFiles" text="Edit message"><UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-pencil" aria-label="Edit message" :disabled="locked" @click="emit('edit', message)" /></UTooltip>
  </template>
</template>
