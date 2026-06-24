<script setup lang="ts">
  import type { IWard } from '@/services/Ward/ward.interface';
  import StatusBadge from '@/components/UI/StatusBadge.vue';
  import ActionIconButton from '@/components/UI/ActionIconButton.vue';
  import ProgressBar from '@/components/UI/ProgressBar.vue';
  import DeleteIcon from '@/assets/images/SVGs/Delete.svg';
  import EditIcon from '@/assets/images/SVGs/Edit.svg';
  import BedIcon from '@/assets/images/SVGs/Bed.svg';
  import LocationIcon from '@/assets/images/SVGs/Location.svg';
  import LightningIcon from '@/assets/images/SVGs/Lightning.svg';

  defineProps<{
    ward: IWard;
    showDelete?: boolean;
  }>();

  const emit = defineEmits<{
    edit: [ward: IWard];
    viewBeds: [ward: IWard];
    delete: [ward: IWard];
  }>();
</script>

<template>
  <div class="bg-surface rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-stroke dark:border-strokedark p-6">
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <h3 class="text-lg font-semibold text-emphasis">{{ ward.name }}</h3>
          <StatusBadge :status="ward.status" />
        </div>
        <p class="text-sm text-muted">
          <span class="inline-flex items-center gap-1">
            <LocationIcon />
            {{ ward.location || 'Location not specified' }}
          </span>
        </p>
        <p v-if="ward.department" class="text-sm text-gray-600 dark:text-bodydark1 mt-1">Department: {{ ward.department.name }}</p>
      </div>
      <div class="flex gap-2">
        <ActionIconButton variant="ghost" title="View Beds" @click="emit('viewBeds', ward)">
          <BedIcon class="text-muted" />
        </ActionIconButton>
        <ActionIconButton variant="primary" title="Edit Ward" @click="emit('edit', ward)">
          <EditIcon />
        </ActionIconButton>
        <ActionIconButton v-if="showDelete" variant="danger" title="Delete Ward" @click="emit('delete', ward)">
          <DeleteIcon />
        </ActionIconButton>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="bg-elevated rounded-xl p-4 border border-stroke dark:border-strokedark">
        <ProgressBar :value="ward.occupancyRate" label="Bed Occupancy" variant="auto" size="sm" :thresholds="{ warning: 70, danger: 90 }" />
        <div class="flex items-center justify-between text-xs mt-2">
          <span class="text-muted">{{ ward.occupiedBeds }} / {{ ward.noOfBeds }} beds</span>
          <span class="font-medium text-success">{{ ward.availableBeds }} available</span>
        </div>
      </div>

      <div class="bg-elevated rounded-xl p-4 border border-stroke dark:border-strokedark">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-muted">Oxygen Slots</span>
          <span class="text-xs font-medium text-emphasis">{{ ward.occupiedOxygenSlots }} / {{ ward.noOfOxygenSlots }}</span>
        </div>
        <div class="flex items-center gap-2 mt-3">
          <div class="w-5 h-5 text-primary">
            <LightningIcon />
          </div>
          <div class="flex-1">
            <p class="text-xs text-muted">
              <span class="font-medium text-primary">{{ ward.availableOxygenSlots }}</span>
              available
            </p>
          </div>
        </div>
      </div>
    </div>

    <p v-if="ward.description" class="text-sm text-muted italic border-t-2 border-elevated pt-3">
      {{ ward.description }}
    </p>
  </div>
</template>
