<script setup lang="ts">
  import { useSidebarStore } from '@/stores/sidebar';
  import { onClickOutside } from '@vueuse/core';
  import { ref, computed, onMounted } from 'vue';
  import SidebarItem from './SidebarItem.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import { usePermissions } from '@/composables/usePermissions';
  import { useAuth } from '@/composables/useAuth';
  import ChevronLeftArrowIcon from '@/assets/images/SVGs/ChevronLeftArrow.svg';

  import DashboardSVG from '@/assets/images/SVGs/Dashboard.svg';
  import AppointmentSVG from '@/assets/images/SVGs/Appointment.svg';
  import PatientSVG from '@/assets/images/SVGs/Patient.svg';
  // import HistorySVG from '@/assets/images/SVGs/History.svg';
  // import BillingSVG from '@/assets/images/SVGs/Billing.svg';
  import WardSVG from '@/assets/images/SVGs/Department.svg';
  import OperationSVG from '@/assets/images/SVGs/OperationTheatre.svg';
  import SurgerySVG from '@/assets/images/SVGs/Surgery.svg';
  import LabTestSVG from '@/assets/images/SVGs/LabTest.svg';
  import EmployeeSVG from '@/assets/images/SVGs/Employee.svg';
  import DepartmentSVG from '@/assets/images/SVGs/Department.svg';
  import DesignationSVG from '@/assets/images/SVGs/Designation.svg';
  import DiseaseSVG from '@/assets/images/SVGs/Disease.svg';
  import InventorySVG from '@/assets/images/SVGs/Inventory.svg';
  import PermissionSVG from '@/assets/images/SVGs/Permission.svg';
  import ProfileSVG from '@/assets/images/SVGs/ProfileIcon.svg';
  import SettingsSVG from '@/assets/images/SVGs/SettingIcon.svg';
  import BriefcaseIcon from '@/assets/images/SVGs/BriefcaseIcon.svg';
  import ClipboardListIcon from '@/assets/images/SVGs/ClipboardListIcon.svg';
  import ClipboardCheckIcon from '@/assets/images/SVGs/ClipboardCheckIcon.svg';
  import CalendarIcon from '@/assets/images/SVGs/CalendarIcon.svg';
  import ShieldIcon from '@/assets/images/SVGs/ShieldIcon.svg';
  import ClipboardIcon from '@/assets/images/SVGs/ClipboardIcon.svg';

  const target = ref(null);
  const sidebarStore = useSidebarStore();
  const { canViewModule, loadUserPermissions } = usePermissions();
  const { hasRole } = useAuth();

  onClickOutside(target, () => {
    sidebarStore.isSidebarOpen = false;
  });

  const allMenuGroups = ref([
    {
      name: 'OVERVIEW',
      menuItems: [
        { icon: DashboardSVG, label: 'Dashboard', route: '/' },
        { icon: AppointmentSVG, label: 'Appointments', route: '/appointments' },
      ],
    },

    {
      name: 'CLINICAL',
      menuItems: [
        {
          icon: PatientSVG,
          label: 'Patients',
          route: '/patients',
        },
        { icon: WardSVG, label: 'Wards', route: '/wards' },
        { icon: OperationSVG, label: 'Operation Theatre', route: '/operation-theatre' },
        { icon: SurgerySVG, label: 'Surgery', route: '/surgery' },
        { icon: LabTestSVG, label: 'Lab Tests', route: '/lab-tests' },
        { icon: ClipboardIcon, label: 'Admissions', route: '/admissions' },
        { icon: ClipboardListIcon, label: 'Admission queue', route: '/admissions/queue' },
        { icon: ClipboardCheckIcon, label: 'Patient Surgeries', route: '/patient-surgeries' },
        { icon: ClipboardCheckIcon, label: 'Treatments', route: '/treatments' },
      ],
    },

    {
      name: 'ADMINISTRATION',
      menuItems: [
        { icon: EmployeeSVG, label: 'Employees', route: '/employees' },
        { icon: DepartmentSVG, label: 'Departments', route: '/departments' },
        { icon: DesignationSVG, label: 'Designations', route: '/designations' },
        { icon: DiseaseSVG, label: 'Disease', route: '/disease' },
        { icon: InventorySVG, label: 'Inventory', route: '/inventory' },
        { icon: CalendarIcon, label: 'Availability', route: '/availability' },
        { icon: DepartmentSVG, label: 'Branches', route: '/branches' },
        { icon: SettingsSVG, label: 'System Configuration', route: '/system-configuration' },
        {
          icon: PermissionSVG,
          label: 'Permissions',
          children: [
            { icon: PermissionSVG, label: 'Modules', route: '/modules' },
            { icon: PermissionSVG, label: 'Permissions', route: '/permissions' },
            { icon: ShieldIcon, label: 'Roles', route: '/roles' },
            { icon: PermissionSVG, label: 'Role Permissions', route: '/permissions/roles' },
            { icon: EmployeeSVG, label: 'Employee Permissions', route: '/permissions/employees' },
          ],
        },
      ],
    },

    {
      name: 'FINANCE',
      menuItems: [
        { icon: BriefcaseIcon, label: 'Vendors', route: '/vendors' },
        { icon: ClipboardListIcon, label: 'Purchase Orders', route: '/purchase-orders' },
      ],
    },

    {
      name: 'OTHERS',
      menuItems: [
        { icon: ProfileSVG, label: 'Profile', route: '/profile' },
        { icon: SettingsSVG, label: 'Settings', route: '/settings' },
      ],
    },
  ]);

  // Map route paths to module names for permission checking
  const routeToModuleMap: Record<string, string> = {
    '/': 'Dashboard',
    '/appointments': 'Appointments',
    '/patients': 'Patients',
    '/PatientHistoryForPatient': 'Patient History',
    '/patient-bill': 'Patient Bills',
    '/wards': 'Wards',
    '/operation-theatre': 'Operation Theatre',
    '/surgery': 'Surgery',
    '/lab-tests': 'Lab Tests',
    '/lab-test': 'Lab Tests',
    '/employees': 'Employees',
    '/departments': 'Departments',
    '/designations': 'Designations',
    '/disease': 'Disease',
    '/inventory': 'Inventory',
    '/availability': 'Availability',
    '/permissions/roles': 'Role Permissions',
    '/permissions/employees': 'Employee Permissions',
    '/modules': 'Modules',
    '/permissions': 'Permissions',
    '/roles': 'Roles',
    '/profile': 'Profile',
    '/settings': 'Settings',
    '/admissions': 'Admissions',
    '/admissions/queue': 'Admissions',
    '/patient-surgeries': 'Patient Surgeries',
    '/treatments': 'Treatments',
    '/vendors': 'Vendors',
    '/purchase-orders': 'Purchase Orders',
    '/branches': 'Branches',
    '/system-configuration': 'SystemConfiguration',
  };

  const checkItemPermission = (item: any): boolean => {
    // Always show Dashboard, Profile, and Settings for all users
    if (item.route === '/' || item.route === '/profile' || item.route === '/settings') {
      return true;
    }

    // Check if user is admin (has access to all permission-related features)
    const isUserAdmin = hasRole('Admin') || hasRole('SuperAdmin') || hasRole('System Administrator') || hasRole('Hospital Administrator');
    if (isUserAdmin) {
      return true;
    }

    // If item has children, check if at least one child is accessible
    if (item.children && item.children.length > 0) {
      const hasAccessibleChild = item.children.some((child: any) => checkItemPermission(child));
      return hasAccessibleChild;
    }

    // Check permission for the route
    if (item.route) {
      const moduleName = routeToModuleMap[item.route];
      if (moduleName) {
        const hasPermission = canViewModule(moduleName);
        return hasPermission;
      }
    }

    // Default: show the item if no specific permission check
    return true;
  };

  const filterMenuItems = (items: any[]): any[] => {
    return items
      .filter((item) => checkItemPermission(item))
      .map((item) => {
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: filterMenuItems(item.children),
          };
        }
        return item;
      });
  };

  const menuGroups = computed(() => {
    return allMenuGroups.value
      .map((group) => ({
        ...group,
        menuItems: filterMenuItems(group.menuItems),
      }))
      .filter((group) => group.menuItems.length > 0);
  });

  onMounted(async () => {
    await loadUserPermissions();
  });
</script>

<template>
  <aside
    class="absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-blue-sidebar duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0"
    :class="{
      'translate-x-0': sidebarStore.isSidebarOpen,
      '-translate-x-full': !sidebarStore.isSidebarOpen,
    }"
    ref="target"
  >
    <!-- SIDEBAR HEADER -->
    <div class="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
      <router-link to="/">
        <img :src="'/src/assets/images/SVGs/logo.svg'" alt="Logo" />
      </router-link>

      <BaseButton variant="ghost" size="sm" class="!p-1 lg:hidden text-light" @click="sidebarStore.isSidebarOpen = false">
        <ChevronLeftArrowIcon class="w-5 h-[18px]" />
      </BaseButton>
    </div>
    <!-- SIDEBAR HEADER -->

    <div class="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
      <!-- Sidebar Menu -->
      <nav class="py-4 px-4 lg:px-6">
        <template v-for="menuGroup in menuGroups" :key="menuGroup.name">
          <div>
            <h3 class="mt-4 mb-1 ml-4 text-[10px] font-semibold tracking-widest text-white/50 uppercase">{{ menuGroup.name }}</h3>

            <ul class="mb-2 flex flex-col gap-0.5">
              <SidebarItem v-for="(menuItem, index) in menuGroup.menuItems" :item="menuItem" :key="index" :index="index" />
            </ul>
          </div>
        </template>
      </nav>
      <!-- Sidebar Menu -->
    </div>
  </aside>
</template>
