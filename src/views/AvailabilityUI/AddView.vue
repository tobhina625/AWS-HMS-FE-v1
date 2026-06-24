<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import { useApiSearchDropdown } from '@/composables/useApiSearchDropdown';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BaseCheckbox from '@/components/Base/BaseCheckbox.vue';
  import AvailabilityServices from '@/services/Availability/Availability.services';
  import EmployeesServices from '@/services/Employee/Employee.services';
  import BranchService from '@/services/Branch/Branch.services';

  const router = useRouter();
  const route = useRoute();
  const { showAlert } = useAlert();
  const { errors, rules, validateForm } = useFormValidation();
  const availabilityService = new AvailabilityServices();
  const employeeService = new EmployeesServices();

  const isSubmitting = ref(false);
  const branchItems = ref<{ id: number; name: string }[]>([]);
  const branchLoading = ref(false);
  const branchSearchPerformed = ref(false);
  const existingSlots = ref<any[]>([]);
  const isLoadingExistingSlots = ref(false);

  const daysOfWeek = [
    { id: 'monday', name: 'Monday', short: 'Mon' },
    { id: 'tuesday', name: 'Tuesday', short: 'Tue' },
    { id: 'wednesday', name: 'Wednesday', short: 'Wed' },
    { id: 'thursday', name: 'Thursday', short: 'Thu' },
    { id: 'friday', name: 'Friday', short: 'Fri' },
    { id: 'saturday', name: 'Saturday', short: 'Sat' },
    { id: 'sunday', name: 'Sunday', short: 'Sun' },
  ];

  const selectedDays = ref<string[]>([]);
  const useSameSchedule = ref(true);

  interface DaySchedule {
    branchId: string | number;
    startTime: string;
    endTime: string;
  }

  const formData = ref({
    employeeId: '' as string | number,
    isAvailable: true,
  });

  // For same schedule mode
  const commonSchedule = ref({
    branchId: '' as string | number,
    startTime: '',
    endTime: '',
  });

  // For individual day schedules
  const daySchedules = ref<Record<string, DaySchedule>>({
    monday: { branchId: '', startTime: '', endTime: '' },
    tuesday: { branchId: '', startTime: '', endTime: '' },
    wednesday: { branchId: '', startTime: '', endTime: '' },
    thursday: { branchId: '', startTime: '', endTime: '' },
    friday: { branchId: '', startTime: '', endTime: '' },
    saturday: { branchId: '', startTime: '', endTime: '' },
    sunday: { branchId: '', startTime: '', endTime: '' },
  });

  const selectAllDays = () => {
    selectedDays.value = daysOfWeek.map((day) => day.id);
  };

  const selectWeekdays = () => {
    selectedDays.value = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  };

  const clearAllDays = () => {
    selectedDays.value = [];
  };

  const toggleDay = (dayId: string) => {
    const index = selectedDays.value.indexOf(dayId);
    if (index > -1) {
      selectedDays.value.splice(index, 1);
    } else {
      selectedDays.value.push(dayId);
    }
  };

  const selectedDaysCount = computed(() => selectedDays.value.length);

  const employeeDd = useApiSearchDropdown({
    fetchDefaultPage: async () => {
      const response = await employeeService.getEmployees('page=0&size=10');
      return (response?.content || response?.data?.content || []).map((e: any) => ({ id: e.id, name: e.name }));
    },
    fetchSearchPage: async (term) => {
      const response = await employeeService.getEmployees(`page=0&size=20&searchTerm=${encodeURIComponent(term)}`);
      return (response?.content || response?.data?.content || []).map((e: any) => ({ id: e.id, name: e.name }));
    },
    getSelectedId: () => formData.value.employeeId,
  });

  const employeeEmptyMessage = employeeDd.emptyMessage();

  const copyToAllDays = () => {
    if (selectedDays.value.length === 0) {
      showAlert('warning', 'Please select at least one day first.', 'No Days Selected');
      return;
    }

    const firstDay = selectedDays.value[0];
    const firstSchedule = daySchedules.value[firstDay];

    if (!firstSchedule.branchId || !firstSchedule.startTime || !firstSchedule.endTime) {
      showAlert('warning', "Please fill in the first day's schedule completely first.", 'Missing Information');
      return;
    }

    selectedDays.value.forEach((day) => {
      daySchedules.value[day] = {
        branchId: firstSchedule.branchId,
        startTime: firstSchedule.startTime,
        endTime: firstSchedule.endTime,
      };
    });
    showAlert('success', 'Schedule copied to all selected days.', 'Success');
  };

  const mapBranchRows = (list: unknown) => (Array.isArray(list) ? (list as any[]).map((b: any) => ({ id: b.id, name: b.name })) : []);

  const collectSelectedBranchIds = () => {
    const ids = new Set<string>();
    const add = (v: string | number | undefined | null) => {
      if (v !== undefined && v !== null && v !== '') ids.add(String(v));
    };
    add(commonSchedule.value.branchId);
    for (const day of daysOfWeek) {
      add(daySchedules.value[day.id]?.branchId);
    }
    return [...ids];
  };

  const loadDefaultBranches = async () => {
    const prev = branchItems.value.slice();
    branchLoading.value = true;
    try {
      const response: any = await BranchService.getAllBranches(0, 10, '', '');
      let arr = mapBranchRows(response?.content || response?.Content || []);
      for (const sid of collectSelectedBranchIds()) {
        if (!arr.some((x) => String(x.id) === sid)) {
          const p = prev.find((x) => String(x.id) === sid);
          if (p) arr = [p, ...arr];
        }
      }
      branchItems.value = arr;
      branchSearchPerformed.value = false;
    } catch {
      branchItems.value = [];
    } finally {
      branchLoading.value = false;
    }
  };

  const onBranchSearch = async (raw: string) => {
    const t = raw?.trim() ?? '';
    if (!t || t.length < 2) {
      await loadDefaultBranches();
      return;
    }
    branchLoading.value = true;
    branchSearchPerformed.value = true;
    try {
      const response: any = await BranchService.getAllBranches(0, 20, '', t);
      branchItems.value = mapBranchRows(response?.content || response?.Content || []);
    } catch {
      branchItems.value = [];
    } finally {
      branchLoading.value = false;
    }
  };

  const branchEmptyMessage = computed(() => (branchSearchPerformed.value ? 'No results found' : 'Type at least 2 characters to filter the list'));

  const submitAvailability = async () => {
    const isValid = validateForm(formData.value, {
      employeeId: [rules.required('Employee is required')],
    });

    if (!isValid) {
      showAlert('error', 'Please select an employee.', 'Validation Error');
      return;
    }

    if (selectedDays.value.length === 0) {
      showAlert('error', 'Please select at least one day of the week.', 'Validation Error');
      return;
    }

    // Validate based on mode
    if (useSameSchedule.value) {
      if (!commonSchedule.value.branchId || !commonSchedule.value.startTime || !commonSchedule.value.endTime) {
        showAlert('error', 'Please fill in branch and working hours.', 'Validation Error');
        return;
      }
    } else {
      // Validate each selected day has complete schedule
      const invalidDays = selectedDays.value.filter((day) => {
        const schedule = daySchedules.value[day];
        return !schedule.branchId || !schedule.startTime || !schedule.endTime;
      });

      if (invalidDays.length > 0) {
        const dayNames = invalidDays.map((d) => daysOfWeek.find((day) => day.id === d)?.name).join(', ');
        showAlert('error', `Please complete schedule for: ${dayNames}`, 'Validation Error');
        return;
      }
    }

    isSubmitting.value = true;
    try {
      // Helper: send time as fixed-date string (no timezone) so backend stores exactly as sent
      const convertTimeToDateTime = (timeString: string) => {
        if (!timeString) return null;
        return `2000-01-01T${timeString}:00`;
      };

      const availabilities = selectedDays.value.map((day) => {
        const schedule = useSameSchedule.value ? commonSchedule.value : daySchedules.value[day];

        return {
          employeeId: Number(formData.value.employeeId),
          branchId: Number(schedule.branchId),
          dayOfWeek: day,
          startTime: convertTimeToDateTime(schedule.startTime),
          endTime: convertTimeToDateTime(schedule.endTime),
          isAvailable: formData.value.isAvailable,
        };
      });

      await availabilityService.addMultipleAvailabilities(availabilities);
      showAlert('success', 'Weekly availability schedule added successfully.', 'Success');
      router.push('/availability');
    } catch {
      showAlert('error', 'Failed to add availability. Please try again.', 'Error');
    } finally {
      isSubmitting.value = false;
    }
  };

  const loadExistingSlots = async (employeeId: number) => {
    isLoadingExistingSlots.value = true;
    try {
      const response = await availabilityService.getAvailabilitiesByEmployee(employeeId);
      existingSlots.value = response?.availabilities || [];
    } catch (error) {
      console.error('Error loading existing slots:', error);
      existingSlots.value = [];
    } finally {
      isLoadingExistingSlots.value = false;
    }
  };

  const loadEmployeeFromQuery = async () => {
    const employeeId = route.query.employeeId;
    if (employeeId) {
      try {
        const response = await employeeService.getEmployeesById(String(employeeId));
        const employee = response?.data || response?.Data || response;
        if (employee) {
          employeeDd.items.value = [{ id: employee.id, name: employee.name }];
          formData.value.employeeId = employee.id;
          await loadExistingSlots(employee.id);
        }
      } catch (error) {
        console.error('Error loading employee:', error);
      }
    }
  };

  const capitalizeFirst = (str: string) => (str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '');

  const groupedExistingSlots = computed(() => {
    const groups: Record<string, any[]> = {};
    for (const slot of existingSlots.value) {
      const day = slot.dayOfWeek ? capitalizeFirst(slot.dayOfWeek) : 'Unspecified';
      if (!groups[day]) {
        groups[day] = [];
      }
      groups[day].push(slot);
    }
    return groups;
  });

  onMounted(async () => {
    await loadDefaultBranches();
    await loadEmployeeFromQuery();
    await employeeDd.loadDefault();
  });
</script>

<template>
  <DefaultLayout>
    <FormViewTemplate title="Create Weekly Availability Schedule" breadcrumb-title="Availability" :is-submitting="isSubmitting" @submit="submitAvailability" @cancel="router.back()">
      <!-- Employee Selection Section -->
      <div class="md:col-span-2 space-y-4">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-1 h-6 bg-primary rounded-full"></div>
          <h3 class="text-sm font-bold text-emphasis uppercase tracking-wider">Employee Selection</h3>
        </div>

        <BaseSelect
          label="Employee"
          v-model="formData.employeeId"
          :options="employeeDd.items"
          placeholder="Pick an employee or type to search…"
          :empty-message="employeeEmptyMessage"
          :error="!!errors.employeeId"
          :error-message="errors.employeeId"
          :loading="employeeDd.loading"
          @search="employeeDd.onSearch"
          field-required
          class="w-full"
        />
        <p class="text-xs text-gray-500 dark:text-gray-400 -mt-2">Default list loads automatically; type 2+ characters to search the server.</p>
      </div>

      <!-- Existing Availability Slots -->
      <div v-if="existingSlots.length > 0" class="md:col-span-2 space-y-4">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-1 h-6 bg-warning rounded-full"></div>
          <h3 class="text-sm font-bold text-emphasis uppercase tracking-wider">Existing Availability Slots</h3>
          <span class="ml-2 px-2 py-0.5 text-xs font-medium bg-warning/10 text-warning rounded-full">{{ existingSlots.length }} slot(s)</span>
        </div>

        <div class="bg-warning/5 border border-warning/20 rounded-lg p-4">
          <p class="text-sm text-warning-600 dark:text-warning-400 mb-4">
            This employee already has the following availability slots configured. Adding new slots for the same days may cause overlapping schedules.
          </p>

          <div class="space-y-3">
            <div v-for="(slots, day) in groupedExistingSlots" :key="day" class="bg-white dark:bg-boxdark rounded-lg border border-stroke dark:border-strokedark overflow-hidden">
              <div class="bg-gray-50 dark:bg-meta-4 px-3 py-2 border-b border-stroke dark:border-strokedark">
                <span class="text-sm font-semibold text-emphasis">{{ day }}</span>
              </div>
              <div class="divide-y divide-stroke dark:divide-strokedark">
                <div v-for="slot in slots" :key="slot.id" class="px-3 py-2 flex items-center justify-between text-sm">
                  <div class="flex items-center gap-3">
                    <span class="font-medium text-emphasis">{{ slot.startTimeOfDay || '-' }} - {{ slot.endTimeOfDay || '-' }}</span>
                    <span :class="slot.isAvailable ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'" class="px-2 py-0.5 rounded text-xs font-medium">
                      {{ slot.isAvailable ? 'Available' : 'Unavailable' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="isLoadingExistingSlots" class="md:col-span-2">
        <div class="flex items-center justify-center py-4">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span class="ml-2 text-sm text-gray-500">Loading existing slots...</span>
        </div>
      </div>

      <!-- Working Days Selection -->
      <div class="md:col-span-2 space-y-4">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-1 h-6 bg-primary rounded-full"></div>
          <h3 class="text-sm font-bold text-emphasis uppercase tracking-wider">Working Days</h3>
        </div>

        <div class="space-y-4">
          <div class="flex flex-wrap gap-2">
            <button type="button" @click="selectAllDays" class="px-3 py-1.5 text-xs font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">All Days (7)</button>
            <button type="button" @click="selectWeekdays" class="px-3 py-1.5 text-xs font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">Weekdays (5)</button>
            <button
              type="button"
              @click="clearAllDays"
              class="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Clear All
            </button>
            <span class="ml-auto px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">{{ selectedDaysCount }} day{{ selectedDaysCount !== 1 ? 's' : '' }} selected</span>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-7 gap-3">
            <button
              v-for="day in daysOfWeek"
              :key="day.id"
              type="button"
              @click="toggleDay(day.id)"
              :class="[
                'p-4 rounded-lg border-2 transition-all duration-200 text-center',
                selectedDays.includes(day.id) ? 'border-primary bg-primary/10 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
              ]"
            >
              <div class="text-xs font-bold uppercase tracking-wider mb-1" :class="selectedDays.includes(day.id) ? 'text-primary' : 'text-gray-500 dark:text-gray-400'">
                {{ day.short }}
              </div>
              <div class="text-sm font-medium" :class="selectedDays.includes(day.id) ? 'text-emphasis' : 'text-gray-600 dark:text-gray-400'">
                {{ day.name }}
              </div>
              <div v-if="selectedDays.includes(day.id)" class="mt-2">
                <svg class="w-5 h-5 mx-auto text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </button>
          </div>

          <p class="text-xs text-gray-500 dark:text-gray-400">Select the days when the employee will be available at the branch</p>
        </div>
      </div>

      <!-- Schedule Mode Selection -->
      <div class="md:col-span-2 space-y-4">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-1 h-6 bg-primary rounded-full"></div>
          <h3 class="text-sm font-bold text-emphasis uppercase tracking-wider">Schedule Configuration</h3>
        </div>

        <div class="flex gap-4 p-4 bg-gray-50 dark:bg-meta-4/20 rounded-lg border border-gray-200 dark:border-gray-700">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" :value="true" v-model="useSameSchedule" class="w-4 h-4 text-primary focus:ring-primary" />
            <span class="text-sm font-medium text-emphasis">Same schedule for all days</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" :value="false" v-model="useSameSchedule" class="w-4 h-4 text-primary focus:ring-primary" />
            <span class="text-sm font-medium text-emphasis">Different schedule per day</span>
          </label>
        </div>
      </div>

      <!-- Same Schedule Mode -->
      <div v-if="useSameSchedule" class="md:col-span-2 space-y-4">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-1 h-6 bg-primary rounded-full"></div>
          <h3 class="text-sm font-bold text-emphasis uppercase tracking-wider">Branch & Working Hours</h3>
        </div>

        <BaseSelect
          label="Branch"
          v-model="commonSchedule.branchId"
          :options="branchItems"
          placeholder="Select branch or type to search…"
          :empty-message="branchEmptyMessage"
          :loading="branchLoading"
          field-required
          class="w-full"
          @search="onBranchSearch"
        />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput label="Start Time" type="time" v-model="commonSchedule.startTime" placeholder="--:-- --" field-required />

          <BaseInput label="End Time" type="time" v-model="commonSchedule.endTime" placeholder="--:-- --" field-required />
        </div>

        <p class="text-xs text-gray-500 dark:text-gray-400">This schedule will apply to all selected days</p>
      </div>

      <!-- Different Schedule Mode -->
      <div v-else class="md:col-span-2 space-y-4">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <div class="w-1 h-6 bg-primary rounded-full"></div>
            <h3 class="text-sm font-bold text-emphasis uppercase tracking-wider">Individual Day Schedules</h3>
          </div>
          <button type="button" @click="copyToAllDays" class="px-3 py-1.5 text-xs font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            Copy First Day to All
          </button>
        </div>

        <div class="space-y-4">
          <div v-for="day in daysOfWeek.filter((d) => selectedDays.includes(d.id))" :key="day.id" class="p-4 bg-gray-50 dark:bg-meta-4/20 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 class="text-sm font-bold text-emphasis mb-3">{{ day.name }}</h4>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BaseSelect
                label="Branch"
                v-model="daySchedules[day.id].branchId"
                :options="branchItems"
                placeholder="Select branch or type to search…"
                :empty-message="branchEmptyMessage"
                :loading="branchLoading"
                field-required
                class="w-full"
                @search="onBranchSearch"
              />

              <BaseInput label="Start Time" type="time" v-model="daySchedules[day.id].startTime" placeholder="--:-- --" field-required />

              <BaseInput label="End Time" type="time" v-model="daySchedules[day.id].endTime" placeholder="--:-- --" field-required />
            </div>
          </div>
        </div>

        <p class="text-xs text-gray-500 dark:text-gray-400">Configure unique branch and working hours for each selected day</p>
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
