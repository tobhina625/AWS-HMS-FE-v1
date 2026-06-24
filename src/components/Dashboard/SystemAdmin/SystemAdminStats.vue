<script setup lang="ts">
  import { ref, watch } from 'vue';
  import BaseCard from '@/components/Base/BaseCard.vue';
  import staffIcon from '@/assets/images/SVGs/staff.svg';
  import PermissionIcon from '@/assets/images/SVGs/Permission.svg';
  import DepartmentIcon from '@/assets/images/SVGs/Department.svg';
  import EmployeeIcon from '@/assets/images/SVGs/Employee.svg';
  import DesignationIcon from '@/assets/images/SVGs/Designation.svg';
  import PatientIcon from '@/assets/images/SVGs/Patient.svg';
  import BedIcon from '@/assets/images/SVGs/Bed.svg';
  import InventoryIcon from '@/assets/images/SVGs/Inventory.svg';
  import OperationTheatreIcon from '@/assets/images/SVGs/OperationTheatre.svg';

  const props = defineProps<{
    data?: any;
    loading?: boolean;
  }>();

  const cardItems = ref([
    {
      profileLogo: EmployeeIcon,
      title: 'Employees',
      total: '0',
      statKey: 'totalEmployees',
      iconStyle: 'background: linear-gradient(135deg, var(--color-gradient-blue-start), var(--color-gradient-blue-end))',
      glowColor: 'var(--color-glow-blue)',
    },
    {
      profileLogo: staffIcon,
      title: 'Roles',
      total: '0',
      statKey: 'totalRoles',
      iconStyle: 'background: linear-gradient(135deg, var(--color-gradient-teal-start), var(--color-gradient-teal-end))',
      glowColor: 'var(--color-glow-teal)',
    },
    {
      profileLogo: PermissionIcon,
      title: 'Modules',
      total: '0',
      statKey: 'totalModules',
      iconStyle: 'background: linear-gradient(135deg, var(--color-gradient-purple-start), var(--color-gradient-purple-end))',
      glowColor: 'var(--color-glow-purple)',
    },
    {
      profileLogo: DesignationIcon,
      title: 'Designations',
      total: '0',
      statKey: 'totalDesignations',
      iconStyle: 'background: linear-gradient(135deg, var(--color-gradient-amber-start), var(--color-gradient-amber-end))',
      glowColor: 'var(--color-glow-amber)',
    },
    {
      profileLogo: DepartmentIcon,
      title: 'Departments',
      total: '0',
      statKey: 'totalDepartments',
      iconStyle: 'background: linear-gradient(135deg, var(--color-gradient-red-start), var(--color-gradient-red-end))',
      glowColor: 'var(--color-glow-red)',
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
      title: 'Wards',
      total: '0',
      statKey: 'totalWards',
      iconStyle: 'background: linear-gradient(135deg, var(--color-gradient-green-start), var(--color-gradient-green-end))',
      glowColor: 'var(--color-glow-green)',
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
  ]);

  const updateFromData = (data: any) => {
    if (!data?.stats) return;
    const stats = data.stats;
    cardItems.value.forEach((item) => {
      const key = item.statKey;
      const value = stats[key] ?? stats[key.charAt(0).toUpperCase() + key.slice(1)] ?? 0;
      item.total = String(value);
    });
  };

  watch(
    () => props.data,
    (data) => updateFromData(data),
    { immediate: true }
  );
</script>

<template>
  <BaseCard v-for="(item, index) in cardItems" :key="index" no-padding class="relative group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    <div class="p-6">
      <div class="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-100 transition-opacity duration-300" :style="{ background: item.glowColor }"></div>

      <div class="flex items-center gap-4">
        <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110" :style="item.iconStyle">
          <component :is="item.profileLogo" class="w-8 h-8 text-white" />
        </div>

        <div>
          <h4 class="text-2xl font-black text-emphasis leading-none mb-1">
            {{ item.total }}
          </h4>
          <span class="text-sm font-bold text-muted uppercase tracking-wider">
            {{ item.title }}
          </span>
        </div>
      </div>
    </div>
  </BaseCard>
</template>
