<script setup lang="ts">
import { storeToRefs } from 'pinia';
import CdTrendChart from '~/components/tuning/CdTrendChart.vue';
import { taskTrend } from '~/data/analysis-demo';
import { demoTasks, useTuningStore, type TaskStatus } from '~/stores/tuning';

const router = useRouter();
const store = useTuningStore();
const {
  tasks,
  selectedTask,
  selectedTaskId,
  layerFilter,
  machineFilter,
  statusFilter,
} = storeToRefs(store);
const visibleTasks = computed(() =>
  tasks.value.filter(
    (task) =>
      (!layerFilter.value || task.layer === layerFilter.value) &&
      (!machineFilter.value || task.machine === machineFilter.value) &&
      (!statusFilter.value || task.status === statusFilter.value),
  ),
);
const creating = ref(false);
const form = reactive({ title: '', machine: '', chamber: '' });
const demoIds = new Set(demoTasks.map(({ id }) => id));
const summary: { label: TaskStatus; baseline: number; icon: string }[] = [
  { label: '待分析', baseline: 6, icon: 'i-lucide-file-text' },
  { label: '分析中', baseline: 3, icon: 'i-lucide-clock-3' },
  { label: '待复核', baseline: 2, icon: 'i-lucide-user-round-check' },
  { label: '已完成', baseline: 18, icon: 'i-lucide-circle-check' },
];
const statusCards = computed(() =>
  summary.map((item) => ({
    ...item,
    count: String(
      item.baseline +
        tasks.value.filter(
          ({ id, status }) => !demoIds.has(id) && status === item.label,
        ).length,
    ).padStart(2, '0'),
  })),
);
const statusClasses: Record<TaskStatus, string> = {
  待分析: 'bg-[#edf6ff] text-[#24719d]',
  分析中: 'bg-[#eaf8f8] text-[#087779]',
  待复核: 'bg-[#fff6e6] text-[#a16b16]',
  已完成: 'bg-[#ecf9f2] text-[#18865b]',
};

function openTask(id: string) {
  router.push(
    id === 'etch-07' ? '/analysis-demo' : { path: '/', query: { task: id } },
  );
}

function createTask() {
  if (!form.title.trim() || !form.machine.trim() || !form.chamber.trim())
    return;
  const task = store.createTask({
    title: form.title.trim(),
    machine: form.machine.trim(),
    chamber: form.chamber.trim(),
  });
  creating.value = false;
  Object.assign(form, { title: '', machine: '', chamber: '' });
  router.push({ path: '/', query: { task: task.id } });
}
</script>

<template>
  <div class="h-full overflow-y-auto p-3 md:p-5">
    <div class="mx-auto max-w-[1600px] space-y-4">
      <!-- 标题、任务统计与筛选入口 -->
      <header
        class="panel relative flex min-h-[100px] flex-wrap items-center justify-between gap-4 overflow-hidden p-5"
      >
        <div class="relative z-10">
          <h1 class="text-[28px] font-bold tracking-tight">调机任务总览</h1>
          <p class="mt-1 text-[#647586]">设备异常 · 分析进度 · 工程师复核</p>
        </div>
        <svg
          class="pointer-events-none absolute top-2 right-40 hidden h-20 w-[300px] text-[#d5e7ec] lg:block"
          viewBox="0 0 300 83"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 55h58l33-30h56l22-17h107M42 73h61l35-29h78l23-22h57"
            stroke="currentColor"
            stroke-width="1.3"
          />
          <circle cx="4" cy="55" r="4" stroke="currentColor" />
          <circle cx="280" cy="8" r="4" stroke="currentColor" />
        </svg>
        <UButton
          class="primary-button relative z-10"
          icon="i-lucide-plus"
          label="创建调机任务"
          @click="creating = true"
        />
      </header>

      <section
        class="panel grid grid-cols-2 overflow-hidden lg:grid-cols-4"
        aria-label="演示任务统计"
      >
        <button
          v-for="(item, index) in statusCards"
          :key="item.label"
          type="button"
          class="flex min-h-[88px] items-center gap-4 border-[#dfe9eb] p-4 text-left transition duration-200 hover:bg-[#f5fbfb] lg:min-h-[100px]"
          :class="[
            {
              'bg-[#f5fbfb]': statusFilter === item.label,
              'border-r': index !== 3,
            },
            index < 2 ? 'max-lg:border-b' : '',
          ]"
          @click="statusFilter = statusFilter === item.label ? '' : item.label"
        >
          <span
            class="grid size-11 shrink-0 place-items-center rounded-full"
            :class="statusClasses[item.label]"
            ><UIcon :name="item.icon" class="size-5" /></span
          ><span class="text-[#465767]"
            >{{ item.label
            }}<strong class="mt-1 block text-3xl leading-none text-[#182735]">{{
              item.count
            }}</strong></span
          >
        </button>
      </section>

      <!-- 最近任务与当前任务共享选中项；窄屏时详情下移。 -->
      <div
        class="grid gap-4 min-[1380px]:grid-cols-[minmax(0,1.75fr)_minmax(350px,1fr)]"
      >
        <section class="panel min-w-0 overflow-hidden">
          <div class="panel-heading">
            <strong><UIcon name="i-lucide-clipboard-list" />最近任务</strong
            ><button
              type="button"
              class="link-button"
              @click="
                layerFilter = '';
                machineFilter = '';
                statusFilter = '';
              "
            >
              查看全部任务 <UIcon name="i-lucide-arrow-right" />
            </button>
          </div>
          <div class="overflow-x-auto">
            <table
              class="w-full min-w-[690px] border-collapse text-left text-[13px]"
            >
              <thead>
                <tr class="h-12 text-[#516272]">
                  <th class="px-3 font-medium">任务</th>
                  <th class="px-3 font-medium">设备 / Chamber</th>
                  <th class="px-3 font-medium">阶段</th>
                  <th class="px-3 font-medium">更新时间</th>
                  <th class="px-3 font-medium">进入会话</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="task in visibleTasks"
                  :key="task.id"
                  class="h-[88px] cursor-pointer border-t border-[#dfe9eb] transition-colors hover:bg-[#f8fcfc]"
                  :class="{
                    'bg-[#effbfb] shadow-[inset_3px_0_#087e80]':
                      selectedTaskId === task.id,
                  }"
                  @click="selectedTaskId = task.id"
                >
                  <td class="px-3">
                    <strong class="block font-semibold">{{ task.title }}</strong
                    ><small class="mt-1 block text-[11px] text-[#647586]">{{
                      task.note
                    }}</small>
                  </td>
                  <td class="px-3">
                    {{ task.machine }} · Chamber {{ task.chamber
                    }}<small class="mt-1 block text-[11px] text-[#647586]"
                      >Layer: {{ task.layer }} ｜ {{ task.product }}</small
                    >
                  </td>
                  <td class="px-3">
                    <span class="badge" :class="statusClasses[task.status]">{{
                      task.status
                    }}</span>
                  </td>
                  <td class="px-3 whitespace-nowrap">{{ task.updatedAt }}</td>
                  <td class="px-3">
                    <button
                      type="button"
                      class="link-button"
                      @click.stop="openTask(task.id)"
                    >
                      {{ task.status === '已完成' ? '查看结果' : '打开对话' }}
                      <UIcon name="i-lucide-arrow-right" />
                    </button>
                  </td>
                </tr>
                <tr v-if="!visibleTasks.length">
                  <td colspan="5" class="h-32 text-center text-[#647586]">
                    没有符合筛选条件的任务
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-if="selectedTask" class="panel min-w-0">
          <div class="panel-heading">
            <strong><UIcon name="i-lucide-clipboard-list" />当前任务</strong
            ><button
              type="button"
              class="link-button"
              @click="openTask(selectedTask.id)"
            >
              查看任务详情 <UIcon name="i-lucide-arrow-right" />
            </button>
          </div>
          <div class="p-5">
            <h2 class="mb-4 text-[21px] font-semibold">
              {{ selectedTask.machine }} · {{ selectedTask.title }}
            </h2>
            <div
              class="grid grid-cols-2 gap-4 border-b border-[#dfe9eb] pb-4 text-sm"
            >
              <div>
                <small class="field-label">产品</small
                >{{ selectedTask.product }}
              </div>
              <div>
                <small class="field-label">Recipe</small
                >{{ selectedTask.recipe }}
              </div>
              <div>
                <small class="field-label">当前阶段</small
                ><span
                  class="badge"
                  :class="statusClasses[selectedTask.status]"
                  >{{ selectedTask.status }}</span
                >
              </div>
              <div>
                <small class="field-label">关联会话</small
                >{{ selectedTask.id === 'etch-07' ? '1 条演示' : '待关联' }}
              </div>
            </div>
            <div class="mt-4">
              <div class="flex justify-between gap-2 text-sm font-semibold">
                <span>近 7 天量测趋势</span
                ><span class="text-xs font-normal text-[#647586]"
                  >演示数据 · CD (nm)</span
                >
              </div>
              <CdTrendChart
                v-if="selectedTask.id === 'etch-07'"
                :points="taskTrend"
                class="h-[210px] w-full"
              />
              <div
                v-else
                class="grid h-[210px] place-items-center text-[#647586]"
              >
                暂无关联的量测数据
              </div>
            </div>
            <UButton
              block
              class="primary-button mt-3"
              icon="i-lucide-message-square-text"
              label="继续对话"
              @click="openTask(selectedTask.id)"
            />
          </div>
        </section>
      </div>

      <!-- 动态是交接稿的示例记录。 -->
      <section class="panel">
        <div class="panel-heading">
          <strong><UIcon name="i-lucide-clock-3" />最近动态</strong
          ><span class="text-xs text-[#647586]">演示记录</span>
        </div>
        <div
          class="flex flex-wrap items-center gap-3 border-b border-[#dfe9eb] px-5 py-3 text-xs"
        >
          <span class="text-[#647586]">今天 10:24</span
          ><span class="size-2 rounded-full bg-[#087e80]" /><strong
            >ETCH-07 · CD 持续上升</strong
          ><span>进入分析阶段</span
          ><span class="text-[#647586]">已加载演示量测数据</span>
        </div>
        <div class="flex flex-wrap items-center gap-3 px-5 py-3 text-xs">
          <span class="text-[#647586]">昨天 16:18</span
          ><span class="size-2 rounded-full bg-[#087e80]" /><strong
            >DEP-03 · 腔压异常</strong
          ><span>创建了新任务</span>
        </div>
      </section>
    </div>
  </div>

  <!-- 创建弹窗提供轻量过渡，任务仅保存在本机浏览器。 -->
  <Transition name="fade"
    ><div
      v-if="creating"
      class="fixed inset-0 z-50 grid place-items-center bg-[#132b3280] p-4"
      @click.self="creating = false"
    >
      <form
        class="panel w-full max-w-[430px] p-6 shadow-2xl"
        @submit.prevent="createTask"
      >
        <h2 class="text-xl font-semibold">创建调机任务</h2>
        <p class="mt-2 text-xs text-[#647586]">
          任务将保存在本机浏览器中，设备数据尚未接入。
        </p>
        <label class="modal-field"
          >任务名称<input
            v-model="form.title"
            required
            placeholder="例如：CD 持续上升" /></label
        ><label class="modal-field"
          >机台<input
            v-model="form.machine"
            required
            placeholder="例如：ETCH-07" /></label
        ><label class="modal-field"
          >Chamber<input v-model="form.chamber" required placeholder="例如：B"
        /></label>
        <div class="mt-5 flex justify-end gap-2">
          <UButton
            color="neutral"
            variant="outline"
            label="取消"
            @click="creating = false"
          /><UButton
            type="submit"
            class="primary-button"
            label="创建并开始对话"
          />
        </div>
      </form></div
  ></Transition>
</template>

<style scoped>
.panel {
  border: 1px solid #dfe9eb;
  border-radius: 7px;
  background: #fff;
  box-shadow: 0 5px 20px rgba(25, 64, 78, 0.055);
}
.panel-heading {
  display: flex;
  min-height: 52px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid #dfe9eb;
  padding: 12px 18px;
}
.panel-heading strong {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
}
.panel-heading svg {
  width: 17px;
  height: 17px;
}
.primary-button {
  background: #087e80;
  color: white;
  transition:
    background 0.2s,
    transform 0.2s,
    box-shadow 0.2s;
}
.primary-button:hover {
  background: #066d70;
  transform: translateY(-1px);
  box-shadow: 0 5px 12px #087e8030;
}
.link-button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  color: #04767a;
  font-weight: 650;
  transition: color 0.2s;
}
.link-button:hover {
  color: #044c50;
  text-decoration: underline;
}
.link-button svg {
  width: 15px;
  height: 15px;
}
.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 650;
}
.field-label {
  display: block;
  margin-bottom: 6px;
  color: #647586;
}
.modal-field {
  display: grid;
  gap: 7px;
  margin-top: 15px;
  color: #435365;
  font-size: 13px;
}
.modal-field input {
  height: 40px;
  border: 1px solid #dfe9eb;
  border-radius: 5px;
  padding: 8px 10px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .primary-button,
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>
