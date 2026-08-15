<script setup lang="ts">
import { useClipboard } from '@vueuse/core';

const props = defineProps<{ language?: string }>();
const root = ref<HTMLElement>();
const collapsed = ref(false);
const wrap = ref(false);
const { copy: copyToClipboard, copied } = useClipboard();

const language = computed(() => {
  const value = props.language?.trim();
  if (!value) return '代码';

  const names: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    jsx: 'JSX',
    tsx: 'TSX',
    json: 'JSON',
    html: 'HTML',
    css: 'CSS',
    sql: 'SQL',
  };

  if (names[value.toLowerCase()]) return names[value.toLowerCase()];

  return value.replace(/(^|[-_])\w/g, (match) => match.at(-1)?.toUpperCase() ?? '');
});

function copy() {
  const code = root.value?.querySelector('code')?.textContent;
  if (code) copyToClipboard(code);
}
</script>

<template>
  <section ref="root" class="chat-code-block" :class="{ 'is-wrapped': wrap }">
    <header class="chat-code-block__toolbar">
      <UButton
        :icon="collapsed ? 'i-lucide-chevron-right' : 'i-lucide-chevron-down'"
        label="代码块"
        color="neutral"
        variant="ghost"
        size="sm"
        class="chat-code-block__collapse"
        :aria-expanded="!collapsed"
        @click="collapsed = !collapsed"
      />

      <div class="chat-code-block__actions">
        <UButton :label="language" icon="i-lucide-chevron-down" trailing color="neutral" variant="ghost" size="sm" disabled />
        <span class="chat-code-block__divider" aria-hidden="true" />
        <UButton :label="wrap ? '已换行' : '自动换行'" icon="i-lucide-wrap-text" color="neutral" variant="ghost" size="sm" @click="wrap = !wrap" />
        <span class="chat-code-block__divider" aria-hidden="true" />
        <UButton :label="copied ? '已复制' : '复制'" :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'" color="neutral" variant="ghost" size="sm" @click="copy" />
      </div>
    </header>

    <pre v-show="!collapsed" v-bind="$attrs"><slot /></pre>
  </section>
</template>
