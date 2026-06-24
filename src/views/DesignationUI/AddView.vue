<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import DesignationsService from '@/services/Designation/Designation.services';
  import RolesService from '@/services/Role/Role.services';
  import { STATUS_OPTIONS } from '@/constants/statusOptions';

  const router = useRouter();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();

  const designationService = new DesignationsService();
  const roleService = new RolesService();

  const isSubmitting = ref(false);
  const roles = ref<any[]>([]);

  const formData = ref({
    name: '',
    status: 'Active',
    roleId: '',
    description: '',
    level: '',
    minSalary: '',
    maxSalary: '',
    responsibilities: '',
  });

  const fetchRoles = async () => {
    const response = await roleService.getRoles();
    roles.value = response.content || [];
  };

  const submitDesignation = async () => {
    const isValid = validateForm(formData.value, {
      name: [rules.required(), rules.name()],
      roleId: [rules.required('Role classification is required')],
    });

    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const response = await designationService.addDesignation({
        name: formData.value.name,
        status: formData.value.status,
        description: formData.value.description,
        level: formData.value.level,
        minSalary: formData.value.minSalary ? Number(formData.value.minSalary) : null,
        maxSalary: formData.value.maxSalary ? Number(formData.value.maxSalary) : null,
        responsibilities: formData.value.responsibilities,
        role: { id: Number(formData.value.roleId) },
      });
      if (response.isSuccess) {
        showAlert('success', 'Professional designation added successfully.', 'Success');
        router.push('/designations');
      }
    } finally {
      isSubmitting.value = false;
    }
  };

  onMounted(() => {
    fetchRoles();
  });
</script>

<template>
  <DefaultLayout>
    <FormViewTemplate title="Create Staff Designation" breadcrumb-title="Designations" :is-submitting="isSubmitting" @submit="submitDesignation" @cancel="router.back()">
      <BaseInput
        label="Designation Title"
        v-model="formData.name"
        placeholder="e.g. Senior Consultant"
        :error="!!errors.name"
        :error-message="errors.name"
        field-required
        @change="validateField('name', formData.name, [rules.required(), rules.name()])"
      />

      <BaseSelect label="Employee Type / Role" v-model="formData.roleId" :options="roles" placeholder="Link to role group..." :error="!!errors.roleId" :error-message="errors.roleId" field-required />

      <BaseSelect label="Status" v-model="formData.status" :options="STATUS_OPTIONS.DESIGNATION" placeholder="Select status..." field-required />

      <BaseSelect
        label="Level"
        v-model="formData.level"
        :options="[
          { id: 'Junior', name: 'Junior' },
          { id: 'Mid', name: 'Mid' },
          { id: 'Senior', name: 'Senior' },
          { id: 'Lead', name: 'Lead' },
          { id: 'Director', name: 'Director' },
        ]"
        placeholder="Select level..."
      />

      <BaseInput label="Min Salary" type="number" v-model="formData.minSalary" placeholder="e.g. 30000" />

      <BaseInput label="Max Salary" type="number" v-model="formData.maxSalary" placeholder="e.g. 60000" />

      <BaseInput label="Description" v-model="formData.description" placeholder="Brief description of this designation" class="md:col-span-2" />

      <BaseInput label="Responsibilities" v-model="formData.responsibilities" placeholder="Key responsibilities for this role" class="md:col-span-2" />
    </FormViewTemplate>
  </DefaultLayout>
</template>
