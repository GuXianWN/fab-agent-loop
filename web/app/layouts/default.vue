<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

const route = useRoute();
const toast = useToast();
const { groups, refresh } = useChats();
const { loggedIn, refresh: refreshSession, login } = useSession();
const { renameChat, deleteChat } = useChatActions();
const sidebarOpen = ref(false);
const searchOpen = ref(false);

onMounted(async () => {
  await Promise.all([refresh(), refreshSession()]);
});

watch(loggedIn, () => {
  refresh();
  sidebarOpen.value = false;
});

const items = computed(() => groups.value.flatMap((group) => [{
  label: group.label,
  type: 'label' as const,
}, ...group.items.map((item) => ({
  ...item,
  slot: 'chat' as const,
  icon: undefined,
  class: item.label === 'Untitled' ? 'text-muted' : '',
}))]));

function getChatActions(item: { id: string; title: string | null }): DropdownMenuItem[][] {
  return [[{
    label: 'Rename',
    icon: 'i-lucide-pencil',
    onSelect: () => renameChat(item.id, item.title),
  }], [{
    label: 'Delete',
    icon: 'i-lucide-trash',
    color: 'error',
    onSelect: () => deleteChat(item.id),
  }]];
}

async function handleLogin() {
  try {
    await login();
  } catch (error) {
    toast.add({
      title: 'Login failed',
      description: error instanceof Error ? error.message : 'Please try again.',
      icon: 'i-lucide-alert-circle',
      color: 'error',
    });
  }
}
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="sidebarOpen"
      :min-size="12"
      collapsible
      resizable
      class="border-r-0 py-4"
    >
      <template #header="{ collapsed }">
        <ULink v-if="!collapsed" to="/" class="flex items-center gap-0.5">
          <UIcon name="i-logos-vue" class="h-5 w-5 shrink-0" />
          <span class="text-xl font-bold text-highlighted">Chat</span>
        </ULink>
        <UDashboardSidebarCollapse class="ms-auto" />
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :items="[{ label: 'New chat', to: '/', kbds: ['meta', 'o'], icon: 'i-lucide-circle-plus' }, { label: 'Search', icon: 'i-lucide-search', kbds: ['meta', 'k'], onSelect: () => { searchOpen = true } }]"
          :collapsed="collapsed"
          orientation="vertical"
        >
          <template #item-trailing="{ item }">
            <div v-if="item.kbds?.length" class="flex items-center gap-px opacity-0 group-hover:opacity-100 transition-opacity">
              <UKbd v-for="kbd in item.kbds" :key="kbd" :value="kbd" size="sm" variant="soft" class="bg-accented/50" />
            </div>
          </template>
        </UNavigationMenu>
        <UNavigationMenu
          v-if="!collapsed"
          :items="items"
          orientation="vertical"
          :ui="{ link: 'overflow-hidden pr-7.5', linkTrailing: 'translate-x-full group-hover:translate-x-0 group-has-data-[state=open]:translate-x-0 transition-transform ms-0 absolute inset-e-px' }"
        >
          <template #chat-trailing="{ item }">
            <UDropdownMenu :items="getChatActions(item as { id: string; title: string | null })" :content="{ align: 'end' }">
              <UButton as="div" icon="i-lucide-ellipsis" color="neutral" variant="link" size="sm" aria-label="Chat actions" tabindex="-1" @click.stop.prevent />
            </UDropdownMenu>
          </template>
        </UNavigationMenu>
      </template>

      <template #footer="{ collapsed }">
        <UserMenu v-if="loggedIn" :collapsed="collapsed" />
        <UButton v-else :label="collapsed ? '' : 'Login'" icon="i-lucide-log-in" color="neutral" variant="ghost" block @click="handleLogin" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch
      v-model:open="searchOpen"
      placeholder="Search chats..."
      :groups="[{ id: 'links', items: [{ label: 'New chat', to: '/', icon: 'i-lucide-circle-plus' }] }, ...groups]"
    />

    <div class="flex-1 flex m-4 lg:ml-0 rounded-lg ring ring-default bg-default/75 shadow min-w-0 overflow-hidden">
      <slot :key="route.path" />
    </div>
  </UDashboardGroup>
</template>
