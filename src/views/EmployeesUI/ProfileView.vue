<script setup lang="ts">
  import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import { onMounted, ref } from 'vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseSelectNative from '@/components/Base/BaseSelectNative.vue';
  import BaseCard from '@/components/Base/BaseCard.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import useAlert from '@/plugins/alert/useAlert';
  import { useConfirm } from '@/composables/useConfirm';

  import { useRoute } from 'vue-router';
  import EmployeeServices from '@/services/Employee/Employee.services';
  import EmployeeDesignationServices from '@/services/EmployeeDesignation/EmployeeDesignation.services';
  import DesignationServices from '@/services/Designation/Designation.services';
  import type { IEmployeeDesignation } from '@/services/EmployeeDesignation/EmployeeDesignation.dto';
  import PreviousPageIcon from '@/assets/images/SVGs/Chevron-left.svg';
  import AboutIcon from '@/assets/images/SVGs/About.svg';
  import AppointmentIcon from '@/assets/images/SVGs/Appointment.svg';
  import BillingIcon from '@/assets/images/SVGs/Billing.svg';
  import MailIcon from '@/assets/images/SVGs/EmailIcon.svg';
  import CallIcon from '@/assets/images/SVGs/CallIcon.svg';
  import CnicIcon from '@/assets/images/SVGs/CNIC.svg';
  import EducationIcon from '@/assets/images/SVGs/Education.svg';
  import SpecializationIcon from '@/assets/images/SVGs/Medal.svg';
  import DepartmentIcon from '@/assets/images/SVGs/Department.svg';
  import GenderIcon from '@/assets/images/SVGs/Gender.svg';
  import LocationIcon from '@/assets/images/SVGs/Location.svg';
  import KebabIcon from '@/assets/images/SVGs/KebabIcon.svg';
  import router from '@/router';

  const readParamsId = useRoute();
  const currentTab = ref('About');
  const employeeId = ref('');
  const showMenu = ref(false);
  const menuRef = ref<HTMLElement | null>(null);
  const kebabRef = ref<HTMLElement | null>(null);
  const employeeService = new EmployeeServices();
  const employeeDesignationService = new EmployeeDesignationServices();
  const designationService = new DesignationServices();
  const { showAlert } = useAlert();
  const { confirm } = useConfirm();

  const employeeDetails = ref({
    name: '',
    email: '',
    phoneNumber: '',
    cnic: '',
    password: '',
    address: '',
    qualification: '',
    specialization: '',
    genderId: 100,
    gender: '',
    departmentId: '',
    department: '',
    designtionId: '',
    designation: '',
  });

  const employeeDesignations = ref<IEmployeeDesignation[]>([]);
  const availableDesignations = ref<any[]>([]);
  const selectedDesignationId = ref(0);
  const isAddingDesignation = ref(false);

  const toggleMenu = () => {
    showMenu.value = !showMenu.value;
  };

  const handleClickOutside = (event: MouseEvent) => {
    const menu = menuRef.value;
    const button = kebabRef.value;
    if (menu && !menu.contains(event.target as Node) && button && !button.contains(event.target as Node)) {
      showMenu.value = false;
    }
  };

  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });

  const setTab = (tab: string) => {
    currentTab.value = tab;
  };

  const getGenderLabel = (genderId: number) => {
    if (genderId === 0) {
      return 'Male';
    } else if (genderId === 1) {
      return 'Female';
    } else {
      return 'Other';
    }
  };

  const loadEmployeeDesignations = async () => {
    try {
      const response = await employeeDesignationService.getEmployeeDesignationsByEmployeeId(Number(employeeId.value));
      employeeDesignations.value = response.data || [];
    } catch {
      console.error('Error loading employee designations');
    }
  };

  const loadAvailableDesignations = async () => {
    try {
      const response = await designationService.getDesignations();
      availableDesignations.value = response.data.map((d: any) => ({
        id: d.id,
        name: d.name,
      }));
    } catch {
      console.error('Error loading designations');
    }
  };

  const addDesignation = async () => {
    if (!selectedDesignationId.value) {
      showAlert('warning', 'Please select a designation', 'Warning');
      return;
    }

    isAddingDesignation.value = true;
    try {
      const response = await employeeDesignationService.addEmployeeDesignation({
        employeeId: Number(employeeId.value),
        designationId: selectedDesignationId.value,
      });
      if (response.isSuccess) {
        showAlert('success', 'Designation added successfully', 'Success');
        selectedDesignationId.value = 0;
        await loadEmployeeDesignations();
      }
    } catch {
      showAlert('error', 'Failed to add designation', 'Error');
    } finally {
      isAddingDesignation.value = false;
    }
  };

  const removeDesignation = async (designation: IEmployeeDesignation) => {
    const confirmed = await confirm({
      title: 'Remove Designation',
      message: `Are you sure you want to remove "${designation.designation?.name}" from this employee?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      const response = await employeeDesignationService.deleteEmployeeDesignation(designation.id);
      if (response.isSuccess) {
        showAlert('success', 'Designation removed successfully', 'Success');
        await loadEmployeeDesignations();
      }
    } catch {
      showAlert('error', 'Failed to remove designation', 'Error');
    }
  };

  onMounted(async () => {
    employeeId.value = readParamsId.params.id.toString();
    const response = await employeeService.getEmployeesById(employeeId.value);
    employeeDetails.value.name = response.data.name;
    employeeDetails.value.email = response.data.email;
    employeeDetails.value.phoneNumber = response.data.phoneNumber;
    employeeDetails.value.cnic = response.data.cnic;
    employeeDetails.value.password = response.data.password;
    employeeDetails.value.address = response.data.address;
    employeeDetails.value.qualification = response.data.qualification;
    const spec = response.data.specialization?.trim();
    employeeDetails.value.specialization = spec && spec.toLowerCase() !== 'general' ? spec : response.data.designations?.[0]?.name || spec || 'N/A';
    employeeDetails.value.gender = getGenderLabel(response.data.gender);
    employeeDetails.value.department = response.data.department?.name || 'No Department';
    employeeDetails.value.designation = response.data.designations?.[0]?.name || 'Not Assigned';

    await loadEmployeeDesignations();
    await loadAvailableDesignations();
  });
  const pageTitle = ref('Employee Profile');
</script>

<template>
  <DefaultLayout>
    <div class="mx-auto max-w-full">
      <!-- Breadcrumb Start -->
      <BreadcrumbDefault :pageTitle="pageTitle" />
      <!-- Breadcrumb End -->

      <div class="flex flex-col lg:flex-row h-auto lg:h-screen bg-elevated">
        <!-- Left Section: Employee Card -->
        <div class="p-4 w-full lg:w-[400px]">
          <div class="bg-surface shadow-md rounded-lg p-6 w-full">
            <!-- Header row (back + kebab menu) -->
            <div class="flex justify-between items-center relative">
              <BaseButton variant="ghost" size="sm" rounded="full" @click="router.back()" class="!p-2">
                <PreviousPageIcon />
              </BaseButton>
              <BaseButton variant="ghost" size="sm" rounded="full" @click="toggleMenu()" class="!p-2" ref="kebabRef">
                <KebabIcon />
              </BaseButton>
              <!-- Dropdown Menu -->
              <div v-if="showMenu" ref="menuRef" class="absolute right-0 z-10 mt-10 w-40 rounded-md bg-white dark:bg-gray-800 border border-stroke">
                <BaseButton
                  variant="ghost"
                  @click="router.push(`/employees/edit/${employeeId}`)"
                  class="!block w-full px-4 py-2 !text-sm text-gray-muted font-bold hover:text-blue dark:text-gray-muted-dark hover:bg-gray-100 dark:hover:text-blue-hover !text-left !justify-start"
                >
                  Edit
                </BaseButton>
              </div>
            </div>

            <!-- Image and Info -->
            <img src="@/assets/images/user/user-06.png" alt="Employee's Image" class="rounded-full mx-auto my-4 w-24 h-24 lg:w-32 lg:h-32 object-cover" />
            <h2 class="text-xl font-semibold text-center text-gray-800">{{ employeeDetails.name }}</h2>
            <p class="text-center text-gray-600">{{ employeeDetails.designation }}</p>

            <hr class="my-4 border-t border-gray-border" />

            <!-- Info Fields -->
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <MailIcon class="fill-current w-5 h-5 text-blue dark:text-white" />
                {{ employeeDetails.email }}
              </div>
              <div class="flex items-center gap-2">
                <CallIcon class="fill-current w-5 h-5 text-blue dark:text-white" />
                {{ employeeDetails.phoneNumber }}
              </div>
              <div class="flex items-center gap-2">
                <CnicIcon class="fill-current w-5 h-5 text-blue dark:text-white" />
                {{ employeeDetails.cnic }}
              </div>
              <hr class="my-4 border-t border-gray-border" />
              <div class="flex items-center gap-2">
                <EducationIcon class="fill-current w-5 h-5 text-blue dark:text-white" />
                {{ employeeDetails.qualification }}
              </div>
              <div class="flex items-center gap-2">
                <SpecializationIcon class="fill-current w-5 h-5 text-blue dark:text-white" />
                {{ employeeDetails.specialization }}
              </div>
              <div class="flex items-center gap-2">
                <DepartmentIcon class="fill-current w-5 h-5 text-blue dark:text-white" />
                {{ employeeDetails.department }}
              </div>
              <div class="flex items-center gap-2">
                <GenderIcon class="fill-current w-5 h-5 text-blue dark:text-white" />
                {{ employeeDetails.gender }}
              </div>
              <div class="flex items-center gap-2">
                <LocationIcon class="fill-current w-5 h-5 text-blue dark:text-white" />
                {{ employeeDetails.address }}
              </div>
            </div>
          </div>
        </div>

        <!-- Right Section: Tabs and Content -->
        <div class="flex-1 p-4">
          <div class="bg-surface shadow-md rounded-lg">
            <!-- Responsive Tabs -->
            <div class="sm:hidden p-4">
              <BaseSelectNative
                v-model="currentTab"
                :options="[
                  { value: 'About', label: 'About' },
                  { value: 'Designations', label: 'Designations' },
                  { value: 'Appointment', label: 'Appointment' },
                  { value: 'Setting', label: 'Setting' },
                ]"
              />
            </div>

            <div class="hidden sm:block border-b border-gray-200 px-6 pt-6">
              <nav class="flex space-x-6">
                <a href="#" :class="{ 'border-b-2 border-blue text-blue': currentTab === 'About' }" @click.prevent="setTab('About')">
                  <div class="flex items-center gap-2">
                    <AboutIcon />
                    About
                  </div>
                </a>
                <a href="#" :class="{ 'border-b-2 border-blue text-blue': currentTab === 'Designations' }" @click.prevent="setTab('Designations')">
                  <div class="flex items-center gap-2">
                    <SpecializationIcon />
                    Designations
                  </div>
                </a>
                <a href="#" :class="{ 'border-b-2 border-blue text-blue': currentTab === 'Appointment' }" @click.prevent="setTab('Appointment')">
                  <div class="flex items-center gap-2">
                    <AppointmentIcon />
                    Appointment
                  </div>
                </a>
                <a href="#" :class="{ 'border-b-2 border-blue text-blue': currentTab === 'Setting' }" @click.prevent="setTab('Setting')">
                  <div class="flex items-center gap-2">
                    <BillingIcon />
                    Setting
                  </div>
                </a>
              </nav>
            </div>

            <!-- Content Area -->
            <div class="min-h-[300px] sm:h-[530px] w-[100] p-6">
              <div v-if="currentTab === 'About'" class="flex items-center justify-center text-center h-full">
                <h2 class="text-xl font-bold">About Details</h2>
              </div>

              <div v-else-if="currentTab === 'Designations'" class="space-y-6">
                <BaseCard>
                  <template #header>
                    <h3 class="text-lg font-semibold text-emphasis">Manage Designations</h3>
                  </template>

                  <div class="space-y-4">
                    <div class="flex gap-4 items-end">
                      <div class="flex-1">
                        <BaseSelect label="Add Designation" v-model="selectedDesignationId" :options="availableDesignations" placeholder="Select a designation" />
                      </div>
                      <BaseButton @click="addDesignation" :disabled="isAddingDesignation || !selectedDesignationId" variant="primary">
                        {{ isAddingDesignation ? 'Adding...' : 'Add' }}
                      </BaseButton>
                    </div>

                    <div v-if="employeeDesignations.length === 0" class="text-center py-8 text-gray-500">No designations assigned yet</div>

                    <div v-else class="space-y-2">
                      <div v-for="designation in employeeDesignations" :key="designation.id" class="flex items-center justify-between p-4 bg-gray-50 dark:bg-meta-4 rounded-lg">
                        <div class="flex items-center gap-3">
                          <SpecializationIcon class="w-5 h-5 text-blue" />
                          <span class="font-medium text-emphasis">{{ designation.designation?.name }}</span>
                        </div>
                        <BaseButton @click="removeDesignation(designation)" variant="ghost" size="sm" class="text-red-600 hover:text-red-700">Remove</BaseButton>
                      </div>
                    </div>
                  </div>
                </BaseCard>
              </div>

              <div v-else-if="currentTab === 'Appointment'" class="flex items-center justify-center text-center h-full">
                <h2 class="text-xl font-bold">Appointments</h2>
              </div>

              <div v-else-if="currentTab === 'Setting'" class="flex items-center justify-center text-center h-full">
                <h2 class="text-xl font-bold">Setting</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<style scoped>
  .nav-container {
    display: flex;
    gap: 20px;
    justify-content: flex-start;
    align-items: center;
  }

  .nav-link {
    text-decoration: none;
    font-size: 14px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .icon {
    width: 28px;
    height: 28px;
  }

  .nav-text {
    font-size: 20px;
  }

  .nav-container {
    display: flex;
    gap: 1rem;
  }

  .nav-link {
    padding: 0.5rem 1rem;
    text-decoration: none;
    /* Gray color */
    border-radius: 0.375rem;
    background-color: transparent;
    transition: all 0.3s ease;
  }

  .nav-link.active {
    color: var(--color-primary);
    border-bottom: 2px solid var(--color-primary);
    border-radius: 0;
  }
</style>
