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
  import SurgeryService from '@/services/Surgery/Surgery.services';
  import DepartmentService from '@/services/Department/Department.services';
  import { STATUS_OPTIONS } from '@/constants/statusOptions';

  const router = useRouter();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();

  const surgeryService = new SurgeryService();
  const departmentService = new DepartmentService();

  const isSubmitting = ref(false);
  const departments = ref<any[]>([]);
  const deptPage = ref(0);
  const hasMoreDepts = ref(true);

  const formData = ref({
    name: '',
    departmentId: '',
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

  const submitSurgery = async () => {
    const isValid = validateForm(formData.value, {
      name: [rules.required(), rules.name()],
      cost: [rules.required()],
    });

    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const response = await surgeryService.addSurgery({
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
        showAlert('success', 'Surgery procedure added to registry.', 'Success');
        router.push('/surgery');
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
    <FormViewTemplate title="Define Surgery Procedure" breadcrumb-title="Surgeries" :is-submitting="isSubmitting" @submit="submitSurgery" @cancel="router.back()">
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
        placeholder="Select department..."
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
