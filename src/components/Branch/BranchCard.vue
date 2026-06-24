<script setup lang="ts">
  import { computed } from 'vue';
  import BaseCard from '@/components/Base/BaseCard.vue';
  import StatusBadge from '@/components/UI/StatusBadge.vue';
  import type { BranchDto } from '@/services/Branch/Branch.services';

  interface Props {
    branch: BranchDto;
  }

  const props = defineProps<Props>();

  const emit = defineEmits<{
    view: [branch: BranchDto];
    edit: [branch: BranchDto];
    delete: [branch: BranchDto];
  }>();

  const locationInfo = computed(() => {
    if (props.branch.latitude && props.branch.longitude) {
      return `${props.branch.latitude.toFixed(4)}, ${props.branch.longitude.toFixed(4)}`;
    }
    return 'Not configured';
  });
</script>

<template>
  <BaseCard class="hover:shadow-lg transition-shadow cursor-pointer" @click="emit('view', branch)">
    <div class="space-y-4">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-foreground">{{ branch.name }}</h3>
          <p class="text-sm text-muted">{{ branch.code }}</p>
        </div>
        <StatusBadge :status="branch.status" />
      </div>

      <div class="space-y-2 text-sm">
        <div class="flex items-start gap-2">
          <span class="text-muted min-w-24">Location:</span>
          <span class="text-foreground">{{ branch.city || '-' }}</span>
        </div>
        <div class="flex items-start gap-2">
          <span class="text-muted min-w-24">Branch Head:</span>
          <span class="text-foreground">{{ branch.branchHeadName || 'Not Assigned' }}</span>
        </div>
        <div class="flex items-start gap-2">
          <span class="text-muted min-w-24">Staff Count:</span>
          <span class="text-foreground">{{ branch.employeeCount }}</span>
        </div>
        <div class="flex items-start gap-2">
          <span class="text-muted min-w-24">Coordinates:</span>
          <span class="text-foreground text-xs">{{ locationInfo }}</span>
        </div>
      </div>

      <div class="flex gap-2 pt-2 border-t border-border" @click.stop>
        <button @click="emit('edit', branch)" class="flex-1 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors">Edit</button>
        <button @click="emit('delete', branch)" class="flex-1 px-3 py-2 text-sm font-medium text-danger hover:bg-danger/10 rounded-lg transition-colors">Delete</button>
      </div>
    </div>
  </BaseCard>
</template>
