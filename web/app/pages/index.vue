<script setup lang="ts">
const api = useApi();
const { refresh } = useChats();
const { user } = useSession();
const input = ref('');
const loading = ref(false);

const greeting = computed(() => {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return user.value ? `${timeGreeting}, ${user.value.name.split(' ')[0]}` : timeGreeting;
});

const quickChats = [
  { label: 'Why use Nuxt UI?', icon: 'i-logos-nuxt-icon' },
  { label: 'Help me create a Vue composable', icon: 'i-logos-vue' },
  { label: 'Tell me more about UnJS', icon: 'i-logos-unjs' },
  { label: 'Why should I consider VueUse?', icon: 'i-logos-vueuse' },
  { label: 'Tailwind CSS best practices', icon: 'i-logos-tailwindcss-icon' },
  { label: 'What is the weather in Bordeaux?', icon: 'i-lucide-sun' },
  { label: 'Show me a chart of sales data', icon: 'i-lucide-line-chart' },
];

async function createChat(prompt: string) {
  loading.value = true;

  try {
    const text = prompt.trim();
    const chat = await api.createChat({ input: text });
    await refresh();
    await navigateTo(`/chat/${chat.id}`);
  } finally {
    loading.value = false;
  }
}

function submit() {
  if (input.value.trim()) createChat(input.value);
}
</script>

<template>
  <UDashboardPanel id="home" class="min-h-0" :ui="{ body: 'p-0 sm:p-0' }">
    <template #header><Navbar /></template>

    <template #body>
      <UContainer class="flex-1 flex flex-col justify-center gap-4 sm:gap-6 py-8">
        <h1 class="text-3xl sm:text-4xl text-highlighted font-bold">{{ greeting }}</h1>

        <UChatPrompt v-model="input" :status="loading ? 'streaming' : 'ready'" class="[view-transition-name:chat-prompt]" color="neutral" variant="subtle" :ui="{ base: 'px-1.5' }" @submit="submit">
          <template #footer>
            <ModelSelect />
            <UChatPromptSubmit color="neutral" size="sm" />
          </template>
        </UChatPrompt>

        <div class="flex flex-wrap gap-2">
          <UButton v-for="quickChat in quickChats" :key="quickChat.label" :icon="quickChat.icon" :label="quickChat.label" size="sm" color="neutral" variant="outline" class="rounded-full" @click="createChat(quickChat.label)" />
        </div>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
