<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useChatsStore } from '~/stores/chats';
import { useTuningStore } from '~/stores/tuning';

const route = useRoute();
const chatsStore = useChatsStore();
const tuningStore = useTuningStore();
const { chats } = storeToRefs(chatsStore);
const { tasks, layerFilter, machineFilter, statusFilter } =
  storeToRefs(tuningStore);
const onTasks = computed(() => route.path === '/tasks');
const machines = computed(() => [
  ...new Set(tasks.value.map(({ machine }) => machine)),
]);
const layers = computed(() => [
  ...new Set(tasks.value.map(({ layer }) => layer)),
]);

watch(
  () => route.path,
  () => {
    chatsStore.refresh().catch(() => {});
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex h-dvh min-h-0 bg-[#f4f8f8] font-sans text-[#182735]">
    <!-- 侧栏根据当前页面切换任务筛选或最近对话。 -->
    <aside
      class="flex h-full w-16 shrink-0 flex-col border-r border-[#dfe9eb] bg-white px-2 py-4 md:w-[264px] md:px-4"
    >
      <RouterLink
        to="/tasks"
        class="mb-7 flex items-center justify-center gap-3 text-[22px] font-bold tracking-tight md:justify-start md:px-3"
        aria-label="调机助手，任务总览"
      >
        <span class="brand-mark" aria-hidden="true"
          ><i v-for="index in 9" :key="index" /></span
        ><span class="hidden whitespace-nowrap md:inline">调机助手</span>
      </RouterLink>

      <nav class="grid gap-1" aria-label="主导航">
        <RouterLink
          to="/tasks"
          class="nav-link"
          :class="{ 'nav-active': onTasks }"
          ><UIcon
            name="i-lucide-clipboard-list"
            class="size-[19px] shrink-0"
          /><span class="hidden md:inline">任务总览</span></RouterLink
        >
        <RouterLink to="/" class="nav-link" :class="{ 'nav-active': !onTasks }"
          ><UIcon
            name="i-lucide-message-square-text"
            class="size-[19px] shrink-0"
          /><span class="hidden md:inline">对话分析</span></RouterLink
        >
      </nav>

      <template v-if="onTasks">
        <!-- 筛选条件在 Pinia 中保存，返回任务页时仍可用。 -->
        <div class="my-6 hidden border-t border-[#dfe9eb] md:block" />
        <div class="mb-5 hidden items-center gap-2 font-semibold md:flex">
          <UIcon name="i-lucide-filter" class="size-4" />筛选任务
        </div>
        <div class="hidden space-y-4 md:block">
          <label class="filter-field"
            >Layer<select v-model="layerFilter">
              <option value="">全部 Layer</option>
              <option v-for="layer in layers" :key="layer" :value="layer">
                {{ layer }}
              </option>
            </select></label
          >
          <label class="filter-field"
            >机台<select v-model="machineFilter">
              <option value="">全部机台</option>
              <option
                v-for="machine in machines"
                :key="machine"
                :value="machine"
              >
                {{ machine }}
              </option>
            </select></label
          >
          <label class="filter-field"
            >状态<select v-model="statusFilter">
              <option value="">全部状态</option>
              <option
                v-for="status in ['待分析', '分析中', '待复核', '已完成']"
                :key="status"
              >
                {{ status }}
              </option>
            </select></label
          >
        </div>
      </template>
      <template v-else>
        <RouterLink
          to="/"
          class="mt-6 hidden h-11 items-center justify-center gap-2 rounded-md bg-[#087e80] font-semibold text-white shadow-sm transition duration-200 hover:bg-[#066d70] hover:shadow-md md:flex"
          ><UIcon name="i-lucide-plus" class="size-5" />新对话</RouterLink
        >
        <div class="mt-6 mb-2 hidden text-xs text-[#647586] md:block">
          最近对话
        </div>
        <div class="hidden min-h-0 overflow-y-auto md:block">
          <RouterLink
            to="/analysis-demo"
            class="recent-link"
            :class="{ 'recent-active': route.path === '/analysis-demo' }"
            ><span class="truncate font-semibold">ETCH-07 CD 波动分析</span
            ><span class="text-[11px] text-[#647586]">演示</span
            ><small>机台 ETCH-07 · Chamber B</small></RouterLink
          >
          <RouterLink
            v-for="chat in chats"
            :key="chat.id"
            :to="`/chat/${chat.id}`"
            class="recent-link"
            :class="{ 'recent-active': route.path === `/chat/${chat.id}` }"
            ><span class="truncate font-semibold">{{
              chat.title || '新对话'
            }}</span
            ><span class="text-[11px] text-[#647586]">{{
              new Date(chat.createdAt).toLocaleDateString('zh-CN', {
                month: 'numeric',
                day: 'numeric',
              })
            }}</span></RouterLink
          >
        </div>
      </template>

      <div
        class="mt-auto hidden border-t border-[#dfe9eb] pt-3 text-sm text-[#647586] md:block"
      >
        <div class="flex items-center gap-2 px-2 py-2 opacity-60">
          <UIcon name="i-lucide-circle-help" />帮助中心
        </div>
        <div class="flex items-center gap-2 px-2 py-2 opacity-60">
          <UIcon name="i-lucide-settings" />系统设置
        </div>
        <small class="block px-2 pt-2 text-[11px] text-[#98a8b4]"
          >演示工作台 · 设备数据未接入</small
        >
      </div>
    </aside>

    <!-- 主区域由各页面管理滚动，不让输入框随内容滑走。 -->
    <main
      class="min-w-0 flex-1 overflow-hidden bg-[radial-gradient(circle_at_65%_0%,#fff_0%,#f4f8f8_55%,#f5f9fa_100%)]"
    >
      <RouterView :key="route.path" />
    </main>
  </div>
</template>

<style scoped>
.brand-mark {
  display: grid;
  grid-template-columns: repeat(3, 8px);
  gap: 4px;
  width: 36px;
  height: 36px;
  place-content: center;
  flex: none;
}
.brand-mark i {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: #0b8386;
}
.brand-mark i:nth-child(2),
.brand-mark i:nth-child(6) {
  background: #63b6b7;
}
.nav-link {
  position: relative;
  display: flex;
  height: 46px;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 7px;
  color: #344556;
  font-weight: 600;
  transition:
    background 0.2s,
    color 0.2s;
}
.nav-link:hover,
.nav-active {
  background: #eaf8f9;
  color: #075f65;
}
.nav-active::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 4px;
  bottom: 4px;
  width: 3px;
  border-radius: 0 4px 4px 0;
  background: #087e80;
}
.filter-field {
  display: grid;
  gap: 8px;
  color: #435365;
  font-size: 13px;
}
.filter-field select {
  height: 40px;
  width: 100%;
  border: 1px solid #d6e3e7;
  border-radius: 6px;
  background: #fff;
  padding: 0 10px;
  color: #45566a;
}
.recent-link {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px;
  border-radius: 6px;
  padding: 11px 8px;
  font-size: 12px;
  transition: background 0.2s;
}
.recent-link:hover,
.recent-active {
  background: #eaf8f9;
}
.recent-link small {
  grid-column: 1 / -1;
  color: #647586;
}
@media (min-width: 768px) {
  .nav-link {
    justify-content: flex-start;
    padding: 0 14px;
  }
}
</style>
