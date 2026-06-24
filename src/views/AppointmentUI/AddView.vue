<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useDebounceFn } from '@vueuse/core';
  import { useRouter, useRoute } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import { useApiSearchDropdown } from '@/composables/useApiSearchDropdown';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import AppointmentCalendar from '@/components/Appointment/AppointmentCalendar.vue';
  import AvailableDoctorsList from '@/components/Appointment/AvailableDoctorsList.vue';
  import AppointmentServices from '@/services/Appointment/appointment.services';
  import PatientServices from '@/services/Patient/patient.services';
  import EmployeesServices from '@/services/Employee/Employee.services';
  import DepartmentService from '@/services/Department/Department.services';
  import { STATUS_OPTIONS } from '@/constants/statusOptions';
  import type { IAppointmentSlot, IAvailableDoctor } from '@/services/Appointment/appointment.interface';
  import { startOfWeekMondayYmd, addDaysYmd, toLocalYmd, toLocalOffsetIsoString, isSlotStartInPast } from '@/utils/calendarDate';

  const router = useRouter();
  const route = useRoute();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();
  const appointmentService = new AppointmentServices();
  const patientService = new PatientServices();
  const employeeService = new EmployeesServices();
  const departmentService = new DepartmentService();

  const isSubmitting = ref(false);
  const bookingMode = ref<'department' | 'doctor'>('department');

  const departmentId = ref<string | number>('');
  const deptDate = ref('');
  const deptStartTime = ref('');
  const availableDoctors = ref<IAvailableDoctor[]>([]);
  const loadingDoctors = ref(false);

  const patientId = ref<string | number>('');
  const employeeId = ref<string | number>('');

  const statuses = STATUS_OPTIONS.APPOINTMENT;
  const types = STATUS_OPTIONS.APPOINTMENT_TYPE;
  const priority = ref('Normal');
  const statusId = ref<string | number>('1');
  const typeId = ref<string | number>('1');
  const location = ref('');
  const reason = ref('');

  const calendarView = ref<'day' | 'week' | 'month'>('week');
  const focusDate = ref(toLocalYmd(new Date()));
  const slots = ref<IAppointmentSlot[]>([]);
  const loadingSlots = ref(false);

  const startOfWeekMonday = startOfWeekMondayYmd;
  const addDaysStr = addDaysYmd;

  const minAppointmentDateYmd = computed(() => toLocalYmd(new Date()));

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
    getSelectedId: () => patientId.value,
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
    getSelectedId: () => employeeId.value,
  });

  const patientEmptyMessage = patientDd.emptyMessage();
  const employeeEmptyMessage = employeeDd.emptyMessage();

  const mapDepartmentOptions = (raw: any[]) => (Array.isArray(raw) ? raw.map((d: any) => ({ id: d.id, name: d.name })) : []);

  const departmentDd = useApiSearchDropdown({
    fetchDefaultPage: async () => {
      const response = await departmentService.getDepartments('page=0&size=10');
      const list = response?.content || response?.data?.content || response?.data || [];
      return mapDepartmentOptions(list);
    },
    fetchSearchPage: async (term) => {
      const response = await departmentService.getDepartments(`page=0&size=20&searchTerm=${encodeURIComponent(term)}`);
      const list = response?.content || response?.data?.content || response?.data || [];
      return mapDepartmentOptions(list);
    },
    getSelectedId: () => departmentId.value,
  });

  const departmentEmptyMessage = departmentDd.emptyMessage();

  const loadSelectedPatient = async (id: string) => {
    try {
      const response = await patientService.getPatientById(id);
      if (response?.data) {
        const p = response.data;
        patientDd.items.value = [{ id: p.id, name: `${p.firstName || ''} ${p.lastName || ''}`.trim() }];
      }
    } catch {
      /* ignore */
    }
  };

  const findDoctorsForDepartment = async () => {
    const ok = validateForm(
      {
        patientId: patientId.value,
        departmentId: departmentId.value,
        deptDate: deptDate.value,
        deptStartTime: deptStartTime.value,
      },
      {
        patientId: [rules.required('Patient is required')],
        departmentId: [rules.required('Department is required')],
        deptDate: [rules.required('Date is required')],
        deptStartTime: [rules.required('Start time is required')],
      }
    );
    if (!ok) return;

    const deptInstant = new Date(`${deptDate.value}T${deptStartTime.value}`).getTime();
    if (Number.isNaN(deptInstant) || deptInstant < Date.now()) {
      showAlert('error', 'Date and time must be in the future.', 'Validation');
      return;
    }

    loadingDoctors.value = true;
    try {
      const res = await appointmentService.getAvailableDoctors(Number(departmentId.value), deptDate.value, deptStartTime.value);
      availableDoctors.value = res?.data ?? res?.Data ?? [];
      if (!availableDoctors.value.length) {
        showAlert('info', 'No doctors are free in that window. Try another time.', 'No availability');
      }
    } catch (err: any) {
      showAlert('error', err?.response?.data?.error || err?.message || 'Request failed', 'Error');
      availableDoctors.value = [];
    } finally {
      loadingDoctors.value = false;
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
    if (bookingMode.value !== 'doctor' || !employeeId.value) {
      slots.value = [];
      return;
    }
    loadingSlots.value = true;
    try {
      const { start, end } = slotRangeForCalendar();
      const res = await appointmentService.getAvailableSlots(Number(employeeId.value), start, end);
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

  watch([bookingMode, employeeId, calendarView, focusDate], () => {
    if (bookingMode.value === 'doctor' && employeeId.value) {
      clampFocusToMin();
    }
    if (bookingMode.value !== 'doctor' || !employeeId.value) {
      slots.value = [];
      loadingSlots.value = false;
      return;
    }
    debouncedFetchSlots();
  });

  watch(minAppointmentDateYmd, () => {
    if (bookingMode.value === 'doctor') clampFocusToMin();
  });

  const bookAppointment = async (payload: { startIso: string; employeeIdNum: number }) => {
    if (!patientId.value) {
      showAlert('error', 'Patient is required.', 'Validation');
      return;
    }
    const ok = validateForm(
      { statusId: statusId.value, typeId: typeId.value, priority: priority.value },
      {
        statusId: [rules.required('Status is required')],
        typeId: [rules.required('Type is required')],
        priority: [rules.required('Priority is required')],
      }
    );
    if (!ok) return;

    isSubmitting.value = true;
    try {
      const startTime = payload.startIso;
      const response = await appointmentService.addAppointment({
        appointmentDateTime: startTime,
        startTime,
        priority: priority.value,
        location: location.value.trim(),
        reason: reason.value.trim(),
        patient: { id: Number(patientId.value) },
        employee: { id: payload.employeeIdNum },
        appointmentStatus: { id: Number(statusId.value) },
        appointmentTypes: { id: Number(typeId.value) },
      });
      const r = response as Record<string, unknown>;
      if (!r?.error) {
        showAlert('success', 'Appointment scheduled successfully.', 'Success');
        router.push('/appointments');
      } else {
        showAlert('error', String(r.error || 'Failed to schedule'), 'Error');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to schedule appointment';
      showAlert('error', msg, 'Error');
    } finally {
      isSubmitting.value = false;
    }
  };

  const onSelectDeptDoctor = (doctor: IAvailableDoctor) => {
    const inst = new Date(`${deptDate.value}T${deptStartTime.value}`).getTime();
    if (Number.isNaN(inst) || inst < Date.now()) {
      showAlert('error', 'Date and time must be in the future.', 'Validation');
      return;
    }
    const start = toLocalOffsetIsoString(new Date(`${deptDate.value}T${deptStartTime.value}`));
    bookAppointment({ startIso: start, employeeIdNum: doctor.id });
  };

  const onSlotSelect = (slot: IAppointmentSlot) => {
    if (slot.isBooked || isSlotStartInPast(slot.startTime) || !employeeId.value) return;
    bookAppointment({
      startIso: toLocalOffsetIsoString(new Date(slot.startTime)),
      employeeIdNum: Number(employeeId.value),
    });
  };

  onMounted(async () => {
    deptDate.value = toLocalYmd(new Date());
    clampFocusToMin();
    await Promise.all([patientDd.loadDefault(), employeeDd.loadDefault(), departmentDd.loadDefault()]);
    const q = route.query.patientId as string;
    if (q) {
      patientId.value = q;
      await loadSelectedPatient(q);
      await patientDd.loadDefault();
    }
  });
</script>

<template>
  <DefaultLayout>
    <div class="mb-6 flex flex-col gap-3 rounded-lg border border-stroke bg-surface p-4 dark:border-strokedark">
      <div class="flex flex-wrap items-center gap-4">
        <span class="text-sm font-bold text-muted">Booking method</span>
        <label class="flex cursor-pointer items-center gap-2 text-sm">
          <input v-model="bookingMode" type="radio" value="department" class="accent-primary" />
          By department (time first)
        </label>
        <label class="flex cursor-pointer items-center gap-2 text-sm">
          <input v-model="bookingMode" type="radio" value="doctor" class="accent-primary" />
          By doctor (pick a slot)
        </label>
      </div>
      <p v-if="bookingMode === 'doctor'" class="text-sm text-muted">Select a doctor to load their availability, then choose a time slot in the calendar.</p>
      <p v-else class="text-sm text-muted">Choose department, date, and time, then pick from available doctors for that window.</p>
    </div>

    <FormViewTemplate title="Schedule New Appointment" breadcrumb-title="Appointments" breadcrumb-slug="New entry" :is-submitting="isSubmitting" hide-footer @submit="() => {}" @cancel="router.back()">
      <div class="md:col-span-2 grid gap-4 md:grid-cols-2">
        <BaseSelect
          label="Patient"
          v-model="patientId"
          :options="patientDd.items"
          placeholder="Pick a patient or type to search…"
          :empty-message="patientEmptyMessage"
          :error="!!errors.patientId"
          :error-message="errors.patientId"
          :loading="patientDd.loading"
          field-required
          @search="patientDd.onSearch"
          @change="validateField('patientId', patientId, [rules.required('Patient is required')])"
        />
        <BaseSelect
          v-if="bookingMode === 'department'"
          label="Department"
          v-model="departmentId"
          :options="departmentDd.items"
          placeholder="Select department or type to search…"
          :empty-message="departmentEmptyMessage"
          :loading="departmentDd.loading"
          field-required
          @search="departmentDd.onSearch"
        />
        <BaseSelect
          v-else
          label="Doctor"
          v-model="employeeId"
          :options="employeeDd.items"
          placeholder="Pick a doctor or type to search…"
          :empty-message="employeeEmptyMessage"
          :error="!!errors.employeeId"
          :error-message="errors.employeeId"
          :loading="employeeDd.loading"
          field-required
          @search="employeeDd.onSearch"
          @change="validateField('employeeId', employeeId, [rules.required('Doctor is required')])"
        />
      </div>

      <div class="md:col-span-2 grid gap-4 md:grid-cols-2">
        <BaseSelect
          label="Priority"
          v-model="priority"
          :options="[
            { id: 'Normal', name: 'Normal' },
            { id: 'Urgent', name: 'Urgent' },
            { id: 'Emergency', name: 'Emergency' },
          ]"
          placeholder="Select priority…"
          field-required
          :error="!!errors.priority"
          :error-message="errors.priority"
          @change="validateField('priority', priority, [rules.required('Priority is required')])"
        />
        <BaseSelect
          label="Status"
          v-model="statusId"
          :options="statuses"
          placeholder="Select status…"
          field-required
          :error="!!errors.statusId"
          :error-message="errors.statusId"
          @change="validateField('statusId', statusId, [rules.required('Status is required')])"
        />
        <BaseSelect
          label="Type"
          v-model="typeId"
          :options="types"
          placeholder="Select type…"
          field-required
          :error="!!errors.typeId"
          :error-message="errors.typeId"
          @change="validateField('typeId', typeId, [rules.required('Type is required')])"
        />
        <BaseInput label="Location" v-model="location" placeholder="e.g. Room 204, Building A" />
        <BaseInput label="Reason for visit" v-model="reason" placeholder="e.g. Follow-up on blood work" class="md:col-span-2" />
      </div>

      <!-- Department flow -->
      <template v-if="bookingMode === 'department'">
        <div class="md:col-span-2 grid gap-4 md:grid-cols-2">
          <BaseInput label="Date" v-model="deptDate" type="date" :min="minAppointmentDateYmd" field-required />
          <BaseInput label="Preferred time" v-model="deptStartTime" type="time" field-required />
        </div>
        <div class="md:col-span-2 flex flex-wrap gap-2">
          <BaseButton type="button" @click="findDoctorsForDepartment">Find available doctors</BaseButton>
        </div>
        <div class="md:col-span-2">
          <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-muted">Available doctors</h3>
          <AvailableDoctorsList :doctors="availableDoctors" :loading="loadingDoctors" @select="onSelectDeptDoctor" />
        </div>
      </template>

      <!-- Doctor flow -->
      <template v-else>
        <div class="md:col-span-2">
          <h3 class="mb-2 text-sm font-bold uppercase tracking-wide text-muted">Doctor availability</h3>
          <div v-if="loadingSlots" class="rounded-md border border-stroke bg-surface p-4 text-sm text-muted dark:border-strokedark">Loading calendar…</div>
          <div v-else-if="employeeId">
            <AppointmentCalendar :slots="slots" v-model:view-mode="calendarView" v-model:focus-date="focusDate" :min-focus-date-ymd="minAppointmentDateYmd" @slot-select="onSlotSelect" />
          </div>
          <p v-else class="rounded-md border border-dashed border-stroke p-4 text-sm text-muted dark:border-strokedark">Select a doctor to load available slots.</p>
        </div>
      </template>

      <div class="md:col-span-2 flex justify-end border-t border-stroke pt-4 dark:border-strokedark">
        <BaseButton type="button" variant="outline" @click="router.back()">Back</BaseButton>
      </div>
    </FormViewTemplate>
  </DefaultLayout>
</template>
