<script setup lang="ts">
import type { ReasoningUIPart } from 'ai';
import { isPartStreaming } from '@nuxt/ui/utils/ai';
import ChatComark from '../../Comark';
import ProcessStep from './ProcessStep.vue';

const props = defineProps<{ part: ReasoningUIPart }>();
const summary = computed(() => props.part.text.replace(/\s+/g, ' ').trim());
</script>

<template>
  <ProcessStep
    icon="i-lucide-lightbulb"
    title="思考"
    :description="summary || '正在思考…'"
    :status="isPartStreaming(part) ? 'running' : 'complete'"
  >
    <template v-if="summary" #default>
      <Suspense>
        <ChatComark :value="part.text" :streaming="isPartStreaming(part)" />
      </Suspense>
    </template>
  </ProcessStep>
</template>
