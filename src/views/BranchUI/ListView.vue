<script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue';
  import router from '@/router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import ListViewTemplate from '@/components/Templates/ListViewTemplate.vue';
  import SearchWithViewToggle from '@/components/UI/SearchWithViewToggle.vue';
  import DynamicTable from '@/components/UI/DynamicTable.vue';
  import DynamicPagination from '@/components/UI/DynamicPagination.vue';
  import GridViewCard from '@/components/UI/GridViewCard.vue';
  import EmptyState from '@/components/UI/EmptyState.vue';
  import BulkDeleteButton from '@/components/UI/BulkDeleteButton.vue';
  import BranchService, { type BranchDto } from '@/services/Branch/Branch.services';
  import { useListView } from '@/composables/useListView';
  import { usePermissions } from '@/composables/usePermissions';
  import { useSelection } from '@/composables/useSelection';
  import { useConfirmDelete } from '@/composables/useConfirmDelete';

  const pageTitle = ref('Branches Management');
  const viewMode = ref<'grid' | 'table'>('table');

  const { canDeleteFromModule } = usePermissions();
  const { confirmDelete, confirmBulkDelete } = useConfirmDelete();
  const { selectedIds, selectionCount, toggle, selectAll, deselectAll, toggleAll } = useSelection<number>();

  const canDelete = computed(() => canDeleteFromModule('Branches'));

  const getBranchFields = (branch: BranchDto) => [
    { label: 'Code', value: branch.code || '-' },
    { label: 'City', value: branch.city || '-' },
    { label: 'Phone', value: branch.phoneNumber || '-' },
    { label: 'Email', value: branch.email || '-' },
    { label: 'Branch Head', value: branch.branchHeadName || 'Not Assigned' },
    { label: 'Status', value: branch.status || 'Active' },
    { label: 'Employees', value: branch.employeeCount.toString() },
  ];

  const branchColumns = ['name', 'code', 'city', 'phoneNumber', 'email', 'branchHeadName', 'status', 'employeeCount'];

  const {
    loading,
    listFilters,
    apiResponse,
    isEmpty,
    fetchData,
    handleSearch,
    handlePageChange: changePage,
    handlePageSizeChange,
  } = useListView<BranchDto>((filters) => BranchService.getAllBranches(filters.page, filters.size, filters.sort, filters.searchTerm), 8);

  const transformBranchData = (item: any): BranchDto => ({
    id: item.id,
    name: item.name || '',
    code: item.code || '',
    address: item.address || '',
    city: item.city,
    phoneNumber: item.phoneNumber,
    email: item.email,
    latitude: item.latitude,
    longitude: item.longitude,
    allowedRadiusMeters: item.allowedRadiusMeters,
    branchHeadId: item.branchHeadId,
    branchHeadName: item.branchHeadName,
    requireLocationLogin: item.requireLocationLogin || false,
    status: item.status || 'Active',
    employeeCount: item.employeeCount || 0,
  });

  const getSearchTerm = async (query: string) => {
    await handleSearch(query, transformBranchData);
  };

  const handlePageChange = async (newPage: number) => {
    await changePage(newPage, transformBranchData);
  };

  const handlePageSizeChangeLocal = async (newSize: number) => {
    await handlePageSizeChange(newSize, transformBranchData);
  };

  const handleEdit = (branch: BranchDto) => {
    router.push(`/branches/edit/${branch.id}`);
  };

  const handleViewDetails = (branch: BranchDto) => {
    router.push(`/branches/profile/${branch.id}`);
  };

  const handleDelete = async (branch: BranchDto) => {
    if (!canDelete.value) return;

    await confirmDelete({
      entityName: 'Branch',
      itemName: branch.name || 'this branch',
      deleteAction: () => BranchService.deleteBranch(branch.id),
      onSuccess: () => fetchData(transformBranchData),
    });
  };

  const handleAddNew = () => {
    router.push('/branches/add');
  };

  const handleBulkDelete = async () => {
    if (!canDelete.value) return;

    await confirmBulkDelete({
      entityName: 'Branch',
      count: selectionCount.value,
      deleteAction: async () => {
        const deletePromises = Array.from(selectedIds.value).map((id) => BranchService.deleteBranch(id));
        await Promise.all(deletePromises);
      },
      onSuccess: async () => {
        deselectAll();
        await fetchData(transformBranchData);
      },
    });
  };

  watch(viewMode, async () => {
    listFilters.value.page = 0;
    await fetchData(transformBranchData);
  });

  onMounted(async () => {
    await fetchData(transformBranchData);
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate
      :title="pageTitle"
      breadcrumb-title="Branches"
      :loading="loading"
      :selection-count="selectionCount"
      :show-bulk-actions="selectionCount > 0"
      @select-all="selectAll(apiResponse.data)"
      @deselect-all="deselectAll"
    >
      <template #subtitle>Manage hospital branches, locations, and branch-specific configurations.</template>

      <template #bulk-actions>
        <BulkDeleteButton :disabled="selectionCount === 0" @click="handleBulkDelete" />
      </template>

      <template #search>
        <SearchWithViewToggle
          v-model="viewMode"
          placeholder="Search branches..."
          addButtonRoute="branches/add"
          :showAdd="true"
          search-bar-class="flex-1 max-w-3xl min-w-[420px] [&_input]:min-h-[48px]"
          @search="getSearchTerm"
        />
      </template>

      <template #table>
        <EmptyState
          v-if="isEmpty"
          title="No Branches Found"
          description="Get started by adding your first branch to manage multiple hospital locations."
          icon="branch"
          action-label="Add First Branch"
          @action="handleAddNew"
        />

        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          <GridViewCard
            v-for="branch in apiResponse.data"
            :key="branch.id"
            :id="branch.id"
            :title="branch.name"
            :subtitle="branch.code"
            :fields="getBranchFields(branch)"
            :selected="selectedIds.includes(branch.id)"
            :show-details="true"
            :show-delete="canDelete"
            @edit="handleEdit(branch)"
            @delete="handleDelete(branch)"
            @detail="handleViewDetails(branch)"
            @select="toggle(branch.id)"
          />
        </div>

        <DynamicTable
          v-else
          :data="apiResponse.data"
          :columns="branchColumns"
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
