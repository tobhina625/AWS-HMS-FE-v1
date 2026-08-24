<script setup lang="ts">
  import ChevronRightIcon from '@/assets/images/SVGs/ChevronRightIcon.svg';

  import { ref, computed, watch } from 'vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import DynamicPagination from '@/components/UI/DynamicPagination.vue';
  import EmptyState from '@/components/UI/EmptyState.vue';
  import PaymentModal from '@/components/Patient/PaymentModal.vue';
  import PatientBillsService from '@/services/PatientBill/Patientbill.services';
  import PatientPaymentService from '@/services/PatientPayment/Patientpayment.services';
  import AdmissionServices from '@/services/Admission/Admission.services';
  import { useAdmissionInvoicePdf } from '@/composables/useAdmissionInvoicePdf';

  const props = defineProps<{
    patientId: number;
  }>();

  const emit = defineEmits<{
    (e: 'addNew'): void;
  }>();

  const billService = new PatientBillsService();
  const paymentService = new PatientPaymentService();
  const admissionService = new AdmissionServices();
  const { downloadAdmissionInvoicePdf } = useAdmissionInvoicePdf();
  const downloadingPdf = ref(false);
  const loading = ref(true);
  const bills = ref<any[]>([]);
  const selectedBill = ref<any>(null);
  const showDetails = ref(false);

  // Payment history inside the invoice modal
  const paymentHistory = ref<any[]>([]);
  const loadingPayments = ref(false);

  // Pay modal
  const showPayModal = ref(false);
  const billToPay = ref<any>(null);

  const pagination = ref({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  const billTypeLabels: Record<number, string> = {
    0: 'Surgery',
    1: 'Lab Test',
    2: 'Treatment',
    3: 'Admission',
    4: 'Other',
  };

  const loadBills = async (page: number = 0) => {
    if (!props.patientId || props.patientId === 0) {
      loading.value = false;
      return;
    }

    loading.value = true;
    try {
      const response = await billService.getPatientBillsByPatientId(props.patientId, page, pagination.value.size);
      const content = response?.content || response?.Content || [];
      const arr = Array.isArray(content) ? content : [];

      bills.value = arr;
      pagination.value = {
        page: response?.page ?? response?.Page ?? 0,
        size: response?.size ?? response?.Size ?? 10,
        totalPages: response?.totalPages ?? response?.TotalPages ?? 0,
        totalElements: response?.totalElements ?? response?.TotalElements ?? 0,
      };
    } catch (error) {
      console.error('Error loading patient bills:', error);
      bills.value = [];
    } finally {
      loading.value = false;
    }
  };

  const viewDetails = async (bill: any) => {
    selectedBill.value = bill;
    showDetails.value = true;
    await fetchPaymentsForBill(bill.id);
  };

  const fetchPaymentsForBill = async (billId: number) => {
    loadingPayments.value = true;
    paymentHistory.value = [];
    try {
      const response = await paymentService.getPaymentsByBillId(billId);
      paymentHistory.value = response?.data || response?.Data || [];
    } catch (error) {
      console.error('Error loading payments:', error);
      paymentHistory.value = [];
    } finally {
      loadingPayments.value = false;
    }
  };

  const closeDetails = () => {
    showDetails.value = false;
    selectedBill.value = null;
    paymentHistory.value = [];
  };

  const handleOpenPayModal = () => {
    if (!selectedBill.value) return;
    billToPay.value = {
      id: selectedBill.value.id,
      remainingBalance: selectedBill.value.remainingBalance ?? selectedBill.value.RemainingBalance,
      patient: selectedBill.value.patient ?? selectedBill.value.Patient,
    };
    showPayModal.value = true;
  };

  const handlePaymentSuccess = async () => {
    await loadBills(pagination.value.page);
    if (selectedBill.value) {
      // Refresh the selected bill
      const updatedResponse = await billService.getPatientBillsID(selectedBill.value.id);
      const updatedBill = updatedResponse?.data || updatedResponse?.Data;
      if (updatedBill) {
        selectedBill.value = updatedBill;
      }
      await fetchPaymentsForBill(selectedBill.value.id);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const handleDownloadAdmissionInvoice = async () => {
    if (!selectedBill.value) return;
    downloadingPdf.value = true;
    try {
      const admissionId = selectedBill.value.entityId ?? selectedBill.value.EntityId;
      let admData: any = null;
      let admBills: any[] = [];
      if (admissionId) {
        try {
          const aResp = await admissionService.getAdmissionById(admissionId);
          admData = aResp?.data ?? aResp?.Data ?? aResp;
          const bResp = await billService.getPatientBillsByAdmissionId(admissionId, 0, 100);
          const bContent = bResp?.content ?? bResp?.Content ?? bResp?.data ?? [];
          admBills = Array.isArray(bContent) ? bContent : [];
        } catch (error) {
          console.warn('Could not fetch admission details or bills for invoice:', error);
        }
      }

      if (!admData) {
        admData = {
          id: admissionId || selectedBill.value.id,
          patient: selectedBill.value.patient ?? selectedBill.value.Patient,
          totalChargesPayable: selectedBill.value.totalAmount ?? selectedBill.value.TotalAmount,
          admissionDate: selectedBill.value.createdAt,
        };
        admBills = [selectedBill.value];
      }

      await downloadAdmissionInvoicePdf(admData, admBills.length > 0 ? admBills : [selectedBill.value]);
    } catch (e) {
      console.error('Failed to download invoice PDF:', e);
    } finally {
      downloadingPdf.value = false;
    }
  };

  const handlePageChange = (newPage: number) => {
    loadBills(newPage);
  };

  const formatCurrency = (amount: number) => {
    if (amount == null) return 'N/A';
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString();
  };

  const paymentMethodLabels: Record<number, string> = {
    0: 'Cash',
    1: 'Card',
    2: 'Insurance',
  };

  const formatPaymentMethod = (method: number) => {
    return paymentMethodLabels[method] ?? `Method ${method}`;
  };

  /** Returns true if ALL recorded payments for the current bill were via Insurance */
  const isPaidByInsurance = computed(() => {
    if (!paymentHistory.value.length) return false;
    return paymentHistory.value.every((p: any) => (p.paymentMethod ?? p.PaymentMethod) === 2);
  });

  const getBillTypeLabel = (billType: number) => {
    return billTypeLabels[billType] ?? `Type ${billType}`;
  };

  const isEmpty = computed(() => !loading.value && bills.value.length === 0);

  watch(
    () => props.patientId,
    (newId) => {
      if (newId && newId > 0) {
        loadBills();
      }
    },
    { immediate: true }
  );
</script>

<template>
  <div class="space-y-6">
    <div v-if="!loading && !isEmpty" class="flex justify-between items-center">
      <router-link :to="`/patient-bill`" class="text-sm font-medium text-primary hover:text-primary/80">View all bills →</router-link>
      <BaseButton variant="primary" size="sm" @click="emit('addNew')">Add New</BaseButton>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="animate-pulse bg-surface rounded-xl p-6 border border-stroke dark:border-strokedark">
        <div class="flex items-center justify-between mb-4">
          <div class="h-4 bg-stroke dark:bg-strokedark rounded w-1/4"></div>
          <div class="h-8 bg-stroke dark:bg-strokedark rounded w-20"></div>
        </div>
        <div class="space-y-2">
          <div class="h-3 bg-stroke dark:bg-strokedark rounded w-3/4"></div>
          <div class="h-3 bg-stroke dark:bg-strokedark rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <EmptyState v-else-if="isEmpty" title="No Patient Bills" description="This patient doesn't have any bills yet." icon="data">
      <template #action>
        <BaseButton variant="primary" @click="emit('addNew')">Add New Bill</BaseButton>
      </template>
    </EmptyState>

    <!-- Bills List -->
    <div v-else class="space-y-4">
      <div
        v-for="bill in bills"
        :key="bill.id"
        class="bg-elevated rounded-xl border border-stroke dark:border-strokedark hover:shadow-lg transition-shadow cursor-pointer min-h-[100px]"
        @click="viewDetails(bill)"
      >
        <div class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-lg font-semibold text-emphasis">{{ getBillTypeLabel(bill.billType ?? bill.BillType) }}</h3>
                <template v-if="bill.isPaid ?? bill.IsPaid">
                  <!-- Show Insurance-Paid badge when the selected bill's payments are all insurance -->
                  <span v-if="selectedBill?.id === bill.id && isPaidByInsurance" class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    Insurance-Paid
                  </span>
                  <span v-else class="px-2 py-1 text-xs font-semibold rounded-full bg-meta-3/10 text-meta-3 border border-meta-3/20">Paid</span>
                </template>
                <span v-else class="px-2 py-1 text-xs font-semibold rounded-full bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning-light">Pending</span>
              </div>
              <p v-if="bill.reason ?? bill.Reason" class="text-sm text-bodydark dark:text-bodydark1">
                <span v-for="(line, i) in String(bill.reason ?? bill.Reason).split('|')" :key="i" class="block">
                  {{ line.trim() }}
                </span>
              </p>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-lg font-bold text-emphasis">{{ formatCurrency(bill.totalAmount ?? bill.TotalAmount) }}</span>
              <BaseButton variant="ghost" size="sm">
                <ChevronRightIcon class="w-5 h-5" />
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <DynamicPagination
        v-if="pagination.totalPages > 1"
        :currentPage="pagination.page"
        :totalPages="pagination.totalPages"
        :totalElements="pagination.totalElements"
        :itemsPerPage="pagination.size"
        :startIndex="pagination.page"
        :page-size-options="[]"
        @change-page="handlePageChange"
      />
    </div>

    <!-- Full Invoice / Details Modal -->
    <div v-if="showDetails && selectedBill" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 print:bg-white print:p-0 print:absolute" @click.self="closeDetails">
      <div
        class="bg-surface rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stroke dark:border-strokedark print:shadow-none print:border-none print:max-h-full print:bg-white print:text-black"
      >
        <!-- Modal Header (hidden in print) -->
        <div class="sticky top-0 bg-surface border-b border-stroke dark:border-strokedark p-6 flex items-center justify-between print:hidden">
          <h2 class="text-2xl font-bold text-emphasis">Invoice &amp; Bill Details</h2>
          <button @click="closeDetails" class="text-bodydark dark:text-bodydark1 hover:text-emphasis text-3xl font-light">&times;</button>
        </div>

        <!-- Invoice Body -->
        <div id="printable-invoice" class="p-8 space-y-6 print:p-0">
          <!-- Hospital Header (visible only in print) -->
          <div class="hidden print:flex flex-col items-center border-b pb-6 mb-6">
            <h1 class="text-3xl font-bold tracking-wider">HOSPITAL MANAGEMENT SYSTEM</h1>
            <p class="text-sm text-gray-500">Official Patient Invoice &amp; Payment Receipt</p>
          </div>

          <!-- Invoice Title / Info -->
          <div class="flex justify-between items-start border-b border-stroke dark:border-strokedark pb-6">
            <div>
              <h3 class="text-xl font-bold text-emphasis">Invoice #BILL-{{ selectedBill.id }}</h3>
              <p class="text-sm text-bodydark dark:text-bodydark1">Reason: {{ selectedBill.reason ?? selectedBill.Reason ?? '—' }}</p>
              <p class="text-sm text-bodydark dark:text-bodydark1">Type: {{ getBillTypeLabel(selectedBill.billType ?? selectedBill.BillType) }}</p>
            </div>
            <div class="text-right">
              <!-- Insurance-Paid badge -->
              <span
                v-if="(selectedBill.isPaid ?? selectedBill.IsPaid) && isPaidByInsurance"
                class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border bg-blue-500/15 text-blue-400 border-blue-500/30"
              >
                Insurance-Paid
              </span>
              <!-- Regular Paid / Pending badge -->
              <span
                v-else
                :class="[
                  'inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border',
                  (selectedBill.isPaid ?? selectedBill.IsPaid) ? 'bg-meta-3/15 text-meta-3 border-meta-3/30' : 'bg-warning/15 text-warning border-warning/30',
                ]"
              >
                {{ (selectedBill.isPaid ?? selectedBill.IsPaid) ? 'Paid' : 'Pending' }}
              </span>
            </div>
          </div>

          <!-- Patient & Billing Reference -->
          <div class="grid grid-cols-2 gap-8 border-b border-stroke dark:border-strokedark pb-6">
            <div>
              <h4 class="text-xs font-bold text-bodydark dark:text-bodydark1 uppercase tracking-wider mb-2">Billed To:</h4>
              <p class="text-base font-bold text-emphasis">
                {{
                  (selectedBill.patient ?? selectedBill.Patient)
                    ? `${(selectedBill.patient ?? selectedBill.Patient).firstName || ''} ${(selectedBill.patient ?? selectedBill.Patient).lastName || ''}`.trim()
                    : 'N/A'
                }}
              </p>
              <p class="text-sm text-bodydark dark:text-bodydark1">CNIC: {{ (selectedBill.patient ?? selectedBill.Patient)?.cnic || 'N/A' }}</p>
              <p class="text-sm text-bodydark dark:text-bodydark1" v-if="(selectedBill.patient ?? selectedBill.Patient)?.phone">Phone: {{ (selectedBill.patient ?? selectedBill.Patient).phone }}</p>
              <p class="text-sm text-bodydark dark:text-bodydark1" v-if="(selectedBill.patient ?? selectedBill.Patient)?.address">
                Address: {{ (selectedBill.patient ?? selectedBill.Patient).address }}
              </p>
            </div>
            <div class="text-right">
              <h4 class="text-xs font-bold text-bodydark dark:text-bodydark1 uppercase tracking-wider mb-2">Billing Reference:</h4>
              <p class="text-sm text-emphasis" v-if="selectedBill.entityId ?? selectedBill.EntityId">Entity Ref ID: #{{ selectedBill.entityId ?? selectedBill.EntityId }}</p>
              <p class="text-sm text-bodydark dark:text-bodydark1">Invoice Date: {{ formatDate(selectedBill.createdAt || selectedBill.CreatedAt) }}</p>
            </div>
          </div>

          <!-- Financial Breakdown -->
          <div class="bg-slate-50 dark:bg-meta-4 rounded-xl p-6 space-y-4">
            <h4 class="text-sm font-bold text-emphasis uppercase tracking-wider">Financial Summary</h4>
            <div class="grid grid-cols-3 gap-6 text-center">
              <div class="border-r border-stroke dark:border-strokedark last:border-none">
                <p class="text-xs text-bodydark dark:text-bodydark1">Total Amount</p>
                <p class="text-xl font-bold text-emphasis">{{ formatCurrency(selectedBill.totalAmount ?? selectedBill.TotalAmount) }}</p>
              </div>
              <div class="border-r border-stroke dark:border-strokedark last:border-none">
                <p class="text-xs text-bodydark dark:text-bodydark1">Paid Amount</p>
                <p class="text-xl font-bold text-meta-3">{{ formatCurrency(selectedBill.paidAmount ?? selectedBill.PaidAmount) }}</p>
              </div>
              <div>
                <p class="text-xs text-bodydark dark:text-bodydark1">Remaining Balance</p>
                <p class="text-xl font-bold text-danger">{{ formatCurrency(selectedBill.remainingBalance ?? selectedBill.RemainingBalance) }}</p>
              </div>
            </div>
          </div>

          <!-- Payment Transaction History -->
          <div class="space-y-4">
            <h4 class="text-sm font-bold text-emphasis uppercase tracking-wider">Payment Transaction History</h4>

            <div v-if="loadingPayments" class="text-center py-6 text-bodydark">Loading transactions...</div>

            <div v-else-if="paymentHistory.length === 0" class="text-sm text-bodydark dark:text-bodydark1 bg-slate-50 dark:bg-meta-4 p-4 rounded-xl text-center">
              No payments have been recorded for this bill yet.
            </div>

            <div v-else class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="border-b border-stroke dark:border-strokedark pb-2 text-bodydark">
                    <th class="py-2">Transaction ID</th>
                    <th class="py-2">Payment Date</th>
                    <th class="py-2">Method</th>
                    <th class="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="payment in paymentHistory" :key="payment.id" class="border-b border-stroke/50 dark:border-strokedark/50 text-emphasis">
                    <td class="py-2.5 font-mono">#PAY-{{ payment.id }}</td>
                    <td class="py-2.5">{{ formatDate(payment.paymentDate) }}</td>
                    <td class="py-2.5">{{ formatPaymentMethod(payment.paymentMethod) }}</td>
                    <td class="py-2.5 text-right font-bold text-meta-3">{{ formatCurrency(payment.amount) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <!-- end #printable-invoice -->

        <!-- Footer Action Buttons (hidden in print) -->
        <div class="sticky bottom-0 bg-surface border-t border-stroke dark:border-strokedark p-6 flex justify-between items-center print:hidden">
          <div class="flex gap-2">
            <BaseButton variant="outline" @click="printInvoice">🖨️ Print Invoice</BaseButton>
            <BaseButton v-if="(selectedBill.billType ?? selectedBill.BillType) === 3" variant="outline" :disabled="downloadingPdf" @click="handleDownloadAdmissionInvoice">📄 Download PDF</BaseButton>
            <BaseButton v-if="(selectedBill.remainingBalance ?? selectedBill.RemainingBalance) > 0" variant="primary" @click="handleOpenPayModal">Record Payment</BaseButton>
          </div>
          <BaseButton variant="outline" @click="closeDetails">Close</BaseButton>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <PaymentModal :show="showPayModal" :bill="billToPay" @close="showPayModal = false" @success="handlePaymentSuccess" />
  </div>
</template>

<style scoped>
  @media print {
    body * {
      visibility: hidden;
    }
    #printable-invoice,
    #printable-invoice * {
      visibility: visible;
    }
    #printable-invoice {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
  }
</style>
