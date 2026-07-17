<script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue';
  import AdmissionServices from '@/services/Admission/Admission.services';
  import CollapsibleSection from '@/components/UI/CollapsibleSection.vue';
  import SkeletonGroup from '@/components/UI/SkeletonGroup.vue';
  import ProgressBar from '@/components/UI/ProgressBar.vue';
  import StatsGridCard from '@/components/UI/StatsGridCard.vue';
  import StatsGroupGrid from '@/components/UI/StatsGroupGrid.vue';
  import CalendarIcon from '@/assets/images/SVGs/CalendarIcon.svg';
  import CheckCircleIcon from '@/assets/images/SVGs/CheckCircleIcon.svg';
  import ClockIcon from '@/assets/images/SVGs/ClockIcon.svg';
  import UsersGroupIcon from '@/assets/images/SVGs/UsersGroupIcon.svg';
  // import BedIcon from '@/assets/images/SVGs/Bed.svg';

  const props = defineProps<{
    dateFilter?: string;
  }>();

  const admissionService = new AdmissionServices();
  const loading = ref(true);
  const statistics = ref<any>(null);

  const loadStatistics = async () => {
    loading.value = true;
    try {
      const response = await admissionService.getAdmissionStatistics(props.dateFilter);
      // Response is already the data from the service, or it's wrapped in { data, Data }
      const data = (response as any)?.data ?? (response as any)?.Data ?? response;
      if (data) {
        statistics.value = data;
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      loading.value = false;
    }
  };

  const activePercentage = computed(() => {
    if (!statistics.value || statistics.value.totalAdmissions === 0) return 0;
    return Math.round((statistics.value.admittedPatients / statistics.value.totalAdmissions) * 100);
  });

  // const pendingPercentage = computed(() => {
  //   if (!statistics.value || statistics.value.totalAdmissions === 0) return 0;
  //   return Math.round((statistics.value.pendingAdmissions / statistics.value.totalAdmissions) * 100);
  // });

  // const dischargedPercentage = computed(() => {
  //   if (!statistics.value || statistics.value.totalAdmissions === 0) return 0;
  //   return Math.round((statistics.value.dischargedPatients / statistics.value.totalAdmissions) * 100);
  // });

  watch(
    () => props.dateFilter,
    async () => {
      await loadStatistics();
    }
  );

  onMounted(() => {
    loadStatistics();
  });
</script>

<template>
  <CollapsibleSection title="Admission Statistics Overview">
    <SkeletonGroup v-if="loading" preset="stats-grid" />

    <div v-else-if="statistics" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsGridCard label="Total Admissions" :value="statistics.totalAdmissions" variant="primary" :icon="UsersGroupIcon" />
        <StatsGridCard label="Currently Admitted" :value="statistics.admittedPatients" :subtitle="`${activePercentage}% of total`" variant="success" :icon="CheckCircleIcon" />
        <StatsGridCard label="Pending" :value="statistics.pendingAdmissions" subtitle="Awaiting processing" variant="warning" :icon="ClockIcon" />
        <StatsGridCard label="Discharged" :value="statistics.dischargedPatients" variant="secondary" :icon="CalendarIcon" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-elevated rounded-xl p-6">
          <h3 class="text-lg font-semibold text-emphasis mb-4">Status Distribution</h3>
          <div class="space-y-3">
            <div v-for="item in statistics.admissionsByStatus" :key="item.status" class="flex items-center justify-between">
              <span class="text-sm text-bodydark dark:text-bodydark1">{{ item.status }}</span>
              <span class="text-sm font-semibold text-emphasis">{{ item.count }}</span>
            </div>
          </div>
        </div>

        <div class="bg-elevated rounded-xl p-6">
          <h3 class="text-lg font-semibold text-emphasis mb-4">Bed Coordination</h3>
          <div class="space-y-4">
            <ProgressBar :value="statistics.needsBedCount" :max="statistics.admittedPatients || 1" label="Needs Bed Assignment" variant="warning" value-format="fraction" />
            <div class="grid grid-cols-2 gap-4 pt-4 border-t border-stroke dark:border-strokedark">
              <div>
                <p class="text-xs text-bodydark dark:text-bodydark1 mb-1">Needs Bed</p>
                <p class="text-xl font-bold text-warning dark:text-warning">{{ statistics.needsBedCount }}</p>
              </div>
              <div>
                <p class="text-xs text-bodydark dark:text-bodydark1 mb-1">Pre-admission</p>
                <p class="text-xl font-bold text-meta-5 dark:text-meta-5">{{ statistics.preAdmissionPipelineCount }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StatsGroupGrid v-if="statistics.admissionsByWard?.length" title="By Ward" :items="statistics.admissionsByWard.map((w: any) => ({ label: w.ward, value: w.count }))" :columns="3" />
    </div>
  </CollapsibleSection>
</template>
