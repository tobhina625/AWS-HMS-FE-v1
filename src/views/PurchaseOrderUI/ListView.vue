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
  import PurchaseOrderServices from '@/services/PurchaseOrder/PurchaseOrder.services';
  import type { IPurchaseOrder } from '@/services/PurchaseOrder/PurchaseOrder.dto';
  import { useListView } from '@/composables/useListView';
  import { usePermissions } from '@/composables/usePermissions';
  import { useSelection } from '@/composables/useSelection';
  import { useConfirmDelete } from '@/composables/useConfirmDelete';

  const pageTitle = ref('Purchase Orders Management');
  const purchaseOrderService = new PurchaseOrderServices();
  const viewMode = ref<'grid' | 'table'>('table');

  const { canDeleteFromModule } = usePermissions();
  const { confirmDelete, confirmBulkDelete } = useConfirmDelete();
  const { selectedIds, selectionCount, toggle, selectAll, deselectAll, toggleAll } = useSelection<number>();

  const canDelete = computed(() => canDeleteFromModule('Purchase Orders'));

  const getPurchaseOrderFields = (order: IPurchaseOrder) => [
    { label: 'Vendor', value: order.vendor?.companyName || '-' },
    { label: 'Order Date', value: new Date(order.orderDate).toLocaleDateString() },
    { label: 'Total Amount', value: `Rs. ${order.totalAmount}` },
    { label: 'Status', value: order.isConfirmed ? 'Confirmed' : 'Pending' },
  ];

  const purchaseOrderColumns = ['vendor.companyName', 'orderDate', 'totalAmount', 'isConfirmed'];

  const transformPurchaseOrderData = (item: any): IPurchaseOrder => ({
    ...item,
    totalAmount: item.totalAmount || 0,
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
  } = useListView<IPurchaseOrder>((filters: string) => purchaseOrderService.getPurchaseOrders(filters), 10);

  listFilters.value.isDeleted = false;

  const getSearchTerm = async (query: string) => {
    await handleSearch(query, transformPurchaseOrderData);
  };

  const handlePageChange = async (newPage: number) => {
    await changePage(newPage, transformPurchaseOrderData);
  };

  const handlePageSizeChangeLocal = async (newSize: number) => {
    await handlePageSizeChange(newSize, transformPurchaseOrderData);
  };

  const handleEdit = (order: IPurchaseOrder) => {
    router.push(`/purchase-orders/edit/${order.id}`);
  };

  const handleDelete = async (order: IPurchaseOrder) => {
    if (!canDelete.value) return;

    await confirmDelete({
      entityName: 'Purchase Order',
      itemName: `PO #${order.id}`,
      deleteAction: () => purchaseOrderService.deletePurchaseOrder(order.id),
      onSuccess: () => fetchData(transformPurchaseOrderData),
    });
  };

  const handleAddNew = () => {
    router.push('/purchase-orders/add');
  };

  const handleBulkDelete = async () => {
    if (!canDelete.value) return;

    await confirmBulkDelete({
      entityName: 'Purchase Order',
      count: selectionCount.value,
      deleteAction: () => purchaseOrderService.bulkDeletePurchaseOrders(selectedIds.value),
      onSuccess: async () => {
        deselectAll();
        await fetchData(transformPurchaseOrderData);
      },
    });
  };

  watch(viewMode, async () => {
    listFilters.value.page = 0;
    await fetchData(transformPurchaseOrderData);
  });

  onMounted(async () => {
    await fetchData(transformPurchaseOrderData);
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate
      :title="pageTitle"
      breadcrumb-title="Purchase Orders"
      :loading="loading"
      :selection-count="selectionCount"
      :show-bulk-actions="selectionCount > 0"
      @select-all="selectAll(apiResponse.data)"
      @deselect-all="deselectAll"
    >
      <template #subtitle>Manage purchase orders and vendor transactions.</template>

      <template #bulk-actions>
        <BulkDeleteButton :disabled="selectionCount === 0" @click="handleBulkDelete" />
      </template>

      <template #search>
        <SearchWithViewToggle v-model="viewMode" :showAdd="true" placeholder="Search purchase orders..." add-button-route="purchase-orders/add" @search="getSearchTerm" />
      </template>

      <template #table>
        <EmptyState
          v-if="isEmpty"
          title="No Purchase Orders Found"
          description="Get started by creating your first purchase order."
          icon="default"
          action-label="Add First Purchase Order"
          @action="handleAddNew"
        />

        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          <GridViewCard
            v-for="order in apiResponse.data"
            :key="order.id"
            :id="order.id"
            :title="`PO #${order.id}`"
            :subtitle="order.vendor?.companyName"
            :fields="getPurchaseOrderFields(order)"
            :selected="selectedIds.includes(order.id)"
            :show-delete="canDelete"
            @edit="handleEdit(order)"
            @delete="handleDelete(order)"
            @select="toggle(order.id)"
          />
        </div>

        <DynamicTable
          v-else
          :data="apiResponse.data"
          :columns="purchaseOrderColumns"
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
