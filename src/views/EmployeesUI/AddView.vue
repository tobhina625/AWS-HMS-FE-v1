<script setup lang="ts">
  import ChevronLeftIcon from '@/assets/images/SVGs/ChevronLeftIcon.svg';
  import ChevronRightIcon from '@/assets/images/SVGs/ChevronRightIcon.svg';

  import { ref, computed, watch, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseCheckbox from '@/components/Base/BaseCheckbox.vue';
  import BaseCnicInput from '@/components/Base/BaseCnicInput.vue';
  import BasePhoneInput from '@/components/Base/BasePhoneInput.vue';
  import FormStepper from '@/components/UI/FormStepper.vue';
  import EmployeeServices from '@/services/Employee/Employee.services';
  import DepartmentsServices from '@/services/Department/Department.services';
  import DesignationServices from '@/services/Designation/Designation.services';
  import RoleServices from '@/services/Role/Role.services';
  import { STATUS_OPTIONS } from '@/constants/statusOptions';

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
  const roleService = new RoleServices();

  const isSubmitting = ref(false);

  // Data Lists
  const roles = ref<{ id: number; name: string }[]>([]);
  const departments = ref<{ id: number; name: string }[]>([]);
  const designations = ref<{ id: number; name: string }[]>([]);
  const isLoadingRoles = ref(false);
  const roleSearchPerformed = ref(false);
  const isLoadingDesignations = ref(false);
  const designationSearchPerformed = ref(false);
  const isLoadingDepartments = ref(false);
  const departmentSearchPerformed = ref(false);

  const formData = ref({
    name: '',
    email: '',
    phone: '',
    cnic: '',
    address: '',
    qualification: '',
    specialization: '',
    genderId: '',
    roleId: '',
    departmentId: '',
    designationId: '',
    status: 'Active',
    specializationType: '',
    officeLocation: '',
    emergencyPhone: '',
    dateOfJoining: '',
    hasMedicalLicense: false,
    hasSurgicalCertification: false,
    hasSpecializedTraining: false,
    notes: '',
  });

  const roleEmptyMessage = computed(() => {
    if (roleSearchPerformed.value) return 'No results found';
    return 'Type at least 2 characters to filter the list';
  });

  const mapRoleRows = (list: unknown) => (Array.isArray(list) ? (list as any[]).map((r: any) => ({ id: r.id, name: r.name })) : []);

  /** First page of roles (no search); keeps current selection visible if not in the page. */
  const fetchDefaultRoles = async () => {
    isLoadingRoles.value = true;
    try {
      const response = await roleService.getRoles('page=0&size=10');
      const list = response.content || response.Content || [];
      let mapped = mapRoleRows(list);
      const selId = formData.value.roleId;
      if (selId && !mapped.some((r) => String(r.id) === String(selId))) {
        const prev = roles.value.find((r) => String(r.id) === String(selId));
        if (prev) mapped = [prev, ...mapped];
      }
      roles.value = mapped;
    } catch {
      roles.value = [];
    } finally {
      isLoadingRoles.value = false;
    }
  };

  const designationEmptyMessage = computed(() => {
    if (!formData.value.roleId) return 'Select employee group first';
    if (designationSearchPerformed.value) return 'No results found for this group';
    return 'Type at least 2 characters to filter the list';
  });

  const mapDesignationRows = (list: unknown) => (Array.isArray(list) ? (list as any[]).map((d: any) => ({ id: d.id, name: d.name })) : []);

  /** First page of designations for the selected role (no search). */
  const fetchDefaultDesignations = async () => {
    const rid = formData.value.roleId;
    if (!rid) {
      designations.value = [];
      return;
    }
    isLoadingDesignations.value = true;
    try {
      const response = await designationService.getDesignationsByRole(Number(rid), 'page=0&size=10');
      const list = response.content || response.Content || [];
      let mapped = mapDesignationRows(list);
      const selId = formData.value.designationId;
      const prevList = designations.value;
      if (selId && !mapped.some((d) => String(d.id) === String(selId))) {
        const prev = prevList.find((d) => String(d.id) === String(selId));
        if (prev) mapped = [prev, ...mapped];
      }
      designations.value = mapped;
    } catch {
      designations.value = [];
    } finally {
      isLoadingDesignations.value = false;
    }
  };

  const departmentEmptyMessage = computed(() => (departmentSearchPerformed.value ? 'No results found' : 'Type at least 2 characters to filter the list'));

  const mapDepartmentRows = (list: unknown) => (Array.isArray(list) ? (list as any[]).map((d: any) => ({ id: d.id, name: d.name })) : []);

  const fetchDefaultDepartments = async () => {
    isLoadingDepartments.value = true;
    try {
      const response = await departmentService.getDepartments('page=0&size=10');
      const list = response.content || response.Content || [];
      let mapped = mapDepartmentRows(list);
      const selId = formData.value.departmentId;
      if (selId && !mapped.some((d) => String(d.id) === String(selId))) {
        const prev = departments.value.find((d) => String(d.id) === String(selId));
        if (prev) mapped = [prev, ...mapped];
      }
      departments.value = mapped;
    } catch {
      departments.value = [];
    } finally {
      isLoadingDepartments.value = false;
    }
  };

  const searchRoles = async (searchTermRaw: string) => {
    if (!searchTermRaw || searchTermRaw.length < 2) {
      roleSearchPerformed.value = false;
      await fetchDefaultRoles();
      return;
    }
    isLoadingRoles.value = true;
    roleSearchPerformed.value = true;
    try {
      const response = await roleService.getRoles(`page=0&size=20&searchTerm=${encodeURIComponent(searchTermRaw)}`);
      const list = response.content || response.Content || [];
      roles.value = mapRoleRows(list);
    } catch {
      roles.value = [];
    } finally {
      isLoadingRoles.value = false;
    }
  };

  const searchDesignations = async (searchTermRaw: string) => {
    if (!formData.value.roleId) {
      designations.value = [];
      return;
    }
    const roleId = Number(formData.value.roleId);
    if (!searchTermRaw || searchTermRaw.length < 2) {
      designationSearchPerformed.value = false;
      await fetchDefaultDesignations();
      return;
    }
    isLoadingDesignations.value = true;
    designationSearchPerformed.value = true;
    try {
      const response = await designationService.getDesignations(`page=0&size=50&searchTerm=${encodeURIComponent(searchTermRaw)}`);
      const list = response.content || response.Content || [];
      const arr = Array.isArray(list) ? list : [];
      designations.value = arr.filter((d: any) => d.role?.id === roleId).map((d: any) => ({ id: d.id, name: d.name }));
    } catch {
      designations.value = [];
    } finally {
      isLoadingDesignations.value = false;
    }
  };

  watch(
    () => formData.value.roleId,
    async (newRoleId) => {
      formData.value.designationId = '';
      designations.value = [];
      designationSearchPerformed.value = false;
      if (newRoleId) {
        await fetchDefaultDesignations();
      }
    }
  );

  const searchDepartments = async (searchTermRaw: string) => {
    if (!searchTermRaw || searchTermRaw.length < 2) {
      departmentSearchPerformed.value = false;
      await fetchDefaultDepartments();
      return;
    }
    isLoadingDepartments.value = true;
    departmentSearchPerformed.value = true;
    try {
      const response = await departmentService.getDepartments(`page=0&size=20&searchTerm=${encodeURIComponent(searchTermRaw)}`);
      const list = response.content || response.Content || [];
      departments.value = mapDepartmentRows(list);
    } catch {
      departments.value = [];
    } finally {
      isLoadingDepartments.value = false;
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: {
        return validateForm(formData.value, {
          name: [rules.required(), rules.name()],
          email: [rules.required(), rules.email()],
          phone: [rules.required(), rules.phone()],
          cnic: [rules.required(), rules.cnic()],
          genderId: [rules.required('Gender is required')],
          address: [rules.required()],
        });
      }
      case 2:
        return validateForm(formData.value, {
          qualification: [rules.required()],
          specialization: [rules.required()],
          roleId: [rules.required('Employee type is required')],
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

  const submitEmployee = async () => {
    if (!validateStep(currentStep.value)) return;

    isSubmitting.value = true;
    try {
      const payload = {
        name: formData.value.name,
        email: formData.value.email,
        phoneNumber: formData.value.phone,
        cnic: formData.value.cnic,
        address: formData.value.address,
        specialization: formData.value.specialization,
        qualification: formData.value.qualification,
        gender: Number(formData.value.genderId),
        status: formData.value.status,
        specializationType: formData.value.specializationType || undefined,
        officeLocation: formData.value.officeLocation || undefined,
        emergencyContact: formData.value.emergencyPhone?.trim() || undefined,
        dateOfJoining: formData.value.dateOfJoining || undefined,
        hasMedicalLicense: formData.value.hasMedicalLicense,
        hasSurgicalCertification: formData.value.hasSurgicalCertification,
        hasSpecializedTraining: formData.value.hasSpecializedTraining,
        notes: formData.value.notes || undefined,
        department: { id: Number(formData.value.departmentId) },
        designations: [{ id: Number(formData.value.designationId) }],
      };

      const response = await employeeService.addEmployee(payload);
      if (response.isSuccess) {
        showAlert('success', 'Employee registered successfully.', 'Success');
        router.push('/employees');
      }
    } finally {
      isSubmitting.value = false;
    }
  };

  onMounted(async () => {
    await Promise.all([fetchDefaultRoles(), fetchDefaultDepartments()]);
  });
</script>

<template>
  <DefaultLayout>
    <div class="mx-auto max-w-5xl">
      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center gap-2 text-sm text-bodydark dark:text-bodydark1 mb-2">
          <BaseButton variant="ghost" @click="router.push('/employees')" class="!p-0 !bg-transparent text-bodydark hover:text-primary">Employees</BaseButton>
          <span>/</span>
          <span class="text-emphasis">Add Medical Staff</span>
        </div>
        <h1 class="text-3xl font-bold text-emphasis">Add Medical Staff</h1>
        <p class="text-bodydark dark:text-bodydark1 mt-2">Complete the form below to register a new employee</p>
      </div>

      <!-- Stepper -->
      <FormStepper :steps="steps" :current-step="currentStep" @update:current-step="currentStep = $event" />

      <!-- Form Content -->
      <div class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-8 mb-6">
        <!-- Step 1: Personal Information -->
        <div v-show="currentStep === 1" class="space-y-6">
          <div class="mb-6">
            <h3 class="text-xl font-semibold text-emphasis mb-2">Personal Information</h3>
            <p class="text-sm text-bodydark dark:text-bodydark1">Enter the employee's basic personal details</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BaseInput
              label="Full Name"
              v-model="formData.name"
              placeholder="e.g. Dr. Sarah Jenkins"
              :error="!!errors.name"
              :error-message="errors.name"
              field-required
              @change="validateField('name', formData.name, [rules.required(), rules.name()])"
            />

            <BaseInput
              label="Professional Email"
              v-model="formData.email"
              placeholder="staff@hospital.com"
              :error="!!errors.email"
              :error-message="errors.email"
              field-required
              @change="validateField('email', formData.email, [rules.required(), rules.email()])"
            />

            <BasePhoneInput
              v-model="formData.phone"
              label="Phone #"
              :error="!!errors.phone"
              :error-message="errors.phone"
              field-required
              class="md:col-span-2"
              @change="validateField('phone', formData.phone, [rules.required(), rules.phone()])"
            />

            <BaseCnicInput
              v-model="formData.cnic"
              :error="!!errors.cnic"
              :error-message="errors.cnic"
              field-required
              @change="validateField('cnic', formData.cnic, [rules.required(), rules.cnic()])"
            />

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
            <p class="text-sm text-bodydark dark:text-bodydark1">Enter the employee's qualifications and role</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <BaseSelect
              label="Employee Group"
              v-model="formData.roleId"
              :options="roles"
              placeholder="Pick a role or type to search…"
              :empty-message="roleEmptyMessage"
              :loading="isLoadingRoles"
              :error="!!errors.roleId"
              :error-message="errors.roleId"
              field-required
              @search="searchRoles"
            />

            <BaseSelect
              label="Assigned Designation"
              v-model="formData.designationId"
              :options="designations"
              :disabled="!formData.roleId"
              :placeholder="formData.roleId ? 'Pick a designation or type to search…' : 'Select employee group first'"
              :empty-message="designationEmptyMessage"
              :loading="isLoadingDesignations"
              :error="!!errors.designationId"
              :error-message="errors.designationId"
              field-required
              @search="searchDesignations"
            />

            <BaseSelect
              label="Department / Unit"
              v-model="formData.departmentId"
              :options="departments"
              placeholder="Pick a department or type to search…"
              :empty-message="departmentEmptyMessage"
              :loading="isLoadingDepartments"
              :error="!!errors.departmentId"
              :error-message="errors.departmentId"
              field-required
              class="md:col-span-2"
              @search="searchDepartments"
            />
          </div>
        </div>

        <!-- Step 3: Employment Details -->
        <div v-show="currentStep === 3" class="space-y-6">
          <div class="mb-6">
            <h3 class="text-xl font-semibold text-emphasis mb-2">Employment Details</h3>
            <p class="text-sm text-bodydark dark:text-bodydark1">Additional employment information (optional)</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BaseSelect label="Employment Status" v-model="formData.status" :options="STATUS_OPTIONS.EMPLOYEE" placeholder="Select status" field-required />

            <BaseSelect
              label="Specialization Type"
              v-model="formData.specializationType"
              :options="[
                { id: 'GeneralPractitioner', name: 'General Practitioner' },
                { id: 'Surgeon', name: 'Surgeon' },
                { id: 'Cardiologist', name: 'Cardiologist' },
                { id: 'Neurologist', name: 'Neurologist' },
                { id: 'Pediatrician', name: 'Pediatrician' },
                { id: 'Orthopedic', name: 'Orthopedic' },
                { id: 'Dermatologist', name: 'Dermatologist' },
                { id: 'Psychiatrist', name: 'Psychiatrist' },
                { id: 'Radiologist', name: 'Radiologist' },
                { id: 'Anesthesiologist', name: 'Anesthesiologist' },
                { id: 'Nurse', name: 'Nurse' },
                { id: 'Technician', name: 'Technician' },
                { id: 'Administrator', name: 'Administrator' },
                { id: 'Other', name: 'Other' },
              ]"
              placeholder="Select type"
            />

            <BaseInput label="Office Location" v-model="formData.officeLocation" placeholder="e.g. Building A, Room 201" />

            <BasePhoneInput v-model="formData.emergencyPhone" label="Emergency contact" class="md:col-span-2" />

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
          <BaseButton v-else variant="primary" :loading="isSubmitting" @click="submitEmployee">Submit</BaseButton>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
