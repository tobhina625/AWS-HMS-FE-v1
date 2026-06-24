<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
    <div class="mb-6">
      <h2 class="text-title-md2 font-bold text-emphasis">My Appointments</h2>
      <p class="text-sm text-muted mt-1">View all appointments assigned to you</p>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-10">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="bg-danger-light border border-danger p-4 rounded-lg">
      <p class="text-danger">{{ error }}</p>
    </div>

    <div v-else class="rounded-sm border border-stroke bg-surface shadow-default dark:border-strokedark">
      <div class="px-4 py-6 md:px-6 xl:px-7.5">
        <h4 class="text-xl font-bold text-emphasis">Appointments ({{ appointments.length }})</h4>
      </div>

      <div v-if="appointments.length === 0" class="p-7 text-center text-muted">No appointments found</div>

      <div v-else class="overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-elevated text-left">
              <th class="px-4 py-4 font-medium text-emphasis">Date & Time</th>
              <th class="px-4 py-4 font-medium text-emphasis">Patient</th>
              <th class="px-4 py-4 font-medium text-emphasis">Duration</th>
              <th class="px-4 py-4 font-medium text-emphasis">Status</th>
              <th class="px-4 py-4 font-medium text-emphasis">Type</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="appointment in appointments" :key="appointment.id" class="border-b border-stroke dark:border-strokedark">
              <td class="px-4 py-4">
                <p class="text-sm font-medium text-emphasis">
                  {{ formatDate(appointment.appointmentDateTime) }}
                </p>
                <p class="text-xs text-muted">{{ formatTime(appointment.startTime) }} - {{ formatTime(appointment.endTime) }}</p>
              </td>
              <td class="px-4 py-4">
                <p class="text-sm text-emphasis">
                  {{ appointment.patient?.name || appointment.patient?.firstName + ' ' + appointment.patient?.lastName || 'N/A' }}
                </p>
              </td>
              <td class="px-4 py-4">
                <p class="text-sm text-emphasis">
                  {{ calculateDuration(appointment.startTime, appointment.endTime) }}
                </p>
              </td>
              <td class="px-4 py-4">
                <span class="inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium" :class="getStatusClass(appointment.appointmentStatus)">
                  {{ appointment.appointmentStatus?.name || 'Pending' }}
                </span>
              </td>
              <td class="px-4 py-4">
                <p class="text-sm text-emphasis">
                  {{ appointment.appointmentTypes?.name || 'N/A' }}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useUserProfile } from '@/composables/useUserProfile';

  const { loading, error, fetchMyAppointments } = useUserProfile();
  const appointments = ref<any[]>([]);

  const loadAppointments = async () => {
    appointments.value = await fetchMyAppointments();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = (end.getTime() - start.getTime()) / 60000; // minutes
    return `${diff} min`;
  };

  const getStatusClass = (status: any) => {
    const statusName = status?.name?.toLowerCase() || '';
    if (statusName.includes('confirmed')) return 'bg-success text-success';
    if (statusName.includes('pending')) return 'bg-warning text-warning';
    if (statusName.includes('cancelled')) return 'bg-danger text-danger';
    return 'bg-primary text-primary';
  };

  onMounted(() => {
    loadAppointments();
  });
</script>
