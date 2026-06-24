<script setup lang="ts">
  import type { IDesignation } from '@/services/Designation/Designation.dto';
  import StatusBadge from '@/components/UI/StatusBadge.vue';
  import ActionIconButton from '@/components/UI/ActionIconButton.vue';
  import EditPencilIcon from '@/assets/images/SVGs/EditPencilIcon.svg';
  import TagIcon from '@/assets/images/SVGs/TagIcon.svg';
  import TrendingUpIcon from '@/assets/images/SVGs/TrendingUpIcon.svg';
  import DeleteIcon from '@/assets/images/SVGs/Delete.svg';

  defineProps<{
    designation: IDesignation;
    showDelete?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'edit', designation: IDesignation): void;
    (e: 'delete', designation: IDesignation): void;
  }>();

  const formatSalary = (value: number | null) => {
    if (!value) return '-';
    return `$${value.toLocaleString()}`;
  };
</script>

<template>
  <div class="bg-surface rounded-2xl border border-stroke dark:border-strokedark shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
    <div class="p-5">
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-bold text-emphasis truncate">{{ designation.name }}</h3>
          <StatusBadge :status="designation.status" size="sm" class="mt-1" />
        </div>
        <div class="flex gap-2">
          <ActionIconButton variant="primary" title="Edit Designation" @click="emit('edit', designation)">
            <EditPencilIcon class="w-5 h-5" />
          </ActionIconButton>
          <ActionIconButton v-if="showDelete" variant="danger" title="Delete Designation" @click="emit('delete', designation)">
            <DeleteIcon class="w-5 h-5" />
          </ActionIconButton>
        </div>
      </div>

      <div class="space-y-2 mb-4">
        <p v-if="designation.role" class="text-sm text-bodydark dark:text-bodydark1">
          <span class="inline-flex items-center gap-1">
            <TagIcon class="w-4 h-4" />
            Role: {{ typeof designation.role === 'string' ? designation.role : designation.role.name }}
          </span>
        </p>
        <p v-if="designation.level" class="text-sm text-bodydark dark:text-bodydark1">
          <span class="inline-flex items-center gap-1">
            <TrendingUpIcon class="w-4 h-4" />
            Level: {{ designation.level }}
          </span>
        </p>
      </div>

      <div v-if="designation.minSalary || designation.maxSalary" class="grid grid-cols-2 gap-3 mb-4">
        <div class="bg-elevated rounded-lg p-3 text-center">
          <p class="text-xs text-bodydark dark:text-bodydark1">Min Salary</p>
          <p class="text-sm font-bold text-emphasis">{{ formatSalary(designation.minSalary) }}</p>
        </div>
        <div class="bg-elevated rounded-lg p-3 text-center">
          <p class="text-xs text-bodydark dark:text-bodydark1">Max Salary</p>
          <p class="text-sm font-bold text-emphasis">{{ formatSalary(designation.maxSalary) }}</p>
        </div>
      </div>

      <p v-if="designation.description" class="text-sm text-bodydark dark:text-bodydark1 line-clamp-2 mb-2">{{ designation.description }}</p>
      <p v-if="designation.responsibilities" class="text-xs text-bodydark2 dark:text-bodydark line-clamp-2 italic">{{ designation.responsibilities }}</p>
    </div>
  </div>
</template>
