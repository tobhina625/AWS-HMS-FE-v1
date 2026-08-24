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

  import { ref, onMounted, computed, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import PatientMedicalHistory from '@/components/Patient/PatientMedicalHistory.vue';
  import PatientAppointments from '@/components/Patient/PatientAppointments.vue';
  import PatientBills from '@/components/Patient/PatientBills.vue';
  import PatientServicesTab from '@/components/Patient/PatientServicesTab.vue';
  import PatientHistoryModal from '@/components/PatientHistory/PatientHistoryModal.vue';
  import PatientHistoryServices from '@/services/PatientHistory/PatientHistory.services';
  import PatientsServices from '@/services/Patient/patient.services';
  import PatientAllergyService from '@/services/PatientAllergy/PatientAllergy.services';
  import PatientDiagnosisService from '@/services/PatientDiagnosis/PatientDiagnosis.services';
  import PrescriptionService from '@/services/Prescription/Prescription.services';
  import PatientLabsService from '@/services/PatientLabs/PatientLabs.services';
  import type { IPatientLabs } from '@/services/PatientLabs/PatientLabs.interface';
  import { useLabReport } from '@/composables/useLabReport';
  import DownloadIcon from '@/assets/images/SVGs/DownloadIcon.svg';
  import type { IPatient } from '@/services/Patient/patient.interface';
  import useAlert from '@/plugins/alert/useAlert';
  import { useConfirm } from '@/composables/useConfirm';
  import { usePermissions } from '@/composables/usePermissions';
  import { useCnicConfig } from '@/composables/useCnicConfig';
  import AdmissionServices from '@/services/Admission/Admission.services';
  import PatientBillsService from '@/services/PatientBill/Patientbill.services';
  import PatientSurgeryServices from '@/services/PatientSurgery/PatientSurgery.services';
  import TreatmentServices from '@/services/Treatment/Treatment.services';
  import PaymentModal from '@/components/Patient/PaymentModal.vue';
  import { useAdmissionInvoicePdf } from '@/composables/useAdmissionInvoicePdf';
  import { useDischargeSummaryPdf } from '@/composables/useDischargeSummaryPdf';
  import { STATUS_OPTIONS } from '@/constants/statusOptions';
  const route = useRoute();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { confirm } = useConfirm();
  const { canDeleteFromModule } = usePermissions();
  const { cnicConfig, loadCnicConfig } = useCnicConfig();
  const patientService = new PatientsServices();
  const patientHistoryService = new PatientHistoryServices();
  const allergyService = new PatientAllergyService();
  const diagnosisService = new PatientDiagnosisService();
  const prescriptionService = new PrescriptionService();
  const labService = new PatientLabsService();
  const admissionService = new AdmissionServices();
  const patientBillService = new PatientBillsService();
  const surgeryService = new PatientSurgeryServices();
  const treatmentService = new TreatmentServices();
  const { downloadPdfReport } = useLabReport();
  const { downloadAdmissionInvoicePdf } = useAdmissionInvoicePdf();
  const { downloadDischargeSummaryPdf } = useDischargeSummaryPdf();

  const canDelete = computed(() => canDeleteFromModule('Patients'));
  const showHistoryModal = ref(false);
  const medicalHistoryKey = ref(0);
  const showAddDiagnosisModal = ref(false);
  const savingDiagnosis = ref(false);
  const newDiagnosisForm = ref({
    diseaseName: '',
    diagnosisType: 'Primary',
    status: 'Active',
    notes: '',
  });

  // Clinical summary data
  const allergies = ref<any[]>([]);
  const recentEncounters = ref<any[]>([]);
  const diagnoses = ref<any[]>([]);
  const prescriptions = ref<any[]>([]);
  const patientLabs = ref<IPatientLabs[]>([]);
  const clinicalLoading = ref(false);

  // Admissions & Consolidated Invoices data
  const patientAdmissions = ref<any[]>([]);
  const admissionsLoading = ref(false);
  const showPayModal = ref(false);
  const billToPay = ref<any>(null);
  const downloadingInvoiceId = ref<number | null>(null);
  const downloadingSummaryId = ref<number | null>(null);

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
    emailAddress: '',
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
          emailAddress: data.emailAddress || '',
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

  const saveNewDiagnosis = async () => {
    if (!newDiagnosisForm.value.diseaseName.trim()) {
      showAlert('error', 'Please enter a disease / condition name.', 'Missing field');
      return;
    }
    savingDiagnosis.value = true;
    try {
      await diagnosisService.create({
        patientId: patientDetails.value.id,
        diseaseName: newDiagnosisForm.value.diseaseName,
        diagnosisType: newDiagnosisForm.value.diagnosisType,
        status: newDiagnosisForm.value.status,
        notes: newDiagnosisForm.value.notes,
      });
      showAlert('success', 'Diagnosis added successfully.', 'Success');
      showAddDiagnosisModal.value = false;
      newDiagnosisForm.value = { diseaseName: '', diagnosisType: 'Primary', status: 'Active', notes: '' };
      if (patientDetails.value.id) loadClinicalData(patientDetails.value.id);
    } catch {
      showAlert('error', 'An error occurred while adding the diagnosis.', 'Error');
    } finally {
      savingDiagnosis.value = false;
    }
  };

  // Accept either a plain array or a wrapper object ({ data | content | items }) so a
  // single rejected / malformed request can never silently blank a tab.
  const normalizeList = (value: any): any[] => {
    if (Array.isArray(value)) return value;
    if (value && Array.isArray(value.data)) return value.data;
    if (value && Array.isArray(value.content)) return value.content;
    if (value && Array.isArray(value.items)) return value.items;
    return [];
  };

  const loadClinicalData = async (id: number) => {
    clinicalLoading.value = true;
    try {
      const [allergyRes, diagnosisRes, rxRes, labRes, encounterRes] = await Promise.allSettled([
        allergyService.getByPatientId(id),
        diagnosisService.getByPatientId(id),
        prescriptionService.getByPatientId(id),
        labService.getByPatientId(id),
        patientHistoryService.getPatientHistoryByPatientId(id, 0, 100),
      ]);
      allergies.value = allergyRes.status === 'fulfilled' ? normalizeList(allergyRes.value) : [];
      diagnoses.value = diagnosisRes.status === 'fulfilled' ? normalizeList(diagnosisRes.value) : [];
      prescriptions.value = rxRes.status === 'fulfilled' ? normalizeList(rxRes.value) : [];
      patientLabs.value = labRes.status === 'fulfilled' ? normalizeList(labRes.value) : [];
      const encData = encounterRes.status === 'fulfilled' ? encounterRes.value : null;
      recentEncounters.value = normalizeList(encData?.content ?? encData);
    } catch {
      // silently fail — clinical data is supplementary
    } finally {
      clinicalLoading.value = false;
    }
  };

  const navigateToEncounter = (encounterId: number) => {
    router.push(`/encounters/${encounterId}`);
  };

  const navigateToAllergies = () => {
    router.push({ path: '/patient-allergies', query: { patientId: patientId.value } });
  };

  const navigateToLabOrders = () => {
    router.push({ path: '/lab-orders', query: { patientId: patientId.value } });
  };

  const loadPatientAdmissions = async (pid: number) => {
    admissionsLoading.value = true;
    try {
      const res = await admissionService.getAdmissionsByPatientId(pid);
      const list = res?.data || res?.Data || (Array.isArray(res) ? res : []);
      const admList = Array.isArray(list) ? list : [];

      for (const adm of admList) {
        try {
          const bRes: any = await patientBillService.getPatientBillsByAdmissionId(adm.id, 0, 100);
          const bContent = bRes?.content || bRes?.Content || bRes?.data || [];
          const bills = Array.isArray(bContent) ? bContent : [];
          adm.bills = bills;
          adm.totalCharged = bills.reduce((s: number, b: any) => s + (b.totalAmount || 0), 0);
          adm.totalPaid = bills.reduce((s: number, b: any) => s + (b.isPaid ? b.totalAmount : b.paidAmount || 0), 0);
          adm.remainingBalance = Math.max(0, adm.totalCharged - adm.totalPaid);
          adm.isFullyPaid = adm.remainingBalance <= 0 && bills.length > 0;
        } catch {
          adm.bills = [];
          adm.totalCharged = adm.totalChargesPayable || 0;
          adm.totalPaid = 0;
          adm.remainingBalance = adm.totalCharged;
          adm.isFullyPaid = false;
        }
      }
      patientAdmissions.value = admList.sort((a, b) => b.id - a.id);
    } catch (err) {
      console.error('Error loading patient admissions:', err);
      patientAdmissions.value = [];
    } finally {
      admissionsLoading.value = false;
    }
  };

  const handleOpenAdmissionPayment = (admission: any) => {
    const unpaidBill = admission.bills?.find((b: any) => !b.isPaid) || admission.bills?.[0];
    if (!unpaidBill) return;
    billToPay.value = {
      id: unpaidBill.id,
      remainingBalance: unpaidBill.remainingBalance ?? unpaidBill.totalAmount - (unpaidBill.paidAmount || 0),
      patient: patientDetails.value,
    };
    showPayModal.value = true;
  };

  const handleAdmissionPaymentSuccess = async () => {
    if (patientDetails.value.id) {
      await loadPatientAdmissions(patientDetails.value.id);
    }
  };

  const handleDownloadAdmissionInvoice = async (admission: any) => {
    downloadingInvoiceId.value = admission.id;
    try {
      const formattedAdmission = {
        ...admission,
        patient: patientDetails.value,
      };
      await downloadAdmissionInvoicePdf(formattedAdmission, admission.bills || []);
      showAlert('success', 'Admission invoice PDF downloaded successfully', 'Success');
    } catch {
      showAlert('error', 'Failed to download admission invoice PDF', 'Error');
    } finally {
      downloadingInvoiceId.value = null;
    }
  };

  const handleDownloadAdmissionSummary = async (admission: any) => {
    downloadingSummaryId.value = admission.id;
    try {
      const [labsResp, surgResp, treatResp] = await Promise.all([
        labService.getByPatientId(patientDetails.value.id),
        surgeryService.getPatientSurgeriesByAdmissionId(admission.id, 0, 100),
        treatmentService.getTreatmentsByAdmissionId(admission.id, 0, 100),
      ]);

      const labs = Array.isArray(labsResp) ? labsResp : labsResp?.data || labsResp?.content || [];
      const surgs = Array.isArray(surgResp?.content) ? surgResp.content : Array.isArray(surgResp?.data) ? surgResp.data : [];
      const treats = Array.isArray(treatResp?.content) ? treatResp.content : [];

      for (const t of treats) {
        try {
          const dResp: any = await treatmentService.getTreatmentDetails(t.id);
          t.treatmentDetails = dResp?.data || [];
        } catch (error) {
          console.warn('Could not fetch treatment details for treatment:', t.id, error);
        }
      }

      const formattedAdmission = {
        ...admission,
        patient: patientDetails.value,
      };

      await downloadDischargeSummaryPdf(formattedAdmission, labs, surgs, treats);
      showAlert('success', 'Discharge summary PDF downloaded successfully', 'Success');
    } catch {
      showAlert('error', 'Failed to download discharge summary PDF', 'Error');
    } finally {
      downloadingSummaryId.value = null;
    }
  };

  const getAdmissionStatusName = (statusId: number) => {
    return STATUS_OPTIONS.ADMISSION.find((s) => s.id === statusId)?.name || 'Admitted';
  };

  onMounted(async () => {
    await loadCnicConfig();
    await loadPatientDetails();
    if (patientDetails.value.id) {
      loadClinicalData(patientDetails.value.id);
      loadPatientAdmissions(patientDetails.value.id);
    }
  });

  watch(currentTab, (tab) => {
    if (['encounters', 'allergies', 'diagnoses', 'prescriptions', 'labTests'].includes(tab) && patientDetails.value.id) {
      loadClinicalData(patientDetails.value.id);
    } else if (tab === 'admissions' && patientDetails.value.id) {
      loadPatientAdmissions(patientDetails.value.id);
    }
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
          <div class="mt-6 border-b border-stroke dark:border-strokedark overflow-x-auto">
            <nav class="flex gap-6 min-w-max">
              <BaseButton
                variant="ghost"
                @click="currentTab = 'about'"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
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
                @click="currentTab = 'encounters'"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
                  currentTab === 'encounters' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">
                  🩺 Encounters
                  <span v-if="recentEncounters.length" class="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                    {{ recentEncounters.length }}
                  </span>
                </div>
              </BaseButton>
              <BaseButton
                variant="ghost"
                @click="currentTab = 'allergies'"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
                  currentTab === 'allergies' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">
                  🛡️ Allergies
                  <span v-if="allergies.length" class="bg-danger text-white text-xs px-1.5 py-0.5 rounded-full">
                    {{ allergies.length }}
                  </span>
                </div>
              </BaseButton>

              <BaseButton
                variant="ghost"
                @click="currentTab = 'diagnoses'"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
                  currentTab === 'diagnoses' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">🔬 Diagnoses</div>
              </BaseButton>
              <BaseButton
                variant="ghost"
                @click="currentTab = 'prescriptions'"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
                  currentTab === 'prescriptions' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">💊 Prescriptions</div>
              </BaseButton>
              <BaseButton
                variant="ghost"
                @click="currentTab = 'labTests'"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
                  currentTab === 'labTests' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">🧪 Lab Tests</div>
              </BaseButton>
              <BaseButton
                variant="ghost"
                @click="currentTab = 'medical'"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
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
              <BaseButton
                variant="ghost"
                @click="currentTab = 'admissions'"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
                  currentTab === 'admissions' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">
                  🛏️ Admissions &amp; Invoices
                  <span v-if="patientAdmissions.length" class="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {{ patientAdmissions.length }}
                  </span>
                </div>
              </BaseButton>
              <BaseButton
                variant="ghost"
                @click="currentTab = 'patientServices'"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
                  currentTab === 'patientServices' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">🏥 Patient Services</div>
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

        <!-- Encounters Tab -->
        <div v-if="currentTab === 'encounters'" class="lg:col-span-3">
          <div class="flex justify-end mb-4">
            <BaseButton variant="primary" size="sm" @click="handleAddMedicalHistory">+ New Encounter</BaseButton>
          </div>
          <div v-if="clinicalLoading" class="space-y-3">
            <div v-for="i in 3" :key="i" class="bg-surface rounded-xl border border-stroke dark:border-strokedark p-4 animate-pulse h-16"></div>
          </div>
          <div v-else-if="!recentEncounters.length" class="bg-surface rounded-2xl border border-stroke dark:border-strokedark p-12 text-center">
            <div class="text-4xl mb-3">🩺</div>
            <p class="text-bodydark">No encounters recorded yet.</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="enc in recentEncounters"
              :key="enc.id"
              class="bg-surface rounded-xl border border-stroke dark:border-strokedark p-4 hover:shadow-md transition-all cursor-pointer group"
              @click="navigateToEncounter(enc.id)"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="flex items-center gap-3">
                    <span class="font-semibold text-emphasis">Encounter #{{ enc.id }}</span>
                    <span
                      :class="[
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        enc.encounterStatus === 'Completed' ? 'bg-success/10 text-success' : enc.encounterStatus === 'Cancelled' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning',
                      ]"
                    >
                      {{ enc.encounterStatus || 'InProgress' }}
                    </span>
                  </div>
                  <p class="text-sm text-bodydark mt-1">
                    {{ enc.visitDate ? new Date(enc.visitDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A' }}
                    <span v-if="enc.symptom">&bull; {{ enc.symptom.substring(0, 60) }}{{ enc.symptom.length > 60 ? '...' : '' }}</span>
                  </p>
                </div>
                <span class="text-primary opacity-0 group-hover:opacity-100 transition-opacity text-lg">→</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Allergies Tab -->
        <div v-if="currentTab === 'allergies'" class="lg:col-span-3">
          <div class="flex justify-end mb-4">
            <BaseButton variant="primary" size="sm" @click="navigateToAllergies">Manage Allergies</BaseButton>
          </div>
          <div v-if="clinicalLoading" class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div v-for="i in 3" :key="i" class="bg-surface rounded-xl border border-stroke dark:border-strokedark p-4 animate-pulse h-24"></div>
          </div>
          <div v-else-if="!allergies.length" class="bg-surface rounded-2xl border border-stroke dark:border-strokedark p-12 text-center">
            <div class="text-4xl mb-3">🛡️</div>
            <p class="text-bodydark">No known allergies recorded.</p>
            <BaseButton variant="primary" size="sm" class="mt-4" @click="navigateToAllergies">Record Allergy</BaseButton>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="allergy in allergies" :key="allergy.id" class="bg-surface rounded-xl border border-stroke dark:border-strokedark p-4">
              <div class="flex items-start justify-between mb-2">
                <p class="font-semibold text-emphasis">{{ allergy.allergen }}</p>
                <span
                  :class="[
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    allergy.severity === 'Severe' || allergy.severity === 'Life-Threatening'
                      ? 'bg-danger/10 text-danger'
                      : allergy.severity === 'Moderate'
                        ? 'bg-warning/10 text-warning'
                        : 'bg-success/10 text-success',
                  ]"
                >
                  {{ allergy.severity }}
                </span>
              </div>
              <p class="text-xs text-bodydark">{{ allergy.category }} &bull; {{ allergy.reaction || 'No reaction specified' }}</p>
            </div>
          </div>
        </div>

        <!-- Diagnoses Tab -->
        <div v-if="currentTab === 'diagnoses'" class="lg:col-span-3">
          <div class="flex justify-end mb-4">
            <BaseButton variant="primary" size="sm" @click="showAddDiagnosisModal = true">Add New Diagnosis</BaseButton>
          </div>
          <div v-if="clinicalLoading" class="space-y-3">
            <div v-for="i in 3" :key="i" class="bg-surface rounded-xl border border-stroke dark:border-strokedark p-4 animate-pulse h-12"></div>
          </div>
          <div v-else-if="!diagnoses.length" class="bg-surface rounded-2xl border border-stroke dark:border-strokedark p-12 text-center">
            <div class="text-4xl mb-3">🔬</div>
            <p class="text-bodydark">No diagnoses recorded. Add them inside an encounter.</p>
          </div>
          <div v-else class="space-y-3">
            <div v-for="dx in diagnoses" :key="dx.id" class="bg-surface rounded-xl border border-stroke dark:border-strokedark p-4">
              <div class="flex items-center gap-3">
                <span class="font-semibold text-emphasis">{{ dx.diseaseName }}</span>
                <span v-if="dx.diagnosisCode" class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{{ dx.diagnosisCode }}</span>
                <span class="text-xs text-bodydark border border-stroke dark:border-strokedark px-2 py-0.5 rounded-full">{{ dx.diagnosisType }}</span>
                <span :class="['ml-auto text-xs font-medium', dx.status === 'Active' ? 'text-danger' : 'text-success']">{{ dx.status }}</span>
              </div>
              <p v-if="dx.notes" class="text-xs text-bodydark mt-1">{{ dx.notes }}</p>
            </div>
          </div>
        </div>

        <!-- Prescriptions Tab -->
        <div v-if="currentTab === 'prescriptions'" class="lg:col-span-3">
          <div v-if="clinicalLoading" class="space-y-3">
            <div v-for="i in 3" :key="i" class="bg-surface rounded-xl border border-stroke dark:border-strokedark p-4 animate-pulse h-12"></div>
          </div>
          <div v-else-if="!prescriptions.length" class="bg-surface rounded-2xl border border-stroke dark:border-strokedark p-12 text-center">
            <div class="text-4xl mb-3">💊</div>
            <p class="text-bodydark">No prescriptions recorded. Add them inside an encounter.</p>
          </div>
          <div v-else class="space-y-3">
            <div v-for="rx in prescriptions" :key="rx.id" class="bg-surface rounded-xl border border-stroke dark:border-strokedark p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <p class="text-xs text-bodydark">Medicine</p>
                <p class="font-semibold text-emphasis">{{ rx.medicine }}</p>
              </div>
              <div>
                <p class="text-xs text-bodydark">Dose / Route</p>
                <p class="text-emphasis text-sm">{{ rx.dose || '—' }} / {{ rx.route || '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-bodydark">Frequency / Duration</p>
                <p class="text-emphasis text-sm">{{ rx.frequency || '—' }} for {{ rx.duration || '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-bodydark">Status</p>
                <span :class="['text-sm font-medium', rx.status === 'Active' ? 'text-success' : 'text-bodydark']">{{ rx.status }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Lab Tests Tab -->
        <div v-if="currentTab === 'labTests'" class="lg:col-span-3">
          <!-- Action bar -->
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm text-bodydark">Showing recent lab tests ordered for this patient.</p>
            <button
              @click="navigateToLabOrders"
              class="inline-flex items-center gap-2 text-sm font-medium text-primary border border-primary/40 rounded-lg px-4 py-2 hover:bg-primary hover:text-white transition-colors"
            >
              🧪 View All Lab Orders
              <span class="text-base">→</span>
            </button>
          </div>
          <div v-if="clinicalLoading" class="space-y-3">
            <div v-for="i in 3" :key="i" class="bg-surface rounded-xl border border-stroke dark:border-strokedark p-4 animate-pulse h-12"></div>
          </div>
          <div v-else-if="!patientLabs.length" class="bg-surface rounded-2xl border border-stroke dark:border-strokedark p-12 text-center">
            <div class="text-4xl mb-3">🧪</div>
            <p class="text-bodydark mb-4">No lab tests recorded for this patient.</p>
            <button
              @click="navigateToLabOrders"
              class="inline-flex items-center gap-2 text-sm font-medium text-primary border border-primary/40 rounded-lg px-4 py-2 hover:bg-primary hover:text-white transition-colors"
            >
              🧪 Go to Lab Orders
              <span>→</span>
            </button>
          </div>
          <div v-else class="space-y-3">
            <div v-for="lab in patientLabs" :key="lab.id" class="bg-surface rounded-xl border border-stroke dark:border-strokedark p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <p class="text-xs text-bodydark">Lab Test</p>
                <p class="font-semibold text-emphasis">{{ lab.labTestName || 'Lab Test #' + lab.labTestId }}</p>
              </div>
              <div>
                <p class="text-xs text-bodydark">Status</p>
                <span :class="['text-sm font-medium', lab.status === 'Completed' ? 'text-success' : lab.status === 'InProgress' ? 'text-warning' : 'text-primary']">{{ lab.status }}</span>
              </div>
              <div>
                <p class="text-xs text-bodydark">Notes</p>
                <p class="text-emphasis text-sm">{{ lab.details || '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-bodydark">Reported</p>
                <p class="text-emphasis text-sm">{{ lab.reportTime ? new Date(lab.reportTime).toLocaleDateString() : '—' }}</p>
              </div>
              <!-- Per-card action: download report for completed orders -->
              <div v-if="lab.status === 'Completed' && lab.report?.length" class="col-span-2 md:col-span-4 flex justify-start pt-1">
                <button
                  @click="downloadPdfReport(lab)"
                  title="Download Report"
                  class="inline-flex items-center gap-2 text-sm font-medium text-success border border-success/40 rounded-lg px-4 py-2 hover:bg-success hover:text-white transition-colors"
                >
                  <DownloadIcon class="w-4 h-4" />
                  Download Report
                </button>
              </div>
            </div>

            <!-- Footer link (below the list) -->
            <div class="flex justify-end pt-2">
              <button
                @click="navigateToLabOrders"
                class="inline-flex items-center gap-2 text-sm font-medium text-primary border border-primary/40 rounded-lg px-4 py-2 hover:bg-primary hover:text-white transition-colors"
              >
                View Full Lab Order History →
              </button>
            </div>
          </div>
        </div>
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

        <!-- Inpatient Admissions & Consolidated Invoices Tab -->
        <div v-if="currentTab === 'admissions'" class="lg:col-span-3 space-y-6">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-xl font-bold text-emphasis">Inpatient Admissions &amp; Consolidated Invoices</h3>
              <p class="text-xs text-bodydark dark:text-bodydark1 mt-0.5">Track all hospital stays, discharge documentation, and consolidated billing invoices.</p>
            </div>
            <router-link
              :to="{ path: '/admissions/add', query: { patientId: patientDetails.id } }"
              class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              + New Admission
            </router-link>
          </div>

          <div v-if="admissionsLoading" class="animate-pulse space-y-4">
            <div v-for="i in 2" :key="i" class="h-44 bg-surface rounded-2xl border border-stroke dark:border-strokedark"></div>
          </div>

          <div v-else-if="patientAdmissions.length === 0" class="bg-surface rounded-2xl border border-stroke dark:border-strokedark p-12 text-center">
            <div class="text-4xl mb-3">🛏️</div>
            <p class="text-lg font-bold text-emphasis">No Inpatient Admissions Found</p>
            <p class="text-sm text-bodydark mt-1">This patient does not have any admission or discharge records yet.</p>
          </div>

          <div v-else class="space-y-4">
            <div v-for="adm in patientAdmissions" :key="adm.id" class="bg-surface rounded-2xl border border-stroke dark:border-strokedark p-6 shadow-sm hover:shadow-md transition-shadow">
              <!-- Admission Header -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stroke dark:border-strokedark pb-4 mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg">#{{ adm.id }}</div>
                  <div>
                    <h4 class="font-bold text-emphasis text-base">Admission #{{ adm.id }}</h4>
                    <p class="text-xs text-bodydark dark:text-bodydark1">Reason: {{ adm.reasonForAdmission || 'General Admission' }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider',
                      adm.status === 13 || adm.status === 12
                        ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                        : 'bg-primary/15 text-primary border border-primary/30',
                    ]"
                  >
                    {{ getAdmissionStatusName(adm.status) }}
                  </span>

                  <!-- Financial Ledger Badge -->
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border',
                      adm.isFullyPaid ? 'bg-success/15 text-success border-success/30' : 'bg-warning/15 text-warning border-warning/30',
                    ]"
                  >
                    {{ adm.isFullyPaid ? '✓ Fully Paid' : '⚠ Payment Due' }}
                  </span>
                </div>
              </div>

              <!-- Details Grid -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-5">
                <div>
                  <span class="text-bodydark block">Admission Date</span>
                  <span class="font-bold text-emphasis text-sm">
                    {{ adm.admissionDate ? new Date(adm.admissionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A' }}
                  </span>
                </div>
                <div>
                  <span class="text-bodydark block">Discharge Date</span>
                  <span class="font-bold text-emphasis text-sm">
                    {{ adm.dischargeDate ? new Date(adm.dischargeDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Active / Inpatient' }}
                  </span>
                </div>
                <div>
                  <span class="text-bodydark block">Ward &amp; Bed</span>
                  <span class="font-bold text-emphasis text-sm">{{ adm.ward?.name || 'Ward' }} &bull; Bed #{{ adm.wardBed?.bedNumber || 'N/A' }}</span>
                </div>
                <div>
                  <span class="text-bodydark block">Attending Doctor</span>
                  <span class="font-bold text-emphasis text-sm">
                    {{ adm.attendingDoctor?.name || 'N/A' }}
                  </span>
                </div>
              </div>

              <!-- Financial Box & Action Bar -->
              <div class="bg-slate-50 dark:bg-meta-4 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-center gap-6">
                  <div>
                    <span class="text-[11px] text-bodydark uppercase block">Total Charges</span>
                    <span class="font-black text-emphasis text-base">${{ (adm.totalCharged || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
                  </div>
                  <div>
                    <span class="text-[11px] text-bodydark uppercase block">Total Paid</span>
                    <span class="font-black text-success text-base">${{ (adm.totalPaid || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
                  </div>
                  <div>
                    <span class="text-[11px] text-bodydark uppercase block">Balance Due</span>
                    <span :class="['font-black text-base', adm.remainingBalance > 0 ? 'text-danger' : 'text-bodydark']">
                      ${{ (adm.remainingBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                    </span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-wrap items-center gap-2">
                  <!-- Pay Now (if unpaid) -->
                  <button
                    v-if="!adm.isFullyPaid"
                    type="button"
                    class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-warning text-white rounded-lg text-xs font-bold hover:bg-warning/90 transition-colors shadow-sm"
                    @click="handleOpenAdmissionPayment(adm)"
                  >
                    💳 Pay Now
                  </button>

                  <!-- Download Invoice (PDF) -->
                  <button
                    type="button"
                    :disabled="downloadingInvoiceId === adm.id"
                    class="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-stroke dark:border-strokedark bg-white dark:bg-boxdark rounded-lg text-xs font-bold text-emphasis hover:bg-elevated transition-colors"
                    @click="handleDownloadAdmissionInvoice(adm)"
                  >
                    <svg v-if="downloadingInvoiceId === adm.id" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <BillingIcon v-else class="w-3.5 h-3.5 text-primary" />
                    {{ downloadingInvoiceId === adm.id ? 'Exporting...' : 'Invoice (PDF)' }}
                  </button>

                  <!-- Download Discharge Summary (PDF) if discharged -->
                  <button
                    v-if="adm.status === 13 || adm.status === 12"
                    type="button"
                    :disabled="downloadingSummaryId === adm.id"
                    class="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-success/40 bg-success/10 text-success rounded-lg text-xs font-bold hover:bg-success hover:text-white transition-colors"
                    @click="handleDownloadAdmissionSummary(adm)"
                  >
                    <svg v-if="downloadingSummaryId === adm.id" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <DocumentLinesIcon v-else class="w-3.5 h-3.5" />
                    {{ downloadingSummaryId === adm.id ? 'Exporting...' : 'Discharge Summary (PDF)' }}
                  </button>

                  <!-- View Full Admission Details Link -->
                  <router-link :to="'/admissions/' + adm.id" class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-primary hover:underline">View Details &rarr;</router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Patient Services Tab -->
        <div v-if="currentTab === 'patientServices'" class="lg:col-span-3">
          <PatientServicesTab :patientId="patientDetails.id" />
        </div>
      </div>
    </div>

    <!-- Standard HMS Payment Modal in Patient Profile -->
    <PaymentModal :show="showPayModal" :bill="billToPay" @close="showPayModal = false" @success="handleAdmissionPaymentSuccess" />

    <!-- Add New Diagnosis Modal -->
    <Teleport to="body">
      <div v-if="showAddDiagnosisModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showAddDiagnosisModal = false"></div>
        <div class="relative bg-white dark:bg-boxdark rounded-2xl shadow-2xl w-full max-w-lg p-6">
          <h3 class="text-xl font-bold text-emphasis mb-5">Add New Diagnosis</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-emphasis mb-1">
                Condition / Disease Name
                <span class="text-danger">*</span>
              </label>
              <input
                v-model="newDiagnosisForm.diseaseName"
                type="text"
                placeholder="e.g. Hypertension"
                class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-emphasis mb-1">Type</label>
                <select
                  v-model="newDiagnosisForm.diagnosisType"
                  class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary"
                >
                  <option>Primary</option>
                  <option>Secondary</option>
                  <option>Working</option>
                  <option>Final</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-emphasis mb-1">Status</label>
                <select
                  v-model="newDiagnosisForm.status"
                  class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary"
                >
                  <option>Active</option>
                  <option>Resolved</option>
                  <option>Chronic</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-emphasis mb-1">Notes</label>
              <input
                v-model="newDiagnosisForm.notes"
                type="text"
                placeholder="Additional notes (optional)"
                class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <BaseButton variant="outline" class="flex-1" @click="showAddDiagnosisModal = false">Cancel</BaseButton>
            <BaseButton variant="primary" class="flex-1" :loading="savingDiagnosis" @click="saveNewDiagnosis">Save Diagnosis</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </DefaultLayout>
</template>
