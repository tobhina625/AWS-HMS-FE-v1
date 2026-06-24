<script setup lang="ts">
  import { computed } from 'vue';
  import type { ISurgery } from '@/services/Surgery/Surgery.dto';
  import StatusBadge from '@/components/UI/StatusBadge.vue';
  import ActionIconButton from '@/components/UI/ActionIconButton.vue';
  import ClockIcon from '@/assets/images/SVGs/ClockIcon.svg';
  import EditPencilIcon from '@/assets/images/SVGs/EditPencilIcon.svg';
  import BadgeIcon from '@/assets/images/SVGs/BadgeIcon.svg';
  import TrashDetailedIcon from '@/assets/images/SVGs/TrashDetailedIcon.svg';

  const props = defineProps<{
    surgery: ISurgery;
    showDelete?: boolean;
  }>();

  const emit = defineEmits<{
    edit: [surgery: ISurgery];
    delete: [surgery: ISurgery];
    viewDetails: [surgery: ISurgery];
  }>();

  const categoryLabel = computed(() => {
    return props.surgery.category.replace(/([A-Z])/g, ' $1').trim();
  });

  const formattedCost = computed(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(props.surgery.cost);
  });

  const equipmentTags = computed(() => {
    const tags: string[] = [];
    if (props.surgery.requiresGeneralAnesthesia) tags.push('Anesthesia');
    if (props.surgery.requiresBloodBank) tags.push('Blood Bank');
    if (props.surgery.requiresICU) tags.push('ICU');
    if (props.surgery.isMinimallyInvasive) tags.push('Minimally Invasive');
    return tags;
  });

  const durationFormatted = computed(() => {
    if (!props.surgery.duration) return '-';
    const hours = Math.floor(props.surgery.duration / 60);
    const minutes = props.surgery.duration % 60;
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  });
</script>

<template>
  <div class="bg-surface rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-stroke dark:border-strokedark p-6">
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <h3 class="text-lg font-semibold text-emphasis">{{ surgery.name }}</h3>
          <StatusBadge :status="surgery.status" />
        </div>
        <p class="text-sm text-bodydark dark:text-bodydark1">
          <span class="inline-flex items-center gap-1">
            <BadgeIcon class="w-4 h-4" />
            {{ categoryLabel }}
          </span>
        </p>
        <p v-if="surgery.department" class="text-sm text-bodydark dark:text-bodydark1 mt-1">Department: {{ typeof surgery.department === 'string' ? surgery.department : surgery.department.name }}</p>
      </div>
      <div class="flex gap-2">
        <ActionIconButton variant="primary" title="Edit Surgery" @click="emit('edit', surgery)">
          <EditPencilIcon class="w-5 h-5" />
        </ActionIconButton>
        <ActionIconButton v-if="showDelete" variant="danger" title="Delete Surgery" @click="emit('delete', surgery)">
          <TrashDetailedIcon class="w-5 h-5" />
        </ActionIconButton>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="bg-elevated rounded-xl p-4">
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm text-bodydark dark:text-bodydark1">Base Cost</span>
        </div>
        <p class="text-xl font-bold text-primary dark:text-primary-light">{{ formattedCost }}</p>
      </div>

      <div class="bg-elevated rounded-xl p-4">
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm text-bodydark dark:text-bodydark1">Duration</span>
        </div>
        <div class="flex items-center gap-2 mt-1">
          <ClockIcon class="w-5 h-5 text-secondary" />
          <p class="text-xl font-bold text-secondary dark:text-secondary">{{ durationFormatted }}</p>
        </div>
      </div>
    </div>

    <div v-if="equipmentTags.length > 0" class="flex flex-wrap gap-2 mb-4">
      <span v-for="tag in equipmentTags" :key="tag" class="px-2.5 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light text-xs font-medium rounded-lg">
        {{ tag }}
      </span>
    </div>

    <div v-if="surgery.riskLevel" class="flex items-center gap-2 mb-3">
      <span class="text-xs text-bodydark dark:text-bodydark1">Risk Level:</span>
      <span class="px-2 py-0.5 bg-warning/10 dark:bg-warning/20 text-warning dark:text-warning-light text-xs font-medium rounded-lg">
        {{ surgery.riskLevel }}
      </span>
    </div>

    <p v-if="surgery.description" class="text-sm text-bodydark dark:text-bodydark1 italic border-t border-stroke dark:border-strokedark pt-3">
      {{ surgery.description }}
    </p>
  </div>
</template>
