<script setup lang="ts">
  import { computed } from 'vue';
  import VueApexCharts from 'vue3-apexcharts';

  const props = defineProps<{
    data?: any;
    loading?: boolean;
  }>();

  const getCssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const employeesByRole = computed(() => {
    const items = props.data?.employeesByRole ?? props.data?.EmployeesByRole ?? [];
    return Array.isArray(items) ? items : [];
  });

  const chartData = computed(() => {
    const items = employeesByRole.value;
    if (!items || items.length === 0) return { series: [], labels: [] };
    return {
      series: items.map((x) => x.count ?? x.Count),
      labels: items.map((x) => x.roleName ?? x.RoleName ?? 'Unknown'),
    };
  });

  const chartColors = computed(() => [
    getCssVar('--color-chart-1'),
    getCssVar('--color-chart-2'),
    getCssVar('--color-chart-3'),
    getCssVar('--color-chart-4'),
    getCssVar('--color-chart-5'),
    getCssVar('--color-chart-6'),
    getCssVar('--color-chart-7'),
    getCssVar('--color-chart-8'),
  ]);

  const apexOptions = computed(() => ({
    chart: { type: 'donut' as const, width: 380 },
    colors: chartColors.value,
    labels: chartData.value.labels,
    legend: { show: false, position: 'bottom' as const },
    plotOptions: {
      pie: {
        donut: { size: '65%', background: 'transparent' },
      },
    },
    dataLabels: { enabled: false },
    responsive: [{ breakpoint: 640, options: { chart: { width: 200 } } }],
  }));
</script>

<template>
  <div class="rounded-2xl border border-white/40 bg-surface p-6 shadow-xl dark:border-strokedark/50 transition-all duration-300">
    <div class="mb-4">
      <h2 class="text-xl font-extrabold text-emphasis tracking-tight">Employees by Role</h2>
      <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Staff distribution across roles</p>
    </div>

    <div v-if="props.loading" class="h-[300px] flex items-center justify-center">
      <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
    <div v-else-if="chartData.series.length > 0" class="space-y-4">
      <VueApexCharts type="donut" height="280" :options="apexOptions" :series="chartData.series" />
      <div class="flex flex-wrap gap-3 mt-4">
        <div v-for="(item, index) in employeesByRole" :key="index" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-elevated">
          <span class="block w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: chartColors[index % chartColors.length] }"></span>
          <span class="text-sm font-medium text-emphasis">{{ item.roleName ?? item.RoleName }}</span>
          <span class="text-sm font-bold text-primary">{{ item.count ?? item.Count }}</span>
        </div>
      </div>
    </div>
    <div v-else class="h-[200px] flex items-center justify-center text-gray-500 text-sm">No role distribution data available</div>
  </div>
</template>
