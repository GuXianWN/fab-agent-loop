<script setup lang="ts">
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  MarkAreaComponent,
  MarkLineComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { CdPoint } from '~/data/analysis-demo';

echarts.use([
  LineChart,
  GridComponent,
  MarkAreaComponent,
  MarkLineComponent,
  TooltipComponent,
  CanvasRenderer,
]);

const props = defineProps<{ points: CdPoint[] }>();
const element = ref<HTMLElement>();
let chart: echarts.ECharts | undefined;
let observer: ResizeObserver | undefined;

function draw() {
  if (!element.value) return;
  chart ??= echarts.init(element.value);
  chart.setOption({
    animation: false,
    grid: { left: 38, right: 12, top: 16, bottom: 25 },
    tooltip: {
      trigger: 'axis',
      formatter: (params: unknown) => {
        const point = (
          params as Array<{ axisValue: string; value: number }>
        )[0];
        return point ? `${point.axisValue}<br/>CD ${point.value} nm` : '';
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.points.map(({ date }) => date),
      axisLine: { lineStyle: { color: '#cbdadd' } },
      axisTick: { show: false },
      axisLabel: { color: '#788b99', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      min: 28,
      max: 36,
      interval: 2,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#788b99', fontSize: 10 },
      splitLine: { lineStyle: { color: '#e7eff0' } },
    },
    series: [
      {
        type: 'line',
        data: props.points.map(({ valueNm }) => valueNm),
        smooth: false,
        symbolSize: 7,
        itemStyle: { color: '#087e80', borderColor: '#fff', borderWidth: 1 },
        lineStyle: { color: '#087e80', width: 2 },
        areaStyle: { color: 'rgba(8,126,128,.09)' },
        markArea: {
          silent: true,
          itemStyle: { color: 'rgba(8,126,128,.09)' },
          data: [[{ yAxis: 31 }, { yAxis: 33 }]],
        },
        markLine: {
          silent: true,
          symbol: 'none',
          label: { show: false },
          lineStyle: { color: '#8bbdc0', type: 'dashed', width: 1 },
          data: [{ yAxis: 32 }],
        },
      },
    ],
  });
}

onMounted(() => {
  draw();
  observer = new ResizeObserver(() => chart?.resize());
  observer.observe(element.value!);
});
watch(() => props.points, draw, { deep: true });
onBeforeUnmount(() => {
  observer?.disconnect();
  chart?.dispose();
});
</script>

<template>
  <div
    ref="element"
    class="cd-chart"
    role="img"
    aria-label="CD 量测趋势，目标范围 31 至 33 纳米"
  />
</template>
