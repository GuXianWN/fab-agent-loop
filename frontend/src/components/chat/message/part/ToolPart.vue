<script setup lang="ts">
import { getToolName, type DynamicToolUIPart, type ToolUIPart } from 'ai';
import ProcessStep from './ProcessStep.vue';

const props = defineProps<{ part: ToolUIPart | DynamicToolUIPart }>();
const name = computed(() => getToolName(props.part));
const title = computed(() => name.value === 'getCurrentTime' ? '获取北京时间' : name.value);
const states = {
  'input-streaming': 'running',
  'input-available': 'running',
  'approval-requested': 'waiting',
  'approval-responded': 'waiting',
  'output-available': 'complete',
  'output-error': 'error',
  'output-denied': 'denied',
} as const;
</script>

<template>
  <ProcessStep
    :icon="name === 'getCurrentTime' ? 'i-lucide-clock-3' : 'i-lucide-wrench'"
    :title="title"
    :description="name === 'getCurrentTime' ? 'Asia/Shanghai' : undefined"
    :status="states[part.state]"
  >
    <template v-if="part.state === 'output-error'" #default>
      <p class="text-error">{{ part.errorText }}</p>
    </template>
  </ProcessStep>
</template>
