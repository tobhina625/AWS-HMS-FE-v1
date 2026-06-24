<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import router from '@/router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import ListViewTemplate from '@/components/Templates/ListViewTemplate.vue';
  import SearchWithViewToggle from '@/components/UI/SearchWithViewToggle.vue';
  import DynamicTable from '@/components/UI/DynamicTable.vue';
  import DynamicPagination from '@/components/UI/DynamicPagination.vue';
  import GridViewCard from '@/components/UI/GridViewCard.vue';
  import WardStatisticsDashboard from '@/components/Ward/WardStatisticsDashboard.vue';
  import EmptyState from '@/components/UI/EmptyState.vue';
  import BulkDeleteButton from '@/components/UI/BulkDeleteButton.vue';
  import WardServices from '@/services/Ward/ward.services';
  import { useListView } from '@/composables/useListView';
  import { usePermissions } from '@/composables/usePermissions';
  import { useSelection } from '@/composables/useSelection';
  import { useConfirmDelete } from '@/composables/useConfirmDelete';
  import type { IWard } from '@/services/Ward/ward.interface';

  const pageTitle = ref('Wards Management');
  const wardService = new WardServices();
  const viewMode = ref<'grid' | 'table'>('table');

  const { canDeleteFromModule } = usePermissions();
  const { confirmDelete, confirmBulkDelete } = useConfirmDelete();
  const { selectedIds, selectionCount, toggle, selectAll, deselectAll, toggleAll } = useSelection<number>();

  const canDelete = computed(() => canDeleteFromModule('Wards'));

  const getWardFields = (ward: IWard) => [
    { label: 'Status', value: ward.status },
    { label: 'Beds', value: `${ward.occupiedBeds}/${ward.noOfBeds}`, suffix: `(${ward.availableBeds} available)` },
    { label: 'Occupancy', value: `${Math.round(ward.occupancyRate)}%` },
    { label: 'Oxygen Slots', value: `${ward.occupiedOxygenSlots || 0}/${ward.noOfOxygenSlots || 0}` },
    { label: 'Department', value: typeof ward.department === 'string' ? ward.department : ward.department?.name || 'Not Assigned' },
  ];

  const wardColumns = ['name', 'status', 'noOfBeds', 'occupiedBeds', 'availableBeds', 'occupancyRate', 'noOfOxygenSlots', 'occupiedOxygenSlots', 'department', 'location'];

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
  } = useListView<IWard>((filters) => wardService.getWards(filters));

  listFilters.value.isDeleted = false;

  const transformWardData = (item: any): IWard => ({
    ...item,
    department: item.department?.name || 'Not Assigned',
    occupancyRate: item.occupancyRate || 0,
    availableBeds: item.availableBeds || 0,
    occupiedBeds: item.occupiedBeds || 0,
    status: item.status || 'Active',
    location: item.location || '-',
  });

  const getSearchTerm = async (query: string) => {
    await handleSearch(query, transformWardData);
  };

  const handlePageChange = async (newPage: number) => {
    await changePage(newPage, transformWardData);
  };

  const handlePageSizeChangeLocal = async (newSize: number) => {
    await handlePageSizeChange(newSize, transformWardData);
  };

  const handleViewDetails = (ward: IWard) => {
    router.push(`/wards/profile/${ward.id}`);
  };

  const handleEdit = (ward: IWard) => {
    router.push(`/wards/edit/${ward.id}`);
  };

  const handleDelete = async (ward: IWard) => {
    if (!canDelete.value) return;

    await confirmDelete({
      entityName: 'Ward',
      itemName: ward.name,
      deleteAction: () => wardService.deleteWard(ward.id.toString()),
      onSuccess: () => fetchData(transformWardData),
    });
  };

  const handleAddNew = () => {
    router.push('/wards/add');
  };

  const handleBulkDelete = async () => {
    if (!canDelete.value) return;

    await confirmBulkDelete({
      entityName: 'Ward',
      count: selectionCount.value,
      deleteAction: () => wardService.bulkDeleteWards(selectedIds.value),
      onSuccess: async () => {
        deselectAll();
        await fetchData(transformWardData);
      },
    });
  };

  onMounted(async () => {
    await fetchData(transformWardData);
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate
      :title="pageTitle"
      breadcrumb-title="Wards"
      :loading="loading"
      :selection-count="selectionCount"
      :show-bulk-actions="selectionCount > 0"
      @select-all="selectAll(apiResponse.data)"
      @deselect-all="deselectAll"
    >
      <template #subtitle>Manage hospital wards, bed availability, and department allocations.</template>

      <template #bulk-actions>
        <BulkDeleteButton :disabled="selectionCount === 0" @click="handleBulkDelete" />
      </template>

      <template #search>
        <SearchWithViewToggle v-model="viewMode" :showAdd="true" placeholder="Search wards..." add-button-route="wards/add" @search="getSearchTerm" />
      </template>

      <template #table>
        <WardStatisticsDashboard v-if="hasData" />

        <EmptyState
          v-if="isEmpty"
          title="No Wards Found"
          description="Get started by adding your first ward to manage hospital bed availability and department allocations."
          icon="ward"
          action-label="Add First Ward"
          @action="handleAddNew"
        />

        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          <GridViewCard
            v-for="ward in apiResponse.data"
            :key="ward.id"
            :id="ward.id"
            :title="ward.name"
            :subtitle="ward.location"
            :fields="getWardFields(ward)"
            :selected="selectedIds.includes(ward.id)"
            :show-delete="canDelete"
            show-details
            @edit="handleEdit(ward)"
            @delete="handleDelete(ward)"
            @detail="handleViewDetails(ward)"
            @select="toggle(ward.id)"
          />
        </div>

        <DynamicTable
          v-else
          :data="apiResponse.data"
          :columns="wardColumns"
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
          v-if="apiResponse.data.length > 0"
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
