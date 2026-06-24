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
  import RoleServices from '@/services/Role/Role.services';
  import type { IRole } from '@/services/Role/Role.dto';
  import { useListView } from '@/composables/useListView';
  import { usePermissions } from '@/composables/usePermissions';
  import { useSelection } from '@/composables/useSelection';
  import { useConfirmDelete } from '@/composables/useConfirmDelete';

  const pageTitle = ref('Roles Management');
  const roleService = new RoleServices();
  const viewMode = ref<'grid' | 'table'>('table');

  const { canDeleteFromModule } = usePermissions();
  const { confirmDelete, confirmBulkDelete } = useConfirmDelete();
  const { selectedIds, selectionCount, toggle, selectAll, deselectAll, toggleAll } = useSelection<number>();

  const canDelete = computed(() => canDeleteFromModule('Roles'));

  const getRoleFields = (role: IRole) => [{ label: 'Role Name', value: role.name }];

  const roleColumns = ['name'];

  const transformRoleData = (item: any): IRole => ({
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
  } = useListView<IRole>((filters: string) => roleService.getRoles(filters), 10);

  listFilters.value.isDeleted = false;

  const getSearchTerm = async (query: string) => {
    await handleSearch(query, transformRoleData);
  };

  const handlePageChange = async (newPage: number) => {
    await changePage(newPage, transformRoleData);
  };

  const handlePageSizeChangeLocal = async (newSize: number) => {
    await handlePageSizeChange(newSize, transformRoleData);
  };

  const handleEdit = (role: IRole) => {
    router.push(`/roles/edit/${role.id}`);
  };

  const handleDelete = async (role: IRole) => {
    if (!canDelete.value) return;

    await confirmDelete({
      entityName: 'Role',
      itemName: role.name,
      deleteAction: () => roleService.deleteRole(role.id),
      onSuccess: () => fetchData(transformRoleData),
    });
  };

  const handleAddNew = () => {
    router.push('/roles/add');
  };

  const handleBulkDelete = async () => {
    if (!canDelete.value) return;

    await confirmBulkDelete({
      entityName: 'Role',
      count: selectionCount.value,
      deleteAction: () => roleService.bulkDeleteRoles(selectedIds.value),
      onSuccess: async () => {
        deselectAll();
        await fetchData(transformRoleData);
      },
    });
  };

  watch(viewMode, async () => {
    listFilters.value.page = 0;
    await fetchData(transformRoleData);
  });

  onMounted(async () => {
    await fetchData(transformRoleData);
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate
      :title="pageTitle"
      breadcrumb-title="Roles"
      :loading="loading"
      :selection-count="selectionCount"
      :show-bulk-actions="selectionCount > 0"
      @select-all="selectAll(apiResponse.data)"
      @deselect-all="deselectAll"
    >
      <template #subtitle>Manage user roles and access levels.</template>

      <template #bulk-actions>
        <BulkDeleteButton :disabled="selectionCount === 0" @click="handleBulkDelete" />
      </template>

      <template #search>
        <SearchWithViewToggle v-model="viewMode" :showAdd="true" placeholder="Search roles..." add-button-route="roles/add" @search="getSearchTerm" />
      </template>

      <template #table>
        <EmptyState
          v-if="isEmpty"
          title="No Roles Found"
          description="Get started by adding your first role to manage user access."
          icon="default"
          action-label="Add First Role"
          @action="handleAddNew"
        />

        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          <GridViewCard
            v-for="role in apiResponse.data"
            :key="role.id"
            :id="role.id"
            :title="role.name"
            :fields="getRoleFields(role)"
            :selected="selectedIds.includes(role.id)"
            :show-delete="canDelete"
            @edit="handleEdit(role)"
            @delete="handleDelete(role)"
            @select="toggle(role.id)"
          />
        </div>

        <DynamicTable
          v-else
          :data="apiResponse.data"
          :columns="roleColumns"
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
