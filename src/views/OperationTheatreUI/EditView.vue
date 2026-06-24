<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BaseCheckbox from '@/components/Base/BaseCheckbox.vue';
  import DepartmentService from '@/services/Department/Department.services';
  import OperationTheatreService from '@/services/OperationTheatre/OperationTheatre.services';
  import { STATUS_OPTIONS } from '@/constants/statusOptions';

  const route = useRoute();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();

  const departmentService = new DepartmentService();
  const theatreService = new OperationTheatreService();

  const isLoading = ref(true);
  const isSubmitting = ref(false);
  const theatreId = ref<number | null>(null);

  const departments = ref<any[]>([]);
  const deptPage = ref(0);
  const hasMoreDepts = ref(true);

  const formData = ref({
    name: '',
    departmentId: '',
    status: 'Available',
    specialization: '',
    location: '',
    capacity: 10,
    hasAnesthesiaMachine: false,
    hasVentilator: false,
    hasMonitoringSystem: false,
    hasSurgicalLights: false,
    equipmentNotes: '',
    notes: '',
  });

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
      const id = Number(route.params.id);
      theatreId.value = id;
      const response = await theatreService.getOperationTheatreById(id);
      if (response?.data) {
        formData.value = {
          name: response.data.name || '',
          departmentId: response.data.department?.id ? String(response.data.department.id) : '',
          status: response.data.status || 'Available',
          specialization: response.data.specialization || '',
          location: response.data.location || '',
          capacity: response.data.capacity || 10,
          hasAnesthesiaMachine: response.data.hasAnesthesiaMachine || false,
          hasVentilator: response.data.hasVentilator || false,
          hasMonitoringSystem: response.data.hasMonitoringSystem || false,
          hasSurgicalLights: response.data.hasSurgicalLights || false,
          equipmentNotes: response.data.equipmentNotes || '',
          notes: response.data.notes || '',
        };
      }
    } finally {
      isLoading.value = false;
    }
  };

  const submitUpdate = async () => {
    const isValid = validateForm(formData.value, {
      name: [rules.required('Theatre name is required')],
    });
    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const payload = {
        id: theatreId.value!,
        name: formData.value.name,
        department: formData.value.departmentId ? { id: Number(formData.value.departmentId) } : null,
        status: formData.value.status,
        specialization: formData.value.specialization || undefined,
        location: formData.value.location || undefined,
        capacity: Number(formData.value.capacity),
        hasAnesthesiaMachine: formData.value.hasAnesthesiaMachine,
        hasVentilator: formData.value.hasVentilator,
        hasMonitoringSystem: formData.value.hasMonitoringSystem,
        hasSurgicalLights: formData.value.hasSurgicalLights,
        equipmentNotes: formData.value.equipmentNotes || undefined,
        notes: formData.value.notes || undefined,
      };
      const response = await theatreService.updateOperationTheatre(payload);
      if (response.isSuccess) {
        showAlert('success', 'Operation Theatre updated.', 'Success');
        router.push('/operation-theatre');
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
        <div v-for="i in 2" :key="i" class="h-14 bg-gray-50 dark:bg-strokedark/20 rounded-xl"></div>
      </div>
    </div>
    <FormViewTemplate
      v-else
      title="Update Operation Theatre"
      breadcrumb-title="Theatres"
      breadcrumb-slug="Edit Record"
      :is-submitting="isSubmitting"
      submit-label="Save Changes"
      @submit="submitUpdate"
      @cancel="router.push('/operation-theatre')"
    >
      <BaseInput
        label="Theatre Name / Number"
        v-model="formData.name"
        placeholder="e.g. OT-01 General Surgery"
        :error="!!errors.name"
        :error-message="errors.name"
        field-required
        @change="validateField('name', formData.name, [rules.required('Theatre name is required')])"
      />

      <BaseSelect
        label="Supervising Department"
        v-model="formData.departmentId"
        :options="departments"
        :has-more="hasMoreDepts"
        @load-more="fetchDepartments"
        :error="!!errors.departmentId"
        :error-message="errors.departmentId"
      />

      <BaseSelect label="Status" v-model="formData.status" :options="STATUS_OPTIONS.OPERATION_THEATRE" placeholder="Select status..." field-required />

      <BaseSelect
        label="Specialization"
        v-model="formData.specialization"
        :options="[
          { id: 'General', name: 'General' },
          { id: 'Cardiac', name: 'Cardiac' },
          { id: 'Neuro', name: 'Neuro' },
          { id: 'Orthopedic', name: 'Orthopedic' },
          { id: 'Pediatric', name: 'Pediatric' },
          { id: 'Trauma', name: 'Trauma' },
          { id: 'Transplant', name: 'Transplant' },
        ]"
        placeholder="Select specialization..."
      />

      <BaseInput label="Location" v-model="formData.location" placeholder="e.g. Building A, Floor 3, Wing East" />

      <BaseInput label="Capacity" v-model.number="formData.capacity" type="number" placeholder="Maximum number of people" field-required />

      <div class="space-y-3">
        <label class="block text-sm font-medium text-muted">Equipment Available</label>
        <div class="grid grid-cols-2 gap-4">
          <BaseCheckbox label="Anesthesia Machine" v-model="formData.hasAnesthesiaMachine" />
          <BaseCheckbox label="Ventilator" v-model="formData.hasVentilator" />
          <BaseCheckbox label="Monitoring System" v-model="formData.hasMonitoringSystem" />
          <BaseCheckbox label="Surgical Lights" v-model="formData.hasSurgicalLights" />
        </div>
      </div>

      <BaseInput label="Equipment Notes" v-model="formData.equipmentNotes" placeholder="Additional equipment details..." type="textarea" />

      <BaseInput label="Notes" v-model="formData.notes" placeholder="General notes about this theatre..." type="textarea" />
    </FormViewTemplate>
  </DefaultLayout>
</template>
