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
  import DesignationStatisticsDashboard from '@/components/Designation/DesignationStatisticsDashboard.vue';
  import DesignationsService from '@/services/Designation/Designation.services';
  import type { IDesignation } from '@/services/Designation/Designation.dto';
  import { useListView } from '@/composables/useListView';
  import { usePermissions } from '@/composables/usePermissions';
  import { useSelection } from '@/composables/useSelection';
  import { useConfirmDelete } from '@/composables/useConfirmDelete';

  const pageTitle = ref('Designations Management');
  const designationService = new DesignationsService();
  const viewMode = ref<'grid' | 'table'>('table');

  const { canDeleteFromModule } = usePermissions();
  const { confirmDelete, confirmBulkDelete } = useConfirmDelete();
  const { selectedIds, selectionCount, toggle, selectAll, deselectAll, toggleAll } = useSelection<number>();

  const canDelete = computed(() => canDeleteFromModule('Designations'));

  const getDesignationFields = (designation: IDesignation) => [
    { label: 'Status', value: designation.status || 'Unknown' },
    { label: 'Role', value: typeof designation.role === 'string' ? designation.role : designation.role?.name || 'Not Assigned' },
    { label: 'Level', value: designation.level || '-' },
    { label: 'Min Salary', value: `$${designation.minSalary || 0}` },
    { label: 'Max Salary', value: `$${designation.maxSalary || 0}` },
  ];

  const designationColumns = ['name', 'status', 'role', 'level', 'minSalary', 'maxSalary'];

  const transformDesignationData = (item: any): IDesignation => ({
    ...item,
    status: item.status || 'Active',
    role: item.role?.name || item.role || 'Not Assigned',
    level: item.level || '',
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
  } = useListView<IDesignation>((filters: string) => designationService.getDesignations(filters), 10);

  listFilters.value.isDeleted = false;

  const getSearchTerm = async (query: string) => {
    await handleSearch(query, transformDesignationData);
  };

  const handlePageChange = async (newPage: number) => {
    await changePage(newPage, transformDesignationData);
  };

  const handlePageSizeChangeLocal = async (newSize: number) => {
    await handlePageSizeChange(newSize, transformDesignationData);
  };

  const handleEdit = (designation: IDesignation) => {
    router.push(`/designations/edit/${designation.id}`);
  };

  const handleViewDetails = (designation: IDesignation) => {
    router.push(`/designations/profile/${designation.id}`);
  };

  const handleDelete = async (designation: IDesignation) => {
    if (!canDelete.value) return;

    await confirmDelete({
      entityName: 'Designation',
      itemName: designation.name,
      deleteAction: () => designationService.deleteDesignationbyId(designation.id),
      onSuccess: () => fetchData(transformDesignationData),
    });
  };

  const handleAddNew = () => {
    router.push('/designations/add');
  };

  const handleBulkDelete = async () => {
    if (!canDelete.value) return;

    await confirmBulkDelete({
      entityName: 'Designation',
      count: selectionCount.value,
      deleteAction: () => designationService.bulkDeleteDesignations(selectedIds.value),
      onSuccess: async () => {
        deselectAll();
        await fetchData(transformDesignationData);
      },
    });
  };

  watch(viewMode, async () => {
    listFilters.value.page = 0;
    await fetchData(transformDesignationData);
  });

  onMounted(async () => {
    await fetchData(transformDesignationData);
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate
      :title="pageTitle"
      breadcrumb-title="Designations"
      :loading="loading"
      :selection-count="selectionCount"
      :show-bulk-actions="selectionCount > 0"
      @select-all="selectAll(apiResponse.data)"
      @deselect-all="deselectAll"
    >
      <template #subtitle>Manage staff designations and their associated roles.</template>

      <template #bulk-actions>
        <BulkDeleteButton :disabled="selectionCount === 0" @click="handleBulkDelete" />
      </template>

      <template #search>
        <SearchWithViewToggle v-model="viewMode" :showAdd="true" placeholder="Search designations..." add-button-route="designations/add" @search="getSearchTerm" />
      </template>

      <template #table>
        <DesignationStatisticsDashboard v-if="hasData" />

        <EmptyState
          v-if="isEmpty"
          title="No Designations Found"
          description="Get started by adding your first designation to organize staff roles."
          icon="default"
          action-label="Add First Designation"
          @action="handleAddNew"
        />

        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          <GridViewCard
            v-for="designation in apiResponse.data"
            :key="designation.id"
            :id="designation.id"
            :title="designation.name"
            :subtitle="designation.level"
            :fields="getDesignationFields(designation)"
            :selected="selectedIds.includes(designation.id)"
            :show-delete="canDelete"
            show-details
            @edit="handleEdit(designation)"
            @detail="handleViewDetails(designation)"
            @delete="handleDelete(designation)"
            @select="toggle(designation.id)"
          />
        </div>

        <DynamicTable
          v-else
          :data="apiResponse.data"
          :columns="designationColumns"
          :selectable="true"
          :selected-ids="selectedIds"
          item-key="id"
          showEdit
          showDetails
          :showDelete="canDelete"
          @edit="handleEdit"
          @detail="handleViewDetails"
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
