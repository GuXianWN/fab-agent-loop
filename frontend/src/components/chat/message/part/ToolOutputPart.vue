<script setup lang="ts">
import { getToolName, type DynamicToolUIPart, type ToolUIPart } from 'ai';
import GetCurrentTimePart from './GetCurrentTimePart.vue';

const props = defineProps<{ part: ToolUIPart | DynamicToolUIPart }>();
const name = computed(() => getToolName(props.part));
const outputText = computed(() => {
  if (props.part.state !== 'output-available') return '';
  return JSON.stringify(props.part.output, null, 2) ?? '无结果数据';
});
</script>

<template>
  <div v-if="part.state === 'output-available'" class="mb-4 min-w-0">
    <GetCurrentTimePart v-if="name === 'getCurrentTime'" :output="part.output" />
    <details v-else class="rounded-lg border border-default p-3 text-sm">
      <summary class="cursor-pointer">{{ name }} 结果</summary>
      <pre class="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-all text-xs text-muted">{{ outputText }}</pre>
    </details>
  </div>
</template>
