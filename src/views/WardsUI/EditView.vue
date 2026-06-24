<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import WardsServices from '@/services/Ward/ward.services';
  import DepartmentsServices from '@/services/Department/Department.services';
  import { STATUS_OPTIONS } from '@/constants/statusOptions';

  const route = useRoute();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();

  const wardService = new WardsServices();
  const departmentService = new DepartmentsServices();

  const isLoading = ref(true);
  const isSubmitting = ref(false);
  const wardId = ref('');

  const departments = ref<any[]>([]);
  const deptPage = ref(0);
  const hasMoreDepts = ref(true);

  const formData = ref({
    name: '',
    noOfBeds: '',
    noOfOxygenSlots: '',
    status: 'Active',
    description: '',
    location: '',
    departmentId: '',
  });

  const positiveNumberRule = { validate: (v: any) => !v || (Number(v) > 0 && Number(v) <= 1000) || 'Must be greater than 0' };

  const fetchDepartments = async (reset = false) => {
    if (reset) {
      deptPage.value = 0;
      departments.value = [];
      hasMoreDepts.value = true;
    }
    const response = await departmentService.getDepartments(`page=${deptPage.value}&size=10`);
    departments.value.push(...(response.content || []));
    hasMoreDepts.value = !response.last;
    deptPage.value++;
  };

  const loadDetails = async () => {
    isLoading.value = true;
    try {
      wardId.value = route.params.id.toString();
      const response = await wardService.getWardById(wardId.value);
      if (response?.data) {
        const d = response.data;
        formData.value = {
          name: d.name || '',
          noOfBeds: String(d.noOfBeds || ''),
          noOfOxygenSlots: String(d.noOfOxygenSlots || ''),
          status: d.status || 'Active',
          description: d.description || '',
          location: d.location || '',
          departmentId: d.department?.id ? String(d.department.id) : '',
        };
      }
    } finally {
      isLoading.value = false;
    }
  };

  const submitUpdate = async () => {
    const isValid = validateForm(formData.value, {
      name: [rules.required(), rules.name()],
      noOfBeds: [rules.required(), positiveNumberRule],
      noOfOxygenSlots: [rules.required(), positiveNumberRule],
      departmentId: [rules.required('Department is required')],
    });
    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const payload = {
        id: Number(wardId.value),
        name: formData.value.name,
        noOfBeds: Number(formData.value.noOfBeds),
        noOfOxygenSlots: Number(formData.value.noOfOxygenSlots),
        status: formData.value.status,
        description: formData.value.description || undefined,
        location: formData.value.location || undefined,
        department: { id: Number(formData.value.departmentId) },
      };
      const response = await wardService.updateWard(payload);
      if (response.isSuccess) {
        showAlert('success', 'Ward details updated.', 'Success');
        router.push('/wards');
      }
    } finally {
      isSubmitting.value = false;
    }
  };

  onMounted(async () => {
    await Promise.all([loadDetails(), fetchDepartments()]);
  });
</script>

<template>
  <DefaultLayout>
    <div v-if="isLoading" class="animate-pulse max-w-5xl mx-auto space-y-4">
      <div class="h-8 bg-elevatedstrokedark/30 rounded-2xl w-1/3"></div>
      <div class="bg-surface rounded-3xl p-8 grid grid-cols-2 gap-6">
        <div v-for="i in 4" :key="i" class="h-14 bg-elevated rounded-xl"></div>
      </div>
    </div>
    <FormViewTemplate v-else title="Update Ward Information" breadcrumb-title="Wards" :is-submitting="isSubmitting" submit-label="Save Changes" @submit="submitUpdate" @cancel="router.back()">
      <BaseInput
        label="Ward Name / Identifier"
        v-model="formData.name"
        :error="!!errors.name"
        :error-message="errors.name"
        field-required
        @change="validateField('name', formData.name, [rules.required(), rules.name()])"
      />

      <BaseSelect
        label="Parent Department"
        v-model="formData.departmentId"
        :options="departments"
        :has-more="hasMoreDepts"
        @load-more="fetchDepartments"
        :error="!!errors.departmentId"
        :error-message="errors.departmentId"
        field-required
      />

      <BaseInput
        label="Total Bed Capacity"
        type="number"
        v-model="formData.noOfBeds"
        placeholder="Enter count (min 1)"
        min="1"
        :error="!!errors.noOfBeds"
        :error-message="errors.noOfBeds"
        field-required
        class="[&_input::-webkit-inner-spin-button]:appearance-none [&_input::-webkit-outer-spin-button]:appearance-none [&_input::-webkit-inner-spin-button]:bg-transparent [&_input::-webkit-outer-spin-button]:bg-transparent dark:[&_input::-webkit-inner-spin-button]:bg-transparent dark:[&_input::-webkit-outer-spin-button]:bg-transparent"
        @change="validateField('noOfBeds', formData.noOfBeds, [rules.required(), positiveNumberRule])"
      />

      <BaseInput
        label="Oxygen Slots Availability"
        type="number"
        v-model="formData.noOfOxygenSlots"
        placeholder="Enter count (min 1)"
        min="1"
        :error="!!errors.noOfOxygenSlots"
        :error-message="errors.noOfOxygenSlots"
        field-required
        class="[&_input::-webkit-inner-spin-button]:appearance-none [&_input::-webkit-outer-spin-button]:appearance-none [&_input::-webkit-inner-spin-button]:bg-transparent [&_input::-webkit-outer-spin-button]:bg-transparent dark:[&_input::-webkit-inner-spin-button]:bg-transparent dark:[&_input::-webkit-outer-spin-button]:bg-transparent"
        @change="validateField('noOfOxygenSlots', formData.noOfOxygenSlots, [rules.required(), positiveNumberRule])"
      />

      <BaseSelect label="Ward Status" v-model="formData.status" :options="STATUS_OPTIONS.WARD" placeholder="Select status..." field-required />

      <BaseInput label="Location" v-model="formData.location" placeholder="e.g. Building A, Floor 3" :error="!!errors.location" :error-message="errors.location" class="md:col-span-2" />

      <BaseInput
        label="Description"
        v-model="formData.description"
        placeholder="Additional information about the ward"
        :error="!!errors.description"
        :error-message="errors.description"
        class="md:col-span-2"
      />
    </FormViewTemplate>
  </DefaultLayout>
</template>
