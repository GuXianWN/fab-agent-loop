export interface CdPoint {
  date: string;
  valueNm: number;
}

export const taskTrend: CdPoint[] = [
  { date: '10-16', valueNm: 30.4 },
  { date: '10-17', valueNm: 30.7 },
  { date: '10-18', valueNm: 30.9 },
  { date: '10-19', valueNm: 31.2 },
  { date: '10-20', valueNm: 31.6 },
  { date: '10-21', valueNm: 32.1 },
  { date: '10-22', valueNm: 32.7 },
];

export const analysisTrend: CdPoint[] = [
  { date: '04-17', valueNm: 30.6 },
  { date: '04-18', valueNm: 30.5 },
  { date: '04-19', valueNm: 30.7 },
  { date: '04-20', valueNm: 31.2 },
  { date: '04-21', valueNm: 31.8 },
  { date: '04-22', valueNm: 32.4 },
  { date: '04-23', valueNm: 32.9 },
];

export const analysisTrace = [
  {
    kind: 'think',
    title: '先核对量测趋势与设备上下文',
    detail: '梳理问题背景，明确分析范围与关键数据。',
    time: '10:24:19',
  },
  {
    kind: 'skill',
    title: '工艺调机分析 · 加载指引',
    detail: '基于 28nm 刻蚀工艺的 CD 异常分析思路。',
    time: '10:24:21',
  },
  {
    kind: 'tool',
    title: 'query_metrology · 获取 CD 量测',
    detail: '查询最近 7 天 Chamber B 的 CD 量测数据。',
    time: '10:24:28',
  },
  {
    kind: 'text',
    title: 'CD 呈上升趋势，继续核对参数',
    detail: '量测数据提示 CD 持续上升，进一步对比 Recipe 与设备日志。',
    time: '10:24:35',
  },
  {
    kind: 'tool',
    title: 'query_recipe · 对比 Recipe 参数',
    detail: '获取当前及历史 Recipe，识别关键参数变更。',
    time: '10:24:41',
  },
  {
    kind: 'tool',
    title: 'query_equipment_log · 检查设备日志',
    detail: '检查近期设备日志，查看异常与维护记录。',
    time: '10:24:48',
  },
  {
    kind: 'think',
    title: '交叉验证数据来源',
    detail: '综合量测、Recipe 与设备日志，给出初步判断。',
    time: '10:24:56',
  },
] as const;
