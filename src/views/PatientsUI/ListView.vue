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
  import PatientStatisticsDashboard from '@/components/Patient/PatientStatisticsDashboard.vue';
  import PatientServices from '@/services/Patient/patient.services';
  import { useListView } from '@/composables/useListView';
  import { usePermissions } from '@/composables/usePermissions';
  import { useSelection } from '@/composables/useSelection';
  import { useConfirmDelete } from '@/composables/useConfirmDelete';
  import type { IPatient } from '@/services/Patient/patient.interface';

  const pageTitle = ref('Patients Management');
  const patientService = new PatientServices();
  const viewMode = ref<'grid' | 'table'>('table');
  const statsDashboardRef = ref<InstanceType<typeof PatientStatisticsDashboard> | null>(null);

  const { canDeleteFromModule } = usePermissions();
  const { confirmDelete, confirmBulkDelete } = useConfirmDelete();
  const { selectedIds, selectionCount, toggle, selectAll, deselectAll, toggleAll } = useSelection<number>();

  const canDelete = computed(() => canDeleteFromModule('Patients'));

  const getPatientFields = (patient: IPatient) => [
    { label: 'Age', value: patient.age, suffix: 'years' },
    { label: 'Gender', value: patient.gender },
    { label: 'Phone', value: patient.phone },
  ];

  const patientColumns = ['firstName', 'lastName', 'age', 'gender', 'phone', 'cnic', 'address'];

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
  } = useListView<IPatient>((filters) => patientService.getPatients(filters), 10);

  listFilters.value.isDeleted = false;

  const transformPatientData = (item: any): IPatient => {
    let calculatedAge = item.age || 0;
    if (!calculatedAge && item.dateOfBirth) {
      const birthDate = new Date(item.dateOfBirth);
      const today = new Date();
      calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
    }

    return {
      ...item,
      gender: item.gender === 0 ? 'Male' : item.gender === 1 ? 'Female' : 'Other',
      age: calculatedAge,
      firstName: item.firstName || '',
      lastName: item.lastName || '',
      phone: item.phone || '',
      cnic: item.cnic || '',
      address: item.address || '',
    };
  };

  const getSearchTerm = async (query: string) => {
    await handleSearch(query, transformPatientData);
  };

  const handlePageChange = async (newPage: number) => {
    await changePage(newPage, transformPatientData);
  };

  const handlePageSizeChangeLocal = async (newSize: number) => {
    await handlePageSizeChange(newSize, transformPatientData);
  };

  const handleEdit = (patient: IPatient) => {
    router.push(`/patients/edit/${patient.id}`);
  };

  const handleDetail = (patient: IPatient) => {
    router.push(`/patients/profile/${patient.id}`);
  };

  const handleAddNew = () => {
    router.push('/patients/add');
  };

  const handleDelete = async (patient: IPatient) => {
    if (!canDelete.value) return;

    await confirmDelete({
      entityName: 'Patient',
      itemName: `${patient.firstName} ${patient.lastName}`,
      deleteAction: () => patientService.deletePatient(patient.id.toString()),
      onSuccess: async () => {
        await fetchData(transformPatientData);
        statsDashboardRef.value?.refresh();
      },
    });
  };

  const handleBulkDelete = async () => {
    if (!canDelete.value) return;

    await confirmBulkDelete({
      entityName: 'Patient',
      count: selectionCount.value,
      deleteAction: () => patientService.bulkDeletePatients(selectedIds.value),
      onSuccess: async () => {
        deselectAll();
        await fetchData(transformPatientData);
        statsDashboardRef.value?.refresh();
      },
    });
  };

  watch(viewMode, async () => {
    listFilters.value.page = 0;
    await fetchData(transformPatientData);
  });

  onMounted(async () => {
    await fetchData(transformPatientData);
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate
      :title="pageTitle"
      breadcrumb-title="Patients"
      :loading="loading"
      :selection-count="selectionCount"
      :show-bulk-actions="selectionCount > 0"
      @select-all="selectAll(apiResponse.data)"
      @deselect-all="deselectAll"
    >
      <template #subtitle>Manage patient records, history, and active consultations.</template>

      <template #bulk-actions>
        <BulkDeleteButton :disabled="selectionCount === 0" @click="handleBulkDelete" />
      </template>

      <template #search>
        <SearchWithViewToggle
          v-model="viewMode"
          placeholder="Search by name, ID or mobile..."
          addButtonRoute="patients/add"
          :showAdd="true"
          search-bar-class="flex-1 max-w-3xl min-w-[420px] [&_input]:min-h-[48px]"
          @search="getSearchTerm"
        />
      </template>

      <template #table>
        <PatientStatisticsDashboard v-if="hasData" ref="statsDashboardRef" />

        <EmptyState
          v-if="isEmpty"
          title="No Patients Found"
          description="Get started by adding your first patient to manage medical records and consultations."
          icon="patient"
          action-label="Add First Patient"
          @action="handleAddNew"
        />

        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          <GridViewCard
            v-for="patient in apiResponse.data"
            :key="patient.id"
            :id="patient.id"
            :title="`${patient.firstName} ${patient.lastName}`"
            :subtitle="patient.cnic"
            :fields="getPatientFields(patient)"
            :selected="selectedIds.includes(patient.id)"
            :show-details="true"
            :show-delete="canDelete"
            @edit="handleEdit(patient)"
            @delete="handleDelete(patient)"
            @detail="handleDetail(patient)"
            @select="toggle(patient.id)"
          />
        </div>

        <DynamicTable
          v-else
          :data="apiResponse.data"
          :columns="patientColumns"
          :selectable="true"
          :selected-ids="selectedIds"
          item-key="id"
          showEdit
          showDetails
          :showDelete="canDelete"
          @edit="handleEdit"
          @detail="handleDetail"
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
