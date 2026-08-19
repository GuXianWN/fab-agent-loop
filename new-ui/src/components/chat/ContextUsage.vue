<script setup lang="ts">
import type { ChatContext } from '@recovery-assistant/shared';

const props = defineProps<{ context: ChatContext | null }>();

const contextUsage = computed(() => {
  if (!props.context) return null;

  const remainingTokens = Math.max(0, props.context.contextWindow - props.context.estimatedTokens);
  const percent = Math.min(100, (props.context.estimatedTokens / props.context.contextWindow) * 100);

  return { ...props.context, remainingTokens, percent };
});

function formatTokens(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  return value >= 1_000 ? `${(value / 1_000).toFixed(1)}k` : value.toLocaleString();
}
</script>

<template>
  <UTooltip v-if="contextUsage" text="Estimated from the server-side model message context.">
    <div class="context-usage-row">
      <span>{{ formatTokens(contextUsage.estimatedTokens) }} / {{ formatTokens(contextUsage.contextWindow) }}</span>
      <span class="hidden sm:inline">· {{ formatTokens(contextUsage.remainingTokens) }} left</span>
      <span class="context-bar"><span class="context-bar-fill" :style="{ width: `${contextUsage.percent}%` }" /></span>
    </div>
  </UTooltip>
</template>

<style scoped>
.context-bar {
  width: 60px;
  height: 4px;
  overflow: hidden;
  border-radius: 2px;
  background: rgb(153 153 153 / 20%);
}

.context-usage-row {
  display: flex;
  align-items: center;
  gap: 7px;
  color: rgb(153 153 153);
  font-size: 11px;
  line-height: 22px;
}

.context-bar-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgb(153 153 153 / 45%), rgb(153 153 153 / 85%));
  transition: width 0.3s;
}
</style>
