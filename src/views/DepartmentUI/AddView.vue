<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import DepartmentsServices from '@/services/Department/Department.services';
  import { STATUS_OPTIONS } from '@/constants/statusOptions';

  const router = useRouter();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();
  const departmentService = new DepartmentsServices();

  const isSubmitting = ref(false);
  const formData = ref({
    name: '',
    status: 'Active',
    description: '',
    location: '',
    headOfDepartment: '',
    phone: '',
    email: '',
    capacity: 0,
    establishedDate: '',
  });

  const submitDepartment = async () => {
    const isValid = validateForm(formData.value, {
      name: [rules.required(), rules.name()],
    });

    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const response = await departmentService.addDepartment({
        name: formData.value.name,
        status: formData.value.status,
        description: formData.value.description,
        location: formData.value.location,
        headOfDepartment: formData.value.headOfDepartment,
        phone: formData.value.phone,
        email: formData.value.email,
        capacity: Number(formData.value.capacity),
        establishedDate: formData.value.establishedDate,
      });
      if (response.isSuccess) {
        showAlert('success', 'Department added to system registry.', 'Success');
        router.push('/departments');
      } else {
        showAlert('error', response.error || 'Failed to add department.', 'Error');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to add department';
      showAlert('error', msg, 'Error');
    } finally {
      isSubmitting.value = false;
    }
  };
</script>

<template>
  <DefaultLayout>
    <FormViewTemplate title="Create New Department" breadcrumb-title="Departments" :is-submitting="isSubmitting" @submit="submitDepartment" @cancel="router.back()">
      <BaseInput
        label="Department Name"
        v-model="formData.name"
        placeholder="e.g. Oncology Unit"
        :error="!!errors.name"
        :error-message="errors.name"
        field-required
        @change="validateField('name', formData.name, [rules.required(), rules.name()])"
      />

      <BaseSelect label="Status" v-model="formData.status" :options="STATUS_OPTIONS.DEPARTMENT" placeholder="Select status..." field-required />

      <BaseInput label="Head of Department" v-model="formData.headOfDepartment" placeholder="e.g. Dr. Sarah Khan" />

      <BaseInput label="Location" v-model="formData.location" placeholder="e.g. Building A, Floor 2" />

      <BaseInput label="Phone" v-model="formData.phone" placeholder="e.g. +92-42-35791111" />

      <BaseInput label="Email" v-model="formData.email" placeholder="e.g. oncology@hospital.com" />

      <BaseInput label="Capacity (Max Staff)" type="number" v-model="formData.capacity" placeholder="e.g. 50" />

      <BaseInput label="Established Date" type="date" v-model="formData.establishedDate" />

      <BaseInput label="Description" v-model="formData.description" placeholder="Brief description of the department" class="md:col-span-2" />
    </FormViewTemplate>
  </DefaultLayout>
</template>
