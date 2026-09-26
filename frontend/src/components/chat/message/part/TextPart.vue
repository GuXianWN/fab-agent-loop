<script setup lang="ts">
import type { TextUIPart, UIMessage } from 'ai';
import { isPartStreaming } from '@nuxt/ui/utils/ai';
import ChatComark from '../../Comark';
import MessageEdit from '../MessageEdit.vue';

defineProps<{ part: TextUIPart; message: UIMessage; editing: boolean }>();
const emit = defineEmits<{ save: [message: UIMessage, text: string]; cancelEdit: [] }>();
</script>

<template>
  <Suspense v-if="message.role === 'assistant'">
    <ChatComark :value="part.text" :streaming="isPartStreaming(part)" />
  </Suspense>
  <MessageEdit v-else-if="editing" :message="message" :text="part.text" @save="(item, text) => emit('save', item, text)" @cancel="emit('cancelEdit')" />
  <p v-else class="whitespace-pre-wrap">{{ part.text }}</p>
</template>
