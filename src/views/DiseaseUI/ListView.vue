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
  import DiseaseStatisticsDashboard from '@/components/Disease/DiseaseStatisticsDashboard.vue';
  import DiseasesServices from '@/services/Disease/Disease.services';
  import type { IDisease } from '@/services/Disease/Disease.dto';
  import { useListView } from '@/composables/useListView';
  import { usePermissions } from '@/composables/usePermissions';
  import { useSelection } from '@/composables/useSelection';
  import { useConfirmDelete } from '@/composables/useConfirmDelete';

  const pageTitle = ref('Diseases Management');
  const diseaseService = new DiseasesServices();
  const viewMode = ref<'grid' | 'table'>('table');

  const { canDeleteFromModule } = usePermissions();
  const { confirmDelete, confirmBulkDelete } = useConfirmDelete();
  const { selectedIds, selectionCount, toggle, selectAll, deselectAll, toggleAll } = useSelection<number>();

  const canDelete = computed(() => canDeleteFromModule('Diseases'));

  const getDiseaseFields = (disease: IDisease) => [
    { label: 'Status', value: disease.status || 'Unknown' },
    { label: 'Category', value: disease.category || '-' },
    { label: 'Severity', value: disease.severity || '-' },
    { label: 'Contagious', value: disease.isContagious ? 'Yes' : 'No' },
    { label: 'Affected Area', value: disease.affectedBodyPart || '-' },
  ];

  const diseaseColumns = ['name', 'status', 'category', 'severity', 'isContagious', 'affectedBodyPart'];

  const transformDiseaseData = (item: any): IDisease => ({
    ...item,
    status: item.status || 'Active',
    category: item.category || 'Other',
    severity: item.severity || 'Moderate',
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
  } = useListView<IDisease>((filters: string) => diseaseService.getDiseases(filters), 10);

  listFilters.value.isDeleted = false;

  const getSearchTerm = async (query: string) => {
    await handleSearch(query, transformDiseaseData);
  };

  const handlePageChange = async (newPage: number) => {
    await changePage(newPage, transformDiseaseData);
  };

  const handlePageSizeChangeLocal = async (newSize: number) => {
    await handlePageSizeChange(newSize, transformDiseaseData);
  };

  const handleEdit = (disease: IDisease) => {
    router.push(`/disease/edit/${disease.id}`);
  };

  const handleViewDetails = (disease: IDisease) => {
    router.push(`/disease/edit/${disease.id}`);
  };

  const handleDelete = async (disease: IDisease) => {
    if (!canDelete.value) return;

    await confirmDelete({
      entityName: 'Disease',
      itemName: disease.name,
      deleteAction: () => diseaseService.deleteDiseaseById(disease.id.toString()),
      onSuccess: () => fetchData(transformDiseaseData),
    });
  };

  const handleAddNew = () => {
    router.push('/disease/add');
  };

  const handleBulkDelete = async () => {
    if (!canDelete.value) return;

    await confirmBulkDelete({
      entityName: 'Disease',
      count: selectionCount.value,
      deleteAction: () => diseaseService.bulkDeleteDiseases(selectedIds.value),
      onSuccess: async () => {
        deselectAll();
        await fetchData(transformDiseaseData);
      },
    });
  };

  watch(viewMode, async () => {
    listFilters.value.page = 0;
    await fetchData(transformDiseaseData);
  });

  onMounted(async () => {
    await fetchData(transformDiseaseData);
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate
      :title="pageTitle"
      breadcrumb-title="Diseases"
      :loading="loading"
      :selection-count="selectionCount"
      :show-bulk-actions="selectionCount > 0"
      @select-all="selectAll(apiResponse.data)"
      @deselect-all="deselectAll"
    >
      <template #subtitle>Catalog of clinical diseases, classifications, and diagnostic references.</template>

      <template #bulk-actions>
        <BulkDeleteButton :disabled="selectionCount === 0" @click="handleBulkDelete" />
      </template>

      <template #search>
        <SearchWithViewToggle v-model="viewMode" :showAdd="true" placeholder="Search diseases..." add-button-route="disease/add" @search="getSearchTerm" />
      </template>

      <template #table>
        <DiseaseStatisticsDashboard v-if="hasData" />

        <EmptyState
          v-if="isEmpty"
          title="No Diseases Found"
          description="Get started by adding your first disease to the clinical catalog."
          icon="data"
          action-label="Add First Disease"
          @action="handleAddNew"
        />

        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          <GridViewCard
            v-for="disease in apiResponse.data"
            :key="disease.id"
            :id="disease.id"
            :title="disease.name"
            :subtitle="disease.category"
            :fields="getDiseaseFields(disease)"
            :selected="selectedIds.includes(disease.id)"
            :show-details="true"
            :show-delete="canDelete"
            @detail="handleViewDetails(disease)"
            @edit="handleEdit(disease)"
            @delete="handleDelete(disease)"
            @select="toggle(disease.id)"
          />
        </div>

        <DynamicTable
          v-else
          :data="apiResponse.data"
          :columns="diseaseColumns"
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
