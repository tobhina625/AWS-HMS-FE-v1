<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  // import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import PatientHistoryServices from '@/services/PatientHistory/PatientHistory.services';
  import PatientDiagnosisService from '@/services/PatientDiagnosis/PatientDiagnosis.services';
  import PrescriptionService from '@/services/Prescription/Prescription.services';
  import PatientLabsService from '@/services/PatientLabs/PatientLabs.services';
  import DiseasesServices from '@/services/Disease/Disease.services';
  import LabTestServices from '@/services/LabTest/LabTest.services';
  import type { IPatientDiagnosis } from '@/services/PatientDiagnosis/PatientDiagnosis.interface';
  import type { IPrescription } from '@/services/Prescription/Prescription.interface';
  import type { IDisease } from '@/services/Disease/Disease.dto';
  import type { ILabTest } from '@/services/LabTest/LabTest.dto';
  import useAlert from '@/plugins/alert/useAlert';
  import PatientsServices from '@/services/Patient/patient.services';

  const route = useRoute();
  const router = useRouter();
  const { showAlert } = useAlert();

  const historyService = new PatientHistoryServices();
  const diagnosisService = new PatientDiagnosisService();
  const prescriptionService = new PrescriptionService();
  const labService = new PatientLabsService();
  const patientService = new PatientsServices();
  const diseaseService = new DiseasesServices();
  const labTestService = new LabTestServices();

  const encounterId = ref<number>(0);
  const patientId = ref<number>(0);
  const loading = ref(true);
  const saving = ref(false);
  const activeSection = ref('vitals');

  const encounter = ref<any>(null);
  const patient = ref<any>(null);
  const diagnoses = ref<IPatientDiagnosis[]>([]);
  const prescriptions = ref<IPrescription[]>([]);
  const labOrders = ref<any[]>([]);
  const diseases = ref<IDisease[]>([]);
  const labTests = ref<ILabTest[]>([]);

  // Vitals form
  const vitalsForm = ref({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    pulse: '',
    respiratoryRate: '',
    symptom: '',
    advice: '',
    followUpDate: '',
    encounterStatus: 'InProgress',
  });

  // Diagnosis form
  const showDxModal = ref(false);
  const dxForm = ref<IPatientDiagnosis>({
    patientId: 0,
    patientHistoryId: 0,
    diseaseName: '',
    diseaseId: undefined,
    diagnosisType: 'Primary',
    status: 'Active',
  });

  // Prescription form
  const showRxModal = ref(false);
  const rxForm = ref<IPrescription>({
    patientId: 0,
    patientHistoryId: 0,
    medicine: '',
    dose: '',
    route: 'Oral',
    frequency: '',
    duration: '',
    instructions: '',
    status: 'Active',
  });

  // Lab order form
  const showLabModal = ref(false);
  // const labTests = ref<any[]>([]);
  const labForm = ref({ patientId: 0, patientHistoryId: 0, labTestId: 0, details: '', branchId: 1 });

  const loadData = async () => {
    loading.value = true;
    try {
      encounterId.value = Number(route.params.id);
      const enc = await historyService.getPatientHistoryWithDetails(encounterId.value, 'patientLabs');
      encounter.value = enc?.data || enc;
      if (encounter.value) {
        patientId.value = encounter.value.patient.id;
        vitalsForm.value = {
          bloodPressure: encounter.value.bloodPressure || '',
          heartRate: encounter.value.heartRate || '',
          temperature: encounter.value.temperature || '',
          weight: encounter.value.weight || '',
          height: encounter.value.height || '',
          pulse: encounter.value.pulse || '',
          respiratoryRate: encounter.value.respiratoryRate || '',
          symptom: encounter.value.symptom || '',
          advice: encounter.value.advice || '',
          followUpDate: encounter.value.followUpDate ? encounter.value.followUpDate.substring(0, 10) : '',
          encounterStatus: encounter.value.encounterStatus || 'InProgress',
        };

        const patRes = await patientService.getPatientById(patientId.value.toString());
        patient.value = patRes?.data;

        const dxData = await diagnosisService.getByEncounterId(encounterId.value);
        diagnoses.value = Array.isArray(dxData) ? dxData : dxData?.data || [];

        const rxData = await prescriptionService.getByEncounterId(encounterId.value);
        prescriptions.value = Array.isArray(rxData) ? rxData : rxData?.data || [];

        const labData = await labService.getByEncounterId(encounterId.value);
        labOrders.value = Array.isArray(labData) ? labData : labData?.data || [];
      }
    } catch (e) {
      console.error(e);
      showAlert('error', 'Failed to load encounter data.', 'Error');
    } finally {
      loading.value = false;
    }
  };

  const loadOptions = async () => {
    try {
      const [diseaseRes, labTestRes] = await Promise.all([diseaseService.getDiseases('page=0&size=100'), labTestService.getLabTests('page=0&size=100')]);
      diseases.value = (diseaseRes as any)?.content || (diseaseRes as any)?.data?.content || [];
      labTests.value = (labTestRes as any)?.content || (labTestRes as any)?.data?.content || [];
    } catch (e) {
      console.error('Failed to load catalog options:', e);
    }
  };

  const onDiseaseChange = () => {
    const d = diseases.value.find((x) => x.id === dxForm.value.diseaseId);
    dxForm.value.diseaseName = d?.name || '';
  };

  const saveVitals = async () => {
    saving.value = true;
    try {
      await historyService.updatePatientHistory({
        id: encounterId.value,
        patientId: patientId.value,
        ...vitalsForm.value,
      });
      showAlert('success', 'Encounter updated.', 'Saved');
    } catch {
      showAlert('error', 'Failed to save encounter.', 'Error');
    } finally {
      saving.value = false;
    }
  };

  const completeEncounter = async () => {
    vitalsForm.value.encounterStatus = 'Completed';
    await saveVitals();
    showAlert('success', 'Encounter marked as Completed.', 'Completed');
  };

  const addDiagnosis = async () => {
    if (!dxForm.value.diseaseId) return;
    try {
      await diagnosisService.create({ ...dxForm.value, patientId: patientId.value, patientHistoryId: encounterId.value });
      showAlert('success', 'Diagnosis added.', 'Success');
      showDxModal.value = false;
      dxForm.value = { patientId: patientId.value, patientHistoryId: encounterId.value, diseaseName: '', diseaseId: undefined, diagnosisType: 'Primary', status: 'Active' };
    } catch (error) {
      console.error('Add diagnosis failed:', error);
      showAlert('error', 'Failed to add diagnosis.', 'Error');
      return;
    }
    // Refresh the list separately - a failed reload must not mask a successful add.
    try {
      const dxData = await diagnosisService.getByEncounterId(encounterId.value);
      diagnoses.value = Array.isArray(dxData) ? dxData : dxData?.data || [];
    } catch (e) {
      console.error('Failed to refresh diagnoses:', e);
    }
  };

  const addPrescription = async () => {
    if (!rxForm.value.medicine) return;
    try {
      await prescriptionService.create({ ...rxForm.value, patientId: patientId.value, patientHistoryId: encounterId.value });
      showAlert('success', 'Prescription added.', 'Success');
      showRxModal.value = false;
      rxForm.value = { patientId: patientId.value, patientHistoryId: encounterId.value, medicine: '', dose: '', route: 'Oral', frequency: '', duration: '', instructions: '', status: 'Active' };
    } catch (error) {
      console.error('Add prescription failed:', error);
      showAlert('error', 'Failed to add prescription.', 'Error');
      return;
    }
    // Refresh the list separately - a failed reload must not mask a successful add.
    try {
      const rxData = await prescriptionService.getByEncounterId(encounterId.value);
      prescriptions.value = Array.isArray(rxData) ? rxData : rxData?.data || [];
    } catch (e) {
      console.error('Failed to refresh prescriptions:', e);
    }
  };

  const addLabOrder = async () => {
    if (!labForm.value.labTestId) return;
    try {
      await labService.createLabOrder({ ...labForm.value, patientId: patientId.value, patientHistoryId: encounterId.value });
      showAlert('success', 'Lab order created.', 'Success');
      showLabModal.value = false;
    } catch (error) {
      console.error('Create lab order failed:', error);
      showAlert('error', 'Failed to create lab order.', 'Error');
      return;
    }
    // Refresh the list separately - a failed reload must not mask a successful add.
    try {
      const labData = await labService.getByEncounterId(encounterId.value);
      labOrders.value = Array.isArray(labData) ? labData : labData?.data || [];
    } catch (e) {
      console.error('Failed to refresh lab orders:', e);
    }
  };

  const openDxModal = () => {
    dxForm.value = { patientId: patientId.value, patientHistoryId: encounterId.value, diseaseName: '', diseaseId: undefined, diagnosisType: 'Primary', status: 'Active' };
    showDxModal.value = true;
  };

  const openRxModal = () => {
    rxForm.value = { patientId: patientId.value, patientHistoryId: encounterId.value, medicine: '', dose: '', route: 'Oral', frequency: '', duration: '', instructions: '', status: 'Active' };
    showRxModal.value = true;
  };

  const sections = [
    { id: 'vitals', label: 'Vitals & Notes', icon: '🩺' },
    { id: 'diagnosis', label: 'Diagnoses', icon: '🔬' },
    { id: 'prescriptions', label: 'Prescriptions', icon: '💊' },
    { id: 'labs', label: 'Lab Orders', icon: '🧪' },
  ];

  onMounted(() => {
    loadData();
    loadOptions();
  });
</script>

<template>
  <DefaultLayout>
    <BreadcrumbDefault pageTitle="Clinical Encounter" />

    <!-- Loading -->
    <div v-if="loading" class="mt-6 space-y-4 animate-pulse">
      <div class="h-32 bg-surface rounded-2xl border border-stroke dark:border-strokedark"></div>
      <div class="h-64 bg-surface rounded-2xl border border-stroke dark:border-strokedark"></div>
    </div>

    <div v-else class="mt-6 space-y-6">
      <!-- Patient Header -->
      <div class="bg-surface rounded-2xl border border-stroke dark:border-strokedark p-5">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md">
              <span class="text-white font-bold text-lg">{{ patient?.firstName?.charAt(0) || '?' }}{{ patient?.lastName?.charAt(0) || '' }}</span>
            </div>
            <div>
              <h2 class="text-xl font-bold text-emphasis">{{ patient?.firstName }} {{ patient?.lastName }}</h2>
              <p class="text-sm text-bodydark dark:text-bodydark1">
                Encounter #{{ encounterId }} &bull;
                <span :class="encounter?.encounterStatus === 'Completed' ? 'text-success' : 'text-warning'">
                  {{ encounter?.encounterStatus || 'InProgress' }}
                </span>
                &bull; {{ encounter?.visitDate ? new Date(encounter.visitDate).toLocaleDateString() : 'N/A' }}
              </p>
            </div>
          </div>
          <div class="flex gap-3">
            <BaseButton variant="outline" size="md" @click="router.back()">← Back</BaseButton>
            <BaseButton variant="primary" size="md" @click="saveVitals" :loading="saving">Save</BaseButton>
            <BaseButton v-if="encounter?.encounterStatus !== 'Completed'" size="md" class="!bg-success !text-white hover:!bg-success/90" @click="completeEncounter">✓ Complete</BaseButton>
          </div>
        </div>
      </div>

      <!-- Sections Nav -->
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="s in sections"
          :key="s.id"
          @click="activeSection = s.id"
          :class="[
            'px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
            activeSection === s.id
              ? 'bg-primary text-white shadow-md shadow-primary/25'
              : 'bg-surface border border-stroke dark:border-strokedark text-bodydark hover:border-primary hover:text-primary',
          ]"
        >
          {{ s.icon }} {{ s.label }}
          <span v-if="s.id === 'diagnosis' && diagnoses.length" class="ml-1.5 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{{ diagnoses.length }}</span>
          <span v-if="s.id === 'prescriptions' && prescriptions.length" class="ml-1.5 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{{ prescriptions.length }}</span>
          <span v-if="s.id === 'labs' && labOrders.length" class="ml-1.5 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{{ labOrders.length }}</span>
        </button>
      </div>

      <!-- Vitals & Notes Section -->
      <div v-if="activeSection === 'vitals'" class="bg-surface rounded-2xl border border-stroke dark:border-strokedark p-6">
        <h3 class="text-lg font-semibold text-emphasis mb-5 flex items-center gap-2">🩺 Vitals & Clinical Notes</h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div
            v-for="vital in [
              { label: 'Blood Pressure', key: 'bloodPressure', placeholder: '120/80 mmHg' },
              { label: 'Heart Rate', key: 'heartRate', placeholder: '75 bpm' },
              { label: 'Temperature', key: 'temperature', placeholder: '98.6 °F' },
              { label: 'Weight', key: 'weight', placeholder: '70 kg' },
              { label: 'Height', key: 'height', placeholder: '170 cm' },
              { label: 'Pulse', key: 'pulse', placeholder: '72 /min' },
              { label: 'Respiratory Rate', key: 'respiratoryRate', placeholder: '16 /min' },
            ]"
            :key="vital.key"
          >
            <label class="block text-sm font-medium text-emphasis mb-1">{{ vital.label }}</label>
            <input
              v-model="(vitalsForm as any)[vital.key]"
              type="text"
              :placeholder="vital.placeholder"
              class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary text-sm"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-emphasis mb-1">Presenting Symptoms</label>
            <textarea
              v-model="vitalsForm.symptom"
              rows="3"
              placeholder="Describe patient's symptoms..."
              class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary text-sm resize-none"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-emphasis mb-1">Advice / Clinical Notes</label>
            <textarea
              v-model="vitalsForm.advice"
              rows="3"
              placeholder="Doctor's advice and notes..."
              class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary text-sm resize-none"
            ></textarea>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-emphasis mb-1">Follow-up Date</label>
            <input
              v-model="vitalsForm.followUpDate"
              type="date"
              class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-emphasis mb-1">Encounter Status</label>
            <select
              v-model="vitalsForm.encounterStatus"
              class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary text-sm"
            >
              <option>InProgress</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>
        </div>

        <div class="mt-5 flex justify-end">
          <BaseButton variant="primary" @click="saveVitals" :loading="saving">Save Vitals & Notes</BaseButton>
        </div>
      </div>

      <!-- Diagnosis Section -->
      <div v-if="activeSection === 'diagnosis'" class="bg-surface rounded-2xl border border-stroke dark:border-strokedark p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-semibold text-emphasis">🔬 Diagnoses</h3>
          <BaseButton variant="primary" size="sm" @click="openDxModal">+ Add Diagnosis</BaseButton>
        </div>

        <div v-if="!diagnoses.length" class="text-center py-12">
          <div class="text-4xl mb-3">🔬</div>
          <p class="text-bodydark">No diagnoses recorded yet.</p>
        </div>

        <div v-else class="space-y-3">
          <div v-for="dx in diagnoses" :key="dx.id" class="flex items-center justify-between p-4 bg-elevated rounded-xl">
            <div>
              <div class="flex items-center gap-3">
                <span class="font-semibold text-emphasis">{{ dx.diseaseName }}</span>
                <span v-if="dx.diagnosisCode" class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{{ dx.diagnosisCode }}</span>
                <span class="text-xs bg-elevated border border-stroke dark:border-strokedark px-2 py-0.5 rounded-full text-bodydark">{{ dx.diagnosisType }}</span>
              </div>
              <div class="text-sm text-bodydark mt-1">
                Status:
                <span :class="dx.status === 'Active' ? 'text-danger' : 'text-success'">{{ dx.status }}</span>
                <span v-if="dx.notes">&bull; {{ dx.notes }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Prescriptions Section -->
      <div v-if="activeSection === 'prescriptions'" class="bg-surface rounded-2xl border border-stroke dark:border-strokedark p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-semibold text-emphasis">💊 Prescriptions</h3>
          <BaseButton variant="primary" size="sm" @click="openRxModal">+ Add Prescription</BaseButton>
        </div>

        <div v-if="!prescriptions.length" class="text-center py-12">
          <div class="text-4xl mb-3">💊</div>
          <p class="text-bodydark">No prescriptions recorded yet.</p>
        </div>

        <div v-else class="space-y-3">
          <div v-for="rx in prescriptions" :key="rx.id" class="p-4 bg-elevated rounded-xl grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p class="text-xs text-bodydark">Medicine</p>
              <p class="font-semibold text-emphasis">{{ rx.medicine }}</p>
            </div>
            <div>
              <p class="text-xs text-bodydark">Dose / Route</p>
              <p class="text-emphasis">{{ rx.dose || '—' }} / {{ rx.route || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-bodydark">Frequency / Duration</p>
              <p class="text-emphasis">{{ rx.frequency || '—' }} for {{ rx.duration || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-bodydark">Status</p>
              <span :class="['text-sm font-medium', rx.status === 'Active' ? 'text-success' : 'text-bodydark']">{{ rx.status }}</span>
            </div>
            <div v-if="rx.instructions" class="col-span-full text-xs text-bodydark italic">📝 {{ rx.instructions }}</div>
          </div>
        </div>
      </div>

      <!-- Lab Orders Section -->
      <div v-if="activeSection === 'labs'" class="bg-surface rounded-2xl border border-stroke dark:border-strokedark p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-semibold text-emphasis">🧪 Lab Orders</h3>
          <BaseButton variant="primary" size="sm" @click="showLabModal = true">+ Order Lab Test</BaseButton>
        </div>

        <div v-if="!labOrders.length" class="text-center py-12">
          <div class="text-4xl mb-3">🧪</div>
          <p class="text-bodydark">No lab orders for this encounter.</p>
        </div>

        <div v-else class="space-y-3">
          <div v-for="lab in labOrders" :key="lab.id" class="flex items-center justify-between p-4 bg-elevated rounded-xl">
            <div>
              <p class="font-semibold text-emphasis">{{ lab.labTestName || 'Lab Test #' + lab.labTestId }}</p>
              <p class="text-sm text-bodydark">{{ lab.details || 'No notes' }}</p>
            </div>
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-medium',
                lab.status === 'Completed' ? 'bg-success/10 text-success' : lab.status === 'InProgress' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary',
              ]"
            >
              {{ lab.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Diagnosis Modal -->
    <Teleport to="body">
      <div v-if="showDxModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showDxModal = false"></div>
        <div class="relative bg-white dark:bg-boxdark rounded-2xl shadow-2xl w-full max-w-md p-6">
          <h3 class="text-xl font-bold text-emphasis mb-5">Add Diagnosis</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-emphasis mb-1">
                Disease
                <span class="text-danger">*</span>
              </label>
              <select
                v-model="dxForm.diseaseId"
                @change="onDiseaseChange"
                class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary"
              >
                <option :value="undefined" disabled>Select a disease</option>
                <option v-for="d in diseases" :key="d.id" :value="d.id">{{ d.name }}</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-emphasis mb-1">ICD Code</label>
                <input
                  v-model="dxForm.diagnosisCode"
                  type="text"
                  placeholder="e.g. I10"
                  class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-emphasis mb-1">Type</label>
                <select
                  v-model="dxForm.diagnosisType"
                  class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary"
                >
                  <option>Primary</option>
                  <option>Secondary</option>
                  <option>Working</option>
                  <option>Final</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-emphasis mb-1">Notes</label>
              <input
                v-model="dxForm.notes"
                type="text"
                placeholder="Additional notes..."
                class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <BaseButton variant="outline" class="flex-1" @click="showDxModal = false">Cancel</BaseButton>
            <BaseButton variant="primary" class="flex-1" @click="addDiagnosis">Add Diagnosis</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Add Prescription Modal -->
    <Teleport to="body">
      <div v-if="showRxModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showRxModal = false"></div>
        <div class="relative bg-white dark:bg-boxdark rounded-2xl shadow-2xl w-full max-w-lg p-6">
          <h3 class="text-xl font-bold text-emphasis mb-5">Add Prescription</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-emphasis mb-1">
                Medicine
                <span class="text-danger">*</span>
              </label>
              <input
                v-model="rxForm.medicine"
                type="text"
                placeholder="e.g. Amoxicillin 500mg"
                class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary"
              />
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-sm font-medium text-emphasis mb-1">Dose</label>
                <input
                  v-model="rxForm.dose"
                  type="text"
                  placeholder="500mg"
                  class="w-full border border-stroke dark:border-strokedark rounded-lg px-3 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-emphasis mb-1">Route</label>
                <select
                  v-model="rxForm.route"
                  class="w-full border border-stroke dark:border-strokedark rounded-lg px-3 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary text-sm"
                >
                  <option>Oral</option>
                  <option>IV</option>
                  <option>IM</option>
                  <option>SC</option>
                  <option>Topical</option>
                  <option>Inhalation</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-emphasis mb-1">Frequency</label>
                <input
                  v-model="rxForm.frequency"
                  type="text"
                  placeholder="TID, QID, BID"
                  class="w-full border border-stroke dark:border-strokedark rounded-lg px-3 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary text-sm"
                />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-emphasis mb-1">Duration</label>
                <input
                  v-model="rxForm.duration"
                  type="text"
                  placeholder="7 days, 2 weeks"
                  class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-emphasis mb-1">Status</label>
                <select v-model="rxForm.status" class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary">
                  <option>Active</option>
                  <option>Completed</option>
                  <option>Discontinued</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-emphasis mb-1">Instructions</label>
              <input
                v-model="rxForm.instructions"
                type="text"
                placeholder="e.g. Take after meals"
                class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <BaseButton variant="outline" class="flex-1" @click="showRxModal = false">Cancel</BaseButton>
            <BaseButton variant="primary" class="flex-1" @click="addPrescription">Add Prescription</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Add Lab Order Modal -->
    <Teleport to="body">
      <div v-if="showLabModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showLabModal = false"></div>
        <div class="relative bg-white dark:bg-boxdark rounded-2xl shadow-2xl w-full max-w-md p-6">
          <h3 class="text-xl font-bold text-emphasis mb-5">Order Lab Test</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-emphasis mb-1">
                Lab Test
                <span class="text-danger">*</span>
              </label>
              <select
                v-model.number="labForm.labTestId"
                class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary"
              >
                <option :value="0" disabled>Select a lab test</option>
                <option v-for="t in labTests" :key="t.id" :value="t.id">{{ t.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-emphasis mb-1">Notes</label>
              <input
                v-model="labForm.details"
                type="text"
                placeholder="Clinical indication..."
                class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <BaseButton variant="outline" class="flex-1" @click="showLabModal = false">Cancel</BaseButton>
            <BaseButton variant="primary" class="flex-1" @click="addLabOrder">Order Test</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </DefaultLayout>
</template>
