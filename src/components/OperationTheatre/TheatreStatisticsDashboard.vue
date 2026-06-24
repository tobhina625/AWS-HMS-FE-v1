<script setup lang="ts">
  import { computed } from 'vue';
  import type { ITheatreStatistics } from '@/services/OperationTheatre/OperationTheatre.dto';
  import CollapsibleSection from '@/components/UI/CollapsibleSection.vue';
  import StatsGridCard from '@/components/UI/StatsGridCard.vue';
  import CheckCircleIcon from '@/assets/images/SVGs/CheckCircleIcon.svg';
  import ClockIcon from '@/assets/images/SVGs/ClockIcon.svg';
  import MapPinLocationIcon from '@/assets/images/SVGs/MapPinLocationIcon.svg';
  import LinkIcon from '@/assets/images/SVGs/LinkIcon.svg';

  interface Props {
    statistics: ITheatreStatistics;
  }

  const props = defineProps<Props>();

  const utilizationRate = computed(() => {
    if (props.statistics.totalTheatres === 0) return 0;
    return Math.round((props.statistics.inUseTheatres / props.statistics.totalTheatres) * 100);
  });

  const availabilityRate = computed(() => {
    if (props.statistics.totalTheatres === 0) return 0;
    return Math.round((props.statistics.availableTheatres / props.statistics.totalTheatres) * 100);
  });
</script>

<template>
  <CollapsibleSection title="Operation Theatre Overview">
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsGridCard label="Total Theatres" :value="statistics.totalTheatres" variant="primary" :icon="MapPinLocationIcon" />
        <StatsGridCard label="Available" :value="statistics.availableTheatres" :subtitle="`${availabilityRate}% availability`" variant="success" :icon="CheckCircleIcon" />
        <StatsGridCard label="In Use" :value="statistics.inUseTheatres" :subtitle="`${utilizationRate}% utilization`" variant="warning" :icon="ClockIcon" />
        <StatsGridCard label="Maintenance" :value="statistics.underMaintenanceTheatres" variant="danger" :icon="LinkIcon" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-elevated rounded-xl p-4 border border-stroke dark:border-strokedark">
          <h3 class="text-sm font-semibold text-emphasis mb-3">Equipment Overview</h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted dark:text-bodydark">Total Capacity</span>
              <span class="font-semibold text-emphasis">{{ statistics.totalCapacity }} people</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted dark:text-bodydark">With Anesthesia</span>
              <span class="font-semibold text-emphasis">{{ statistics.theatresWithAnesthesia }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted dark:text-bodydark">With Ventilator</span>
              <span class="font-semibold text-emphasis">{{ statistics.theatresWithVentilator }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted dark:text-bodydark">With Monitoring</span>
              <span class="font-semibold text-emphasis">{{ statistics.theatresWithMonitoring }}</span>
            </div>
          </div>
        </div>

        <div class="bg-elevated rounded-xl p-4 border border-stroke dark:border-strokedark">
          <h3 class="text-sm font-semibold text-emphasis mb-3">Status Breakdown</h3>
          <div class="space-y-2">
            <div v-for="status in statistics.theatresByStatus" :key="status.status" class="flex items-center justify-between text-sm">
              <span class="text-muted dark:text-bodydark">{{ status.status }}</span>
              <span class="font-semibold text-emphasis">{{ status.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="statistics.theatresBySpecialization && statistics.theatresBySpecialization.length > 0" class="bg-elevated rounded-xl p-4 border border-stroke dark:border-strokedark">
        <h3 class="text-sm font-semibold text-emphasis mb-3">By Specialization</h3>
        <div class="flex flex-wrap gap-2">
          <div v-for="spec in statistics.theatresBySpecialization" :key="spec.specialization" class="px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg">
            {{ spec.specialization }}: {{ spec.count }}
          </div>
        </div>
      </div>
    </div>
  </CollapsibleSection>
</template>
