<script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import { useApiSearchDropdown } from '@/composables/useApiSearchDropdown';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import AdmissionServices from '@/services/Admission/Admission.services';
  import EmployeesServices from '@/services/Employee/Employee.services';
  import WardServices from '@/services/Ward/ward.services';
  import PatientsServices from '@/services/Patient/patient.services';
  import { STATUS_OPTIONS } from '@/constants/statusOptions';

  const router = useRouter();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();
  const admissionService = new AdmissionServices();
  const employeeService = new EmployeesServices();
  const wardService = new WardServices();
  const patientService = new PatientsServices();

  const isSubmitting = ref(false);

  const formData = ref({
    patientId: 0,
    status: 0,
    admissionDate: '',
    dischargeDate: '',
    totalChargesPayable: 0,
    reasonForAdmission: '',
    wardId: 0,
    wardBedId: 0,
    attendingDoctorId: 0,
  });

  const bedOptions = ref<{ id: number; name: string }[]>([]);
  const bedsLoading = ref(false);

  const unwrapList = (response: any) => response?.content || response?.Content || response?.data || [];

  const formatPatientOption = (p: any) => ({
    id: p.id,
    name: `${p.firstName || ''} ${p.lastName || ''}`.trim() + ` - ${p.cnic || p.CNIC || 'N/A'}`,
  });

  const formatDoctorOption = (e: any) => ({
    id: e.id,
    name: `${e.name}${e.specialization ? ' - ' + e.specialization : ''}`,
  });

  const formatWardOption = (w: any) => {
    const total = w?.noOfBeds ?? w?.NoOfBeds;
    const occ = w?.occupiedBeds ?? w?.OccupiedBeds;
    if (total == null && occ == null) {
      return { id: w.id, name: w.name || `Ward ${w.id}` };
    }
    const totalN = Number(total) || 0;
    const unoccupied = Math.max(0, totalN - (Number(occ) || 0));
    return {
      id: w.id,
      name: `${w.name} (${unoccupied} unoccupied of ${totalN} beds)`,
      availableBeds: unoccupied,
      totalBeds: totalN,
    };
  };

  const selectedWardBedSummary = computed(() => {
    const id = formData.value.wardId;
    if (!id) return '';
    const opt = wardOptions.value.find((o) => Number(o.id) === Number(id)) as { availableBeds?: number; totalBeds?: number } | undefined;
    if (opt?.availableBeds === undefined || opt?.totalBeds === undefined) return '';
    return `Unoccupied beds in this ward: ${opt.availableBeds} of ${opt.totalBeds}`;
  });

  const defersPhysicalBed = computed(() => (STATUS_OPTIONS.ADMISSION_DEFERS_PHYSICAL_BED_IDS as readonly number[]).includes(Number(formData.value.status)));

  const showDischargeDateField = computed(() => (STATUS_OPTIONS.ADMISSION_SHOW_DISCHARGE_DATE_IDS as readonly number[]).includes(Number(formData.value.status)));

  /** Local calendar date YYYY-MM-DD (min for date inputs). */
  const minAdmissionDateStr = computed(() => {
    const n = new Date();
    const y = n.getFullYear();
    const m = String(n.getMonth() + 1).padStart(2, '0');
    const d = String(n.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  const patientDd = useApiSearchDropdown({
    fetchDefaultPage: async () => {
      const response = await patientService.getPatients('page=0&size=10');
      return unwrapList(response).map(formatPatientOption);
    },
    fetchSearchPage: async (term) => {
      const response = await patientService.getPatients(`page=0&size=20&searchTerm=${encodeURIComponent(term)}`);
      return unwrapList(response).map(formatPatientOption);
    },
    getSelectedId: () => (formData.value.patientId ? formData.value.patientId : ''),
  });

  const doctorDd = useApiSearchDropdown({
    fetchDefaultPage: async () => {
      const response = await employeeService.getEmployeesByRole(6, 'page=0&size=10');
      return unwrapList(response).map(formatDoctorOption);
    },
    fetchSearchPage: async (term) => {
      const response = await employeeService.getEmployeesByRole(6, `page=0&size=20&searchTerm=${encodeURIComponent(term)}`);
      return unwrapList(response).map(formatDoctorOption);
    },
    getSelectedId: () => (formData.value.attendingDoctorId ? formData.value.attendingDoctorId : ''),
  });

  const wardDd = useApiSearchDropdown({
    fetchDefaultPage: async () => {
      const response = await wardService.getWards('page=0&size=10');
      return unwrapList(response).map(formatWardOption);
    },
    fetchSearchPage: async (term) => {
      const response = await wardService.getWards(`page=0&size=20&searchTerm=${encodeURIComponent(term)}`);
      return unwrapList(response).map(formatWardOption);
    },
    getSelectedId: () => (formData.value.wardId ? formData.value.wardId : ''),
  });

  const patientEmptyMessage = patientDd.emptyMessage();
  const doctorEmptyMessage = doctorDd.emptyMessage();
  const wardEmptyMessage = wardDd.emptyMessage();

  const patientOptions = computed(() => patientDd.items.value);
  const doctorOptions = computed(() => doctorDd.items.value);
  const wardOptions = computed(() => wardDd.items.value);
  const patientLoading = computed(() => patientDd.loading.value);
  const doctorLoading = computed(() => doctorDd.loading.value);
  const wardLoading = computed(() => wardDd.loading.value);

  watch(
    () => formData.value.status,
    (status) => {
      if ((STATUS_OPTIONS.ADMISSION_DEFERS_PHYSICAL_BED_IDS as readonly number[]).includes(Number(status))) {
        formData.value.wardBedId = 0;
      }
    }
  );

  watch(
    () => formData.value.wardId,
    async (wardId) => {
      formData.value.wardBedId = 0;
      bedOptions.value = [];
      if (!wardId) return;
      bedsLoading.value = true;
      try {
        const res = (await wardService.getWardBeds(Number(wardId))) as Record<string, unknown>;
        const list = (Array.isArray(res?.data) ? res.data : Array.isArray(res?.Data) ? res.Data : []) as Record<string, unknown>[];
        bedOptions.value = list
          .filter((b) => String(b.status ?? b.Status ?? '').toLowerCase() === 'available')
          .map((b) => ({
            id: Number(b.id ?? b.Id),
            name: `Bed ${b.bedNumber ?? b.BedNumber ?? b.id ?? ''}`.trim(),
          }));
      } catch {
        bedOptions.value = [];
      } finally {
        bedsLoading.value = false;
      }
    }
  );

  const submitAdmission = async () => {
    const isValid = validateForm(formData.value, {
      patientId: [rules.required('Patient is required')],
      wardId: [rules.required('Ward is required')],
      admissionDate: [rules.required()],
      reasonForAdmission: [rules.required()],
    });

    if (!isValid) return;

    const patientId = Number(formData.value.patientId);
    const wardId = Number(formData.value.wardId);
    const wardBedId = Number(formData.value.wardBedId);
    const attendingDoctorId = Number(formData.value.attendingDoctorId);

    isSubmitting.value = true;
    try {
      const response = await admissionService.addAdmission({
        patientId,
        status: Number(formData.value.status),
        admissionDate: formData.value.admissionDate,
        dischargeDate: formData.value.dischargeDate || null,
        reasonForAdmission: formData.value.reasonForAdmission,
        ward: wardId > 0 ? { id: wardId } : null,
        wardBedId: wardBedId > 0 ? wardBedId : undefined,
        attendingDoctor: attendingDoctorId > 0 ? { id: attendingDoctorId } : null,
      });
      if (response.isSuccess ?? (response as any).IsSuccess) {
        showAlert('success', 'Admission added to system registry.', 'Success');
        router.push('/admissions');
      } else {
        showAlert('error', response.error || 'Failed to add admission.', 'Error');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to add admission';
      showAlert('error', msg, 'Error');
    } finally {
      isSubmitting.value = false;
    }
  };

  onMounted(async () => {
    await Promise.all([patientDd.loadDefault(), doctorDd.loadDefault(), wardDd.loadDefault()]);
  });
</script>

<template>
  <DefaultLayout>
    <FormViewTemplate title="Create New Admission" breadcrumb-title="Admissions" :is-submitting="isSubmitting" @submit="submitAdmission" @cancel="router.back()">
      <!-- Row 1: Patient & Ward -->
      <BaseSelect
        label="Patient"
        v-model="formData.patientId"
        :options="patientOptions"
        placeholder="Select patient or type to search…"
        :empty-message="patientEmptyMessage"
        :loading="patientLoading"
        :error="!!errors.patientId"
        :error-message="errors.patientId"
        field-required
        @search="patientDd.onSearch"
        @change="validateField('patientId', formData.patientId, [rules.required('Patient is required')])"
      />

      <BaseSelect
        label="Ward"
        v-model="formData.wardId"
        :options="wardOptions"
        placeholder="Select ward or type to search…"
        :empty-message="wardEmptyMessage"
        :loading="wardLoading"
        field-required
        :error="!!errors.wardId"
        :error-message="errors.wardId"
        @search="wardDd.onSearch"
        @change="validateField('wardId', formData.wardId, [rules.required('Ward is required')])"
      />

      <BaseSelect
        v-if="formData.wardId && !defersPhysicalBed"
        label="Bed (optional)"
        v-model="formData.wardBedId"
        :options="bedOptions"
        placeholder="First available bed is used if you skip this"
        :loading="bedsLoading"
      />

      <p v-if="selectedWardBedSummary" class="text-xs text-bodydark dark:text-bodydark1 -mt-2 md:col-span-2">
        {{ selectedWardBedSummary }}
      </p>

      <BaseInput
        label="Reason for Admission"
        v-model="formData.reasonForAdmission"
        placeholder="Enter reason for admission"
        :error="!!errors.reasonForAdmission"
        :error-message="errors.reasonForAdmission"
        field-required
        class="md:col-span-2"
        @change="validateField('reasonForAdmission', formData.reasonForAdmission, [rules.required()])"
      />

      <BaseInput
        label="Admission Date"
        type="date"
        v-model="formData.admissionDate"
        :min="minAdmissionDateStr"
        :error="!!errors.admissionDate"
        :error-message="errors.admissionDate"
        field-required
        @change="validateField('admissionDate', formData.admissionDate, [rules.required()])"
      />

      <BaseSelect
        label="Attending Doctor (Optional)"
        v-model="formData.attendingDoctorId"
        :options="doctorOptions"
        placeholder="Select doctor or type to search…"
        :empty-message="doctorEmptyMessage"
        :loading="doctorLoading"
        @search="doctorDd.onSearch"
      />

      <!-- Status & financial -->
      <BaseSelect label="Status" v-model="formData.status" :options="STATUS_OPTIONS.ADMISSION" />

      <div class="flex flex-col gap-1.5">
        <label class="block text-sm font-medium text-emphasis">Total Charges Payable</label>
        <div class="rounded-lg border border-stroke dark:border-form-strokedark bg-gray-2 dark:bg-form-input py-3 px-4 text-sm font-medium text-emphasis">
          Rs. {{ formData.totalChargesPayable.toLocaleString() }}
        </div>
        <p class="text-xs text-bodydark dark:text-bodydark1">Auto-calculated based on expenses</p>
      </div>

      <BaseInput label="Discharge Date (Optional)" type="date" v-model="formData.dischargeDate" v-if="showDischargeDateField" />
    </FormViewTemplate>
  </DefaultLayout>
</template>
