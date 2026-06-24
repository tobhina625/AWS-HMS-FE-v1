<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import EmployeeIcon from '@/assets/images/SVGs/Employee.svg';
  import PermissionIcon from '@/assets/images/SVGs/Permission.svg';
  import DepartmentIcon from '@/assets/images/SVGs/Department.svg';
  import DesignationIcon from '@/assets/images/SVGs/Designation.svg';
  import SettingIcon from '@/assets/images/SVGs/SettingIcon.svg';

  const router = useRouter();

  const quickLinks = [
    { title: 'Employees', path: '/employees', icon: EmployeeIcon, color: 'bg-primary text-emphasis' },
    { title: 'Roles & Permissions', path: '/permissions/roles', icon: PermissionIcon, color: 'bg-secondary text-emphasis' },
    { title: 'Employee Permissions', path: '/permissions/employees', icon: PermissionIcon, color: 'bg-primary-light text-emphasis' },
    { title: 'Departments', path: '/departments', icon: DepartmentIcon, color: 'bg-warning text-emphasis' },
    { title: 'Designations', path: '/designations', icon: DesignationIcon, color: 'bg-danger-light text-emphasis' },
    { title: 'Settings', path: '/settings', icon: SettingIcon, color: 'bg-bodydark text-light' },
  ];

  const navigateTo = (path: string) => {
    router.push(path);
  };
</script>

<template>
  <div class="rounded-2xl border border-white/40 bg-surface p-6 shadow-xl dark:border-strokedark/50 transition-all duration-300">
    <div class="mb-6">
      <h2 class="text-xl font-extrabold text-emphasis tracking-tight">Quick Actions</h2>
      <p class="text-sm font-semibold text-muted uppercase tracking-wider">Manage system configuration</p>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <BaseButton
        v-for="(link, index) in quickLinks"
        :key="index"
        variant="ghost"
        type="button"
        class="flex flex-col items-center gap-3 p-4 rounded-xl border border-transparent hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 h-auto group"
        @click="navigateTo(link.path)"
      >
        <div class="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110" :class="link.color">
          <component :is="link.icon" class="w-6 h-6" />
        </div>
        <span class="text-xs font-bold text-center text-emphasis uppercase tracking-wider">{{ link.title }}</span>
      </BaseButton>
    </div>
  </div>
</template>
