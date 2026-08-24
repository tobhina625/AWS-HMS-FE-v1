<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import useAlert from '@/plugins/alert/useAlert';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelectNative from '@/components/Base/BaseSelectNative.vue';
  import PatientPaymentService from '@/services/PatientPayment/Patientpayment.services';

  const props = defineProps<{
    show: boolean;
    bill: {
      id: number;
      remainingBalance: number;
      patient?: {
        name?: string | null;
        firstName?: string;
        lastName?: string;
      };
    } | null;
  }>();

  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'success'): void;
  }>();

  const { showAlert } = useAlert();
  const paymentService = new PatientPaymentService();
  const isSubmitting = ref(false);

  const amount = ref(0);
  const paymentMethod = ref('0'); // Default to Cash (0)

  const errors = ref({
    amount: '',
  });

  const paymentMethodOptions = [
    { label: 'Cash', value: '0' },
    { label: 'Card', value: '1' },
    { label: 'Insurance', value: '2' },
  ];

  watch(
    () => props.bill,
    (newBill) => {
      if (newBill) {
        amount.value = newBill.remainingBalance;
        paymentMethod.value = '0';
        errors.value.amount = '';
      }
    },
    { immediate: true }
  );

  const validateAmount = () => {
    errors.value.amount = '';
    if (amount.value <= 0) {
      errors.value.amount = 'Payment amount must be greater than zero.';
    }
    if (props.bill && amount.value > props.bill.remainingBalance) {
      errors.value.amount = `Payment amount cannot exceed the remaining balance of ${props.bill.remainingBalance}.`;
    }
  };

  const handlePay = async () => {
    validateAmount();
    if (errors.value.amount || !props.bill) {
      return;
    }

    isSubmitting.value = true;
    try {
      const payload = {
        amount: Number(amount.value),
        paymentMethod: Number(paymentMethod.value),
        patientBillId: props.bill.id,
      };

      const response = await paymentService.recordPayment(payload);
      if (response?.isSuccess !== false) {
        showAlert('success', 'Payment recorded successfully.', 'Success');
        emit('success');
        emit('close');
      } else {
        showAlert('error', response?.error || 'Failed to record payment.', 'Error');
      }
    } catch (error: any) {
      console.error('Error paying bill:', error);
      showAlert('error', error?.message || 'Server error occurred.', 'Failed');
    } finally {
      isSubmitting.value = false;
    }
  };

  const patientName = computed(() => {
    if (!props.bill?.patient) return 'Unknown Patient';
    const p = props.bill.patient;
    return p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Unknown Patient';
  });
</script>

<template>
  <div v-if="show && bill" class="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/50" @click.self="emit('close')">
    <div class="bg-surface rounded-2xl max-w-md w-full shadow-lg border border-stroke dark:border-strokedark overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-stroke dark:border-strokedark bg-slate-50 dark:bg-meta-4 flex items-center justify-between">
        <h3 class="text-xl font-bold text-emphasis">Record Patient Payment</h3>
        <button @click="emit('close')" class="text-bodydark dark:text-bodydark1 hover:text-emphasis text-2xl font-bold">&times;</button>
      </div>

      <!-- Form Body -->
      <div class="p-6 space-y-4">
        <!-- Patient info -->
        <div class="bg-slate-50 dark:bg-meta-4 p-4 rounded-xl space-y-1">
          <p class="text-xs text-bodydark dark:text-bodydark1 uppercase tracking-wider font-semibold">Patient</p>
          <p class="text-sm font-bold text-emphasis">{{ patientName }}</p>

          <div class="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-stroke dark:border-strokedark">
            <div>
              <p class="text-xs text-bodydark dark:text-bodydark1">Bill ID</p>
              <p class="text-sm font-bold text-emphasis">#{{ bill.id }}</p>
            </div>
            <div>
              <p class="text-xs text-bodydark dark:text-bodydark1">Remaining Balance</p>
              <p class="text-sm font-bold text-danger">{{ bill.remainingBalance }} PKR</p>
            </div>
          </div>
        </div>

        <!-- Amount to Pay -->
        <BaseInput
          label="Amount to Pay (PKR)"
          type="number"
          placeholder="Enter payment amount"
          v-model="amount"
          @change="validateAmount"
          :error="errors.amount !== ''"
          :error-message="errors.amount"
          :field-required="true"
        />

        <!-- Payment Method selection -->
        <BaseSelectNative label="Payment Method" v-model="paymentMethod" :options="paymentMethodOptions" :fieldRequired="true" />
      </div>

      <!-- Actions -->
      <div class="px-6 py-4 border-t border-stroke dark:border-strokedark flex justify-end gap-3 bg-slate-50 dark:bg-meta-4">
        <BaseButton variant="outline" @click="emit('close')" type="button">Cancel</BaseButton>
        <BaseButton variant="primary" :loading="isSubmitting" @click="handlePay">Submit Payment</BaseButton>
      </div>
    </div>
  </div>
</template>
