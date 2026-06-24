<script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue';
  import router from '@/router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import ListViewTemplate from '@/components/Templates/ListViewTemplate.vue';
  import SearchWithViewToggle from '@/components/UI/SearchWithViewToggle.vue';
  import DynamicTable from '@/components/UI/DynamicTable.vue';
  import DynamicPagination from '@/components/UI/DynamicPagination.vue';
  import EmptyState from '@/components/UI/EmptyState.vue';
  import GridViewCard from '@/components/UI/GridViewCard.vue';
  import AvailabilityServices from '@/services/Availability/Availability.services';
  import type { IEmployeeAvailabilitySummary } from '@/services/Availability/Availability.dto';
  import { useListView } from '@/composables/useListView';
  import { usePermissions } from '@/composables/usePermissions';

  const pageTitle = ref('Availability Management');
  const availabilityService = new AvailabilityServices();
  const viewMode = ref<'grid' | 'table'>('table');

  const { canEditModule } = usePermissions();

  const canEdit = computed(() => canEditModule('Availability'));

  const getAvailabilityFields = (item: IEmployeeAvailabilitySummary) => [
    { label: 'Employee', value: item.employeeName || '-' },
    { label: 'Branch', value: item.branchName || '-' },
    { label: 'Slots', value: `${item.availabilityCount} time slot(s)` },
  ];

  const availabilityColumns = ['employeeName', 'branchName', 'availabilityCount'];

  const transformAvailabilityData = (item: any): IEmployeeAvailabilitySummary => ({
    employeeId: item.employeeId ?? item.EmployeeId,
    employeeName: item.employeeName ?? item.EmployeeName ?? '-',
    branchId: item.branchId ?? item.BranchId,
    branchName: item.branchName ?? item.BranchName ?? '-',
    availabilityCount: item.availabilityCount ?? item.AvailabilityCount ?? 1,
  });

  const {
    loading,
    listFilters,
    apiResponse,
    isEmpty,
    hasData,
    fetchData,
    handleSearch,
    handlePageChange: changePage,
    handlePageSizeChange,
  } = useListView<IEmployeeAvailabilitySummary>((filters: string) => availabilityService.getAvailabilities(filters), 10);

  listFilters.value.isDeleted = false;

  const getSearchTerm = async (query: string) => {
    await handleSearch(query, transformAvailabilityData);
  };

  const handlePageChange = async (newPage: number) => {
    await changePage(newPage, transformAvailabilityData);
  };

  const handlePageSizeChangeLocal = async (newSize: number) => {
    await handlePageSizeChange(newSize, transformAvailabilityData);
  };

  const handleViewDetails = (item: IEmployeeAvailabilitySummary) => {
    router.push(`/availability/detail/${item.employeeId}`);
  };

  const handleAddNew = () => {
    router.push('/availability/add');
  };

  watch(viewMode, async () => {
    listFilters.value.page = 0;
    await fetchData(transformAvailabilityData);
  });

  onMounted(async () => {
    await fetchData(transformAvailabilityData);
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate :title="pageTitle" breadcrumb-title="Availability" :loading="loading">
      <template #subtitle>Manage employee availability schedules and time slots.</template>

      <template #search>
        <SearchWithViewToggle v-model="viewMode" :showAdd="true" placeholder="Search by employee or branch..." add-button-route="availability/add" @search="getSearchTerm" />
      </template>

      <template #table>
        <EmptyState
          v-if="isEmpty"
          title="No Availability Records Found"
          description="Get started by adding employee availability schedules."
          icon="default"
          action-label="Add First Availability"
          @action="handleAddNew"
        />

        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          <GridViewCard
            v-for="item in apiResponse.data"
            :key="item.employeeId"
            :id="item.employeeId"
            :title="item.employeeName || 'Employee'"
            :subtitle="item.branchName || '-'"
            :fields="getAvailabilityFields(item)"
            :show-delete="false"
            @edit="handleViewDetails(item)"
          />
        </div>

        <DynamicTable v-else :data="apiResponse.data" :columns="availabilityColumns" :selectable="false" item-key="employeeId" :showEdit="canEdit" :showDelete="false" @edit="handleViewDetails" />
      </template>

      <template #pagination>
        <DynamicPagination
          v-if="hasData"
          :currentPage="listFilters.page"
          :totalPages="apiResponse.totalPages"
          :totalElements="apiResponse.totalElements"
          :itemsPerPage="apiResponse.itemsPerPage"
          :startIndex="apiResponse.startIndex"
          @change-page="handlePageChange"
          @change-page-size="handlePageSizeChangeLocal"
        />
      </template>
    </ListViewTemplate>
  </DefaultLayout>
</template>
