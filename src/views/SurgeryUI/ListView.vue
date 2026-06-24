<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import router from '@/router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import ListViewTemplate from '@/components/Templates/ListViewTemplate.vue';
  import SearchWithViewToggle from '@/components/UI/SearchWithViewToggle.vue';
  import DynamicTable from '@/components/UI/DynamicTable.vue';
  import DynamicPagination from '@/components/UI/DynamicPagination.vue';
  import GridViewCard from '@/components/UI/GridViewCard.vue';
  import SurgeryStatisticsDashboard from '@/components/Surgery/SurgeryStatisticsDashboard.vue';
  import EmptyState from '@/components/UI/EmptyState.vue';
  import BulkDeleteButton from '@/components/UI/BulkDeleteButton.vue';
  import SurgeryService from '@/services/Surgery/Surgery.services';
  import { useListView } from '@/composables/useListView';
  import { usePermissions } from '@/composables/usePermissions';
  import { useSelection } from '@/composables/useSelection';
  import { useConfirmDelete } from '@/composables/useConfirmDelete';
  import type { ISurgery } from '@/services/Surgery/Surgery.dto';

  const pageTitle = ref('Surgeries Management');
  const surgeryService = new SurgeryService();
  const viewMode = ref<'grid' | 'table'>('table');

  const { canDeleteFromModule } = usePermissions();
  const { confirmDelete, confirmBulkDelete } = useConfirmDelete();
  const { selectedIds, selectionCount, toggle, selectAll, deselectAll, toggleAll } = useSelection<number>();

  const canDelete = computed(() => canDeleteFromModule('Surgeries'));

  const getSurgeryFields = (surgery: ISurgery) => [
    { label: 'Status', value: surgery.status || 'Unknown' },
    { label: 'Category', value: surgery.category || 'General' },
    { label: 'Cost', value: `$${surgery.cost || 0}` },
    { label: 'Duration', value: surgery.duration || 0, suffix: 'mins' },
    { label: 'Risk Level', value: surgery.riskLevel || '-' },
    { label: 'Department', value: typeof surgery.department === 'string' ? surgery.department : surgery.department?.name || 'Not Assigned' },
  ];

  const surgeryColumns = ['name', 'status', 'category', 'cost', 'duration', 'riskLevel', 'department', 'location'];

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
  } = useListView<ISurgery>((filters) => surgeryService.getSurgeries(filters));

  listFilters.value.isDeleted = false;

  const transformSurgeryData = (item: any): ISurgery => ({
    ...item,
    department: item.department?.name || 'Not Assigned',
    status: item.status || 'Active',
    category: item.category || 'General',
    location: item.location || '-',
    riskLevel: item.riskLevel || '-',
    duration: item.duration || 0,
  });

  const getSearchTerm = async (query: string) => {
    await handleSearch(query, transformSurgeryData);
  };

  const handlePageChange = async (newPage: number) => {
    await changePage(newPage, transformSurgeryData);
  };

  const handlePageSizeChangeLocal = async (newSize: number) => {
    await handlePageSizeChange(newSize, transformSurgeryData);
  };

  const handleEdit = (surgery: ISurgery) => {
    router.push(`/surgery/edit/${surgery.id}`);
  };

  const handleViewDetails = (surgery: ISurgery) => {
    router.push(`/surgery/profile/${surgery.id}`);
  };

  const handleDelete = async (surgery: ISurgery) => {
    if (!canDelete.value) return;

    await confirmDelete({
      entityName: 'Surgery',
      itemName: surgery.name,
      deleteAction: () => surgeryService.deleteSurgeryById(surgery.id),
      onSuccess: () => fetchData(transformSurgeryData),
    });
  };

  const handleAddNew = () => {
    router.push('/surgery/add');
  };

  const handleBulkDelete = async () => {
    if (!canDelete.value) return;

    await confirmBulkDelete({
      entityName: 'Surgery',
      count: selectionCount.value,
      deleteAction: () => surgeryService.bulkDeleteSurgeries(selectedIds.value),
      onSuccess: async () => {
        deselectAll();
        await fetchData(transformSurgeryData);
      },
    });
  };

  onMounted(async () => {
    await fetchData(transformSurgeryData);
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate
      :title="pageTitle"
      breadcrumb-title="Surgeries"
      :loading="loading"
      :selection-count="selectionCount"
      :show-bulk-actions="selectionCount > 0"
      @select-all="selectAll(apiResponse.data)"
      @deselect-all="deselectAll"
    >
      <template #subtitle>Schedule and track surgical procedures, operating theaters, and medical teams.</template>

      <template #bulk-actions>
        <BulkDeleteButton :disabled="selectionCount === 0" @click="handleBulkDelete" />
      </template>

      <template #search>
        <SearchWithViewToggle v-model="viewMode" :showAdd="true" placeholder="Search surgeries..." add-button-route="surgery/add" @search="getSearchTerm" />
      </template>

      <template #table>
        <SurgeryStatisticsDashboard v-if="hasData" />

        <EmptyState
          v-if="isEmpty"
          title="No Surgeries Found"
          description="Get started by adding your first surgical procedure to manage operations and medical teams."
          icon="default"
          action-label="Add First Surgery"
          @action="handleAddNew"
        />

        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          <GridViewCard
            v-for="surgery in apiResponse.data"
            :key="surgery.id"
            :id="surgery.id"
            :title="surgery.name"
            :subtitle="surgery.location"
            :fields="getSurgeryFields(surgery)"
            :selected="selectedIds.includes(surgery.id)"
            :show-delete="canDelete"
            show-details
            @edit="handleEdit(surgery)"
            @detail="handleViewDetails(surgery)"
            @delete="handleDelete(surgery)"
            @select="toggle(surgery.id)"
          />
        </div>

        <DynamicTable
          v-else
          :data="apiResponse.data"
          :columns="surgeryColumns"
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
