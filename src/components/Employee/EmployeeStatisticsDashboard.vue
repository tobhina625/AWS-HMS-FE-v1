<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import EmployeeServices from '@/services/Employee/Employee.services';
  import CollapsibleSection from '@/components/UI/CollapsibleSection.vue';
  import SkeletonGroup from '@/components/UI/SkeletonGroup.vue';
  import ProgressBar from '@/components/UI/ProgressBar.vue';
  import StatsGridCard from '@/components/UI/StatsGridCard.vue';
  import StatsGroupGrid from '@/components/UI/StatsGroupGrid.vue';
  import CalendarIcon from '@/assets/images/SVGs/CalendarIcon.svg';
  import CheckCircleIcon from '@/assets/images/SVGs/CheckCircleIcon.svg';
  import ClockIcon from '@/assets/images/SVGs/ClockIcon.svg';
  import UsersGroupIcon from '@/assets/images/SVGs/UsersGroupIcon.svg';

  const employeeService = new EmployeeServices();
  const loading = ref(true);
  const statistics = ref<any>(null);

  const loadStatistics = async () => {
    loading.value = true;
    try {
      const response = await employeeService.getEmployeeStatistics();
      if (response?.data) {
        statistics.value = response.data;
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      loading.value = false;
    }
  };

  const certificationPercentage = computed(() => {
    if (!statistics.value || statistics.value.totalEmployees === 0) return 0;
    return Math.round((statistics.value.averageCertifications / 3) * 100);
  });

  const activePercentage = computed(() => {
    if (!statistics.value || statistics.value.totalEmployees === 0) return 0;
    return Math.round((statistics.value.activeEmployees / statistics.value.totalEmployees) * 100);
  });

  onMounted(() => {
    loadStatistics();
  });
</script>

<template>
  <CollapsibleSection title="Employee Statistics">
    <SkeletonGroup v-if="loading" preset="stats-grid" />

    <div v-else-if="statistics" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsGridCard label="Total Employees" :value="statistics.totalEmployees" variant="primary" :icon="UsersGroupIcon" />
        <StatsGridCard label="Active Staff" :value="statistics.activeEmployees" :subtitle="`${activePercentage}% of total`" variant="success" :icon="CheckCircleIcon" />
        <StatsGridCard label="On Duty" :value="statistics.onDutyEmployees" subtitle="Currently working" variant="secondary" :icon="ClockIcon" />
        <StatsGridCard label="On Leave" :value="statistics.onLeaveEmployees" variant="warning" :icon="CalendarIcon" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-elevated rounded-xl p-6">
          <h3 class="text-lg font-semibold text-emphasis mb-4">Certifications</h3>
          <div class="space-y-4">
            <ProgressBar :value="certificationPercentage" label="Average Certifications" variant="primary" value-format="fraction" />
            <div class="grid grid-cols-3 gap-4 pt-4 border-t border-stroke dark:border-strokedark">
              <div>
                <p class="text-xs text-bodydark dark:text-bodydark1 mb-1">Medical</p>
                <p class="text-xl font-bold text-primary dark:text-primary">{{ statistics.withMedicalLicense }}</p>
              </div>
              <div>
                <p class="text-xs text-bodydark dark:text-bodydark1 mb-1">Surgical</p>
                <p class="text-xl font-bold text-secondary dark:text-secondary">{{ statistics.withSurgicalCertification }}</p>
              </div>
              <div>
                <p class="text-xs text-bodydark dark:text-bodydark1 mb-1">Specialized</p>
                <p class="text-xl font-bold text-success dark:text-success">{{ statistics.withSpecializedTraining }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-elevated rounded-xl p-6">
          <h3 class="text-lg font-semibold text-emphasis mb-4">Status Distribution</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-bodydark dark:text-bodydark1">Active</span>
              <span class="text-sm font-semibold text-success dark:text-success">{{ statistics.activeEmployees }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-bodydark dark:text-bodydark1">Inactive</span>
              <span class="text-sm font-semibold text-muted dark:text-muted">{{ statistics.inactiveEmployees }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-bodydark dark:text-bodydark1">On Leave</span>
              <span class="text-sm font-semibold text-warning dark:text-warning">{{ statistics.onLeaveEmployees }}</span>
            </div>
          </div>
        </div>
      </div>

      <StatsGroupGrid
        v-if="statistics.employeesBySpecialization?.length"
        title="By Specialization"
        :items="statistics.employeesBySpecialization.map((s: any) => ({ label: s.specialization.replace(/([A-Z])/g, ' $1').trim(), value: s.count }))"
      />

      <StatsGroupGrid
        v-if="statistics.employeesByDepartment?.length"
        title="By Department"
        :items="statistics.employeesByDepartment.map((d: any) => ({ label: d.department, value: d.count }))"
        :columns="3"
      />
    </div>
  </CollapsibleSection>
</template>
