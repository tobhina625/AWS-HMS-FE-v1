<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import { usePaginatedDropdown } from '@/composables/usePaginatedDropdown';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BaseCheckbox from '@/components/Base/BaseCheckbox.vue';
  import LoadingSkeleton from '@/components/UI/LoadingSkeleton.vue';
  import AvailabilityServices from '@/services/Availability/Availability.services';
  import EmployeesServices from '@/services/Employee/Employee.services';
  import RoleServices from '@/services/Role/Role.services';
  import DesignationsService from '@/services/Designation/Designation.services';

  const router = useRouter();
  const route = useRoute();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();
  const availabilityService = new AvailabilityServices();
  const employeeService = new EmployeesServices();
  const roleService = new RoleServices();
  const designationService = new DesignationsService();

  const isSubmitting = ref(false);
  const isLoading = ref(true);
  const roles = ref<{ id: number; name: string }[]>([]);
  const designations = ref<{ id: number; name: string }[]>([]);
  const isLoadingRoles = ref(false);
  const roleSearchPerformed = ref(false);
  const isLoadingDesignations = ref(false);
  const designationSearchPerformed = ref(false);
  const currentEmployee = ref<{ id: number; name: string } | null>(null);

  const selectedRoleId = ref<string | number>('');
  const selectedDesignationId = ref<string | number>('');

  const formData = ref({
    id: 0,
    availabileDate: '',
    startTime: '',
    endTime: '',
    employeeId: '' as string | number,
    isAvailable: true,
  });

  const mapEmployeeToOption = (e: any) => {
    const roleName = e.designations?.[0]?.role?.name || '';
    const designationName = e.designations?.[0]?.name || '';
    const suffix = [roleName, designationName].filter(Boolean).join(' - ');
    return {
      id: e.id,
      name: suffix ? `${e.name} (${suffix})` : e.name,
    };
  };

  const loadEmployees = async (page: number, size = 10, search?: string) => {
    const raw = search?.trim() ?? '';
    const useServerSearch = raw.length >= 2 && !selectedDesignationId.value;
    const searchParam = useServerSearch ? `&searchTerm=${encodeURIComponent(raw)}` : '';
    const filters = `page=${page}&size=${size}${searchParam}`;
    let response;
    if (selectedDesignationId.value) {
      response = await employeeService.getEmployeesByDesignation(Number(selectedDesignationId.value), filters);
    } else if (selectedRoleId.value) {
      response = await employeeService.getEmployeesByRole(Number(selectedRoleId.value), filters);
    } else {
      response = await employeeService.getEmployees(filters);
    }
    const content = response?.content || response?.Content || [];
    const last = response?.last ?? response?.Last ?? page >= (response?.totalPages || 1) - 1;
    const mapped = content.map(mapEmployeeToOption);
    return { content: mapped, last };
  };

  const employeeDropdown = usePaginatedDropdown((page: number, size = 10, search?: string) => loadEmployees(page, size, search));

  const employeeOptions = computed(() => {
    const curr = currentEmployee.value;
    const list = employeeDropdown.list.value;
    if (!curr) return list;
    const exists = list.some((e) => String(e.id) === String(curr.id));
    if (exists) return list;
    return [curr, ...list];
  });

  const roleEmptyMessage = computed(() => (roleSearchPerformed.value ? 'No results found' : 'Type at least 2 characters to filter the list'));

  const designationEmptyMessage = computed(() => {
    if (selectedRoleId.value) return 'No designations for this role';
    return designationSearchPerformed.value ? 'No results found' : 'Type at least 2 characters to filter the list';
  });

  const employeeEmptyMessage = computed(() => 'No employees found');

  const fetchDefaultRoles = async () => {
    isLoadingRoles.value = true;
    try {
      const response = await roleService.getRoles('page=0&size=10');
      const list = response.content || response.Content || [];
      let mapped = Array.isArray(list) ? list.map((r: any) => ({ id: r.id, name: r.name })) : [];
      const selId = selectedRoleId.value;
      const prevSnap = roles.value.slice();
      if (selId && !mapped.some((r) => String(r.id) === String(selId))) {
        const prev = prevSnap.find((r) => String(r.id) === String(selId));
        if (prev) mapped = [prev, ...mapped];
      }
      roles.value = mapped;
    } catch {
      roles.value = [];
    } finally {
      isLoadingRoles.value = false;
    }
  };

  const fetchDefaultDesignationsOpen = async () => {
    if (selectedRoleId.value) return;
    isLoadingDesignations.value = true;
    try {
      const response = await designationService.getDesignations('page=0&size=10');
      const list = response.content || response.Content || [];
      let mapped = Array.isArray(list) ? list.map((d: any) => ({ id: d.id, name: d.name })) : [];
      const selId = selectedDesignationId.value;
      const prevSnap = designations.value.slice();
      if (selId && !mapped.some((d) => String(d.id) === String(selId))) {
        const prev = prevSnap.find((d) => String(d.id) === String(selId));
        if (prev) mapped = [prev, ...mapped];
      }
      designations.value = mapped;
    } catch {
      designations.value = [];
    } finally {
      isLoadingDesignations.value = false;
    }
  };

  const searchRoles = async (searchTermRaw: string) => {
    if (!searchTermRaw || searchTermRaw.length < 2) {
      roleSearchPerformed.value = false;
      await fetchDefaultRoles();
      return;
    }
    isLoadingRoles.value = true;
    roleSearchPerformed.value = true;
    try {
      const response = await roleService.getRoles(`page=0&size=20&searchTerm=${encodeURIComponent(searchTermRaw)}`);
      const list = response.content || response.Content || [];
      roles.value = Array.isArray(list) ? list.map((r: any) => ({ id: r.id, name: r.name })) : [];
    } catch {
      roles.value = [];
    } finally {
      isLoadingRoles.value = false;
    }
  };

  const searchDesignations = async (searchTermRaw: string) => {
    if (selectedRoleId.value) return;
    if (!searchTermRaw || searchTermRaw.length < 2) {
      designationSearchPerformed.value = false;
      await fetchDefaultDesignationsOpen();
      return;
    }
    isLoadingDesignations.value = true;
    designationSearchPerformed.value = true;
    try {
      const response = await designationService.getDesignations(`page=0&size=20&searchTerm=${encodeURIComponent(searchTermRaw)}`);
      const list = response.content || response.Content || [];
      designations.value = Array.isArray(list) ? list.map((d: any) => ({ id: d.id, name: d.name })) : [];
    } catch {
      designations.value = [];
    } finally {
      isLoadingDesignations.value = false;
    }
  };

  const onDesignationSearch = (term: string) => {
    if (selectedRoleId.value) return;
    searchDesignations(term);
  };

  const fetchDesignations = async () => {
    if (selectedRoleId.value) {
      const response = await designationService.getDesignationsByRole(Number(selectedRoleId.value), 'page=0&size=10');
      const list = response.content || response.Content || response.data || [];
      designations.value = Array.isArray(list) ? list.map((d: any) => ({ id: d.id, name: d.name })) : [];
    } else {
      await fetchDefaultDesignationsOpen();
    }
  };

  const handleEmployeeSearch = async (term: string) => {
    await employeeDropdown.applySearch(term);
  };

  watch(selectedRoleId, async () => {
    selectedDesignationId.value = '';
    formData.value.employeeId = '';
    employeeDropdown.reset();
    await fetchDesignations();
    await employeeDropdown.fetchNextPage();
  });

  watch(selectedDesignationId, async () => {
    formData.value.employeeId = '';
    employeeDropdown.reset();
    await employeeDropdown.fetchNextPage();
  });

  const extractTimeFromDateTime = (dt: string | null | undefined): string => {
    if (!dt) return '';
    const match = String(dt).match(/(\d{1,2}):(\d{2})/);
    return match ? `${match[1].padStart(2, '0')}:${match[2]}` : '';
  };

  const loadDetails = async () => {
    isLoading.value = true;
    try {
      const response = await availabilityService.getAvailabilityById(Number(route.params.id));
      if (response.data) {
        const d = response.data;
        currentEmployee.value = d.employee ? { id: d.employee.id, name: d.employee.name } : null;
        formData.value = {
          id: d.id,
          availabileDate: d.availabileDate?.split('T')[0] || '',
          startTime: extractTimeFromDateTime(d.startTime) || d.startTimeOfDay || '',
          endTime: extractTimeFromDateTime(d.endTime) || d.endTimeOfDay || '',
          employeeId: d.employeeId ?? d.employee?.id ?? '',
          isAvailable: d.isAvailable ?? true,
        };
      }
    } catch {
      showAlert('error', 'Failed to load availability details.', 'Error');
      router.push('/availability');
    } finally {
      isLoading.value = false;
    }
  };

  const submitUpdate = async () => {
    const isValid = validateForm(formData.value, {
      employeeId: [rules.required('Employee is required')],
    });

    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const toDateTimeString = (time: string) => {
        if (!time) return null;
        const parts = time.split(':');
        const hh = parts[0]?.padStart(2, '0') ?? '00';
        const mm = parts[1]?.padStart(2, '0') ?? '00';
        return `2000-01-01T${hh}:${mm}:00`;
      };
      const response = await availabilityService.updateAvailability({
        id: formData.value.id,
        availabileDate: formData.value.availabileDate || null,
        startTime: toDateTimeString(formData.value.startTime),
        endTime: toDateTimeString(formData.value.endTime),
        employeeId: Number(formData.value.employeeId),
        isAvailable: formData.value.isAvailable,
      });
      if (response.isSuccess) {
        showAlert('success', 'Availability updated successfully.', 'Success');
        router.push('/availability');
      }
    } finally {
      isSubmitting.value = false;
    }
  };

  const handleEmployeeLoadMore = () => {
    employeeDropdown.fetchNextPage();
  };

  onMounted(async () => {
    await loadDetails();
    await fetchDefaultRoles();
    await fetchDesignations();
    await employeeDropdown.fetchNextPage();
  });
</script>

<template>
  <DefaultLayout>
    <div v-if="isLoading" class="space-y-6 max-w-5xl mx-auto">
      <LoadingSkeleton />
    </div>

    <FormViewTemplate
      v-else
      title="Edit Availability"
      breadcrumb-title="Availability"
      :breadcrumb-slug="`Availability #${formData.id}`"
      :is-submitting="isSubmitting"
      @submit="submitUpdate"
      @cancel="router.back()"
    >
      <!-- Employee Selection Section -->
      <div class="md:col-span-2 space-y-4">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-1 h-6 bg-primary rounded-full"></div>
          <h3 class="text-sm font-bold text-emphasis uppercase tracking-wider">Employee Selection</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-meta-4/20 rounded-lg border border-gray-200 dark:border-gray-700">
          <BaseSelect
            label="Filter by Role"
            v-model="selectedRoleId"
            :options="roles"
            placeholder="Pick a role or type to search…"
            :empty-message="roleEmptyMessage"
            :loading="isLoadingRoles"
            class="w-full"
            @search="searchRoles"
          />

          <BaseSelect
            label="Filter by Designation"
            v-model="selectedDesignationId"
            :options="designations"
            :placeholder="selectedRoleId ? 'Pick or filter designations…' : 'Pick a designation or type to search…'"
            :empty-message="designationEmptyMessage"
            :loading="isLoadingDesignations"
            class="w-full"
            @search="onDesignationSearch"
          />
        </div>

        <BaseSelect
          label="Employee"
          v-model="formData.employeeId"
          :options="employeeOptions"
          :loading="employeeDropdown.isLoading.value"
          :has-more="!employeeDropdown.isLastPage.value"
          placeholder="Pick an employee or type to search…"
          :empty-message="employeeEmptyMessage"
          :error="!!errors.employeeId"
          :error-message="errors.employeeId"
          field-required
          class="w-full"
          @search="handleEmployeeSearch"
          @load-more="handleEmployeeLoadMore"
          @change="validateField('employeeId', formData.employeeId, [rules.required('Employee is required')])"
        />
        <p class="text-xs text-gray-500 dark:text-gray-400 -mt-2">
          Default lists load from the server; type 2+ characters to search. With a designation filter, employee search is limited to loaded pages.
        </p>
      </div>

      <!-- Schedule Details Section -->
      <div class="md:col-span-2 space-y-4">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-1 h-6 bg-primary rounded-full"></div>
          <h3 class="text-sm font-bold text-emphasis uppercase tracking-wider">Schedule Details</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BaseInput label="Availability Date" type="date" v-model="formData.availabileDate" placeholder="Select date" />

          <BaseInput label="Start Time" type="time" v-model="formData.startTime" placeholder="--:-- --" />

          <BaseInput label="End Time" type="time" v-model="formData.endTime" placeholder="--:-- --" />
        </div>

        <p class="text-xs text-gray-500 dark:text-gray-400">Leave date and time fields empty to set general availability without specific time constraints</p>
      </div>

      <!-- Availability Status Section -->
      <div class="md:col-span-2 space-y-4">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-1 h-6 bg-primary rounded-full"></div>
          <h3 class="text-sm font-bold text-emphasis uppercase tracking-wider">Availability Status</h3>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-meta-4/20 rounded-lg border border-gray-200 dark:border-gray-700">
          <BaseCheckbox label="Mark as Available" v-model="formData.isAvailable" />
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-6">Check this box to mark the employee as available for the specified schedule</p>
        </div>
      </div>
    </FormViewTemplate>
  </DefaultLayout>
</template>
