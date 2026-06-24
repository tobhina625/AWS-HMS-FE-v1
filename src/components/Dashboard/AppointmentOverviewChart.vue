<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
  import VueApexCharts from 'vue3-apexcharts';
  import ChevronDownSelectIcon from '@/assets/images/SVGs/ChevronDownSelect.svg';
  import DashboardService from '@/services/Dashboard/dashboard.service';

  const dashboardService = new DashboardService();

  const getCssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const chart = ref(null);
  const selectedPeriod = ref('monthly');
  const loading = ref(true);
  const overviewData = ref<any>(null);

  const chartData = computed(() => {
    const data = overviewData.value;
    if (!data) {
      return { series: [], labels: [] };
    }
    const series = data.series ?? data.Series ?? [];
    const labels = data.labels ?? data.Labels ?? [];
    return {
      series: Array.isArray(series) ? series : [],
      labels: Array.isArray(labels) ? labels : [],
    };
  });

  const legendItems = computed(() => {
    const data = overviewData.value;
    const items = data?.items ?? data?.Items ?? [];
    if (!Array.isArray(items) || items.length === 0) {
      return chartData.value.labels.map((label: string, i: number) => ({
        label,
        value: chartData.value.series[i] ?? 0,
        colorIndex: i,
      }));
    }
    return items.map((item: any) => ({
      label: item.label ?? item.Label,
      value: item.percentage ?? item.Percentage ?? item.count ?? item.Count,
      colorIndex: item.colorIndex ?? item.ColorIndex ?? 0,
    }));
  });

  const chartColors = computed(() => [
    getCssVar('--color-chart-1'),
    getCssVar('--color-chart-2'),
    getCssVar('--color-chart-3'),
    getCssVar('--color-chart-4'),
    getCssVar('--color-chart-5'),
    getCssVar('--color-chart-6'),
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
    responsive: [
      {
        breakpoint: 640,
        options: { chart: { width: 200 } },
      },
    ],
  }));

  const fetchAppointmentOverview = async () => {
    loading.value = true;
    try {
      const response = await dashboardService.getAppointmentOverview(selectedPeriod.value as 'monthly' | 'yearly');
      const data = response?.data;
      if (data) {
        overviewData.value = data;
      }
    } catch (error) {
      console.error('Error fetching appointment overview:', error);
    } finally {
      loading.value = false;
    }
  };

  watch(selectedPeriod, () => fetchAppointmentOverview());

  let refreshInterval: ReturnType<typeof setInterval> | null = null;
  onMounted(() => {
    fetchAppointmentOverview();
    refreshInterval = setInterval(fetchAppointmentOverview, 60000);
  });
  onUnmounted(() => {
    if (refreshInterval) clearInterval(refreshInterval);
  });
</script>

<template>
  <div class="col-span-12 min-h-[450px] rounded-sm border border-stroke bg-surface px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark sm:px-7.5 xl:col-span-12">
    <div class="mb-3 justify-between gap-4 sm:flex">
      <div>
        <h4 class="text-xl font-bold text-emphasis">Appointment Overview</h4>
      </div>
      <div class="min-w-[100px] relative">
        <select
          v-model="selectedPeriod"
          @change="fetchAppointmentOverview"
          class="w-full min-w-0 rounded-lg border border-stroke dark:border-strokedark bg-transparent dark:bg-form-input py-1.5 pl-2.5 pr-9 text-[11px] font-medium text-emphasis outline-none focus:border-primary appearance-none cursor-pointer"
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        <span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-bodydark">
          <ChevronDownSelectIcon class="w-3 h-3" />
        </span>
      </div>
    </div>
    <div class="mb-2">
      <div v-if="loading" class="h-[340px] flex items-center justify-center">
        <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div v-else id="chartThree" class="mx-auto mt-10 flex justify-center">
        <VueApexCharts type="donut" width="340" :options="apexOptions" :series="chartData.series" ref="chart" />
      </div>
    </div>
    <div class="-mx-8 flex flex-wrap mt-10 items-center justify-center gap-y-3">
      <div v-for="(item, index) in legendItems" :key="index" class="w-full px-8 sm:w-1/2">
        <div class="flex w-full items-center">
          <span class="mr-2 block h-3 w-full max-w-3 rounded-full shrink-0" :style="{ backgroundColor: chartColors[item.colorIndex] || chartColors[index % chartColors.length] }"></span>
          <p class="flex w-full justify-between text-sm font-medium text-emphasis">
            <span>{{ item.label }}</span>
            <span>{{ item.value }}%</span>
          </p>
        </div>
      </div>
      <div v-if="!loading && legendItems.length === 0" class="text-center py-4 text-gray-500 text-sm">No appointment data available</div>
    </div>
  </div>
</template>
