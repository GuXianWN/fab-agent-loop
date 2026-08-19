<script setup lang="ts">
const input = ref('');
const greeting = ref('Good evening');

const quickChats = [
  { label: 'Why use Nuxt UI?', icon: 'i-logos-nuxt-icon' },
  { label: 'Help me create a Vue composable', icon: 'i-logos-vue' },
  { label: 'Tell me more about UnJS', icon: 'i-logos-unjs' },
  { label: 'Why should I consider VueUse?', icon: 'i-logos-vueuse' },
  { label: 'Tailwind CSS best practices', icon: 'i-logos-tailwindcss-icon' },
  { label: 'What is the weather in Bordeaux?', icon: 'i-lucide-sun' },
  { label: 'Show me a chart of sales data', icon: 'i-lucide-line-chart' },
];
</script>

<template>
  <UDashboardPanel id="home" class="min-h-0" :ui="{ body: 'p-0 sm:p-0' }">
    <template #header><Navbar /></template>

    <template #body>
      <UContainer class="flex-1 flex flex-col justify-center gap-4 sm:gap-6 py-8">
        <h1 class="text-3xl sm:text-4xl text-highlighted font-bold">{{ greeting }}</h1>

        <UChatPrompt v-model="input" status="ready" class="[view-transition-name:chat-prompt]" color="neutral" variant="subtle" :ui="{ base: 'px-1.5' }">
          <template #footer>
            <ModelSelect />
            <UChatPromptSubmit color="neutral" size="sm" />
          </template>
        </UChatPrompt>

        <div class="flex flex-wrap gap-2">
          <UButton v-for="quickChat in quickChats" :key="quickChat.label" :icon="quickChat.icon" :label="quickChat.label" size="sm" color="neutral" variant="outline" class="rounded-full" />
        </div>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
