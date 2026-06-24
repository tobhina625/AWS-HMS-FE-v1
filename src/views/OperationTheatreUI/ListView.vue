<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import router from '@/router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import ListViewTemplate from '@/components/Templates/ListViewTemplate.vue';
  import SearchWithViewToggle from '@/components/UI/SearchWithViewToggle.vue';
  import DynamicTable from '@/components/UI/DynamicTable.vue';
  import DynamicPagination from '@/components/UI/DynamicPagination.vue';
  import EmptyState from '@/components/UI/EmptyState.vue';
  import GridViewCard from '@/components/UI/GridViewCard.vue';
  import BulkDeleteButton from '@/components/UI/BulkDeleteButton.vue';
  import TheatreStatisticsDashboard from '@/components/OperationTheatre/TheatreStatisticsDashboard.vue';
  import OperationTheatreService from '@/services/OperationTheatre/OperationTheatre.services';
  import type { IOperationTheatre, ITheatreStatistics } from '@/services/OperationTheatre/OperationTheatre.dto';
  import { useListView } from '@/composables/useListView';
  import { usePermissions } from '@/composables/usePermissions';
  import { useSelection } from '@/composables/useSelection';
  import { useConfirmDelete } from '@/composables/useConfirmDelete';

  const pageTitle = ref('Operation Theatres');
  const operationTheatreService = new OperationTheatreService();
  const viewMode = ref<'grid' | 'table'>('table');
  const statistics = ref<ITheatreStatistics | null>(null);

  const { canDeleteFromModule } = usePermissions();
  const { confirmDelete, confirmBulkDelete } = useConfirmDelete();
  const { selectedIds, selectionCount, toggle, selectAll, deselectAll, toggleAll } = useSelection<number>();

  const canDelete = computed(() => canDeleteFromModule('Operation Theatre'));

  const getTheatreFields = (theatre: IOperationTheatre) => [
    { label: 'Status', value: theatre.status || 'Unknown' },
    { label: 'Specialization', value: theatre.specialization || 'General' },
    { label: 'Capacity', value: theatre.capacity || 0 },
    { label: 'Department', value: theatre.department?.name || 'Not Assigned' },
    { label: 'Location', value: theatre.location || '-' },
  ];

  const theatreColumns = ['name', 'status', 'specialization', 'capacity', 'department', 'location'];

  const transformTheatreData = (item: any): IOperationTheatre => ({
    ...item,
    department: item.department ? { id: item.department.id, name: item.department.name } : null,
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
  } = useListView((filters: string) => operationTheatreService.getOperationTheatres(filters), 10);

  listFilters.value.isDeleted = false;

  const fetchStatistics = async () => {
    try {
      statistics.value = await operationTheatreService.getTheatreStatistics();
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const getSearchTerm = async (query: string) => {
    await handleSearch(query, transformTheatreData);
  };

  const handlePageChange = async (newPage: number) => {
    await changePage(newPage, transformTheatreData);
  };

  const handlePageSizeChangeLocal = async (newSize: number) => {
    await handlePageSizeChange(newSize, transformTheatreData);
  };

  const handleEdit = (id: number) => {
    router.push(`/operation-theatre/edit/${id}`);
  };

  const handleViewDetails = (item: IOperationTheatre | { id: number }) => {
    router.push(`/operation-theatre/profile/${item.id}`);
  };

  const handleDelete = async (theatre: IOperationTheatre) => {
    if (!canDelete.value) return;

    await confirmDelete({
      entityName: 'Operation Theatre',
      itemName: theatre.name,
      deleteAction: () => operationTheatreService.deleteOperationTheatreById(theatre.id),
      onSuccess: async () => {
        await fetchData(transformTheatreData);
        await fetchStatistics();
      },
    });
  };

  const handleAddNew = () => {
    router.push('/operation-theatre/add');
  };

  const handleBulkDelete = async () => {
    if (!canDelete.value) return;

    await confirmBulkDelete({
      entityName: 'Operation Theatre',
      count: selectionCount.value,
      deleteAction: () => operationTheatreService.bulkDeleteOperationTheatres(selectedIds.value),
      onSuccess: async () => {
        deselectAll();
        await fetchData(transformTheatreData);
        await fetchStatistics();
      },
    });
  };

  onMounted(async () => {
    await Promise.all([fetchData(transformTheatreData), fetchStatistics()]);
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate
      :title="pageTitle"
      breadcrumb-title="Operation Theaters"
      :loading="loading"
      :selection-count="selectionCount"
      :show-bulk-actions="selectionCount > 0"
      @select-all="selectAll(apiResponse.data)"
      @deselect-all="deselectAll"
    >
      <template #subtitle>Manage surgical facilities, theater status, and departmental availability.</template>

      <template #bulk-actions>
        <BulkDeleteButton :disabled="selectionCount === 0" @click="handleBulkDelete" />
      </template>

      <template #search>
        <SearchWithViewToggle v-model="viewMode" :showAdd="true" placeholder="Search theaters..." add-button-route="operation-theatre/add" @search="getSearchTerm" />
      </template>

      <template #table>
        <TheatreStatisticsDashboard v-if="hasData && statistics" :statistics="statistics" />

        <EmptyState
          v-if="isEmpty"
          title="No Operation Theatres Found"
          description="Get started by adding your first operation theatre to the system."
          icon="default"
          action-label="Add Theatre"
          @action="handleAddNew"
        />

        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          <GridViewCard
            v-for="theatre in apiResponse.data"
            :key="theatre.id"
            :id="theatre.id"
            :title="theatre.name"
            :subtitle="theatre.location"
            :fields="getTheatreFields(theatre)"
            :selected="selectedIds.includes(theatre.id)"
            :show-delete="canDelete"
            show-details
            @edit="handleEdit(theatre.id)"
            @delete="handleDelete(theatre)"
            @detail="handleViewDetails(theatre)"
            @select="toggle(theatre.id)"
          />
        </div>

        <DynamicTable
          v-else
          :data="apiResponse.data"
          :columns="theatreColumns"
          :selectable="true"
          :selected-ids="selectedIds"
          item-key="id"
          showEdit
          showDetails
          :showDelete="canDelete"
          @edit="(item: any) => handleEdit(item.id)"
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
