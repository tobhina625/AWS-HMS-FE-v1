<script setup lang="ts">
  import { onMounted, ref, computed } from 'vue';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelectNative from '@/components/Base/BaseSelectNative.vue';
  import FormActionButtons from '@/components/Forms/FormActionButtons.vue';
  import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue';
  import PatientBillsService from '@/services/PatientBill/Patientbill.services';
  import useAlert from '@/plugins/alert/useAlert';
  import { useRoute } from 'vue-router';
  import router from '@/router';

  const patientBillServices = new PatientBillsService();
  const { showAlert } = useAlert();
  const route = useRoute();

  const pageTitle = ref('Edit Patient Bill');
  const billId = ref('');
  const isSubmitting = ref(false);
  const patientName = ref('');

  const billTypeOptions = [
    { label: 'Surgery', value: 0 },
    { label: 'Lab Test', value: 1 },
    { label: 'Treatment', value: 2 },
    { label: 'Admission', value: 3 },
  ];

  const formData = ref({
    id: 0,
    billType: 1,
    reason: '',
    entityId: 0,
    totalAmount: 0,
    paidAmount: 0,
    patientId: 0,
  });

  const errors = ref({
    reason: '',
    totalAmount: '',
  });

  const validateReason = () => {
    errors.value.reason = '';
    if (!formData.value.reason.trim()) {
      errors.value.reason = 'Reason is required.';
    }
  };

  const validateTotalAmount = () => {
    errors.value.totalAmount = '';
    if (formData.value.totalAmount <= 0) {
      errors.value.totalAmount = 'Total amount must be greater than 0.';
    }
  };

  const remainingBalance = computed(() => {
    const val = formData.value.totalAmount - formData.value.paidAmount;
    return val > 0 ? val : 0;
  });

  const isPaid = computed(() => {
    return remainingBalance.value === 0 && formData.value.totalAmount > 0;
  });

  const updatePatientBill = async () => {
    validateReason();
    validateTotalAmount();

    if (errors.value.reason || errors.value.totalAmount) {
      showAlert('error', 'Please correct the validation errors.', 'Validation Error');
      return;
    }

    isSubmitting.value = true;
    try {
      const updateData = {
        id: formData.value.id,
        billType: Number(formData.value.billType),
        reason: formData.value.reason.trim(),
        entityId: Number(formData.value.entityId) || 0,
        totalAmount: Number(formData.value.totalAmount),
        isPaid: isPaid.value,
        paidAmount: Number(formData.value.paidAmount),
        remainingBalance: remainingBalance.value,
        patient: {
          id: formData.value.patientId,
        },
      };

      const response: any = await patientBillServices.updatePatientBill(updateData);

      if (response?.isSuccess !== false) {
        showAlert('success', 'Patient bill updated successfully.', 'Success');
        router.push('/patient-bill');
      } else {
        showAlert('error', response?.error || 'Failed to update patient bill.', 'Error');
      }
    } catch (error: any) {
      console.error('Error updating patient bill:', error);
      showAlert('error', error?.message || 'Server error occurred.', 'Failed');
    } finally {
      isSubmitting.value = false;
    }
  };

  onMounted(async () => {
    try {
      billId.value = route.params.id.toString();
      const response = await patientBillServices.getPatientBillsID(Number(billId.value));
      const bill = response?.data || response?.Data;
      if (bill) {
        formData.value = {
          id: bill.id ?? bill.Id,
          billType: bill.billType ?? bill.BillType,
          reason: bill.reason ?? bill.Reason ?? '',
          entityId: bill.entityId ?? bill.EntityId ?? 0,
          totalAmount: bill.totalAmount ?? bill.TotalAmount ?? 0,
          paidAmount: bill.paidAmount ?? bill.PaidAmount ?? 0,
          patientId: bill.patient?.id ?? bill.Patient?.Id ?? 0,
        };
        const p = bill.patient || bill.Patient;
        patientName.value = p ? `${p.firstName || ''} ${p.lastName || ''}`.trim() : 'Unknown Patient';
      } else {
        showAlert('error', 'Bill details could not be found.', 'Not Found');
        router.push('/patient-bill');
      }
    } catch (error) {
      console.error('Error loading bill:', error);
      showAlert('error', 'Failed to load bill details.', 'Error');
      router.push('/patient-bill');
    }
  });
</script>

<template>
  <DefaultLayout>
    <BreadcrumbDefault :pageTitle="pageTitle" />

    <div class="flex justify-start">
      <div class="w-full sm:w-4/5 md:w-2/3 xl:w-1/2 bg-surface rounded-md shadow-sm">
        <div class="p-4 sm:p-6 md:p-8 space-y-6">
          <form @submit.prevent="updatePatientBill">
            <!-- Patient Name (Read Only) -->
            <div class="mb-5">
              <label class="mb-2 text-sm font-semibold text-emphasis">Patient Name</label>
              <div class="flex items-center h-[46px] px-4 rounded-lg bg-slate-100 dark:bg-meta-4 text-emphasis font-bold border border-stroke dark:border-strokedark">
                {{ patientName }}
              </div>
            </div>

            <!-- Bill Type Select -->
            <div class="mb-5">
              <BaseSelectNative label="Bill Type" v-model="formData.billType" :options="billTypeOptions" :fieldRequired="true" />
            </div>

            <!-- Reason -->
            <div class="mb-5">
              <BaseInput
                label="Bill Reason"
                type="text"
                placeholder="Enter bill reason"
                v-model="formData.reason"
                :error="errors.reason !== ''"
                :error-message="errors.reason"
                :field-required="true"
                @change="validateReason"
              />
            </div>

            <!-- Optional Entity ID -->
            <div class="mb-5">
              <BaseInput label="Entity ID (Optional Surgery/Admission/Lab ID)" type="number" placeholder="e.g. 12" v-model="formData.entityId" />
            </div>

            <!-- Total Amount -->
            <div class="mb-5">
              <BaseInput
                label="Total Amount"
                type="number"
                placeholder="Enter total amount"
                v-model="formData.totalAmount"
                :error="errors.totalAmount !== ''"
                :error-message="errors.totalAmount"
                :field-required="true"
                @change="validateTotalAmount"
              />
            </div>

            <!-- Paid Amount (Read Only) -->
            <div class="mb-5">
              <label class="mb-2 text-sm font-semibold text-emphasis">Paid Amount</label>
              <div class="flex items-center h-[46px] px-4 rounded-lg bg-slate-100 dark:bg-meta-4 text-emphasis font-bold border border-stroke dark:border-strokedark">
                {{ formData.paidAmount }}
              </div>
            </div>

            <!-- Remaining Balance (Read Only) -->
            <div class="mb-5">
              <label class="mb-2 text-sm font-semibold text-emphasis">Remaining Balance</label>
              <div class="flex items-center h-[46px] px-4 rounded-lg bg-slate-100 dark:bg-meta-4 text-emphasis font-bold border border-stroke dark:border-strokedark">
                {{ remainingBalance }}
              </div>
            </div>

            <FormActionButtons submit-label="Update Bill" :loading="isSubmitting" @submit="updatePatientBill" />
          </form>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
