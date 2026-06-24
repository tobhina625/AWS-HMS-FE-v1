<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import SurgeryService from '@/services/Surgery/Surgery.services';
  import CollapsibleSection from '@/components/UI/CollapsibleSection.vue';
  import SkeletonGroup from '@/components/UI/SkeletonGroup.vue';
  import ProgressBar from '@/components/UI/ProgressBar.vue';
  import StatsGridCard from '@/components/UI/StatsGridCard.vue';
  import StatsGroupGrid from '@/components/UI/StatsGroupGrid.vue';
  import ClockIcon from '@/assets/images/SVGs/ClockIcon.svg';
  import ClipboardDocIcon from '@/assets/images/SVGs/ClipboardDocIcon.svg';
  import DocumentFileIcon from '@/assets/images/SVGs/DocumentFileIcon.svg';
  import BellNotificationIcon from '@/assets/images/SVGs/BellNotificationIcon.svg';

  const surgeryService = new SurgeryService();
  const loading = ref(true);
  const statistics = ref<any>(null);

  const loadStatistics = async () => {
    loading.value = true;
    try {
      const response = await surgeryService.getSurgeryStatistics();
      if (response?.data) {
        statistics.value = response.data;
      }
    } catch (error) {
      console.error('Failed to load surgery statistics:', error);
    } finally {
      loading.value = false;
    }
  };

  const icuPercentage = computed(() => {
    if (!statistics.value || statistics.value.totalSurgeries === 0) return 0;
    return Math.round((statistics.value.requiringICU / statistics.value.totalSurgeries) * 100);
  });

  const anesthesiaPercentage = computed(() => {
    if (!statistics.value || statistics.value.totalSurgeries === 0) return 0;
    return Math.round((statistics.value.requiringAnesthesia / statistics.value.totalSurgeries) * 100);
  });

  onMounted(() => {
    loadStatistics();
  });
</script>

<template>
  <CollapsibleSection title="Surgery Overview">
    <SkeletonGroup v-if="loading" preset="stats-grid" />

    <div v-else-if="statistics" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsGridCard label="Total Procedures" :value="statistics.totalSurgeries" variant="primary" :icon="ClipboardDocIcon" />
        <StatsGridCard label="Avg. Cost" :value="`$${statistics.averageCost?.toLocaleString()}`" variant="success" :icon="DocumentFileIcon" />
        <StatsGridCard label="Avg. Duration" :value="`${statistics.averageDuration}m`" variant="secondary" :icon="ClockIcon" />
        <StatsGridCard label="Minimally Invasive" :value="statistics.minimallyInvasive" :subtitle="`of ${statistics.totalSurgeries} procedures`" variant="warning" :icon="BellNotificationIcon" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-elevated rounded-xl p-6">
          <h3 class="text-lg font-semibold text-emphasis mb-4">Resource Requirements</h3>
          <div class="space-y-4">
            <ProgressBar :value="icuPercentage" label="Requiring ICU" variant="auto" :thresholds="{ warning: 40, danger: 70 }" />
            <ProgressBar :value="anesthesiaPercentage" label="Requiring Anesthesia" variant="primary" />
            <div class="grid grid-cols-2 gap-4 pt-4 border-t border-stroke dark:border-strokedark">
              <div>
                <p class="text-xs text-bodydark dark:text-bodydark1 mb-1">Blood Bank</p>
                <p class="text-2xl font-bold text-danger dark:text-danger">{{ statistics.requiringBloodBank }}</p>
              </div>
              <div>
                <p class="text-xs text-bodydark dark:text-bodydark1 mb-1">ICU Required</p>
                <p class="text-2xl font-bold text-warning dark:text-warning">{{ statistics.requiringICU }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-elevated rounded-xl p-6">
          <h3 class="text-lg font-semibold text-emphasis mb-4">Cost Overview</h3>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-bodydark dark:text-bodydark1 mb-1">Average</p>
                <p class="text-2xl font-bold text-success dark:text-success">${{ statistics.averageCost?.toLocaleString() }}</p>
              </div>
              <div>
                <p class="text-xs text-bodydark dark:text-bodydark1 mb-1">Total</p>
                <p class="text-2xl font-bold text-primary dark:text-primary">${{ statistics.totalCost?.toLocaleString() }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StatsGroupGrid v-if="statistics.surgeriesByStatus?.length" title="Procedures by Status" :items="statistics.surgeriesByStatus.map((s: any) => ({ label: s.status, value: s.count }))" />
      <StatsGroupGrid v-if="statistics.surgeriesByCategory?.length" title="Procedures by Category" :items="statistics.surgeriesByCategory.map((c: any) => ({ label: c.category, value: c.count }))" />
    </div>
  </CollapsibleSection>
</template>
