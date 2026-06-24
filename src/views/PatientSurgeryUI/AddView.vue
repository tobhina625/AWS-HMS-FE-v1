<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BaseTextArea from '@/components/Base/BaseTextArea.vue';
  import PatientSurgeryServices from '@/services/PatientSurgery/PatientSurgery.services';
  import SurgeryService from '@/services/Surgery/Surgery.services';
  import OperationTheatreService from '@/services/OperationTheatre/OperationTheatre.services';
  import AdmissionServices from '@/services/Admission/Admission.services';

  const router = useRouter();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();
  const patientSurgeryService = new PatientSurgeryServices();
  const surgeryService = new SurgeryService();
  const operationTheatreService = new OperationTheatreService();
  const admissionService = new AdmissionServices();

  const isSubmitting = ref(false);
  const loadingDropdowns = ref(false);
  const surgeries = ref<{ id: number; name: string }[]>([]);
  const operationTheatres = ref<{ id: number; name: string }[]>([]);
  const admissions = ref<{ id: number; name: string }[]>([]);

  const formData = ref({
    surgeryTime: '',
    endTime: '',
    notes: '',
    surgeryId: 0,
    operationTheatreId: 0,
    admissionId: 0,
  });

  const loadSurgeries = async () => {
    try {
      const response = await surgeryService.getSurgeries('size=1000&page=0&isDeleted=false');
      const content = response.content || response.Content || [];
      surgeries.value = content.filter((item: any) => !item.isDeleted).map((item: any) => ({ id: item.id, name: item.name || `Surgery #${item.id}` }));
    } catch {
      showAlert('error', 'Failed to load surgeries.', 'Error');
    }
  };

  const loadOperationTheatres = async () => {
    try {
      const response = await operationTheatreService.getOperationTheatres('size=1000&page=0&isDeleted=false');
      const content = response.content || response.Content || [];
      operationTheatres.value = content
        .filter((item: any) => !item.isDeleted)
        .map((item: any) => ({
          id: item.id,
          name: item.location ? `${item.name} - ${item.location}` : item.name || `Theatre #${item.id}`,
        }));
    } catch {
      showAlert('error', 'Failed to load operation theatres.', 'Error');
    }
  };

  const loadAdmissions = async () => {
    try {
      const response = await admissionService.getAdmissions('size=1000&page=0&isDeleted=false');
      const content = response.content || response.Content || [];
      admissions.value = content
        .filter((item: any) => !item.isDeleted)
        .map((item: any) => {
          const patientName = item.patientHistory?.patientName || 'Unknown';
          const admissionDate = item.admissionDate ? new Date(item.admissionDate).toLocaleDateString() : '-';
          return {
            id: item.id,
            name: `Patient: ${patientName} (${admissionDate})`,
          };
        });
    } catch {
      showAlert('error', 'Failed to load admissions.', 'Error');
    }
  };

  const loadDropdownData = async () => {
    loadingDropdowns.value = true;
    try {
      await Promise.all([loadSurgeries(), loadOperationTheatres(), loadAdmissions()]);
    } finally {
      loadingDropdowns.value = false;
    }
  };

  const submitPatientSurgery = async () => {
    const isValid = validateForm(formData.value, {
      surgeryTime: [rules.required()],
      endTime: [rules.required()],
      surgeryId: [rules.requiredPositiveId('Please select a surgery')],
      operationTheatreId: [rules.requiredPositiveId('Please select an operation theatre')],
      admissionId: [rules.requiredPositiveId('Please select an admission')],
    });

    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const response = await patientSurgeryService.addPatientSurgery({
        surgeryTime: formData.value.surgeryTime,
        endTime: formData.value.endTime,
        notes: formData.value.notes,
        surgeryId: Number(formData.value.surgeryId),
        operationTheatreId: Number(formData.value.operationTheatreId),
        admissionId: Number(formData.value.admissionId),
      });
      if (response.isSuccess) {
        showAlert('success', 'Patient surgery added to system registry.', 'Success');
        router.push('/patient-surgeries');
      }
    } finally {
      isSubmitting.value = false;
    }
  };

  onMounted(() => {
    loadDropdownData();
  });
</script>

<template>
  <DefaultLayout>
    <FormViewTemplate title="Create New Patient Surgery" breadcrumb-title="Patient Surgeries" :is-submitting="isSubmitting" @submit="submitPatientSurgery" @cancel="router.back()">
      <BaseInput
        label="Surgery Start Time"
        type="datetime-local"
        v-model="formData.surgeryTime"
        :error="!!errors.surgeryTime"
        :error-message="errors.surgeryTime"
        field-required
        @change="validateField('surgeryTime', formData.surgeryTime, [rules.required()])"
      />

      <BaseInput
        label="Surgery End Time"
        type="datetime-local"
        v-model="formData.endTime"
        :error="!!errors.endTime"
        :error-message="errors.endTime"
        field-required
        @change="validateField('endTime', formData.endTime, [rules.required()])"
      />

      <BaseSelect
        label="Surgery"
        v-model="formData.surgeryId"
        :options="surgeries"
        placeholder="Select a surgery..."
        :loading="loadingDropdowns"
        :error="!!errors.surgeryId"
        :error-message="errors.surgeryId"
        field-required
        display-key="name"
        value-key="id"
        @change="validateField('surgeryId', formData.surgeryId, [rules.requiredPositiveId('Please select a surgery')])"
      />

      <BaseSelect
        label="Operation Theatre"
        v-model="formData.operationTheatreId"
        :options="operationTheatres"
        placeholder="Select an operation theatre..."
        :loading="loadingDropdowns"
        :error="!!errors.operationTheatreId"
        :error-message="errors.operationTheatreId"
        field-required
        display-key="name"
        value-key="id"
        @change="validateField('operationTheatreId', formData.operationTheatreId, [rules.requiredPositiveId('Please select an operation theatre')])"
      />

      <BaseSelect
        label="Admission"
        v-model="formData.admissionId"
        :options="admissions"
        placeholder="Select an admission..."
        :loading="loadingDropdowns"
        :error="!!errors.admissionId"
        :error-message="errors.admissionId"
        field-required
        display-key="name"
        value-key="id"
        @change="validateField('admissionId', formData.admissionId, [rules.requiredPositiveId('Please select an admission')])"
      />

      <BaseTextArea label="Notes" v-model="formData.notes" placeholder="Enter surgery notes..." :rows="4" />
    </FormViewTemplate>
  </DefaultLayout>
</template>
