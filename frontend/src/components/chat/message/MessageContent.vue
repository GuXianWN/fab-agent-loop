<script setup lang="ts">
import { isReasoningUIPart, isToolUIPart, type UIMessage } from 'ai';
import ContentPart from './ContentPart.vue';
import MessageProcess from './MessageProcess.vue';

type Part = UIMessage['parts'][number];
type Block =
  | { kind: 'process'; key: string; parts: Part[] }
  | { kind: 'part' | 'tool-output'; key: string; part: Part };

const props = defineProps<{ message: UIMessage; editing: boolean; streaming: boolean }>();
const emit = defineEmits<{ save: [message: UIMessage, text: string]; cancelEdit: [] }>();

const blocks = computed(() => {
  const result: Block[] = [];
  let process: Extract<Block, { kind: 'process' }> | undefined;

  props.message.parts.forEach((part, index) => {
    if (part.type === 'step-start') return;

    if (props.message.role === 'assistant' && (isReasoningUIPart(part) || isToolUIPart(part))) {
      if (!process) {
        process = { kind: 'process', key: `process-${index}`, parts: [] };
        result.push(process);
      }
      process.parts.push(part);

      if (isToolUIPart(part) && part.state === 'output-available') {
        result.push({ kind: 'tool-output', key: `output-${index}`, part });
        process = undefined;
      }
      return;
    }

    process = undefined;
    result.push({ kind: 'part', key: `part-${index}`, part });
  });

  return result;
});
</script>

<template>
  <template v-for="block in blocks" :key="block.key">
    <MessageProcess v-if="block.kind === 'process'" :parts="block.parts" :streaming="streaming" />
    <ContentPart
      v-else
      :part="block.part"
      :message="message"
      :editing="editing"
      :view="block.kind === 'tool-output' ? 'tool-output' : 'message'"
      @save="(item, text) => emit('save', item, text)"
      @cancel-edit="emit('cancelEdit')"
    />
  </template>
</template>
