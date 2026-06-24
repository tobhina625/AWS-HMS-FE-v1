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
  import SurgeryService from '@/services/Surgery/Surgery.services';
  import DepartmentService from '@/services/Department/Department.services';
  import { STATUS_OPTIONS } from '@/constants/statusOptions';

  const route = useRoute();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();

  const surgeryService = new SurgeryService();
  const departmentService = new DepartmentService();

  const isLoading = ref(true);
  const isSubmitting = ref(false);
  const surgeryId = ref<number | null>(null);

  const departments = ref<any[]>([]);
  const deptPage = ref(0);
  const hasMoreDepts = ref(true);

  const formData = ref({
    name: '',
    cost: '',
    status: 'Active',
    category: 'General',
    description: '',
    location: '',
    duration: '',
    riskLevel: '',
    requiresGeneralAnesthesia: false,
    requiresBloodBank: false,
    requiresICU: false,
    isMinimallyInvasive: false,
    departmentId: '',
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
      surgeryId.value = id;
      const response = await surgeryService.getSurgeryById(id);
      if (response?.data) {
        const d = response.data;
        formData.value = {
          name: d.name || '',
          cost: d.cost != null ? String(d.cost) : '',
          status: d.status || 'Active',
          category: d.category || 'General',
          description: d.description || '',
          location: d.location || '',
          duration: d.duration != null ? String(d.duration) : '',
          riskLevel: d.riskLevel || '',
          requiresGeneralAnesthesia: d.requiresGeneralAnesthesia || false,
          requiresBloodBank: d.requiresBloodBank || false,
          requiresICU: d.requiresICU || false,
          isMinimallyInvasive: d.isMinimallyInvasive || false,
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
      cost: [rules.required()],
    });
    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const response = await surgeryService.updateSurgery({
        id: surgeryId.value!,
        name: formData.value.name,
        cost: Number(formData.value.cost),
        status: formData.value.status,
        category: formData.value.category,
        description: formData.value.description || undefined,
        location: formData.value.location || undefined,
        duration: Number(formData.value.duration) || 0,
        riskLevel: formData.value.riskLevel || undefined,
        requiresGeneralAnesthesia: formData.value.requiresGeneralAnesthesia,
        requiresBloodBank: formData.value.requiresBloodBank,
        requiresICU: formData.value.requiresICU,
        isMinimallyInvasive: formData.value.isMinimallyInvasive,
        department: { id: Number(formData.value.departmentId) || 0 },
      });
      if (response.isSuccess) {
        showAlert('success', 'Surgery procedure updated.', 'Success');
        router.push('/surgery');
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
        <div v-for="i in 6" :key="i" class="h-14 bg-gray-50 dark:bg-strokedark/20 rounded-xl"></div>
      </div>
    </div>
    <FormViewTemplate v-else title="Update Surgery Procedure" breadcrumb-title="Surgeries" :is-submitting="isSubmitting" submit-label="Save Changes" @submit="submitUpdate" @cancel="router.back()">
      <BaseInput
        label="Procedure Name"
        v-model="formData.name"
        placeholder="e.g. Laparoscopic Cholecystectomy"
        :error="!!errors.name"
        :error-message="errors.name"
        field-required
        @change="validateField('name', formData.name, [rules.required(), rules.name()])"
      />

      <BaseSelect
        label="Managing Department"
        v-model="formData.departmentId"
        :options="departments"
        :has-more="hasMoreDepts"
        @load-more="fetchDepartments"
        :error="!!errors.departmentId"
        :error-message="errors.departmentId"
      />

      <BaseSelect label="Status" v-model="formData.status" :options="STATUS_OPTIONS.SURGERY" placeholder="Select status..." field-required />

      <BaseSelect
        label="Specialization Category"
        v-model="formData.category"
        :options="[
          { id: 'General', name: 'General' },
          { id: 'Orthopedic', name: 'Orthopedic' },
          { id: 'Cardiac', name: 'Cardiac' },
          { id: 'Neurological', name: 'Neurological' },
          { id: 'Ophthalmic', name: 'Ophthalmic' },
          { id: 'ENT', name: 'ENT' },
          { id: 'Urological', name: 'Urological' },
          { id: 'Gynecological', name: 'Gynecological' },
          { id: 'Pediatric', name: 'Pediatric' },
          { id: 'Plastic', name: 'Plastic' },
          { id: 'Vascular', name: 'Vascular' },
          { id: 'Thoracic', name: 'Thoracic' },
        ]"
        placeholder="Select category..."
        field-required
      />

      <BaseInput
        label="Base Procedure Cost"
        type="number"
        v-model="formData.cost"
        placeholder="0.00"
        :error="!!errors.cost"
        :error-message="errors.cost"
        field-required
        @change="validateField('cost', formData.cost, [rules.required()])"
      />

      <BaseInput label="Estimated Duration (minutes)" type="number" v-model="formData.duration" placeholder="e.g. 120" />

      <BaseInput label="Risk Level" v-model="formData.riskLevel" placeholder="e.g. Low, Medium, High, Critical" />

      <BaseInput label="Location" v-model="formData.location" placeholder="e.g. Building A, Floor 3" />

      <BaseInput label="Description" v-model="formData.description" placeholder="Detailed description of the surgical procedure" />

      <div class="col-span-2">
        <label class="block text-sm font-medium text-emphasis mb-3">Equipment & Requirements</label>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex items-center gap-3 p-3 bg-elevated rounded-xl hover:bg-gray-100 dark:hover:bg-meta-4/80 transition-colors">
            <BaseCheckbox label="Requires General Anesthesia" v-model="formData.requiresGeneralAnesthesia" />
          </div>
          <div class="flex items-center gap-3 p-3 bg-elevated rounded-xl hover:bg-gray-100 dark:hover:bg-meta-4/80 transition-colors">
            <BaseCheckbox label="Requires Blood Bank" v-model="formData.requiresBloodBank" />
          </div>
          <div class="flex items-center gap-3 p-3 bg-elevated rounded-xl hover:bg-gray-100 dark:hover:bg-meta-4/80 transition-colors">
            <BaseCheckbox label="Requires ICU" v-model="formData.requiresICU" />
          </div>
          <div class="flex items-center gap-3 p-3 bg-elevated rounded-xl hover:bg-gray-100 dark:hover:bg-meta-4/80 transition-colors">
            <BaseCheckbox label="Minimally Invasive" v-model="formData.isMinimallyInvasive" />
          </div>
        </div>
      </div>
    </FormViewTemplate>
  </DefaultLayout>
</template>
