<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import LoadingSkeleton from '@/components/UI/LoadingSkeleton.vue';
  import LabTestServices from '@/services/LabTest/LabTest.services';

  const router = useRouter();
  const route = useRoute();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();
  const labTestService = new LabTestServices();

  const isSubmitting = ref(false);
  const isLoading = ref(true);
  const formData = ref<{ id: number; name: string; price: number | string }>({
    id: 0,
    name: '',
    price: 0,
  });

  watch(
    () => formData.value.price,
    (newVal: number | string) => {
      if (newVal == null || newVal === '') return;
      const num = Number(newVal);
      if (!Number.isNaN(num) && num < 1) {
        formData.value.price = 1;
      }
    }
  );

  const loadDetails = async () => {
    isLoading.value = true;
    try {
      const response = await labTestService.getLabTestById(Number(route.params.id));
      if (response.data) {
        formData.value = {
          id: response.data.id,
          name: response.data.name,
          price: response.data.price,
        };
      }
    } catch {
      showAlert('error', 'Failed to load lab test details.', 'Error');
      router.push('/lab-tests');
    } finally {
      isLoading.value = false;
    }
  };

  const submitUpdate = async () => {
    const isValid = validateForm(formData.value, {
      name: [rules.required(), rules.labTestName()],
      price: [rules.required(), rules.minValue(1, 'Price must be 1 or greater')],
    });

    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const response = await labTestService.updateLabTest({
        id: formData.value.id,
        name: formData.value.name,
        price: Number(formData.value.price),
      });
      if (response.isSuccess || response.error === 'Lab test updated.') {
        showAlert('success', 'Lab test updated successfully.', 'Success');
        router.push('/lab-tests');
      } else {
        showAlert('error', response.error || 'Failed to update lab test.', 'Error');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to update lab test';
      showAlert('error', msg, 'Error');
    } finally {
      isSubmitting.value = false;
    }
  };

  onMounted(() => {
    loadDetails();
  });
</script>

<template>
  <DefaultLayout>
    <div v-if="isLoading" class="space-y-6 max-w-5xl mx-auto">
      <LoadingSkeleton />
    </div>

    <FormViewTemplate v-else title="Edit Lab Test" breadcrumb-title="Lab Tests" :breadcrumb-slug="formData.name" :is-submitting="isSubmitting" @submit="submitUpdate" @cancel="router.back()">
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
