<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import DepartmentsServices from '@/services/Department/Department.services';
  import { STATUS_OPTIONS } from '@/constants/statusOptions';

  const route = useRoute();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();
  const departmentService = new DepartmentsServices();

  const isLoading = ref(true);
  const isSubmitting = ref(false);
  const departmentId = ref('');
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

  const loadDetails = async () => {
    isLoading.value = true;
    try {
      departmentId.value = route.params.id.toString();
      const response = await departmentService.getDepartmentById(departmentId.value);
      if (response?.data) {
        formData.value.name = response.data.name || '';
        formData.value.status = response.data.status || 'Active';
        formData.value.description = response.data.description || '';
        formData.value.location = response.data.location || '';
        formData.value.headOfDepartment = response.data.headOfDepartment || '';
        formData.value.phone = response.data.phone || '';
        formData.value.email = response.data.email || '';
        formData.value.capacity = response.data.capacity || 0;
        formData.value.establishedDate = response.data.establishedDate ? response.data.establishedDate.split('T')[0] : '';
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
      const response = await departmentService.updateDepartment({
        id: Number(departmentId.value),
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
      if (response?.isSuccess) {
        showAlert('success', 'Department updated successfully.', 'Success');
        router.push('/departments');
      } else {
        showAlert('error', response?.error || 'Failed to update department.', 'Error');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to update department';
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
      <div class="h-8 bg-elevatedstrokedark/30 rounded-2xl w-1/3"></div>
      <div class="h-36 bg-surface rounded-3xl"></div>
    </div>
    <FormViewTemplate v-else title="Update Department" breadcrumb-title="Departments" :is-submitting="isSubmitting" submit-label="Save Changes" @submit="submitUpdate" @cancel="router.back()">
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
