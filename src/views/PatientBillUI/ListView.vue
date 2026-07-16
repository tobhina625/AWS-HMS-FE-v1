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
  });

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
    'Paid': 'bg-meta-3/15 text-meta-3 border-meta-3/30',
    'Pending': 'bg-warning/15 text-warning border-warning/30',
  };

  onMounted(async () => {
    await fetchBillTypes();
    await fetchPatientBills();
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate :title="pageTitle" breadcrumb-title="Billing" :loading="loading">
      <template #subtitle>Monitor patient invoices, payments, and outstanding balances.</template>

      <template #search>
        <SearchBar placeholder="Search bills by patient or CNIC..." add-button-route="patient-bills/add" @searchTerm="getSearchTerm" />
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
    <div v-if="showDetailsModal && selectedBillDetails" class="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 print:bg-white print:p-0 print:absolute" @click.self="showDetailsModal = false">
      <div class="bg-surface rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stroke dark:border-strokedark print:shadow-none print:border-none print:max-h-full print:bg-white print:text-black">
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
              <span :class="['inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border', selectedBillDetails.isPaid ? 'bg-meta-3/15 text-meta-3 border-meta-3/30' : 'bg-warning/15 text-warning border-warning/30']">
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
            
            <div v-if="loadingPayments" class="text-center py-6 text-bodydark">
              Loading transactions...
            </div>
            
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
    <PaymentModal
      :show="showPayModal"
      :bill="billToPay"
      @close="showPayModal = false"
      @success="handlePaymentSuccess"
    />
  </DefaultLayout>
</template>

<style>
/* CSS Print Styling */
@media print {
  body * {
    visibility: hidden;
  }
  #printable-invoice, #printable-invoice * {
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
