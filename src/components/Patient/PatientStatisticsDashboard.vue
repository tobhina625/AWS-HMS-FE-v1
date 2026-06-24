<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import PatientServices from '@/services/Patient/patient.services';
  import CollapsibleSection from '@/components/UI/CollapsibleSection.vue';
  import SkeletonGroup from '@/components/UI/SkeletonGroup.vue';
  import ProgressBar from '@/components/UI/ProgressBar.vue';
  import StatsGridCard from '@/components/UI/StatsGridCard.vue';
  import StatsGroupGrid from '@/components/UI/StatsGroupGrid.vue';
  import ClockIcon from '@/assets/images/SVGs/ClockIcon.svg';
  import UserIcon from '@/assets/images/SVGs/UserIcon.svg';
  import UsersGroupIcon from '@/assets/images/SVGs/UsersGroupIcon.svg';

  const patientService = new PatientServices();
  const loading = ref(true);
  const statistics = ref<any>(null);

  const loadStatistics = async () => {
    loading.value = true;
    try {
      const response = await patientService.getPatientStatistics('isDeleted=false');
      if (response?.data) {
        statistics.value = response.data;
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      loading.value = false;
    }
  };

  const genderDistribution = computed(() => {
    if (!statistics.value || statistics.value.totalPatients === 0) return { male: 0, female: 0 };
    return {
      male: Math.round((statistics.value.malePatients / statistics.value.totalPatients) * 100),
      female: Math.round((statistics.value.femalePatients / statistics.value.totalPatients) * 100),
    };
  });

  onMounted(() => {
    loadStatistics();
  });

  defineExpose({ refresh: loadStatistics });
</script>

<template>
  <CollapsibleSection title="Patient Statistics Overview">
    <SkeletonGroup v-if="loading" preset="stats-grid" />

    <div v-else-if="statistics" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsGridCard label="Total Patients" :value="statistics.totalPatients" variant="primary" :icon="UsersGroupIcon" />
        <StatsGridCard label="Male Patients" :value="statistics.malePatients" :subtitle="`${genderDistribution.male}% of total`" variant="success" :icon="UserIcon" />
        <StatsGridCard label="Female Patients" :value="statistics.femalePatients" :subtitle="`${genderDistribution.female}% of total`" variant="secondary" :icon="UserIcon" />
        <StatsGridCard label="Average Age" :value="Math.round(statistics.averageAge)" subtitle="years old" variant="warning" :icon="ClockIcon" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-elevated rounded-xl p-6 border border-stroke dark:border-strokedark">
          <h3 class="text-lg font-semibold text-emphasis mb-4">Gender Distribution</h3>
          <div class="space-y-4">
            <ProgressBar :value="statistics.malePatients" :max="statistics.totalPatients" label="Male" variant="success" value-format="value" />
            <ProgressBar :value="statistics.femalePatients" :max="statistics.totalPatients" label="Female" variant="primary" value-format="value" />
          </div>
        </div>

        <div class="bg-elevated rounded-xl p-6 border border-stroke dark:border-strokedark">
          <h3 class="text-lg font-semibold text-emphasis mb-4">Special Categories</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-4 bg-surface rounded-lg border border-stroke dark:border-strokedark">
              <p class="text-sm text-emphasis mb-2">With Guardian</p>
              <p class="text-2xl font-bold text-primary">{{ statistics.patientsWithGuardian }}</p>
            </div>
            <div class="text-center p-4 bg-surface rounded-lg border border-stroke dark:border-strokedark">
              <p class="text-sm text-emphasis mb-2">International</p>
              <p class="text-2xl font-bold text-secondary">{{ statistics.internationalPatients }}</p>
            </div>
          </div>
        </div>
      </div>

      <StatsGroupGrid v-if="statistics.patientsByAgeGroup?.length" title="Patients by Age Group" :items="statistics.patientsByAgeGroup.map((a: any) => ({ label: a.ageGroup, value: a.count }))" />
    </div>
  </CollapsibleSection>
</template>
