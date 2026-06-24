<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import { useApiSearchDropdown } from '@/composables/useApiSearchDropdown';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BaseCheckbox from '@/components/Base/BaseCheckbox.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import MapPicker from '@/components/Base/MapPicker.vue';
  import BranchService from '@/services/Branch/Branch.services';
  import EmployeesServices from '@/services/Employee/Employee.services';

  const router = useRouter();
  const route = useRoute();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();
  const employeeService = new EmployeesServices();

  const isSubmitting = ref(false);
  const isLoading = ref(true);
  const branchId = ref(Number(route.params.id));
  const showMapPicker = ref(false);

  const formData = ref({
    name: '',
    code: '',
    address: '',
    city: '',
    phoneNumber: '',
    email: '',
    latitude: null as number | null,
    longitude: null as number | null,
    allowedRadiusMeters: 100,
    branchHeadId: null as number | null,
    requireLocationLogin: false,
    status: 1,
  });

  const statusOptions = [
    { value: 1, label: 'Active' },
    { value: 2, label: 'Inactive' },
    { value: 3, label: 'Under Maintenance' },
  ];

  const mapBranchHeadOptions = (raw: any[]) => raw.map((e: any) => ({ id: e.id, name: `${e.name} - ${e.specialization || 'Staff'}` }));

  const employeeDd = useApiSearchDropdown({
    fetchDefaultPage: async () => {
      const response = await employeeService.getEmployees('page=0&size=10');
      return mapBranchHeadOptions(response?.content || response?.data?.content || []);
    },
    fetchSearchPage: async (term) => {
      const response = await employeeService.getEmployees(`page=0&size=20&searchTerm=${encodeURIComponent(term)}`);
      return mapBranchHeadOptions(response?.content || response?.data?.content || []);
    },
    getSelectedId: () => formData.value.branchHeadId ?? '',
  });

  const employeeEmptyMessage = employeeDd.emptyMessage();

  const loadSelectedEmployee = async (employeeId: number) => {
    if (!employeeId) return;
    try {
      const response = await employeeService.getEmployeesById(String(employeeId));
      if (response?.data) {
        const emp = response.data;
        employeeDd.items.value = [{ id: emp.id, name: `${emp.name} - ${emp.specialization || 'Staff'}` }];
      }
    } catch (error) {
      console.error('Error loading selected employee:', error);
    }
  };

  const loadBranch = async () => {
    try {
      const response = await BranchService.getBranchById(branchId.value);
      if (response.isSuccess && response.data) {
        const branch = response.data;
        formData.value = {
          name: branch.name,
          code: branch.code,
          address: branch.address,
          city: branch.city || '',
          phoneNumber: branch.phoneNumber || '',
          email: branch.email || '',
          latitude: branch.latitude || null,
          longitude: branch.longitude || null,
          allowedRadiusMeters: branch.allowedRadiusMeters || 100,
          branchHeadId: branch.branchHeadId || null,
          requireLocationLogin: branch.requireLocationLogin,
          status: branch.status === 'Active' ? 1 : branch.status === 'Inactive' ? 2 : 3,
        };

        // Load selected employee if exists
        if (branch.branchHeadId) {
          await loadSelectedEmployee(branch.branchHeadId);
        }
      } else {
        showAlert('error', 'Branch not found.', 'Error');
        router.push('/branches');
      }
    } catch {
      showAlert('error', 'Failed to load branch.', 'Error');
      router.push('/branches');
    } finally {
      isLoading.value = false;
    }
  };

  const submitBranch = async () => {
    const isValid = validateForm(formData.value, {
      name: [rules.required()],
      code: [rules.required()],
      address: [rules.required()],
    });

    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const response = await BranchService.updateBranch(branchId.value, {
        name: formData.value.name,
        code: formData.value.code,
        address: formData.value.address,
        city: formData.value.city,
        phoneNumber: formData.value.phoneNumber,
        email: formData.value.email,
        latitude: formData.value.latitude || undefined,
        longitude: formData.value.longitude || undefined,
        allowedRadiusMeters: formData.value.allowedRadiusMeters || 100,
        branchHeadId: formData.value.branchHeadId || undefined,
        requireLocationLogin: formData.value.requireLocationLogin,
        status: formData.value.status,
      });

      if (response.isSuccess) {
        showAlert('success', 'Branch updated successfully.', 'Success');
        router.push('/branches');
      } else {
        showAlert('error', response.error || 'Failed to update branch.', 'Error');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to update branch';
      showAlert('error', msg, 'Error');
    } finally {
      isSubmitting.value = false;
    }
  };

  const handleLocationUpdate = (location: { latitude: number; longitude: number }) => {
    formData.value.latitude = location.latitude;
    formData.value.longitude = location.longitude;
  };

  onMounted(async () => {
    await loadBranch();
    await employeeDd.loadDefault();
  });
</script>

<template>
  <DefaultLayout>
    <FormViewTemplate v-if="!isLoading" title="Edit Branch" breadcrumb-title="Branches" :is-submitting="isSubmitting" @submit="submitBranch" @cancel="router.back()">
      <BaseInput
        label="Branch Name"
        v-model="formData.name"
        placeholder="e.g. DHA Phase 5"
        :error="!!errors.name"
        :error-message="errors.name"
        field-required
        @change="validateField('name', formData.name, [rules.required()])"
      />

      <BaseInput
        label="Branch Code"
        v-model="formData.code"
        placeholder="e.g. DHA-PH5"
        :error="!!errors.code"
        :error-message="errors.code"
        field-required
        @change="validateField('code', formData.code, [rules.required()])"
      />

      <BaseInput
        label="Address"
        v-model="formData.address"
        placeholder="e.g. 123 Main Street, DHA Phase 5"
        :error="!!errors.address"
        :error-message="errors.address"
        field-required
        class="md:col-span-2"
        @change="validateField('address', formData.address, [rules.required()])"
      />

      <BaseInput label="City" v-model="formData.city" placeholder="e.g. Lahore" />

      <BaseInput label="Phone Number" v-model="formData.phoneNumber" placeholder="e.g. +92-300-1234567" />

      <BaseInput label="Email" v-model="formData.email" placeholder="e.g. dha@hospital.com" type="email" />

      <BaseSelect
        label="Branch Head"
        v-model="formData.branchHeadId"
        :options="employeeDd.items"
        placeholder="Pick branch head or type to search…"
        :empty-message="employeeEmptyMessage"
        :loading="employeeDd.loading"
        @search="employeeDd.onSearch"
      />

      <BaseSelect label="Status" v-model="formData.status" :options="statusOptions" placeholder="Select status..." field-required display-key="label" value-key="value" />

      <div class="md:col-span-2 border-t border-border pt-4 mt-2">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Location Settings</h3>
          <BaseButton variant="outline" size="sm" @click="showMapPicker = true">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Pick from Map
          </BaseButton>
        </div>
      </div>

      <BaseInput label="Latitude" v-model.number="formData.latitude" placeholder="e.g. 31.4697" type="number" step="any" />

      <BaseInput label="Longitude" v-model.number="formData.longitude" placeholder="e.g. 74.4097" type="number" step="any" />

      <BaseInput label="Allowed Radius (meters)" v-model.number="formData.allowedRadiusMeters" placeholder="e.g. 100" type="number" />

      <div class="md:col-span-2">
        <BaseCheckbox label="Require Location Verification for Login" id="requireLocationLogin" v-model="formData.requireLocationLogin" />
        <p class="text-sm text-muted mt-1">When enabled, employees must be within the specified radius to log in at this branch.</p>
      </div>
    </FormViewTemplate>

    <div v-else class="flex items-center justify-center h-64">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p class="mt-4 text-muted">Loading branch...</p>
      </div>
    </div>

    <MapPicker :show="showMapPicker" :latitude="formData.latitude" :longitude="formData.longitude" @close="showMapPicker = false" @update:location="handleLocationUpdate" />
  </DefaultLayout>
</template>
