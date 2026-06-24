<script setup>
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { usePermissions } from '@/composables/usePermissions';
  import EditPageIcon from '@/assets/images/SVGs/Edit.svg';
  import DeletePageIcon from '@/assets/images/SVGs/Delete.svg';
  import DetailPageIcon from '@/assets/images/SVGs/View.svg';
  import HistoryPageIcon from '@/assets/images/SVGs/History.svg';
  import PermissionIcon from '@/assets/images/SVGs/Permission.svg';
  import EmptyStateDefaultIcon from '@/assets/images/SVGs/EmptyStateDefault.svg';
  import BaseCheckbox from '@/components/Base/BaseCheckbox.vue';

  const props = defineProps({
    data: {
      type: Array,
      required: true,
    },
    moduleName: {
      type: String,
      default: '',
    },
    columns: {
      type: Array,
      default: null,
    },
    showEdit: {
      type: Boolean,
      default: false,
    },
    showDelete: {
      type: Boolean,
      default: false,
    },
    showDetails: {
      type: Boolean,
      default: false,
    },
    showHistory: {
      type: Boolean,
      default: false,
    },
    showPermission: {
      type: Boolean,
      default: false,
    },
    selectable: {
      type: Boolean,
      default: false,
    },
    selectedIds: {
      type: Array,
      default: () => [],
    },
    itemKey: {
      type: String,
      default: 'id',
    },
    statusColorMap: {
      type: Object,
      default: null,
    },
  });

  const emit = defineEmits(['edit', 'delete', 'detail', 'history', 'permission', 'select', 'selectAll']);

  const route = useRoute();
  const { canEditModule, canViewModule, canDeleteFromModule } = usePermissions();

  const deriveModuleName = (path) => {
    const normalized = path.toLowerCase();

    if (normalized.includes('/patient-bills') || normalized.includes('/patient-bill')) return 'Patient Bills';
    if (normalized.includes('/lab-tests') || normalized.includes('/lab-test')) return 'Lab Tests';
    if (normalized.includes('/operation-theatre') || normalized.includes('/operation-theatre')) return 'Operation Theatre';
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

  const hasActions = computed(() => {
    return effectiveShowEdit.value || effectiveShowDelete.value || effectiveShowDetails.value || props.showHistory || props.showPermission;
  });

  const headers = computed(() => {
    if (props.data.length === 0) return [];

    // If custom columns are provided, use them
    if (props.columns && props.columns.length > 0) {
      return props.columns;
    }

    // Otherwise, auto-generate from data keys
    return Object.keys(props.data[0]).filter((key) => {
      const lowerKey = key.toLowerCase();
      return lowerKey !== 'id' && lowerKey !== 'password' && lowerKey !== 'image' && lowerKey !== 'isdeleted';
    });
  });

  const allSelected = computed(() => {
    if (props.data.length === 0) return false;
    return props.data.every((item) => props.selectedIds.includes(item[props.itemKey]));
  });

  function formatHeader(key) {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  }

  function formatCellValue(value) {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object' && value !== null) {
      // Handle nested objects (like department: { id, name })
      return value.name || value.Name || JSON.stringify(value);
    }
    return value;
  }

  function handleSelectAll(checked) {
    emit('selectAll', checked);
  }

  function handleSelect(itemId) {
    emit('select', itemId);
  }

  function isSelected(item) {
    return props.selectedIds.includes(item[props.itemKey]);
  }

  function getStatusBadgeClass(key, item) {
    if (!props.statusColorMap) return 'bg-meta-3/20 text-meta-3 border border-meta-3/40 dark:bg-meta-3/30 dark:border-meta-3/50';
    const value = formatCellValue(item[key]);
    return props.statusColorMap[value] || 'bg-meta-3/20 text-meta-3 border border-meta-3/40 dark:bg-meta-3/30 dark:border-meta-3/50';
  }
</script>

<template>
  <div class="w-full">
    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="w-full table-auto border-collapse">
        <thead class="bg-elevated/30">
          <tr>
            <th v-if="selectable" class="py-4 px-6 w-16 border-b border-stroke dark:border-strokedark">
              <div class="flex items-center justify-center">
                <BaseCheckbox :model-value="allSelected" @change="handleSelectAll" :id="`select-all-checkbox`" />
              </div>
            </th>
            <th
              v-for="header in headers"
              :key="header"
              class="py-4 px-6 text-left text-[11px] font-black uppercase tracking-widest text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark"
            >
              {{ formatHeader(header) }}
            </th>
            <th v-if="hasActions" class="py-4 px-6 text-right text-[11px] font-black uppercase tracking-widest text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-strokedark/50">
          <tr v-for="(item, index) in props.data" :key="index" class="group hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-colors">
            <td v-if="selectable" class="py-5 px-6 w-16">
              <div class="flex items-center justify-center">
                <BaseCheckbox :model-value="isSelected(item)" @change="() => handleSelect(item[itemKey])" :id="`checkbox-${item[itemKey]}`" />
              </div>
            </td>
            <td v-for="key in headers" :key="key" class="py-5 px-6 whitespace-nowrap text-sm font-semibold text-emphasis">
              <div v-if="key.toLowerCase().includes('status')" :class="['inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase', getStatusBadgeClass(key, item)]">
                {{ formatCellValue(item[key]) || '-' }}
              </div>
              <template v-else>
                {{ formatCellValue(item[key]) }}
              </template>
            </td>
            <td v-if="hasActions" class="py-5 px-6 whitespace-nowrap">
              <div class="flex items-center justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                <div
                  v-if="showHistory"
                  @click="emit('history', item)"
                  title="History"
                  class="p-2 rounded-xl cursor-pointer text-gray-500 hover:bg-elevated hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200 w-8 h-8 flex items-center justify-center"
                >
                  <HistoryPageIcon class="w-5 h-5 transition-colors duration-200" />
                </div>

                <div
                  v-if="effectiveShowDetails"
                  @click="emit('detail', item)"
                  title="Details"
                  class="p-2 rounded-xl cursor-pointer text-gray-500 hover:bg-elevated hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200 w-8 h-8 flex items-center justify-center"
                >
                  <DetailPageIcon class="w-5 h-5 transition-colors duration-200" />
                </div>

                <div
                  v-if="effectiveShowEdit"
                  @click="emit('edit', item)"
                  title="Edit"
                  class="p-2 rounded-xl cursor-pointer text-gray-500 hover:bg-elevated hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200 w-8 h-8 flex items-center justify-center"
                >
                  <EditPageIcon class="w-5 h-5 transition-colors duration-200" />
                </div>

                <div
                  v-if="effectiveShowDelete"
                  @click="emit('delete', item)"
                  title="Delete"
                  class="p-2 rounded-xl cursor-pointer text-gray-500 hover:bg-elevated hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200 w-8 h-8 flex items-center justify-center"
                >
                  <DeletePageIcon class="w-5 h-5 transition-colors duration-200" />
                </div>

                <div
                  v-if="showPermission"
                  @click="emit('permission', item)"
                  title="Permissions"
                  class="p-2 rounded-xl cursor-pointer text-gray-500 hover:bg-elevated hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200 w-8 h-8 flex items-center justify-center"
                >
                  <PermissionIcon class="w-5 h-5 transition-colors duration-200" />
                </div>
              </div>
            </td>
          </tr>

          <tr v-if="data.length === 0">
            <td :colspan="headers.length + (hasActions ? 1 : 0) + (selectable ? 1 : 0)" class="text-center py-20 px-10">
              <div class="flex flex-col items-center opacity-30">
                <EmptyStateDefaultIcon class="w-12 h-12 mb-2" />
                <p class="text-sm font-black uppercase tracking-[0.2em]">Zero Records Found</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
