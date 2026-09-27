<script setup lang="ts">
import type { ReasoningUIPart } from 'ai';
import { isPartStreaming } from '@nuxt/ui/utils/ai';
import ProcessStep from './ProcessStep.vue';

defineProps<{ part: ReasoningUIPart }>();
</script>

<template>
  <ProcessStep
    icon="i-lucide-lightbulb"
    title="思考"
    :description="
      isPartStreaming(part) ? '正在整理分析步骤…' : '已完成分析步骤'
    "
    :status="isPartStreaming(part) ? 'running' : 'complete'"
  />
</template>
