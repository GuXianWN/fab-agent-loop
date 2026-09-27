import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';

export type TaskStatus = '待分析' | '分析中' | '待复核' | '已完成';

export interface TuningTask {
  id: string;
  title: string;
  machine: string;
  chamber: string;
  layer: string;
  product: string;
  recipe: string;
  status: TaskStatus;
  updatedAt: string;
  note: string;
  conversationId?: string;
}

export const demoTasks: TuningTask[] = [
  {
    id: 'etch-07',
    title: 'CD 持续上升',
    machine: 'ETCH-07',
    chamber: 'B',
    layer: 'M3',
    product: 'Logic 28nm',
    recipe: 'RCP_M3_001',
    status: '分析中',
    updatedAt: '今天 10:24',
    note: 'CD 值持续上升，接近目标上限',
  },
  {
    id: 'dep-03',
    title: '腔压异常',
    machine: 'DEP-03',
    chamber: 'A',
    layer: 'ILD',
    product: 'Logic 28nm',
    recipe: 'DEP_ILD_024',
    status: '待分析',
    updatedAt: '昨天 16:18',
    note: '腔压波动较大，超出设定范围',
  },
  {
    id: 'etch-12',
    title: '刻蚀速率异常',
    machine: 'ETCH-12',
    chamber: 'C',
    layer: 'Poly',
    product: 'Logic 28nm',
    recipe: 'RCP_POLY_012',
    status: '待复核',
    updatedAt: '昨天 11:32',
    note: '刻蚀速率下降，低于目标值',
  },
  {
    id: 'cvd-01',
    title: '膜厚不稳定',
    machine: 'CVD-01',
    chamber: 'B',
    layer: 'TEOS',
    product: 'Logic 28nm',
    recipe: 'CVD_TEOS_008',
    status: '已完成',
    updatedAt: '10-22 09:40',
    note: '膜厚 CV 偏高，稳定性不足',
  },
];

export const useTuningStore = defineStore('tuning', () => {
  const tasks = useStorage<TuningTask[]>('tuning-assistant-tasks', demoTasks);
  const selectedTaskId = ref('etch-07');
  const layerFilter = ref('');
  const machineFilter = ref('');
  const statusFilter = ref('');
  const selectedTask = computed(
    () =>
      tasks.value.find((task) => task.id === selectedTaskId.value) ??
      tasks.value[0],
  );

  function createTask(
    input: Pick<TuningTask, 'title' | 'machine' | 'chamber'>,
  ) {
    const task: TuningTask = {
      ...input,
      id: crypto.randomUUID(),
      layer: '未选择',
      product: '未选择',
      recipe: '未选择',
      status: '待分析',
      updatedAt: '刚刚',
      note: '新建的演示任务',
    };
    tasks.value = [task, ...tasks.value];
    selectedTaskId.value = task.id;
    return task;
  }

  return {
    tasks,
    selectedTaskId,
    selectedTask,
    layerFilter,
    machineFilter,
    statusFilter,
    createTask,
  };
});
