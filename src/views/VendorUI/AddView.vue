<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BasePhoneInput from '@/components/Base/BasePhoneInput.vue';
  import VendorServices from '@/services/Vendor/Vendor.services';

  const router = useRouter();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();
  const vendorService = new VendorServices();

  const isSubmitting = ref(false);
  const formData = ref({
    companyName: '',
    representative: '',
    contactNo: '',
    totalPayable: 0,
    paidAmount: 0,
    remainingBalance: 0,
  });

  const submitVendor = async () => {
    const isValid = validateForm(formData.value, {
      companyName: [rules.required(), rules.name()],
      representative: [rules.required()],
      contactNo: [rules.required(), rules.phone()],
    });

    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const response = await vendorService.addVendor({
        companyName: formData.value.companyName,
        representative: formData.value.representative,
        contactNo: formData.value.contactNo,
        totalPayable: Number(formData.value.totalPayable),
        paidAmount: Number(formData.value.paidAmount),
        remainingBalance: Number(formData.value.remainingBalance),
      });
      if (response.isSuccess) {
        showAlert('success', 'Vendor added to system registry.', 'Success');
        router.push('/vendors');
      } else {
        showAlert('error', response.error || 'Failed to add vendor.', 'Error');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to add vendor';
      showAlert('error', msg, 'Error');
    } finally {
      isSubmitting.value = false;
    }
  };
</script>

<template>
  <DefaultLayout>
    <FormViewTemplate title="Create New Vendor" breadcrumb-title="Vendors" :is-submitting="isSubmitting" @submit="submitVendor" @cancel="router.back()">
      <BaseInput
        label="Company Name"
        v-model="formData.companyName"
        placeholder="e.g. ABC Medical Supplies"
        :error="!!errors.companyName"
        :error-message="errors.companyName"
        field-required
        @change="validateField('companyName', formData.companyName, [rules.required(), rules.name()])"
      />

      <BaseInput
        label="Representative Name"
        v-model="formData.representative"
        placeholder="e.g. John Smith"
        :error="!!errors.representative"
        :error-message="errors.representative"
        field-required
        @change="validateField('representative', formData.representative, [rules.required()])"
      />

      <BasePhoneInput
        label="Contact Number"
        v-model="formData.contactNo"
        placeholder="Enter phone number"
        :error="!!errors.contactNo"
        :error-message="errors.contactNo"
        field-required
        @change="validateField('contactNo', formData.contactNo, [rules.required(), rules.phone()])"
      />

      <BaseInput label="Total Payable (Rs.)" type="number" v-model="formData.totalPayable" placeholder="0" />

      <BaseInput label="Paid Amount (Rs.)" type="number" v-model="formData.paidAmount" placeholder="0" />

      <BaseInput label="Remaining Balance (Rs.)" type="number" v-model="formData.remainingBalance" placeholder="0" />
    </FormViewTemplate>
  </DefaultLayout>
</template>
