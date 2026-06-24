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
  import VendorServices from '@/services/Vendor/Vendor.services';
  import type { IVendor } from '@/services/Vendor/Vendor.dto';
  import { useListView } from '@/composables/useListView';
  import { usePermissions } from '@/composables/usePermissions';
  import { useSelection } from '@/composables/useSelection';
  import { useConfirmDelete } from '@/composables/useConfirmDelete';

  const pageTitle = ref('Vendors Management');
  const vendorService = new VendorServices();
  const viewMode = ref<'grid' | 'table'>('table');

  const { canDeleteFromModule } = usePermissions();
  const { confirmDelete, confirmBulkDelete } = useConfirmDelete();
  const { selectedIds, selectionCount, toggle, selectAll, deselectAll, toggleAll } = useSelection<number>();

  const canDelete = computed(() => canDeleteFromModule('Vendors'));

  const getVendorFields = (vendor: IVendor) => [
    { label: 'Representative', value: vendor.representative || '-' },
    { label: 'Contact', value: vendor.contactNo || '-' },
    { label: 'Total Payable', value: `Rs. ${vendor.totalPayable}` },
    { label: 'Balance', value: `Rs. ${vendor.remainingBalance}` },
  ];

  const vendorColumns = ['companyName', 'representative', 'contactNo', 'totalPayable', 'paidAmount', 'remainingBalance'];

  const transformVendorData = (item: any): IVendor => ({
    ...item,
    totalPayable: item.totalPayable || 0,
    paidAmount: item.paidAmount || 0,
    remainingBalance: item.remainingBalance || 0,
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
  } = useListView<IVendor>((filters: string) => vendorService.getVendors(filters), 10);

  listFilters.value.isDeleted = false;

  const getSearchTerm = async (query: string) => {
    await handleSearch(query, transformVendorData);
  };

  const handlePageChange = async (newPage: number) => {
    await changePage(newPage, transformVendorData);
  };

  const handlePageSizeChangeLocal = async (newSize: number) => {
    await handlePageSizeChange(newSize, transformVendorData);
  };

  const handleEdit = (vendor: IVendor) => {
    router.push(`/vendors/edit/${vendor.id}`);
  };

  const handleDelete = async (vendor: IVendor) => {
    if (!canDelete.value) return;

    await confirmDelete({
      entityName: 'Vendor',
      itemName: vendor.companyName,
      deleteAction: () => vendorService.deleteVendor(vendor.id),
      onSuccess: () => fetchData(transformVendorData),
    });
  };

  const handleAddNew = () => {
    router.push('/vendors/add');
  };

  const handleBulkDelete = async () => {
    if (!canDelete.value) return;

    await confirmBulkDelete({
      entityName: 'Vendor',
      count: selectionCount.value,
      deleteAction: () => vendorService.bulkDeleteVendors(selectedIds.value),
      onSuccess: async () => {
        deselectAll();
        await fetchData(transformVendorData);
      },
    });
  };

  watch(viewMode, async () => {
    listFilters.value.page = 0;
    await fetchData(transformVendorData);
  });

  onMounted(async () => {
    await fetchData(transformVendorData);
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate
      :title="pageTitle"
      breadcrumb-title="Vendors"
      :loading="loading"
      :selection-count="selectionCount"
      :show-bulk-actions="selectionCount > 0"
      @select-all="selectAll(apiResponse.data)"
      @deselect-all="deselectAll"
    >
      <template #subtitle>Manage vendor accounts and payment tracking.</template>

      <template #bulk-actions>
        <BulkDeleteButton :disabled="selectionCount === 0" @click="handleBulkDelete" />
      </template>

      <template #search>
        <SearchWithViewToggle v-model="viewMode" :showAdd="true" placeholder="Search vendors..." add-button-route="vendors/add" @search="getSearchTerm" />
      </template>

      <template #table>
        <EmptyState
          v-if="isEmpty"
          title="No Vendors Found"
          description="Get started by adding your first vendor to the system."
          icon="default"
          action-label="Add First Vendor"
          @action="handleAddNew"
        />

        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          <GridViewCard
            v-for="vendor in apiResponse.data"
            :key="vendor.id"
            :id="vendor.id"
            :title="vendor.companyName"
            :subtitle="vendor.representative"
            :fields="getVendorFields(vendor)"
            :selected="selectedIds.includes(vendor.id)"
            :show-delete="canDelete"
            @edit="handleEdit(vendor)"
            @delete="handleDelete(vendor)"
            @select="toggle(vendor.id)"
          />
        </div>

        <DynamicTable
          v-else
          :data="apiResponse.data"
          :columns="vendorColumns"
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
