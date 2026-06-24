<script setup lang="ts">
  import ChevronLeftIcon from '@/assets/images/SVGs/ChevronLeftIcon.svg';
  import ChevronRightIcon from '@/assets/images/SVGs/ChevronRightIcon.svg';

  import { ref, onMounted, computed, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import { useApiSearchDropdown } from '@/composables/useApiSearchDropdown';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseCheckbox from '@/components/Base/BaseCheckbox.vue';
  import BaseCnicInput from '@/components/Base/BaseCnicInput.vue';
  import FormStepper from '@/components/UI/FormStepper.vue';
  import CountryList from 'country-list-with-dial-code-and-flag';
  import EmployeeServices from '@/services/Employee/Employee.services';
  import DepartmentsServices from '@/services/Department/Department.services';
  import DesignationServices from '@/services/Designation/Designation.services';
  import { STATUS_OPTIONS } from '@/constants/statusOptions';

  const route = useRoute();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();

  // Stepper state
  const currentStep = ref(1);
  const steps = [
    { id: 1, title: 'Personal Info', description: 'Basic details' },
    { id: 2, title: 'Professional', description: 'Credentials' },
    { id: 3, title: 'Employment', description: 'Work details' },
  ];

  const employeeService = new EmployeeServices();
  const departmentService = new DepartmentsServices();
  const designationService = new DesignationServices();

  /** Same role id as doctor booking in Appointment Add (`getEmployeesByRole(6, …)`). */
  const DOCTOR_ROLE_ID = 6;

  const isLoading = ref(true);
  const isSubmitting = ref(false);
  const employeeId = ref('');

  const countryList = ref<any[]>([]);

  const formData = ref({
    name: '',
    email: '',
    phoneNumber: '',
    cnic: '',
    address: '',
    qualification: '',
    specialization: '',
    genderId: '',
    departmentId: '',
    designationId: '',
    status: 'Active',
    specializationType: '',
    officeLocation: '',
    emergencyCountryCode: '',
    emergencyContact: '',
    dateOfJoining: '',
    hasMedicalLicense: false,
    hasSurgicalCertification: false,
    hasSpecializedTraining: false,
    notes: '',
    slotDurationMinutes: '30',
  });

  const mapDepartmentRows = (list: unknown) => (Array.isArray(list) ? (list as any[]).map((d: any) => ({ id: d.id, name: d.name })) : []);

  const departmentDd = useApiSearchDropdown({
    fetchDefaultPage: async () => {
      const response = await departmentService.getDepartments('page=0&size=10');
      const raw = response.content || response.Content || response.data || [];
      return mapDepartmentRows(raw);
    },
    fetchSearchPage: async (term) => {
      const response = await departmentService.getDepartments(`page=0&size=20&searchTerm=${encodeURIComponent(term)}`);
      const raw = response.content || response.Content || response.data || [];
      return mapDepartmentRows(raw);
    },
    getSelectedId: () => formData.value.departmentId,
  });

  const mapDesignationRows = (list: unknown) =>
    Array.isArray(list)
      ? (list as any[]).map((d: any) => ({
          id: d.id,
          name: d.name,
          role: d.role ? { id: d.role.id, name: d.role.name } : undefined,
        }))
      : [];

  const designationDd = useApiSearchDropdown({
    fetchDefaultPage: async () => {
      const response = await designationService.getDesignations('page=0&size=10');
      const raw = response.content || response.Content || [];
      return mapDesignationRows(raw);
    },
    fetchSearchPage: async (term) => {
      const response = await designationService.getDesignations(`page=0&size=20&searchTerm=${encodeURIComponent(term)}`);
      const raw = response.content || response.Content || [];
      return mapDesignationRows(raw);
    },
    getSelectedId: () => formData.value.designationId,
  });

  const departmentEmptyMessage = departmentDd.emptyMessage();
  const designationEmptyMessage = designationDd.emptyMessage();

  const departmentOptions = computed(() => departmentDd.items.value);
  const designationOptions = computed(() => designationDd.items.value);
  const departmentLoading = computed(() => departmentDd.loading.value);
  const designationLoading = computed(() => designationDd.loading.value);

  const showAppointmentSlotDuration = ref(false);

  const isDoctorDesignation = (role: { id?: number; name?: string } | null | undefined) => {
    if (!role) return false;
    if (role.id === DOCTOR_ROLE_ID) return true;
    return /doctor|physician|surgeon/i.test(role.name || '');
  };

  const syncSlotVisibilityFromDesignationId = () => {
    const id = formData.value.designationId;
    if (!id) {
      showAppointmentSlotDuration.value = false;
      return;
    }
    const des = designationDd.items.value.find((x: any) => String(x.id) === String(id));
    showAppointmentSlotDuration.value = isDoctorDesignation(des?.role);
  };

  const loadEmployee = async () => {
    isLoading.value = true;
    try {
      employeeId.value = route.params.id.toString();
      const response = await employeeService.getEmployeesById(employeeId.value);
      if (response?.data) {
        const d = response.data;

        formData.value = {
          name: d.name || '',
          email: d.email || '',
          phoneNumber: d.phoneNumber || '',
          cnic: d.cnic || '',
          address: d.address || '',
          qualification: d.qualification || '',
          specialization: d.specialization || '',
          genderId: d.gender != null ? String(d.gender) : '',
          departmentId: d.department?.id ? String(d.department.id) : '',
          designationId: d.designations?.[0]?.id ? String(d.designations[0].id) : '',
          status: d.status || 'Active',
          specializationType: d.specializationType || '',
          officeLocation: d.officeLocation || '',
          emergencyCountryCode: d.emergencyContact && d.emergencyContact.includes(')') ? d.emergencyContact.split(')')[0].replace('(', '') : '',
          emergencyContact: d.emergencyContact && d.emergencyContact.includes(')') ? d.emergencyContact.split(')')[1] : d.emergencyContact || '',
          dateOfJoining: d.dateOfJoining ? d.dateOfJoining.split('T')[0] : '',
          hasMedicalLicense: d.hasMedicalLicense || false,
          hasSurgicalCertification: d.hasSurgicalCertification || false,
          hasSpecializedTraining: d.hasSpecializedTraining || false,
          notes: d.notes || '',
          slotDurationMinutes: String(d.slotDurationMinutes != null && d.slotDurationMinutes > 0 ? d.slotDurationMinutes : 30),
        };

        departmentDd.items.value = [];
        designationDd.items.value = [];
        if (d.department?.id) {
          departmentDd.items.value = [{ id: d.department.id, name: d.department.name || `Id ${d.department.id}` }];
        }
        const primaryDes = d.designations?.[0];
        if (primaryDes?.id) {
          designationDd.items.value = [
            {
              id: primaryDes.id,
              name: primaryDes.name || `Id ${primaryDes.id}`,
              role: primaryDes.role ? { id: primaryDes.role.id, name: primaryDes.role.name } : undefined,
            },
          ];
        }
        await Promise.all([departmentDd.loadDefault(), designationDd.loadDefault()]);
        syncSlotVisibilityFromDesignationId();
      }
    } finally {
      isLoading.value = false;
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return validateForm(formData.value, {
          name: [rules.required(), rules.name()],
          genderId: [rules.required('Gender is required')],
          address: [rules.required()],
        });
      case 2:
        return validateForm(formData.value, {
          qualification: [rules.required()],
          specialization: [rules.required()],
          designationId: [rules.required('Designation is required')],
          departmentId: [rules.required('Department is required')],
        });
      case 3:
        return true; // Step 3 fields are optional
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep.value)) {
      if (currentStep.value < steps.length) {
        currentStep.value++;
      }
    }
  };

  const previousStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--;
    }
  };

  const canGoPrevious = computed(() => currentStep.value > 1);
  const isLastStep = computed(() => currentStep.value === steps.length);

  const submitUpdate = async () => {
    if (!validateStep(currentStep.value)) return;

    isSubmitting.value = true;
    try {
      const payload = {
        id: Number(employeeId.value),
        name: formData.value.name,
        email: formData.value.email,
        phoneNumber: formData.value.phoneNumber,
        cnic: formData.value.cnic,
        address: formData.value.address,
        specialization: formData.value.specialization,
        qualification: formData.value.qualification,
        gender: Number(formData.value.genderId),
        status: formData.value.status,
        specializationType: formData.value.specializationType || undefined,
        officeLocation: formData.value.officeLocation || undefined,
        emergencyContact:
          formData.value.emergencyContact && formData.value.emergencyCountryCode
            ? `(${formData.value.emergencyCountryCode})${formData.value.emergencyContact}`
            : formData.value.emergencyContact || undefined,
        dateOfJoining: formData.value.dateOfJoining || undefined,
        hasMedicalLicense: formData.value.hasMedicalLicense,
        hasSurgicalCertification: formData.value.hasSurgicalCertification,
        hasSpecializedTraining: formData.value.hasSpecializedTraining,
        notes: formData.value.notes || undefined,
        slotDurationMinutes: Number(formData.value.slotDurationMinutes) || 30,
        department: { id: Number(formData.value.departmentId) },
        designations: [{ id: Number(formData.value.designationId) }],
      };
      const response = await employeeService.updateEmployee(payload);
      if (response.isSuccess) {
        showAlert('success', 'Staff record updated successfully.', 'Success');
        router.push('/employees');
      }
    } finally {
      isSubmitting.value = false;
    }
  };

  watch(
    () => formData.value.designationId,
    () => syncSlotVisibilityFromDesignationId()
  );

  onMounted(async () => {
    const temp = CountryList.getAll();
    countryList.value = temp.map((c: any) => c.data);
    await loadEmployee();
  });
</script>

<template>
  <DefaultLayout>
    <div v-if="isLoading" class="space-y-6 max-w-5xl mx-auto animate-pulse">
      <div class="h-8 bg-elevated rounded-2xl w-1/3"></div>
      <div class="bg-surface rounded-3xl p-8 space-y-6">
        <div class="grid grid-cols-2 gap-8">
          <div v-for="i in 6" :key="i" class="h-14 bg-elevated rounded-xl"></div>
        </div>
      </div>
    </div>

    <div v-else class="mx-auto max-w-5xl">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center gap-2 text-sm text-bodydark dark:text-bodydark1 mb-2">
          <BaseButton variant="ghost" @click="router.push('/employees')" class="!p-0 !bg-transparent text-bodydark hover:text-primary">Employees</BaseButton>
          <span>/</span>
          <span class="text-emphasis">Edit Staff Profile</span>
        </div>
        <h1 class="text-3xl font-bold text-emphasis">Edit Staff Profile</h1>
        <p class="text-bodydark dark:text-bodydark1 mt-2">Update employee information</p>
      </div>

      <!-- Stepper -->
      <FormStepper :steps="steps" :current-step="currentStep" @update:current-step="currentStep = $event" />

      <!-- Form Content: overflow-visible so BaseSelect dropdowns are not clipped -->
      <div class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-8 mb-6 overflow-visible">
        <!-- Step 1: Personal Information -->
        <div v-show="currentStep === 1" class="space-y-6">
          <div class="mb-6">
            <h3 class="text-xl font-semibold text-emphasis mb-2">Personal Information</h3>
            <p class="text-sm text-bodydark dark:text-bodydark1">Update the employee's basic personal details</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BaseInput
              label="Full Name"
              v-model="formData.name"
              placeholder="Staff member's name"
              :error="!!errors.name"
              :error-message="errors.name"
              field-required
              @change="validateField('name', formData.name, [rules.required(), rules.name()])"
            />

            <BaseInput label="Professional Email" v-model="formData.email" placeholder="staff@hospital.com" readonly />

            <BaseInput label="Phone Number" v-model="formData.phoneNumber" placeholder="Phone number" readonly />

            <BaseCnicInput v-model="formData.cnic" readonly />

            <BaseSelect
              label="Gender"
              v-model="formData.genderId"
              :options="[
                { id: '0', name: 'Male' },
                { id: '1', name: 'Female' },
              ]"
              placeholder="Select gender"
              :error="!!errors.genderId"
              :error-message="errors.genderId"
              field-required
            />

            <BaseInput
              label="Residential Address"
              v-model="formData.address"
              placeholder="Street, City, Country"
              :error="!!errors.address"
              :error-message="errors.address"
              field-required
              class="md:col-span-2"
              @change="validateField('address', formData.address, [rules.required()])"
            />
          </div>
        </div>

        <!-- Step 2: Professional Information -->
        <div v-show="currentStep === 2" class="space-y-6">
          <div class="mb-6">
            <h3 class="text-xl font-semibold text-emphasis mb-2">Professional Credentials</h3>
            <p class="text-sm text-bodydark dark:text-bodydark1">Update the employee's qualifications and role</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-visible">
            <BaseInput
              label="Academic Qualification"
              v-model="formData.qualification"
              placeholder="e.g. MBBS, FCPS"
              :error="!!errors.qualification"
              :error-message="errors.qualification"
              field-required
            />

            <BaseInput
              label="Area of Specialization"
              v-model="formData.specialization"
              placeholder="e.g. Cardiology"
              :error="!!errors.specialization"
              :error-message="errors.specialization"
              field-required
            />

            <BaseInput v-if="showAppointmentSlotDuration" label="Appointment slot (minutes)" v-model="formData.slotDurationMinutes" type="number" min="5" max="240" placeholder="30" />

            <BaseSelect
              label="Department / Unit"
              v-model="formData.departmentId"
              :options="departmentOptions"
              placeholder="Select department or type to search…"
              :empty-message="departmentEmptyMessage"
              :loading="departmentLoading"
              :error="!!errors.departmentId"
              :error-message="errors.departmentId"
              field-required
              @search="departmentDd.onSearch"
            />

            <BaseSelect
              label="Assigned Designation"
              v-model="formData.designationId"
              :options="designationOptions"
              placeholder="Select designation or type to search…"
              :empty-message="designationEmptyMessage"
              :loading="designationLoading"
              :error="!!errors.designationId"
              :error-message="errors.designationId"
              field-required
              @search="designationDd.onSearch"
            />
          </div>
        </div>

        <!-- Step 3: Employment Details -->
        <div v-show="currentStep === 3" class="space-y-6">
          <div class="mb-6">
            <h3 class="text-xl font-semibold text-emphasis mb-2">Employment Details</h3>
            <p class="text-sm text-bodydark dark:text-bodydark1">Update additional employment information</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BaseSelect label="Employment Status" v-model="formData.status" :options="STATUS_OPTIONS.EMPLOYEE" placeholder="Select status" field-required />

            <BaseInput label="Office Location" v-model="formData.officeLocation" placeholder="e.g. Building A, Room 201" />

            <div class="space-y-1.5 w-full">
              <label class="block text-sm font-medium text-emphasis">Emergency Contact</label>
              <div class="grid grid-cols-3 gap-2">
                <BaseSelect label="Code" v-model="formData.emergencyCountryCode" :options="countryList" display-key="dial_code" value-key="dial_code" placeholder="Select..." />
                <BaseInput class="col-span-2" v-model="formData.emergencyContact" placeholder="000 000 0000" />
              </div>
            </div>

            <BaseInput label="Date of Joining" type="date" v-model="formData.dateOfJoining" />

            <div class="space-y-3">
              <label class="text-sm font-medium text-emphasis">Certifications</label>
              <div class="space-y-2">
                <BaseCheckbox label="Medical License" v-model="formData.hasMedicalLicense" />
                <BaseCheckbox label="Surgical Certification" v-model="formData.hasSurgicalCertification" />
                <BaseCheckbox label="Specialized Training" v-model="formData.hasSpecializedTraining" />
              </div>
            </div>

            <BaseInput label="Additional Notes" v-model="formData.notes" placeholder="Any additional information" class="md:col-span-2" />
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between bg-elevated rounded-2xl p-6 border border-stroke dark:border-strokedark">
        <BaseButton v-if="canGoPrevious" variant="outline" @click="previousStep">
          <ChevronLeftIcon class="w-5 h-5" />
          Previous
        </BaseButton>
        <BaseButton v-else variant="outline" @click="router.back()">Cancel</BaseButton>

        <div class="flex items-center gap-3">
          <span class="text-sm text-bodydark dark:text-bodydark1">Step {{ currentStep }} of {{ steps.length }}</span>
          <BaseButton v-if="!isLastStep" variant="primary" @click="nextStep">
            Next
            <ChevronRightIcon class="w-5 h-5" />
          </BaseButton>
          <BaseButton v-else variant="primary" :loading="isSubmitting" @click="submitUpdate">Save Changes</BaseButton>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
