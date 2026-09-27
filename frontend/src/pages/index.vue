<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useTuningStore } from '~/stores/tuning';

const api = useApi();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const store = useTuningStore();
const { tasks } = storeToRefs(store);
const taskId = ref(
  typeof route.query.task === 'string' ? route.query.task : '',
);
const task = computed(() => tasks.value.find(({ id }) => id === taskId.value));
const machine = ref('ETCH-07');
const chamber = ref('B');
const product = ref('Logic 28nm');
const recipe = ref('');
const input = ref('');
const loading = ref(false);
const inputElement = ref<HTMLInputElement>();
const starters = [
  {
    icon: 'i-lucide-chart-no-axes-combined',
    title: '量测趋势分析',
    detail: '核对最近 CD 波动',
    prompt: '帮我核对最近的 CD 量测趋势',
  },
  {
    icon: 'i-lucide-file-diff',
    title: 'Recipe 参数对比',
    detail: '查看调机前后差异',
    prompt: '对比调机前后的 Recipe 参数',
  },
  {
    icon: 'i-lucide-file-search',
    title: '设备日志排查',
    detail: '定位同期异常事件',
    prompt: '分析设备日志与异常事件',
  },
];

watch(
  task,
  (value) => {
    if (!value) return;
    machine.value = value.machine;
    chamber.value = value.chamber;
    product.value = value.product === '未选择' ? '' : value.product;
    recipe.value = value.recipe === '未选择' ? '' : value.recipe;
  },
  { immediate: true },
);

function chooseStarter(prompt: string) {
  input.value = prompt;
  nextTick(() => inputElement.value?.focus());
}

async function createChat() {
  const prompt = input.value.trim();
  if (!prompt || loading.value) return;
  loading.value = true;
  try {
    const context = [
      machine.value && `机台 ${machine.value}`,
      chamber.value && `Chamber ${chamber.value}`,
      product.value && `产品 ${product.value}`,
      recipe.value && `Recipe ${recipe.value}`,
    ]
      .filter(Boolean)
      .join(' · ');
    const chat = await api.createChat({
      input: context
        ? `${prompt}\n\n用户选择的设备上下文（未接入实时设备数据）：${context}`
        : prompt,
    });
    await router.push(`/chat/${chat.id}`);
  } catch (error) {
    toast.add({
      title: '创建对话失败',
      description:
        error instanceof Error ? error.message : '请确认后端服务已启动',
      color: 'error',
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex h-full min-h-0 flex-col gap-4 p-3 md:p-5">
    <!-- 顶部任务关联与新对话说明 -->
    <header
      class="panel flex min-h-[82px] shrink-0 flex-wrap items-center gap-4 p-4 md:px-6"
    >
      <UIcon name="i-lucide-cpu" class="size-7 shrink-0 text-[#087e80]" />
      <div>
        <h1 class="text-xl font-semibold">新对话</h1>
        <p class="text-xs text-[#647586]">从设备上下文开始一次调机分析</p>
      </div>
      <select
        v-model="taskId"
        aria-label="关联任务"
        class="ml-auto h-10 max-w-full rounded-md border border-[#dfe9eb] bg-white px-3 text-sm"
      >
        <option value="">关联任务（可选）</option>
        <option v-for="item in tasks" :key="item.id" :value="item.id">
          {{ item.machine }} · {{ item.title }}
        </option>
      </select>
    </header>

    <!-- 快捷入口只填入问题，设备上下文由用户确认。 -->
    <div class="min-h-0 flex-1 overflow-y-auto">
      <div
        class="mx-auto flex min-h-full w-full max-w-[970px] flex-col justify-center py-8"
      >
        <span class="hero-mark mx-auto mb-6" aria-hidden="true"
          ><i v-for="index in 36" :key="index"
        /></span>
        <h2 class="text-center text-3xl font-bold tracking-tight">
          开始调机分析
        </h2>
        <p class="mt-3 mb-8 text-center text-[#647586]">
          描述设备现象，助手会结合你提供的上下文逐步回应。
        </p>
        <div class="grid gap-4 md:grid-cols-3">
          <button
            v-for="item in starters"
            :key="item.title"
            type="button"
            class="panel flex min-h-[126px] items-center gap-4 p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-[#8cc6c9] hover:shadow-md"
            @click="chooseStarter(item.prompt)"
          >
            <span
              class="grid size-12 shrink-0 place-items-center rounded-xl bg-[#f0fafa] text-[#087e80]"
              ><UIcon :name="item.icon" class="size-6" /></span
            ><span
              ><strong class="block text-base">{{ item.title }}</strong
              ><small class="mt-1 block text-xs text-[#647586]">{{
                item.detail
              }}</small></span
            >
          </button>
        </div>
        <div class="panel mt-6 flex flex-wrap items-center gap-4 p-5">
          <UIcon
            name="i-lucide-cpu"
            class="size-6 shrink-0 text-[#087e80]"
          /><label class="context-field"
            >机台<select v-model="machine">
              <option value="">未选择</option>
              <option>ETCH-07</option>
              <option>ETCH-12</option>
              <option>DEP-03</option>
              <option>CVD-01</option>
            </select></label
          ><label class="context-field"
            >Chamber<select v-model="chamber">
              <option value="">未选择</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
            </select></label
          ><label class="context-field"
            >产品<select v-model="product">
              <option value="">未选择</option>
              <option>Logic 28nm</option>
            </select></label
          ><label class="context-field"
            >Recipe<select v-model="recipe">
              <option value="">未选择</option>
              <option>RCP_M3_001</option>
            </select></label
          >
        </div>
        <p class="mt-3 text-right text-xs text-[#647586]">
          设备上下文由你选择，尚未连接实时数据。<RouterLink
            to="/analysis-demo"
            class="font-semibold text-[#087e80] hover:underline"
            >查看完整演示分析 →</RouterLink
          >
        </p>
      </div>
    </div>

    <!-- 发送后进入已有的真实会话接口。 -->
    <form
      class="panel mx-auto flex w-full max-w-[970px] shrink-0 items-center gap-2 p-2 md:gap-3 md:p-3"
      @submit.prevent="createChat"
    >
      <span
        class="hidden whitespace-nowrap rounded-md border border-[#dfe9eb] px-3 py-2 text-sm text-[#415565] sm:inline-flex"
        >调机分析</span
      ><input
        ref="inputElement"
        v-model="input"
        class="min-w-0 flex-1 px-2 py-2 text-sm outline-none placeholder:text-[#9aabb8]"
        aria-label="输入消息"
        placeholder="输入机台、Chamber、异常现象或量测批次…"
      /><UButton
        type="submit"
        class="send-button"
        icon="i-lucide-send"
        :label="loading ? '创建中' : '发送'"
        :disabled="loading || !input.trim()"
      />
    </form>
  </div>
</template>

<style scoped>
.panel {
  border: 1px solid #dfe9eb;
  border-radius: 8px;
  background: white;
  box-shadow: 0 5px 20px rgba(25, 64, 78, 0.055);
}
.hero-mark {
  display: grid;
  grid-template-columns: repeat(6, 7px);
  gap: 3px;
  width: 71px;
  height: 71px;
  place-content: center;
  transform: rotate(-8deg);
}
.hero-mark i {
  width: 7px;
  height: 7px;
  background: #b7dee1;
}
.hero-mark i:nth-child(3n) {
  background: #66bfc2;
}
.hero-mark i:nth-child(5n) {
  background: #0f9295;
}
.context-field {
  display: grid;
  flex: 1 1 120px;
  gap: 5px;
  color: #647586;
  font-size: 12px;
}
.context-field select {
  height: 35px;
  min-width: 0;
  border: 1px solid #d5e3e7;
  border-radius: 5px;
  background: #fff;
  padding: 6px 8px;
  color: #182735;
}
.send-button {
  background: #087e80;
  color: white;
  transition:
    background 0.2s,
    transform 0.2s;
}
.send-button:hover {
  background: #066d70;
  transform: translateY(-1px);
}
@media (prefers-reduced-motion: reduce) {
  .send-button {
    transition: none;
  }
}
</style>
