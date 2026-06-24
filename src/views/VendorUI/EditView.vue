<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BasePhoneInput from '@/components/Base/BasePhoneInput.vue';
  import BaseCard from '@/components/Base/BaseCard.vue';
  import LoadingSkeleton from '@/components/UI/LoadingSkeleton.vue';
  import VendorServices from '@/services/Vendor/Vendor.services';
  import { STATUS_OPTIONS } from '@/constants/statusOptions';
  import type { IVendorPayment } from '@/services/Vendor/Vendor.dto';

  const router = useRouter();
  const route = useRoute();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();
  const vendorService = new VendorServices();

  const isSubmitting = ref(false);
  const isLoading = ref(true);
  const formData = ref({
    id: 0,
    companyName: '',
    representative: '',
    contactNo: '',
    totalPayable: 0,
    paidAmount: 0,
    remainingBalance: 0,
  });

  const payments = ref<IVendorPayment[]>([]);

  const loadDetails = async () => {
    isLoading.value = true;
    try {
      const response = await vendorService.getVendorById(Number(route.params.id));
      if (response.data) {
        formData.value = {
          id: response.data.id,
          companyName: response.data.companyName,
          representative: response.data.representative,
          contactNo: response.data.contactNo,
          totalPayable: response.data.totalPayable || 0,
          paidAmount: response.data.paidAmount || 0,
          remainingBalance: response.data.remainingBalance || 0,
        };
        payments.value = response.data.vendorPayments || [];
      }
    } catch {
      showAlert('error', 'Failed to load vendor details.', 'Error');
      router.push('/vendors');
    } finally {
      isLoading.value = false;
    }
  };

  const submitUpdate = async () => {
    const isValid = validateForm(formData.value, {
      companyName: [rules.required(), rules.name()],
      representative: [rules.required()],
      contactNo: [rules.required(), rules.phone()],
    });

    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const response = await vendorService.updateVendor({
        id: formData.value.id,
        companyName: formData.value.companyName,
        representative: formData.value.representative,
        contactNo: formData.value.contactNo,
        totalPayable: Number(formData.value.totalPayable),
        paidAmount: Number(formData.value.paidAmount),
        remainingBalance: Number(formData.value.remainingBalance),
      });
      if (response.isSuccess) {
        showAlert('success', 'Vendor updated successfully.', 'Success');
        router.push('/vendors');
      } else {
        showAlert('error', response.error || 'Failed to update vendor.', 'Error');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to update vendor';
      showAlert('error', msg, 'Error');
    } finally {
      isSubmitting.value = false;
    }
  };

  const getPaymentMethodName = (method: number) => {
    const option = STATUS_OPTIONS.PAYMENT_METHOD.find((opt) => opt.id === method);
    return option?.name || 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  onMounted(() => {
    loadDetails();
  });
</script>

<template>
  <DefaultLayout>
    <div v-if="isLoading" class="space-y-6 max-w-5xl mx-auto">
      <LoadingSkeleton />
    </div>

    <FormViewTemplate v-else title="Edit Vendor" breadcrumb-title="Vendors" :breadcrumb-slug="formData.companyName" :is-submitting="isSubmitting" @submit="submitUpdate" @cancel="router.back()">
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

      <template #extra>
        <BaseCard class="md:col-span-3">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-emphasis">Payment History</h3>
            </div>
          </template>

          <div v-if="payments.length === 0" class="text-center py-8 text-gray-500">No payment history available</div>

          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-meta-4">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Method</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-boxdark divide-y divide-gray-200 dark:divide-strokedark">
                <tr v-for="payment in payments" :key="payment.id">
                  <td class="px-4 py-3 text-sm text-emphasis">{{ formatDate(payment.paymentDate) }}</td>
                  <td class="px-4 py-3 text-sm text-emphasis">Rs. {{ payment.amount }}</td>
                  <td class="px-4 py-3 text-sm text-emphasis">{{ getPaymentMethodName(payment.paymentMethod) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </BaseCard>
      </template>
    </FormViewTemplate>
  </DefaultLayout>
</template>
