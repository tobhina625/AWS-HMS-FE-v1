<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelectNative from '@/components/Base/BaseSelectNative.vue';
  import FormActionButtons from '@/components/Forms/FormActionButtons.vue';
  import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue';
  import PatientService from '@/services/Patient/patient.services';
  import useAlert from '@/plugins/alert/useAlert';
  import { useRoute } from 'vue-router';
  import router from '@/router';
  import { validateLettersOnly, validateRequired, validatePositiveNumber } from '@/composables/useFormValidation';

  const patientService = new PatientService();
  const { showAlert } = useAlert();
  const route = useRoute();

  const pageTitle = ref('Edit Patient Profile');
  const patientId = ref('');
  const isSubmitting = ref(false);
  const genderOptions = [
    { label: 'Male', value: 0 },
    { label: 'Female', value: 1 },
  ];

  const formData = ref({
    name: '',
    phone: '',
    cnic: '',
    gender: 100,
    age: '',
    address: '',
  });

  const errors = ref({
    name: '',
    gender: '',
    age: '',
    address: '',
  });

  const validateField = (field: string) => {
    switch (field) {
      case 'name':
        errors.value.name = validateLettersOnly(formData.value.name, 'Name');
        break;
      case 'gender':
        errors.value.gender = formData.value.gender < 0 ? 'Gender is required.' : '';
        break;
      case 'age':
        errors.value.age = validatePositiveNumber(formData.value.age, 'Age');
        break;
      case 'address':
        errors.value.address = validateRequired(formData.value.address, 'Address');
        break;
    }
  };

  const validateAll = () => ['name', 'gender', 'age', 'address'].forEach(validateField);
  const hasErrors = () => Object.values(errors.value).some((e) => e !== '');

  const updatePatient = async () => {
    validateAll();
    if (hasErrors()) return;

    isSubmitting.value = true;
    const data = {
      id: Number(patientId.value),
      name: formData.value.name,
      phone: formData.value.phone,
      age: Number(formData.value.age),
      cnic: formData.value.cnic,
      address: formData.value.address,
      gender: Number(formData.value.gender),
    };

    const response = await patientService.updatePatient(data);
    isSubmitting.value = false;

    if (response.isSuccess) {
      showAlert('success', 'Patient Updated Successfully', 'Success');
      router.push('/patients');
    } else {
      showAlert('error', response.error, 'Invalid Form Data!');
    }
  };

  onMounted(async () => {
    patientId.value = route.params.id.toString();
    const response = await patientService.getPatientById(patientId.value);
    formData.value = response.data;
  });
</script>

<template>
  <DefaultLayout>
    <BreadcrumbDefault :pageTitle="pageTitle" />

    <div class="flex justify-start">
      <div class="w-full sm:w-4/5 md:w-2/3 xl:w-1/2 bg-surface rounded-md shadow-sm">
        <div class="p-4 sm:p-6 md:p-8 space-y-6">
          <form @submit.prevent="updatePatient">
            <BaseInput
              label="Name"
              type="text"
              placeholder="Enter name"
              v-model="formData.name"
              :error="errors.name !== ''"
              :error-message="errors.name"
              :field-required="true"
              @change="validateField('name')"
            />

            <div class="mt-5">
              <BaseSelectNative
                label="Gender"
                v-model="formData.gender"
                :options="genderOptions"
                placeholder="Select Gender"
                :error="!!errors.gender"
                :errorMessage="errors.gender"
                :fieldRequired="true"
                @change="validateField('gender')"
              />
            </div>

            <div class="mt-5">
              <BaseInput
                label="Age"
                type="number"
                placeholder="Enter age"
                v-model="formData.age"
                :error="errors.age !== ''"
                :error-message="errors.age"
                :field-required="true"
                @change="validateField('age')"
              />
            </div>

            <div class="mt-5">
              <BaseInput
                label="Address"
                type="text"
                placeholder="Enter address"
                v-model="formData.address"
                :error="errors.address !== ''"
                :error-message="errors.address"
                :field-required="true"
                @change="validateField('address')"
              />
            </div>

            <FormActionButtons submit-label="Update" :loading="isSubmitting" @submit="updatePatient" />
          </form>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
