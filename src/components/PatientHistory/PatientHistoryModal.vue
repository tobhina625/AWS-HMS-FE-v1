<script setup lang="ts">
  import '@vuepic/vue-datepicker/dist/main.css';
  import BaseModal from '@/components/Base/BaseModal.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseTextArea from '@/components/Base/BaseTextArea.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BaseSelectNative from '@/components/Base/BaseSelectNative.vue';
  import { useApiSearchDropdown } from '@/composables/useApiSearchDropdown';
  import EmployeesServices from '@/services/Employee/Employee.services';
  import DiseasesServices from '@/services/Disease/Disease.services';
  import { ref, watch } from 'vue';
  import { IPatientHistory } from '@/services/PatientHistory/PatientHistory.interface';

  const props = defineProps<{
    show: boolean;
    patientId: string;
  }>();

  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'save', payload: IPatientHistory): void;
  }>();

  const employeeServices = new EmployeesServices();
  const diseaseServices = new DiseasesServices();

  const unwrapList = (response: any) => response?.content || response?.Content || response?.data || [];

  const mapDiseaseRow = (item: any) => ({
    id: item.id ?? item.Id,
    name: (item.name ?? item.Name ?? item.diseaseName ?? item.DiseaseName ?? `${item.firstName ?? item.FirstName ?? ''} ${item.lastName ?? item.LastName ?? ''}`.trim()) || String(item.id ?? item.Id),
  });

  const patientHistory = ref({
    visitDate: '',
    isEmergency: 'false', // Using string for BaseSelectNative
    adviseAdmission: 'false',
    disease: { id: '' },
    prescriptionText: '',
    symptom: '',
    patient: { id: '' },
    employee: {
      id: '',
      designations: [{ id: '2' }],
    },
  });

  const doctorDd = useApiSearchDropdown({
    fetchDefaultPage: async () => {
      const response = await employeeServices.getEmployeesByRole(6, 'page=0&size=10');
      return unwrapList(response).map((e: any) => ({ id: e.id, name: e.name }));
    },
    fetchSearchPage: async (term) => {
      const response = await employeeServices.getEmployeesByRole(6, `page=0&size=20&searchTerm=${encodeURIComponent(term)}`);
      return unwrapList(response).map((e: any) => ({ id: e.id, name: e.name }));
    },
    getSelectedId: () => patientHistory.value.employee.id,
  });

  const diseaseDd = useApiSearchDropdown({
    fetchDefaultPage: async () => {
      const response = await diseaseServices.getDiseases('page=0&size=10');
      return unwrapList(response).map(mapDiseaseRow);
    },
    fetchSearchPage: async (term) => {
      const response = await diseaseServices.getDiseases(`page=0&size=20&searchTerm=${encodeURIComponent(term)}`);
      return unwrapList(response).map(mapDiseaseRow);
    },
    getSelectedId: () => patientHistory.value.disease.id,
  });

  const diseaseEmptyMessage = diseaseDd.emptyMessage();

  watch(
    () => props.show,
    async (isVisible) => {
      if (isVisible) {
        await Promise.all([doctorDd.loadDefault(), diseaseDd.loadDefault()]);
      }
    }
  );

  const onSave = () => {
    const token = localStorage.getItem('hms-token');
    if (!token) {
      console.error('No hms-token found – cannot determine doctor id.');
      return;
    }

    let empId: string | number = '';
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      empId = tokenPayload.nameid;
    } catch {
      console.error('Failed to parse hms-token.');
      return;
    }

    if (!empId) {
      console.error('nameid claim missing in hms-token.');
      return;
    }

    const payload: IPatientHistory = {
      visitDate: new Date().toISOString(),
      isEmergency: patientHistory.value.isEmergency === 'true',
      adviseAdmission: patientHistory.value.adviseAdmission === 'true',

      symptom: patientHistory.value.symptom,
      prescriptionText: patientHistory.value.prescriptionText,

      patient: {
        id: Number(props.patientId),
      },

      employee: {
        id: Number(empId),
      },

      disease: {
        id: Number(patientHistory.value.disease.id),
      },
    };

    emit('save', payload);
  };
</script>

<template>
  <BaseModal :show="show" title="Add Patient History" size="md" @close="emit('close')">
    <!-- Visit Details -->
    <div class="space-y-4">
      <h3 class="text-base font-black text-muted uppercase tracking-widest pb-1 border-b border-stroke dark:border-strokedark">Visit Details</h3>

      <BaseSelectNative
        label="Any Emergency?"
        v-model="patientHistory.isEmergency"
        :options="[
          { value: 'true', label: 'Yes' },
          { value: 'false', label: 'No' },
        ]"
      />

      <BaseSelectNative
        label="Did Doctor Advise Admission?"
        v-model="patientHistory.adviseAdmission"
        :options="[
          { value: 'true', label: 'Yes' },
          { value: 'false', label: 'No' },
        ]"
      />
    </div>

    <!-- Disease -->
    <div class="mt-6">
      <BaseSelect
        label="Select Disease"
        v-model="patientHistory.disease.id"
        :options="diseaseDd.items"
        :loading="diseaseDd.loading"
        :empty-message="diseaseEmptyMessage"
        placeholder="Select disease or type to search…"
        @search="diseaseDd.onSearch"
      />
    </div>

    <!-- Symptoms -->
    <div class="mt-6">
      <h3 class="text-base font-black text-muted uppercase tracking-widest pb-1 border-b border-stroke dark:border-strokedark mb-4">Symptoms</h3>
      <BaseTextArea label="Symptoms" placeholder="Enter symptoms" v-model="patientHistory.symptom" />
    </div>
    <div class="mt-6">
      <h3 class="text-base font-black text-muted uppercase tracking-widest pb-1 border-b border-stroke dark:border-strokedark mb-4">Prescription</h3>
      <BaseTextArea label="Prescription" placeholder="Enter prescription" v-model="patientHistory.prescriptionText" />
    </div>

    <!-- Footer -->
    <template #footer>
      <BaseButton variant="outline" @click="emit('close')">Cancel</BaseButton>
      <BaseButton @click="onSave">Save History</BaseButton>
    </template>
  </BaseModal>
</template>
