<script setup lang="ts">
  import CalendarIcon from '@/assets/images/SVGs/CalendarIcon.svg';
  import ClockIcon from '@/assets/images/SVGs/ClockIcon.svg';
  import DocumentLinesIcon from '@/assets/images/SVGs/DocumentLinesIcon.svg';
  import BillingIcon from '@/assets/images/SVGs/Billing.svg';
  import EditPencilIcon from '@/assets/images/SVGs/EditPencilIcon.svg';
  import DotsHorizontalIcon from '@/assets/images/SVGs/DotsHorizontalIcon.svg';
  import ClipboardIcon from '@/assets/images/SVGs/ClipboardIcon.svg';
  import TrashDetailedIcon from '@/assets/images/SVGs/TrashDetailedIcon.svg';
  import KeyIcon from '@/assets/images/SVGs/KeyIcon.svg';
  import PhoneIcon from '@/assets/images/SVGs/PhoneIcon.svg';
  import UserIcon from '@/assets/images/SVGs/UserIcon.svg';

  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import PatientMedicalHistory from '@/components/Patient/PatientMedicalHistory.vue';
  import PatientAppointments from '@/components/Patient/PatientAppointments.vue';
  import PatientBills from '@/components/Patient/PatientBills.vue';
  import PatientHistoryModal from '@/components/PatientHistory/PatientHistoryModal.vue';
  import PatientHistoryServices from '@/services/PatientHistory/PatientHistory.services';
  import PatientsServices from '@/services/Patient/patient.services';
  import type { IPatient } from '@/services/Patient/patient.interface';
  import useAlert from '@/plugins/alert/useAlert';
  import { useConfirm } from '@/composables/useConfirm';
  import { usePermissions } from '@/composables/usePermissions';
  import { useCnicConfig } from '@/composables/useCnicConfig';

  const route = useRoute();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { confirm } = useConfirm();
  const { canDeleteFromModule } = usePermissions();
  const { cnicConfig, loadCnicConfig } = useCnicConfig();
  const patientService = new PatientsServices();
  const patientHistoryService = new PatientHistoryServices();
  const canDelete = computed(() => canDeleteFromModule('Patients'));
  const showHistoryModal = ref(false);
  const medicalHistoryKey = ref(0);

  const pageTitle = ref('Patient Profile');
  const currentTab = ref('about');
  const loading = ref(true);
  const patientId = ref('');

  const patientDetails = ref<IPatient>({
    id: 0,
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    age: 0,
    phone: '',
    cnic: '',
    gender: '',
    address: '',
    nationality: '',
    passportNumber: '',
    guardianCNIC: '',
  });

  const fullName = computed(() => {
    return `${patientDetails.value.firstName} ${patientDetails.value.lastName}`.trim();
  });

  const formattedDateOfBirth = computed(() => {
    if (!patientDetails.value.dateOfBirth) return 'N/A';
    const date = new Date(patientDetails.value.dateOfBirth);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  });

  const genderIcon = computed(() => {
    return patientDetails.value.gender === 'Male' ? '♂' : patientDetails.value.gender === 'Female' ? '♀' : '⚥';
  });

  const loadPatientDetails = async () => {
    loading.value = true;
    try {
      patientId.value = route.params.id.toString();
      const response = await patientService.getPatientById(patientId.value);
      if (response?.data) {
        const data = response.data;
        patientDetails.value = {
          id: data.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          dateOfBirth: data.dateOfBirth || '',
          age: data.age || 0,
          phone: data.phone || '',
          cnic: data.cnic || '',
          gender: typeof data.gender === 'number' ? (data.gender === 0 ? 'Male' : data.gender === 1 ? 'Female' : 'Other') : data.gender || '',
          address: data.address || '',
          nationality: data.nationality || '',
          passportNumber: data.passportNumber || '',
          guardianCNIC: data.guardianCNIC || '',
        };
      }
    } catch (error) {
      console.error('Error loading patient details:', error);
    } finally {
      loading.value = false;
    }
  };

  const handleEdit = () => {
    router.push(`/patients/edit/${patientId.value}`);
  };

  const handleBack = () => {
    router.push('/patients');
  };

  const handleDelete = async () => {
    if (!canDelete.value) {
      showAlert('error', 'You do not have permission to delete patients.', 'Permission Denied');
      return;
    }
    const confirmed = await confirm({
      title: 'Delete Patient',
      message: `Are you sure you want to delete ${fullName.value}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      try {
        const response = await patientService.deletePatient(patientId.value);
        if (response?.isSuccess) {
          showAlert('success', 'Patient has been deleted successfully.', 'Success');
          router.push('/patients');
        } else {
          showAlert('error', response?.error || 'Failed to delete patient.', 'Error');
        }
      } catch {
        showAlert('error', 'An error occurred while deleting the patient.', 'Error');
      }
    }
  };

  const handleAddMedicalHistory = () => {
    showHistoryModal.value = true;
  };

  const saveHistory = async (payload: any) => {
    const response = await patientHistoryService.addPatientHistory(payload);
    showHistoryModal.value = false;
    if (response?.isSuccess) {
      medicalHistoryKey.value++;
    }
  };

  const handleAddPatientBill = () => {
    router.push({ path: '/patient-bills/add', query: { patientId: patientId.value } });
  };

  const handleAddAppointment = () => {
    router.push({ path: '/appointments/add', query: { patientId: patientId.value } });
  };

  onMounted(async () => {
    await loadCnicConfig();
    loadPatientDetails();
  });
</script>

<template>
  <DefaultLayout>
    <PatientHistoryModal :show="showHistoryModal" :patient-id="patientId" @close="showHistoryModal = false" @save="saveHistory" />
    <BreadcrumbDefault :pageTitle="pageTitle" />

    <!-- Loading State -->
    <div v-if="loading" class="animate-pulse space-y-6 mt-6">
      <div class="bg-surface rounded-2xl p-6">
        <div class="flex items-center gap-6">
          <div class="w-32 h-32 bg-elevated rounded-full"></div>
          <div class="flex-1 space-y-4">
            <div class="h-8 bg-elevated rounded w-1/3"></div>
            <div class="h-4 bg-elevated rounded w-1/4"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Patient Profile Content -->
    <div v-else class="space-y-6 mt-6">
      <!-- Header Card -->
      <div class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark overflow-hidden">
        <!-- Cover Background -->
        <div class="h-32 bg-gradient-to-r from-primary to-primary"></div>

        <!-- Profile Info -->
        <div class="px-6 pb-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16">
            <!-- Avatar -->
            <div class="relative">
              <div class="w-32 h-32 rounded-full border-4 border-white dark:border-boxdark bg-gradient-to-br from-primary to-primary flex items-center justify-center shadow-lg">
                <span class="text-5xl font-bold text-light">{{ patientDetails.firstName.charAt(0) }}{{ patientDetails.lastName.charAt(0) }}</span>
              </div>
              <div class="absolute bottom-2 right-2 w-4 h-4 bg-success rounded-full border-2 border-white dark:border-boxdark"></div>
            </div>

            <!-- Name and Actions -->
            <div class="flex-1 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4">
              <div>
                <h1 class="text-3xl font-bold text-emphasis mb-1">{{ fullName }}</h1>
                <div class="flex items-center gap-4 text-sm text-bodydark dark:text-bodydark1">
                  <span class="flex items-center gap-1">
                    <UserIcon class="w-4 h-4" />
                    Patient ID: #{{ patientDetails.id }}
                  </span>
                  <span class="flex items-center gap-1">
                    <ClockIcon class="w-4 h-4" />
                    {{ patientDetails.age }} years old
                  </span>
                  <span class="flex items-center gap-1 text-lg">{{ genderIcon }} {{ patientDetails.gender }}</span>
                </div>
              </div>

              <div class="flex gap-3">
                <BaseButton variant="outline" size="md" @click="handleBack" class="border-2 border-stroke dark:border-strokedark text-emphasis hover:border-primary dark:hover:border-primary">
                  <KeyIcon class="w-4 h-4 mr-2" />
                  Back
                </BaseButton>
                <BaseButton v-if="canDelete" variant="danger" size="md" @click="handleDelete" class="!bg-danger !text-light hover:!bg-danger/90 border-2 border-danger">
                  <TrashDetailedIcon class="w-4 h-4 mr-2" />
                  Delete
                </BaseButton>
                <BaseButton variant="primary" size="md" @click="handleEdit" class="!bg-primary !text-light hover:!bg-primary-light dark:!bg-primary dark:!text-light dark:hover:!bg-primary-light">
                  <EditPencilIcon class="w-4 h-4 mr-2" />
                  Edit Profile
                </BaseButton>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="mt-6 border-b border-stroke dark:border-strokedark">
            <nav class="flex gap-8">
              <BaseButton
                variant="ghost"
                @click="currentTab = 'about'"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors',
                  currentTab === 'about' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">
                  <UserIcon class="w-5 h-5" />
                  About
                </div>
              </BaseButton>
              <BaseButton
                variant="ghost"
                @click="currentTab = 'medical'"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors',
                  currentTab === 'medical' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">
                  <DocumentLinesIcon class="w-5 h-5" />
                  Medical History
                </div>
              </BaseButton>
              <BaseButton
                variant="ghost"
                @click="currentTab = 'appointments'"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors',
                  currentTab === 'appointments' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">
                  <CalendarIcon class="w-5 h-5" />
                  Appointments
                </div>
              </BaseButton>
              <BaseButton
                variant="ghost"
                @click="currentTab = 'bills'"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors',
                  currentTab === 'bills' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">
                  <BillingIcon class="w-5 h-5" />
                  Patient Bills
                </div>
              </BaseButton>
            </nav>
          </div>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- About Tab -->
        <template v-if="currentTab === 'about'">
          <!-- Personal Information -->
          <div class="lg:col-span-2 bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-6">
            <h2 class="text-xl font-semibold text-emphasis mb-6 flex items-center gap-2">
              <DotsHorizontalIcon class="w-6 h-6 text-primary" />
              Personal Information
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-1">
                <label class="text-sm text-bodydark dark:text-bodydark1">First Name</label>
                <p class="text-base font-medium text-emphasis">{{ patientDetails.firstName || 'N/A' }}</p>
              </div>

              <div class="space-y-1">
                <label class="text-sm text-bodydark dark:text-bodydark1">Last Name</label>
                <p class="text-base font-medium text-emphasis">{{ patientDetails.lastName || 'N/A' }}</p>
              </div>

              <div class="space-y-1">
                <label class="text-sm text-bodydark dark:text-bodydark1">Date of Birth</label>
                <p class="text-base font-medium text-emphasis">{{ formattedDateOfBirth }}</p>
              </div>

              <div class="space-y-1">
                <label class="text-sm text-bodydark dark:text-bodydark1">Age</label>
                <p class="text-base font-medium text-emphasis">{{ patientDetails.age }} years</p>
              </div>

              <div class="space-y-1">
                <label class="text-sm text-bodydark dark:text-bodydark1">Gender</label>
                <p class="text-base font-medium text-emphasis">{{ genderIcon }} {{ patientDetails.gender }}</p>
              </div>

              <div class="space-y-1">
                <label class="text-sm text-bodydark dark:text-bodydark1">Nationality</label>
                <p class="text-base font-medium text-emphasis">{{ patientDetails.nationality || 'N/A' }}</p>
              </div>

              <div class="space-y-1 md:col-span-2">
                <label class="text-sm text-bodydark dark:text-bodydark1">Address</label>
                <p class="text-base font-medium text-emphasis">{{ patientDetails.address || 'N/A' }}</p>
              </div>
            </div>
          </div>

          <!-- Contact & Identity -->
          <div class="space-y-6">
            <!-- Contact Information -->
            <div class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-6">
              <h3 class="text-lg font-semibold text-emphasis mb-4 flex items-center gap-2">
                <PhoneIcon class="w-5 h-5 text-primary" />
                Contact
              </h3>

              <div class="space-y-4">
                <div class="flex items-center gap-3 p-3 bg-elevated rounded-lg border border-transparent dark:border-strokedark/50">
                  <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <PhoneIcon class="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p class="text-xs text-bodydark dark:text-bodydark1">Phone</p>
                    <p class="text-sm font-medium text-emphasis">{{ patientDetails.phone || 'N/A' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Identity Documents -->
            <div class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-6">
              <h3 class="text-lg font-semibold text-emphasis mb-4 flex items-center gap-2">
                <ClipboardIcon class="w-5 h-5 text-primary" />
                Identity
              </h3>

              <div class="space-y-3">
                <div>
                  <label class="text-xs text-bodydark dark:text-bodydark1">{{ cnicConfig.fieldName }}</label>
                  <p class="text-sm font-mono font-medium text-emphasis bg-elevated px-3 py-2 rounded-lg mt-1 border border-elevated">
                    {{ patientDetails.cnic || 'N/A' }}
                  </p>
                </div>

                <div v-if="patientDetails.passportNumber">
                  <label class="text-xs text-bodydark dark:text-bodydark1">Passport Number</label>
                  <p class="text-sm font-mono font-medium text-emphasis bg-elevated px-3 py-2 rounded-lg mt-1 border border-elevated">
                    {{ patientDetails.passportNumber }}
                  </p>
                </div>

                <div v-if="patientDetails.guardianCNIC">
                  <label class="text-xs text-bodydark dark:text-bodydark1">Guardian {{ cnicConfig.fieldName }}</label>
                  <p class="text-sm font-mono font-medium text-emphasis bg-elevated px-3 py-2 rounded-lg mt-1 border border-elevated">
                    {{ patientDetails.guardianCNIC }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Medical History Tab -->
        <div v-if="currentTab === 'medical'" class="lg:col-span-3">
          <div class="flex justify-end mb-4">
            <BaseButton variant="primary" size="sm" @click="handleAddMedicalHistory">Add New</BaseButton>
          </div>
          <PatientMedicalHistory :key="medicalHistoryKey" :patientId="patientDetails.id" />
        </div>

        <!-- Appointments Tab -->
        <div v-if="currentTab === 'appointments'" class="lg:col-span-3">
          <div class="flex justify-end mb-4">
            <BaseButton variant="primary" size="sm" @click="handleAddAppointment">Add New</BaseButton>
          </div>
          <PatientAppointments :patientId="patientDetails.id" />
        </div>

        <!-- Patient Bills Tab -->
        <div v-if="currentTab === 'bills'" class="lg:col-span-3">
          <PatientBills :patientId="patientDetails.id" @add-new="handleAddPatientBill" />
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
