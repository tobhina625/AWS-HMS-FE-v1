<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import LabTestServices from '@/services/LabTest/LabTest.services';

  const router = useRouter();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();
  const labTestService = new LabTestServices();

  const isSubmitting = ref(false);
  const formData = ref<{ name: string; price: number | string | undefined }>({
    name: '',
    price: undefined,
  });

  watch(
    () => formData.value.price,
    (newVal) => {
      if (newVal == null || newVal === '') return;
      const num = Number(newVal);
      if (!Number.isNaN(num) && num < 1) {
        formData.value.price = 1;
      }
    }
  );

  const submitLabTest = async () => {
    const isValid = validateForm(formData.value, {
      name: [rules.required(), rules.labTestName()],
      price: [rules.required(), rules.minValue(1, 'Price must be 1 or greater')],
    });

    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const response = await labTestService.addLabTest({
        name: formData.value.name,
        price: Number(formData.value.price),
      });
      if (response.isSuccess) {
        showAlert('success', 'Lab test added to system registry.', 'Success');
        router.push('/lab-tests');
      } else {
        showAlert('error', response.error || 'Failed to add lab test.', 'Error');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to add lab test';
      showAlert('error', msg, 'Error');
    } finally {
      isSubmitting.value = false;
    }
  };
</script>

<template>
  <DefaultLayout>
    <FormViewTemplate title="Create New Lab Test" breadcrumb-title="Lab Tests" :is-submitting="isSubmitting" @submit="submitLabTest" @cancel="router.back()">
      <BaseInput
        label="Test Name"
        v-model="formData.name"
        placeholder="e.g. Complete Blood Count (CBC)"
        :error="!!errors.name"
        :error-message="errors.name"
        field-required
        @change="validateField('name', formData.name, [rules.required(), rules.labTestName()])"
      />

      <BaseInput
        label="Price (Rs.)"
        type="number"
        v-model="formData.price"
        placeholder="e.g. 1500"
        :min="1"
        :error="!!errors.price"
        :error-message="errors.price"
        field-required
        @change="validateField('price', formData.price, [rules.required(), rules.minValue(1, 'Price must be 1 or greater')])"
      />
    </FormViewTemplate>
  </DefaultLayout>
</template>
