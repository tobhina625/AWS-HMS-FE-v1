<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import ListViewTemplate from '@/components/Templates/ListViewTemplate.vue';
  import SearchBar from '@/components/UI/SearchBar.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import DynamicTable from '@/components/UI/DynamicTable.vue';
  import DynamicPagination from '@/components/UI/DynamicPagination.vue';
  import EmptyState from '@/components/UI/EmptyState.vue';
  import AdmissionServices from '@/services/Admission/Admission.services';
  import type { IAdmission, IAdmissionQueueSummary } from '@/services/Admission/Admission.dto';
  import { useListView } from '@/composables/useListView';
  import { usePermissions } from '@/composables/usePermissions';
  import { STATUS_OPTIONS } from '@/constants/statusOptions';

  const router = useRouter();
  const pageTitle = ref('Admission queue');
  const admissionService = new AdmissionServices();

  const { canEditModule } = usePermissions();
  const canEdit = computed(() => canEditModule('Admissions'));

  const summaryLoading = ref(false);
  const summary = ref<IAdmissionQueueSummary | null>(null);

  type QueueTab = '' | 'needsBed' | 'preAdmission';

  const getStatusName = (statusId: number) => {
    const status = STATUS_OPTIONS.ADMISSION.find((s) => s.id === statusId);
    return status?.name || 'Unknown';
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
  listFilters.value.queue = '' as QueueTab;

  const activeQueue = computed(() => (listFilters.value.queue || '') as QueueTab);

  const loadSummary = async () => {
    summaryLoading.value = true;
    try {
      summary.value = await admissionService.getQueueSummary();
    } catch {
      summary.value = null;
    } finally {
      summaryLoading.value = false;
    }
  };

  const refresh = async () => {
    await fetchData(transformAdmissionData);
    await loadSummary();
  };

  const getSearchTerm = async (query: string) => {
    await handleSearch(query, transformAdmissionData);
  };

  const handlePageChange = async (newPage: number) => {
    await changePage(newPage, transformAdmissionData);
  };

  const handlePageSizeChangeLocal = async (newSize: number) => {
    await handlePageSizeChange(newSize, transformAdmissionData);
  };

  const setQueueFilter = async (q: QueueTab) => {
    listFilters.value.queue = q;
    listFilters.value.page = 0;
    await refresh();
  };

  const handleView = (admission: IAdmission) => {
    router.push(`/admissions/${admission.id}`);
  };

  const handleEdit = (admission: IAdmission) => {
    router.push(`/admissions/edit/${admission.id}`);
  };

  onMounted(async () => {
    await refresh();
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate :title="pageTitle" breadcrumb-title="Admission queue" :loading="loading">
      <template #subtitle>Bed coordination: patients needing a physical bed and pre-admission pipeline.</template>

      <template #search>
        <SearchBar placeholder="Search admissions..." add-button-route="admissions/add" :show-add="true" @search-term="getSearchTerm" />
      </template>

      <template #filters>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm text-bodydark dark:text-bodydark1 mr-1">Queue:</span>
          <BaseButton type="button" variant="outline" size="sm" :class="activeQueue === '' ? '!border-primary !bg-primary/10 text-primary' : ''" @click="setQueueFilter('')">All</BaseButton>
          <BaseButton type="button" variant="outline" size="sm" :class="activeQueue === 'needsBed' ? '!border-warning !bg-warning/10 text-warning' : ''" @click="setQueueFilter('needsBed')">
            Needs bed
          </BaseButton>
          <BaseButton type="button" variant="outline" size="sm" :class="activeQueue === 'preAdmission' ? '!border-meta-5 !bg-meta-5/10 text-meta-5' : ''" @click="setQueueFilter('preAdmission')">
            Pre-admission
          </BaseButton>
        </div>
      </template>

      <template #table>
        <div class="p-6 pb-0 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-surface rounded-2xl shadow-sm p-5 border border-stroke dark:border-strokedark">
            <p class="text-sm text-bodydark dark:text-bodydark1 mb-1">Needs physical bed</p>
            <p class="text-3xl font-bold text-warning">
              {{ summaryLoading ? '—' : (summary?.needsBedCount ?? '—') }}
            </p>
          </div>
          <div class="bg-surface rounded-2xl shadow-sm p-5 border border-stroke dark:border-strokedark">
            <p class="text-sm text-bodydark dark:text-bodydark1 mb-1">Pre-admission pipeline</p>
            <p class="text-3xl font-bold text-meta-5 dark:text-meta-5">
              {{ summaryLoading ? '—' : (summary?.preAdmissionPipelineCount ?? '—') }}
            </p>
          </div>
          <div class="bg-surface rounded-2xl shadow-sm p-5 border border-stroke dark:border-strokedark">
            <p class="text-sm text-bodydark dark:text-bodydark1 mb-1">Total active admissions</p>
            <p class="text-3xl font-bold text-emphasis">
              {{ summaryLoading ? '—' : (summary?.totalNonDeleted ?? '—') }}
            </p>
          </div>
        </div>

        <EmptyState v-if="isEmpty" title="No admissions in this queue" description="Try another filter or clear search to see more records." icon="default" />

        <DynamicTable
          v-else-if="hasData"
          :data="apiResponse.data"
          :columns="admissionColumns"
          :selectable="false"
          :status-color-map="STATUS_OPTIONS.ADMISSION_STATUS_COLORS"
          item-key="id"
          :showDetails="true"
          :showEdit="canEdit"
          :showDelete="false"
          @detail="handleView"
          @edit="handleEdit"
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
