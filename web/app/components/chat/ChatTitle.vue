<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

const props = defineProps<{ chatId: string; title?: string | null }>();
const emit = defineEmits<{ update: [title: string | null] }>();
const { renameChat, deleteChat } = useChatActions();
const displayTitle = computed(() => props.title || 'Untitled');

async function rename() {
  const title = await renameChat(props.chatId, props.title);
  if (title) emit('update', title);
}

const items = computed<DropdownMenuItem[][]>(() => [[{
  label: 'Rename',
  icon: 'i-lucide-pencil',
  onSelect: rename,
}], [{
  label: 'Delete',
  icon: 'i-lucide-trash',
  color: 'error',
  onSelect: () => deleteChat(props.chatId),
}]]);
</script>

<template>
  <UDropdownMenu :items="items" :content="{ align: 'end' }" :ui="{ content: 'min-w-44' }">
    <UButton
      color="neutral"
      variant="ghost"
      trailing-icon="i-lucide-chevron-down"
      :label="displayTitle"
      :class="['group min-w-0 max-w-3xs data-[state=open]:bg-elevated', { 'text-muted': !title }]"
      :ui="{ trailingIcon: 'text-dimmed shrink-0 group-data-[state=open]:rotate-180 transition-transform duration-200' }"
    />
  </UDropdownMenu>
</template>
