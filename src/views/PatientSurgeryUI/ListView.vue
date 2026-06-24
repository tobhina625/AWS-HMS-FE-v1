<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import router from '@/router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import ListViewTemplate from '@/components/Templates/ListViewTemplate.vue';
  import SearchWithViewToggle from '@/components/UI/SearchWithViewToggle.vue';
  import DynamicTable from '@/components/UI/DynamicTable.vue';
  import DynamicPagination from '@/components/UI/DynamicPagination.vue';
  import EmptyState from '@/components/UI/EmptyState.vue';
  import GridViewCard from '@/components/UI/GridViewCard.vue';
  import PatientSurgeryServices from '@/services/PatientSurgery/PatientSurgery.services';
  import type { IPatientSurgery } from '@/services/PatientSurgery/PatientSurgery.dto';
  import { useListView } from '@/composables/useListView';
  import { useSelection } from '@/composables/useSelection';

  const pageTitle = ref('Patient Surgeries Management');
  const patientSurgeryService = new PatientSurgeryServices();
  const viewMode = ref<'grid' | 'table'>('table');

  const { selectedIds, selectionCount, toggle, selectAll, deselectAll, toggleAll } = useSelection<number>();

  const getPatientSurgeryFields = (surgery: IPatientSurgery) => [
    { label: 'Surgery', value: surgery.surgery?.name || '-' },
    { label: 'Theatre', value: surgery.operationTheatre?.name || '-' },
    { label: 'Start Time', value: new Date(surgery.surgeryTime).toLocaleString() },
    { label: 'End Time', value: new Date(surgery.endTime).toLocaleString() },
  ];

  const patientSurgeryColumns = ['surgery.name', 'operationTheatre.name', 'surgeryTime', 'endTime', 'notes'];

  const transformPatientSurgeryData = (item: any): IPatientSurgery => ({
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
  } = useListView<IPatientSurgery>((filters: string) => patientSurgeryService.getPatientSurgeries(filters), 10);

  listFilters.value.isDeleted = false;

  const getSearchTerm = async (query: string) => {
    await handleSearch(query, transformPatientSurgeryData);
  };

  const handlePageChange = async (newPage: number) => {
    await changePage(newPage, transformPatientSurgeryData);
  };

  const handlePageSizeChangeLocal = async (newSize: number) => {
    await handlePageSizeChange(newSize, transformPatientSurgeryData);
  };

  const handleEdit = (surgery: IPatientSurgery) => {
    router.push(`/patient-surgeries/edit/${surgery.id}`);
  };

  const handleViewDetails = (surgery: IPatientSurgery) => {
    router.push(`/patient-surgeries/edit/${surgery.id}`);
  };

  const handleAddNew = () => {
    router.push('/patient-surgeries/add');
  };

  watch(viewMode, async () => {
    listFilters.value.page = 0;
    await fetchData(transformPatientSurgeryData);
  });

  onMounted(async () => {
    await fetchData(transformPatientSurgeryData);
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate
      :title="pageTitle"
      breadcrumb-title="Patient Surgeries"
      :loading="loading"
      :selection-count="selectionCount"
      :show-bulk-actions="false"
      @select-all="selectAll(apiResponse.data)"
      @deselect-all="deselectAll"
    >
      <template #subtitle>Manage patient surgical procedures and operation records.</template>

      <template #search>
        <SearchWithViewToggle v-model="viewMode" :showAdd="true" placeholder="Search patient surgeries..." add-button-route="patient-surgeries/add" @search="getSearchTerm" />
      </template>

      <template #table>
        <EmptyState
          v-if="isEmpty"
          title="No Patient Surgeries Found"
          description="Get started by adding your first patient surgery record."
          icon="default"
          action-label="Add First Surgery"
          @action="handleAddNew"
        />

        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          <GridViewCard
            v-for="surgery in apiResponse.data"
            :key="surgery.id"
            :id="surgery.id"
            :title="surgery.surgery?.name || 'Surgery'"
            :subtitle="surgery.operationTheatre?.name"
            :fields="getPatientSurgeryFields(surgery)"
            :selected="selectedIds.includes(surgery.id)"
            :show-details="true"
            :show-delete="false"
            @detail="handleViewDetails(surgery)"
            @edit="handleEdit(surgery)"
            @select="toggle(surgery.id)"
          />
        </div>

        <DynamicTable
          v-else
          :data="apiResponse.data"
          :columns="patientSurgeryColumns"
          :selectable="true"
          :selected-ids="selectedIds"
          item-key="id"
          showDetails
          showEdit
          :showDelete="false"
          @detail="handleViewDetails"
          @edit="handleEdit"
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
