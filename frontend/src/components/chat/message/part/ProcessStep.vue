<script setup lang="ts">
import { useId } from 'vue';

defineProps<{
  icon: string;
  title: string;
  description?: string;
  status: 'running' | 'complete' | 'error' | 'waiting' | 'denied';
}>();

const open = ref(false);
const detailsId = useId();
const states = {
  running: { label: '进行中', icon: 'i-lucide-loader-circle' },
  complete: { label: '已完成', icon: 'i-lucide-check' },
  error: { label: '失败', icon: 'i-lucide-circle-alert' },
  waiting: { label: '等待确认', icon: 'i-lucide-clock-3' },
  denied: { label: '已拒绝', icon: 'i-lucide-circle-slash' },
};
</script>

<template>
  <div class="min-w-0">
    <div class="flex items-center gap-3 py-3">
      <span class="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border border-default bg-default text-muted">
        <UIcon :name="icon" class="size-4" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium text-default">{{ title }}</p>
        <p v-if="description" class="mt-0.5 truncate text-xs leading-5 text-muted">{{ description }}</p>
      </div>
      <UButton
        v-if="$slots.default"
        color="neutral"
        variant="ghost"
        size="xs"
        :label="open ? '收起' : '详情'"
        :trailing-icon="open ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
        :aria-label="`${open ? '收起' : '查看'}${title}详情`"
        :aria-expanded="open"
        :aria-controls="detailsId"
        @click="open = !open"
      />
      <span class="flex shrink-0 items-center gap-1.5 text-xs" :class="status === 'error' ? 'text-error' : 'text-muted'">
        <UIcon :name="states[status].icon" class="size-3.5" :class="{ 'animate-spin': status === 'running' }" />
        <span class="hidden sm:inline">{{ states[status].label }}</span>
        <span class="sr-only sm:hidden">{{ states[status].label }}</span>
      </span>
    </div>
    <UCollapsible v-if="$slots.default" :open="open">
      <template #content>
        <div :id="detailsId" class="pb-4 pl-10 text-sm text-muted">
          <slot />
        </div>
      </template>
    </UCollapsible>
  </div>
</template>
