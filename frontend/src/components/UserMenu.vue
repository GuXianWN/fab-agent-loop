<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
import { useColorMode } from '@vueuse/core';

defineProps<{ collapsed?: boolean }>();

const colorMode = useColorMode();
const user = ref({
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Demo User',
  username: 'demo',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
});

const items = computed<DropdownMenuItem[][]>(() => [[{
  type: 'label',
  label: user.value?.name,
  avatar: { src: user.value?.avatar, alt: user.value?.name },
}], [{
  label: 'Appearance',
  icon: 'i-lucide-sun-moon',
  children: [{
    label: 'Light',
    icon: 'i-lucide-sun',
    type: 'checkbox' as const,
    checked: colorMode.value === 'light',
    onSelect(event: Event) {
      event.preventDefault();
      colorMode.value = 'light';
    },
  }, {
    label: 'Dark',
    icon: 'i-lucide-moon',
    type: 'checkbox' as const,
    checked: colorMode.value === 'dark',
    onSelect(event: Event) {
      event.preventDefault();
      colorMode.value = 'dark';
    },
  }],
}], [{
  label: 'Log out',
  icon: 'i-lucide-log-out',
  onSelect: () => {},
}]]);
</script>

<template>
  <UDropdownMenu :items="items" :content="{ align: 'center', collisionPadding: 12 }">
    <UButton
      :label="collapsed ? undefined : (user?.name || user?.username)"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
      :avatar="{ src: user?.avatar, alt: user?.name || user?.username }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
    />
  </UDropdownMenu>
</template>
