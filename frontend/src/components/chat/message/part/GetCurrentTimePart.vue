<script setup lang="ts">
const props = defineProps<{ output: unknown }>();
const time = computed(() => {
  const output = props.output;
  return typeof output === 'object' && output !== null
    && 'timeZone' in output && output.timeZone === 'Asia/Shanghai'
    && 'dateTime' in output && typeof output.dateTime === 'string' && output.dateTime.trim()
    ? `${output.dateTime}（北京时间）`
    : null;
});
</script>

<template>
  <p :class="time ? 'text-muted' : 'text-error'" class="text-sm">{{ time ?? '时间工具返回的数据无效' }}</p>
</template>
