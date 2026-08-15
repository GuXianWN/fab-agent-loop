<script setup lang="ts">
const { model, models } = useModels();
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
