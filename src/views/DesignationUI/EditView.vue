<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import DesignationsService from '@/services/Designation/Designation.services';
  import RolesService from '@/services/Role/Role.services';
  import { STATUS_OPTIONS } from '@/constants/statusOptions';

  const route = useRoute();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();

  const designationService = new DesignationsService();
  const roleService = new RolesService();

  const isLoading = ref(true);
  const isSubmitting = ref(false);
  const designationId = ref<number | null>(null);
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

  const loadDetails = async () => {
    isLoading.value = true;
    try {
      const id = Number(route.params.id);
      designationId.value = id;
      const response = await designationService.getDesignationById(id);
      if (response?.data) {
        formData.value = {
          name: response.data.name || '',
          status: response.data.status || 'Active',
          roleId: response.data.role?.id ? String(response.data.role.id) : '',
          description: response.data.description || '',
          level: response.data.level || '',
          minSalary: response.data.minSalary ? String(response.data.minSalary) : '',
          maxSalary: response.data.maxSalary ? String(response.data.maxSalary) : '',
          responsibilities: response.data.responsibilities || '',
        };
      }
    } finally {
      isLoading.value = false;
    }
  };

  const submitUpdate = async () => {
    const isValid = validateForm(formData.value, {
      name: [rules.required(), rules.name()],
      roleId: [rules.required('Role classification is required')],
    });
    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const response = await designationService.updateDesignation({
        id: designationId.value!,
        name: formData.value.name,
        status: formData.value.status,
        description: formData.value.description,
        level: formData.value.level,
        minSalary: formData.value.minSalary ? Number(formData.value.minSalary) : null,
        maxSalary: formData.value.maxSalary ? Number(formData.value.maxSalary) : null,
        responsibilities: formData.value.responsibilities,
        roleId: Number(formData.value.roleId),
      });
      if (response.isSuccess) {
        showAlert('success', 'Designation updated.', 'Success');
        router.push('/designations');
      }
    } finally {
      isSubmitting.value = false;
    }
  };

  onMounted(async () => {
    await Promise.all([loadDetails(), fetchRoles()]);
  });
</script>

<template>
  <DefaultLayout>
    <div v-if="isLoading" class="animate-pulse max-w-5xl mx-auto space-y-4">
      <div class="h-8 bg-elevatedstrokedark/30 rounded-2xl w-1/3"></div>
      <div class="bg-surface rounded-3xl p-8 grid grid-cols-2 gap-6">
        <div v-for="i in 4" :key="i" class="h-14 bg-gray-50 dark:bg-strokedark/20 rounded-xl"></div>
      </div>
    </div>
    <FormViewTemplate v-else title="Update Designation" breadcrumb-title="Designations" :is-submitting="isSubmitting" submit-label="Save Changes" @submit="submitUpdate" @cancel="router.back()">
      <BaseInput
        label="Designation Title"
        v-model="formData.name"
        placeholder="e.g. Senior Consultant"
        :error="!!errors.name"
        :error-message="errors.name"
        field-required
        @change="validateField('name', formData.name, [rules.required(), rules.name()])"
      />

      <BaseSelect label="Employee Type / Role" v-model="formData.roleId" :options="roles" :error="!!errors.roleId" :error-message="errors.roleId" field-required />

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
