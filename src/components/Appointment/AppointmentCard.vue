<script setup lang="ts">
  import type { IAppointment } from '@/services/Appointment/appointment.interface';
  import StatusBadge from '@/components/UI/StatusBadge.vue';
  import ActionIconButton from '@/components/UI/ActionIconButton.vue';
  import CalendarIcon from '@/assets/images/SVGs/CalendarIcon.svg';
  import ClockIcon from '@/assets/images/SVGs/ClockIcon.svg';
  import EditPencilIcon from '@/assets/images/SVGs/EditPencilIcon.svg';
  import UserIcon from '@/assets/images/SVGs/UserIcon.svg';
  import DeleteIcon from '@/assets/images/SVGs/Delete.svg';
  import ViewIcon from '@/assets/images/SVGs/View.svg';

  defineProps<{
    appointment: IAppointment;
    showDelete?: boolean;
    /** Show view-details control (e.g. opens full appointment detail modal). */
    showDetail?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'edit', appointment: IAppointment): void;
    (e: 'delete', appointment: IAppointment): void;
    (e: 'detail', appointment: IAppointment): void;
  }>();

  const priorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'emergency':
        return 'bg-danger/10 text-danger dark:bg-danger/20 dark:text-danger-light';
      case 'urgent':
        return 'bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning-light';
      default:
        return 'bg-gray/50 text-bodydark dark:bg-strokedark dark:text-bodydark1';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    return new Date(timeStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const patientName = (p: any) => (p ? `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'N/A' : 'N/A');
</script>

<template>
  <div class="bg-surface rounded-2xl border border-stroke dark:border-strokedark shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
    <div class="p-5">
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-bold text-emphasis truncate">{{ patientName(appointment.patient) }}</h3>
          <div class="flex flex-wrap gap-1.5 mt-1">
            <StatusBadge :status="appointment.appointmentStatus?.statusDescription || 'Pending'" size="sm" />
            <span v-if="appointment.priority && appointment.priority !== 'Normal'" :class="['inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full', priorityColor(appointment.priority)]">
              {{ appointment.priority }}
            </span>
          </div>
        </div>
        <div class="flex gap-2">
          <ActionIconButton v-if="showDetail" variant="ghost" title="Appointment details" @click="emit('detail', appointment)">
            <ViewIcon class="w-5 h-5" />
          </ActionIconButton>
          <ActionIconButton variant="primary" title="Edit Appointment" @click="emit('edit', appointment)">
            <EditPencilIcon class="w-5 h-5" />
          </ActionIconButton>
          <ActionIconButton v-if="showDelete" variant="danger" title="Delete Appointment" @click="emit('delete', appointment)">
            <DeleteIcon class="w-5 h-5" />
          </ActionIconButton>
        </div>
      </div>

      <div class="space-y-2 mb-4">
        <p class="text-sm text-bodydark dark:text-bodydark1">
          <span class="inline-flex items-center gap-1">
            <CalendarIcon class="w-4 h-4" />
            {{ formatDate(appointment.appointmentDateTime) }}
          </span>
        </p>
        <p class="text-sm text-bodydark dark:text-bodydark1">
          <span class="inline-flex items-center gap-1">
            <ClockIcon class="w-4 h-4" />
            {{ formatTime(appointment.startTime) }} - {{ formatTime(appointment.endTime) }}
          </span>
        </p>
        <p v-if="appointment.employee" class="text-sm text-bodydark dark:text-bodydark1">
          <span class="inline-flex items-center gap-1">
            <UserIcon class="w-4 h-4" />
            Dr. {{ appointment.employee.name }}
          </span>
        </p>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-3">
        <div class="bg-elevated rounded-lg p-3 text-center">
          <p class="text-xs text-bodydark dark:text-bodydark1">Type</p>
          <p class="text-sm font-semibold text-emphasis">{{ appointment.appointmentTypes?.typeDescription || 'N/A' }}</p>
        </div>
        <div v-if="appointment.location" class="bg-elevated rounded-lg p-3 text-center">
          <p class="text-xs text-bodydark dark:text-bodydark1">Location</p>
          <p class="text-sm font-semibold text-emphasis truncate">{{ appointment.location }}</p>
        </div>
      </div>

      <p v-if="appointment.reason" class="text-sm text-bodydark dark:text-bodydark1 line-clamp-2">{{ appointment.reason }}</p>
    </div>
  </div>
</template>
