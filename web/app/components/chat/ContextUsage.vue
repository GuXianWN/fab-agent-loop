<script setup lang="ts">
import type { ChatMessage } from '~/types/chat';

const props = defineProps<{ messages: ChatMessage[] }>();

const contextUsage = computed(() => {
  const message = props.messages.findLast((item) => item.role === 'assistant' && item.metadata?.usage);
  const metadata = message?.metadata;

  if (!metadata) return null;

  const messages = props.messages.map(({ role, parts }) => ({ role, parts }));
  const estimatedTokens = Math.max(0, Math.round(JSON.stringify(messages).length / 4));
  const percent = Math.min(100, (estimatedTokens / metadata.contextWindow) * 100);

  return { ...metadata, estimatedTokens, percent };
});

function formatPercent(value: number): string {
  return value < 1 ? `${value.toFixed(2)}%` : `${Math.round(value)}%`;
}
</script>

<template>
  <UTooltip v-if="contextUsage" :text="`Estimated from the full chat history. Last request used ${contextUsage.usage.inputTokens.toLocaleString()} input tokens.`">
    <div class="flex items-center gap-2 text-xs text-muted">
      <UProgress :model-value="contextUsage.percent" size="xs" color="neutral" class="w-16" />
      <span>{{ formatPercent(contextUsage.percent) }}</span>
    </div>
  </UTooltip>
</template>
