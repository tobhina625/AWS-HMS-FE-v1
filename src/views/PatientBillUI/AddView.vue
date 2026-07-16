<script setup lang="ts">
  import router from '@/router';
  import useAlert from '@/plugins/alert/useAlert';
  import { ref, computed, onMounted } from 'vue';
  import PatientBillsService from '@/services/PatientBill/Patientbill.services';
  import PatientServices from '@/services/Patient/patient.services';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BaseSelectNative from '@/components/Base/BaseSelectNative.vue';
  import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue';
  import { useApiSearchDropdown } from '@/composables/useApiSearchDropdown';

  const patientBillServices = new PatientBillsService();
  const patientServices = new PatientServices();
  const { showAlert } = useAlert();

  const pageTitle = ref('Add Patient Bill');
  const isSubmitting = ref(false);
  const patientId = ref<string | number>('');

  const formData = ref({
    billType: '1', // Default to Lab Test
    reason: '',
    entityId: '',
    totalAmount: 0,
    paidAmount: 0,
  });

  const errors = ref({
    patientId: '',
    reason: '',
    totalAmount: '',
    paidAmount: '',
    entityId: '',
  });

  const billTypeOptions = [
    { label: 'Surgery', value: '0' },
    { label: 'Lab Test', value: '1' },
    { label: 'Treatment', value: '2' },
    { label: 'Admission', value: '3' },
  ];

  // API Dropdown for patient selection
  const mapPatientOptions = (raw: any[]) =>
    raw.map((p: any) => ({
      id: p.id,
      name: `${p.firstName || ''} ${p.lastName || ''} (${p.cnic || 'No CNIC'})`.trim(),
    }));

  const patientDd = useApiSearchDropdown({
    pageSize: 10,
    fetchDefaultPage: async (page = 0, size = 10) => {
      const response = await patientServices.getPatients(`page=${page}&size=${size}`);
      return mapPatientOptions(response?.content || response?.data?.content || response?.data || []);
    },
    fetchSearchPage: async (term, page = 0, size = 10) => {
      const response = await patientServices.getPatients(`page=${page}&size=${size}&searchTerm=${encodeURIComponent(term)}`);
      return mapPatientOptions(response?.content || response?.data?.content || response?.data || []);
    },
    getSelectedId: () => patientId.value,
  });

  const validatePatient = () => {
    errors.value.patientId = '';
    if (!patientId.value) {
      errors.value.patientId = 'Patient selection is required.';
    }
  };

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

  const validatePaidAmount = () => {
    errors.value.paidAmount = '';
    if (formData.value.paidAmount < 0) {
      errors.value.paidAmount = 'Paid amount cannot be negative.';
    }
    if (formData.value.paidAmount > formData.value.totalAmount) {
      errors.value.paidAmount = 'Paid amount cannot exceed total amount.';
    }
  };

  const validateForm = () => {
    validatePatient();
    validateReason();
    validateTotalAmount();
    validatePaidAmount();
  };

  const remainingBalance = computed(() => {
    const val = formData.value.totalAmount - formData.value.paidAmount;
    return val > 0 ? val : 0;
  });

  const isPaid = computed(() => {
    return remainingBalance.value === 0 && formData.value.totalAmount > 0;
  });

  const addPatientBill = async () => {
    validateForm();

    const hasErrors =
      errors.value.patientId ||
      errors.value.reason ||
      errors.value.totalAmount ||
      errors.value.paidAmount;

    if (hasErrors) {
      showAlert('error', 'Please correct the validation errors.', 'Validation Error');
      return;
    }

    isSubmitting.value = true;
    try {
      const billPayload = {
        billType: Number(formData.value.billType),
        reason: formData.value.reason.trim(),
        entityId: Number(formData.value.entityId) || 0,
        totalAmount: Number(formData.value.totalAmount),
        isPaid: isPaid.value,
        paidAmount: Number(formData.value.paidAmount),
        remainingBalance: remainingBalance.value,
        patient: {
          id: Number(patientId.value),
        },
      };

      const response = await patientBillServices.addPatientBills(billPayload);
      if (response?.isSuccess !== false) {
        showAlert('success', 'Patient bill added successfully.', 'Success');
        router.push('/patient-bill');
      } else {
        showAlert('error', response?.error || 'Failed to add patient bill.', 'Error');
      }
    } catch (error: any) {
      console.error('Error adding patient bill:', error);
      showAlert('error', error?.message || 'Server error occurred.', 'Failed');
    } finally {
      isSubmitting.value = false;
    }
  };
  onMounted(async () => {
    await patientDd.loadDefault();
  });
</script>

<template>
  <DefaultLayout>
    <BreadcrumbDefault :pageTitle="pageTitle" />

    <div class="flex flex-col gap-10">
      <div class="bg-surface rounded-2xl border border-stroke dark:border-strokedark shadow-sm">
        <div class="p-5 space-y-6 sm:p-6">
          <form @submit.prevent="addPatientBill">
            <div class="-mx-2.5 flex flex-wrap gap-y-5">
              <!-- Patient Search Dropdown -->
              <div class="w-full mb-4 px-2.5 xl:w-1/2">
                <BaseSelect
                  label="Patient"
                  v-model="patientId"
                  :options="patientDd.items.value"
                  :loading="patientDd.loading.value"
                  :has-more="patientDd.hasMore.value"
                  @load-more="patientDd.loadMore"
                  @search="patientDd.onSearch"
                  placeholder="Search patient by name or CNIC..."
                  :error="errors.patientId !== ''"
                  :error-message="errors.patientId"
                  :field-required="true"
                />
              </div>

              <!-- Bill Type Dropdown -->
              <div class="w-full mb-4 px-2.5 xl:w-1/2">
                <BaseSelectNative
                  label="Bill Type"
                  v-model="formData.billType"
                  :options="billTypeOptions"
                  :fieldRequired="true"
                />
              </div>

              <!-- Reason -->
              <div class="w-full mb-4 px-2.5 xl:w-1/2">
                <BaseInput
                  label="Bill Reason"
                  type="text"
                  placeholder="e.g. Consultation, Blood tests"
                  v-model="formData.reason"
                  @change="validateReason"
                  :error="errors.reason !== ''"
                  :error-message="errors.reason"
                  :field-required="true"
                />
              </div>

              <!-- Optional Entity ID -->
              <div class="w-full mb-4 px-2.5 xl:w-1/2">
                <BaseInput
                  label="Entity ID (Optional Surgery/Admission/Lab ID)"
                  type="number"
                  placeholder="e.g. 12"
                  v-model="formData.entityId"
                />
              </div>

              <!-- Total Amount -->
              <div class="w-full mb-4 px-2.5 xl:w-1/3">
                <BaseInput
                  label="Total Amount"
                  type="number"
                  placeholder="Enter total bill amount"
                  v-model="formData.totalAmount"
                  @change="validateTotalAmount"
                  :error="errors.totalAmount !== ''"
                  :error-message="errors.totalAmount"
                  :field-required="true"
                />
              </div>

              <!-- Paid Amount -->
              <div class="w-full mb-4 px-2.5 xl:w-1/3">
                <BaseInput
                  label="Paid Amount"
                  type="number"
                  placeholder="Enter initial paid amount"
                  v-model="formData.paidAmount"
                  @change="validatePaidAmount"
                  :error="errors.paidAmount !== ''"
                  :error-message="errors.paidAmount"
                  :field-required="true"
                />
              </div>

              <!-- Remaining Balance (Read Only) -->
              <div class="w-full mb-4 px-2.5 xl:w-1/3">
                <div class="flex flex-col">
                  <label class="mb-2 text-sm font-semibold text-emphasis">Remaining Balance</label>
                  <div class="flex items-center h-[46px] px-4 rounded-lg bg-slate-100 dark:bg-meta-4 text-emphasis font-bold border border-stroke dark:border-strokedark">
                    {{ remainingBalance }}
                  </div>
                </div>
              </div>

              <!-- Submit / Cancel -->
              <div class="w-full mb-2 mt-5 px-2.5 flex sm:flex-row items-center justify-end gap-4">
                <BaseButton variant="outline" @click="router.back()" class="w-full sm:w-auto min-w-[120px]" type="button">Cancel</BaseButton>
                <BaseButton type="submit" variant="primary" :loading="isSubmitting" class="w-full sm:w-auto min-w-[120px] px-7">Save Bill</BaseButton>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
