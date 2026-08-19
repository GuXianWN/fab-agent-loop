<script setup lang="ts">
import { isReasoningUIPart, isTextUIPart, type UIMessage } from 'ai';
import { isPartStreaming } from '@nuxt/ui/utils/ai';
import ChatComark from '../Comark';
import MessageEdit from './MessageEdit.vue';

defineProps<{ message: UIMessage; editing: boolean }>();
const emit = defineEmits<{ save: [message: UIMessage, text: string]; cancelEdit: [] }>();
</script>

<template>
  <template v-for="(part, index) in message.parts" :key="`${message.id}-${part.type}-${index}`">
    <UChatReasoning v-if="isReasoningUIPart(part)" :text="part.text" :streaming="isPartStreaming(part)" chevron="leading">
      <Suspense>
        <ChatComark :value="part.text" :streaming="isPartStreaming(part)" />
      </Suspense>
    </UChatReasoning>

    <template v-else-if="isTextUIPart(part)">
      <Suspense v-if="message.role === 'assistant'">
        <ChatComark :value="part.text" :streaming="isPartStreaming(part)" />
      </Suspense>
      <template v-else>
        <MessageEdit v-if="editing" :message="message" :text="part.text" @save="(item, text) => emit('save', item, text)" @cancel="emit('cancelEdit')" />
        <p v-else class="whitespace-pre-wrap">{{ part.text }}</p>
      </template>
    </template>
  </template>
</template>
