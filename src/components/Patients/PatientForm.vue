<script setup lang="ts">
  /**
   * PatientForm
   * Renders the patient demographics fields (Name, Phone, CNIC, Gender, Age, Address).
   * Receives formData and errors as props, emits validate events per field.
   */
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BasePhoneInput from '@/components/Base/BasePhoneInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BaseCnicInput from '@/components/Base/BaseCnicInput.vue';

  const props = defineProps<{
    formData: {
      name: string;
      phone: string;
      cnic: string;
      genderId: string;
      age: string;
      address: string;
    };
    errors: {
      name: string;
      phone: string;
      cnic: string;
      genderId: string;
      age: string;
      address: string;
    };
  }>();

  const emit = defineEmits<{
    (e: 'update:formData', val: typeof props.formData): void;
    (e: 'validateField', field: string): void;
  }>();

  const genderOptions = [
    { id: '0', name: 'Male' },
    { id: '1', name: 'Female' },
  ];

  const updateField = (field: string, value: any) => {
    emit('update:formData', { ...props.formData, [field]: value });
    emit('validateField', field);
  };
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full">
    <!-- Name -->
    <BaseInput
      label="Name"
      :model-value="formData.name"
      @update:model-value="(val: string) => updateField('name', val)"
      placeholder="Enter name"
      :error="!!errors.name"
      :error-message="errors.name"
      field-required
    />
    <BasePhoneInput
      label="Phone #"
      :model-value="formData.phone"
      @update:model-value="(val: string) => updateField('phone', val)"
      :error="!!errors.phone"
      :error-message="errors.phone"
      field-required
    />

    <!-- CNIC -->
    <BaseCnicInput :model-value="formData.cnic" @update:model-value="(val: string) => updateField('cnic', val)" :error="!!errors.cnic" :error-message="errors.cnic" field-required />

    <!-- Gender -->
    <BaseSelect
      label="Gender"
      placeholder="Select Gender"
      :model-value="formData.genderId"
      @update:model-value="(val: string) => updateField('genderId', val)"
      :options="genderOptions"
      :error="!!errors.genderId"
      :error-message="errors.genderId"
      field-required
    />

    <!-- Age -->
    <BaseInput
      label="Age"
      type="number"
      :model-value="formData.age"
      @update:model-value="(val: string) => updateField('age', val)"
      placeholder="Enter age"
      :error="!!errors.age"
      :error-message="errors.age"
      field-required
    />

    <!-- Address -->
    <BaseInput
      label="Address"
      :model-value="formData.address"
      @update:model-value="(val: string) => updateField('address', val)"
      placeholder="Enter address"
      :error="!!errors.address"
      :error-message="errors.address"
      field-required
      class="md:col-span-2"
    />
  </div>
</template>
