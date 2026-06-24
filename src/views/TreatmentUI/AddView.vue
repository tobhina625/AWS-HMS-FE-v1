<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import TreatmentServices from '@/services/Treatment/Treatment.services';
  import WardServices from '@/services/Ward/ward.services';
  import AdmissionServices from '@/services/Admission/Admission.services';

  const router = useRouter();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();
  const treatmentService = new TreatmentServices();
  const wardService = new WardServices();
  const admissionService = new AdmissionServices();

  const isSubmitting = ref(false);
  const loadingDropdowns = ref(false);
  const wards = ref<{ id: number; name: string }[]>([]);
  const admissions = ref<{ id: number; name: string }[]>([]);

  const formData = ref({
    bedNumber: 0,
    wardId: 0,
    admissionId: 0,
  });

  const loadWards = async () => {
    try {
      const response = await wardService.getWards('size=1000&page=0&isDeleted=false');
      const content = response.content || response.Content || [];
      wards.value = content.filter((item: any) => !item.isDeleted).map((item: any) => ({ id: item.id, name: item.name || `Ward #${item.id}` }));
    } catch {
      showAlert('error', 'Failed to load wards.', 'Error');
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
      await Promise.all([loadWards(), loadAdmissions()]);
    } finally {
      loadingDropdowns.value = false;
    }
  };

  const submitTreatment = async () => {
    const isValid = validateForm(formData.value, {
      bedNumber: [rules.required(), rules.minValue(1, 'Bed number must be at least 1')],
      wardId: [rules.requiredPositiveId('Please select a ward')],
      admissionId: [rules.requiredPositiveId('Please select an admission')],
    });

    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const response = await treatmentService.addTreatment({
        bedNumber: Number(formData.value.bedNumber),
        wardId: Number(formData.value.wardId),
        admissionId: Number(formData.value.admissionId),
      });
      if (response.isSuccess) {
        showAlert('success', 'Treatment added to system registry.', 'Success');
        router.push('/treatments');
      } else {
        showAlert('error', response.error || 'Failed to add treatment.', 'Error');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to add treatment';
      showAlert('error', msg, 'Error');
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
    <FormViewTemplate title="Create New Treatment" breadcrumb-title="Treatments" :is-submitting="isSubmitting" @submit="submitTreatment" @cancel="router.back()">
      <BaseInput
        label="Bed Number"
        type="number"
        v-model="formData.bedNumber"
        placeholder="1"
        :min="1"
        :error="!!errors.bedNumber"
        :error-message="errors.bedNumber"
        field-required
        @change="validateField('bedNumber', formData.bedNumber, [rules.required(), rules.minValue(1, 'Bed number must be at least 1')])"
      />

      <BaseSelect
        label="Ward"
        v-model="formData.wardId"
        :options="wards"
        placeholder="Select a ward..."
        :loading="loadingDropdowns"
        :error="!!errors.wardId"
        :error-message="errors.wardId"
        field-required
        display-key="name"
        value-key="id"
        @change="validateField('wardId', formData.wardId, [rules.requiredPositiveId('Please select a ward')])"
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
    </FormViewTemplate>
  </DefaultLayout>
</template>
