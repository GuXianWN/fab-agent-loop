<script setup lang="ts">
import { getToolName, type DynamicToolUIPart, type ToolUIPart } from 'ai';

const props = defineProps<{ part: ToolUIPart | DynamicToolUIPart }>();
const name = computed(() => getToolName(props.part));
const title = computed(() => name.value === 'getCurrentTime' ? '获取北京时间' : name.value);
</script>

<template>
  <UChatTool
    class="min-w-0 flex-1"
    :text="title"
    :loading="part.state === 'input-streaming' || part.state === 'input-available'"
    :suffix="part.state === 'output-error' ? '失败' : part.state === 'output-available' ? '已完成' : '执行中'"
  >
    <p v-if="part.state === 'output-error'" class="text-sm text-error">{{ part.errorText }}</p>
  </UChatTool>
</template>
