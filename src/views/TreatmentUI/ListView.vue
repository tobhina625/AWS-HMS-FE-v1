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
  import TreatmentServices from '@/services/Treatment/Treatment.services';
  import type { ITreatment } from '@/services/Treatment/Treatment.dto';
  import { useListView } from '@/composables/useListView';
  import { usePermissions } from '@/composables/usePermissions';
  import { useSelection } from '@/composables/useSelection';
  import { useConfirmDelete } from '@/composables/useConfirmDelete';

  const pageTitle = ref('Treatments Management');
  const treatmentService = new TreatmentServices();
  const viewMode = ref<'grid' | 'table'>('table');

  const { canDeleteFromModule } = usePermissions();
  const { confirmDelete, confirmBulkDelete } = useConfirmDelete();
  const { selectedIds, selectionCount, toggle, selectAll, deselectAll, toggleAll } = useSelection<number>();

  const canDelete = computed(() => canDeleteFromModule('Treatments'));

  const getTreatmentFields = (treatment: ITreatment) => [
    { label: 'Ward', value: treatment.ward?.name || '-' },
    { label: 'Bed Number', value: treatment.bedNumber.toString() },
    { label: 'Admission ID', value: treatment.admissionId.toString() },
  ];

  const treatmentColumns = ['ward.name', 'bedNumber', 'admissionId'];

  const transformTreatmentData = (item: any): ITreatment => ({
    ...item,
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
  } = useListView<ITreatment>((filters: string) => treatmentService.getTreatments(filters), 10);

  listFilters.value.isDeleted = false;

  const getSearchTerm = async (query: string) => {
    await handleSearch(query, transformTreatmentData);
  };

  const handlePageChange = async (newPage: number) => {
    await changePage(newPage, transformTreatmentData);
  };

  const handlePageSizeChangeLocal = async (newSize: number) => {
    await handlePageSizeChange(newSize, transformTreatmentData);
  };

  const handleEdit = (treatment: ITreatment) => {
    router.push(`/treatments/edit/${treatment.id}`);
  };

  const handleDelete = async (treatment: ITreatment) => {
    if (!canDelete.value) return;

    await confirmDelete({
      entityName: 'Treatment',
      itemName: `Treatment #${treatment.id}`,
      deleteAction: () => treatmentService.deleteTreatment(treatment.id),
      onSuccess: () => fetchData(transformTreatmentData),
    });
  };

  const handleAddNew = () => {
    router.push('/treatments/add');
  };

  const handleBulkDelete = async () => {
    if (!canDelete.value) return;

    await confirmBulkDelete({
      entityName: 'Treatment',
      count: selectionCount.value,
      deleteAction: () => treatmentService.bulkDeleteTreatments(selectedIds.value),
      onSuccess: async () => {
        deselectAll();
        await fetchData(transformTreatmentData);
      },
    });
  };

  watch(viewMode, async () => {
    listFilters.value.page = 0;
    await fetchData(transformTreatmentData);
  });

  onMounted(async () => {
    await fetchData(transformTreatmentData);
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate
      :title="pageTitle"
      breadcrumb-title="Treatments"
      :loading="loading"
      :selection-count="selectionCount"
      :show-bulk-actions="selectionCount > 0"
      @select-all="selectAll(apiResponse.data)"
      @deselect-all="deselectAll"
    >
      <template #subtitle>Manage patient treatment records and medical procedures.</template>

      <template #bulk-actions>
        <BulkDeleteButton :disabled="selectionCount === 0" @click="handleBulkDelete" />
      </template>

      <template #search>
        <SearchWithViewToggle v-model="viewMode" :showAdd="true" placeholder="Search treatments..." add-button-route="treatments/add" @search="getSearchTerm" />
      </template>

      <template #table>
        <EmptyState
          v-if="isEmpty"
          title="No Treatments Found"
          description="Get started by adding your first treatment record."
          icon="default"
          action-label="Add First Treatment"
          @action="handleAddNew"
        />

        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          <GridViewCard
            v-for="treatment in apiResponse.data"
            :key="treatment.id"
            :id="treatment.id"
            :title="`Treatment #${treatment.id}`"
            :subtitle="treatment.ward?.name"
            :fields="getTreatmentFields(treatment)"
            :selected="selectedIds.includes(treatment.id)"
            :show-delete="canDelete"
            @edit="handleEdit(treatment)"
            @delete="handleDelete(treatment)"
            @select="toggle(treatment.id)"
          />
        </div>

        <DynamicTable
          v-else
          :data="apiResponse.data"
          :columns="treatmentColumns"
          :selectable="true"
          :selected-ids="selectedIds"
          item-key="id"
          showEdit
          :showDelete="canDelete"
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
