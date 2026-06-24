<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import router from '@/router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import ListViewTemplate from '@/components/Templates/ListViewTemplate.vue';
  import SearchWithViewToggle from '@/components/UI/SearchWithViewToggle.vue';
  import DynamicTable from '@/components/UI/DynamicTable.vue';
  import DynamicPagination from '@/components/UI/DynamicPagination.vue';
  import EmptyState from '@/components/UI/EmptyState.vue';
  import BulkDeleteButton from '@/components/UI/BulkDeleteButton.vue';
  import BaseCheckbox from '@/components/Base/BaseCheckbox.vue';
  import AppointmentCard from '@/components/Appointment/AppointmentCard.vue';
  import AppointmentStatisticsDashboard from '@/components/Appointment/AppointmentStatisticsDashboard.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import DocumentIcon from '@/assets/images/SVGs/DocumentIcon.svg';
  import AppointmentServices from '@/services/Appointment/appointment.services';
  import type { IAppointment } from '@/services/Appointment/appointment.interface';
  import { useListView } from '@/composables/useListView';
  import { usePermissions } from '@/composables/usePermissions';
  import { useSelection } from '@/composables/useSelection';
  import { useConfirmDelete } from '@/composables/useConfirmDelete';

  const pageTitle = ref('Appointments Management');
  const appointmentService = new AppointmentServices();
  const viewMode = ref<'grid' | 'table'>('table');

  const { canDeleteFromModule } = usePermissions();
  const { confirmDelete, confirmBulkDelete } = useConfirmDelete();
  const { selectedIds, selectionCount, toggle, selectAll, deselectAll, toggleAll } = useSelection<number>();

  const canDelete = computed(() => canDeleteFromModule('Appointments'));

  const showDetailModal = ref(false);
  const detailLoading = ref(false);
  const detailAppointment = ref<IAppointment | null>(null);

  const appointmentColumns = ['patient', 'employee', 'appointmentDateTime', 'appointmentStatus', 'appointmentTypes', 'priority', 'location'];

  const transformAppointmentData = (item: any): any => ({
    ...item,
    _raw: { ...item },
    patient: item.patient?.firstName ? `${item.patient.firstName} ${item.patient.lastName || ''}`.trim() : 'N/A',
    employee: item.employee?.name || 'N/A',
    appointmentStatus: item.appointmentStatus?.statusDescription || 'Pending',
    appointmentTypes: item.appointmentTypes?.typeDescription || 'N/A',
    priority: item.priority || 'Normal',
    appointmentDateTime: item.appointmentDateTime ? new Date(item.appointmentDateTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
    location: item.location || '-',
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
  } = useListView<IAppointment>((filters: string) => appointmentService.getAppointments(filters));

  listFilters.value.isDeleted = false;

  const rawData = ref<any[]>([]);

  const getSearchTerm = async (query: string) => {
    await handleSearch(query, transformAppointmentData);
    rawData.value = apiResponse.value.data.map((d: any) => d._raw || d);
  };

  const handlePageChange = async (newPage: number) => {
    await changePage(newPage, transformAppointmentData);
    rawData.value = apiResponse.value.data.map((d: any) => d._raw || d);
  };

  const handlePageSizeChangeLocal = async (newSize: number) => {
    await handlePageSizeChange(newSize, transformAppointmentData);
    rawData.value = apiResponse.value.data.map((d: any) => d._raw || d);
  };

  const handleEdit = (appointment: IAppointment) => {
    router.push(`/appointments/edit/${appointment.id}`);
  };

  const handleDelete = async (appointment: any) => {
    if (!canDelete.value) return;

    const patientName = appointment._raw?.patient ? `${appointment._raw.patient.firstName} ${appointment._raw.patient.lastName || ''}`.trim() : appointment.patient;

    await confirmDelete({
      entityName: 'Appointment',
      itemName: patientName,
      deleteAction: () => appointmentService.deleteAppointmentById(appointment.id),
      onSuccess: async () => {
        await fetchData(transformAppointmentData);
        rawData.value = apiResponse.value.data.map((d: any) => d._raw || d);
      },
    });
  };

  const handleAddNew = () => {
    router.push('/appointments/add');
  };

  const formatDetailDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDetailTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const closeAppointmentDetail = () => {
    showDetailModal.value = false;
    detailAppointment.value = null;
  };

  const openAppointmentDetail = async (appointmentId: number) => {
    if (!appointmentId) return;
    showDetailModal.value = true;
    detailLoading.value = true;
    detailAppointment.value = null;
    try {
      const res: any = await appointmentService.getAppointmentById(appointmentId);
      detailAppointment.value = res?.data ?? null;
    } catch (e) {
      console.error('Failed to load appointment details', e);
      detailAppointment.value = null;
    } finally {
      detailLoading.value = false;
    }
  };

  const handleTableDetail = (row: any) => {
    const id = row?._raw?.id ?? row?.id;
    openAppointmentDetail(id);
  };

  const handleCardDetail = (appointment: IAppointment) => {
    openAppointmentDetail(appointment.id);
  };

  const handleBulkDelete = async () => {
    if (!canDelete.value) return;

    await confirmBulkDelete({
      entityName: 'Appointment',
      count: selectionCount.value,
      deleteAction: () => appointmentService.bulkDeleteAppointments(selectedIds.value),
      onSuccess: async () => {
        deselectAll();
        await fetchData(transformAppointmentData);
        rawData.value = apiResponse.value.data.map((d: any) => d._raw || d);
      },
    });
  };

  onMounted(async () => {
    await fetchData(transformAppointmentData);
    rawData.value = apiResponse.value.data.map((d: any) => d._raw || d);
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate
      :title="pageTitle"
      breadcrumb-title="Appointments"
      :loading="loading"
      :selection-count="selectionCount"
      :show-bulk-actions="selectionCount > 0"
      @select-all="selectAll(apiResponse.data)"
      @deselect-all="deselectAll"
    >
      <template #subtitle>Manage hospital appointments, schedules, and patient consultations.</template>

      <template #bulk-actions>
        <BulkDeleteButton :disabled="selectionCount === 0" @click="handleBulkDelete" />
      </template>

      <template #search>
        <SearchWithViewToggle v-model="viewMode" :showAdd="true" placeholder="Search appointments..." add-button-route="appointments/add" @search="getSearchTerm" />
      </template>

      <template #table>
        <AppointmentStatisticsDashboard v-if="hasData" />

        <EmptyState
          v-if="isEmpty"
          title="No Appointments Found"
          description="Get started by scheduling your first appointment to manage patient consultations."
          icon="appointment"
          action-label="Schedule Appointment"
          @action="handleAddNew"
        />

        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          <div v-for="appt in rawData" :key="appt.id" :class="['relative', selectedIds.includes(appt.id) ? 'ring-2 ring-primary rounded-xl' : '']">
            <div class="absolute top-3 left-3 z-10" @click.stop>
              <BaseCheckbox :model-value="selectedIds.includes(appt.id)" @change="() => toggle(appt.id)" :id="`grid-checkbox-${appt.id}`" />
            </div>
            <AppointmentCard :appointment="appt" :show-delete="canDelete" show-detail @edit="handleEdit" @delete="handleDelete" @detail="handleCardDetail" />
          </div>
        </div>

        <DynamicTable
          v-else
          :data="apiResponse.data"
          :columns="appointmentColumns"
          :selectable="true"
          :selected-ids="selectedIds"
          item-key="id"
          showDetails
          showEdit
          :showDelete="canDelete"
          @detail="handleTableDetail"
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

    <Transition name="modal">
      <div v-if="showDetailModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="closeAppointmentDetail">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div class="relative bg-surface rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div class="sticky top-0 bg-surface border-b border-stroke dark:border-strokedark p-6 flex items-center justify-between">
            <h2 class="text-2xl font-bold text-emphasis">Appointment details</h2>
            <BaseButton variant="ghost" @click="closeAppointmentDetail" class="w-10 h-10 !p-0 rounded-full hover:bg-elevated flex items-center justify-center" title="Close">
              <DocumentIcon class="w-6 h-6" />
            </BaseButton>
          </div>

          <div class="p-6 space-y-6">
            <div v-if="detailLoading" class="animate-pulse space-y-4">
              <div class="h-24 bg-elevated rounded-xl"></div>
              <div class="h-24 bg-elevated rounded-xl"></div>
            </div>

            <template v-else-if="detailAppointment">
              <div class="bg-elevated rounded-xl p-4">
                <h3 class="text-lg font-semibold text-emphasis mb-4">Patient</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="text-xs text-bodydark dark:text-bodydark1">Name</label>
                    <p class="text-sm font-medium text-emphasis">
                      {{ detailAppointment.patient ? `${detailAppointment.patient.firstName || ''} ${detailAppointment.patient.lastName || ''}`.trim() || 'N/A' : 'N/A' }}
                    </p>
                  </div>
                  <div v-if="detailAppointment.patient?.phone">
                    <label class="text-xs text-bodydark dark:text-bodydark1">Phone</label>
                    <p class="text-sm font-medium text-emphasis">{{ detailAppointment.patient.phone }}</p>
                  </div>
                </div>
              </div>

              <div class="bg-elevated rounded-xl p-4">
                <h3 class="text-lg font-semibold text-emphasis mb-4">Schedule</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="text-xs text-bodydark dark:text-bodydark1">Date & time</label>
                    <p class="text-sm font-medium text-emphasis">{{ formatDetailDateTime(detailAppointment.appointmentDateTime) }}</p>
                  </div>
                  <div>
                    <label class="text-xs text-bodydark dark:text-bodydark1">Status</label>
                    <p class="text-sm font-medium text-emphasis">{{ detailAppointment.appointmentStatus?.statusDescription || 'N/A' }}</p>
                  </div>
                  <div>
                    <label class="text-xs text-bodydark dark:text-bodydark1">Start</label>
                    <p class="text-sm font-medium text-emphasis">{{ formatDetailTime(detailAppointment.startTime) }}</p>
                  </div>
                  <div>
                    <label class="text-xs text-bodydark dark:text-bodydark1">End</label>
                    <p class="text-sm font-medium text-emphasis">{{ formatDetailTime(detailAppointment.endTime) }}</p>
                  </div>
                  <div>
                    <label class="text-xs text-bodydark dark:text-bodydark1">Type</label>
                    <p class="text-sm font-medium text-emphasis">{{ detailAppointment.appointmentTypes?.typeDescription || 'N/A' }}</p>
                  </div>
                  <div>
                    <label class="text-xs text-bodydark dark:text-bodydark1">Priority</label>
                    <p class="text-sm font-medium text-emphasis">{{ detailAppointment.priority || 'Normal' }}</p>
                  </div>
                  <div class="sm:col-span-2">
                    <label class="text-xs text-bodydark dark:text-bodydark1">Location</label>
                    <p class="text-sm font-medium text-emphasis">{{ detailAppointment.location || '—' }}</p>
                  </div>
                  <div v-if="detailAppointment.reason" class="sm:col-span-2">
                    <label class="text-xs text-bodydark dark:text-bodydark1">Reason</label>
                    <p class="text-sm font-medium text-emphasis">{{ detailAppointment.reason }}</p>
                  </div>
                  <div v-if="detailAppointment.notes" class="sm:col-span-2">
                    <label class="text-xs text-bodydark dark:text-bodydark1">Notes</label>
                    <p class="text-sm font-medium text-emphasis whitespace-pre-wrap">{{ detailAppointment.notes }}</p>
                  </div>
                </div>
              </div>

              <div class="bg-elevated rounded-xl p-4">
                <h3 class="text-lg font-semibold text-emphasis mb-4">Doctor</h3>
                <div class="space-y-2">
                  <div>
                    <label class="text-xs text-bodydark dark:text-bodydark1">Name</label>
                    <p class="text-sm font-medium text-emphasis">{{ detailAppointment.employee?.name || 'N/A' }}</p>
                  </div>
                  <div v-if="detailAppointment.employee?.designation">
                    <label class="text-xs text-bodydark dark:text-bodydark1">Designation</label>
                    <p class="text-sm font-medium text-emphasis">{{ detailAppointment.employee.designation }}</p>
                  </div>
                  <div v-if="detailAppointment.employee?.department">
                    <label class="text-xs text-bodydark dark:text-bodydark1">Department</label>
                    <p class="text-sm font-medium text-emphasis">{{ detailAppointment.employee.department.name }}</p>
                  </div>
                </div>
              </div>

              <div class="text-xs text-bodydark dark:text-bodydark1">
                <span v-if="detailAppointment.createdDate">Created {{ formatDetailDateTime(detailAppointment.createdDate) }}</span>
                <span v-if="detailAppointment.createdDate && detailAppointment.updatedDate">·</span>
                <span v-if="detailAppointment.updatedDate">Updated {{ formatDetailDateTime(detailAppointment.updatedDate) }}</span>
              </div>
            </template>

            <div v-else class="text-center py-8 text-bodydark dark:text-bodydark1">Could not load appointment details.</div>
          </div>

          <div class="sticky bottom-0 bg-surface border-t border-stroke dark:border-strokedark p-6 flex justify-end">
            <BaseButton variant="outline" @click="closeAppointmentDetail">Close</BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </DefaultLayout>
</template>

<style scoped>
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.3s ease;
  }
  .modal-enter-active > div:last-child,
  .modal-leave-active > div:last-child {
    transition:
      transform 0.3s ease,
      opacity 0.3s ease;
  }
  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }
  .modal-enter-from > div:last-child,
  .modal-leave-to > div:last-child {
    transform: scale(0.95);
    opacity: 0;
  }
</style>
