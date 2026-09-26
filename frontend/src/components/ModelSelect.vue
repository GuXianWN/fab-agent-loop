<script setup lang="ts">
const models = [
  { label: 'DeepSeek Reasoner', value: 'deepseek-reasoner', icon: 'i-lucide-brain' },
];
const model = ref('deepseek-reasoner');
</script>

<template>
  <USelectMenu
    v-model="model"
    :items="models"
    :icon="models.find((item) => item.value === model)?.icon"
    size="sm"
    color="neutral"
    variant="ghost"
    value-key="value"
    class="data-[state=open]:bg-elevated"
    :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
  />
</template>
