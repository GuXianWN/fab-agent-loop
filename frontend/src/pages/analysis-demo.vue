<script setup lang="ts">
import CdTrendChart from '~/components/tuning/CdTrendChart.vue';
import { analysisTrace, analysisTrend } from '~/data/analysis-demo';

const api = useApi();
const router = useRouter();
const toast = useToast();
const traceOpen = ref(true);
const input = ref('');
const loading = ref(false);
const evidence = ref<'metrology' | 'recipe' | 'log' | null>(null);
const evidenceDetails = {
  metrology: {
    title: '量测数据 · 演示',
    lines: analysisTrend.map(
      ({ date, valueNm }) => `${date}　CD ${valueNm.toFixed(1)} nm`,
    ),
  },
  recipe: {
    title: 'Recipe 记录 · 演示',
    lines: [
      '04-20 起，RF Power 从 600 W 调整为 650 W。',
      '这与 CD 上升的时间接近，不能仅凭时间相关性确认根因。',
    ],
  },
  log: {
    title: '设备日志 · 演示',
    lines: ['示例记录中未见明显异常告警。', '没有接入实际设备日志或维护记录。'],
  },
};

async function continueChat() {
  const question = input.value.trim();
  if (!question || loading.value) return;
  loading.value = true;
  try {
    const context = `以下是界面演示数据，不是实时设备记录。ETCH-07 Chamber B，Logic 28nm，Recipe RCP_M3_001。04-17 至 04-23 的 CD（nm）依次为 ${analysisTrend.map(({ valueNm }) => valueNm).join('、')}，目标范围 31–33 nm。示例 Recipe 记录称 04-20 起 RF Power 由 600 W 调至 650 W；示例设备日志未见明显异常告警。请只根据这些给定信息分析，明确不确定性，不要声称已查询真实设备。`;
    const chat = await api.createChat({ input: `${question}\n\n${context}` });
    await router.push(`/chat/${chat.id}`);
  } catch (error) {
    toast.add({
      title: '无法开始对话',
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
  <div class="flex h-full min-h-0 flex-col gap-3 p-3 md:p-5">
    <!-- 顶部设备信息与演示数据标识 -->
    <header
      class="panel flex min-h-[58px] shrink-0 flex-wrap items-center gap-3 px-4 py-2"
    >
      <UIcon name="i-lucide-cpu" class="size-6 shrink-0 text-[#087e80]" />
      <h1 class="text-lg font-semibold">ETCH-07 · Chamber B</h1>
      <span class="context-chip">Logic 28nm</span
      ><span class="context-chip">RCP_M3_001</span
      ><span class="context-chip">近 7 天</span
      ><span
        class="ml-auto rounded-md bg-[#fff6e6] px-2 py-1 text-xs text-[#a16b16]"
        >演示数据</span
      >
    </header>

    <div class="min-h-0 flex-1 overflow-y-auto pr-1">
      <div class="mb-3 flex items-center justify-end gap-3">
        <time class="text-xs text-[#647586]">10:24</time>
        <div class="max-w-[75%] rounded-xl bg-[#e7f3f5] px-4 py-3 text-sm">
          Chamber B 最近 CD 持续上升，帮我核对可能原因。
        </div>
      </div>

      <!-- 七个步骤是用户可见的演示摘要，不展示模型内部推理。 -->
      <section class="panel overflow-hidden border-t-[3px] border-t-[#168c8b]">
        <button
          type="button"
          class="flex h-[50px] w-full items-center gap-2 px-4 text-left transition-colors hover:bg-[#f8fcfc]"
          :aria-expanded="traceOpen"
          @click="traceOpen = !traceOpen"
        >
          <UIcon
            :name="
              traceOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'
            "
            class="size-4"
          /><UIcon
            name="i-lucide-activity"
            class="size-5 text-[#087e80]"
          /><strong>分析轨迹</strong
          ><span class="ml-auto text-xs text-[#647586]"
            >{{ analysisTrace.length }} 项 · 演示流程</span
          >
        </button>
        <Transition name="trace"
          ><div
            v-if="traceOpen"
            class="mx-3 mb-3 overflow-hidden rounded-md border border-[#dfe9eb]"
          >
            <div
              v-for="(item, index) in analysisTrace"
              :key="index"
              class="trace-row grid min-h-[54px] grid-cols-[26px_72px_minmax(0,1fr)_auto] items-center gap-2 border-b border-[#e8eef0] px-3 last:border-b-0 md:grid-cols-[26px_88px_minmax(0,1fr)_auto_16px]"
            >
              <span
                class="grid size-6 place-items-center rounded-full bg-[#eaf8f9] text-xs text-[#22787e]"
                >{{ index + 1 }}</span
              ><span
                class="rounded-md px-2 py-1 text-center text-xs"
                :class="
                  item.kind === 'think' || item.kind === 'text'
                    ? 'bg-[#f0f4f8] text-[#425469]'
                    : 'bg-[#edf8f8] text-[#1f6970]'
                "
                >{{ item.kind }}</span
              ><span class="min-w-0"
                ><strong class="block truncate text-xs">{{ item.title }}</strong
                ><small
                  class="mt-1 block truncate text-[11px] text-[#647586]"
                  >{{ item.detail }}</small
                ></span
              ><time class="text-[11px] text-[#647586]">{{ item.time }}</time
              ><UIcon
                name="i-lucide-chevron-right"
                class="hidden size-4 text-[#98a8b4] md:block"
              />
            </div></div
        ></Transition>
      </section>

      <!-- 结论、证据和图表统一来自同一组示例数据。 -->
      <section class="panel mt-3 grid gap-4 p-4 xl:grid-cols-[1.25fr_.9fr]">
        <div>
          <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold">
            <UIcon
              name="i-lucide-lightbulb"
              class="size-5 text-[#a16b16]"
            />初步判断
            <span
              class="rounded-full bg-[#fff6e6] px-2 py-1 text-xs text-[#a16b16]"
              >待核查</span
            >
          </h2>
          <p class="mb-2 font-semibold leading-relaxed">
            近期 CD 有上升趋势，RF Power 变更值得优先核对；目前无法确认根因。
          </p>
          <p class="mb-3 text-xs leading-relaxed text-[#546575]">
            演示量测显示，Chamber B 近 7 天 CD 从 30.6 nm 升至 32.9
            nm，接近目标上限。示例 Recipe 记录中，04-20 起 RF Power 从 600 W
            调整为 650
            W；示例设备日志未见明显异常告警。两者时间接近，但尚不足以判断因果关系。
          </p>
          <div class="grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              class="evidence-card"
              @click="evidence = 'metrology'"
            >
              <strong>量测数据</strong
              ><small>CD 近 7 天上升 +2.3 nm</small></button
            ><button
              type="button"
              class="evidence-card"
              @click="evidence = 'recipe'"
            >
              <strong>Recipe 记录</strong
              ><small>RF Power 600 → 650 W</small></button
            ><button
              type="button"
              class="evidence-card"
              @click="evidence = 'log'"
            >
              <strong>设备日志</strong><small>未见明显异常告警</small>
            </button>
          </div>
        </div>
        <div
          class="border-t border-[#dfe9eb] pt-3 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-4"
        >
          <strong class="text-xs">CD 趋势（Chamber B）</strong>
          <p class="mt-1 text-[11px] text-[#647586]">
            单位：nm　● CD　 ▬ 目标范围（31–33）
          </p>
          <CdTrendChart :points="analysisTrend" class="h-[210px] w-full" />
        </div>
      </section>
      <p class="mt-2 text-[11px] text-[#647586]">
        本页展示交接稿的演示案例，未查询真实量测、Recipe 或设备日志。
      </p>
    </div>

    <!-- 追问创建持久化对话，并显式传入示例数据。 -->
    <form
      class="panel flex shrink-0 items-center gap-2 p-2 md:gap-3"
      @submit.prevent="continueChat"
    >
      <span
        class="hidden whitespace-nowrap rounded-md border border-[#dfe9eb] px-3 py-2 text-sm text-[#415565] sm:inline-flex"
        >调机分析</span
      ><input
        v-model="input"
        class="min-w-0 flex-1 px-2 py-2 text-sm outline-none placeholder:text-[#9aabb8]"
        aria-label="基于演示案例追问"
        placeholder="基于这组演示数据继续追问…"
      /><UButton
        type="submit"
        class="send-button"
        icon="i-lucide-send"
        :label="loading ? '创建中' : '发送'"
        :disabled="!input.trim() || loading"
      />
    </form>
  </div>

  <Transition name="fade"
    ><div
      v-if="evidence"
      class="fixed inset-0 z-50 grid place-items-center bg-[#132b3280] p-4"
      @click.self="evidence = null"
    >
      <div class="panel w-full max-w-[430px] p-6 shadow-2xl">
        <h2 class="mb-4 text-lg font-semibold">
          {{ evidenceDetails[evidence].title }}
        </h2>
        <p
          v-for="line in evidenceDetails[evidence].lines"
          :key="line"
          class="py-1 text-sm text-[#435365]"
        >
          {{ line }}
        </p>
        <div class="mt-5 text-right">
          <UButton
            color="neutral"
            variant="outline"
            label="关闭"
            @click="evidence = null"
          />
        </div>
      </div></div
  ></Transition>
</template>

<style scoped>
.panel {
  border: 1px solid #dfe9eb;
  border-radius: 7px;
  background: #fff;
  box-shadow: 0 5px 20px rgba(25, 64, 78, 0.055);
}
.context-chip {
  border: 1px solid #dfe9eb;
  border-radius: 6px;
  padding: 7px 10px;
  color: #536476;
  font-size: 12px;
}
.evidence-card {
  min-width: 0;
  border: 1px solid #dfe9eb;
  border-radius: 5px;
  padding: 9px;
  text-align: left;
  transition:
    border-color 0.2s,
    transform 0.2s,
    box-shadow 0.2s;
}
.evidence-card:hover {
  transform: translateY(-2px);
  border-color: #8bc7cb;
  box-shadow: 0 4px 12px #087e8018;
}
.evidence-card strong,
.evidence-card small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.evidence-card strong {
  font-size: 11px;
}
.evidence-card small {
  margin-top: 4px;
  color: #647586;
  font-size: 10px;
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
.trace-enter-active,
.trace-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.trace-enter-from,
.trace-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@media (max-height: 950px) {
  .trace-row {
    min-height: 44px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .trace-enter-active,
  .trace-leave-active,
  .fade-enter-active,
  .fade-leave-active,
  .send-button,
  .evidence-card {
    transition: none;
  }
}
</style>
