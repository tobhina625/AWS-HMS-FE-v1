<script setup lang="ts">
  import { computed } from 'vue';
  import VueApexCharts from 'vue3-apexcharts';

  const props = defineProps<{
    data?: any;
    loading?: boolean;
  }>();

  const getCssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const moduleStatus = computed(() => {
    const status = props.data?.moduleStatus ?? props.data?.ModuleStatus ?? {};
    return {
      active: status.active ?? status.Active ?? 0,
      inactive: status.inactive ?? status.Inactive ?? 0,
    };
  });

  const chartData = computed(() => {
    const status = moduleStatus.value;
    const active = status.active;
    const inactive = status.inactive;
    const total = active + inactive;
    if (total === 0) return { series: [0, 0], labels: ['Active', 'Inactive'] };
    return {
      series: [active, inactive],
      labels: ['Active', 'Inactive'],
    };
  });

  const apexOptions = computed(() => ({
    chart: { type: 'donut' as const, width: 280 },
    colors: [getCssVar('--color-success-light'), getCssVar('--color-danger-light')],
    labels: chartData.value.labels,
    legend: { show: false },
    plotOptions: {
      pie: {
        donut: { size: '65%', background: 'transparent' },
      },
    },
    dataLabels: { enabled: false },
  }));
</script>

<template>
  <div class="rounded-2xl border border-white/40 bg-surface p-6 shadow-xl dark:border-strokedark/50 transition-all duration-300">
    <div class="mb-4">
      <h2 class="text-xl font-extrabold text-emphasis tracking-tight">Module Status</h2>
      <p class="text-sm font-semibold text-muted uppercase tracking-wider">Active vs inactive modules</p>
    </div>

    <div v-if="props.loading" class="h-[220px] flex items-center justify-center">
      <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
    <div v-else class="flex flex-col items-center">
      <VueApexCharts type="donut" height="200" :options="apexOptions" :series="chartData.series" />
      <div class="flex gap-6 mt-4">
        <div class="flex items-center gap-2">
          <span class="block w-3 h-3 rounded-full bg-success"></span>
          <span class="text-sm font-bold text-emphasis">Active: {{ moduleStatus.active }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="block w-3 h-3 rounded-full bg-danger"></span>
          <span class="text-sm font-bold text-emphasis">Inactive: {{ moduleStatus.inactive }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
