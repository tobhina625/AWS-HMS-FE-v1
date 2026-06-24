<script setup lang="ts">
  import { computed } from 'vue';
  import type { IOperationTheatre } from '@/services/OperationTheatre/OperationTheatre.dto';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import StatusBadge from '@/components/UI/StatusBadge.vue';
  import DeleteIcon from '@/assets/images/SVGs/Delete.svg';
  import LocationIcon from '@/assets/images/SVGs/Location.svg';
  import BuildingIcon from '@/assets/images/SVGs/Building.svg';
  import CheckCircleIcon from '@/assets/images/SVGs/CheckCircle.svg';

  interface Props {
    theatre: IOperationTheatre;
    showDelete?: boolean;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<{
    edit: [id: number];
    viewSchedule: [id: number];
    delete: [theatre: IOperationTheatre];
  }>();

  const equipmentList = computed(() => {
    const equipment = [];
    if (props.theatre.hasAnesthesiaMachine) equipment.push('Anesthesia');
    if (props.theatre.hasVentilator) equipment.push('Ventilator');
    if (props.theatre.hasMonitoringSystem) equipment.push('Monitoring');
    if (props.theatre.hasSurgicalLights) equipment.push('Lights');
    return equipment;
  });
</script>

<template>
  <div class="bg-surface rounded-2xl border border-stroke dark:border-strokedark hover:shadow-lg transition-all duration-200 overflow-hidden">
    <div class="p-6">
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-emphasis mb-1">{{ theatre.name }}</h3>
          <div class="flex items-center gap-2 text-sm text-muted">
            <div class="w-4 h-4">
              <BuildingIcon />
            </div>
            <span>{{ theatre.department?.name || 'No Department' }}</span>
          </div>
        </div>
        <StatusBadge :status="theatre.status" />
      </div>

      <div v-if="theatre.location" class="flex items-center gap-2 text-sm text-muted mb-4">
        <div class="w-4 h-4">
          <LocationIcon />
        </div>
        <span>{{ theatre.location }}</span>
      </div>

      <div v-if="theatre.specialization" class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg mb-4">
        <div class="w-3.5 h-3.5">
          <CheckCircleIcon />
        </div>
        {{ theatre.specialization }}
      </div>

      <div class="space-y-3 mb-4">
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted">Capacity</span>
          <span class="font-semibold text-emphasis">{{ theatre.capacity }} people</span>
        </div>

        <div v-if="equipmentList.length > 0" class="pt-3 border-t-2 border-elevated">
          <div class="text-xs text-muted mb-2">Equipment ({{ theatre.equipmentCount }})</div>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="equipment in equipmentList" :key="equipment" class="px-2 py-0.5 bg-elevated text-emphasis text-xs rounded">
              {{ equipment }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex gap-2 pt-4 border-t-2 border-elevated">
        <BaseButton
          variant="ghost"
          size="sm"
          @click="emit('edit', theatre.id)"
          class="flex-1 !bg-primary/10 hover:!bg-primary/20 dark:!bg-primary/20 dark:hover:!bg-primary/30 !text-primary border border-primary/20 dark:border-primary/30"
        >
          Edit
        </BaseButton>
        <BaseButton
          variant="ghost"
          size="sm"
          @click="emit('viewSchedule', theatre.id)"
          class="flex-1 !bg-meta-3/10 hover:!bg-meta-3/20 dark:!bg-meta-3/20 dark:hover:!bg-meta-3/30 !text-meta-3 border border-meta-3/20 dark:border-meta-3/30"
        >
          Schedule
        </BaseButton>
        <BaseButton v-if="showDelete" variant="danger" size="sm" @click="emit('delete', theatre)" class="!px-4 !py-2">
          <DeleteIcon />
        </BaseButton>
      </div>
    </div>
  </div>
</template>
