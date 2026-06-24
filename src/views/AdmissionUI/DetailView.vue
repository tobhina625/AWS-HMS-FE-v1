<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import AdmissionServices from '@/services/Admission/Admission.services';
  import PatientBillsService from '@/services/PatientBill/Patientbill.services';
  import TreatmentServices from '@/services/Treatment/Treatment.services';
  import PatientSurgeryServices from '@/services/PatientSurgery/PatientSurgery.services';
  import useAlert from '@/plugins/alert/useAlert';
  import { STATUS_OPTIONS } from '@/constants/statusOptions';

  import EditPencilIcon from '@/assets/images/SVGs/EditPencilIcon.svg';
  import KeyIcon from '@/assets/images/SVGs/KeyIcon.svg';
  import UserIcon from '@/assets/images/SVGs/UserIcon.svg';
  import DocumentLinesIcon from '@/assets/images/SVGs/DocumentLinesIcon.svg';
  import BillingIcon from '@/assets/images/SVGs/Billing.svg';
  import ClipboardIcon from '@/assets/images/SVGs/ClipboardIcon.svg';
  import TrashDetailedIcon from '@/assets/images/SVGs/TrashDetailedIcon.svg';
  import PlusIcon from '@/assets/images/SVGs/PlusIcon.svg';

  const route = useRoute();
  const router = useRouter();
  const { showAlert } = useAlert();

  const admissionService = new AdmissionServices();
  const patientBillService = new PatientBillsService();
  const treatmentService = new TreatmentServices();
  const surgeryService = new PatientSurgeryServices();

  const loading = ref(true);
  const currentTab = ref('overview');
  const admission = ref<any>(null);
  const bills = ref<any[]>([]);
  const treatments = ref<any[]>([]);
  const surgeries = ref<any[]>([]);
  const billsLoading = ref(false);
  const treatmentsLoading = ref(false);
  const surgeriesLoading = ref(false);

  const showAddBillForm = ref(false);
  const newBill = ref({
    reason: '',
    totalAmount: 0,
  });

  const statusOptions = computed(() => STATUS_OPTIONS.ADMISSION || []);
  const selectedStatus = ref<number | null>(null);
  const updatingStatus = ref(false);

  const admissionId = computed(() => route.params.id as string);

  const patientFullName = computed(() => {
    if (!admission.value?.patient) return 'N/A';
    return `${admission.value.patient.firstName} ${admission.value.patient.lastName}`.trim();
  });

  const statusLabel = computed(() => {
    if (!admission.value) return 'Unknown';
    const status = statusOptions.value.find((s: any) => s.id === admission.value.status);
    return status?.name || 'Unknown';
  });

  const statusColorClass = computed(() => {
    return STATUS_OPTIONS.ADMISSION_STATUS_COLORS[statusLabel.value] || STATUS_OPTIONS.ADMISSION_STATUS_COLORS['Unknown'];
  });

  const totalCharges = computed(() => {
    return admission.value?.totalChargesPayable || 0;
  });

  const calculatedTotal = computed(() => {
    return bills.value.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
  });

  const formattedDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formattedDateTime = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const loadAdmissionDetails = async () => {
    loading.value = true;
    try {
      const response: any = await admissionService.getAdmissionById(Number(admissionId.value));
      const data = response?.data ?? response?.Data;
      if (!data) {
        showAlert('error', 'Admission not found.', 'Error');
        router.push('/admissions');
        return;
      }

      const p = data.patient ?? data.Patient;
      const w = data.ward ?? data.Ward;
      const wb = data.wardBed ?? data.WardBed;
      const doc = data.attendingDoctor ?? data.AttendingDoctor;
      const wDept = w?.department ?? w?.Department;
      const docDept = doc?.department ?? doc?.Department;

      admission.value = {
        id: data.id ?? data.Id,
        status: data.status ?? data.Status,
        admissionDate: data.admissionDate ?? data.AdmissionDate,
        dischargeDate: data.dischargeDate ?? data.DischargeDate,
        totalChargesPayable: data.totalChargesPayable ?? data.TotalChargesPayable,
        reasonForAdmission: data.reasonForAdmission ?? data.ReasonForAdmission,
        patientId: data.patientId ?? data.PatientId,
        patient: p
          ? {
              id: p.id ?? p.Id,
              firstName: p.firstName ?? p.FirstName,
              lastName: p.lastName ?? p.LastName,
              dateOfBirth: p.dateOfBirth ?? p.DateOfBirth,
              age: p.age ?? p.Age,
              gender: p.gender ?? p.Gender,
              phone: p.phone ?? p.Phone,
              cnic: p.cnic ?? p.CNIC,
              nationality: p.nationality ?? p.Nationality,
              address: p.address ?? p.Address,
            }
          : null,
        ward: w
          ? {
              id: w.id ?? w.Id,
              name: w.name ?? w.Name,
              status: w.status ?? w.Status,
              department: wDept
                ? {
                    id: wDept.id ?? wDept.Id,
                    name: wDept.name ?? wDept.Name,
                  }
                : null,
            }
          : null,
        wardBed: wb
          ? {
              id: wb.id ?? wb.Id,
              bedNumber: wb.bedNumber ?? wb.BedNumber,
              wardId: wb.wardId ?? wb.WardId,
              status: wb.status ?? wb.Status,
            }
          : null,
        wardBedId: data.wardBedId ?? data.WardBedId,
        attendingDoctor: doc
          ? {
              id: doc.id ?? doc.Id,
              name: doc.name ?? doc.Name,
              email: doc.email ?? doc.Email,
              specialization: doc.specialization ?? doc.Specialization,
              department: docDept
                ? {
                    id: docDept.id ?? docDept.Id,
                    name: docDept.name ?? docDept.Name,
                  }
                : null,
            }
          : null,
      };
      selectedStatus.value = admission.value.status;
    } catch (error) {
      console.error('Error loading admission:', error);
      showAlert('error', 'Failed to load admission details', 'Error');
      router.push('/admissions');
    } finally {
      loading.value = false;
    }
  };

  const loadBills = async () => {
    billsLoading.value = true;
    try {
      const response: any = await patientBillService.getPatientBillsByAdmissionId(Number(admissionId.value), 0, 100);
      if (response?.Data) {
        bills.value = response.Data.map((bill: any) => ({
          id: bill.Id,
          billType: bill.BillType,
          reason: bill.Reason,
          entityId: bill.EntityId,
          totalAmount: bill.TotalAmount,
          isPaid: bill.IsPaid,
          paidAmount: bill.PaidAmount,
          remainingBalance: bill.RemainingBalance,
        }));
      }
    } catch (error) {
      console.error('Error loading bills:', error);
    } finally {
      billsLoading.value = false;
    }
  };

  const loadTreatments = async () => {
    treatmentsLoading.value = true;
    try {
      const response: any = await treatmentService.getTreatmentsByAdmissionId(Number(admissionId.value), 0, 100);
      if (response?.Data) {
        treatments.value = response.Data.map((treatment: any) => ({
          id: treatment.Id,
          bedNumber: treatment.BedNumber,
          wardId: treatment.WardId,
          ward: treatment.Ward
            ? {
                id: treatment.Ward.Id,
                name: treatment.Ward.Name,
              }
            : null,
          admissionId: treatment.AdmissionId,
        }));
      }
    } catch (error) {
      console.error('Error loading treatments:', error);
    } finally {
      treatmentsLoading.value = false;
    }
  };

  const loadSurgeries = async () => {
    surgeriesLoading.value = true;
    try {
      const response: any = await surgeryService.getPatientSurgeriesByAdmissionId(Number(admissionId.value), 0, 100);
      if (response?.Data) {
        surgeries.value = response.Data.map((surgery: any) => ({
          id: surgery.Id,
          surgeryTime: surgery.SurgeryTime,
          endTime: surgery.EndTime,
          notes: surgery.Notes,
          surgery: surgery.Surgery
            ? {
                id: surgery.Surgery.Id,
                name: surgery.Surgery.Name,
                cost: surgery.Surgery.Cost,
              }
            : null,
          operationTheatre: surgery.OperationTheatre
            ? {
                id: surgery.OperationTheatre.Id,
                name: surgery.OperationTheatre.Name,
              }
            : null,
        }));
      }
    } catch (error) {
      console.error('Error loading surgeries:', error);
    } finally {
      surgeriesLoading.value = false;
    }
  };

  const handleAddBill = async () => {
    if (!newBill.value.reason || newBill.value.totalAmount <= 0) {
      showAlert('error', 'Please provide reason and valid amount', 'Validation Error');
      return;
    }

    try {
      const billData = {
        billType: 3,
        reason: newBill.value.reason,
        entityId: Number(admissionId.value),
        totalAmount: newBill.value.totalAmount,
        isPaid: false,
        paidAmount: 0,
        remainingBalance: newBill.value.totalAmount,
        patient: {
          id: admission.value.patientId,
        },
      };

      await patientBillService.addPatientBills(billData);
      showAlert('success', 'Bill added successfully', 'Success');

      newBill.value = { reason: '', totalAmount: 0 };
      showAddBillForm.value = false;

      await loadBills();
      await loadAdmissionDetails();
    } catch {
      showAlert('error', 'Failed to add bill', 'Error');
    }
  };

  const handleDeleteBill = async (billId: number) => {
    try {
      await patientBillService.deletePatientBill(billId);
      showAlert('success', 'Bill deleted successfully', 'Success');
      await loadBills();
      await loadAdmissionDetails();
    } catch {
      showAlert('error', 'Failed to delete bill', 'Error');
    }
  };

  const handleStatusChange = async () => {
    if (selectedStatus.value === null || selectedStatus.value === admission.value.status) {
      return;
    }

    updatingStatus.value = true;
    try {
      const updateData = {
        id: Number(admissionId.value),
        status: selectedStatus.value,
        admissionDate: admission.value.admissionDate,
        dischargeDate: admission.value.dischargeDate,
        totalChargesPayable: admission.value.totalChargesPayable,
        reasonForAdmission: admission.value.reasonForAdmission,
        patientId: admission.value.patientId,
        wardBedId: admission.value.wardBedId,
        attendingDoctor: admission.value.attendingDoctor ? { id: admission.value.attendingDoctor.id } : null,
        ward: admission.value.ward ? { id: admission.value.ward.id } : null,
      };

      await admissionService.updateAdmission(updateData);
      showAlert('success', 'Status updated successfully', 'Success');
      await loadAdmissionDetails();
    } catch {
      showAlert('error', 'Failed to update status', 'Error');
      selectedStatus.value = admission.value.status;
    } finally {
      updatingStatus.value = false;
    }
  };

  const handleBack = () => {
    router.push('/admissions');
  };

  const handleEdit = () => {
    router.push(`/admissions/edit/${admissionId.value}`);
  };

  const goToPatientProfile = () => {
    if (admission.value?.patientId) {
      router.push(`/patients/${admission.value.patientId}`);
    }
  };

  const getBillTypeLabel = (billType: number) => {
    const types: Record<number, string> = {
      0: 'Surgery',
      1: 'Lab Test',
      2: 'Treatment',
      3: 'Admission Charge',
    };
    return types[billType] || 'Unknown';
  };

  onMounted(async () => {
    await loadAdmissionDetails();
    if (currentTab.value === 'charges') {
      await loadBills();
    }
  });

  const onTabChange = async (tab: string) => {
    currentTab.value = tab;
    if (tab === 'charges' && bills.value.length === 0) {
      await loadBills();
    } else if (tab === 'treatments' && treatments.value.length === 0) {
      await loadTreatments();
    } else if (tab === 'surgeries' && surgeries.value.length === 0) {
      await loadSurgeries();
    }
  };
</script>

<template>
  <DefaultLayout>
    <BreadcrumbDefault pageTitle="Admission Details" />

    <div v-if="loading" class="animate-pulse space-y-6 mt-6">
      <div class="bg-surface rounded-2xl p-6">
        <div class="h-8 bg-elevated rounded w-1/3 mb-4"></div>
        <div class="h-64 bg-elevated rounded"></div>
      </div>
    </div>

    <div v-else-if="!loading && admission" class="space-y-6 mt-6">
      <div class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark overflow-hidden">
        <div class="h-24 bg-gradient-to-r from-primary to-primary-light"></div>
        <div class="px-6 pb-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-12">
            <div class="w-24 h-24 rounded-2xl border-4 border-white dark:border-boxdark bg-surface shadow-lg flex items-center justify-center">
              <span class="text-3xl font-bold text-primary">{{ patientFullName.charAt(0) || 'A' }}</span>
            </div>
            <div class="flex-1 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4">
              <div>
                <h1 class="text-3xl font-bold text-emphasis mb-1">Admission #{{ admission.id }}</h1>
                <div class="flex flex-wrap items-center gap-4 text-sm text-bodydark dark:text-bodydark1">
                  <button @click="goToPatientProfile" class="flex items-center gap-1 hover:text-primary transition-colors">
                    <UserIcon class="w-4 h-4" />
                    {{ patientFullName }}
                  </button>
                  <span :class="['inline-block px-2.5 py-1 rounded-full text-xs font-black uppercase', statusColorClass]">
                    {{ statusLabel }}
                  </span>
                  <span class="flex items-center gap-1 text-emphasis font-semibold">Total: ${{ totalCharges.toLocaleString() }}</span>
                </div>
              </div>
              <div class="flex flex-wrap gap-3">
                <BaseButton variant="outline" size="md" @click="handleBack" class="border-2 border-stroke dark:border-strokedark text-emphasis hover:border-primary dark:hover:border-primary">
                  <KeyIcon class="w-4 h-4 mr-2" />
                  Back
                </BaseButton>
                <BaseButton variant="primary" size="md" @click="handleEdit">
                  <EditPencilIcon class="w-4 h-4 mr-2" />
                  Edit Admission
                </BaseButton>
              </div>
            </div>
          </div>

          <div class="mt-6 border-b border-stroke dark:border-strokedark">
            <nav class="flex gap-8">
              <BaseButton
                variant="ghost"
                @click="onTabChange('overview')"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors',
                  currentTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">
                  <DocumentLinesIcon class="w-5 h-5" />
                  Overview
                </div>
              </BaseButton>
              <BaseButton
                variant="ghost"
                @click="onTabChange('charges')"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors',
                  currentTab === 'charges' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">
                  <BillingIcon class="w-5 h-5" />
                  Charges & Bills
                </div>
              </BaseButton>
              <BaseButton
                variant="ghost"
                @click="onTabChange('treatments')"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors',
                  currentTab === 'treatments' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">
                  <ClipboardIcon class="w-5 h-5" />
                  Treatments
                </div>
              </BaseButton>
              <BaseButton
                variant="ghost"
                @click="onTabChange('surgeries')"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors',
                  currentTab === 'surgeries' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">
                  <ClipboardIcon class="w-5 h-5" />
                  Surgeries
                </div>
              </BaseButton>
              <BaseButton
                variant="ghost"
                @click="onTabChange('actions')"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors',
                  currentTab === 'actions' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">
                  <EditPencilIcon class="w-5 h-5" />
                  Actions
                </div>
              </BaseButton>
            </nav>
          </div>
        </div>
      </div>

      <div v-if="currentTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-6">
          <h2 class="text-xl font-semibold text-emphasis mb-6">Admission Information</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div class="flex flex-col gap-2 min-w-0">
              <span class="block text-sm font-medium text-bodydark dark:text-bodydark1">Patient</span>
              <button type="button" @click="goToPatientProfile" class="block w-fit max-w-full text-left text-base font-medium text-primary hover:underline">
                {{ patientFullName }}
              </button>
            </div>
            <div class="flex flex-col gap-2 min-w-0">
              <span class="block text-sm font-medium text-bodydark dark:text-bodydark1">Status</span>
              <p :class="['inline-flex w-fit px-2.5 py-1 rounded-full text-xs font-black uppercase', statusColorClass]">
                {{ statusLabel }}
              </p>
            </div>
            <div class="flex flex-col gap-2 min-w-0">
              <span class="block text-sm font-medium text-bodydark dark:text-bodydark1">Admission Date</span>
              <p class="text-base font-medium text-emphasis">{{ formattedDate(admission.admissionDate) }}</p>
            </div>
            <div class="flex flex-col gap-2 min-w-0">
              <span class="block text-sm font-medium text-bodydark dark:text-bodydark1">Discharge Date</span>
              <p class="text-base font-medium text-emphasis">{{ formattedDate(admission.dischargeDate) }}</p>
            </div>
            <div class="flex flex-col gap-2 min-w-0">
              <span class="block text-sm font-medium text-bodydark dark:text-bodydark1">Ward</span>
              <p class="text-base font-medium text-emphasis">{{ admission.ward?.name || 'N/A' }}</p>
            </div>
            <div class="flex flex-col gap-2 min-w-0">
              <span class="block text-sm font-medium text-bodydark dark:text-bodydark1">Bed Number</span>
              <p class="text-base font-medium text-emphasis">{{ admission.wardBed?.bedNumber || 'N/A' }}</p>
            </div>
            <div class="flex flex-col gap-2 min-w-0">
              <span class="block text-sm font-medium text-bodydark dark:text-bodydark1">Attending Doctor</span>
              <p class="text-base font-medium text-emphasis">{{ admission.attendingDoctor?.name || 'N/A' }}</p>
            </div>
            <div class="flex flex-col gap-2 min-w-0">
              <span class="block text-sm font-medium text-bodydark dark:text-bodydark1">Department</span>
              <p class="text-base font-medium text-emphasis">{{ admission.attendingDoctor?.department?.name || 'N/A' }}</p>
            </div>
            <div class="flex flex-col gap-2 md:col-span-2 min-w-0">
              <span class="block text-sm font-medium text-bodydark dark:text-bodydark1">Reason for Admission</span>
              <p class="text-base font-medium text-emphasis">{{ admission.reasonForAdmission || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-6">
            <h3 class="text-lg font-semibold text-emphasis mb-4">Financial Summary</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
                <div>
                  <p class="text-xs text-bodydark dark:text-bodydark1 mb-1">Total Charges</p>
                  <p class="text-2xl font-bold text-primary">${{ totalCharges.toLocaleString() }}</p>
                </div>
                <BillingIcon class="w-12 h-12 text-primary opacity-20" />
              </div>
            </div>
          </div>

          <div class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-6">
            <h3 class="text-lg font-semibold text-emphasis mb-4">Quick Info</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3 p-3 bg-elevated rounded-lg">
                <div class="w-10 h-10 rounded-full bg-meta-3/10 flex items-center justify-center">
                  <UserIcon class="w-5 h-5 text-meta-3" />
                </div>
                <div>
                  <p class="text-xs text-bodydark dark:text-bodydark1">Ward</p>
                  <p class="text-sm font-medium text-emphasis">{{ admission.ward?.name || 'N/A' }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 bg-elevated rounded-lg">
                <div class="w-10 h-10 rounded-full bg-meta-5/10 flex items-center justify-center">
                  <ClipboardIcon class="w-5 h-5 text-meta-5" />
                </div>
                <div>
                  <p class="text-xs text-bodydark dark:text-bodydark1">Bed Number</p>
                  <p class="text-sm font-medium text-emphasis">{{ admission.wardBed?.bedNumber || 'N/A' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentTab === 'charges'" class="grid grid-cols-1 gap-6">
        <div class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark">
          <div class="p-6 border-b border-stroke dark:border-strokedark">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold text-emphasis">Charges & Bills</h2>
                <p class="text-sm text-bodydark dark:text-bodydark1 mt-1">Manage admission charges and billing items</p>
              </div>
              <BaseButton variant="primary" size="md" @click="showAddBillForm = !showAddBillForm">
                <PlusIcon class="w-4 h-4 mr-2" />
                Add Charge
              </BaseButton>
            </div>
          </div>

          <div v-if="showAddBillForm" class="p-6 bg-elevated/50 border-b border-stroke dark:border-strokedark">
            <h3 class="text-lg font-semibold text-emphasis mb-4">Add New Charge</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-bodydark dark:text-bodydark1 mb-2">Description / Reason</label>
                <input
                  v-model="newBill.reason"
                  type="text"
                  placeholder="e.g., Room charges, Medication, etc."
                  class="w-full rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-form-input px-4 py-3 text-emphasis focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-bodydark dark:text-bodydark1 mb-2">Amount ($)</label>
                <input
                  v-model.number="newBill.totalAmount"
                  type="number"
                  min="0"
                  placeholder="0.00"
                  class="w-full rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-form-input px-4 py-3 text-emphasis focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div class="flex gap-3 mt-4">
              <BaseButton variant="primary" size="md" @click="handleAddBill">Save Charge</BaseButton>
              <BaseButton variant="outline" size="md" @click="showAddBillForm = false">Cancel</BaseButton>
            </div>
          </div>

          <div class="p-6">
            <div v-if="billsLoading" class="animate-pulse space-y-3">
              <div v-for="i in 3" :key="i" class="h-16 bg-elevated rounded"></div>
            </div>

            <div v-else-if="bills.length === 0" class="text-center py-12 text-bodydark dark:text-bodydark1">
              <BillingIcon class="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p class="text-lg font-medium">No charges added yet</p>
              <p class="text-sm mt-2">Click "Add Charge" to create the first billing item</p>
            </div>

            <div v-else>
              <div class="overflow-x-auto rounded-lg border border-stroke dark:border-strokedark">
                <table class="w-full">
                  <thead class="bg-elevated/30">
                    <tr>
                      <th class="text-left py-4 px-6 text-xs font-black uppercase tracking-widest text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">Type</th>
                      <th class="text-left py-4 px-6 text-xs font-black uppercase tracking-widest text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">Description</th>
                      <th class="text-right py-4 px-6 text-xs font-black uppercase tracking-widest text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">Amount</th>
                      <th class="text-center py-4 px-6 text-xs font-black uppercase tracking-widest text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">Status</th>
                      <th class="text-center py-4 px-6 text-xs font-black uppercase tracking-widest text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-stroke dark:divide-strokedark">
                    <tr v-for="bill in bills" :key="bill.id" class="hover:bg-elevated/50 transition-colors">
                      <td class="py-4 px-6">
                        <span class="text-sm font-medium text-emphasis">{{ getBillTypeLabel(bill.billType) }}</span>
                      </td>
                      <td class="py-4 px-6">
                        <span class="text-sm text-emphasis">{{ bill.reason }}</span>
                      </td>
                      <td class="py-4 px-6 text-right">
                        <span class="text-sm font-semibold text-emphasis">${{ bill.totalAmount.toLocaleString() }}</span>
                      </td>
                      <td class="py-4 px-6 text-center">
                        <span
                          :class="[
                            'inline-block px-2.5 py-1 rounded-full text-xs font-semibold',
                            bill.isPaid ? 'bg-success/20 text-success border border-success/40' : 'bg-warning/20 text-warning border border-warning/40',
                          ]"
                        >
                          {{ bill.isPaid ? 'Paid' : 'Unpaid' }}
                        </span>
                      </td>
                      <td class="py-4 px-6 text-center">
                        <BaseButton variant="ghost" size="sm" @click="handleDeleteBill(bill.id)" class="text-danger hover:bg-danger/10">
                          <TrashDetailedIcon class="w-4 h-4" />
                        </BaseButton>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="mt-6 p-6 bg-elevated/30 rounded-lg border border-stroke dark:border-strokedark">
                <div class="flex items-center justify-between">
                  <span class="text-lg font-semibold text-emphasis">Total Charges:</span>
                  <span class="text-2xl font-bold text-primary">${{ calculatedTotal.toLocaleString() }}</span>
                </div>
                <p class="text-xs text-bodydark dark:text-bodydark1 mt-2">{{ bills.length }} billing item(s)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentTab === 'treatments'" class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark">
        <div class="p-6 border-b border-stroke dark:border-strokedark">
          <h2 class="text-xl font-semibold text-emphasis">Treatments</h2>
          <p class="text-sm text-bodydark dark:text-bodydark1 mt-1">Treatment records for this admission</p>
        </div>

        <div class="p-6">
          <div v-if="treatmentsLoading" class="animate-pulse space-y-3">
            <div v-for="i in 3" :key="i" class="h-20 bg-elevated rounded-lg"></div>
          </div>

          <div v-else-if="treatments.length === 0" class="text-center py-16 text-bodydark dark:text-bodydark1">
            <ClipboardIcon class="w-20 h-20 mx-auto mb-4 opacity-20" />
            <p class="text-lg font-medium">No treatments recorded</p>
            <p class="text-sm mt-2">Treatment records will appear here once added</p>
          </div>

          <div v-else class="overflow-x-auto rounded-lg border border-stroke dark:border-strokedark">
            <table class="w-full">
              <thead class="bg-elevated/30">
                <tr>
                  <th class="text-left py-4 px-6 text-xs font-black uppercase tracking-widest text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">ID</th>
                  <th class="text-left py-4 px-6 text-xs font-black uppercase tracking-widest text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">Ward</th>
                  <th class="text-left py-4 px-6 text-xs font-black uppercase tracking-widest text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">Bed Number</th>
                  <th class="text-left py-4 px-6 text-xs font-black uppercase tracking-widest text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stroke dark:divide-strokedark">
                <tr v-for="treatment in treatments" :key="treatment.id" class="hover:bg-elevated/50 transition-colors">
                  <td class="py-4 px-6">
                    <span class="text-sm font-semibold text-emphasis">#{{ treatment.id }}</span>
                  </td>
                  <td class="py-4 px-6">
                    <span class="text-sm font-medium text-emphasis">{{ treatment.ward?.name || 'N/A' }}</span>
                  </td>
                  <td class="py-4 px-6">
                    <span class="text-sm font-medium text-emphasis">{{ treatment.bedNumber || 'N/A' }}</span>
                  </td>
                  <td class="py-4 px-6">
                    <span :class="['inline-block px-2.5 py-1 rounded-full text-xs font-black uppercase', statusColorClass]">
                      {{ statusLabel }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-if="currentTab === 'surgeries'" class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark">
        <div class="p-6 border-b border-stroke dark:border-strokedark">
          <h2 class="text-xl font-semibold text-emphasis">Surgeries</h2>
          <p class="text-sm text-bodydark dark:text-bodydark1 mt-1">Surgical procedures scheduled for this admission</p>
        </div>

        <div class="p-6">
          <div v-if="surgeriesLoading" class="animate-pulse space-y-3">
            <div v-for="i in 3" :key="i" class="h-20 bg-elevated rounded-lg"></div>
          </div>

          <div v-else-if="surgeries.length === 0" class="text-center py-16 text-bodydark dark:text-bodydark1">
            <ClipboardIcon class="w-20 h-20 mx-auto mb-4 opacity-20" />
            <p class="text-lg font-medium">No surgeries scheduled</p>
            <p class="text-sm mt-2">Surgery records will appear here once scheduled</p>
          </div>

          <div v-else class="overflow-x-auto rounded-lg border border-stroke dark:border-strokedark">
            <table class="w-full">
              <thead class="bg-elevated/30">
                <tr>
                  <th class="text-left py-4 px-6 text-xs font-black uppercase tracking-widest text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">Surgery</th>
                  <th class="text-left py-4 px-6 text-xs font-black uppercase tracking-widest text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">Operation Theatre</th>
                  <th class="text-left py-4 px-6 text-xs font-black uppercase tracking-widest text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">Surgery Time</th>
                  <th class="text-left py-4 px-6 text-xs font-black uppercase tracking-widest text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">End Time</th>
                  <th class="text-left py-4 px-6 text-xs font-black uppercase tracking-widest text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">Notes</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stroke dark:divide-strokedark">
                <tr v-for="surgery in surgeries" :key="surgery.id" class="hover:bg-elevated/50 transition-colors">
                  <td class="py-4 px-6">
                    <span class="text-sm font-semibold text-emphasis">{{ surgery.surgery?.name || 'N/A' }}</span>
                  </td>
                  <td class="py-4 px-6">
                    <span class="text-sm font-medium text-emphasis">{{ surgery.operationTheatre?.name || 'N/A' }}</span>
                  </td>
                  <td class="py-4 px-6">
                    <span class="text-sm text-emphasis">{{ formattedDateTime(surgery.surgeryTime) }}</span>
                  </td>
                  <td class="py-4 px-6">
                    <span class="text-sm text-emphasis">{{ formattedDateTime(surgery.endTime) }}</span>
                  </td>
                  <td class="py-4 px-6">
                    <span class="text-sm text-bodydark dark:text-bodydark1">{{ surgery.notes || '-' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-if="currentTab === 'actions'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark">
          <div class="p-6 border-b border-stroke dark:border-strokedark">
            <h3 class="text-lg font-semibold text-emphasis">Change Status</h3>
            <p class="text-sm text-bodydark dark:text-bodydark1 mt-1">Update the admission status</p>
          </div>
          <div class="p-6">
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-bodydark dark:text-bodydark1 mb-3">Current Status</label>
                <div class="p-4 bg-elevated rounded-lg border border-stroke dark:border-strokedark">
                  <p :class="['inline-block px-3 py-1.5 rounded-lg text-sm font-bold uppercase', statusColorClass]">
                    {{ statusLabel }}
                  </p>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-bodydark dark:text-bodydark1 mb-3">Select New Status</label>
                <select
                  v-model="selectedStatus"
                  class="w-full rounded-lg border-2 border-stroke dark:border-strokedark bg-white dark:bg-form-input px-4 py-3 text-emphasis focus:border-primary focus:outline-none transition-colors"
                >
                  <option v-for="status in statusOptions" :key="status.id" :value="status.id">
                    {{ status.name }}
                  </option>
                </select>
              </div>
              <BaseButton variant="primary" size="md" @click="handleStatusChange" :disabled="updatingStatus || selectedStatus === admission.status" class="w-full">
                {{ updatingStatus ? 'Updating...' : 'Update Status' }}
              </BaseButton>
            </div>
          </div>
        </div>

        <div class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark">
          <div class="p-6 border-b border-stroke dark:border-strokedark">
            <h3 class="text-lg font-semibold text-emphasis">Quick Actions</h3>
            <p class="text-sm text-bodydark dark:text-bodydark1 mt-1">Common admission management actions</p>
          </div>
          <div class="p-6">
            <div class="space-y-3">
              <BaseButton variant="primary" size="md" @click="handleEdit" class="w-full justify-center">
                <EditPencilIcon class="w-4 h-4 mr-2" />
                Edit Admission Details
              </BaseButton>
              <BaseButton variant="outline" size="md" @click="goToPatientProfile" class="w-full justify-center border-2">
                <UserIcon class="w-4 h-4 mr-2" />
                View Patient Profile
              </BaseButton>
              <BaseButton variant="outline" size="md" @click="handleBack" class="w-full justify-center border-2">
                <KeyIcon class="w-4 h-4 mr-2" />
                Back to Admissions List
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="mt-6 bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-12 text-center">
      <p class="text-lg text-bodydark dark:text-bodydark1">No admission data found</p>
      <BaseButton variant="primary" size="md" @click="handleBack" class="mt-4">Back to Admissions</BaseButton>
    </div>
  </DefaultLayout>
</template>
