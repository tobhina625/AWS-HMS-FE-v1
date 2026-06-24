<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useDebounceFn } from '@vueuse/core';
  import { useRoute, useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import { useApiSearchDropdown } from '@/composables/useApiSearchDropdown';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import AppointmentCalendar from '@/components/Appointment/AppointmentCalendar.vue';
  import AppointmentServices from '@/services/Appointment/appointment.services';
  import PatientServices from '@/services/Patient/patient.services';
  import EmployeesServices from '@/services/Employee/Employee.services';
  import { STATUS_OPTIONS } from '@/constants/statusOptions';
  import type { IAppointmentSlot } from '@/services/Appointment/appointment.interface';
  import { startOfWeekMondayYmd, addDaysYmd, toLocalYmd, toLocalOffsetIsoString } from '@/utils/calendarDate';

  const route = useRoute();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { errors, rules, validateForm } = useFormValidation();
  const appointmentService = new AppointmentServices();
  const patientService = new PatientServices();
  const employeeService = new EmployeesServices();

  const isLoading = ref(true);
  const isSubmitting = ref(false);
  const appointmentId = ref(0);
  /** Start instant (ms) when the form was loaded; allows saving past appointments without changing time. */
  const originalStartTimeMs = ref<number | null>(null);
  /** Doctor at load time — used to mark the current slot on the calendar when still the same doctor. */
  const originalEmployeeId = ref<number | null>(null);

  const statuses = STATUS_OPTIONS.APPOINTMENT;
  const types = STATUS_OPTIONS.APPOINTMENT_TYPE;

  const formData = ref({
    appointmentDate: '',
    startTime: '',
    patientId: '',
    employeeId: '',
    statusId: '1',
    typeId: '1',
    priority: 'Normal',
    location: '',
    reason: '',
  });

  const calendarView = ref<'day' | 'week' | 'month'>('week');
  const focusDate = ref(toLocalYmd(new Date()));
  const slots = ref<IAppointmentSlot[]>([]);
  const loadingSlots = ref(false);

  const minAppointmentDateYmd = computed(() => toLocalYmd(new Date()));

  const startOfWeekMonday = startOfWeekMondayYmd;
  const addDaysStr = addDaysYmd;

  /** When editing the same doctor + original start, that slot stays selectable though the API marks it booked. */
  const pinnedSlotStartMs = computed(() => {
    if (originalEmployeeId.value === null || originalStartTimeMs.value === null) return null;
    if (Number(formData.value.employeeId) !== originalEmployeeId.value) return null;
    return originalStartTimeMs.value;
  });

  function clampFocusToMin() {
    const min = minAppointmentDateYmd.value;
    if (focusDate.value < min) focusDate.value = min;
  }

  const mapPatientOptions = (raw: any[]) => raw.map((p: any) => ({ id: p.id, name: `${p.firstName || ''} ${p.lastName || ''}`.trim() }));

  const patientDd = useApiSearchDropdown({
    fetchDefaultPage: async () => {
      const response = await patientService.getPatients('page=0&size=10');
      return mapPatientOptions(response?.content || response?.data?.content || []);
    },
    fetchSearchPage: async (term) => {
      const response = await patientService.getPatients(`page=0&size=20&searchTerm=${encodeURIComponent(term)}`);
      return mapPatientOptions(response?.content || response?.data?.content || []);
    },
    getSelectedId: () => formData.value.patientId,
  });

  const employeeDd = useApiSearchDropdown({
    fetchDefaultPage: async () => {
      const response = await employeeService.getEmployeesByRole(6, 'page=0&size=10');
      return (response?.content || response?.data?.content || []).map((e: any) => ({ id: e.id, name: e.name }));
    },
    fetchSearchPage: async (term) => {
      const response = await employeeService.getEmployeesByRole(6, `page=0&size=20&searchTerm=${encodeURIComponent(term)}`);
      return (response?.content || response?.data?.content || []).map((e: any) => ({ id: e.id, name: e.name }));
    },
    getSelectedId: () => formData.value.employeeId,
  });

  const patientEmptyMessage = patientDd.emptyMessage();
  const employeeEmptyMessage = employeeDd.emptyMessage();

  const loadSelectedData = async (patientId: string, employeeId: string) => {
    try {
      const [patientResponse, employeeResponse] = await Promise.all([patientService.getPatientById(patientId), employeeService.getEmployeesById(employeeId)]);

      if (patientResponse?.data) {
        const p = patientResponse.data;
        patientDd.items.value = [{ id: p.id, name: `${p.firstName || ''} ${p.lastName || ''}`.trim() }];
      }

      if (employeeResponse?.data) {
        const e = employeeResponse.data;
        employeeDd.items.value = [{ id: e.id, name: e.name }];
      }
    } catch (error) {
      console.error('Error loading selected data:', error);
    }
  };

  const slotRangeForCalendar = () => {
    if (calendarView.value === 'day') {
      return { start: focusDate.value, end: focusDate.value };
    }
    if (calendarView.value === 'week') {
      const mon = startOfWeekMonday(focusDate.value);
      return { start: mon, end: addDaysStr(mon, 6) };
    }
    const parts = focusDate.value.split('-').map(Number);
    const y = parts[0];
    const m = parts[1];
    if (!y || !m) return { start: focusDate.value, end: focusDate.value };
    const start = toLocalYmd(new Date(y, m - 1, 1));
    const end = toLocalYmd(new Date(y, m, 0));
    return { start, end };
  };

  const fetchSlotsForCalendar = async () => {
    if (!formData.value.employeeId) {
      slots.value = [];
      return;
    }
    loadingSlots.value = true;
    try {
      const { start, end } = slotRangeForCalendar();
      const res = await appointmentService.getAvailableSlots(Number(formData.value.employeeId), start, end);
      const raw = (res as any)?.data ?? (res as any)?.Data ?? [];
      slots.value = Array.isArray(raw)
        ? raw.map((s: Record<string, unknown>) => ({
            date: s.date as string,
            startTime: s.startTime as string,
            endTime: s.endTime as string,
            isBooked: s.isBooked === true || s.IsBooked === true,
          }))
        : [];
    } catch {
      slots.value = [];
      showAlert('error', 'Could not load slots for this doctor.', 'Error');
    } finally {
      loadingSlots.value = false;
    }
  };

  const debouncedFetchSlots = useDebounceFn(fetchSlotsForCalendar, 200);

  watch([() => formData.value.employeeId, calendarView, focusDate], () => {
    if (formData.value.employeeId) {
      clampFocusToMin();
    }
    if (!formData.value.employeeId) {
      slots.value = [];
      loadingSlots.value = false;
      return;
    }
    debouncedFetchSlots();
  });

  watch(minAppointmentDateYmd, () => {
    clampFocusToMin();
  });

  const onSlotSelect = (slot: IAppointmentSlot) => {
    const d = new Date(slot.startTime);
    if (Number.isNaN(d.getTime())) return;
    formData.value.appointmentDate = toLocalYmd(d);
    formData.value.startTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const loadDetails = async () => {
    isLoading.value = true;
    try {
      appointmentId.value = Number(route.params.id);
      const response = await appointmentService.getAppointmentById(appointmentId.value);
      if (response?.data) {
        const d = response.data;
        const apptDate = d.appointmentDateTime ? new Date(d.appointmentDateTime) : new Date();
        formData.value = {
          appointmentDate: toLocalYmd(apptDate),
          startTime: d.startTime ? new Date(d.startTime).toTimeString().slice(0, 5) : '',
          patientId: d.patient?.id ? String(d.patient.id) : '',
          employeeId: d.employee?.id ? String(d.employee.id) : '',
          statusId: d.appointmentStatus?.id ? String(d.appointmentStatus.id) : '1',
          typeId: d.appointmentTypes?.id ? String(d.appointmentTypes.id) : '1',
          priority: d.priority || 'Normal',
          location: d.location || '',
          reason: d.reason || '',
        };
        originalStartTimeMs.value = d.startTime ? new Date(d.startTime).getTime() : null;
        originalEmployeeId.value = d.employee?.id ?? null;
        focusDate.value = formData.value.appointmentDate || toLocalYmd(new Date());
        clampFocusToMin();
      }
    } finally {
      isLoading.value = false;
    }
  };

  const submitUpdate = async () => {
    const isValid = validateForm(formData.value, {
      patientId: [rules.required('Patient is required')],
      employeeId: [rules.required('Doctor is required')],
      appointmentDate: [rules.required('Date is required')],
      startTime: [rules.required('Start time is required')],
    });
    if (!isValid) return;

    const dateBase = formData.value.appointmentDate;
    const instant = new Date(`${dateBase}T${formData.value.startTime}`);
    const newMs = instant.getTime();
    if (Number.isNaN(newMs)) {
      showAlert('error', 'Invalid date or time.', 'Validation');
      return;
    }
    const now = Date.now();
    const unchanged = originalStartTimeMs.value !== null && newMs === originalStartTimeMs.value;
    if (newMs < now && !unchanged) {
      showAlert('error', 'Appointment start time must be in the future.', 'Validation');
      return;
    }

    const appointmentDateTime = toLocalOffsetIsoString(instant);
    const startTime = appointmentDateTime;

    isSubmitting.value = true;
    try {
      const response = await appointmentService.updateAppointment({
        id: appointmentId.value,
        appointmentDateTime,
        startTime,
        priority: formData.value.priority,
        location: formData.value.location,
        reason: formData.value.reason,
        patient: { id: Number(formData.value.patientId) },
        employee: { id: Number(formData.value.employeeId) },
        appointmentStatus: { id: Number(formData.value.statusId) },
        appointmentTypes: { id: Number(formData.value.typeId) },
      });
      if (response.isSuccess) {
        showAlert('success', 'Appointment updated.', 'Success');
        router.push('/appointments');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to update appointment';
      showAlert('error', msg, 'Error');
    } finally {
      isSubmitting.value = false;
    }
  };

  onMounted(async () => {
    await loadDetails();
    if (formData.value.patientId && formData.value.employeeId) {
      await loadSelectedData(formData.value.patientId, formData.value.employeeId);
    }
    await Promise.all([patientDd.loadDefault(), employeeDd.loadDefault()]);
  });
</script>

<template>
  <DefaultLayout>
    <div v-if="isLoading" class="max-w-5xl mx-auto space-y-6">
      <div class="h-8 w-1/3 animate-pulse rounded-2xl bg-meta-9/30"></div>
      <div class="rounded-lg border border-stroke bg-surface p-8 dark:border-strokedark">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div v-for="i in 6" :key="i" class="h-14 animate-pulse rounded-xl bg-meta-9/20"></div>
        </div>
      </div>
    </div>

    <template v-else>
      <div class="mb-6 flex flex-wrap items-start gap-2 rounded-lg border border-stroke bg-surface p-4 dark:border-strokedark">
        <p class="text-sm text-muted">
          Select a doctor to load their availability. Pick a time slot in the calendar — date and time update automatically. You can fine-tune date and time below if needed.
        </p>
      </div>

      <FormViewTemplate
        title="Update Appointment"
        breadcrumb-title="Appointments"
        breadcrumb-slug="Update"
        :is-submitting="isSubmitting"
        submit-label="Save Changes"
        @submit="submitUpdate"
        @cancel="router.back()"
      >
        <div class="md:col-span-2 grid gap-4 md:grid-cols-2">
          <BaseSelect
            label="Patient"
            v-model="formData.patientId"
            :options="patientDd.items"
            placeholder="Pick a patient or type to search…"
            :empty-message="patientEmptyMessage"
            :error="!!errors.patientId"
            :error-message="errors.patientId"
            :loading="patientDd.loading"
            field-required
            @search="patientDd.onSearch"
          />

          <BaseSelect
            label="Doctor"
            v-model="formData.employeeId"
            :options="employeeDd.items"
            placeholder="Pick a doctor or type to search…"
            :empty-message="employeeEmptyMessage"
            :error="!!errors.employeeId"
            :error-message="errors.employeeId"
            :loading="employeeDd.loading"
            field-required
            @search="employeeDd.onSearch"
          />
        </div>

        <div class="md:col-span-2 grid gap-4 md:grid-cols-2">
          <BaseSelect
            label="Priority"
            v-model="formData.priority"
            :options="[
              { id: 'Normal', name: 'Normal' },
              { id: 'Urgent', name: 'Urgent' },
              { id: 'Emergency', name: 'Emergency' },
            ]"
            placeholder="Select priority…"
            field-required
          />

          <BaseSelect label="Status" v-model="formData.statusId" :options="statuses" placeholder="Select status…" field-required />

          <BaseSelect label="Type" v-model="formData.typeId" :options="types" placeholder="Select type…" field-required />

          <BaseInput label="Location" v-model="formData.location" placeholder="e.g. Room 204, Building A" />
        </div>

        <BaseInput label="Reason for visit" v-model="formData.reason" placeholder="e.g. Follow-up on blood work results" class="md:col-span-2" />

        <div class="md:col-span-2">
          <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-muted">Doctor availability</h3>
          <div v-if="loadingSlots" class="rounded-md border border-stroke bg-surface p-4 text-sm text-muted dark:border-strokedark">Loading calendar…</div>
          <div v-else-if="formData.employeeId">
            <AppointmentCalendar
              :slots="slots"
              v-model:view-mode="calendarView"
              v-model:focus-date="focusDate"
              :min-focus-date-ymd="minAppointmentDateYmd"
              :pinned-slot-start-ms="pinnedSlotStartMs"
              @slot-select="onSlotSelect"
            />
          </div>
          <p v-else class="rounded-md border border-dashed border-stroke p-4 text-sm text-muted dark:border-strokedark">Select a doctor to see available time slots.</p>
        </div>

        <div class="md:col-span-2 grid gap-4 md:grid-cols-2">
          <BaseInput
            label="Appointment date"
            type="date"
            v-model="formData.appointmentDate"
            :min="minAppointmentDateYmd"
            :error="!!errors.appointmentDate"
            :error-message="errors.appointmentDate"
            field-required
          />

          <BaseInput label="Start time" type="time" v-model="formData.startTime" :error="!!errors.startTime" :error-message="errors.startTime" field-required />
        </div>

        <p class="md:col-span-2 text-xs text-muted">Rescheduling must fall within the doctor’s availability; the server validates your selection.</p>
      </FormViewTemplate>
    </template>
  </DefaultLayout>
</template>
