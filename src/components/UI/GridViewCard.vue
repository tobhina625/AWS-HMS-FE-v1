<script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { usePermissions } from '@/composables/usePermissions';
  import EditPencilIcon from '@/assets/images/SVGs/EditPencilIcon.svg';
  import TrashDetailedIcon from '@/assets/images/SVGs/TrashDetailedIcon.svg';
  import EyeSimpleIcon from '@/assets/images/SVGs/EyeSimpleIcon.svg';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseCheckbox from '@/components/Base/BaseCheckbox.vue';

  export interface ListStatsField {
    label: string;
    value: string | number;
    suffix?: string;
    badgeClass?: string;
  }

  export interface ListStatsCardProps {
    id: number | string;
    title: string;
    subtitle?: string;
    fields: ListStatsField[];
    selected?: boolean;
    selectable?: boolean;
    showEdit?: boolean;
    showDelete?: boolean;
    showDetails?: boolean;
    moduleName?: string;
  }

  const props = withDefaults(defineProps<ListStatsCardProps>(), {
    selected: false,
    selectable: true,
    showEdit: true,
    showDelete: false,
    showDetails: false,
    moduleName: '',
  });

  const emit = defineEmits<{
    edit: [];
    delete: [];
    detail: [];
    select: [id: number | string];
  }>();

  const route = useRoute();
  const { canEditModule, canViewModule, canDeleteFromModule } = usePermissions();

  const deriveModuleName = (path: string) => {
    const normalized = path.toLowerCase();
    if (normalized.includes('/patient-bills') || normalized.includes('/patient-bill')) return 'Patient Bills';
    if (normalized.includes('/lab-tests') || normalized.includes('/lab-test')) return 'Lab Tests';
    if (normalized.includes('/operation-theatre')) return 'Operation Theatre';
    if (normalized.includes('/purchase-orders') || normalized.includes('/purchase-order')) return 'Purchase Orders';
    if (normalized.includes('/patient-surgery') || normalized.includes('/patient-surgeries')) return 'Patient Surgeries';
    if (normalized.includes('/role-permissions') || normalized.includes('/permissions/roles')) return 'Role Permissions';
    if (normalized.includes('/employee-permissions') || normalized.includes('/permissions/employees')) return 'Employee Permissions';
    if (normalized.includes('/system-configuration')) return 'SystemConfiguration';
    if (normalized.includes('/appointments')) return 'Appointments';
    if (normalized.includes('/admissions')) return 'Admissions';
    if (normalized.includes('/availability')) return 'Availability';
    if (normalized.includes('/branches')) return 'Branches';
    if (normalized.includes('/departments')) return 'Departments';
    if (normalized.includes('/designations')) return 'Designations';
    if (normalized.includes('/diseases')) return 'Diseases';
    if (normalized.includes('/employees')) return 'Employees';
    if (normalized.includes('/inventory')) return 'Inventory';
    if (normalized.includes('/patients')) return 'Patients';
    if (normalized.includes('/roles')) return 'Roles';
    if (normalized.includes('/surgery')) return 'Surgeries';
    if (normalized.includes('/treatments')) return 'Treatments';
    if (normalized.includes('/vendors')) return 'Vendors';
    if (normalized.includes('/wards')) return 'Wards';
    return '';
  };

  const resolvedModuleName = computed(() => {
    if (props.moduleName) return props.moduleName;
    return deriveModuleName(route.path);
  });

  const effectiveShowEdit = computed(() => {
    return props.showEdit && (!resolvedModuleName.value || canEditModule(resolvedModuleName.value));
  });

  const effectiveShowDetails = computed(() => {
    return props.showDetails && (!resolvedModuleName.value || canViewModule(resolvedModuleName.value));
  });

  const effectiveShowDelete = computed(() => {
    return props.showDelete && (!resolvedModuleName.value || canDeleteFromModule(resolvedModuleName.value));
  });

  const handleSelect = () => {
    emit('select', props.id);
  };
</script>

<template>
  <div :class="['bg-surface rounded-lg border p-6 hover:shadow-lg transition-all relative', selected ? 'border-primary border-2 ring-2 ring-primary/20' : 'border-stroke dark:border-strokedark']">
    <div v-if="selectable" class="absolute top-3 left-3 z-10" @click.stop>
      <BaseCheckbox :model-value="selected" @change="handleSelect" :id="`grid-checkbox-${id}`" />
    </div>

    <div :class="['flex items-start justify-between mb-4', selectable ? 'ml-8' : '']">
      <div class="cursor-pointer flex-1" @click="emit('detail')">
        <h3 class="text-lg font-semibold text-emphasis">{{ title }}</h3>
        <p v-if="subtitle" class="text-sm text-bodydark dark:text-bodydark1">{{ subtitle }}</p>
        <slot name="header-extra"></slot>
      </div>
      <div class="flex gap-2">
        <BaseButton v-if="effectiveShowDetails" variant="ghost" size="sm" @click.stop="emit('detail')" class="!p-1 text-secondary hover:text-secondary/80" title="View Details">
          <EyeSimpleIcon class="w-5 h-5" />
        </BaseButton>
        <BaseButton v-if="effectiveShowEdit" variant="ghost" size="sm" @click.stop="emit('edit')" class="!p-1 text-primary hover:text-primary/80" title="Edit">
          <EditPencilIcon class="w-5 h-5" />
        </BaseButton>
        <BaseButton v-if="effectiveShowDelete" variant="ghost" size="sm" @click.stop="emit('delete')" class="!p-1 text-danger hover:text-danger-light" title="Delete">
          <TrashDetailedIcon class="w-5 h-5" />
        </BaseButton>
      </div>
    </div>

    <div class="space-y-2 text-sm">
      <div v-for="field in fields" :key="field.label" class="flex items-center gap-2">
        <span class="text-bodydark dark:text-bodydark1">{{ field.label }}:</span>
        <span v-if="field.badgeClass" :class="['inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase', field.badgeClass]">
          {{ field.value }}{{ field.suffix ? ` ${field.suffix}` : '' }}
        </span>
        <span v-else class="font-medium text-emphasis">{{ field.value }}{{ field.suffix ? ` ${field.suffix}` : '' }}</span>
      </div>
    </div>

    <slot name="footer"></slot>
  </div>
</template>
