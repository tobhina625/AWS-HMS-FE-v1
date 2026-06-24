<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import RoleServices from '@/services/Role/Role.services';

  const router = useRouter();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();
  const roleService = new RoleServices();

  const isSubmitting = ref(false);
  const formData = ref({
    name: '',
  });

  const submitRole = async () => {
    const isValid = validateForm(formData.value, {
      name: [rules.required(), rules.name()],
    });

    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const response = await roleService.addRole({
        name: formData.value.name,
      });
      if (response.isSuccess) {
        showAlert('success', 'Role added to system registry.', 'Success');
        router.push('/roles');
      }
    } finally {
      isSubmitting.value = false;
    }
  };
</script>

<template>
  <DefaultLayout>
    <FormViewTemplate title="Create New Role" breadcrumb-title="Roles" :is-submitting="isSubmitting" @submit="submitRole" @cancel="router.back()">
      <BaseInput
        label="Role Name"
        v-model="formData.name"
        placeholder="e.g. Nurse Manager"
        :error="!!errors.name"
        :error-message="errors.name"
        field-required
        @change="validateField('name', formData.name, [rules.required(), rules.name()])"
      />
    </FormViewTemplate>
  </DefaultLayout>
</template>
