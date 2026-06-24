<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import type { IAppointmentStatistics } from '@/services/Appointment/appointment.interface';
  import AppointmentServices from '@/services/Appointment/appointment.services';
  import CollapsibleSection from '@/components/UI/CollapsibleSection.vue';
  import SkeletonGroup from '@/components/UI/SkeletonGroup.vue';
  import StatsGroupGrid from '@/components/UI/StatsGroupGrid.vue';
  import CalendarIcon from '@/assets/images/SVGs/CalendarIcon.svg';
  import CheckCircleIcon from '@/assets/images/SVGs/CheckCircleIcon.svg';
  import ClockIcon from '@/assets/images/SVGs/ClockIcon.svg';
  import TrendingUpIcon from '@/assets/images/SVGs/TrendingUpIcon.svg';

  const appointmentService = new AppointmentServices();
  const loading = ref(true);
  const statistics = ref<IAppointmentStatistics>({
    totalAppointments: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    appointmentsByStatus: [],
    appointmentsByType: [],
    appointmentsByPriority: [],
  });

  const fetchStatistics = async () => {
    loading.value = true;
    try {
      const response = await appointmentService.getAppointmentStatistics();
      if (response?.data) {
        statistics.value = response.data;
      }
    } catch (error) {
      console.error('Error fetching appointment statistics:', error);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => fetchStatistics());
</script>

<template>
  <CollapsibleSection title="Appointments Overview">
    <SkeletonGroup v-if="loading" preset="stats-grid" />

    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/20">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-primary dark:text-primary">Total</span>
            <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <CalendarIcon class="w-5 h-5 text-primary dark:text-primary" />
            </div>
          </div>
          <p class="text-3xl font-bold text-emphasis">{{ statistics.totalAppointments }}</p>
        </div>

        <div class="bg-warning/5 dark:bg-warning/10 rounded-xl p-4 border border-warning/20">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-warning dark:text-warning">Today</span>
            <div class="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
              <ClockIcon class="w-5 h-5 text-warning dark:text-warning" />
            </div>
          </div>
          <p class="text-3xl font-bold text-emphasis">{{ statistics.todayAppointments }}</p>
        </div>

        <div class="bg-success/5 dark:bg-success/10 rounded-xl p-4 border border-success/20">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-secondary dark:text-secondary">Upcoming</span>
            <div class="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
              <TrendingUpIcon class="w-5 h-5 text-secondary dark:text-secondary" />
            </div>
          </div>
          <p class="text-3xl font-bold text-emphasis">{{ statistics.upcomingAppointments }}</p>
        </div>

        <div class="bg-success/5 dark:bg-success/10 rounded-xl p-4 border border-success/20">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-success dark:text-success">Completed</span>
            <div class="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircleIcon class="w-5 h-5 text-success dark:text-success" />
            </div>
          </div>
          <p class="text-3xl font-bold text-emphasis">{{ statistics.completedAppointments }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsGroupGrid
          v-if="statistics.appointmentsByStatus?.length"
          title="By Status"
          :items="statistics.appointmentsByStatus.map((s) => ({ label: s.status, value: s.count }))"
          :columns="2"
          variant="muted"
        />

        <StatsGroupGrid
          v-if="statistics.appointmentsByType?.length"
          title="By Type"
          :items="statistics.appointmentsByType.map((t) => ({ label: t.type, value: t.count }))"
          :columns="2"
          variant="muted"
        />

        <StatsGroupGrid
          v-if="statistics.appointmentsByPriority?.length"
          title="By Priority"
          :items="statistics.appointmentsByPriority.map((p) => ({ label: p.priority, value: p.count }))"
          :columns="2"
          variant="muted"
        />
      </div>
    </div>
  </CollapsibleSection>
</template>
