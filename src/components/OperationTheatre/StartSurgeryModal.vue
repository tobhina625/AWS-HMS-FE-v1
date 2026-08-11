<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
  import BaseModal from '@/components/Base/BaseModal.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import OperationTheatreService from '@/services/OperationTheatre/OperationTheatre.services';
  import EmployeesServices from '@/services/Employee/Employee.services';
  import useAlert from '@/plugins/alert/useAlert';
  import { useConfirm } from '@/composables/useConfirm';
  import type { ITheatreSchedule } from '@/services/OperationTheatre/OperationTheatre.dto';

  import ClockIcon from '@/assets/images/SVGs/ClockIcon.svg';
  import UserIcon from '@/assets/images/SVGs/Building.svg';
  import CheckCircleIcon from '@/assets/images/SVGs/CheckCircleIcon.svg';

  interface Props {
    show: boolean;
    schedule: ITheatreSchedule | null;
    busySurgeonIds?: number[];
  }

  const props = withDefaults(defineProps<Props>(), {
    busySurgeonIds: () => [],
  });

  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'started'): void;
    (e: 'completed', timelapse: number): void;
  }>();

  const { showAlert } = useAlert();
  const { confirm } = useConfirm();
  const theatreService = new OperationTheatreService();
  const employeeService = new EmployeesServices();

  const selectedSurgeonId = ref<number | null>(null);
  const surgeons = ref<any[]>([]);
  const surgeonsLoading = ref(false);
  const actionLoading = ref(false);
  const elapsedSeconds = ref(0);
  let timerInterval: ReturnType<typeof setInterval> | null = null;

  // Determine if surgery is already in progress (for modal state)
  const isRunning = computed(() => {
    if (!props.schedule) return false;
    const status = (props.schedule.status || '').toLowerCase();
    return status === 'inprogress' || status === 'ongoing';
  });

  // Filter out busy surgeons (already in another Ongoing surgery)
  const availableSurgeons = computed(() => {
    return surgeons.value.filter((s) => !props.busySurgeonIds.includes(s.id));
  });

  const canStart = computed(() => {
    return selectedSurgeonId.value !== null && selectedSurgeonId.value > 0 && !actionLoading.value;
  });

  // Format elapsed time as hh:mm:ss or mm:ss
  const formattedTimer = computed(() => {
    const total = elapsedSeconds.value;
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  });

  // Load surgeons (specializationType = 2 = Surgeon)
  const loadSurgeons = async () => {
    surgeonsLoading.value = true;
    try {
      const response = await employeeService.getEmployeesBySpecializationType(2, 'page=0&size=100');
      const unwrapList = (res: any) => res?.content || res?.Content || res?.data || [];
      surgeons.value = unwrapList(response);
    } catch (error) {
      console.error('Error loading surgeons:', error);
      surgeons.value = [];
    } finally {
      surgeonsLoading.value = false;
    }
  };

  // Compute elapsed time from server-side actualStartTime
  const computeElapsed = () => {
    if (!props.schedule?.actualStartTime) {
      elapsedSeconds.value = 0;
      return;
    }
    const startTime = new Date(props.schedule.actualStartTime).getTime();
    const now = Date.now();
    const diff = Math.max(0, Math.floor((now - startTime) / 1000));
    elapsedSeconds.value = diff;
  };

  // Start the live timer
  const startTimer = () => {
    stopTimer();
    computeElapsed();
    timerInterval = setInterval(() => {
      computeElapsed();
    }, 1000);
  };

  // Stop the live timer
  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  // Handle Confirm/Start button click
  const handleStart = async () => {
    if (!props.schedule || !selectedSurgeonId.value) return;

    actionLoading.value = true;
    try {
      const response = await theatreService.startSurgery(props.schedule.id, selectedSurgeonId.value);
      if (response?.isSuccess ?? (response as any)?.IsSuccess) {
        showAlert('success', 'Surgery started successfully. Theater status updated to In Use.', 'Success');
        emit('started');
        // The parent will reload schedules and update the schedule prop
        // Timer will start when the updated schedule (with actualStartTime) is passed back
      } else {
        showAlert('error', response?.error || 'Failed to start surgery.', 'Error');
      }
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Failed to start surgery.';
      showAlert('error', message, 'Error');
    } finally {
      actionLoading.value = false;
    }
  };

  // Handle Complete Surgery button click
  const handleComplete = async () => {
    // Capture schedule ID immediately before any async operations
    const scheduleId = props.schedule?.id;
    if (!scheduleId) {
      console.error('Cannot complete surgery: schedule or schedule.id is missing', props.schedule);
      showAlert('error', 'Cannot complete surgery: schedule information is missing.', 'Error');
      return;
    }
    const confirmed = await confirm({
      title: 'Complete Surgery',
      message: 'Are you sure you want to mark this surgery as completed? This will stop the timer and reset the theater status.',
      confirmText: 'Complete',
      cancelText: 'Cancel',
      variant: 'success',
    });
    if (!confirmed) return;

    actionLoading.value = true;
    try {
      console.log('Completing surgery with schedule ID:', scheduleId);
      const response = await theatreService.completeSurgery(scheduleId);
      console.log('Complete surgery response:', response);

      // Check for success - handle both camelCase and PascalCase response formats
      const isSuccess = response?.isSuccess ?? (response as any)?.IsSuccess ?? response?.success ?? (response as any)?.Success;

      if (isSuccess) {
        computeElapsed();
        const timelapse = elapsedSeconds.value;
        stopTimer();
        showAlert('success', 'Surgery completed successfully. Theater status reset to Available.', 'Success');
        emit('completed', timelapse);
      } else {
        const errorMsg = response?.error || response?.message || response?.Error || response?.Message || 'Failed to complete surgery.';
        showAlert('error', errorMsg, 'Error');
      }
    } catch (error: any) {
      console.error('Complete surgery error:', error);
      console.error('Error response data:', error?.response?.data);
      const message = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Failed to complete surgery.';
      showAlert('error', message, 'Error');
    } finally {
      actionLoading.value = false;
    }
  };

  // Watch for schedule changes to start/stop timer
  watch(
    () => props.schedule,
    (newSchedule) => {
      if (newSchedule && isRunning.value && newSchedule.actualStartTime) {
        startTimer();
      } else {
        stopTimer();
        elapsedSeconds.value = 0;
      }
    },
    { immediate: true }
  );

  // Watch for modal show/hide
  watch(
    () => props.show,
    (show) => {
      if (show) {
        if (!isRunning.value) {
          loadSurgeons();
        } else if (props.schedule?.actualStartTime) {
          startTimer();
        }
      } else {
        stopTimer();
        selectedSurgeonId.value = null;
      }
    }
  );

  onMounted(() => {
    if (props.show && isRunning.value && props.schedule?.actualStartTime) {
      startTimer();
    }
  });

  onUnmounted(() => {
    stopTimer();
  });
</script>

<template>
  <BaseModal :show="show" :title="isRunning ? 'Operation Running' : 'Start Surgery'" size="md" @close="emit('close')">
    <!-- Pre-Start State: Surgeon Selection -->
    <div v-if="!isRunning" class="space-y-6">
      <!-- Surgery Info -->
      <div v-if="schedule" class="bg-elevated rounded-xl p-4 space-y-2">
        <div class="flex items-center gap-2">
          <CheckCircleIcon class="w-5 h-5 text-primary" />
          <p class="font-semibold text-emphasis">{{ schedule.surgeryName }}</p>
        </div>
        <p v-if="schedule.patientName" class="text-sm text-bodydark dark:text-bodydark1">Patient: {{ schedule.patientName }}</p>
        <p v-if="schedule.surgeonName" class="text-sm text-bodydark dark:text-bodydark1">Assigned Surgeon: {{ schedule.surgeonName }}</p>
        <div class="flex items-center gap-2 text-xs text-muted">
          <ClockIcon class="w-4 h-4" />
          <span>{{ new Date(schedule.scheduledStartTime).toLocaleString() }} - {{ new Date(schedule.scheduledEndTime).toLocaleString() }}</span>
        </div>
      </div>

      <!-- Surgeon Dropdown -->
      <BaseSelect
        v-model="selectedSurgeonId"
        label="Attending Doctor"
        :options="availableSurgeons"
        :loading="surgeonsLoading"
        placeholder="Select a surgeon..."
        display-key="name"
        value-key="id"
        :field-required="true"
        :empty-message="availableSurgeons.length === 0 ? 'No available surgeons found' : 'No results'"
      />
      <p v-if="availableSurgeons.length === 0 && !surgeonsLoading" class="text-xs text-warning">All surgeons are currently busy in other ongoing surgeries.</p>
    </div>

    <!-- Running State: Timer + Complete -->
    <div v-else class="space-y-6">
      <!-- Status Label -->
      <div class="flex items-center justify-center">
        <span class="px-4 py-2 rounded-full text-sm font-semibold bg-warning/10 text-warning flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
          Operation Running
        </span>
      </div>

      <!-- Surgery Info -->
      <div v-if="schedule" class="bg-elevated rounded-xl p-4 space-y-2">
        <div class="flex items-center gap-2">
          <CheckCircleIcon class="w-5 h-5 text-primary" />
          <p class="font-semibold text-emphasis">{{ schedule.surgeryName }}</p>
        </div>
        <p v-if="schedule.patientName" class="text-sm text-bodydark dark:text-bodydark1">Patient: {{ schedule.patientName }}</p>
        <p v-if="schedule.surgeonName" class="text-sm text-bodydark dark:text-bodydark1 flex items-center gap-1">
          <UserIcon class="w-4 h-4" />
          Surgeon: {{ schedule.surgeonName }}
        </p>
      </div>

      <!-- Live Timer -->
      <div class="flex flex-col items-center justify-center py-6 bg-elevated rounded-xl">
        <div class="flex items-center gap-2 mb-2">
          <ClockIcon class="w-5 h-5 text-primary" />
          <span class="text-sm text-bodydark dark:text-bodydark1">Elapsed Time</span>
        </div>
        <p class="text-4xl font-bold text-primary tabular-nums tracking-wider">{{ formattedTimer }}</p>
      </div>
    </div>

    <!-- Footer Actions -->
    <template #footer>
      <BaseButton variant="outline" size="md" @click="emit('close')" :disabled="actionLoading">
        {{ isRunning ? 'Close' : 'Cancel' }}
      </BaseButton>
      <BaseButton v-if="!isRunning" variant="primary" size="md" :disabled="!canStart" @click="handleStart">
        {{ actionLoading ? 'Starting...' : 'Confirm & Start' }}
      </BaseButton>
      <BaseButton v-else variant="primary" size="md" :disabled="actionLoading" @click="handleComplete" class="!bg-success hover:!bg-success/90">
        {{ actionLoading ? 'Completing...' : 'Complete Surgery' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
