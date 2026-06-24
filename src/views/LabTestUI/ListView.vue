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
  import LabTestServices from '@/services/LabTest/LabTest.services';
  import type { ILabTest } from '@/services/LabTest/LabTest.dto';
  import { useListView } from '@/composables/useListView';
  import { usePermissions } from '@/composables/usePermissions';
  import { useSelection } from '@/composables/useSelection';
  import { useConfirmDelete } from '@/composables/useConfirmDelete';

  const pageTitle = ref('Lab Tests Management');
  const labTestService = new LabTestServices();
  const viewMode = ref<'grid' | 'table'>('table');

  const { canDeleteFromModule } = usePermissions();
  const { confirmDelete, confirmBulkDelete } = useConfirmDelete();
  const { selectedIds, selectionCount, toggle, selectAll, deselectAll, toggleAll } = useSelection<number>();

  const canDelete = computed(() => canDeleteFromModule('Lab Tests'));

  const getLabTestFields = (labTest: ILabTest) => [{ label: 'Price', value: `Rs. ${labTest.price}` }];

  const labTestColumns = ['name', 'price'];

  const transformLabTestData = (item: any): ILabTest => ({
    ...item,
    price: item.price || 0,
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
  } = useListView<ILabTest>((filters: string) => labTestService.getLabTests(filters), 10);

  listFilters.value.isDeleted = false;

  const getSearchTerm = async (query: string) => {
    await handleSearch(query, transformLabTestData);
  };

  const handlePageChange = async (newPage: number) => {
    await changePage(newPage, transformLabTestData);
  };

  const handlePageSizeChangeLocal = async (newSize: number) => {
    await handlePageSizeChange(newSize, transformLabTestData);
  };

  const handleEdit = (labTest: ILabTest) => {
    router.push(`/lab-tests/edit/${labTest.id}`);
  };

  const handleDelete = async (labTest: ILabTest) => {
    if (!canDelete.value) return;

    await confirmDelete({
      entityName: 'Lab Test',
      itemName: labTest.name,
      deleteAction: () => labTestService.deleteLabTest(labTest.id),
      onSuccess: () => fetchData(transformLabTestData),
    });
  };

  const handleAddNew = () => {
    router.push('/lab-tests/add');
  };

  const handleBulkDelete = async () => {
    if (!canDelete.value) return;

    await confirmBulkDelete({
      entityName: 'Lab Test',
      count: selectionCount.value,
      deleteAction: () => labTestService.bulkDeleteLabTests(selectedIds.value),
      onSuccess: async () => {
        deselectAll();
        await fetchData(transformLabTestData);
      },
    });
  };

  watch(viewMode, async () => {
    listFilters.value.page = 0;
    await fetchData(transformLabTestData);
  });

  onMounted(async () => {
    await fetchData(transformLabTestData);
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate
      :title="pageTitle"
      breadcrumb-title="Lab Tests"
      :loading="loading"
      :selection-count="selectionCount"
      :show-bulk-actions="selectionCount > 0"
      @select-all="selectAll(apiResponse.data)"
      @deselect-all="deselectAll"
    >
      <template #subtitle>Manage laboratory tests and diagnostic procedures.</template>

      <template #bulk-actions>
        <BulkDeleteButton :disabled="selectionCount === 0" @click="handleBulkDelete" />
      </template>

      <template #search>
        <SearchWithViewToggle v-model="viewMode" :showAdd="true" placeholder="Search lab tests..." add-button-route="lab-tests/add" @search="getSearchTerm" />
      </template>

      <template #table>
        <EmptyState
          v-if="isEmpty"
          title="No Lab Tests Found"
          description="Get started by adding your first lab test to the system."
          icon="default"
          action-label="Add First Lab Test"
          @action="handleAddNew"
        />

        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          <GridViewCard
            v-for="labTest in apiResponse.data"
            :key="labTest.id"
            :id="labTest.id"
            :title="labTest.name"
            :subtitle="`Rs. ${labTest.price}`"
            :fields="getLabTestFields(labTest)"
            :selected="selectedIds.includes(labTest.id)"
            :show-delete="canDelete"
            @edit="handleEdit(labTest)"
            @delete="handleDelete(labTest)"
            @select="toggle(labTest.id)"
          />
        </div>

        <DynamicTable
          v-else
          :data="apiResponse.data"
          :columns="labTestColumns"
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
