<script setup lang="ts">
import type { ReasoningUIPart } from 'ai';
import { isPartStreaming } from '@nuxt/ui/utils/ai';
import ChatComark from '../../Comark';

const props = defineProps<{ part: ReasoningUIPart }>();
const summary = computed(() => props.part.text.replace(/\s+/g, ' ').trim().slice(0, 120) || '正在思考…');
</script>

<template>
  <div class="min-w-0 flex-1 pt-0.5 text-sm">
    <details v-if="part.text.length > 120">
      <summary class="cursor-pointer list-none text-default">
        <span class="mr-2 font-medium">思考</span>
        <span class="text-muted">{{ summary }}</span>
        <span class="ml-2 text-primary">查看详情</span>
      </summary>
      <div class="mt-2 text-muted">
        <Suspense>
          <ChatComark :value="part.text" :streaming="isPartStreaming(part)" />
        </Suspense>
      </div>
    </details>
    <p v-else><span class="mr-2 font-medium">思考</span><span class="text-muted">{{ summary }}</span></p>
  </div>
</template>
