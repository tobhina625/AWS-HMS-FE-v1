<script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import { inventoryService } from '@/services/Inventory/Inventory.services';
  import type { IInventory } from '@/services/Inventory/Inventory.interface';
  import { useListView } from '@/composables/useListView';
  import { usePermissions } from '@/composables/usePermissions';
  import { useSelection } from '@/composables/useSelection';
  import { useConfirmDelete } from '@/composables/useConfirmDelete';
  import ListViewTemplate from '@/components/Templates/ListViewTemplate.vue';
  import SearchWithViewToggle from '@/components/UI/SearchWithViewToggle.vue';
  import DynamicTable from '@/components/UI/DynamicTable.vue';
  import DynamicPagination from '@/components/UI/DynamicPagination.vue';
  import EmptyState from '@/components/UI/EmptyState.vue';
  import GridViewCard from '@/components/UI/GridViewCard.vue';
  import BulkDeleteButton from '@/components/UI/BulkDeleteButton.vue';
  import InventoryStatisticsDashboard from '@/components/Inventory/InventoryStatisticsDashboard.vue';

  const router = useRouter();
  const pageTitle = ref('Inventory Management');
  const viewMode = ref<'grid' | 'table'>('table');

  const { canDeleteFromModule } = usePermissions();
  const { confirmDelete, confirmBulkDelete } = useConfirmDelete();
  const { selectedIds, selectionCount, toggle, selectAll, deselectAll, toggleAll } = useSelection<number>();

  const canDelete = computed(() => canDeleteFromModule('Inventory'));

  const getInventoryFields = (item: IInventory) => [
    { label: 'SKU', value: item.sku || '-' },
    { label: 'Category', value: item.category || '-' },
    { label: 'Status', value: item.status || 'Unknown' },
    { label: 'Quantity', value: item.quantity || 0 },
    { label: 'Price', value: `$${item.price || 0}` },
    { label: 'Location', value: item.location || '-' },
  ];

  const inventoryColumns = ['name', 'sku', 'category', 'status', 'quantity', 'minimumStockLevel', 'cost', 'price', 'location', 'manufacturer', 'expiryDate'];

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
  } = useListView<IInventory>((filters) => inventoryService.getInventories(filters), 10);

  listFilters.value.isDeleted = false;

  const transformInventoryData = (item: any): IInventory => {
    return {
      id: item.id || 0,
      name: item.name || '',
      description: item.description || '',
      sku: item.sku,
      barcode: item.barcode,
      quantity: item.quantity || 0,
      minimumStockLevel: item.minimumStockLevel || 0,
      reorderLevel: item.reorderLevel || 0,
      maximumStockLevel: item.maximumStockLevel || 0,
      cost: item.cost || 0,
      price: item.price || 0,
      itemType: item.itemType || '',
      category: item.category || '',
      status: item.status || '',
      location: item.location,
      storageConditions: item.storageConditions,
      manufacturer: item.manufacturer,
      supplierName: item.supplierName,
      supplierContact: item.supplierContact,
      manufactureDate: item.manufactureDate,
      expiryDate: item.expiryDate,
      batchNumber: item.batchNumber,
      requiresPrescription: item.requiresPrescription || false,
      isTemperatureControlled: item.isTemperatureControlled || false,
      isHazardous: item.isHazardous || false,
      notes: item.notes,
      lastRestockedDate: item.lastRestockedDate,
      department: item.department,
      isLowStock: item.isLowStock || false,
      needsReorder: item.needsReorder || false,
      isExpiringSoon: item.isExpiringSoon || false,
      isExpired: item.isExpired || false,
      daysUntilExpiry: item.daysUntilExpiry || 0,
      stockPercentage: item.stockPercentage || 0,
      totalValue: item.totalValue || 0,
    };
  };

  onMounted(async () => {
    await fetchData(transformInventoryData);
  });

  watch(viewMode, async () => {
    listFilters.value.page = 0;
    await fetchData(transformInventoryData);
  });

  const handleSearchChange = async (searchTerm: string) => {
    await handleSearch(searchTerm, transformInventoryData);
  };

  const handlePageChangeEvent = async (page: number) => {
    await changePage(page, transformInventoryData);
  };

  const handlePageSizeChangeLocal = async (newSize: number) => {
    await handlePageSizeChange(newSize, transformInventoryData);
  };

  const handleEdit = (itemOrId: IInventory | number) => {
    const id = typeof itemOrId === 'number' ? itemOrId : itemOrId.id;
    router.push({ name: 'InventoryEdit', params: { id } });
  };

  const handleViewDetails = (itemOrId: IInventory | number) => {
    const id = typeof itemOrId === 'number' ? itemOrId : itemOrId.id;
    router.push({ name: 'InventoryEdit', params: { id } });
  };

  const handleDelete = async (item: IInventory) => {
    if (!canDelete.value) return;

    await confirmDelete({
      entityName: 'Inventory Item',
      itemName: item.name,
      deleteAction: () => inventoryService.deleteInventory(item.id),
      onSuccess: () => fetchData(transformInventoryData),
    });
  };

  const handleAddNew = () => {
    router.push({ name: 'InventoryAdd' });
  };

  const handleBulkDelete = async () => {
    if (!canDelete.value) return;

    await confirmBulkDelete({
      entityName: 'Inventory Item',
      count: selectionCount.value,
      deleteAction: () => inventoryService.bulkDeleteInventory(selectedIds.value),
      onSuccess: async () => {
        deselectAll();
        await fetchData(transformInventoryData);
      },
    });
  };
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate
      :title="pageTitle"
      breadcrumb-title="Inventory"
      :loading="loading"
      :selection-count="selectionCount"
      :show-bulk-actions="selectionCount > 0"
      @select-all="selectAll(apiResponse.data)"
      @deselect-all="deselectAll"
    >
      <template #subtitle>Manage hospital inventory, track stock levels, and monitor medical supplies.</template>

      <template #bulk-actions>
        <BulkDeleteButton :disabled="selectionCount === 0" @click="handleBulkDelete" />
      </template>

      <template #search>
        <SearchWithViewToggle v-model="viewMode" :showAdd="true" placeholder="Search inventory..." add-button-route="inventory/add" @search="handleSearchChange" />
      </template>

      <template #table>
        <InventoryStatisticsDashboard v-if="hasData" />

        <EmptyState
          v-if="isEmpty"
          title="No inventory items found"
          description="Get started by adding your first inventory item to track stock levels and manage your hospital supplies."
          actionLabel="Add First Item"
          @action="handleAddNew"
        />

        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          <GridViewCard
            v-for="inventory in apiResponse.data"
            :key="inventory.id"
            :id="inventory.id"
            :title="inventory.name"
            :subtitle="inventory.manufacturer"
            :fields="getInventoryFields(inventory)"
            :selected="selectedIds.includes(inventory.id)"
            :show-delete="canDelete"
            show-details
            @edit="handleEdit(inventory.id)"
            @delete="handleDelete(inventory)"
            @detail="handleViewDetails(inventory.id)"
            @select="toggle(inventory.id)"
          />
        </div>

        <DynamicTable
          v-else
          :data="apiResponse.data"
          :columns="inventoryColumns"
          :selectable="true"
          :selected-ids="selectedIds"
          item-key="id"
          :loading="loading"
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
          :itemsPerPage="apiResponse.itemsPerPage"
          :totalElements="apiResponse.totalElements"
          :startIndex="apiResponse.startIndex"
          @change-page="handlePageChangeEvent"
          @change-page-size="handlePageSizeChangeLocal"
        />
      </template>
    </ListViewTemplate>
  </DefaultLayout>
</template>
