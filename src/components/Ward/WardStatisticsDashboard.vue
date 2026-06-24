<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import WardServices from '@/services/Ward/ward.services';
  import CollapsibleSection from '@/components/UI/CollapsibleSection.vue';
  import SkeletonGroup from '@/components/UI/SkeletonGroup.vue';
  import ProgressBar from '@/components/UI/ProgressBar.vue';
  import StatsGridCard from '@/components/UI/StatsGridCard.vue';
  import StatsGroupGrid from '@/components/UI/StatsGroupGrid.vue';
  import HomeHouseIcon from '@/assets/images/SVGs/HomeHouseIcon.svg';
  import MapPinLocationIcon from '@/assets/images/SVGs/MapPinLocationIcon.svg';
  import BellNotificationIcon from '@/assets/images/SVGs/BellNotificationIcon.svg';
  import UserIcon from '@/assets/images/SVGs/UserIcon.svg';

  const wardService = new WardServices();
  const loading = ref(true);
  const statistics = ref<any>(null);

  const loadStatistics = async () => {
    loading.value = true;
    try {
      const response = await wardService.getWardStatistics();
      if (response?.data) {
        statistics.value = response.data;
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      loading.value = false;
    }
  };

  const bedOccupancyPercentage = computed(() => {
    if (!statistics.value || statistics.value.totalBeds === 0) return 0;
    return Math.round((statistics.value.occupiedBeds / statistics.value.totalBeds) * 100);
  });

  const oxygenOccupancyPercentage = computed(() => {
    if (!statistics.value || statistics.value.totalOxygenSlots === 0) return 0;
    return Math.round((statistics.value.occupiedOxygenSlots / statistics.value.totalOxygenSlots) * 100);
  });

  onMounted(() => {
    loadStatistics();
  });
</script>

<template>
  <CollapsibleSection title="Hospital-Wide Statistics">
    <SkeletonGroup v-if="loading" preset="stats-grid" />

    <div v-else-if="statistics" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsGridCard label="Total Wards" :value="statistics.totalWards" variant="primary" :icon="MapPinLocationIcon" />
        <StatsGridCard label="Total Beds" :value="statistics.totalBeds" :subtitle="`${statistics.availableBeds} available`" variant="success" :icon="HomeHouseIcon" />
        <StatsGridCard label="Occupied Beds" :value="statistics.occupiedBeds" :subtitle="`${bedOccupancyPercentage}% occupancy`" variant="secondary" :icon="UserIcon" />
        <StatsGridCard label="Oxygen Slots" :value="statistics.totalOxygenSlots" :subtitle="`${statistics.availableOxygenSlots} available`" variant="warning" :icon="BellNotificationIcon" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-elevated rounded-xl p-6 border border-stroke dark:border-strokedark">
          <h3 class="text-lg font-semibold text-emphasis mb-4">Bed Occupancy</h3>
          <div class="space-y-4">
            <ProgressBar :value="bedOccupancyPercentage" label="Overall Occupancy" variant="auto" :thresholds="{ warning: 70, danger: 90 }" />
            <div class="grid grid-cols-2 gap-4 pt-4 border-t-2 border-elevated">
              <div>
                <p class="text-xs text-muted mb-1">Occupied</p>
                <p class="text-2xl font-bold text-primary">{{ statistics.occupiedBeds }}</p>
              </div>
              <div>
                <p class="text-xs text-muted mb-1">Available</p>
                <p class="text-2xl font-bold text-success">{{ statistics.availableBeds }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-elevated rounded-xl p-6 border border-stroke dark:border-strokedark">
          <h3 class="text-lg font-semibold text-emphasis mb-4">Oxygen Supply</h3>
          <div class="space-y-4">
            <ProgressBar :value="oxygenOccupancyPercentage" label="Oxygen Utilization" variant="primary" />
            <div class="grid grid-cols-2 gap-4 pt-4 border-t-2 border-elevated">
              <div>
                <p class="text-xs text-muted mb-1">In Use</p>
                <p class="text-2xl font-bold text-primary">{{ statistics.occupiedOxygenSlots }}</p>
              </div>
              <div>
                <p class="text-xs text-muted mb-1">Available</p>
                <p class="text-2xl font-bold text-success">{{ statistics.availableOxygenSlots }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StatsGroupGrid v-if="statistics.wardsByStatus?.length" title="Wards by Status" :items="statistics.wardsByStatus.map((s: any) => ({ label: s.status, value: s.count }))" />
    </div>
  </CollapsibleSection>
</template>
