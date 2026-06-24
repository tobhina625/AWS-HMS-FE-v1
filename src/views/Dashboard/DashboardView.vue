<script setup lang="ts">
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import AppointmentOverviewChart from '@/components/Dashboard/AppointmentOverviewChart.vue';
  import DataStats from '@/components/Dashboard/DataStats.vue';
  import DepartmentsChatCard from '@/components/Dashboard/DepartmentsChatCard.vue';
  import DoctorsChatCard from '@/components/Dashboard/DoctorsChatCard.vue';
  import IncomeChart from '@/components/Dashboard/IncomeChart.vue';
  import AppointmentTable from '@/components/Dashboard/AppointmentTable.vue';
  import SystemAdminStats from '@/components/Dashboard/SystemAdmin/SystemAdminStats.vue';
  import SystemAdminEmployeesByRoleChart from '@/components/Dashboard/SystemAdmin/SystemAdminEmployeesByRoleChart.vue';
  import SystemAdminModuleStatus from '@/components/Dashboard/SystemAdmin/SystemAdminModuleStatus.vue';
  import SystemAdminQuickLinks from '@/components/Dashboard/SystemAdmin/SystemAdminQuickLinks.vue';
  import { useAuth } from '@/composables/useAuth';
  import DashboardService from '@/services/Dashboard/dashboard.service';
  import { ref, onMounted, onUnmounted, computed, watch } from 'vue';

  const { getUser, hasRole } = useAuth();
  const currentTime = ref('');
  const currentDate = ref('');
  const dashboardService = new DashboardService();

  const isSystemAdmin = computed(() => hasRole('System Administrator'));
  const systemAdminData = ref<any>(null);
  const systemAdminLoading = ref(false);

  const userName = computed(() => {
    const user = getUser();
    return user?.userName ?? 'User';
  });

  const updateDateTime = () => {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    currentDate.value = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const fetchSystemAdminDashboard = async () => {
    if (!isSystemAdmin.value) return;
    systemAdminLoading.value = true;
    try {
      const response = await dashboardService.getDashboardByRole();
      systemAdminData.value = response?.data ?? null;
    } catch (error) {
      console.error('Error fetching system admin dashboard:', error);
    } finally {
      systemAdminLoading.value = false;
    }
  };

  let timer: ReturnType<typeof setInterval>;

  onMounted(() => {
    updateDateTime();
    timer = setInterval(updateDateTime, 1000);
    if (isSystemAdmin.value) fetchSystemAdminDashboard();
  });

  onUnmounted(() => {
    clearInterval(timer);
  });

  watch(isSystemAdmin, (val) => {
    if (val) fetchSystemAdminDashboard();
  });
</script>

<template>
  <DefaultLayout>
    <!-- Modern Dashboard Header -->
    <header class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-emphasis tracking-tight">
          Welcome back,
          <span class="text-primary italic">{{ userName }}</span>
        </h1>
        <p class="text-muted font-medium mt-1">
          {{ isSystemAdmin ? 'System administration and configuration overview.' : "Here's what's happening at your hospital today." }}
        </p>
      </div>
      <div class="flex flex-col items-end text-right">
        <span class="text-2xl font-bold text-emphasis">{{ currentTime }}</span>
        <span class="text-sm font-semibold text-primary/80 uppercase tracking-wider">{{ currentDate }}</span>
      </div>
    </header>

    <!-- System Administrator Dashboard -->
    <div v-if="isSystemAdmin" class="space-y-8">
      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        <SystemAdminStats :data="systemAdminData" :loading="systemAdminLoading" />
      </div>

      <!-- Charts & Quick Links -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-8">
          <SystemAdminEmployeesByRoleChart :data="systemAdminData" :loading="systemAdminLoading" />
        </div>
        <div class="lg:col-span-4">
          <SystemAdminModuleStatus :data="systemAdminData" :loading="systemAdminLoading" />
        </div>
      </div>

      <!-- Quick Actions -->
      <SystemAdminQuickLinks />
    </div>

    <!-- Default Dashboard (other roles) -->
    <div v-else class="flex flex-col xl:flex-row gap-8">
      <!-- Left Column: Stats & Charts -->
      <div class="flex-[3] space-y-8">
        <!-- Quick Stats - 2 rows of 5 cards each on xl -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <DataStats />
        </div>

        <!-- Income & Operations -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div class="lg:col-span-12 xl:col-span-12">
            <IncomeChart />
          </div>

          <div class="lg:col-span-6">
            <DoctorsChatCard />
          </div>

          <div class="lg:col-span-6">
            <DepartmentsChatCard />
          </div>
        </div>
      </div>

      <!-- Right Column: Schedule & Overview -->
      <div class="flex-1 space-y-8">
        <div class="sticky top-24 space-y-8">
          <AppointmentTable />
          <AppointmentOverviewChart />
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<style scoped>
  /* Glassmorphism utility handled in global css or component-specific styles */
</style>
