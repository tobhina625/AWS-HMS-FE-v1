<script setup lang="ts">
  import BellIcon from '@/assets/images/SVGs/BellIcon.svg';
  import CogSettingsIcon from '@/assets/images/SVGs/CogSettingsIcon.svg';
  import RefreshIcon from '@/assets/images/SVGs/RefreshIcon.svg';
  import LinkIcon from '@/assets/images/SVGs/LinkIcon.svg';

  import router from '@/router';
  import { ref, onMounted } from 'vue';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import ListViewTemplate from '@/components/Templates/ListViewTemplate.vue';
  import SearchWithViewToggle from '@/components/UI/SearchWithViewToggle.vue';
  import DynamicTable from '@/components/UI/DynamicTable.vue';
  import EmployeesServices from '@/services/Employee/Employee.services';
  import { useAuth } from '@/composables/useAuth';

  const employeeService = new EmployeesServices();
  const { getUserId } = useAuth();
  const currentUserId = getUserId();

  const pageTitle = ref('Employee Permissions Management');
  const viewMode = ref<'grid' | 'table'>('table');
  const listFilters = ref({
    page: 0,
    size: 10,
    searchTerm: '',
  });
  const apiResponse = ref({
    data: [],
    totalElements: 0,
    totalPages: 0,
    startIndex: 0,
    itemsPerPage: 0,
  });
  const loading = ref(false);

  const getGender = (genderId: number) => {
    return genderId === 0 ? 'Male' : genderId === 1 ? 'Female' : 'Other';
  };

  const getSearchTerm = async (query: string) => {
    listFilters.value.searchTerm = query;
    listFilters.value.page = 0;
    await loadTableData();
  };

  const loadTableData = async () => {
    loading.value = true;
    try {
      let filters = '';
      Object.entries(listFilters.value).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          filters = filters != '' ? `${filters}&${key}=${value}` : `${key}=${value}`;
        }
      });

      const response = await employeeService.getEmployees(filters);
      const rawData = response.content;
      const filteredData = rawData.filter((item: any) => item.id !== currentUserId);
      const mappedData = filteredData.map((item: any) => ({
        ...item,
        designations: item.designations?.map((d: any) => d.name).join(', ') || 'Not Assigned',
        department: item.department?.name || 'Not Assigned',
        gender: getGender(item.gender),
      }));

      apiResponse.value.data = mappedData;
      apiResponse.value.itemsPerPage = response.size;
      apiResponse.value.totalPages = response.totalPages;
      apiResponse.value.startIndex = response.page;
      apiResponse.value.totalElements = response.totalElements - 1;
    } finally {
      loading.value = false;
    }
  };

  const onPermission = (item: any) => {
    router.push(`/permissions/employee/${item.id}`);
  };

  onMounted(async () => {
    await loadTableData();
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate :title="pageTitle" breadcrumb-title="Employee Permissions" :loading="loading" :selection-count="0" :show-bulk-actions="false">
      <template #subtitle>Configure individual permissions for specific employees</template>

      <template #search>
        <SearchWithViewToggle v-model="viewMode" placeholder="Search Employees" :show-add="false" search-bar-class="flex-1 max-w-3xl min-w-[420px] [&_input]:min-h-[48px]" @search="getSearchTerm" />
      </template>

      <template #table>
        <!-- Info Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 border-b border-stroke dark:border-strokedark">
          <div class="rounded-lg border border-stroke bg-surface p-4 shadow-sm dark:border-strokedark">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                <RefreshIcon class="h-6 w-6 text-primary" />
              </div>
              <div>
                <p class="text-2xl font-bold text-emphasis">{{ apiResponse.totalElements }}</p>
                <p class="text-xs text-muted">Total Employees</p>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-stroke bg-surface p-4 shadow-sm dark:border-strokedark">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/10 dark:bg-secondary/20">
                <CogSettingsIcon class="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p class="text-2xl font-bold text-emphasis">19</p>
                <p class="text-xs text-muted">Available Modules</p>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-stroke bg-surface p-4 shadow-sm dark:border-strokedark">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-full bg-warning/10 dark:bg-warning/20">
                <BellIcon class="h-6 w-6 text-warning" />
              </div>
              <div>
                <p class="text-2xl font-bold text-emphasis">Custom</p>
                <p class="text-xs text-muted">Override Permissions</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Banner -->
        <div class="rounded-lg bg-warning/10 dark:bg-warning/20 border border-warning/30 dark:border-warning/40 p-4 mx-6 mb-6">
          <div class="flex items-start gap-3">
            <LinkIcon class="h-5 w-5 text-emphasis mt-0.5 flex-shrink-0" />
            <div>
              <p class="text-sm font-medium text-emphasis">Individual Permission Override</p>
              <p class="text-xs text-emphasis mt-1 opacity-90">Employee-specific permissions will override their default role permissions. Use this for special cases only.</p>
            </div>
          </div>
        </div>

        <!-- Employees Table -->
        <div class="border-t border-stroke dark:border-strokedark bg-elevated px-6 py-3">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold text-emphasis">All Employees</h3>
            <span class="text-xs text-muted">{{ apiResponse.data.length }} employee(s) found</span>
          </div>
        </div>
        <DynamicTable :data="apiResponse.data" :showPermission="apiResponse.data && apiResponse.data.length > 0" @permission="onPermission" />
      </template>
    </ListViewTemplate>
  </DefaultLayout>
</template>
