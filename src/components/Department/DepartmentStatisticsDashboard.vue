<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import type { IDepartmentStatistics } from '@/services/Department/Department.dto';
  import DepartmentsServices from '@/services/Department/Department.services';
  import CollapsibleSection from '@/components/UI/CollapsibleSection.vue';
  import SkeletonGroup from '@/components/UI/SkeletonGroup.vue';
  import StatsGridCard from '@/components/UI/StatsGridCard.vue';
  import StatsGroupGrid from '@/components/UI/StatsGroupGrid.vue';
  import CheckCircleIcon from '@/assets/images/SVGs/CheckCircleIcon.svg';
  import MapPinLocationIcon from '@/assets/images/SVGs/MapPinLocationIcon.svg';
  import UsersGroupIcon from '@/assets/images/SVGs/UsersGroupIcon.svg';

  const departmentService = new DepartmentsServices();
  const loading = ref(true);
  const statistics = ref<IDepartmentStatistics>({
    totalDepartments: 0,
    totalCapacity: 0,
    averageCapacity: 0,
    withHead: 0,
    withoutHead: 0,
    departmentsByStatus: [],
  });

  const activeDepartments = computed(() => {
    const activeStatus = statistics.value.departmentsByStatus.find((s) => s.status.toLowerCase() === 'active');
    return activeStatus?.count ?? 0;
  });

  const loadStatistics = async () => {
    loading.value = true;
    try {
      const response = await departmentService.getDepartmentStatistics();
      if (response?.data) {
        statistics.value = response.data;
      }
    } catch (error) {
      console.error('Failed to load department statistics:', error);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    loadStatistics();
  });
</script>

<template>
  <CollapsibleSection title="Departments Overview">
    <SkeletonGroup v-if="loading" preset="stats-grid" :count="3" />

    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsGridCard label="Total Departments" :value="statistics.totalDepartments" variant="primary" :icon="MapPinLocationIcon" />
        <StatsGridCard label="Active Departments" :value="activeDepartments" variant="success" :icon="CheckCircleIcon" />
        <StatsGridCard label="Total Capacity" :value="statistics.totalCapacity" variant="secondary" :icon="UsersGroupIcon" />
      </div>

      <StatsGroupGrid v-if="statistics.departmentsByStatus?.length" title="Departments by Status" :items="statistics.departmentsByStatus.map((s) => ({ label: s.status, value: s.count }))" />
    </div>
  </CollapsibleSection>
</template>
