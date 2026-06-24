<script setup lang="ts">
  import type { IDepartment } from '@/services/Department/Department.dto';
  import StatusBadge from '@/components/UI/StatusBadge.vue';
  import ActionIconButton from '@/components/UI/ActionIconButton.vue';
  import EditPencilIcon from '@/assets/images/SVGs/EditPencilIcon.svg';
  import BuildingWardVariantIcon from '@/assets/images/SVGs/BuildingWardVariantIcon.svg';
  import UserIcon from '@/assets/images/SVGs/UserIcon.svg';
  import DeleteIcon from '@/assets/images/SVGs/Delete.svg';

  defineProps<{
    department: IDepartment;
    showDelete?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'edit', department: IDepartment): void;
    (e: 'delete', department: IDepartment): void;
  }>();
</script>

<template>
  <div class="bg-surface rounded-2xl border border-stroke dark:border-strokedark shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
    <div class="p-5">
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-bold text-emphasis truncate">{{ department.name }}</h3>
          <StatusBadge :status="department.status" size="sm" class="mt-1" />
        </div>
        <div class="flex gap-2">
          <ActionIconButton variant="primary" title="Edit Department" @click="emit('edit', department)">
            <EditPencilIcon class="w-5 h-5" />
          </ActionIconButton>
          <ActionIconButton v-if="showDelete" variant="danger" title="Delete Department" @click="emit('delete', department)">
            <DeleteIcon class="w-5 h-5" />
          </ActionIconButton>
        </div>
      </div>

      <div class="space-y-2 mb-4">
        <p v-if="department.headOfDepartment" class="text-sm text-bodydark dark:text-bodydark1">
          <span class="inline-flex items-center gap-1">
            <UserIcon class="w-4 h-4" />
            Head: {{ department.headOfDepartment }}
          </span>
        </p>
        <p v-if="department.location" class="text-sm text-bodydark dark:text-bodydark1">
          <span class="inline-flex items-center gap-1">
            <BuildingWardVariantIcon class="w-4 h-4" />
            {{ department.location }}
          </span>
        </p>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="bg-elevated rounded-lg p-3 text-center">
          <p class="text-xs text-bodydark dark:text-bodydark1">Capacity</p>
          <p class="text-lg font-bold text-emphasis">{{ department.capacity || 0 }}</p>
        </div>
        <div v-if="department.phone || department.email" class="bg-elevated rounded-lg p-3">
          <p v-if="department.phone" class="text-xs text-bodydark dark:text-bodydark1 truncate">📞 {{ department.phone }}</p>
          <p v-if="department.email" class="text-xs text-bodydark dark:text-bodydark1 truncate mt-1">✉️ {{ department.email }}</p>
        </div>
      </div>

      <p v-if="department.description" class="text-sm text-bodydark dark:text-bodydark1 line-clamp-2">{{ department.description }}</p>
    </div>
  </div>
</template>
