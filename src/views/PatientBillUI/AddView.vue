<script setup lang="ts">
  import router from '@/router';
  import useAlert from '@/plugins/alert/useAlert';
  import { ref } from 'vue';
  import PatientsServices from '@/services/PatientBill/Patientbill.services';
  import PatientServices from '@/services/Patient/patient.services';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelectNative from '@/components/Base/BaseSelectNative.vue';
  import BasePhoneInput from '@/components/Base/BasePhoneInput.vue';
  import BaseCnicInput from '@/components/Base/BaseCnicInput.vue';
  import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue';
  import { useCnicConfig } from '@/composables/useCnicConfig';

  const patientBillServices = new PatientsServices();
  const patientServices = new PatientServices();
  const { showAlert } = useAlert();

  const ageToDateOfBirth = (age: number): string => {
    const today = new Date();
    const birthYear = today.getFullYear() - age;
    return new Date(birthYear, today.getMonth(), today.getDate()).toISOString().split('T')[0];
  };

  const formData = ref({
    name: '',
    phone: '',
    cnic: '',
    genderId: '',
    age: '',
    address: '',
    reason: '',
  });

  const errors = ref({
    name: '',
    phone: '',
    cnic: '',
    genderId: '',
    age: '',
    address: '',
    reason: '',
  });

  const pageTitle = ref('Add Patient Bill Profile');
  const genderOptions = [
    { label: 'Male', value: '0' },
    { label: 'Female', value: '1' },
  ];

  const validateFormData = () => {
    validateName();
    validatePhoneNumber();
    validateCNIC();
    validateAddress();
    validateGender();
    validateAge();
  };

  const validateName = () => {
    errors.value.name = '';
    const nameRegex = /^[A-Za-z\s]+$/;
    const name = formData.value.name.trim();
    if (!name) {
      errors.value.name = 'Name is required.';
    } else if (!nameRegex.test(name)) {
      errors.value.name = 'Name should only contain letters and spaces.';
    }
  };

  const validatePhoneNumber = () => {
    errors.value.phone = '';
    const phone = formData.value.phone?.trim();
    if (!phone) {
      errors.value.phone = 'Phone number is required.';
      return;
    }
    const match = phone.match(/^(\+\d+)\s*(.*)$/);
    if (!match) {
      errors.value.phone = 'Select country code first, then enter 10 digits.';
      return;
    }
    const numPart = match[2].replace(/\D/g, '');
    if (numPart.length < 10) {
      errors.value.phone = 'Enter 10 digits after country code.';
      return;
    }
    if (numPart.length > 10) {
      errors.value.phone = 'Phone number should not exceed 10 digits after country code.';
    }
  };

  const validateCNIC = () => {
    errors.value.cnic = '';
    const { validateCnicFormat, cnicConfig } = useCnicConfig();

    if (!formData.value.cnic || formData.value.cnic.trim().length === 0) {
      errors.value.cnic = `${cnicConfig.value.fieldName} is required.`;
      return;
    }

    const error = validateCnicFormat(formData.value.cnic);
    if (error) {
      errors.value.cnic = error;
    }
  };

  const validateGender = () => {
    errors.value.genderId = '';
    if (!formData.value.genderId) {
      errors.value.genderId = 'Gender is required.';
    }
  };

  const validateAge = () => {
    errors.value.age = '';
    if (!formData.value.age) {
      errors.value.age = 'Age is required.';
    }
    if (Number(formData.value.age) < 1) {
      errors.value.age = 'Age must be greater than 0.';
    }
  };

  const validateAddress = () => {
    errors.value.address = '';
    if (!formData.value.address) {
      errors.value.address = 'Address is required.';
    }
  };

  const validateReason = () => {
    errors.value.reason = '';
    if (!formData.value.reason?.trim()) {
      errors.value.reason = 'Bill reason is required.';
    }
  };

  const addPatientBill = async () => {
    validateFormData();
    validateReason();

    const hasErrors = errors.value.name || errors.value.phone || errors.value.cnic || errors.value.address || errors.value.genderId || errors.value.age || errors.value.reason;
    if (!hasErrors) {
      try {
        const nameParts = formData.value.name.trim().split(/\s+/);
        const firstName = nameParts[0] || formData.value.name.trim();
        const lastName = nameParts.slice(1).join(' ') || '';

        const patientPayload = {
          firstName,
          lastName,
          dateOfBirth: ageToDateOfBirth(Number(formData.value.age)),
          age: Number(formData.value.age),
          phone: formData.value.phone?.trim().replace(/\s+/g, ' ') || '',
          cnic: formData.value.cnic?.replace(/\s/g, '').trim() || '',
          gender: Number(formData.value.genderId),
          address: formData.value.address.trim(),
        };

        const addPatientResponse = await patientServices.addPatient(patientPayload);
        const patientId = addPatientResponse?.data?.id ?? addPatientResponse?.Data?.Id ?? addPatientResponse?.data?.Id;

        if (!patientId || Number(patientId) === 0) {
          showAlert('error', addPatientResponse?.error || 'Failed to create patient record.', 'Failed');
          return;
        }

        const billPayload = {
          billType: 1,
          reason: formData.value.reason.trim(),
          entityId: 1,
          totalAmount: 1000,
          isPaid: true,
          paidAmount: 1000,
          remainingBalance: 0,
          patient: {
            id: Number(patientId),
            name: formData.value.name.trim(),
            gender: Number(formData.value.genderId),
            phone: formData.value.phone?.trim().replace(/\s+/g, ' ') || '',
            cnic: formData.value.cnic?.replace(/\s/g, '').trim() || '',
            address: formData.value.address.trim(),
            age: Number(formData.value.age),
          },
        };

        const response = await patientBillServices.addPatientBills(billPayload);
        if (response?.isSuccess) {
          showAlert('success', 'Patient bill Added Successfully', 'Success');
          router.push('/patient-bill');
        } else {
          showAlert('error', response?.error || 'API Error', 'Failed');
        }
      } catch (error: any) {
        console.error('❌ Error:', error);
        showAlert('error', error?.message || 'Server error occurred.', 'Failed');
      }
    } else {
      showAlert('error', 'Please fill all required fields.', 'Validation Error');
    }
  };
</script>

<template>
  <DefaultLayout>
    <BreadcrumbDefault :pageTitle="pageTitle" />

    <div class="flex flex-col gap-10">
      <div class="bg-surface rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
        <div class="p-5 space-y-6 sm:p-6">
          <form @submit.prevent="addPatientBill()">
            <div class="-mx-2.5 flex flex-wrap gap-y-5">
              <div class="w-full mb-4 px-2.5 xl:w-1/2">
                <BaseInput
                  label="Name"
                  type="text"
                  placeholder="Enter name"
                  v-model="formData.name"
                  @change="validateName()"
                  :error="errors.name !== ''"
                  :error-message="errors.name"
                  :field-required="true"
                />
              </div>

              <div class="w-full mb-4 px-2.5 xl:w-1/2">
                <BasePhoneInput label="Phone #" v-model="formData.phone" :error="errors.phone !== ''" :errorMessage="errors.phone" :fieldRequired="true" @change="validatePhoneNumber()" />
              </div>

              <div class="w-full px-2.5 mb-4 sm:w-1/2 xl:w-1/3">
                <BaseCnicInput v-model="formData.cnic" @change="validateCNIC()" :error="errors.cnic !== ''" :error-message="errors.cnic" :field-required="true" />
              </div>

              <div class="w-full px-2.5 mb-4 sm:w-1/2 xl:w-1/3">
                <BaseSelectNative
                  label="Gender"
                  v-model="formData.genderId"
                  :options="genderOptions"
                  placeholder="Select Gender"
                  :error="errors.genderId !== ''"
                  :errorMessage="errors.genderId"
                  :fieldRequired="true"
                  @change="validateGender()"
                />
              </div>

              <div class="w-full mb-4 px-2.5 xl:w-1/3">
                <BaseInput
                  label="Age"
                  type="number"
                  placeholder="Enter age"
                  v-model="formData.age"
                  @change="validateAge()"
                  :error="errors.age !== ''"
                  :error-message="errors.age"
                  :field-required="true"
                />
              </div>

              <div class="w-full mb-4 px-2.5">
                <BaseInput
                  label="Address"
                  type="text"
                  placeholder="Enter address"
                  v-model="formData.address"
                  @change="validateAddress()"
                  :error="errors.address !== ''"
                  :error-message="errors.address"
                  :field-required="true"
                />
              </div>

              <div class="w-full mb-4 px-2.5">
                <BaseInput
                  label="Bill Reason"
                  type="text"
                  placeholder="e.g. Consultation, Lab tests"
                  v-model="formData.reason"
                  @change="validateReason()"
                  :error="errors.reason !== ''"
                  :error-message="errors.reason"
                  :field-required="true"
                />
              </div>

              <div class="w-full mb-2 mt-5 px-2.5 flex sm:flex-row items-center justify-end gap-4">
                <BaseButton variant="outline" @click="router.back()" class="w-full sm:w-auto min-w-[120px]">Cancel</BaseButton>
                <BaseButton type="submit" variant="primary" class="w-full sm:w-auto min-w-[120px] px-7">Add</BaseButton>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
