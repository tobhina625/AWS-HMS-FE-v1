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
  import PurchaseOrderServices from '@/services/PurchaseOrder/PurchaseOrder.services';
  import VendorServices from '@/services/Vendor/Vendor.services';

  const router = useRouter();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();
  const purchaseOrderService = new PurchaseOrderServices();
  const vendorService = new VendorServices();

  const isSubmitting = ref(false);
  const loadingDropdowns = ref(false);
  const vendors = ref<{ id: number; companyName: string }[]>([]);

  const formData = ref({
    orderDate: '',
    totalAmount: 0,
    isConfirmed: false,
    vendorId: 0,
  });

  const loadVendors = async () => {
    try {
      const response = await vendorService.getVendors('size=1000&page=0&isDeleted=false');
      const content = response.content || response.Content || [];
      vendors.value = content.filter((item: any) => !item.isDeleted).map((item: any) => ({ id: item.id, companyName: item.companyName || `Vendor #${item.id}` }));
    } catch {
      showAlert('error', 'Failed to load vendors.', 'Error');
    }
  };

  const loadDropdownData = async () => {
    loadingDropdowns.value = true;
    try {
      await loadVendors();
    } finally {
      loadingDropdowns.value = false;
    }
  };

  const submitPurchaseOrder = async () => {
    const isValid = validateForm(formData.value, {
      orderDate: [rules.required()],
      vendorId: [rules.requiredPositiveId('Please select a vendor')],
    });

    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const response = await purchaseOrderService.addPurchaseOrder({
        orderDate: formData.value.orderDate,
        totalAmount: Number(formData.value.totalAmount),
        isConfirmed: formData.value.isConfirmed,
        vendorId: Number(formData.value.vendorId),
      });
      if (response.isSuccess) {
        showAlert('success', 'Purchase order added to system registry.', 'Success');
        router.push('/purchase-orders');
      }
    } finally {
      isSubmitting.value = false;
    }
  };

  onMounted(() => {
    loadDropdownData();
  });
</script>

<template>
  <DefaultLayout>
    <FormViewTemplate title="Create New Purchase Order" breadcrumb-title="Purchase Orders" :is-submitting="isSubmitting" @submit="submitPurchaseOrder" @cancel="router.back()">
      <BaseInput
        label="Order Date"
        type="date"
        v-model="formData.orderDate"
        :error="!!errors.orderDate"
        :error-message="errors.orderDate"
        field-required
        @change="validateField('orderDate', formData.orderDate, [rules.required()])"
      />

      <BaseSelect
        label="Vendor"
        v-model="formData.vendorId"
        :options="vendors"
        placeholder="Select a vendor..."
        :loading="loadingDropdowns"
        :error="!!errors.vendorId"
        :error-message="errors.vendorId"
        field-required
        display-key="companyName"
        value-key="id"
        @change="validateField('vendorId', formData.vendorId, [rules.requiredPositiveId('Please select a vendor')])"
      />

      <BaseInput label="Total Amount (Rs.)" type="number" v-model="formData.totalAmount" placeholder="0" />

      <BaseCheckbox label="Is Confirmed" v-model="formData.isConfirmed" />
    </FormViewTemplate>
  </DefaultLayout>
</template>
