<script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue';
  import router from '@/router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import ListViewTemplate from '@/components/Templates/ListViewTemplate.vue';
  import SearchWithViewToggle from '@/components/UI/SearchWithViewToggle.vue';
  import DynamicTable from '@/components/UI/DynamicTable.vue';
  import DynamicPagination from '@/components/UI/DynamicPagination.vue';
  import GridViewCard from '@/components/UI/GridViewCard.vue';
  import EmployeeStatisticsDashboard from '@/components/Employee/EmployeeStatisticsDashboard.vue';
  import EmptyState from '@/components/UI/EmptyState.vue';
  import BulkDeleteButton from '@/components/UI/BulkDeleteButton.vue';
  import EmployeesServices from '@/services/Employee/Employee.services';
  import { useListView } from '@/composables/useListView';
  import { usePermissions } from '@/composables/usePermissions';
  import { useSelection } from '@/composables/useSelection';
  import { useConfirmDelete } from '@/composables/useConfirmDelete';
  import type { IEmployee } from '@/services/Employee/Employee.interface';

  const pageTitle = ref('Employees Management');
  const employeeService = new EmployeesServices();
  const viewMode = ref<'grid' | 'table'>('table');

  const { canDeleteFromModule } = usePermissions();
  const { confirmDelete, confirmBulkDelete } = useConfirmDelete();
  const { selectedIds, selectionCount, toggle, selectAll, deselectAll, toggleAll } = useSelection<number>();

  const canDelete = computed(() => canDeleteFromModule('Employees'));

  const getEmployeeFields = (employee: IEmployee) => [
    { label: 'Status', value: employee.status || 'Unknown' },
    { label: 'Email', value: employee.email || '-' },
    { label: 'Phone', value: employee.phoneNumber || '-' },
    { label: 'Specialization', value: employee.specialization || '-' },
    { label: 'Department', value: employee.department?.name || 'Not Assigned' },
    { label: 'On Duty', value: employee.isOnDuty ? 'Yes' : 'No' },
  ];

  const employeeColumns = ['name', 'status', 'email', 'phoneNumber', 'specialization', 'specializationType', 'department', 'officeLocation', 'isOnDuty'];

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
  } = useListView<IEmployee>((filters) => employeeService.getEmployees(filters), 8);

  listFilters.value.isDeleted = false;

  const getGender = (genderId: number) => {
    return genderId === 0 ? 'Male' : genderId === 1 ? 'Female' : 'Other';
  };

  const getDisplaySpecialization = (item: any) => {
    const spec = item.specialization?.trim();
    if (spec && spec.toLowerCase() !== 'general') return spec;
    return item.designations?.[0]?.name || spec || '-';
  };

  const transformEmployeeData = (item: any): IEmployee => ({
    ...item,
    name: item.name ?? item.Name ?? '',
    department: item.department || { id: 0, name: 'Not Assigned' },
    designations: item.designations || [],
    specialization: getDisplaySpecialization(item),
    gender: getGender(item.gender),
    status: item.status || 'Active',
    specializationType: item.specializationType || undefined,
    officeLocation: item.officeLocation || '-',
    isOnDuty: item.isOnDuty || false,
    hasMedicalLicense: item.hasMedicalLicense || false,
    hasSurgicalCertification: item.hasSurgicalCertification || false,
    hasSpecializedTraining: item.hasSpecializedTraining || false,
    certificationCount: item.certificationCount || 0,
    yearsOfService: item.yearsOfService || undefined,
  });

  const getSearchTerm = async (query: string) => {
    await handleSearch(query, transformEmployeeData);
  };

  const handlePageChange = async (newPage: number) => {
    await changePage(newPage, transformEmployeeData);
  };

  const handlePageSizeChangeLocal = async (newSize: number) => {
    await handlePageSizeChange(newSize, transformEmployeeData);
  };

  const handleEdit = (employee: IEmployee) => {
    router.push(`/employees/edit/${employee.id}`);
  };

  const handleViewDetails = (employee: IEmployee) => {
    router.push(`/employees/profile/${employee.id}`);
  };

  const handleDelete = async (employee: IEmployee) => {
    if (!canDelete.value) return;

    await confirmDelete({
      entityName: 'Employee',
      itemName: employee.name || 'this employee',
      deleteAction: () => employeeService.deleteEmployeeById(employee.id.toString()),
      onSuccess: () => fetchData(transformEmployeeData),
    });
  };

  const handleAddNew = () => {
    router.push('/employees/add');
  };

  const handleBulkDelete = async () => {
    if (!canDelete.value) return;

    await confirmBulkDelete({
      entityName: 'Employee',
      count: selectionCount.value,
      deleteAction: () => employeeService.bulkDeleteEmployees(selectedIds.value),
      onSuccess: async () => {
        deselectAll();
        await fetchData(transformEmployeeData);
      },
    });
  };

  watch(viewMode, async () => {
    listFilters.value.page = 0;
    await fetchData(transformEmployeeData);
  });

  onMounted(async () => {
    await fetchData(transformEmployeeData);
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate
      :title="pageTitle"
      breadcrumb-title="Employees"
      :loading="loading"
      :selection-count="selectionCount"
      :show-bulk-actions="selectionCount > 0"
      @select-all="selectAll(apiResponse.data)"
      @deselect-all="deselectAll"
    >
      <template #subtitle>Manage hospital staff, certifications, and department assignments.</template>

      <template #bulk-actions>
        <BulkDeleteButton :disabled="selectionCount === 0" @click="handleBulkDelete" />
      </template>

      <template #search>
        <SearchWithViewToggle v-model="viewMode" :showAdd="true" placeholder="Search employees..." add-button-route="employees/add" @search="getSearchTerm" />
      </template>

      <template #table>
        <EmployeeStatisticsDashboard v-if="hasData" />

        <EmptyState
          v-if="isEmpty"
          title="No Employees Found"
          description="Get started by adding your first employee to manage hospital staff and assignments."
          icon="default"
          action-label="Add First Employee"
          @action="handleAddNew"
        />

        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          <GridViewCard
            v-for="employee in apiResponse.data"
            :key="employee.id"
            :id="employee.id"
            :title="employee.name"
            :subtitle="employee.officeLocation"
            :fields="getEmployeeFields(employee)"
            :selected="selectedIds.includes(employee.id)"
            :show-delete="canDelete"
            show-details
            @edit="handleEdit(employee)"
            @delete="handleDelete(employee)"
            @detail="handleViewDetails(employee)"
            @select="toggle(employee.id)"
          />
        </div>

        <DynamicTable
          v-else
          :data="apiResponse.data"
          :columns="employeeColumns"
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
