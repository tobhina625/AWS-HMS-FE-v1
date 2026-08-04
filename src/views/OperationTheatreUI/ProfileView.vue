<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseCard from '@/components/Base/BaseCard.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import StatusBadge from '@/components/UI/StatusBadge.vue';
  import StartSurgeryModal from '@/components/OperationTheatre/StartSurgeryModal.vue';
  import OperationTheatreService from '@/services/OperationTheatre/OperationTheatre.services';
  import PatientSurgeryServices from '@/services/PatientSurgery/PatientSurgery.services';
  import type { IOperationTheatre, ITheatreSchedule } from '@/services/OperationTheatre/OperationTheatre.dto';
  import type { IPatientSurgery } from '@/services/PatientSurgery/PatientSurgery.dto';
  import useAlert from '@/plugins/alert/useAlert';
  import { useConfirm } from '@/composables/useConfirm';
  import { usePermissions } from '@/composables/usePermissions';

  import KeyIcon from '@/assets/images/SVGs/KeyIcon.svg';
  import EditPencilIcon from '@/assets/images/SVGs/EditPencilIcon.svg';
  import TrashDetailedIcon from '@/assets/images/SVGs/TrashDetailedIcon.svg';
  import DotsHorizontalIcon from '@/assets/images/SVGs/DotsHorizontalIcon.svg';
  import MapPinLocationIcon from '@/assets/images/SVGs/MapPinLocationIcon.svg';
  import BuildingIcon from '@/assets/images/SVGs/Building.svg';
  import CheckCircleIcon from '@/assets/images/SVGs/CheckCircleIcon.svg';
  import CalendarIcon from '@/assets/images/SVGs/CalendarIcon.svg';
  import ClockIcon from '@/assets/images/SVGs/ClockIcon.svg';
  import OperationTheatreIcon from '@/assets/images/SVGs/OperationTheatre.svg';
  import ChartBarIcon from '@/assets/images/SVGs/ChartBarIcon.svg';
  import ClipboardIcon from '@/assets/images/SVGs/ClipboardIcon.svg';

  const route = useRoute();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { confirm } = useConfirm();
  const { canDeleteFromModule } = usePermissions();
  const theatreService = new OperationTheatreService();
  const patientSurgeryService = new PatientSurgeryServices();

  const pageTitle = ref('Operation Theatre Profile');
  const currentTab = ref('about');
  const loading = ref(true);
  const theatreId = ref<number>(0);
  const theatreDetails = ref<IOperationTheatre | null>(null);
  const schedules = ref<ITheatreSchedule[]>([]);
  const schedulesLoading = ref(false);

  // Start Surgery Modal state
  const showStartModal = ref(false);
  const selectedSchedule = ref<ITheatreSchedule | null>(null);
  const scheduleActionLoading = ref<number | null>(null);

  // Compute busy surgeon IDs (surgeons already in an Ongoing surgery)
  const busySurgeonIds = computed(() => {
    return schedules.value
      .filter((s) => {
        const status = (s.status || '').toLowerCase();
        return status === 'inprogress' || status === 'ongoing';
      })
      .map((s) => s.surgeonId)
      .filter((id): id is number => id != null && id > 0);
  });

  // Surgeries tab state
  const theatreSurgeries = ref<IPatientSurgery[]>([]);
  const surgeriesLoading = ref(false);
  const updatingStatusId = ref<number | null>(null);

  const statusOptions = [
    { id: 'Scheduled', name: 'Scheduled' },
    { id: 'Ongoing', name: 'Ongoing' },
    { id: 'Finished', name: 'Finished' },
    { id: 'Cancelled', name: 'Cancelled' },
  ];

  const canDelete = computed(() => canDeleteFromModule('Operation Theatre'));

  const equipmentList = computed(() => {
    if (!theatreDetails.value) return [];
    const items = [];
    if (theatreDetails.value.hasAnesthesiaMachine) items.push({ name: 'Anesthesia Machine', available: true });
    if (theatreDetails.value.hasVentilator) items.push({ name: 'Ventilator', available: true });
    if (theatreDetails.value.hasMonitoringSystem) items.push({ name: 'Monitoring System', available: true });
    if (theatreDetails.value.hasSurgicalLights) items.push({ name: 'Surgical Lights', available: true });
    return items;
  });

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const formatDuration = (minutes: number) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins} minutes`;
  };

  const surgeryStatusClass = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-primary/10 text-primary';
      case 'Ongoing':
        return 'bg-warning/10 text-warning';
      case 'Finished':
        return 'bg-success/10 text-success';
      case 'Cancelled':
        return 'bg-danger/10 text-danger';
      default:
        return 'bg-muted/10 text-muted';
    }
  };

  const getScheduleStatusClass = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'scheduled') return 'bg-primary/10 text-primary';
    if (s === 'inprogress') return 'bg-warning/10 text-warning';
    if (s === 'completed') return 'bg-success/10 text-success';
    if (s === 'cancelled') return 'bg-danger/10 text-danger';
    if (s === 'delayed') return 'bg-warning/10 text-warning';
    return 'bg-elevated text-bodydark';
  };

  const formatScheduleStatus = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'inprogress') return 'Ongoing';
    return status || 'Scheduled';
  };

  const loadTheatreDetails = async () => {
    loading.value = true;
    try {
      theatreId.value = Number(route.params.id);
      const response = await theatreService.getOperationTheatreById(theatreId.value);
      if (response?.data) {
        theatreDetails.value = {
          ...response.data,
          department: response.data.department ? { id: response.data.department.id, name: response.data.department.name } : null,
        };
      }
    } catch (error) {
      console.error('Error loading theatre details:', error);
      showAlert('error', 'Failed to load operation theatre details.', 'Error');
    } finally {
      loading.value = false;
    }
  };

  const loadSchedules = async () => {
    if (!theatreId.value) return;
    schedulesLoading.value = true;
    try {
      schedules.value = await theatreService.getTheatreSchedules(theatreId.value);
    } catch (error) {
      console.error('Error loading schedules:', error);
      schedules.value = [];
    } finally {
      schedulesLoading.value = false;
    }
  };

  const loadSurgeries = async () => {
    if (!theatreId.value) return;
    surgeriesLoading.value = true;
    try {
      const response = await patientSurgeryService.getSurgeriesByTheatre(theatreId.value);
      const content = response?.content || response?.Content || [];
      theatreSurgeries.value = content.filter((item: any) => !item.isDeleted);
    } catch (error) {
      console.error('Error loading surgeries:', error);
      theatreSurgeries.value = [];
    } finally {
      surgeriesLoading.value = false;
    }
  };

  // Start Surgery - opens the modal
  const handleStartSurgery = (schedule: ITheatreSchedule) => {
    selectedSchedule.value = schedule;
    showStartModal.value = true;
  };

  // Handle surgery started event from modal
  const handleSurgeryStarted = async () => {
    showStartModal.value = false;
    await loadSchedules();
    // Update the selected schedule to the refreshed one
    if (selectedSchedule.value) {
      const updated = schedules.value.find((s) => s.id === selectedSchedule.value?.id);
      if (updated) {
        selectedSchedule.value = updated;
        showStartModal.value = true; // Reopen modal in running state
      }
    }
  };

  // Handle surgery completed event from modal
  const handleSurgeryCompleted = async () => {
    showStartModal.value = false;
    selectedSchedule.value = null;
    await loadSchedules();
    await loadTheatreDetails(); // Refresh theatre status
  };

  // Handle complete surgery from the list (opens modal in running state)
  const handleCompleteSurgery = (schedule: ITheatreSchedule) => {
    selectedSchedule.value = schedule;
    showStartModal.value = true;
  };

  // Handle cancel schedule
  const handleCancelSchedule = async (scheduleId: number) => {
    const confirmed = await confirm({
      title: 'Cancel Surgery',
      message: 'Are you sure you want to cancel this surgery? This will also update the patient surgery status to Cancelled.',
      confirmText: 'Cancel Surgery',
      cancelText: 'Keep',
      variant: 'danger',
    });
    if (!confirmed) return;

    scheduleActionLoading.value = scheduleId;
    try {
      const response = await theatreService.cancelSchedule(scheduleId, 'Cancelled from Operation Theatre');
      if (response?.isSuccess ?? (response as any)?.IsSuccess) {
        showAlert('success', 'Surgery cancelled successfully.', 'Success');
        await loadSchedules();
      } else {
        showAlert('error', response?.error || 'Failed to cancel surgery.', 'Error');
      }
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Failed to cancel surgery.';
      showAlert('error', message, 'Error');
    } finally {
      scheduleActionLoading.value = null;
    }
  };

  const updateSurgeryStatus = async (surgeryId: number, newStatus: string) => {
    updatingStatusId.value = surgeryId;
    try {
      const response = await patientSurgeryService.updateSurgeryStatus(surgeryId, newStatus);
      if (response.isSuccess) {
        showAlert('success', `Surgery status updated to ${newStatus}`, 'Success');
        await loadSurgeries();
      } else {
        showAlert('error', response.error || 'Failed to update surgery status.', 'Error');
      }
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Failed to update surgery status.';
      showAlert('error', message, 'Error');
    } finally {
      updatingStatusId.value = null;
    }
  };

  const handleEdit = () => {
    router.push(`/operation-theatre/edit/${theatreId.value}`);
  };

  const handleBack = () => {
    router.push('/operation-theatre');
  };

  const handleViewSchedule = () => {
    router.push(`/operation-theatre/${theatreId.value}/schedule`);
  };

  const handleDelete = async () => {
    if (!canDelete.value) {
      showAlert('error', 'You do not have permission to delete operation theatres.', 'Permission Denied');
      return;
    }
    const confirmed = await confirm({
      title: 'Delete Operation Theatre',
      message: `Are you sure you want to delete ${theatreDetails.value?.name}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed && theatreDetails.value) {
      try {
        await theatreService.deleteOperationTheatreById(theatreDetails.value.id);
        showAlert('success', 'Operation theatre has been deleted successfully.', 'Success');
        router.push('/operation-theatre');
      } catch {
        showAlert('error', 'An error occurred while deleting the operation theatre.', 'Error');
      }
    }
  };

  const setTab = (tab: string) => {
    currentTab.value = tab;
    if (tab === 'schedules') {
      loadSchedules();
    }
    if (tab === 'surgeries') {
      loadSurgeries();
    }
  };

  onMounted(() => {
    loadTheatreDetails();
  });
</script>

<template>
  <DefaultLayout>
    <BreadcrumbDefault :pageTitle="pageTitle" />

    <!-- Loading State -->
    <div v-if="loading" class="animate-pulse space-y-6">
      <div class="bg-surface rounded-2xl p-6">
        <div class="flex items-center gap-6">
          <div class="w-32 h-32 bg-elevated rounded-xl"></div>
          <div class="flex-1 space-y-4">
            <div class="h-8 bg-elevated rounded w-1/3"></div>
            <div class="h-4 bg-elevated rounded w-1/4"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Theatre Profile Content -->
    <div v-else-if="theatreDetails" class="space-y-6">
      <!-- Header Card -->
      <div class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark overflow-hidden">
        <div class="h-32 bg-gradient-to-r from-primary to-primary"></div>

        <div class="px-6 pb-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16">
            <div class="relative">
              <div class="w-32 h-32 rounded-2xl border-4 border-white dark:border-boxdark bg-elevated flex items-center justify-center shadow-lg">
                <OperationTheatreIcon class="w-16 h-16 text-primary" />
              </div>
            </div>

            <div class="flex-1 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4">
              <div>
                <h1 class="text-3xl font-bold text-emphasis mb-2">{{ theatreDetails.name }}</h1>
                <div class="flex items-center gap-4 flex-wrap">
                  <StatusBadge :status="theatreDetails.status" size="md" />
                  <span v-if="theatreDetails.department" class="flex items-center gap-1 text-sm text-bodydark dark:text-bodydark1">
                    <BuildingIcon class="w-4 h-4" />
                    {{ theatreDetails.department.name }}
                  </span>
                  <span v-if="theatreDetails.location" class="flex items-center gap-1 text-sm text-bodydark dark:text-bodydark1">
                    <MapPinLocationIcon class="w-4 h-4" />
                    {{ theatreDetails.location }}
                  </span>
                  <span class="text-sm text-bodydark dark:text-bodydark1">Capacity: {{ theatreDetails.capacity }} people</span>
                </div>
              </div>

              <div class="flex gap-3">
                <BaseButton variant="outline" size="md" @click="handleBack" class="border-2 border-stroke dark:border-strokedark text-emphasis hover:border-primary dark:hover:border-primary">
                  <KeyIcon class="w-4 h-4 mr-2" />
                  Back
                </BaseButton>
                <BaseButton v-if="canDelete" variant="danger" size="md" @click="handleDelete" class="!bg-danger !text-light hover:!bg-danger/90 border-2 border-danger">
                  <TrashDetailedIcon class="w-4 h-4 mr-2" />
                  Delete
                </BaseButton>
                <BaseButton variant="primary" size="md" @click="handleEdit">
                  <EditPencilIcon class="w-4 h-4 mr-2" />
                  Edit
                </BaseButton>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="mt-6 border-b border-stroke dark:border-strokedark">
            <nav class="flex gap-8">
              <BaseButton
                variant="ghost"
                @click="setTab('about')"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors',
                  currentTab === 'about' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">
                  <DotsHorizontalIcon class="w-5 h-5" />
                  About
                </div>
              </BaseButton>
              <BaseButton
                variant="ghost"
                @click="setTab('equipment')"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors',
                  currentTab === 'equipment' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">
                  <CheckCircleIcon class="w-5 h-5" />
                  Equipment
                </div>
              </BaseButton>
              <BaseButton
                variant="ghost"
                @click="setTab('schedules')"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors',
                  currentTab === 'schedules' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">
                  <CalendarIcon class="w-5 h-5" />
                  Schedules
                </div>
              </BaseButton>
              <BaseButton
                variant="ghost"
                @click="setTab('surgeries')"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors',
                  currentTab === 'surgeries' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">
                  <CheckCircleIcon class="w-5 h-5" />
                  Surgeries
                </div>
              </BaseButton>
              <BaseButton
                variant="ghost"
                @click="setTab('statistics')"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors',
                  currentTab === 'statistics' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">
                  <ChartBarIcon class="w-5 h-5" />
                  Statistics
                </div>
              </BaseButton>
            </nav>
          </div>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- About Tab -->
        <template v-if="currentTab === 'about'">
          <div class="lg:col-span-2 bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-6">
            <h2 class="text-xl font-semibold text-emphasis mb-6 flex items-center gap-2">
              <DotsHorizontalIcon class="w-6 h-6 text-primary" />
              Theatre Information
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-1">
                <label class="text-sm text-bodydark dark:text-bodydark1">Name</label>
                <p class="text-base font-medium text-emphasis">{{ theatreDetails.name || 'N/A' }}</p>
              </div>

              <div class="space-y-1">
                <label class="text-sm text-bodydark dark:text-bodydark1">Status</label>
                <p class="text-base">
                  <StatusBadge :status="theatreDetails.status" size="sm" />
                </p>
              </div>

              <div class="space-y-1">
                <label class="text-sm text-bodydark dark:text-bodydark1">Department</label>
                <p class="text-base font-medium text-emphasis">{{ theatreDetails.department?.name || 'Not Assigned' }}</p>
              </div>

              <div class="space-y-1">
                <label class="text-sm text-bodydark dark:text-bodydark1">Specialization</label>
                <p class="text-base font-medium text-emphasis">{{ theatreDetails.specialization || 'General' }}</p>
              </div>

              <div class="space-y-1">
                <label class="text-sm text-bodydark dark:text-bodydark1">Location</label>
                <p class="text-base font-medium text-emphasis">{{ theatreDetails.location || 'N/A' }}</p>
              </div>

              <div class="space-y-1">
                <label class="text-sm text-bodydark dark:text-bodydark1">Capacity</label>
                <p class="text-base font-medium text-emphasis">{{ theatreDetails.capacity }} people</p>
              </div>

              <div class="space-y-1 md:col-span-2">
                <label class="text-sm text-bodydark dark:text-bodydark1">Notes</label>
                <p class="text-base font-medium text-emphasis">{{ theatreDetails.notes || 'No notes' }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-6">
              <h3 class="text-lg font-semibold text-emphasis mb-4 flex items-center gap-2">
                <CheckCircleIcon class="w-5 h-5 text-primary" />
                Equipment Overview
              </h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-3 bg-elevated rounded-lg">
                  <span class="text-sm text-bodydark dark:text-bodydark1">Anesthesia Machine</span>
                  <span class="text-sm font-medium" :class="theatreDetails.hasAnesthesiaMachine ? 'text-success' : 'text-muted'">
                    {{ theatreDetails.hasAnesthesiaMachine ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div class="flex items-center justify-between p-3 bg-elevated rounded-lg">
                  <span class="text-sm text-bodydark dark:text-bodydark1">Ventilator</span>
                  <span class="text-sm font-medium" :class="theatreDetails.hasVentilator ? 'text-success' : 'text-muted'">
                    {{ theatreDetails.hasVentilator ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div class="flex items-center justify-between p-3 bg-elevated rounded-lg">
                  <span class="text-sm text-bodydark dark:text-bodydark1">Monitoring System</span>
                  <span class="text-sm font-medium" :class="theatreDetails.hasMonitoringSystem ? 'text-success' : 'text-muted'">
                    {{ theatreDetails.hasMonitoringSystem ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div class="flex items-center justify-between p-3 bg-elevated rounded-lg">
                  <span class="text-sm text-bodydark dark:text-bodydark1">Surgical Lights</span>
                  <span class="text-sm font-medium" :class="theatreDetails.hasSurgicalLights ? 'text-success' : 'text-muted'">
                    {{ theatreDetails.hasSurgicalLights ? 'Yes' : 'No' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Equipment Tab -->
        <div v-if="currentTab === 'equipment'" class="lg:col-span-3">
          <BaseCard>
            <template #header>
              <h3 class="text-lg font-semibold text-emphasis">Equipment Details</h3>
            </template>

            <div v-if="equipmentList.length > 0" class="space-y-4">
              <div v-for="(item, idx) in equipmentList" :key="idx" class="flex items-center justify-between p-4 bg-elevated rounded-xl border border-stroke dark:border-strokedark">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircleIcon class="w-5 h-5 text-success" />
                  </div>
                  <span class="font-medium text-emphasis">{{ item.name }}</span>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success">Available</span>
              </div>

              <div v-if="theatreDetails.equipmentNotes" class="mt-6 p-4 bg-elevated rounded-xl border border-stroke dark:border-strokedark">
                <h4 class="text-sm font-semibold text-emphasis mb-2 flex items-center gap-2">
                  <ClipboardIcon class="w-4 h-4 text-primary" />
                  Equipment Notes
                </h4>
                <p class="text-sm text-bodydark dark:text-bodydark1">{{ theatreDetails.equipmentNotes }}</p>
              </div>
            </div>

            <div v-else class="text-center py-12 text-muted">
              <CheckCircleIcon class="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No equipment configured for this theatre.</p>
            </div>
          </BaseCard>
        </div>

        <!-- Schedules Tab -->
        <div v-if="currentTab === 'schedules'" class="lg:col-span-3">
          <BaseCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-emphasis">Theatre Schedules</h3>
                <BaseButton variant="primary" size="sm" @click="handleViewSchedule">
                  <CalendarIcon class="w-4 h-4 mr-2" />
                  View Full Schedule
                </BaseButton>
              </div>
            </template>

            <div v-if="schedulesLoading" class="py-12 text-center text-muted">
              <ClockIcon class="w-12 h-12 mx-auto mb-4 animate-pulse" />
              <p>Loading schedules...</p>
            </div>

            <div v-else-if="schedules.length === 0" class="text-center py-12 text-muted">
              <CalendarIcon class="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active schedules found for this theatre.</p>
              <p class="text-xs mt-2">Only Scheduled and Ongoing surgeries are shown here.</p>
              <BaseButton variant="outline" size="sm" class="mt-4" @click="handleViewSchedule">View Full Schedule</BaseButton>
            </div>

            <div v-else class="space-y-4">
              <div v-for="schedule in schedules" :key="schedule.id" class="p-4 bg-elevated rounded-xl border border-stroke dark:border-strokedark hover:border-primary/30 transition-colors">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <p class="font-semibold text-emphasis">{{ schedule.surgeryName }}</p>
                      <span :class="['px-2 py-0.5 rounded-full text-xs font-medium', getScheduleStatusClass(schedule.status)]">
                        {{ formatScheduleStatus(schedule.status) }}
                      </span>
                    </div>
                    <p v-if="schedule.patientName" class="text-sm text-bodydark dark:text-bodydark1">Patient: {{ schedule.patientName }}</p>
                    <p v-if="schedule.surgeonName" class="text-sm text-bodydark dark:text-bodydark1">Surgeon: {{ schedule.surgeonName }}</p>
                    <div class="flex items-center gap-4 mt-2 text-xs text-muted">
                      <span>{{ formatDateTime(schedule.scheduledStartTime) }} - {{ formatDateTime(schedule.scheduledEndTime) }}</span>
                    </div>
                    <p v-if="schedule.notes" class="text-xs text-bodydark mt-2 italic">{{ schedule.notes }}</p>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex flex-col gap-2 min-w-fit">
                    <!-- Start button: only for Scheduled status -->
                    <BaseButton v-if="schedule.status === 'Scheduled'" variant="primary" size="sm" :disabled="scheduleActionLoading === schedule.id" @click="handleStartSurgery(schedule)">
                      {{ scheduleActionLoading === schedule.id ? '...' : 'Start' }}
                    </BaseButton>

                    <!-- Complete button: only for InProgress status (opens modal with timer) -->
                    <BaseButton
                      v-if="schedule.status === 'InProgress' || schedule.status === 'Inprogress'"
                      variant="primary"
                      size="sm"
                      :disabled="scheduleActionLoading === schedule.id"
                      @click="handleCompleteSurgery(schedule)"
                      class="!bg-success hover:!bg-success/90"
                    >
                      {{ scheduleActionLoading === schedule.id ? '...' : 'Complete' }}
                    </BaseButton>

                    <!-- Cancel button: only for Scheduled status (hidden once Ongoing) -->
                    <BaseButton v-if="schedule.status === 'Scheduled'" variant="danger" size="sm" :disabled="scheduleActionLoading === schedule.id" @click="handleCancelSchedule(schedule.id)">
                      Cancel
                    </BaseButton>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Surgeries Tab -->
        <div v-if="currentTab === 'surgeries'" class="lg:col-span-3">
          <BaseCard>
            <template #header>
              <h3 class="text-lg font-semibold text-emphasis">Scheduled Surgeries</h3>
            </template>

            <div v-if="surgeriesLoading" class="py-12 text-center text-muted">
              <ClockIcon class="w-12 h-12 mx-auto mb-4 animate-pulse" />
              <p>Loading surgeries...</p>
            </div>

            <div v-else-if="theatreSurgeries.length === 0" class="text-center py-12 text-muted">
              <CheckCircleIcon class="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No surgeries scheduled for this theatre.</p>
            </div>

            <div v-else class="space-y-4">
              <div v-for="surgery in theatreSurgeries" :key="surgery.id" class="bg-elevated rounded-xl border border-stroke dark:border-strokedark p-4 hover:border-primary/30 transition-colors">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <p class="font-semibold text-emphasis">{{ surgery.surgery?.name || 'Surgery' }}</p>
                      <span class="px-2 py-0.5 text-xs font-semibold rounded-full" :class="surgeryStatusClass(surgery.status)">
                        {{ surgery.status || 'Scheduled' }}
                      </span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-bodydark dark:text-bodydark1">
                      <div>
                        <span class="font-medium">Start:</span>
                        {{ formatDateTime(surgery.surgeryTime) }}
                      </div>
                      <div>
                        <span class="font-medium">End:</span>
                        {{ formatDateTime(surgery.endTime) }}
                      </div>
                      <div>
                        <span class="font-medium">Duration:</span>
                        {{ formatDuration(surgery.duration) }}
                      </div>
                    </div>
                  </div>
                  <div class="ml-4 min-w-[140px]">
                    <BaseSelect
                      v-model="surgery.status"
                      label="Status"
                      :options="statusOptions"
                      placeholder="Change status..."
                      display-key="name"
                      value-key="id"
                      :disabled="updatingStatusId === surgery.id"
                      @change="updateSurgeryStatus(surgery.id, $event)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Statistics Tab -->
        <div v-if="currentTab === 'statistics'" class="lg:col-span-3">
          <BaseCard>
            <template #header>
              <h3 class="text-lg font-semibold text-emphasis">Theatre Statistics</h3>
            </template>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="p-6 bg-elevated rounded-xl border border-stroke dark:border-strokedark">
                <p class="text-sm text-bodydark dark:text-bodydark1 mb-1">Status</p>
                <p class="text-2xl font-bold text-emphasis">
                  <StatusBadge :status="theatreDetails.status" size="md" />
                </p>
              </div>
              <div class="p-6 bg-elevated rounded-xl border border-stroke dark:border-strokedark">
                <p class="text-sm text-bodydark dark:text-bodydark1 mb-1">Capacity</p>
                <p class="text-2xl font-bold text-emphasis">{{ theatreDetails.capacity }} people</p>
              </div>
              <div class="p-6 bg-elevated rounded-xl border border-stroke dark:border-strokedark">
                <p class="text-sm text-bodydark dark:text-bodydark1 mb-1">Equipment Count</p>
                <p class="text-2xl font-bold text-emphasis">{{ theatreDetails.equipmentCount ?? equipmentList.length }}</p>
              </div>
              <div class="p-6 bg-elevated rounded-xl border border-stroke dark:border-strokedark">
                <p class="text-sm text-bodydark dark:text-bodydark1 mb-1">Availability</p>
                <p class="text-2xl font-bold" :class="theatreDetails.isAvailable ? 'text-success' : 'text-warning'">
                  {{ theatreDetails.isAvailable ? 'Available' : 'Unavailable' }}
                </p>
              </div>
            </div>

            <div v-if="theatreDetails.currentSurgeryName" class="mt-6 p-6 bg-primary/5 rounded-xl border border-primary/20">
              <h4 class="text-sm font-semibold text-emphasis mb-2">Current Surgery</h4>
              <p class="font-medium text-emphasis">{{ theatreDetails.currentSurgeryName }}</p>
              <p v-if="theatreDetails.currentPatientName" class="text-sm text-bodydark dark:text-bodydark1">Patient: {{ theatreDetails.currentPatientName }}</p>
              <p v-if="theatreDetails.currentSurgeryStartTime" class="text-sm text-bodydark dark:text-bodydark1">Started: {{ formatDateTime(theatreDetails.currentSurgeryStartTime) }}</p>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-else class="text-center py-20">
      <OperationTheatreIcon class="w-24 h-24 mx-auto mb-4 text-muted opacity-50" />
      <h2 class="text-xl font-semibold text-emphasis mb-2">Operation Theatre Not Found</h2>
      <p class="text-bodydark dark:text-bodydark1 mb-6">The operation theatre you're looking for does not exist or has been removed.</p>
      <BaseButton variant="primary" @click="handleBack">Back to List</BaseButton>
    </div>

    <!-- Start Surgery Modal -->
    <StartSurgeryModal
      :show="showStartModal"
      :schedule="selectedSchedule"
      :busy-surgeon-ids="busySurgeonIds"
      @close="
        showStartModal = false;
        selectedSchedule = null;
      "
      @started="handleSurgeryStarted"
      @completed="handleSurgeryCompleted"
    />
  </DefaultLayout>
</template>
