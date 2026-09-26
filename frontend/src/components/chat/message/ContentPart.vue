<script setup lang="ts">
import { isReasoningUIPart, isTextUIPart, isToolUIPart, type UIMessage } from 'ai';
import TextPart from './part/TextPart.vue';
import ReasoningPart from './part/ReasoningPart.vue';
import ToolPart from './part/ToolPart.vue';
import ToolOutputPart from './part/ToolOutputPart.vue';

withDefaults(defineProps<{
  part: UIMessage['parts'][number];
  view: 'message' | 'process' | 'tool-output';
  message?: UIMessage;
  editing?: boolean;
}>(), { editing: false });
const emit = defineEmits<{ save: [message: UIMessage, text: string]; cancelEdit: [] }>();
</script>

<template>
  <TextPart
    v-if="isTextUIPart(part) && message"
    :part="part"
    :message="message"
    :editing="editing"
    @save="(item, text) => emit('save', item, text)"
    @cancel-edit="emit('cancelEdit')"
  />
  <ReasoningPart v-else-if="isReasoningUIPart(part)" :part="part" />
  <ToolPart v-else-if="isToolUIPart(part) && view === 'process'" :part="part" />
  <ToolOutputPart v-else-if="isToolUIPart(part) && view === 'tool-output'" :part="part" />
  <p v-else class="text-sm text-muted">暂不支持显示 {{ part.type }} 内容</p>
</template>
