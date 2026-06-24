<script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import ListViewTemplate from '@/components/Templates/ListViewTemplate.vue';
  import SearchWithViewToggle from '@/components/UI/SearchWithViewToggle.vue';
  import DynamicTable from '@/components/UI/DynamicTable.vue';
  import DynamicPagination from '@/components/UI/DynamicPagination.vue';
  import EmptyState from '@/components/UI/EmptyState.vue';
  import GridViewCard from '@/components/UI/GridViewCard.vue';
  import BulkDeleteButton from '@/components/UI/BulkDeleteButton.vue';
  import AdmissionServices from '@/services/Admission/Admission.services';
  import type { IAdmission } from '@/services/Admission/Admission.dto';
  import { useListView } from '@/composables/useListView';
  import { usePermissions } from '@/composables/usePermissions';
  import { useSelection } from '@/composables/useSelection';
  import { useConfirmDelete } from '@/composables/useConfirmDelete';
  import { STATUS_OPTIONS } from '@/constants/statusOptions';

  const router = useRouter();
  const pageTitle = ref('Admissions Management');
  const admissionService = new AdmissionServices();
  const viewMode = ref<'grid' | 'table'>('table');

  const { canDeleteFromModule } = usePermissions();
  const { confirmDelete, confirmBulkDelete } = useConfirmDelete();
  const { selectedIds, selectionCount, toggle, selectAll, deselectAll, toggleAll } = useSelection<number>();

  const canDelete = computed(() => canDeleteFromModule('Admissions'));

  const getStatusName = (statusId: number) => {
    const status = STATUS_OPTIONS.ADMISSION.find((s) => s.id === statusId);
    return status?.name || 'Unknown';
  };

  const getAdmissionFields = (admission: IAdmission & { currentStatus?: string; attendingDoctorName?: string; wardName?: string; bedNumberAllocated?: string | number }) => {
    const statusLabel = admission.currentStatus ?? getStatusName(admission.status);
    const statusBadgeClass = STATUS_OPTIONS.ADMISSION_STATUS_COLORS[statusLabel] || 'bg-meta-3/20 text-meta-3 border border-meta-3/40 dark:bg-meta-3/30 dark:border-meta-3/50';
    return [
      { label: 'Patient', value: admission.patient ? `${admission.patient.firstName} ${admission.patient.lastName}` : '-' },
      { label: 'Status', value: statusLabel, badgeClass: statusBadgeClass },
      { label: 'Admission Date', value: typeof admission.admissionDate === 'string' ? admission.admissionDate : new Date(admission.admissionDate as any).toLocaleDateString() },
      { label: 'Attending Doctor', value: admission.attendingDoctorName ?? '-' },
      { label: 'Ward', value: admission.wardName ?? '-' },
      { label: 'Bed', value: admission.bedNumberAllocated !== undefined && admission.bedNumberAllocated !== '' ? String(admission.bedNumberAllocated) : '-' },
    ];
  };

  const admissionColumns = ['patientName', 'currentStatus', 'admissionDate', 'attendingDoctorName', 'wardName', 'bedNumberAllocated'];

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const transformAdmissionData = (item: any): IAdmission & { currentStatus: string; attendingDoctorName: string; wardName: string; bedNumberAllocated: string } => {
    const attending = item.attendingDoctor ?? item.AttendingDoctor;
    const ward = item.ward ?? item.Ward;
    const wb = item.wardBed ?? item.WardBed;
    const bedRaw = wb?.bedNumber ?? wb?.BedNumber;
    const p = item.patient ?? item.Patient;
    const patientDisplay = p ? `${p.firstName ?? p.FirstName ?? ''} ${p.lastName ?? p.LastName ?? ''}`.trim() || '-' : '-';
    return {
      ...item,
      patient: p
        ? {
            id: p.id ?? p.Id,
            firstName: p.firstName ?? p.FirstName ?? '',
            lastName: p.lastName ?? p.LastName ?? '',
          }
        : item.patient,
      patientName: patientDisplay,
      currentStatus: getStatusName(item.status ?? item.Status),
      admissionDate: formatDate(item.admissionDate ?? item.AdmissionDate),
      dischargeDate: formatDate(item.dischargeDate ?? item.DischargeDate),
      totalChargesPayable: item.totalChargesPayable ?? item.TotalChargesPayable ?? 0,
      attendingDoctorName: attending?.name ?? attending?.Name ?? '-',
      wardName: ward?.name ?? ward?.Name ?? '-',
      bedNumberAllocated: bedRaw !== undefined && bedRaw !== null && bedRaw !== '' ? String(bedRaw) : '-',
    };
  };

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
  } = useListView<IAdmission>((filters: string) => admissionService.getAdmissions(filters), 10);

  listFilters.value.isDeleted = false;

  const getSearchTerm = async (query: string) => {
    await handleSearch(query, transformAdmissionData);
  };

  const handlePageChange = async (newPage: number) => {
    await changePage(newPage, transformAdmissionData);
  };

  const handlePageSizeChangeLocal = async (newSize: number) => {
    await handlePageSizeChange(newSize, transformAdmissionData);
  };

  const handleView = (admission: IAdmission) => {
    router.push(`/admissions/${admission.id}`);
  };

  const handleEdit = (admission: IAdmission) => {
    router.push(`/admissions/edit/${admission.id}`);
  };

  const handleDelete = async (admission: IAdmission) => {
    if (!canDelete.value) return;

    await confirmDelete({
      entityName: 'Admission',
      itemName: `Admission #${admission.id}`,
      deleteAction: () => admissionService.deleteAdmission(admission.id),
      onSuccess: () => fetchData(transformAdmissionData),
    });
  };

  const handleAddNew = () => {
    router.push('/admissions/add');
  };

  const handleBulkDelete = async () => {
    if (!canDelete.value) return;

    await confirmBulkDelete({
      entityName: 'Admission',
      count: selectionCount.value,
      deleteAction: () => admissionService.bulkDeleteAdmissions(selectedIds.value),
      onSuccess: async () => {
        deselectAll();
        await fetchData(transformAdmissionData);
      },
    });
  };

  watch(viewMode, async () => {
    listFilters.value.page = 0;
    await fetchData(transformAdmissionData);
  });

  onMounted(async () => {
    await fetchData(transformAdmissionData);
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate
      :title="pageTitle"
      breadcrumb-title="Admissions"
      :loading="loading"
      :selection-count="selectionCount"
      :show-bulk-actions="selectionCount > 0"
      @select-all="selectAll(apiResponse.data)"
      @deselect-all="deselectAll"
    >
      <template #subtitle>Manage patient admissions and discharge records.</template>

      <template #bulk-actions>
        <BulkDeleteButton :disabled="selectionCount === 0" @click="handleBulkDelete" />
      </template>

      <template #search>
        <SearchWithViewToggle v-model="viewMode" :showAdd="true" placeholder="Search admissions..." addButtonRoute="admissions/add" @search="getSearchTerm" />
      </template>

      <template #table>
        <EmptyState
          v-if="isEmpty"
          title="No Admissions Found"
          description="Get started by adding your first admission record."
          icon="default"
          action-label="Add First Admission"
          @action="handleAddNew"
        />

        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          <GridViewCard
            v-for="admission in apiResponse.data"
            :key="admission.id"
            :id="admission.id"
            :title="`Admission #${admission.id}`"
            :subtitle="admission.patient ? `${admission.patient.firstName} ${admission.patient.lastName}` : 'No Patient'"
            :fields="getAdmissionFields(admission)"
            :selected="selectedIds.includes(admission.id)"
            :show-details="true"
            :show-edit="true"
            :show-delete="canDelete"
            @detail="handleView(admission)"
            @edit="handleEdit(admission)"
            @delete="handleDelete(admission)"
            @select="toggle(admission.id)"
          />
        </div>

        <DynamicTable
          v-else
          :data="apiResponse.data"
          :columns="admissionColumns"
          :selectable="true"
          :selected-ids="selectedIds"
          :status-color-map="STATUS_OPTIONS.ADMISSION_STATUS_COLORS"
          item-key="id"
          :showDetails="true"
          :showEdit="true"
          :showDelete="canDelete"
          @detail="handleView"
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
