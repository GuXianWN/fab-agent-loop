<script setup lang="ts">
import { isToolUIPart, type UIMessage } from 'ai';
import ContentPart from './ContentPart.vue';

const props = defineProps<{ parts: UIMessage['parts']; streaming: boolean }>();
const open = ref(false);
const hasError = computed(() => props.parts.some(part => isToolUIPart(part) && part.state === 'output-error'));

watch(() => props.streaming, (streaming, wasStreaming) => {
  if (streaming) open.value = true;
  else if (wasStreaming) open.value = false;
}, { immediate: true });
</script>

<template>
  <UCollapsible v-if="parts.length" v-model:open="open" class="mb-4 rounded-xl border border-default bg-elevated/20">
    <button type="button" class="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-elevated/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40">
      <UIcon name="i-lucide-chevron-down" class="size-4 shrink-0 transition-transform" :class="open ? '' : '-rotate-90'" />
      <span>分析过程</span>
      <span class="ml-auto text-xs font-normal text-muted">{{ streaming ? '进行中' : hasError ? '执行异常' : '已完成' }} · {{ parts.length }} 个步骤</span>
    </button>

    <template #content>
      <ol class="border-t border-default px-4 py-1">
        <li v-for="(part, position) in parts" :key="`${part.type}-${position}`" class="relative before:absolute before:bottom-0 before:left-3.5 before:top-0 before:w-px before:bg-accented first:before:top-7 last:before:bottom-auto last:before:h-7 only:before:hidden">
          <ContentPart :part="part" view="process" />
        </li>
      </ol>
    </template>
  </UCollapsible>
</template>
