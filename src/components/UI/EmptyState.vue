<script setup lang="ts">
  import { computed } from 'vue';
  import EmptyStateSearchIcon from '@/assets/images/SVGs/EmptyStateSearch.svg';
  import EmptyStateBedIcon from '@/assets/images/SVGs/EmptyStateBed.svg';
  import EmptyStateWardIcon from '@/assets/images/SVGs/EmptyStateWard.svg';
  import EmptyStatePatientIcon from '@/assets/images/SVGs/EmptyStatePatient.svg';
  import EmptyStateDataIcon from '@/assets/images/SVGs/EmptyStateData.svg';
  import EmptyStateDefaultIcon from '@/assets/images/SVGs/EmptyStateDefault.svg';
  import AppointmentIcon from '@/assets/images/SVGs/Appointment.svg';
  import PlusIcon from '@/assets/images/SVGs/PlusIcon.svg';
  import BaseButton from '@/components/Base/BaseButton.vue';

  const props = defineProps<{
    title?: string;
    description?: string;
    icon?: 'search' | 'data' | 'bed' | 'ward' | 'patient' | 'default' | 'appointment';
    actionLabel?: string;
    actionRoute?: string;
  }>();

  const emit = defineEmits<{
    action: [];
  }>();

  const iconComponent = computed(() => {
    switch (props.icon) {
      case 'search':
        return EmptyStateSearchIcon;
      case 'bed':
        return EmptyStateBedIcon;
      case 'ward':
        return EmptyStateWardIcon;
      case 'patient':
        return EmptyStatePatientIcon;
      case 'data':
        return EmptyStateDataIcon;
      case 'appointment':
        return AppointmentIcon;
      default:
        return EmptyStateDefaultIcon;
    }
  });
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div class="w-20 h-20 rounded-full bg-elevated flex items-center justify-center mb-6 border border-gray-300 dark:border-strokedark/50">
      <component :is="iconComponent" class="w-10 h-10 text-bodydark dark:text-bodydark1" />
    </div>

    <h3 class="text-xl font-semibold text-emphasis mb-2">
      {{ title || 'No Records Found' }}
    </h3>

    <p class="text-bodydark dark:text-bodydark1 max-w-md mb-6">
      {{ description || 'There are no items to display at the moment. Try adjusting your filters or add a new item.' }}
    </p>

    <slot name="action">
      <BaseButton variant="primary" @click="emit('action')">
        <PlusIcon class="w-5 h-5" />
        {{ actionLabel }}
      </BaseButton>
    </slot>
  </div>
</template>
