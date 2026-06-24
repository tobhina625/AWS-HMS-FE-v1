<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import LoadingSkeleton from '@/components/UI/LoadingSkeleton.vue';
  import RoleServices from '@/services/Role/Role.services';

  const router = useRouter();
  const route = useRoute();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();
  const roleService = new RoleServices();

  const isSubmitting = ref(false);
  const isLoading = ref(true);
  const formData = ref({
    id: 0,
    name: '',
  });

  const loadDetails = async () => {
    isLoading.value = true;
    try {
      const response = await roleService.getRoleById(Number(route.params.id));
      if (response.data) {
        formData.value = {
          id: response.data.id,
          name: response.data.name,
        };
      }
    } catch {
      showAlert('error', 'Failed to load role details.', 'Error');
      router.push('/roles');
    } finally {
      isLoading.value = false;
    }
  };

  const submitUpdate = async () => {
    const isValid = validateForm(formData.value, {
      name: [rules.required(), rules.name()],
    });

    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const response = await roleService.updateRole({
        id: formData.value.id,
        name: formData.value.name,
      });
      if (response.isSuccess) {
        showAlert('success', 'Role updated successfully.', 'Success');
        router.push('/roles');
      }
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

    <FormViewTemplate v-else title="Edit Role" breadcrumb-title="Roles" :breadcrumb-slug="formData.name" :is-submitting="isSubmitting" @submit="submitUpdate" @cancel="router.back()">
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
