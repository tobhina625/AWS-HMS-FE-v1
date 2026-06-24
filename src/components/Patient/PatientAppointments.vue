<script setup lang="ts">
  import CalendarIcon from '@/assets/images/SVGs/CalendarIcon.svg';
  import ChevronRightIcon from '@/assets/images/SVGs/ChevronRightIcon.svg';
  import ClockIcon from '@/assets/images/SVGs/ClockIcon.svg';
  import PlusSimpleIcon from '@/assets/images/SVGs/PlusSimpleIcon.svg';
  import DocumentIcon from '@/assets/images/SVGs/DocumentIcon.svg';
  import ClipboardDocIcon from '@/assets/images/SVGs/ClipboardDocIcon.svg';
  import UserIcon from '@/assets/images/SVGs/UserIcon.svg';

  import { ref, onMounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import AppointmentServices from '@/services/Appointment/appointment.services';
  import type { IAppointment } from '@/services/Appointment/appointment.interface';

  const router = useRouter();

  const props = defineProps<{
    patientId: number;
  }>();

  const appointmentService = new AppointmentServices();
  const loading = ref(true);
  const appointments = ref<IAppointment[]>([]);
  const selectedAppointment = ref<IAppointment | null>(null);
  const showDetails = ref(false);

  const loadAppointments = async () => {
    loading.value = true;
    try {
      const response = await appointmentService.getAppointmentsByPatientId(props.patientId);
      if (response?.data) {
        appointments.value = response.data;
      } else {
        appointments.value = [];
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      appointments.value = [];
    } finally {
      loading.value = false;
    }
  };

  const viewDetails = (appointment: IAppointment) => {
    selectedAppointment.value = appointment;
    showDetails.value = true;
  };

  const closeDetails = () => {
    showDetails.value = false;
    selectedAppointment.value = null;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (statusDescription: string) => {
    const statusLower = statusDescription?.toLowerCase() || '';
    if (statusLower.includes('confirm') || statusLower.includes('approved')) {
      return 'bg-success-light text-success';
    } else if (statusLower.includes('pending') || statusLower.includes('scheduled')) {
      return 'bg-warning-light text-warning';
    } else if (statusLower.includes('cancel') || statusLower.includes('rejected')) {
      return 'bg-danger-light text-danger';
    } else if (statusLower.includes('complete')) {
      return 'bg-primary-light text-primary';
    } else if (statusLower.includes('reschedule')) {
      return 'bg-secondary-light text-secondary';
    }
    return 'bg-elevated text-muted';
  };

  const isEmpty = computed(() => !loading.value && appointments.value.length === 0);

  const handleBookAppointment = () => {
    router.push({ path: '/appointments/add', query: { patientId: String(props.patientId) } });
  };

  const upcomingAppointments = computed(() => {
    const now = new Date();
    return appointments.value.filter((apt) => new Date(apt.appointmentDateTime) >= now);
  });

  const pastAppointments = computed(() => {
    const now = new Date();
    return appointments.value.filter((apt) => new Date(apt.appointmentDateTime) < now);
  });

  onMounted(() => {
    loadAppointments();
  });
</script>

<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="animate-pulse bg-surface rounded-xl p-6 border border-stroke dark:border-strokedark">
        <div class="flex items-center justify-between mb-4">
          <div class="h-4 bg-elevated rounded w-1/4"></div>
          <div class="h-8 bg-elevated rounded w-20"></div>
        </div>
        <div class="space-y-2">
          <div class="h-3 bg-elevated rounded w-3/4"></div>
          <div class="h-3 bg-elevated rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="isEmpty" class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-12 text-center">
      <CalendarIcon class="w-20 h-20 mx-auto text-bodydark dark:text-bodydark1 mb-4" />
      <h3 class="text-2xl font-semibold text-emphasis mb-2">No Appointments</h3>
      <p class="text-bodydark dark:text-bodydark1 mb-6 max-w-md mx-auto">This patient doesn't have any scheduled appointments yet. Book an appointment to get started.</p>
      <BaseButton variant="primary" size="lg" @click="handleBookAppointment">
        <PlusSimpleIcon class="w-5 h-5 mr-2" />
        Book Appointment
      </BaseButton>
    </div>

    <!-- Appointments List -->
    <div v-else class="space-y-6">
      <!-- Upcoming Appointments -->
      <div v-if="upcomingAppointments.length > 0">
        <h3 class="text-lg font-semibold text-emphasis mb-4 flex items-center gap-2">
          <ClockIcon class="w-5 h-5 text-primary" />
          Upcoming Appointments ({{ upcomingAppointments.length }})
        </h3>
        <div class="space-y-4">
          <div
            v-for="appointment in upcomingAppointments"
            :key="appointment.id"
            class="bg-surface rounded-xl border border-stroke dark:border-strokedark hover:shadow-lg transition-shadow cursor-pointer"
            @click="viewDetails(appointment)"
          >
            <div class="p-6">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-lg font-semibold text-emphasis">
                      {{ formatDate(appointment.appointmentDateTime) }}
                    </h3>
                    <span :class="['px-3 py-1 text-xs font-semibold rounded-full', getStatusColor(appointment.appointmentStatus?.statusDescription)]">
                      {{ appointment.appointmentStatus?.statusDescription || 'N/A' }}
                    </span>
                  </div>
                  <div class="space-y-1">
                    <p class="text-sm text-bodydark dark:text-bodydark1 flex items-center gap-2">
                      <UserIcon class="w-4 h-4" />
                      Doctor: {{ appointment.employee?.name || 'N/A' }}
                    </p>
                    <p class="text-sm text-bodydark dark:text-bodydark1 flex items-center gap-2">
                      <ClockIcon class="w-4 h-4" />
                      Time: {{ formatTime(appointment.startTime) }} - {{ formatTime(appointment.endTime) }}
                    </p>
                    <p v-if="appointment.appointmentTypes" class="text-sm text-bodydark dark:text-bodydark1 flex items-center gap-2">
                      <ClipboardDocIcon class="w-4 h-4" />
                      Type: {{ appointment.appointmentTypes.typeDescription }}
                    </p>
                  </div>
                </div>
                <BaseButton variant="ghost" size="sm">
                  <ChevronRightIcon class="w-5 h-5" />
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Past Appointments -->
      <div v-if="pastAppointments.length > 0">
        <h3 class="text-lg font-semibold text-emphasis mb-4 flex items-center gap-2">
          <ClockIcon class="w-5 h-5 text-bodydark" />
          Past Appointments ({{ pastAppointments.length }})
        </h3>
        <div class="space-y-4">
          <div
            v-for="appointment in pastAppointments"
            :key="appointment.id"
            class="bg-surface rounded-xl border border-stroke dark:border-strokedark hover:shadow-lg transition-shadow cursor-pointer opacity-75"
            @click="viewDetails(appointment)"
          >
            <div class="p-6">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-lg font-semibold text-emphasis">
                      {{ formatDate(appointment.appointmentDateTime) }}
                    </h3>
                    <span :class="['px-3 py-1 text-xs font-semibold rounded-full', getStatusColor(appointment.appointmentStatus?.statusDescription)]">
                      {{ appointment.appointmentStatus?.statusDescription || 'N/A' }}
                    </span>
                  </div>
                  <div class="space-y-1">
                    <p class="text-sm text-bodydark dark:text-bodydark1">Doctor: {{ appointment.employee?.name || 'N/A' }}</p>
                    <p class="text-sm text-bodydark dark:text-bodydark1">Time: {{ formatTime(appointment.startTime) }} - {{ formatTime(appointment.endTime) }}</p>
                  </div>
                </div>
                <BaseButton variant="ghost" size="sm">
                  <ChevronRightIcon class="w-5 h-5" />
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <Transition name="modal">
      <div v-if="showDetails && selectedAppointment" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="closeDetails">
        <!-- Overlay Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        <!-- Modal Content -->
        <div class="relative bg-surface rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <!-- Modal Header -->
          <div class="sticky top-0 bg-surface border-b border-stroke dark:border-strokedark p-6 flex items-center justify-between">
            <h2 class="text-2xl font-bold text-emphasis">Appointment Details</h2>
            <BaseButton variant="ghost" @click="closeDetails" class="w-10 h-10 !p-0 rounded-full hover:bg-elevated flex items-center justify-center">
              <DocumentIcon class="w-6 h-6" />
            </BaseButton>
          </div>

          <!-- Modal Content -->
          <div class="p-6 space-y-6">
            <!-- Appointment Info -->
            <div class="bg-elevated rounded-xl p-4">
              <h3 class="text-lg font-semibold text-emphasis mb-4">Appointment Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs text-bodydark dark:text-bodydark1">Date & Time</label>
                  <p class="text-sm font-medium text-emphasis">{{ formatDate(selectedAppointment.appointmentDateTime) }}</p>
                </div>
                <div>
                  <label class="text-xs text-bodydark dark:text-bodydark1">Status</label>
                  <p class="text-sm font-medium text-emphasis">{{ selectedAppointment.appointmentStatus?.statusDescription || 'N/A' }}</p>
                </div>
                <div>
                  <label class="text-xs text-bodydark dark:text-bodydark1">Start Time</label>
                  <p class="text-sm font-medium text-emphasis">{{ formatTime(selectedAppointment.startTime) }}</p>
                </div>
                <div>
                  <label class="text-xs text-bodydark dark:text-bodydark1">End Time</label>
                  <p class="text-sm font-medium text-emphasis">{{ formatTime(selectedAppointment.endTime) }}</p>
                </div>
                <div v-if="selectedAppointment.appointmentTypes" class="col-span-2">
                  <label class="text-xs text-bodydark dark:text-bodydark1">Appointment Type</label>
                  <p class="text-sm font-medium text-emphasis">{{ selectedAppointment.appointmentTypes.typeDescription }}</p>
                </div>
              </div>
            </div>

            <!-- Doctor Info -->
            <div class="bg-elevated rounded-xl p-4">
              <h3 class="text-lg font-semibold text-emphasis mb-4">Doctor Information</h3>
              <div class="space-y-2">
                <div>
                  <label class="text-xs text-bodydark dark:text-bodydark1">Name</label>
                  <p class="text-sm font-medium text-emphasis">{{ selectedAppointment.employee?.name || 'N/A' }}</p>
                </div>
                <div v-if="selectedAppointment.employee?.designation">
                  <label class="text-xs text-bodydark dark:text-bodydark1">Designation</label>
                  <p class="text-sm font-medium text-emphasis">{{ selectedAppointment.employee.designation }}</p>
                </div>
                <div v-if="selectedAppointment.employee?.department">
                  <label class="text-xs text-bodydark dark:text-bodydark1">Department</label>
                  <p class="text-sm font-medium text-emphasis">{{ selectedAppointment.employee.department.name }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="sticky bottom-0 bg-surface border-t border-stroke dark:border-strokedark p-6 flex justify-end gap-3">
            <BaseButton variant="outline" @click="closeDetails">Close</BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </div>
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
