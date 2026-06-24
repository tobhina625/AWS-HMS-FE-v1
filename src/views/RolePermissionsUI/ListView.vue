<script setup lang="ts">
  import BellIcon from '@/assets/images/SVGs/BellIcon.svg';
  import CogSettingsIcon from '@/assets/images/SVGs/CogSettingsIcon.svg';
  import UsersGroupIcon from '@/assets/images/SVGs/UsersGroupIcon.svg';

  import router from '@/router';
  import { ref, onMounted } from 'vue';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import ListViewTemplate from '@/components/Templates/ListViewTemplate.vue';
  import SearchWithViewToggle from '@/components/UI/SearchWithViewToggle.vue';
  import DynamicTable from '@/components/UI/DynamicTable.vue';
  import RoleServices from '@/services/Role/Role.services';

  const roleService = new RoleServices();
  const pageTitle = ref('Role Permissions Management');
  const viewMode = ref<'grid' | 'table'>('table');
  const listFilters = ref({
    page: 0,
    size: 10,
    searchTerm: '',
  });
  const apiResponse = ref({
    data: [],
  });
  const loading = ref(false);

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
      const response = await roleService.getRoles(filters);
      apiResponse.value.data = response.content;
    } finally {
      loading.value = false;
    }
  };

  const onPermission = (item: any) => {
    router.push(`/permissions/role/${item.id}`);
  };

  onMounted(async () => {
    await loadTableData();
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate :title="pageTitle" breadcrumb-title="Role Permissions" :loading="loading" :selection-count="0" :show-bulk-actions="false">
      <template #subtitle>Configure permissions for each role in the system</template>

      <template #search>
        <SearchWithViewToggle v-model="viewMode" placeholder="Search Roles" :show-add="false" search-bar-class="flex-1 max-w-3xl min-w-[420px] [&_input]:min-h-[48px]" @search="getSearchTerm" />
      </template>

      <template #table>
        <!-- Info Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 border-b border-stroke dark:border-strokedark">
          <div class="rounded-lg border border-stroke bg-surface p-4 shadow-sm dark:border-strokedark">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                <UsersGroupIcon class="h-6 w-6 text-primary" />
              </div>
              <div>
                <p class="text-2xl font-bold text-emphasis">{{ apiResponse.data.length }}</p>
                <p class="text-xs text-muted">Total Roles</p>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-stroke bg-surface p-4 shadow-sm dark:border-strokedark">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-full bg-success/10 dark:bg-success/20">
                <CogSettingsIcon class="h-6 w-6 text-success" />
              </div>
              <div>
                <p class="text-2xl font-bold text-emphasis">19</p>
                <p class="text-xs text-muted">Available Modules</p>
              </div>
            </div>
          </div>

          <div class="rounded-lg border border-stroke bg-surface p-4 shadow-sm dark:border-strokedark">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/10 dark:bg-secondary/20">
                <BellIcon class="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p class="text-2xl font-bold text-emphasis">5</p>
                <p class="text-xs text-muted">Permission Types</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Roles Table -->
        <div class="border-t border-stroke dark:border-strokedark bg-elevated px-6 py-3">
          <h3 class="text-base font-semibold text-emphasis">All Roles</h3>
        </div>
        <DynamicTable :data="apiResponse.data" :showPermission="apiResponse.data && apiResponse.data.length > 0" @permission="onPermission" />
      </template>
    </ListViewTemplate>
  </DefaultLayout>
</template>
