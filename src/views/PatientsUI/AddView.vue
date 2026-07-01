<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BaseCnicInput from '@/components/Base/BaseCnicInput.vue';
  import BasePhoneInput from '@/components/Base/BasePhoneInput.vue';
  import PatientsServices from '@/services/Patient/patient.services';

  const router = useRouter();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();

  const patientService = new PatientsServices();

  const isSubmitting = ref(false);

  const formData = ref({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    cnic: '',
    gender: '',
    age: '',
    address: '',
    emailAddress: '',
    nationality: '',
    passportNumber: '',
    guardianCNIC: '',
  });

  const submitPatient = async () => {
    const isValid = validateForm(formData.value, {
      firstName: [rules.required(), rules.name()],
      lastName: [rules.required(), rules.name()],
      dateOfBirth: [rules.required('Date of birth is required')],
      phone: [rules.required()],
      cnic: [rules.required(), rules.cnic()],
      gender: [rules.required('Gender is required')],
      address: [rules.required()],
    });

    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const calculateAge = (dob: string) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      };

      const payload = {
        firstName: formData.value.firstName,
        lastName: formData.value.lastName,
        dateOfBirth: formData.value.dateOfBirth,
        age: calculateAge(formData.value.dateOfBirth),
        phone: formData.value.phone,
        cnic: formData.value.cnic,
        gender: Number(formData.value.gender),
        address: formData.value.address,
        emailAddress: formData.value.emailAddress || '',
        nationality: formData.value.nationality || '',
        passportNumber: formData.value.passportNumber || '',
        guardianCNIC: formData.value.guardianCNIC || '',
      };

      // console.log('Submitting patient with payload:', payload);
      const response = await patientService.addPatient(payload);
      if (response.isSuccess) {
        showAlert('success', 'Patient registered successfully.', 'Registry Updated');
        router.push('/patients');
      } else {
        showAlert('error', response.error || 'Failed to add patient', 'Error');
      }
    } catch (error: any) {
      showAlert('error', error.message || 'An error occurred', 'Error');
    } finally {
      isSubmitting.value = false;
    }
  };
</script>

<template>
  <DefaultLayout>
    <FormViewTemplate title="Add Patient Record" breadcrumb-title="Patients" :is-submitting="isSubmitting" @submit="submitPatient" @cancel="router.push('/patients')">
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

      <BaseCnicInput v-model="formData.cnic" :error="!!errors.cnic" :error-message="errors.cnic" field-required @change="validateField('cnic', formData.cnic, [rules.required(), rules.cnic()])" />

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

      <BaseInput
        label="Email Address"
        type="email"
        field-required
        v-model="formData.emailAddress"
        placeholder="Enter email address"
        :error="!!errors.emailAddress"
        :error-message="errors.emailAddress"
        @change="validateField('emailAddress', formData.emailAddress, [rules.email()])"
      />

      <BaseInput label="Nationality (Optional)" v-model="formData.nationality" placeholder="e.g. Pakistani" :error="!!errors.nationality" :error-message="errors.nationality" />

      <BaseInput
        label="Passport Number (Optional)"
        v-model="formData.passportNumber"
        placeholder="For international patients"
        :error="!!errors.passportNumber"
        :error-message="errors.passportNumber"
      />

      <BaseCnicInput label-prefix="Guardian" v-model="formData.guardianCNIC" :error="!!errors.guardianCNIC" :error-message="errors.guardianCNIC" />
    </FormViewTemplate>
  </DefaultLayout>
</template>
