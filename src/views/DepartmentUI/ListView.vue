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
  import BulkDeleteButton from '@/components/UI/BulkDeleteButton.vue';
  import DepartmentStatisticsDashboard from '@/components/Department/DepartmentStatisticsDashboard.vue';
  import DepartmentsServices from '@/services/Department/Department.services';
  import type { IDepartment } from '@/services/Department/Department.dto';
  import { useListView } from '@/composables/useListView';
  import { usePermissions } from '@/composables/usePermissions';
  import { useSelection } from '@/composables/useSelection';
  import { useConfirmDelete } from '@/composables/useConfirmDelete';

  const pageTitle = ref('Departments Management');
  const departmentService = new DepartmentsServices();
  const viewMode = ref<'grid' | 'table'>('table');

  const { canDeleteFromModule } = usePermissions();
  const { confirmDelete, confirmBulkDelete } = useConfirmDelete();
  const { selectedIds, selectionCount, toggle, selectAll, deselectAll, toggleAll } = useSelection<number>();

  const canDelete = computed(() => canDeleteFromModule('Departments'));

  const getDepartmentFields = (department: IDepartment) => [
    { label: 'Status', value: department.status || 'Unknown' },
    { label: 'Head', value: department.headOfDepartment || '-' },
    { label: 'Capacity', value: department.capacity || 0 },
    { label: 'Phone', value: department.phone || '-' },
    { label: 'Email', value: department.email || '-' },
  ];

  const departmentColumns = ['name', 'status', 'headOfDepartment', 'location', 'capacity', 'phone', 'email'];

  const transformDepartmentData = (item: any): IDepartment => ({
    ...item,
    status: item.status || 'Active',
    headOfDepartment: item.headOfDepartment || '',
    location: item.location || '',
    capacity: item.capacity || 0,
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
  } = useListView<IDepartment>((filters: string) => departmentService.getDepartments(filters), 10);

  listFilters.value.isDeleted = false;

  const getSearchTerm = async (query: string) => {
    await handleSearch(query, transformDepartmentData);
  };

  const handlePageChange = async (newPage: number) => {
    await changePage(newPage, transformDepartmentData);
  };

  const handlePageSizeChangeLocal = async (newSize: number) => {
    await handlePageSizeChange(newSize, transformDepartmentData);
  };

  const handleEdit = (department: IDepartment) => {
    router.push(`/departments/edit/${department.id}`);
  };

  const handleViewDetails = (department: IDepartment) => {
    router.push(`/departments/profile/${department.id}`);
  };

  const handleDelete = async (department: IDepartment) => {
    if (!canDelete.value) return;

    await confirmDelete({
      entityName: 'Department',
      itemName: department.name,
      deleteAction: () => departmentService.deleteDepartmentById(department.id.toString()),
      onSuccess: () => fetchData(transformDepartmentData),
    });
  };

  const handleAddNew = () => {
    router.push('/departments/add');
  };

  const handleBulkDelete = async () => {
    if (!canDelete.value) return;

    await confirmBulkDelete({
      entityName: 'Department',
      count: selectionCount.value,
      deleteAction: () => departmentService.bulkDeleteDepartments(selectedIds.value),
      onSuccess: async () => {
        deselectAll();
        await fetchData(transformDepartmentData);
      },
    });
  };

  watch(viewMode, async () => {
    listFilters.value.page = 0;
    await fetchData(transformDepartmentData);
  });

  onMounted(async () => {
    await fetchData(transformDepartmentData);
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate
      :title="pageTitle"
      breadcrumb-title="Departments"
      :loading="loading"
      :selection-count="selectionCount"
      :show-bulk-actions="selectionCount > 0"
      @select-all="selectAll(apiResponse.data)"
      @deselect-all="deselectAll"
    >
      <template #subtitle>Manage hospital departments, specialties, and unit headers.</template>

      <template #bulk-actions>
        <BulkDeleteButton :disabled="selectionCount === 0" @click="handleBulkDelete" />
      </template>

      <template #search>
        <SearchWithViewToggle v-model="viewMode" :showAdd="true" placeholder="Search departments..." add-button-route="departments/add" @search="getSearchTerm" />
      </template>

      <template #table>
        <DepartmentStatisticsDashboard v-if="hasData" />

        <EmptyState
          v-if="isEmpty"
          title="No Departments Found"
          description="Get started by adding your first department to organize hospital units."
          icon="default"
          action-label="Add First Department"
          @action="handleAddNew"
        />

        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          <GridViewCard
            v-for="department in apiResponse.data"
            :key="department.id"
            :id="department.id"
            :title="department.name"
            :subtitle="department.location"
            :fields="getDepartmentFields(department)"
            :selected="selectedIds.includes(department.id)"
            :show-details="true"
            :show-delete="canDelete"
            @detail="handleViewDetails(department)"
            @edit="handleEdit(department)"
            @delete="handleDelete(department)"
            @select="toggle(department.id)"
          />
        </div>

        <DynamicTable
          v-else
          :data="apiResponse.data"
          :columns="departmentColumns"
          :selectable="true"
          :selected-ids="selectedIds"
          item-key="id"
          showDetails
          showEdit
          :showDelete="canDelete"
          @detail="handleViewDetails"
          @edit="handleEdit"
          @delete="handleDelete"
          @select="toggle"
          @select-all="(checked: boolean) => toggleAll(checked, apiResponse.data)"
        />
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
