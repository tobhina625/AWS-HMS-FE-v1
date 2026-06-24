<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BaseCnicInput from '@/components/Base/BaseCnicInput.vue';
  import BasePhoneInput from '@/components/Base/BasePhoneInput.vue';
  import PatientsServices from '@/services/Patient/patient.services';

  const route = useRoute();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();
  const patientService = new PatientsServices();

  const isLoading = ref(true);
  const isSubmitting = ref(false);
  const patientId = ref('');

  const formData = ref({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    cnic: '',
    gender: '',
    age: '',
    address: '',
    nationality: '',
    passportNumber: '',
    guardianCNIC: '',
  });

  const ageToDateOfBirth = (age: number): string => {
    const today = new Date();
    const birthYear = today.getFullYear() - age;
    const dob = new Date(birthYear, today.getMonth(), today.getDate());
    return dob.toISOString().split('T')[0];
  };

  const loadPatientDetails = async () => {
    isLoading.value = true;
    try {
      patientId.value = route.params.id.toString();
      const response = await patientService.getPatientById(patientId.value);
      if (response?.data) {
        const d = response.data;
        let dateOfBirth = d.dateOfBirth || '';
        const hasValidDob = dateOfBirth && dateOfBirth !== '0001-01-01' && !dateOfBirth.startsWith('0001-');
        if (hasValidDob) {
          dateOfBirth = dateOfBirth.split('T')[0];
        } else if (d.age != null && d.age > 0) {
          dateOfBirth = ageToDateOfBirth(Number(d.age));
        }
        formData.value = {
          firstName: d.firstName || '',
          lastName: d.lastName || '',
          dateOfBirth,
          phone: d.phone || '',
          cnic: d.cnic || '',
          gender: d.gender != null ? String(d.gender) : '',
          age: d.age != null ? String(d.age) : '',
          address: d.address || '',
          nationality: d.nationality || '',
          passportNumber: d.passportNumber || '',
          guardianCNIC: d.guardianCNIC || '',
        };
      }
    } finally {
      isLoading.value = false;
    }
  };

  const submitUpdate = async () => {
    const isValid = validateForm(formData.value, {
      firstName: [rules.required(), rules.name()],
      lastName: [rules.required(), rules.name()],
      dateOfBirth: [rules.required('Date of birth is required')],
      phone: [rules.required()],
      gender: [rules.required('Gender is required')],
      address: [rules.required()],
    });

    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const payload = {
        id: Number(patientId.value),
        firstName: formData.value.firstName,
        lastName: formData.value.lastName,
        dateOfBirth: formData.value.dateOfBirth,
        phone: formData.value.phone,
        cnic: formData.value.cnic,
        age: Number(formData.value.age),
        address: formData.value.address,
        gender: Number(formData.value.gender),
        nationality: formData.value.nationality || undefined,
        passportNumber: formData.value.passportNumber || undefined,
        guardianCNIC: formData.value.guardianCNIC || undefined,
      };
      const response = await patientService.updatePatient(payload);
      if (response.isSuccess) {
        showAlert('success', 'Patient record updated successfully.', 'Success');
        router.push('/patients');
      } else {
        showAlert('error', response.error || 'Failed to update patient', 'Error');
      }
    } catch (error: any) {
      showAlert('error', error.message || 'An error occurred', 'Error');
    } finally {
      isSubmitting.value = false;
    }
  };

  onMounted(() => loadPatientDetails());
</script>

<template>
  <DefaultLayout>
    <!-- Loading skeleton -->
    <div v-if="isLoading" class="space-y-6 max-w-5xl mx-auto animate-pulse">
      <div class="h-8 bg-elevatedstrokedark/30 rounded-2xl w-1/3"></div>
      <div class="bg-surface rounded-3xl p-8 space-y-6">
        <div class="grid grid-cols-2 gap-8">
          <div v-for="i in 4" :key="i" class="h-14 bg-gray-50 dark:bg-strokedark/20 rounded-xl"></div>
        </div>
      </div>
    </div>

    <FormViewTemplate
      v-else
      title="Update Patient Record"
      breadcrumb-title="Patients"
      breadcrumb-slug="Edit Record"
      :is-submitting="isSubmitting"
      submit-label="Save Changes"
      @submit="submitUpdate"
      @cancel="router.push('/patients')"
    >
      <BaseInput
        label="First Name"
        v-model="formData.firstName"
        placeholder="Enter first name"
        :error="!!errors.firstName"
        :error-message="errors.firstName"
        field-required
        @change="validateField('firstName', formData.firstName, [rules.required(), rules.name()])"
      />

      <BaseInput
        label="Last Name"
        v-model="formData.lastName"
        placeholder="Enter last name"
        :error="!!errors.lastName"
        :error-message="errors.lastName"
        field-required
        @change="validateField('lastName', formData.lastName, [rules.required(), rules.name()])"
      />

      <BaseInput
        label="Date of Birth"
        type="date"
        v-model="formData.dateOfBirth"
        :error="!!errors.dateOfBirth"
        :error-message="errors.dateOfBirth"
        field-required
        @change="validateField('dateOfBirth', formData.dateOfBirth, [rules.required('Date of birth is required')])"
      />

      <BaseSelect
        label="Biological Gender"
        v-model="formData.gender"
        :options="[
          { id: '0', name: 'Male' },
          { id: '1', name: 'Female' },
        ]"
        placeholder="Select gender"
        :error="!!errors.gender"
        :error-message="errors.gender"
        field-required
      />

      <BasePhoneInput
        label="Phone Number"
        v-model="formData.phone"
        placeholder="Enter phone number"
        :error="!!errors.phone"
        :error-message="errors.phone"
        field-required
        @change="validateField('phone', formData.phone, [rules.required()])"
      />

      <BaseCnicInput v-model="formData.cnic" readonly />

      <BaseInput
        label="Residential Address"
        v-model="formData.address"
        placeholder="Street, City, Province"
        :error="!!errors.address"
        :error-message="errors.address"
        field-required
        class="md:col-span-2"
        @change="validateField('address', formData.address, [rules.required()])"
      />

      <BaseInput label="Nationality" v-model="formData.nationality" placeholder="e.g. Pakistani" :error="!!errors.nationality" :error-message="errors.nationality" />

      <BaseInput label="Passport Number" v-model="formData.passportNumber" placeholder="For international patients" :error="!!errors.passportNumber" :error-message="errors.passportNumber" />

      <BaseCnicInput label-prefix="Guardian" v-model="formData.guardianCNIC" :error="!!errors.guardianCNIC" :error-message="errors.guardianCNIC" />
    </FormViewTemplate>
  </DefaultLayout>
</template>
