<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BaseCheckbox from '@/components/Base/BaseCheckbox.vue';
  import BaseCard from '@/components/Base/BaseCard.vue';
  import LoadingSkeleton from '@/components/UI/LoadingSkeleton.vue';
  import PurchaseOrderServices from '@/services/PurchaseOrder/PurchaseOrder.services';
  import VendorServices from '@/services/Vendor/Vendor.services';
  import type { IPurchaseOrderDetails } from '@/services/PurchaseOrder/PurchaseOrder.dto';

  const router = useRouter();
  const route = useRoute();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();
  const purchaseOrderService = new PurchaseOrderServices();
  const vendorService = new VendorServices();

  const isSubmitting = ref(false);
  const isLoading = ref(true);
  const loadingDropdowns = ref(false);
  const vendors = ref<{ id: number; companyName: string }[]>([]);
  const formData = ref({
    id: 0,
    orderDate: '',
    totalAmount: 0,
    isConfirmed: false,
    vendorId: 0,
  });

  const orderDetails = ref<IPurchaseOrderDetails[]>([]);

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

  const loadDetails = async () => {
    isLoading.value = true;
    try {
      const response = await purchaseOrderService.getPurchaseOrderById(Number(route.params.id));
      if (response.data) {
        formData.value = {
          id: response.data.id,
          orderDate: response.data.orderDate?.split('T')[0] || '',
          totalAmount: response.data.totalAmount || 0,
          isConfirmed: response.data.isConfirmed,
          vendorId: response.data.vendorId,
        };
        orderDetails.value = response.data.purchaseOrderDetails || [];
      }
    } catch {
      showAlert('error', 'Failed to load purchase order details.', 'Error');
      router.push('/purchase-orders');
    } finally {
      isLoading.value = false;
    }
  };

  const submitUpdate = async () => {
    const isValid = validateForm(formData.value, {
      orderDate: [rules.required()],
      vendorId: [rules.requiredPositiveId('Please select a vendor')],
    });

    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const response = await purchaseOrderService.updatePurchaseOrder({
        id: formData.value.id,
        orderDate: formData.value.orderDate,
        totalAmount: Number(formData.value.totalAmount),
        isConfirmed: formData.value.isConfirmed,
        vendorId: Number(formData.value.vendorId),
      });
      if (response.isSuccess) {
        showAlert('success', 'Purchase order updated successfully.', 'Success');
        router.push('/purchase-orders');
      }
    } finally {
      isSubmitting.value = false;
    }
  };

  onMounted(() => {
    loadDetails();
    loadDropdownData();
  });
</script>

<template>
  <DefaultLayout>
    <div v-if="isLoading" class="space-y-6 max-w-5xl mx-auto">
      <LoadingSkeleton />
    </div>

    <FormViewTemplate
      v-else
      title="Edit Purchase Order"
      breadcrumb-title="Purchase Orders"
      :breadcrumb-slug="`PO #${formData.id}`"
      :is-submitting="isSubmitting"
      @submit="submitUpdate"
      @cancel="router.back()"
    >
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

      <template #extra>
        <BaseCard class="md:col-span-3">
          <template #header>
            <h3 class="text-lg font-semibold text-emphasis">Order Line Items</h3>
          </template>

          <div v-if="orderDetails.length === 0" class="text-center py-8 text-gray-500">No line items available</div>

          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-meta-4">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-boxdark divide-y divide-gray-200 dark:divide-strokedark">
                <tr v-for="detail in orderDetails" :key="detail.id">
                  <td class="px-4 py-3 text-sm text-emphasis">{{ detail.inventory?.name || '-' }}</td>
                  <td class="px-4 py-3 text-sm text-emphasis">{{ detail.quantity }}</td>
                  <td class="px-4 py-3 text-sm text-emphasis">Rs. {{ detail.price }}</td>
                  <td class="px-4 py-3 text-sm text-emphasis">Rs. {{ detail.price * detail.quantity }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </BaseCard>
      </template>
    </FormViewTemplate>
  </DefaultLayout>
</template>
