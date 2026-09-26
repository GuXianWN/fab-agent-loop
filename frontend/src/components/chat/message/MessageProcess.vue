<script setup lang="ts">
import type { UIMessage } from 'ai';
import ContentPart from './ContentPart.vue';

const props = defineProps<{ parts: UIMessage['parts']; streaming: boolean }>();
const open = ref(false);

watch(() => props.streaming, (streaming, wasStreaming) => {
  if (streaming) open.value = true;
  else if (wasStreaming) open.value = false;
}, { immediate: true });
</script>

<template>
  <UCollapsible v-if="parts.length" v-model:open="open" class="mb-4 rounded-xl border border-default bg-elevated/40 px-4 py-3">
    <button type="button" class="flex w-full items-center gap-2 text-left text-sm font-medium">
      <UIcon name="i-lucide-chevron-down" class="size-4 shrink-0 transition-transform" :class="open ? '' : '-rotate-90'" />
      <span>分析过程</span>
      <span class="ml-auto text-xs font-normal text-muted">{{ parts.length }} 项 · {{ streaming ? '进行中' : '已完成' }}</span>
    </button>

    <template #content>
      <ol class="mt-3 border-t border-default pt-3">
        <li v-for="(part, position) in parts" :key="`${part.type}-${position}`" class="flex gap-3 pb-3 last:pb-0">
          <span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs text-muted">{{ position + 1 }}</span>
          <ContentPart :part="part" view="process" />
        </li>
      </ol>
    </template>
  </UCollapsible>
</template>
