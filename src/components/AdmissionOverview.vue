<template>
  <div class="admission-overview p-6 bg-gray-50 min-h-screen">
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading patient data...</p>
    </div>

    <div v-else-if="error" class="text-center py-8 text-red-500">
      {{ error }}
    </div>

    <div v-else class="max-w-7xl mx-auto">
      <!-- Static Patient Header (always visible at top) -->
      <div class="bg-white shadow-md rounded-lg p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="md:col-span-2">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ admission?.patient?.firstName }} {{ admission?.patient?.lastName }}</h2>
            <p class="text-sm text-gray-600 mb-3">
              <span class="font-medium">MRN:</span>
              {{ admission?.patient?.id }}
            </p>
          </div>
          <div class="flex justify-end items-start space-x-2">
            <span
              :class="admission?.status === 1 ? 'bg-green-100 text-green-800' : admission?.status === 2 ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'"
              class="px-3 py-1 rounded-full text-xs font-semibold"
            >
              {{ statusLabel }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div>
            <p class="text-xs text-gray-500 uppercase">Ward</p>
            <p class="text-sm font-medium text-gray-700">
              {{ admission?.ward?.name || `Ward ${admission?.wardId}` }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500 uppercase">Bed</p>
            <p class="text-sm font-medium text-gray-700">
              <span class="px-3 py-1 bg-indigo-50 text-indigo-800 rounded-full font-bold">
                {{ bedNumberDisplay }}
              </span>
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500 uppercase">Admission Date</p>
            <p class="text-sm font-medium text-gray-700">
              {{ formatDate(admission?.admissionDate) }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500 uppercase">Attending Doctor</p>
            <p class="text-sm font-medium text-gray-700">
              {{ doctorName }}
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Vitals Entry Form -->
      <div class="bg-white shadow-md rounded-lg p-6 mb-6">
        <VitalRecordForm :admission-id="admissionId" @saved="handleVitalSaved" />
      </div>

      <!-- Latest Vitals Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg shadow border">
          <p class="text-xs text-gray-500 uppercase">Temperature</p>
          <p class="text-xl font-bold" :class="tempClass">{{ latestVitals?.temperature }}°C</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border">
          <p class="text-xs text-gray-500 uppercase">Pulse</p>
          <p class="text-xl font-bold" :class="pulseClass">{{ latestVitals?.pulseRate }} bpm</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border">
          <p class="text-xs text-gray-500 uppercase">Blood Pressure</p>
          <p class="text-xl font-bold text-gray-700">{{ latestVitals?.bloodPressureSystolic }}/{{ latestVitals?.bloodPressureDiastolic }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border">
          <p class="text-xs text-gray-500 uppercase">Oxygen Saturation</p>
          <p class="text-xl font-bold" :class="o2Class">{{ latestVitals?.oxygenSaturation }}%</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border">
          <p class="text-xs text-gray-500 uppercase">Respiration</p>
          <p class="text-xl font-bold text-gray-700">{{ latestVitals?.respirationRate }}/min</p>
        </div>
      </div>

      <!-- Vitals History Table/Chart -->
      <div class="bg-white shadow-md rounded-lg p-6">
        <VitalHistoryChart :admission-id="admissionId" />
      </div>
    </div>
  </div>
</template>

<script>
  import VitalServices from '@/services/Vitals/Vital.services';
  import VitalRecordForm from '@/components/VitalRecordForm.vue';
  import VitalHistoryChart from '@/components/VitalHistoryChart.vue';

  const vitalService = new VitalServices();

  export default {
    components: {
      VitalRecordForm,
      VitalHistoryChart
    },
    props: {
      admissionId: { type: Number, required: true }
    },
    data() {
      return {
        loading: true,
        error: null,
        admission: null,
        latestVitals: null
      };
    },
    computed: {
      bedNumberDisplay() {
        return this.admission?.wardBedId || this.admission?.bedNumber || '-';
      },
      doctorName() {
        return this.admission?.attendingDoctor?.name || 'Unassigned';
      },
      statusLabel() {
        const s = this.admission?.status;
        return s === 1 ? 'Admitted' : s === 2 ? 'Discharged' : s === 3 ? 'Deceased' : 'Unknown';
      },
      tempClass() {
        if (!this.latestVitals) return 'text-gray-700';
        const t = parseFloat(this.latestVitals.temperature);
        return t >= 38 ? 'text-red-600 font-bold' : t >= 37.5 ? 'text-orange-600' : 'text-blue-600';
      },
      pulseClass() {
        if (!this.latestVitals) return 'text-gray-700';
        const p = parseInt(this.latestVitals.pulseRate);
        return p > 120 || p < 50 ? 'text-red-600 font-bold' : p > 100 || p < 60 ? 'text-orange-600' : 'text-blue-600';
      },
      o2Class() {
        if (!this.latestVitals) return 'text-gray-700';
        const o = parseFloat(this.latestVitals.oxygenSaturation);
        return o < 94 ? 'text-red-600 font-bold' : o < 96 ? 'text-orange-600' : 'text-green-600';
      }
    },
    async mounted() {
      await this.loadData();
    },
    methods: {
      async loadData() {
        this.loading = true;
        try {
          const [admissionRes, latestRes] = await Promise.all([
            this.$axios.get(`/api/admissions/${this.admissionId}`),
            vitalService.getLatest(this.admissionId) as any
          ]);
          this.admission = (admissionRes as any).data?.data || (admissionRes as any).data || admissionRes;
          this.latestVitals = (latestRes as any)?.data || latestRes;
        } catch (err) {
          console.error('Failed to load data:', err);
          this.error = 'Failed to load admission data';
        } finally {
          this.loading = false;
        }
      },
      async handleVitalSaved() {
        await this.loadData();
      },
      formatDate(dt) {
        if (!dt) return '-';
        return new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      }
    }
  };
</script>

<style scoped>
  .admission-overview {
    font-family: 'Inter', sans-serif;
  }
</style>
