<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed } from 'vue';
  import VueApexCharts from 'vue3-apexcharts';
  import DashboardService from '@/services/Dashboard/dashboard.service';
  import { useDarkModeStore } from '@/stores/darkMode';

  const dashboardService = new DashboardService();
  const darkModeStore = useDarkModeStore();

  const getCssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const chart = ref(null);
  const loading = ref(true);
  const financialData = ref<any>(null);

  const chartData = computed(() => {
    const data = financialData.value;
    if (!data) {
      return {
        series: [
          { name: 'Income', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { name: 'Outcome', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        ],
      };
    }
    const income = data.incomeData ?? data.IncomeData ?? [];
    const outcome = data.outcomeData ?? data.OutcomeData ?? [];
    return {
      series: [
        { name: 'Income', data: Array.isArray(income) ? income : [] },
        { name: 'Outcome', data: Array.isArray(outcome) ? outcome : [] },
      ],
    };
  });

  const fetchFinancialOverview = async () => {
    loading.value = true;
    try {
      const response = await dashboardService.getFinancialOverview();
      const data = response?.data;
      if (data) {
        financialData.value = data;
      }
    } catch (error) {
      console.error('Error fetching financial overview:', error);
    } finally {
      loading.value = false;
    }
  };

  let refreshInterval: ReturnType<typeof setInterval> | null = null;
  onMounted(() => {
    fetchFinancialOverview();
    refreshInterval = setInterval(fetchFinancialOverview, 60000);
  });
  onUnmounted(() => {
    if (refreshInterval) clearInterval(refreshInterval);
  });

  const categories = computed(() => {
    const data = financialData.value;
    return data?.categories || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  });

  const apexOptions = computed(() => ({
    legend: { show: false },
    colors: [getCssVar('--color-primary'), getCssVar('--color-secondary')],
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      height: 335,
      type: 'area',
      toolbar: { show: false },
      dropShadow: {
        enabled: true,
        color: getCssVar('--color-chart-shadow'),
        top: 10,
        blur: 4,
        left: 0,
        opacity: 0.1,
      },
    },
    stroke: { width: [3, 3], curve: 'smooth' },
    grid: {
      borderColor: darkModeStore.darkMode ? getCssVar('--color-strokedark') : getCssVar('--color-grid-light'),
      strokeDashArray: 5,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    markers: { size: 0, hover: { size: 5 } },
    xaxis: {
      type: 'category',
      categories: categories.value,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: {
        style: {
          colors: darkModeStore.darkMode ? getCssVar('--color-bodydark') : getCssVar('--color-bodydark2'),
          fontWeight: 500,
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] },
    },
  }));
</script>

<template>
  <div class="rounded-2xl border border-white/40 bg-surface p-7.5 shadow-xl dark:border-strokedark/50 transition-all duration-300">
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h2 class="text-xl font-extrabold text-emphasis tracking-tight">Financial Overview</h2>
        <p class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Hospital Revenue & Expenses</p>
      </div>

      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2">
          <span class="block h-3 w-3 rounded-full bg-primary shadow-[0_0_10px_rgba(60,80,224,0.4)]"></span>
          <span class="text-sm font-bold text-muted">Income</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="block h-3 w-3 rounded-full bg-secondary shadow-[0_0_10px_rgba(128,202,238,0.4)]"></span>
          <span class="text-sm font-bold text-muted">Outcome</span>
        </div>
      </div>
    </div>

    <div class="relative">
      <div v-if="loading" class="h-[350px] flex items-center justify-center">
        <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div v-else id="chartOne" class="-ml-5">
        <VueApexCharts type="area" height="350" :options="apexOptions" :series="chartData.series" ref="chart" />
      </div>
    </div>
  </div>
</template>
