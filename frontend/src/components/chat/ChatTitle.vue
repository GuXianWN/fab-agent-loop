<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

const props = defineProps<{ chatId: string; title?: string | null }>();
const emit = defineEmits<{ update: [title: string | null] }>();
const displayTitle = computed(() => props.title || 'Untitled');

const items = computed<DropdownMenuItem[][]>(() => [[{
  label: 'Rename',
  icon: 'i-lucide-pencil',
  onSelect: () => emit('update', prompt('New title', props.title ?? '')),
}], [{
  label: 'Delete',
  icon: 'i-lucide-trash',
  color: 'error',
  onSelect: () => {},
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
