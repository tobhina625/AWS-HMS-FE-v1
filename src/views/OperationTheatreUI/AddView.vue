<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
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

  const router = useRouter();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();

  const departmentService = new DepartmentService();
  const theatreService = new OperationTheatreService();

  const isSubmitting = ref(false);
  const departments = ref<any[]>([]);
  const deptPage = ref(0);
  const hasMoreDepts = ref(true);

  const formData = ref({
    name: '',
    departmentId: '',
    status: '',
    specialization: '',
    location: '',
    capacity: '' as number | string,
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

  const capacityRule = { validate: (v: any) => !v || (Number(v) >= 1 && Number(v) <= 500) || 'Capacity must be between 1 and 500' };

  const submitTheatre = async () => {
    const isValid = validateForm(formData.value, {
      name: [rules.required('Theatre name is required')],
      status: [rules.required('Status is required')],
      capacity: [rules.required('Capacity is required'), capacityRule],
    });

    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const payload = {
        name: formData.value.name,
        department: formData.value.departmentId ? { id: Number(formData.value.departmentId) } : null,
        status: formData.value.status,
        specialization: formData.value.specialization || undefined,
        location: formData.value.location || undefined,
        capacity: Number(formData.value.capacity) || 1,
        hasAnesthesiaMachine: formData.value.hasAnesthesiaMachine,
        hasVentilator: formData.value.hasVentilator,
        hasMonitoringSystem: formData.value.hasMonitoringSystem,
        hasSurgicalLights: formData.value.hasSurgicalLights,
        equipmentNotes: formData.value.equipmentNotes || undefined,
        notes: formData.value.notes || undefined,
      };
      const response = await theatreService.addOperationTheatre(payload);
      if (response.isSuccess) {
        showAlert('success', 'Operation Theatre registered successfully.', 'Success');
        router.push('/operation-theatre');
      }
    } finally {
      isSubmitting.value = false;
    }
  };

  onMounted(() => {
    fetchDepartments();
  });
</script>

<template>
  <DefaultLayout>
    <FormViewTemplate title="Add Operation Theatre" breadcrumb-title="Theatres" :is-submitting="isSubmitting" @submit="submitTheatre" @cancel="router.push('/operation-theatre')">
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
        placeholder="Assign to department (optional)..."
        :error="!!errors.departmentId"
        :error-message="errors.departmentId"
      />

      <BaseSelect
        label="Status"
        v-model="formData.status"
        :options="STATUS_OPTIONS.OPERATION_THEATRE"
        placeholder="Select Status"
        :error="!!errors.status"
        :error-message="errors.status"
        field-required
        @change="validateField('status', formData.status, [rules.required('Status is required')])"
      />

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

      <BaseInput
        label="Capacity"
        v-model="formData.capacity"
        type="number"
        placeholder="Maximum number of people (e.g. 10)"
        field-required
        @change="validateField('capacity', formData.capacity, [rules.required('Capacity is required'), capacityRule])"
        :error="!!errors.capacity"
        :error-message="errors.capacity"
      />

      <div class="space-y-3 md:col-span-2">
        <label class="block text-sm font-medium text-emphasis">Equipment Available</label>
        <div class="grid grid-cols-2 gap-4 p-4 rounded-xl bg-elevated border border-stroke dark:border-strokedark">
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
