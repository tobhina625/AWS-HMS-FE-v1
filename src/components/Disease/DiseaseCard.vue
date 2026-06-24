<script setup lang="ts">
  import type { IDisease } from '@/services/Disease/Disease.dto';
  import StatusBadge from '@/components/UI/StatusBadge.vue';
  import ActionIconButton from '@/components/UI/ActionIconButton.vue';
  import EditPencilIcon from '@/assets/images/SVGs/EditPencilIcon.svg';
  import BadgeIcon from '@/assets/images/SVGs/BadgeIcon.svg';
  import HeartIcon from '@/assets/images/SVGs/HeartIcon.svg';
  import DeleteIcon from '@/assets/images/SVGs/Delete.svg';

  defineProps<{
    disease: IDisease;
    showDelete?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'edit', disease: IDisease): void;
    (e: 'delete', disease: IDisease): void;
  }>();

  const severityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'mild':
        return 'bg-success/10 text-success dark:bg-success/20 dark:text-success-light';
      case 'moderate':
        return 'bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning-light';
      case 'severe':
        return 'bg-warning/20 text-warning dark:bg-warning/30 dark:text-warning-light';
      case 'critical':
        return 'bg-danger/10 text-danger dark:bg-danger/20 dark:text-danger-light';
      default:
        return 'bg-gray/50 text-bodydark dark:bg-strokedark dark:text-bodydark1';
    }
  };
</script>

<template>
  <div class="bg-surface rounded-2xl border border-stroke dark:border-strokedark shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
    <div class="p-5">
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-bold text-emphasis truncate">{{ disease.name }}</h3>
          <div class="flex flex-wrap gap-1.5 mt-1">
            <StatusBadge :status="disease.status" size="sm" />
            <span :class="['inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full', severityColor(disease.severity)]">{{ disease.severity || 'N/A' }}</span>
            <span v-if="disease.isContagious" class="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-danger/10 text-danger dark:bg-danger/20 dark:text-danger-light">
              ⚠ Contagious
            </span>
          </div>
        </div>
        <div class="flex gap-2">
          <ActionIconButton variant="primary" title="Edit Disease" @click="emit('edit', disease)">
            <EditPencilIcon class="w-5 h-5" />
          </ActionIconButton>
          <ActionIconButton v-if="showDelete" variant="danger" title="Delete Disease" @click="emit('delete', disease)">
            <DeleteIcon class="w-5 h-5" />
          </ActionIconButton>
        </div>
      </div>

      <div class="space-y-2 mb-4">
        <p v-if="disease.category" class="text-sm text-bodydark dark:text-bodydark1">
          <span class="inline-flex items-center gap-1">
            <BadgeIcon class="w-4 h-4" />
            {{ disease.category }}
          </span>
        </p>
        <p v-if="disease.affectedBodyPart" class="text-sm text-bodydark dark:text-bodydark1">
          <span class="inline-flex items-center gap-1">
            <HeartIcon class="w-4 h-4" />
            {{ disease.affectedBodyPart }}
          </span>
        </p>
      </div>

      <div v-if="disease.symptoms" class="mb-3">
        <p class="text-xs font-semibold text-bodydark dark:text-bodydark1 mb-1">Symptoms</p>
        <p class="text-sm text-bodydark2 dark:text-bodydark line-clamp-2">{{ disease.symptoms }}</p>
      </div>

      <div v-if="disease.treatment" class="mb-3">
        <p class="text-xs font-semibold text-bodydark dark:text-bodydark1 mb-1">Treatment</p>
        <p class="text-sm text-bodydark2 dark:text-bodydark line-clamp-2">{{ disease.treatment }}</p>
      </div>

      <p v-if="disease.description" class="text-sm text-bodydark dark:text-bodydark1 line-clamp-2">{{ disease.description }}</p>
    </div>
  </div>
</template>
