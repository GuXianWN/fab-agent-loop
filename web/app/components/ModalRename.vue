<script setup lang="ts">
const props = defineProps<{ title?: string }>();
const emit = defineEmits<{ close: [string | false] }>();
const value = ref(props.title ?? '');
const trimmed = computed(() => value.value.trim());

function submit() {
  if (trimmed.value) emit('close', trimmed.value);
}
</script>

<template>
  <UModal
    title="Rename chat"
    description="Choose a new title for this chat."
    :close="false"
    :ui="{ footer: 'flex-row-reverse justify-start' }"
  >
    <template #body>
      <UInput
        v-model="value"
        autofocus
        size="lg"
        placeholder="Chat title"
        :ui="{ root: 'w-full' }"
        @keydown.enter.prevent="submit"
      />
    </template>

    <template #footer>
      <UButton label="Save" :disabled="!trimmed" @click="submit" />
      <UButton color="neutral" variant="ghost" label="Cancel" @click="emit('close', false)" />
    </template>
  </UModal>
</template>
