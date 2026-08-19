<template>
  <div class="vital-history-chart">
    <h3 class="text-lg font-semibold mb-4">Vitals History</h3>
    <div v-if="loading" class="py-8 text-center text-gray-500">Loading vital records...</div>
    <div v-else-if="!vitalRecords.length" class="py-8 text-center text-gray-400">No vital records found for this admission.</div>
    <table v-else class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recorded At</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperature (°C)</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pulse</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BP</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">O₂ Saturation</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Respiration</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recorded By</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emergency</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="record in vitalRecords" :key="record.id">
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDateTime(record.recordedAt) }}</td>
          <td :class="getTempClass(record.temperature)" class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            {{ record.temperature }}
          </td>
          <td :class="getPulseClass(record.pulseRate)" class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            {{ record.pulseRate }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ record.bloodPressureSystolic }}/{{ record.bloodPressureDiastolic }}</td>
          <td :class="getO2Class(record.oxygenSaturation)" class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            {{ record.oxygenSaturation }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ record.respirationRate }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ record.weight || '-' }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ record.recordedByName || 'Unknown' }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-center">
            <span v-if="record.isEmergency" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Emergency</span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Chart visualization -->
    <div v-if="vitalRecords.length" class="mt-8">
      <h4 class="text-md font-medium text-gray-700 mb-2">Trends Over Time</h4>
      <canvas ref="chartRef" width="400" height="200"></canvas>
    </div>
  </div>
</template>

<script>
  import VitalServices from '@/services/Vitals/Vital.services';

  const vitalService = new VitalServices();

  export default {
    name: 'VitalHistoryChart',
    props: {
      admissionId: { type: Number, required: true }
    },
    data() {
      return {
        loading: false,
        vitalRecords: [],
        chart: null
      };
    },
    async mounted() {
      await this.fetchVitals();
      this.renderChart();
    },
    methods: {
      async fetchVitals() {
        this.loading = true;
        try {
          const response = await vitalService.getAllByAdmission(this.admissionId) as any;
          this.vitalRecords = response.items || response.content || response || [];
        } catch (error) {
          console.error('Failed to fetch vitals:', error);
        } finally {
          this.loading = false;
        }
      },
      formatDateTime(dt) {
        return new Date(dt).toLocaleString();
      },
      getTempClass(temp) {
        const t = parseFloat(temp);
        if (t >= 38) return 'text-red-600 bg-red-50';
        if (t >= 37.5) return 'text-orange-600';
        return 'text-gray-900';
      },
      getPulseClass(pulse) {
        const p = parseInt(pulse);
        if (p > 120 || p < 50) return 'text-red-600 bg-red-50';
        if (p > 100 || p < 60) return 'text-orange-600';
        return 'text-gray-900';
      },
      getO2Class(o2) {
        const o = parseFloat(o2);
        if (o < 94) return 'text-red-600 bg-red-50';
        if (o < 96) return 'text-orange-600';
        return 'text-gray-900';
      },
      refreshData() {
        this.fetchVitals();
      },
      renderChart() {
        if (!window.Chart || !this.vitalRecords.length) return;
        const ctx = this.$refs.chartRef.getContext('2d');
        if (this.chart) this.chart.destroy();
        this.chart = new window.Chart(ctx, {
          type: 'line',
          data: {
            labels: this.vitalRecords.map(r => new Date(r.recordedAt).toLocaleTimeString()),
            datasets: [{
              label: 'Temperature (°C)',
              data: this.vitalRecords.map(r => r.temperature),
              borderColor: '#f59e0b',
              tension: 0.3
            }, {
              label: 'O₂ Saturation %',
              data: this.vitalRecords.map(r => r.oxygenSaturation),
              borderColor: '#3b82f6',
              tension: 0.3
            }]
          },
          options: {
            responsive: true,
            scales: { y: { beginAtZero: false } }
          }
        });
      }
    },
       beforeUnmount() {
       if (this.chart) this.chart.destroy();
       window.removeEventListener('vital-record-saved', this.refreshData);
     },
     beforeMount() {
       window.addEventListener('vital-record-saved', this.refreshData);
     }
   };
</script>

<style scoped>
  .vital-history-chart {
    @apply bg-white p-6 rounded-lg shadow;
  }
</style>
