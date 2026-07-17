<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import router from '@/router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import ListViewTemplate from '@/components/Templates/ListViewTemplate.vue';
  import SearchBar from '@/components/UI/SearchBar.vue';
  import DynamicTable from '@/components/UI/DynamicTable.vue';
  import DynamicPagination from '@/components/UI/DynamicPagination.vue';
  import PatientBillsServices from '@/services/PatientBill/Patientbill.services';
  import PatientPaymentService from '@/services/PatientPayment/Patientpayment.services';
  import EnumService from '@/services/Enum/Enum.service';
  import { usePermissions } from '@/composables/usePermissions';
  import useAlert from '@/plugins/alert/useAlert';
  import { useConfirm } from '@/composables/useConfirm';
  import PaymentModal from '@/components/Patient/PaymentModal.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';

  const { showAlert } = useAlert();
  const { confirm } = useConfirm();
  const { canDeleteFromModule } = usePermissions();
  const pageTitle = ref('Billing Management');
  const canDelete = computed(() => canDeleteFromModule('Patient Bills'));
  const PatientBillService = new PatientBillsServices();
  const PatientPaymentServiceInstance = new PatientPaymentService();
  const enumService = new EnumService();
  const loading = ref(false);

  const listFilters = ref({
    page: 0,
    size: 10,
    searchTerm: '',
    dateFilter: '',
  });

  const statsData = ref({
    totalCharged: 0,
    totalPaid: 0,
    totalDue: 0,
  });

  const fetchBillingSummary = async () => {
    try {
      const response = await PatientBillService.getBillingSummary(listFilters.value.searchTerm, listFilters.value.dateFilter);
      const data = response?.data || response?.Data || response;
      statsData.value = {
        totalCharged: data.totalCharged ?? 0,
        totalPaid: data.totalPaid ?? 0,
        totalDue: data.totalDue ?? 0,
      };
    } catch (error) {
      console.error('Error fetching billing summary:', error);
    }
  };

  const handleDateFilterChange = async () => {
    listFilters.value.page = 0;
    await fetchPatientBills();
    await fetchBillingSummary();
  };

  const apiResponse = ref({
    data: [],
    totalElements: 0,
    totalPages: 0,
    startIndex: 0,
    itemsPerPage: 0,
  });

  const billTypeMap = ref<Record<number, string>>({});

  // Payment Details Modal
  const showDetailsModal = ref(false);
  const selectedBillDetails = ref<any>(null);
  const paymentHistory = ref<any[]>([]);
  const loadingPayments = ref(false);

  // Pay Modal
  const showPayModal = ref(false);
  const billToPay = ref<any>(null);

  const fetchBillTypes = async () => {
    try {
      const response = await enumService.getBillTypes();
      const billTypeList = (response as any)?.billType || (response as any)?.data?.billType;
      if (billTypeList && Array.isArray(billTypeList)) {
        const map: Record<number, string> = {};
        billTypeList.forEach((item) => {
          const key = Object.keys(item)[0];
          const enumItem = item[key];
          if (enumItem?.id !== undefined && enumItem?.name) {
            map[enumItem.id] = enumItem.name;
          }
        });
        billTypeMap.value = map;
      }
    } catch (error) {
      console.error('Error fetching bill types:', error);
    }
  };

  const getSearchTerm = async (query: string) => {
    listFilters.value.searchTerm = query;
    listFilters.value.page = 0;
    await fetchPatientBills();
    await fetchBillingSummary();
  };

  const fetchPatientBills = async () => {
    loading.value = true;
    try {
      let filters = '';
      Object.entries(listFilters.value).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          filters = filters != '' ? `${filters}&${key}=${value}` : `${key}=${value}`;
        }
      });

      const response = await PatientBillService.getPatientBills(filters);
      const rawData = response.content || response.data?.content || [];

      apiResponse.value.data = rawData.map((item: any) => ({
        ...item,
        patientName: item.patient ? `${item.patient.firstName || ''} ${item.patient.lastName || ''}`.trim() : 'N/A',
        patientCnic: item.patient?.cnic || 'N/A',
        billTypeLabel: billTypeMap.value[item.billType] ?? `Type ${item.billType}`,
        status: item.isPaid ? 'Paid' : 'Pending',
      }));
      apiResponse.value.itemsPerPage = response.size || response.data?.size || 10;
      apiResponse.value.totalPages = response.totalPages || response.data?.totalPages || 0;
      apiResponse.value.startIndex = response.page || response.data?.page || 0;
      apiResponse.value.totalElements = response.totalElements || response.data?.totalElements || 0;
    } catch (error) {
      console.error('Error fetching patient bills:', error);
    } finally {
      loading.value = false;
    }
  };

  const handlePageChange = async (newPage: number) => {
    listFilters.value.page = newPage;
    await fetchPatientBills();
  };

  const handlePageSizeChange = async (newSize: number) => {
    listFilters.value.size = newSize;
    listFilters.value.page = 0;
    await fetchPatientBills();
  };

  const handleDelete = async (item: any) => {
    if (!canDelete.value) {
      showAlert('error', 'You do not have permission to delete patient bills.', 'Permission Denied');
      return;
    }

    const confirmed = await confirm({
      title: 'Delete Patient Bill',
      message: `Are you sure you want to delete this bill? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (confirmed) {
      try {
        const response = await PatientBillService.deletePatientBill(item.id);
        if (response?.isSuccess !== false) {
          showAlert('success', 'Patient bill has been deleted successfully.', 'Success');
          await fetchPatientBills();
          await fetchBillingSummary();
        } else {
          showAlert('error', response?.error || 'Failed to delete patient bill.', 'Error');
        }
      } catch {
        showAlert('error', 'An error occurred while deleting the patient bill.', 'Error');
      }
    }
  };

  const handleShowDetails = async (item: any) => {
    selectedBillDetails.value = item;
    showDetailsModal.value = true;
    await fetchPaymentsForSelectedBill();
  };

  const fetchPaymentsForSelectedBill = async () => {
    if (!selectedBillDetails.value) return;
    loadingPayments.value = true;
    try {
      const response = await PatientPaymentServiceInstance.getPaymentsByBillId(selectedBillDetails.value.id);
      paymentHistory.value = response?.data || response?.Data || [];
    } catch (error) {
      console.error('Error loading payments:', error);
      paymentHistory.value = [];
    } finally {
      loadingPayments.value = false;
    }
  };

  const handleOpenPayModal = () => {
    if (!selectedBillDetails.value) return;
    billToPay.value = {
      id: selectedBillDetails.value.id,
      remainingBalance: selectedBillDetails.value.remainingBalance,
      patient: selectedBillDetails.value.patient,
    };
    showPayModal.value = true;
  };

  const handlePaymentSuccess = async () => {
    // Refresh list
    await fetchPatientBills();
    await fetchBillingSummary();
    // Refresh selected bill details
    if (selectedBillDetails.value) {
      const updatedResponse = await PatientBillService.getPatientBillsID(selectedBillDetails.value.id);
      const bill = updatedResponse?.data || updatedResponse?.Data;
      if (bill) {
        selectedBillDetails.value = {
          ...bill,
          patientName: bill.patient ? `${bill.patient.firstName || ''} ${bill.patient.lastName || ''}`.trim() : 'N/A',
          patientCnic: bill.patient?.cnic || 'N/A',
          billTypeLabel: billTypeMap.value[bill.billType] ?? `Type ${bill.billType}`,
          status: bill.isPaid ? 'Paid' : 'Pending',
        };
      }
      await fetchPaymentsForSelectedBill();
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    if (amount == null) return '0 PKR';
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPaymentMethod = (method: number) => {
    return method === 0 ? 'Cash' : 'Card';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString();
  };

  // Filter columns for DynamicTable
  const tableColumns = ['patientName', 'patientCnic', 'billTypeLabel', 'reason', 'totalAmount', 'paidAmount', 'remainingBalance', 'status'];

  const statusColorMap = {
    Paid: 'bg-meta-3/15 text-meta-3 border-meta-3/30',
    Pending: 'bg-warning/15 text-warning border-warning/30',
  };

  onMounted(async () => {
    await fetchBillTypes();
    await fetchPatientBills();
    await fetchBillingSummary();
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate :title="pageTitle" breadcrumb-title="Billing" :loading="loading">
      <template #subtitle>Monitor patient invoices, payments, and outstanding balances.</template>

      <template #header-stats>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <!-- Total Charged Card -->
          <div class="bg-surface border border-stroke dark:border-strokedark rounded-2xl p-6 shadow-default flex items-center justify-between">
            <div class="space-y-1">
              <p class="text-sm font-medium text-bodydark dark:text-bodydark1">Total Charged</p>
              <h3 class="text-2xl font-black text-emphasis">{{ formatCurrency(statsData.totalCharged) }}</h3>
            </div>
            <div class="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/25 flex items-center justify-center text-primary">
              <svg class="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
          </div>

          <!-- Total Paid Card -->
          <div class="bg-surface border border-stroke dark:border-strokedark rounded-2xl p-6 shadow-default flex items-center justify-between">
            <div class="space-y-1">
              <p class="text-sm font-medium text-bodydark dark:text-bodydark1">Total Paid</p>
              <h3 class="text-2xl font-black text-meta-3">{{ formatCurrency(statsData.totalPaid) }}</h3>
            </div>
            <div class="w-12 h-12 rounded-xl bg-meta-3/10 dark:bg-meta-3/20 flex items-center justify-center text-meta-3">
              <svg class="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                ></path>
              </svg>
            </div>
          </div>

          <!-- Total Due Card -->
          <div class="bg-surface border border-stroke dark:border-strokedark rounded-2xl p-6 shadow-default flex items-center justify-between">
            <div class="space-y-1">
              <p class="text-sm font-medium text-bodydark dark:text-bodydark1">Total Due</p>
              <h3 class="text-2xl font-black text-danger">{{ formatCurrency(statsData.totalDue) }}</h3>
            </div>
            <div class="w-12 h-12 rounded-xl bg-danger/10 dark:bg-danger/25 flex items-center justify-center text-danger">
              <svg class="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </template>

      <template #search>
        <SearchBar placeholder="Search bills by patient or CNIC..." add-button-route="patient-bills/add" @searchTerm="getSearchTerm" />
      </template>

      <template #filters>
        <div class="relative z-20 bg-white dark:bg-boxdark rounded-lg">
          <select
            v-model="listFilters.dateFilter"
            @change="handleDateFilterChange"
            class="relative z-20 w-full min-w-[150px] appearance-none rounded border border-stroke bg-transparent py-2 px-4 pr-10 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input text-sm text-emphasis font-medium cursor-pointer"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="thisMonth">This Month</option>
            <option value="thisYear">This Year</option>
          </select>
          <span class="absolute right-4 top-1/2 z-30 -translate-y-1/2 pointer-events-none">
            <svg class="fill-current text-bodydark" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
              ></path>
            </svg>
          </span>
        </div>
      </template>

      <template #table>
        <DynamicTable
          :data="apiResponse.data"
          :columns="tableColumns"
          showEdit
          showDetails
          :showDelete="canDelete"
          :statusColorMap="statusColorMap"
          @edit="(item: any) => router.push(`/patient-bills/edit/${item.id}`)"
          @detail="handleShowDetails"
          @delete="handleDelete"
        />
      </template>

      <template #pagination>
        <DynamicPagination
          :currentPage="listFilters.page"
          :totalPages="apiResponse.totalPages"
          :totalElements="apiResponse.totalElements"
          :itemsPerPage="apiResponse.itemsPerPage"
          :startIndex="apiResponse.startIndex"
          @change-page="handlePageChange"
          @change-page-size="handlePageSizeChange"
        />
      </template>
    </ListViewTemplate>

    <!-- Bill Details & Invoice Modal -->
    <div
      v-if="showDetailsModal && selectedBillDetails"
      class="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 print:bg-white print:p-0 print:absolute"
      @click.self="showDetailsModal = false"
    >
      <div
        class="bg-surface rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stroke dark:border-strokedark print:shadow-none print:border-none print:max-h-full print:bg-white print:text-black"
      >
        <!-- Header (hidden in print) -->
        <div class="sticky top-0 bg-surface border-b border-stroke dark:border-strokedark p-6 flex items-center justify-between print:hidden">
          <h2 class="text-2xl font-bold text-emphasis">Invoice & Bill Details</h2>
          <button @click="showDetailsModal = false" class="text-bodydark dark:text-bodydark1 hover:text-emphasis text-3xl font-light">&times;</button>
        </div>

        <!-- Invoice Body -->
        <div id="printable-invoice" class="p-8 space-y-6 print:p-0">
          <!-- Hospital Header (visible only in print) -->
          <div class="hidden print:flex flex-col items-center border-b pb-6 mb-6">
            <h1 class="text-3xl font-bold tracking-wider">HEALTHCARE MANAGEMENT SYSTEM</h1>
            <p class="text-sm text-gray-500">Official Patient Invoice & Payment Receipt</p>
          </div>

          <!-- Invoice Title / Info -->
          <div class="flex justify-between items-start border-b border-stroke dark:border-strokedark pb-6">
            <div>
              <h3 class="text-xl font-bold text-emphasis">Invoice #BILL-{{ selectedBillDetails.id }}</h3>
              <p class="text-sm text-bodydark dark:text-bodydark1">Reason: {{ selectedBillDetails.reason }}</p>
              <p class="text-sm text-bodydark dark:text-bodydark1">Type: {{ selectedBillDetails.billTypeLabel }}</p>
            </div>
            <div class="text-right">
              <span
                :class="[
                  'inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border',
                  selectedBillDetails.isPaid ? 'bg-meta-3/15 text-meta-3 border-meta-3/30' : 'bg-warning/15 text-warning border-warning/30',
                ]"
              >
                {{ selectedBillDetails.status }}
              </span>
            </div>
          </div>

          <!-- Patient & Hospital Details -->
          <div class="grid grid-cols-2 gap-8 border-b border-stroke dark:border-strokedark pb-6">
            <div>
              <h4 class="text-xs font-bold text-bodydark dark:text-bodydark1 uppercase tracking-wider mb-2">Billed To:</h4>
              <p class="text-base font-bold text-emphasis">{{ selectedBillDetails.patientName }}</p>
              <p class="text-sm text-bodydark dark:text-bodydark1">CNIC: {{ selectedBillDetails.patientCnic }}</p>
              <p class="text-sm text-bodydark dark:text-bodydark1" v-if="selectedBillDetails.patient?.phone">Phone: {{ selectedBillDetails.patient.phone }}</p>
              <p class="text-sm text-bodydark dark:text-bodydark1" v-if="selectedBillDetails.patient?.address">Address: {{ selectedBillDetails.patient.address }}</p>
            </div>
            <div class="text-right">
              <h4 class="text-xs font-bold text-bodydark dark:text-bodydark1 uppercase tracking-wider mb-2">Billing Reference:</h4>
              <p class="text-sm text-emphasis" v-if="selectedBillDetails.entityId">Entity Reference ID: #{{ selectedBillDetails.entityId }}</p>
              <p class="text-sm text-bodydark dark:text-bodydark1">Invoice Date: {{ formatDate(selectedBillDetails.createdAt || selectedBillDetails.createdDate) }}</p>
            </div>
          </div>

          <!-- Financial Breakdown -->
          <div class="bg-slate-50 dark:bg-meta-4 rounded-xl p-6 space-y-4">
            <h4 class="text-sm font-bold text-emphasis uppercase tracking-wider">Financial Summary</h4>
            <div class="grid grid-cols-3 gap-6 text-center">
              <div class="border-r border-stroke dark:border-strokedark last:border-none">
                <p class="text-xs text-bodydark dark:text-bodydark1">Total Amount</p>
                <p class="text-xl font-bold text-emphasis">{{ formatCurrency(selectedBillDetails.totalAmount) }}</p>
              </div>
              <div class="border-r border-stroke dark:border-strokedark last:border-none">
                <p class="text-xs text-bodydark dark:text-bodydark1">Paid Amount</p>
                <p class="text-xl font-bold text-meta-3">{{ formatCurrency(selectedBillDetails.paidAmount) }}</p>
              </div>
              <div>
                <p class="text-xs text-bodydark dark:text-bodydark1">Remaining Balance</p>
                <p class="text-xl font-bold text-danger">{{ formatCurrency(selectedBillDetails.remainingBalance) }}</p>
              </div>
            </div>
          </div>

          <!-- Payment History -->
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

        <!-- Footer / Action Buttons (hidden in print) -->
        <div class="sticky bottom-0 bg-surface border-t border-stroke dark:border-strokedark p-6 flex justify-between items-center print:hidden">
          <div class="flex gap-2">
            <BaseButton variant="outline" @click="printInvoice">Print Invoice</BaseButton>
            <BaseButton v-if="selectedBillDetails.remainingBalance > 0" variant="primary" @click="handleOpenPayModal">Record Payment</BaseButton>
          </div>
          <BaseButton variant="outline" @click="showDetailsModal = false">Close</BaseButton>
        </div>
      </div>
    </div>

    <!-- Payments Modal Wrapper -->
    <PaymentModal :show="showPayModal" :bill="billToPay" @close="showPayModal = false" @success="handlePaymentSuccess" />
  </DefaultLayout>
</template>

<style>
  /* CSS Print Styling */
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
