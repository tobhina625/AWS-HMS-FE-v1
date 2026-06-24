<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BaseCheckbox from '@/components/Base/BaseCheckbox.vue';
  import DiseasesServices from '@/services/Disease/Disease.services';
  import { STATUS_OPTIONS } from '@/constants/statusOptions';

  const route = useRoute();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();
  const diseaseService = new DiseasesServices();

  const isLoading = ref(true);
  const isSubmitting = ref(false);
  const diseaseId = ref('');
  const formData = ref({
    name: '',
    status: 'Active',
    category: 'Other',
    severity: 'Moderate',
    description: '',
    isContagious: false,
    symptoms: '',
    treatment: '',
    preventionMeasures: '',
    affectedBodyPart: '',
  });

  const loadDetails = async () => {
    isLoading.value = true;
    try {
      diseaseId.value = route.params.id.toString();
      const response = await diseaseService.getDiseaseById(diseaseId.value);
      if (response?.data) {
        formData.value = {
          name: response.data.name || '',
          status: response.data.status || 'Active',
          category: response.data.category || 'Other',
          severity: response.data.severity || 'Moderate',
          description: response.data.description || '',
          isContagious: response.data.isContagious || false,
          symptoms: response.data.symptoms || '',
          treatment: response.data.treatment || '',
          preventionMeasures: response.data.preventionMeasures || '',
          affectedBodyPart: response.data.affectedBodyPart || '',
        };
      }
    } finally {
      isLoading.value = false;
    }
  };

  const submitUpdate = async () => {
    const isValid = validateForm(formData.value, { name: [rules.required(), rules.name()] });
    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const response = await diseaseService.updateDisease({
        id: Number(diseaseId.value),
        name: formData.value.name,
        status: formData.value.status,
        category: formData.value.category,
        severity: formData.value.severity,
        description: formData.value.description,
        isContagious: formData.value.isContagious,
        symptoms: formData.value.symptoms,
        treatment: formData.value.treatment,
        preventionMeasures: formData.value.preventionMeasures,
        affectedBodyPart: formData.value.affectedBodyPart,
      });
      if (response?.isSuccess) {
        showAlert('success', 'Disease record updated.', 'Success');
        router.push('/disease');
      } else {
        showAlert('error', response?.error || 'Failed to update disease.', 'Error');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to update disease';
      showAlert('error', msg, 'Error');
    } finally {
      isSubmitting.value = false;
    }
  };

  onMounted(() => loadDetails());
</script>

<template>
  <DefaultLayout>
    <div v-if="isLoading" class="animate-pulse max-w-5xl mx-auto space-y-4">
      <div class="h-8 bg-elevated rounded-2xl w-1/3"></div>
      <div class="h-36 bg-surface rounded-3xl"></div>
    </div>
    <FormViewTemplate v-else title="Update Disease Record" breadcrumb-title="Diseases" :is-submitting="isSubmitting" submit-label="Save Changes" @submit="submitUpdate" @cancel="router.back()">
      <BaseInput
        label="Disease Name"
        v-model="formData.name"
        placeholder="e.g. Chronic Hypertension"
        :error="!!errors.name"
        :error-message="errors.name"
        field-required
        @change="validateField('name', formData.name, [rules.required(), rules.name()])"
      />

      <BaseSelect label="Status" v-model="formData.status" :options="STATUS_OPTIONS.DISEASE" placeholder="Select status..." field-required />

      <BaseSelect
        label="Category"
        v-model="formData.category"
        :options="[
          { id: 'Infectious', name: 'Infectious' },
          { id: 'Chronic', name: 'Chronic' },
          { id: 'Genetic', name: 'Genetic' },
          { id: 'Autoimmune', name: 'Autoimmune' },
          { id: 'Neurological', name: 'Neurological' },
          { id: 'Cardiovascular', name: 'Cardiovascular' },
          { id: 'Respiratory', name: 'Respiratory' },
          { id: 'Oncological', name: 'Oncological' },
          { id: 'Dermatological', name: 'Dermatological' },
          { id: 'Other', name: 'Other' },
        ]"
        placeholder="Select category..."
        field-required
      />

      <BaseSelect
        label="Severity"
        v-model="formData.severity"
        :options="[
          { id: 'Mild', name: 'Mild' },
          { id: 'Moderate', name: 'Moderate' },
          { id: 'Severe', name: 'Severe' },
          { id: 'Critical', name: 'Critical' },
        ]"
        placeholder="Select severity..."
        field-required
      />

      <BaseInput label="Affected Body Part" v-model="formData.affectedBodyPart" placeholder="e.g. Heart, Lungs, Brain" />

      <div class="flex items-center gap-3">
        <BaseCheckbox label="Is Contagious" v-model="formData.isContagious" />
      </div>

      <BaseInput label="Symptoms" v-model="formData.symptoms" placeholder="Common symptoms of this disease" class="md:col-span-2" />

      <BaseInput label="Treatment" v-model="formData.treatment" placeholder="Standard treatment protocol" class="md:col-span-2" />

      <BaseInput label="Prevention Measures" v-model="formData.preventionMeasures" placeholder="How to prevent this disease" class="md:col-span-2" />

      <BaseInput label="Description" v-model="formData.description" placeholder="Brief description of the disease" class="md:col-span-2" />
    </FormViewTemplate>
  </DefaultLayout>
</template>
