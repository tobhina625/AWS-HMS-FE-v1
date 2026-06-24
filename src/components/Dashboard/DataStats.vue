<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import BaseCard from '@/components/Base/BaseCard.vue';
  import staffIcon from '@/assets/images/SVGs/staff.svg';
  import consultationIcon from '@/assets/images/SVGs/consultation.svg';
  import appointmentIcon from '@/assets/images/SVGs/Appointment.svg';
  import PatientIcon from '@/assets/images/SVGs/Patient.svg';
  import BedIcon from '@/assets/images/SVGs/Bed.svg';
  import DepartmentIcon from '@/assets/images/SVGs/Department.svg';
  import SurgeryIcon from '@/assets/images/SVGs/Surgery.svg';
  import InventoryIcon from '@/assets/images/SVGs/Inventory.svg';
  import OperationTheatreIcon from '@/assets/images/SVGs/OperationTheatre.svg';
  import DiseaseIcon from '@/assets/images/SVGs/Disease.svg';
  import ArrowUpGrowthIcon from '@/assets/images/SVGs/ArrowUpGrowth.svg';
  import DashboardService from '@/services/Dashboard/dashboard.service';

  const dashboardService = new DashboardService();
  const loading = ref(true);

  const cardItems = ref([
    {
      profileLogo: appointmentIcon,
      title: 'Appointments',
      total: '0',
      statKey: 'appointmentsCount',
      iconStyle: 'background: linear-gradient(135deg, var(--color-gradient-blue-start), var(--color-gradient-blue-end))',
      glowColor: 'var(--color-glow-blue)',
    },
    {
      profileLogo: consultationIcon,
      title: 'Consultations',
      total: '0',
      statKey: 'consultationsCount',
      iconStyle: 'background: linear-gradient(135deg, var(--color-gradient-teal-start), var(--color-gradient-teal-end))',
      glowColor: 'var(--color-glow-teal)',
    },
    {
      profileLogo: staffIcon,
      title: 'Active Staff',
      total: '0',
      statKey: 'activeStaffCount',
      iconStyle: 'background: linear-gradient(135deg, var(--color-gradient-purple-start), var(--color-gradient-purple-end))',
      glowColor: 'var(--color-glow-purple)',
    },
    {
      profileLogo: PatientIcon,
      title: 'Patients',
      total: '0',
      statKey: 'totalPatients',
      iconStyle: 'background: linear-gradient(135deg, var(--color-gradient-sky-start), var(--color-gradient-sky-end))',
      glowColor: 'var(--color-glow-sky)',
    },
    {
      profileLogo: BedIcon,
      title: 'Wards / Beds',
      total: '0',
      statKey: 'wardsBeds',
      iconStyle: 'background: linear-gradient(135deg, var(--color-gradient-green-start), var(--color-gradient-green-end))',
      glowColor: 'var(--color-glow-green)',
    },
    {
      profileLogo: DepartmentIcon,
      title: 'Departments',
      total: '0',
      statKey: 'totalDepartments',
      iconStyle: 'background: linear-gradient(135deg, var(--color-gradient-amber-start), var(--color-gradient-amber-end))',
      glowColor: 'var(--color-glow-amber)',
    },
    {
      profileLogo: SurgeryIcon,
      title: 'Surgeries',
      total: '0',
      statKey: 'totalSurgeries',
      iconStyle: 'background: linear-gradient(135deg, var(--color-gradient-red-start), var(--color-gradient-red-end))',
      glowColor: 'var(--color-glow-red)',
    },
    {
      profileLogo: InventoryIcon,
      title: 'Inventory',
      total: '0',
      statKey: 'inventoryItems',
      iconStyle: 'background: linear-gradient(135deg, var(--color-gradient-violet-start), var(--color-gradient-violet-end))',
      glowColor: 'var(--color-glow-violet)',
    },
    {
      profileLogo: OperationTheatreIcon,
      title: 'OT Theatres',
      total: '0',
      statKey: 'operationTheatres',
      iconStyle: 'background: linear-gradient(135deg, var(--color-gradient-pink-start), var(--color-gradient-pink-end))',
      glowColor: 'var(--color-glow-pink)',
    },
    {
      profileLogo: DiseaseIcon,
      title: 'Diseases',
      total: '0',
      statKey: 'totalDiseases',
      iconStyle: 'background: linear-gradient(135deg, var(--color-gradient-slate-start), var(--color-gradient-slate-end))',
      glowColor: 'var(--color-glow-slate)',
    },
  ]);

  const fetchStats = async () => {
    loading.value = true;
    try {
      const response = await dashboardService.getDashboardStats();
      const data = response?.data;
      if (data) {
        const get = (k: string) => data[k] ?? data[k.charAt(0).toUpperCase() + k.slice(1)] ?? 0;
        cardItems.value.forEach((item) => {
          if (item.statKey === 'wardsBeds') {
            item.total = `${get('totalWards')} / ${get('totalBeds')}`;
          } else {
            item.total = String(get(item.statKey));
          }
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      loading.value = false;
    }
  };

  let refreshInterval: ReturnType<typeof setInterval> | null = null;
  onMounted(() => {
    fetchStats();
    refreshInterval = setInterval(fetchStats, 60000);
  });
  onUnmounted(() => {
    if (refreshInterval) clearInterval(refreshInterval);
  });
</script>

<template>
  <BaseCard v-for="(item, index) in cardItems" :key="index" no-padding class="relative group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    <div class="p-6">
      <!-- Background Decoration -->
      <div class="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-100 group-hover:opacity-100 transition-opacity duration-300" :style="{ background: item.glowColor }"></div>

      <div class="flex items-center gap-4">
        <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110" :style="item.iconStyle">
          <component :is="item.profileLogo" class="w-8 h-8 text-white" />
        </div>

        <div>
          <h4 class="text-2xl font-black text-emphasis leading-none mb-1">
            {{ item.total }}
          </h4>
          <span class="text-sm font-bold text-bodydark dark:text-bodydark1 uppercase tracking-wider">
            {{ item.title }}
          </span>
        </div>
      </div>

      <!-- Growth Indicator -->
      <div class="mt-4 flex items-center gap-2">
        <span class="flex items-center text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
          <ArrowUpGrowthIcon class="w-3 h-3 mr-1" />
          12%
        </span>
        <span class="text-[10px] font-medium text-bodydark2 uppercase tracking-tighter">vs last month</span>
      </div>
    </div>
  </BaseCard>
</template>
