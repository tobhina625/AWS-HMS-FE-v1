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
  import WardServices from '@/services/Ward/ward.services';
  import VitalServices from '@/services/Vitals/Vital.services';
  import SurgeryService from '@/services/Surgery/Surgery.services';
  import OperationTheatreService from '@/services/OperationTheatre/OperationTheatre.services';
  import PatientLabsService from '@/services/PatientLabs/PatientLabs.services';
  import LabTestServices from '@/services/LabTest/LabTest.services';
  import useAlert from '@/plugins/alert/useAlert';
  import { STATUS_OPTIONS } from '@/constants/statusOptions';

  import EditPencilIcon from '@/assets/images/SVGs/EditPencilIcon.svg';
  import KeyIcon from '@/assets/images/SVGs/KeyIcon.svg';
  import UserIcon from '@/assets/images/SVGs/UserIcon.svg';
  import DocumentLinesIcon from '@/assets/images/SVGs/DocumentLinesIcon.svg';
  import BillingIcon from '@/assets/images/SVGs/Billing.svg';
  import ClipboardIcon from '@/assets/images/SVGs/ClipboardIcon.svg';
  import LabTestIcon from '@/assets/images/SVGs/LabTest.svg';
  import TrashDetailedIcon from '@/assets/images/SVGs/TrashDetailedIcon.svg';
  import PlusIcon from '@/assets/images/SVGs/PlusIcon.svg';
  import TreatmentSessionModal from '@/components/Admission/TreatmentSessionModal.vue';
  import TreatmentSessionDetailsModal from '@/components/Admission/TreatmentSessionDetailsModal.vue';

  const route = useRoute();
  const router = useRouter();
  const { showAlert } = useAlert();

  const admissionService = new AdmissionServices();
  const patientBillService = new PatientBillsService();
  const treatmentService = new TreatmentServices();
  const surgeryService = new PatientSurgeryServices();
  const wardService = new WardServices();
  const surgeryCatalogService = new SurgeryService();
  const operationTheatreService = new OperationTheatreService();
  const vitalService = new VitalServices();
  const patientLabsService = new PatientLabsService();
  const labTestCatalogService = new LabTestServices();

  const loading = ref(true);
  const currentTab = ref('overview');
  const admission = ref<any>(null);
  const bills = ref<any[]>([]);
  const treatments = ref<any[]>([]);
  const surgeries = ref<any[]>([]);
  const labTests = ref<any[]>([]);
  const billsLoading = ref(false);
  const treatmentsLoading = ref(false);
  const surgeriesLoading = ref(false);
  const labTestsLoading = ref(false);

  const showAddBillForm = ref(false);
  const newBill = ref({
    reason: '',
    totalAmount: 0,
  });

  // Add Treatment form state
  const showAddTreatmentForm = ref(false);

  // View Treatment Details state
  const showTreatmentDetailsModal = ref(false);
  const selectedTreatmentSession = ref<any>(null);
  //const newTreatment = ref({
  //wardId: 0,
  //bedNumber: 0,
  //temperature: 0,
  //temperatureUnit: 'C',
  //pulseRate: 0,
  //respirationRate: 0,
  //systolic: 0,
  //diastolic: 0,
  //});
  const treatmentWards = ref<{ id: number; name: string }[]>([]);
  const treatmentWardsLoading = ref(false);
  const addingTreatment = ref(false);

  // Add Surgery form state
  const showAddSurgeryForm = ref(false);
  const newSurgery = ref({
    surgeryId: 0,
    operationTheatreId: 0,
    surgeryTime: '',
    endTime: '',
    notes: '',
  });
  const surgeryOptions = ref<{ id: number; name: string; rawName?: string; cost?: number }[]>([]);
  const theatreOptions = ref<{ id: number; name: string }[]>([]);
  const addingSurgery = ref(false);

  // Add Lab Test form state
  const showAddLabTestForm = ref(false);
  const newLabTest = ref({
    labTestId: 0,
    details: '',
  });
  const labTestOptions = ref<{ id: number; name: string; rawName?: string; price?: number }[]>([]);
  const addingLabTest = ref(false);

  // Edit Bill / Charge state
  const editingBill = ref<any>(null);
  const showEditBillModal = ref(false);
  const updatingBill = ref(false);

  const calculatedSurgeryDuration = computed(() => {
    if (!newSurgery.value.surgeryTime || !newSurgery.value.endTime) return 0;
    const start = new Date(newSurgery.value.surgeryTime);
    const end = new Date(newSurgery.value.endTime);
    if (end <= start) return 0;
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
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
        patientHistoryId: data.patientHistoryId ?? data.PatientHistoryId ?? 0,
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
      const content = response?.content || response?.Content || response?.data || response?.Data || [];
      bills.value = (Array.isArray(content) ? content : []).map((bill: any) => ({
        id: bill.id,
        billType: bill.billType,
        reason: bill.reason,
        entityId: bill.entityId,
        totalAmount: bill.totalAmount,
        isPaid: bill.isPaid,
        paidAmount: bill.paidAmount,
        remainingBalance: bill.remainingBalance,
      }));
    } catch (error) {
      console.error('Error loading bills:', error);
    } finally {
      billsLoading.value = false;
    }
  };

  const loadSurgeries = async () => {
    surgeriesLoading.value = true;
    try {
      const response: any = await surgeryService.getPatientSurgeriesByAdmissionId(Number(admissionId.value), 0, 100);
      const content = response?.content || response?.Content || response?.data || response?.Data || [];
      surgeries.value = (Array.isArray(content) ? content : []).map((surgery: any) => ({
        id: surgery.id,
        surgeryTime: surgery.surgeryTime,
        endTime: surgery.endTime,
        notes: surgery.notes,
        surgery: surgery.surgery
          ? {
              id: surgery.surgery.id,
              name: surgery.surgery.name,
              cost: surgery.surgery.cost,
            }
          : null,
        operationTheatre: surgery.operationTheatre
          ? {
              id: surgery.operationTheatre.id,
              name: surgery.operationTheatre.name,
            }
          : null,
      }));
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
      // Append to the single consolidated admission bill so all charges for this
      // admission accumulate on ONE bill (charge history) instead of separate bills.
      await patientBillService.addChargeToAdmissionBill(Number(admissionId.value), {
        reason: newBill.value.reason,
        totalAmount: newBill.value.totalAmount,
      });
      showAlert('success', 'Charge added to admission bill', 'Success');

      newBill.value = { reason: '', totalAmount: 0 };
      showAddBillForm.value = false;

      await loadBills();
      await loadAdmissionDetails();
    } catch {
      showAlert('error', 'Failed to add charge', 'Error');
    }
  };

  const loadTreatmentWards = async () => {
    treatmentWardsLoading.value = true;
    try {
      const response: any = await wardService.getWards('size=1000&page=0&isDeleted=false');
      const content = response?.content || response?.Content || [];
      treatmentWards.value = Array.isArray(content) ? content.filter((item: any) => !item.isDeleted).map((item: any) => ({ id: item.id, name: item.name || `Ward #${item.id}` })) : [];
    } catch (error) {
      console.error('Error loading wards:', error);
      treatmentWards.value = [];
    } finally {
      treatmentWardsLoading.value = false;
    }
  };

  const loadTreatments = async () => {
    treatmentsLoading.value = true;
    try {
      const response: any = await treatmentService.getTreatmentsByAdmissionId(Number(admissionId.value), 0, 100);
      let treatmentsList = response?.content || response?.Content || [];

      // Fetch details and vitals for each treatment session
      // Wait, we also need vitals. Let's fetch all vitals for this admission first
      const vitalsResp: any = await vitalService.getAllByAdmission(Number(admissionId.value));
      // Extract the array from the response safely
      let vitalsList = Array.isArray(vitalsResp)
        ? vitalsResp
        : Array.isArray(vitalsResp?.content || vitalsResp?.data || vitalsResp?.Data)
          ? vitalsResp.content || vitalsResp.data || vitalsResp.Data
          : [];
      // Ensure it's sorted descending by id to match treatments
      vitalsList = vitalsList.sort((a: any, b: any) => b.id - a.id);

      // We must sort treatmentsList descending FIRST so that index 0 is the newest treatment, matching index 0 of vitalsList
      treatmentsList = Array.isArray(treatmentsList) ? treatmentsList.filter((item: any) => !item.isDeleted).sort((a: any, b: any) => b.id - a.id) : [];

      for (let i = 0; i < treatmentsList.length; i++) {
        const t = treatmentsList[i];
        try {
          const detailsResp: any = await treatmentService.getTreatmentDetails(t.id);
          t.treatmentDetails = detailsResp?.data || [];

          // Match by index assuming 1:1 creation per session, or match by closest timestamp.
          // Since they are created in pairs and sorted descending, index match works best.
          t.vitalRecord = vitalsList[i] || null;
        } catch (e) {
          t.treatmentDetails = [];
          t.vitalRecord = null;
          console.log(e);
        }
      }

      treatments.value = treatmentsList;
    } catch (error) {
      console.error('Error loading treatments:', error);
      treatments.value = [];
    } finally {
      treatmentsLoading.value = false;
    }
  };

  const handleAddTreatmentSession = async (vitalsData: any, medicinesData: any[]) => {
    addingTreatment.value = true;
    try {
      // 1. Create the Treatment (Session)
      const treatResp = await treatmentService.addTreatment({
        admissionId: Number(admissionId.value),
      });

      if (treatResp?.isSuccess === false) {
        throw new Error(treatResp?.error || 'Failed to create treatment session');
      }

      const treatmentId = treatResp?.data?.id;
      if (!treatmentId) throw new Error('Treatment ID not returned');

      // 2. Add Vitals
      vitalsData.recordedByEmployeeId = 0;
      vitalsData.recordedAt = new Date().toISOString();
      await vitalService.addVitalRecord(Number(admissionId.value), vitalsData);

      // 3. Add Medicines Batch
      await treatmentService.addTreatmentDetailsBatch(treatmentId, medicinesData);

      showAlert('success', 'Treatment session recorded successfully', 'Success');
      showAddTreatmentForm.value = false;
      await loadTreatments();
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to record treatment session';
      showAlert('error', msg, 'Error');
    } finally {
      addingTreatment.value = false;
    }
  };

  const loadSurgeryOptions = async () => {
    try {
      const response: any = await surgeryCatalogService.getSurgeries('size=1000&page=0&isDeleted=false');
      const content = response?.content || response?.Content || response?.data || response?.Data || (Array.isArray(response) ? response : []);
      surgeryOptions.value = Array.isArray(content)
        ? content
            .filter((item: any) => !item.isDeleted)
            .map((item: any) => ({
              id: Number(item.id ?? item.Id),
              name: (item.cost ?? item.Cost) ? `${item.name ?? item.Name} ($${item.cost ?? item.Cost})` : (item.name ?? item.Name) || `Surgery #${item.id ?? item.Id}`,
              rawName: (item.name ?? item.Name) || `Surgery #${item.id ?? item.Id}`,
              cost: Number((item.cost ?? item.Cost ?? item.price ?? item.Price) || 0),
            }))
        : [];
    } catch (error) {
      console.error('Error loading surgeries:', error);
      surgeryOptions.value = [];
    }
  };

  const loadTheatreOptions = async () => {
    try {
      const response: any = await operationTheatreService.getOperationTheatres('size=1000&page=0&isDeleted=false');
      const content = response?.content || response?.Content || [];
      theatreOptions.value = Array.isArray(content)
        ? content
            .filter((item: any) => !item.isDeleted)
            .map((item: any) => ({
              id: item.id,
              name: item.location ? `${item.name} - ${item.location}` : item.name || `Theatre #${item.id}`,
            }))
        : [];
    } catch (error) {
      console.error('Error loading operation theatres:', error);
      theatreOptions.value = [];
    }
  };

  const loadLabTests = async () => {
    labTestsLoading.value = true;
    try {
      if (!admission.value?.patientId) return;
      const response: any = await patientLabsService.getByPatientId(admission.value.patientId);
      const content = Array.isArray(response) ? response : response?.data || response?.Data || response?.content || [];
      labTests.value = (Array.isArray(content) ? content : []).map((lab: any) => ({
        id: lab.id,
        labTestId: lab.labTestId,
        labTestName: lab.labTestName || lab.labTest?.name || `Lab Test #${lab.labTestId}`,
        labTestPrice: lab.labTestPrice || lab.labTest?.price || 0,
        status: lab.status || 'Ordered',
        details: lab.details || '',
        reportTime: lab.reportTime || lab.createdAt,
        createdAt: lab.createdAt,
      }));
    } catch (error) {
      console.error('Error loading lab tests:', error);
      labTests.value = [];
    } finally {
      labTestsLoading.value = false;
    }
  };

  const loadLabTestOptions = async () => {
    try {
      const response: any = await labTestCatalogService.getLabTests('size=1000&page=0&isDeleted=false');
      const content = response?.content || response?.Content || response?.data || response?.Data || (Array.isArray(response) ? response : []);
      labTestOptions.value = Array.isArray(content)
        ? content
            .filter((item: any) => !item.isDeleted)
            .map((item: any) => ({
              id: Number(item.id ?? item.Id),
              name: (item.price ?? item.Price) ? `${item.name ?? item.Name} ($${item.price ?? item.Price})` : (item.name ?? item.Name) || `Lab Test #${item.id ?? item.Id}`,
              rawName: (item.name ?? item.Name) || `Lab Test #${item.id ?? item.Id}`,
              price: Number((item.price ?? item.Price ?? item.cost ?? item.Cost) || 0),
            }))
        : [];
    } catch (error) {
      console.error('Error loading lab test catalog:', error);
      labTestOptions.value = [];
    }
  };

  const handleAddLabTest = async () => {
    if (!newLabTest.value.labTestId) {
      showAlert('error', 'Please select a lab test', 'Validation Error');
      return;
    }

    const selectedLabId = Number(newLabTest.value.labTestId);
    const selectedLab: any = labTestOptions.value.find((l: any) => Number(l.id) === selectedLabId);
    let price = Number(selectedLab?.price || 0);
    let labName = selectedLab?.rawName || selectedLab?.name || 'Lab Test';

    addingLabTest.value = true;
    try {
      const response = await patientLabsService.createLabOrder({
        patientId: Number(admission.value.patientId),
        patientHistoryId: Number(admission.value.patientHistoryId || 0),
        labTestId: selectedLabId,
        details: newLabTest.value.details || '',
      });

      if (response) {
        showAlert('success', 'Lab test ordered successfully', 'Success');

        if (price <= 0) {
          try {
            const lResp: any = await labTestCatalogService.getLabTestById(selectedLabId);
            const lData = lResp?.data ?? lResp?.Data ?? lResp;
            price = Number(lData?.price ?? lData?.Price ?? lData?.cost ?? lData?.Cost ?? 0);
            if (lData?.name || lData?.Name) labName = lData.name || lData.Name;
          } catch (fErr) {
            console.error('Error fetching lab test details:', fErr);
          }
        }

        if (price > 0) {
          try {
            await patientBillService.addChargeToAdmissionBill(Number(admissionId.value), {
              reason: `Lab Test: ${labName}`,
              totalAmount: price,
            });
          } catch (billErr) {
            console.error('Error auto-adding lab test charge to bill:', billErr);
          }
        }

        newLabTest.value = { labTestId: 0, details: '' };
        showAddLabTestForm.value = false;
        await Promise.all([loadLabTests(), loadBills(), loadAdmissionDetails()]);
      } else {
        showAlert('error', 'Failed to order lab test', 'Error');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to order lab test';
      showAlert('error', msg, 'Error');
    } finally {
      addingLabTest.value = false;
    }
  };

  const handleAddSurgery = async () => {
    if (!newSurgery.value.surgeryId || !newSurgery.value.operationTheatreId) {
      showAlert('error', 'Please select a surgery and an operation theatre', 'Validation Error');
      return;
    }
    if (!newSurgery.value.surgeryTime || !newSurgery.value.endTime) {
      showAlert('error', 'Please provide surgery start and end times', 'Validation Error');
      return;
    }

    const selectedSurgeryId = Number(newSurgery.value.surgeryId);
    const selectedSurgery: any = surgeryOptions.value.find((s: any) => Number(s.id) === selectedSurgeryId);
    let cost = Number(selectedSurgery?.cost || 0);
    let surgeryName = selectedSurgery?.rawName || selectedSurgery?.name || 'Surgery';

    addingSurgery.value = true;
    try {
      const response = await surgeryService.addPatientSurgery({
        admissionId: Number(admissionId.value),
        surgeryId: selectedSurgeryId,
        operationTheatreId: Number(newSurgery.value.operationTheatreId),
        surgeryTime: new Date(newSurgery.value.surgeryTime).toISOString(),
        endTime: new Date(newSurgery.value.endTime).toISOString(),
        duration: calculatedSurgeryDuration.value,
        status: 'Scheduled',
        notes: newSurgery.value.notes || '',
      });

      if (response?.isSuccess !== false) {
        showAlert('success', 'Surgery scheduled successfully', 'Success');

        if (cost <= 0) {
          try {
            const sResp: any = await surgeryCatalogService.getSurgeryById(selectedSurgeryId);
            const sData = sResp?.data ?? sResp?.Data ?? sResp;
            cost = Number(sData?.cost ?? sData?.Cost ?? sData?.price ?? sData?.Price ?? 0);
            if (sData?.name || sData?.Name) surgeryName = sData.name || sData.Name;
          } catch (fErr) {
            console.error('Error fetching surgery details:', fErr);
          }
        }

        if (cost > 0) {
          try {
            await patientBillService.addChargeToAdmissionBill(Number(admissionId.value), {
              reason: `Surgery: ${surgeryName}`,
              totalAmount: cost,
            });
          } catch (billErr) {
            console.error('Error auto-adding surgery charge to bill:', billErr);
          }
        }

        newSurgery.value = { surgeryId: 0, operationTheatreId: 0, surgeryTime: '', endTime: '', notes: '' };
        showAddSurgeryForm.value = false;
        await Promise.all([loadSurgeries(), loadBills(), loadAdmissionDetails()]);
      } else {
        showAlert('error', response?.error || 'Failed to schedule surgery', 'Error');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to schedule surgery';
      showAlert('error', msg, 'Error');
    } finally {
      addingSurgery.value = false;
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

  const handleTogglePaymentStatus = async (bill: any) => {
    try {
      const updatedIsPaid = !bill.isPaid;
      const updatedPaidAmount = updatedIsPaid ? bill.totalAmount : 0;
      const updatedRemainingBalance = updatedIsPaid ? 0 : bill.totalAmount;

      await patientBillService.updatePatientBill({
        id: bill.id,
        billType: bill.billType,
        reason: bill.reason,
        entityId: bill.entityId,
        totalAmount: bill.totalAmount,
        isPaid: updatedIsPaid,
        paidAmount: updatedPaidAmount,
        remainingBalance: updatedRemainingBalance,
        patient: { id: admission.value.patientId },
      });

      showAlert('success', updatedIsPaid ? 'Charge marked as Paid / Confirmed' : 'Charge marked as Unpaid', 'Success');
      await loadBills();
      await loadAdmissionDetails();
    } catch (err) {
      showAlert('error', 'Failed to update payment status', err);
    }
  };

  const openEditBillModal = (bill: any) => {
    editingBill.value = {
      id: bill.id,
      billType: bill.billType,
      reason: bill.reason,
      entityId: bill.entityId,
      totalAmount: bill.totalAmount,
      isPaid: bill.isPaid,
      paidAmount: bill.paidAmount,
      remainingBalance: bill.remainingBalance,
    };
    showEditBillModal.value = true;
  };

  const handleSaveEditBill = async () => {
    if (!editingBill.value || !editingBill.value.reason || editingBill.value.totalAmount <= 0) {
      showAlert('error', 'Please provide reason and valid amount', 'Validation Error');
      return;
    }
    updatingBill.value = true;
    try {
      const paidAmt = editingBill.value.isPaid ? editingBill.value.totalAmount : editingBill.value.paidAmount || 0;
      const remBal = editingBill.value.isPaid ? 0 : editingBill.value.totalAmount - paidAmt;

      await patientBillService.updatePatientBill({
        ...editingBill.value,
        paidAmount: paidAmt,
        remainingBalance: remBal,
        patient: { id: admission.value.patientId },
      });

      showAlert('success', 'Charge updated successfully', 'Success');
      showEditBillModal.value = false;
      editingBill.value = null;
      await loadBills();
      await loadAdmissionDetails();
    } catch {
      showAlert('error', 'Failed to update charge', 'Error');
    } finally {
      updatingBill.value = false;
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
        totalChargesPayable: admission.value.totalChargesPayable || 0,
        reasonForAdmission: admission.value.reasonForAdmission || 'Not specified',
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
      router.push(`/patients/profile/${admission.value.patientId}`);
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
    // Eagerly load all related data so every tab shows content immediately
    // (bills were only loaded when the charges tab was active on mount).
    await Promise.all([loadBills(), loadTreatments(), loadSurgeries(), loadLabTests()]);
    // Load dropdown data used by the Add Treatment / Add Surgery / Add Lab Test forms.
    await Promise.all([loadTreatmentWards(), loadSurgeryOptions(), loadTheatreOptions(), loadLabTestOptions()]);
  });

  const onTabChange = async (tab: string) => {
    currentTab.value = tab;
    if (tab === 'charges') {
      await loadBills();
    } else if (tab === 'treatments') {
      await loadTreatments();
    } else if (tab === 'surgeries') {
      await loadSurgeries();
    } else if (tab === 'lab-tests') {
      await loadLabTests();
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
                @click="onTabChange('lab-tests')"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors',
                  currentTab === 'lab-tests' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">
                  <LabTestIcon class="w-5 h-5" />
                  Lab Tests
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
                        <div class="space-y-1">
                          <span v-for="(line, i) in String(bill.reason || '').split('|')" :key="i" class="block text-sm text-emphasis">
                            {{ line.trim() }}
                          </span>
                        </div>
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
                        <div class="flex items-center justify-center gap-2">
                          <BaseButton :variant="bill.isPaid ? 'outline' : 'primary'" size="sm" @click="handleTogglePaymentStatus(bill)" :title="bill.isPaid ? 'Mark Unpaid' : 'Confirm Payment'">
                            {{ bill.isPaid ? 'Mark Unpaid' : 'Confirm Paid' }}
                          </BaseButton>
                          <BaseButton variant="ghost" size="sm" @click="openEditBillModal(bill)" title="Edit Charge">
                            <EditPencilIcon class="w-4 h-4 text-primary" />
                          </BaseButton>
                          <BaseButton variant="ghost" size="sm" @click="handleDeleteBill(bill.id)" class="text-danger hover:bg-danger/10" title="Delete Charge">
                            <TrashDetailedIcon class="w-4 h-4" />
                          </BaseButton>
                        </div>
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
                <p class="text-xs text-bodydark dark:text-bodydark1 mt-2">{{ bills.length }} consolidated bill{{ bills.length === 1 ? '' : 's' }} for this admission</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentTab === 'treatments'" class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark">
        <div class="p-6 border-b border-stroke dark:border-strokedark">
          <div class="flex items-center justify-between gap-4">
            <div>
              <h2 class="text-xl font-semibold text-emphasis">Treatments</h2>
              <p class="text-sm text-bodydark dark:text-bodydark1 mt-1">Treatment records for this admission</p>
            </div>
            <BaseButton variant="primary" size="md" @click="showAddTreatmentForm = !showAddTreatmentForm">
              <PlusIcon class="w-4 h-4 mr-2" />
              Add Treatment
            </BaseButton>
          </div>
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
                  <th class="text-left py-4 px-6 text-xs font-black uppercase tracking-widest text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">Session ID</th>
                  <th class="text-left py-4 px-6 text-xs font-black uppercase tracking-widest text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">
                    Administered Medicines
                  </th>
                  <th class="text-right py-4 px-6 text-xs font-black uppercase tracking-widest text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stroke dark:divide-strokedark">
                <tr v-for="treatment in treatments" :key="treatment.id" class="hover:bg-elevated/50 transition-colors">
                  <td class="py-4 px-6 align-top">
                    <span class="text-sm font-semibold text-emphasis whitespace-nowrap">Session #{{ treatment.id }}</span>
                  </td>
                  <td class="py-4 px-6">
                    <div v-if="treatment.treatmentDetails && treatment.treatmentDetails.length > 0">
                      <ul class="space-y-2">
                        <li v-for="med in treatment.treatmentDetails" :key="med.id" class="text-sm border-l-2 border-primary pl-3 bg-gray-50 dark:bg-meta-4 p-2 rounded">
                          <span class="font-medium text-emphasis">{{ med.medicine }}</span>
                          - {{ med.dosageInstructions }}
                          <div class="text-xs text-bodydark dark:text-bodydark1 mt-1">
                            {{ med.route }} • {{ med.frequency }}
                            <span v-if="med.doctorInstructions">({{ med.doctorInstructions }})</span>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div v-else class="text-sm text-bodydark dark:text-bodydark1 italic">No medicines recorded for this session.</div>
                  </td>
                  <td class="py-4 px-6 align-top text-right">
                    <BaseButton
                      variant="outline"
                      size="sm"
                      @click="
                        selectedTreatmentSession = treatment;
                        showTreatmentDetailsModal = true;
                      "
                    >
                      View Details
                    </BaseButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Treatment Session Details Modal -->
      <TreatmentSessionDetailsModal
        v-if="showTreatmentDetailsModal"
        :is-open="showTreatmentDetailsModal"
        :session="selectedTreatmentSession"
        @close="
          showTreatmentDetailsModal = false;
          selectedTreatmentSession = null;
        "
      />

      <!-- Treatment Session Modal -->
      <TreatmentSessionModal :is-open="showAddTreatmentForm" :is-submitting="addingTreatment" @close="showAddTreatmentForm = false" @submit="handleAddTreatmentSession" />

      <div v-if="currentTab === 'surgeries'" class="grid grid-cols-1 gap-6">
        <div class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark">
          <div class="p-6 border-b border-stroke dark:border-strokedark">
            <div class="flex items-center justify-between gap-4">
              <div>
                <h2 class="text-xl font-semibold text-emphasis">Surgeries</h2>
                <p class="text-sm text-bodydark dark:text-bodydark1 mt-1">Surgical procedures scheduled for this admission</p>
              </div>
              <BaseButton variant="primary" size="md" @click="showAddSurgeryForm = !showAddSurgeryForm">
                <PlusIcon class="w-4 h-4 mr-2" />
                Add Surgery
              </BaseButton>
            </div>
          </div>

          <div v-if="showAddSurgeryForm" class="p-6 bg-elevated/50 border-b border-stroke dark:border-strokedark">
            <h3 class="text-lg font-semibold text-emphasis mb-4">Schedule New Surgery</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-bodydark dark:text-bodydark1 mb-2">Surgery</label>
                <select
                  v-model="newSurgery.surgeryId"
                  class="w-full rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-form-input px-4 py-3 text-emphasis focus:border-primary focus:outline-none"
                >
                  <option :value="0" disabled>Select surgery...</option>
                  <option v-for="s in surgeryOptions" :key="s.id" :value="s.id">{{ s.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-bodydark dark:text-bodydark1 mb-2">Operation Theatre</label>
                <select
                  v-model="newSurgery.operationTheatreId"
                  class="w-full rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-form-input px-4 py-3 text-emphasis focus:border-primary focus:outline-none"
                >
                  <option :value="0" disabled>Select theatre...</option>
                  <option v-for="t in theatreOptions" :key="t.id" :value="t.id">{{ t.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-bodydark dark:text-bodydark1 mb-2">Surgery Start Time</label>
                <input
                  v-model="newSurgery.surgeryTime"
                  type="datetime-local"
                  class="w-full rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-form-input px-4 py-3 text-emphasis focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-bodydark dark:text-bodydark1 mb-2">Surgery End Time</label>
                <input
                  v-model="newSurgery.endTime"
                  type="datetime-local"
                  class="w-full rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-form-input px-4 py-3 text-emphasis focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-bodydark dark:text-bodydark1 mb-2">Duration (auto-calculated)</label>
                <div class="rounded-lg border border-stroke dark:border-strokedark bg-elevated py-3 px-4 text-sm font-medium text-emphasis">
                  {{ calculatedSurgeryDuration > 0 ? `${calculatedSurgeryDuration} minutes` : 'Select start and end time' }}
                </div>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-bodydark dark:text-bodydark1 mb-2">Notes</label>
                <textarea
                  v-model="newSurgery.notes"
                  rows="3"
                  placeholder="Enter surgery notes..."
                  class="w-full rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-form-input px-4 py-3 text-emphasis focus:border-primary focus:outline-none"
                ></textarea>
              </div>
            </div>
            <div class="flex gap-3 mt-4">
              <BaseButton variant="primary" size="md" @click="handleAddSurgery">Save Surgery</BaseButton>
              <BaseButton variant="outline" size="md" @click="showAddSurgeryForm = false">Cancel</BaseButton>
            </div>
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
      </div>

      <div v-if="currentTab === 'lab-tests'" class="grid grid-cols-1 gap-6">
        <div class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark">
          <div class="p-6 border-b border-stroke dark:border-strokedark">
            <div class="flex items-center justify-between gap-4">
              <div>
                <h2 class="text-xl font-semibold text-emphasis">Lab Tests</h2>
                <p class="text-sm text-bodydark dark:text-bodydark1 mt-1">Lab tests ordered for this admission</p>
              </div>
              <BaseButton variant="primary" size="md" @click="showAddLabTestForm = !showAddLabTestForm">
                <PlusIcon class="w-4 h-4 mr-2" />
                Add Lab Test
              </BaseButton>
            </div>
          </div>

          <div v-if="showAddLabTestForm" class="p-6 bg-elevated/50 border-b border-stroke dark:border-strokedark">
            <h3 class="text-lg font-semibold text-emphasis mb-4">Order New Lab Test</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-bodydark dark:text-bodydark1 mb-2">Lab Test</label>
                <select
                  v-model="newLabTest.labTestId"
                  class="w-full rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-form-input px-4 py-3 text-emphasis focus:border-primary focus:outline-none"
                >
                  <option :value="0" disabled>Select lab test...</option>
                  <option v-for="t in labTestOptions" :key="t.id" :value="t.id">{{ t.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-bodydark dark:text-bodydark1 mb-2">Notes / Details</label>
                <input
                  v-model="newLabTest.details"
                  type="text"
                  placeholder="Enter test details or notes..."
                  class="w-full rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-form-input px-4 py-3 text-emphasis focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div class="flex gap-3 mt-4">
              <BaseButton variant="primary" size="md" @click="handleAddLabTest" :disabled="addingLabTest">
                {{ addingLabTest ? 'Saving...' : 'Save Lab Test' }}
              </BaseButton>
              <BaseButton variant="outline" size="md" @click="showAddLabTestForm = false">Cancel</BaseButton>
            </div>
          </div>

          <div class="p-6">
            <div v-if="labTestsLoading" class="animate-pulse space-y-3">
              <div v-for="i in 3" :key="i" class="h-20 bg-elevated rounded-lg"></div>
            </div>

            <div v-else-if="labTests.length === 0" class="text-center py-16 text-bodydark dark:text-bodydark1">
              <LabTestIcon class="w-20 h-20 mx-auto mb-4 opacity-20" />
              <p class="text-lg font-medium">No lab tests ordered</p>
              <p class="text-sm mt-2">Lab test records will appear here once ordered</p>
            </div>

            <div v-else class="overflow-x-auto rounded-lg border border-stroke dark:border-strokedark">
              <table class="w-full">
                <thead class="bg-elevated/30">
                  <tr>
                    <th class="text-left py-4 px-6 text-xs font-black uppercase tracking-widest text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">Lab Test</th>
                    <th class="text-left py-4 px-6 text-xs font-black uppercase tracking-widest text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">Status</th>
                    <th class="text-left py-4 px-6 text-xs font-black uppercase tracking-widest text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">Details / Notes</th>
                    <th class="text-left py-4 px-6 text-xs font-black uppercase tracking-widest text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">Ordered Date</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-stroke dark:divide-strokedark">
                  <tr v-for="test in labTests" :key="test.id" class="hover:bg-elevated/50 transition-colors">
                    <td class="py-4 px-6">
                      <span class="text-sm font-semibold text-emphasis">{{ test.labTestName }}</span>
                    </td>
                    <td class="py-4 px-6">
                      <span
                        :class="[
                          'inline-block px-2.5 py-1 rounded-full text-xs font-semibold',
                          test.status === 'Completed'
                            ? 'bg-success/20 text-success border border-success/40'
                            : test.status === 'InProgress'
                              ? 'bg-warning/20 text-warning border border-warning/40'
                              : test.status === 'Cancelled'
                                ? 'bg-danger/20 text-danger border border-danger/40'
                                : 'bg-primary/20 text-primary border border-primary/40',
                        ]"
                      >
                        {{ test.status }}
                      </span>
                    </td>
                    <td class="py-4 px-6">
                      <span class="text-sm text-bodydark dark:text-bodydark1">{{ test.details || '-' }}</span>
                    </td>
                    <td class="py-4 px-6">
                      <span class="text-sm text-emphasis">{{ formattedDateTime(test.reportTime || test.createdAt) }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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

    <!-- Edit Bill / Charge Modal -->
    <div v-if="showEditBillModal && editingBill" class="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 p-4">
      <div class="w-full max-w-lg bg-surface rounded-2xl shadow-xl border border-stroke dark:border-strokedark p-6">
        <h3 class="text-xl font-bold text-emphasis mb-4">Edit Charge / Bill</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-bodydark dark:text-bodydark1 mb-2">Description / Reason</label>
            <textarea
              v-model="editingBill.reason"
              rows="3"
              class="w-full rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-form-input px-4 py-3 text-emphasis focus:border-primary focus:outline-none"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-bodydark dark:text-bodydark1 mb-2">Total Amount ($)</label>
            <input
              v-model.number="editingBill.totalAmount"
              type="number"
              min="0"
              class="w-full rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-form-input px-4 py-3 text-emphasis focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-bodydark dark:text-bodydark1 mb-2">Payment Status</label>
            <select
              v-model="editingBill.isPaid"
              class="w-full rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-form-input px-4 py-3 text-emphasis focus:border-primary focus:outline-none"
            >
              <option :value="false">Unpaid</option>
              <option :value="true">Paid / Confirmed</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <BaseButton variant="outline" size="md" @click="showEditBillModal = false">Cancel</BaseButton>
          <BaseButton variant="primary" size="md" @click="handleSaveEditBill" :disabled="updatingBill">
            {{ updatingBill ? 'Saving...' : 'Save Changes' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
