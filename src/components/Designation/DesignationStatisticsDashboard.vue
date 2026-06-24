<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import type { IDesignationStatistics } from '@/services/Designation/Designation.dto';
  import DesignationsService from '@/services/Designation/Designation.services';
  import CollapsibleSection from '@/components/UI/CollapsibleSection.vue';
  import SkeletonGroup from '@/components/UI/SkeletonGroup.vue';
  import StatsGridCard from '@/components/UI/StatsGridCard.vue';
  import FolderIcon from '@/assets/images/SVGs/FolderIcon.svg';
  import TagIcon from '@/assets/images/SVGs/TagIcon.svg';

  const designationService = new DesignationsService();
  const loading = ref(true);
  const statistics = ref<IDesignationStatistics>({
    totalDesignations: 0,
    activeDesignations: 0,
    averageMinSalary: 0,
    averageMaxSalary: 0,
    designationsByStatus: [],
    designationsByRole: [],
    designationsByLevel: [],
  });

  const loadStatistics = async () => {
    loading.value = true;
    try {
      const response = await designationService.getDesignationStatistics();
      if (response?.data) {
        statistics.value = response.data;
      }
    } catch (error) {
      console.error('Failed to load designation statistics:', error);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    loadStatistics();
  });
</script>

<template>
  <CollapsibleSection title="Designations Overview">
    <SkeletonGroup v-if="loading" preset="stats-grid" />

    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsGridCard label="Total Designations" :value="statistics.totalDesignations" variant="primary" :icon="FolderIcon" />
        <StatsGridCard label="Active Designations" :value="statistics.activeDesignations" variant="success" :icon="TagIcon" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-if="statistics.designationsByStatus && statistics.designationsByStatus.length > 0" class="bg-bodydark2/5 dark:bg-strokedark/20 rounded-xl p-4">
          <h3 class="text-lg font-semibold text-emphasis mb-4">By Status</h3>
          <div class="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            <div
              v-for="status in statistics.designationsByStatus"
              :key="status.status"
              class="flex justify-between items-center p-3 bg-surface rounded-lg border border-stroke dark:border-strokedark hover:border-primary/30 transition-colors"
            >
              <span class="text-sm font-medium text-bodydark dark:text-bodydark1">{{ status.status }}</span>
              <span class="text-lg font-bold text-emphasis bg-elevated px-3 py-1 rounded-full">{{ status.count }}</span>
            </div>
          </div>
        </div>

        <div v-if="statistics.designationsByRole && statistics.designationsByRole.length > 0" class="bg-bodydark2/5 dark:bg-strokedark/20 rounded-xl p-4">
          <h3 class="text-lg font-semibold text-emphasis mb-4">By Role</h3>
          <div class="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            <div
              v-for="role in statistics.designationsByRole"
              :key="role.role"
              class="flex justify-between items-center p-3 bg-surface rounded-lg border border-stroke dark:border-strokedark hover:border-primary/30 transition-colors"
            >
              <span class="text-sm font-medium text-bodydark dark:text-bodydark1 truncate mr-2" :title="role.role">{{ role.role }}</span>
              <span class="text-lg font-bold text-emphasis bg-elevated px-3 py-1 rounded-full">{{ role.count }}</span>
            </div>
          </div>
        </div>

        <div v-if="statistics.designationsByLevel && statistics.designationsByLevel.length > 0" class="bg-bodydark2/5 dark:bg-strokedark/20 rounded-xl p-4">
          <h3 class="text-lg font-semibold text-emphasis mb-4">By Level</h3>
          <div class="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            <div
              v-for="level in statistics.designationsByLevel"
              :key="level.level"
              class="flex justify-between items-center p-3 bg-surface rounded-lg border border-stroke dark:border-strokedark hover:border-primary/30 transition-colors"
            >
              <span class="text-sm font-medium text-bodydark dark:text-bodydark1">{{ level.level }}</span>
              <span class="text-lg font-bold text-emphasis bg-elevated px-3 py-1 rounded-full">{{ level.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </CollapsibleSection>
</template>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 9999px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--stroke);
    border-radius: 9999px;
    transition: background-color 0.2s;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: var(--bodydark1);
  }
  .dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--strokedark);
  }
  .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(var(--primary-rgb), 0.4);
  }
</style>
