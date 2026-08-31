<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import router from '@/router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import ListViewTemplate from '@/components/Templates/ListViewTemplate.vue';
  import SearchWithViewToggle from '@/components/UI/SearchWithViewToggle.vue';
  import DynamicTable from '@/components/UI/DynamicTable.vue';
  import DynamicPagination from '@/components/UI/DynamicPagination.vue';
  import EmptyState from '@/components/UI/EmptyState.vue';
  import GridViewCard from '@/components/UI/GridViewCard.vue';
  import InvoiceService from '@/services/Invoice/Invoice.services';
  import useAlert from '@/plugins/alert/useAlert';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import { InvoiceStatusMap, InvoiceStatusColorMap, InvoiceLineTypeMap, PaymentMethodMap } from '@/services/Invoice/Invoice.dto';

  const { showAlert } = useAlert();
  const pageTitle = ref('Invoice Management');
  const invoiceService = new InvoiceService();
  const loading = ref(false);
  const viewMode = ref<'grid' | 'table'>('table');

  const listFilters = ref<{
    page: number;
    size: number;
    searchTerm: string;
    dateFilter: string;
    statusFilter: number | '';
  }>({
    page: 0,
    size: 10,
    searchTerm: '',
    dateFilter: '',
    statusFilter: '',
  });

  const statsData = ref({
    totalCharged: 0,
    totalPaid: 0,
    totalDue: 0,
  });

  const fetchSummary = async () => {
    try {
      const response = await invoiceService.getInvoiceSummary();
      const data = response?.data || response?.Data || response;
      statsData.value = {
        totalCharged: data.totalCharged ?? 0,
        totalPaid: data.totalPaid ?? 0,
        totalDue: data.totalDue ?? 0,
      };
    } catch (error) {
      console.error('Error fetching invoice summary:', error);
    }
  };

  const apiResponse = ref({
    data: [] as any[],
    totalElements: 0,
    totalPages: 0,
    startIndex: 0,
    itemsPerPage: 0,
  });

  const showDetailModal = ref(false);
  const selectedInvoice = ref<any>(null);

  const showPaymentModal = ref(false);
  const paymentAmount = ref(0);
  const paymentMethod = ref(0);
  const paymentReference = ref('');
  const paymentNotes = ref('');
  const processingPayment = ref(false);

  const showVoidModal = ref(false);
  const voidReason = ref('');
  const processingVoid = ref(false);

  const getSearchTerm = async (query: string) => {
    listFilters.value.searchTerm = query;
    listFilters.value.page = 0;
    await fetchInvoices();
    await fetchSummary();
  };

  const handleDateFilterChange = async () => {
    listFilters.value.page = 0;
    await fetchInvoices();
    await fetchSummary();
  };

  const fetchInvoices = async () => {
    loading.value = true;
    try {
      let filters = '';
      Object.entries(listFilters.value).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          filters = filters !== '' ? `${filters}&${key}=${value}` : `${key}=${value}`;
        }
      });

      const response = await invoiceService.getInvoices(filters);
      const rawData = response.content || response.data?.content || [];

      apiResponse.value.data = rawData.map((item: any) => ({
        ...item,
        patientName: item.patient ? `${item.patient.firstName || ''} ${item.patient.lastName || ''}`.trim() : 'N/A',
        patientCnic: item.patient?.cnic || 'N/A',
        statusLabel: InvoiceStatusMap[item.status] ?? `Status ${item.status}`,
        statusClass: InvoiceStatusColorMap[item.status] ?? 'bg-gray-500/15 text-gray-400',
      }));
      apiResponse.value.itemsPerPage = response.size || response.data?.size || 10;
      apiResponse.value.totalPages = response.totalPages || response.data?.totalPages || 0;
      apiResponse.value.startIndex = response.page || response.data?.page || 0;
      apiResponse.value.totalElements = response.totalElements || response.data?.totalElements || 0;
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      loading.value = false;
    }
  };

  const handlePageChange = async (newPage: number) => {
    listFilters.value.page = newPage;
    await fetchInvoices();
  };

  const handlePageSizeChange = async (newSize: number) => {
    listFilters.value.size = newSize;
    listFilters.value.page = 0;
    await fetchInvoices();
  };

  const handleShowDetail = async (item: any) => {
    try {
      const response = await invoiceService.getInvoiceById(item.id);
      selectedInvoice.value = response?.data || response?.Data || response;
      showDetailModal.value = true;
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      showAlert('error', 'Failed to load invoice details.', 'Error');
    }
    // catch (error) {
    //   showAlert('error', 'Failed to load invoice details.', 'Error');
    // }
  };

  const handleVoid = async () => {
    if (!selectedInvoice.value || !voidReason.value.trim()) {
      showAlert('error', 'Please provide a cancellation reason.', 'Validation Error');
      return;
    }
    processingVoid.value = true;
    try {
      const response = await invoiceService.voidInvoice(selectedInvoice.value.id, voidReason.value);
      if (response?.isSuccess !== false) {
        showAlert('success', 'Invoice has been voided successfully.', 'Success');
        showVoidModal.value = false;
        voidReason.value = '';
        showDetailModal.value = false;
        await fetchInvoices();
        await fetchSummary();
      } else {
        showAlert('error', response?.error || 'Failed to void invoice.', 'Error');
      }
    } catch {
      showAlert('error', 'An error occurred while voiding the invoice.', 'Error');
    } finally {
      processingVoid.value = false;
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedInvoice.value || paymentAmount.value <= 0) {
      showAlert('error', 'Please enter a valid payment amount.', 'Validation Error');
      return;
    }
    if (paymentAmount.value > selectedInvoice.value.balanceDue) {
      showAlert('error', `Payment amount cannot exceed the balance due of ${formatCurrency(selectedInvoice.value.balanceDue)}.`, 'Overpayment Error');
      return;
    }
    processingPayment.value = true;
    try {
      const response = await invoiceService.recordPayment(selectedInvoice.value.id, {
        amount: paymentAmount.value,
        paymentMethod: paymentMethod.value,
        referenceNumber: paymentReference.value || undefined,
        notes: paymentNotes.value || undefined,
      });
      if (response?.isSuccess !== false) {
        showAlert('success', 'Payment recorded successfully.', 'Success');
        showPaymentModal.value = false;
        paymentAmount.value = 0;
        paymentMethod.value = 0;
        paymentReference.value = '';
        paymentNotes.value = '';
        const updated = await invoiceService.getInvoiceById(selectedInvoice.value.id);
        selectedInvoice.value = updated?.data || updated?.Data || updated;
        await fetchInvoices();
        await fetchSummary();
      } else {
        showAlert('error', response?.error || 'Failed to record payment.', 'Error');
      }
    } catch {
      showAlert('error', 'An error occurred while recording payment.', 'Error');
    } finally {
      processingPayment.value = false;
    }
  };

  const handleIssueInvoice = async (id: number) => {
    try {
      const response = await invoiceService.issueInvoice(id);
      if (response?.isSuccess !== false) {
        showAlert('success', 'Invoice issued successfully.', 'Success');
        await fetchInvoices();
      } else {
        showAlert('error', response?.error || 'Failed to issue invoice.', 'Error');
      }
    } catch {
      showAlert('error', 'An error occurred while issuing the invoice.', 'Error');
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount == null) return '0 PKR';
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

  const printInvoice = () => {
    window.print();
  };

  const tableColumns = ['invoiceNumber', 'patientName', 'patientCnic', 'totalAmount', 'paidAmount', 'balanceDue', 'statusLabel'];

  const hasData = computed(() => apiResponse.value.data.length > 0);

  const getInvoiceFields = (inv: any) => [
    { label: 'Invoice #', value: inv.invoiceNumber },
    { label: 'Patient', value: inv.patientName },
    { label: 'CNIC', value: inv.patientCnic },
    { label: 'Total', value: formatCurrency(inv.totalAmount) },
    { label: 'Paid', value: formatCurrency(inv.paidAmount) },
    { label: 'Balance', value: formatCurrency(inv.balanceDue) },
    { label: 'Status', value: inv.statusLabel, badgeClass: inv.statusClass },
  ];

  const handleAddNew = () => {
    router.push('/invoices/add');
  };

  onMounted(async () => {
    await fetchInvoices();
    await fetchSummary();
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate :title="pageTitle" breadcrumb-title="Invoices" :loading="loading">
      <template #subtitle>Manage patient invoices, payments, refunds, and outstanding balances.</template>

      <template #header-stats>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
        <SearchWithViewToggle
          v-model="viewMode"
          v-model:date-filter="listFilters.dateFilter"
          :showDateFilter="true"
          placeholder="Search invoices by patient or CNIC..."
          add-button-route="invoices/add"
          @search="getSearchTerm"
          @date-filter="handleDateFilterChange"
        />
      </template>

      <template #table>
        <EmptyState
          v-if="!loading && !hasData"
          title="No Invoices Found"
          description="Get started by creating your first invoice."
          icon="default"
          action-label="Create First Invoice"
          @action="handleAddNew"
        />

        <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          <GridViewCard
            v-for="inv in apiResponse.data"
            :key="inv.id"
            :id="inv.id"
            :title="inv.invoiceNumber"
            :subtitle="inv.patientName"
            :fields="getInvoiceFields(inv)"
            :selectable="false"
            :show-details="true"
            :show-delete="false"
            @detail="handleShowDetail(inv)"
          />
        </div>

        <DynamicTable v-else :data="apiResponse.data" :columns="tableColumns" showDetails :showDelete="false" :statusColorMap="InvoiceStatusColorMap" @detail="handleShowDetail" />
      </template>

      <template #pagination>
        <DynamicPagination
          v-if="hasData"
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

    <!-- Invoice Detail Modal -->
    <div
      v-if="showDetailModal && selectedInvoice"
      class="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 print:bg-white print:p-0 print:absolute"
      @click.self="showDetailModal = false"
    >
      <div
        class="bg-surface rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stroke dark:border-strokedark print:shadow-none print:border-none print:max-h-full print:bg-white print:text-black"
      >
        <div class="sticky top-0 bg-surface border-b border-stroke dark:border-strokedark p-6 flex items-center justify-between print:hidden">
          <h2 class="text-2xl font-bold text-emphasis">Invoice Details</h2>
          <button @click="showDetailModal = false" class="text-bodydark dark:text-bodydark1 hover:text-emphasis text-3xl font-light">&times;</button>
        </div>

        <div id="printable-invoice" class="p-8 space-y-6 print:p-0">
          <div class="hidden print:flex flex-col items-center border-b pb-6 mb-6">
            <h1 class="text-3xl font-bold tracking-wider">HOSPITAL MANAGEMENT SYSTEM</h1>
            <p class="text-sm text-gray-500">Official Invoice & Payment Receipt</p>
          </div>

          <div class="flex justify-between items-start border-b border-stroke dark:border-strokedark pb-6">
            <div>
              <h3 class="text-xl font-bold text-emphasis">{{ selectedInvoice.invoiceNumber }}</h3>
              <p class="text-sm text-bodydark dark:text-bodydark1" v-if="selectedInvoice.notes">{{ selectedInvoice.notes }}</p>
            </div>
            <div class="text-right">
              <span :class="['inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border', InvoiceStatusColorMap[selectedInvoice.status] || '']">
                {{ InvoiceStatusMap[selectedInvoice.status] || 'Unknown' }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-8 border-b border-stroke dark:border-strokedark pb-6">
            <div>
              <h4 class="text-xs font-bold text-bodydark dark:text-bodydark1 uppercase tracking-wider mb-2">Billed To:</h4>
              <p class="text-base font-bold text-emphasis">{{ selectedInvoice.patient?.firstName }} {{ selectedInvoice.patient?.lastName }}</p>
              <p class="text-sm text-bodydark dark:text-bodydark1" v-if="selectedInvoice.patient?.cnic">CNIC: {{ selectedInvoice.patient.cnic }}</p>
              <p class="text-sm text-bodydark dark:text-bodydark1" v-if="selectedInvoice.patient?.phone">Phone: {{ selectedInvoice.patient.phone }}</p>
            </div>
            <div class="text-right">
              <h4 class="text-xs font-bold text-bodydark dark:text-bodydark1 uppercase tracking-wider mb-2">Invoice Info:</h4>
              <p class="text-sm text-bodydark dark:text-bodydark1">Issued: {{ formatDate(selectedInvoice.issuedDate) }}</p>
              <p class="text-sm text-bodydark dark:text-bodydark1" v-if="selectedInvoice.dueDate">Due: {{ formatDate(selectedInvoice.dueDate) }}</p>
              <p class="text-sm text-bodydark dark:text-bodydark1" v-if="selectedInvoice.migratedFromPatientBillId">Migrated from Bill #{{ selectedInvoice.migratedFromPatientBillId }}</p>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-sm font-bold text-emphasis uppercase tracking-wider">Invoice Lines</h4>
            <div v-if="selectedInvoice.invoiceLines && selectedInvoice.invoiceLines.length > 0" class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="border-b border-stroke dark:border-strokedark text-bodydark">
                    <th class="py-2">#</th>
                    <th class="py-2">Description</th>
                    <th class="py-2">Type</th>
                    <th class="py-2 text-right">Qty</th>
                    <th class="py-2 text-right">Unit Price</th>
                    <th class="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(line, idx) in selectedInvoice.invoiceLines" :key="line.id" class="border-b border-stroke/50 dark:border-strokedark/50 text-emphasis">
                    <td class="py-2.5">{{ idx + 1 }}</td>
                    <td class="py-2.5">{{ line.description }}</td>
                    <td class="py-2.5">{{ InvoiceLineTypeMap[line.lineType] || 'N/A' }}</td>
                    <td class="py-2.5 text-right">{{ line.quantity }}</td>
                    <td class="py-2.5 text-right">{{ formatCurrency(line.unitPrice) }}</td>
                    <td class="py-2.5 text-right font-bold">{{ formatCurrency(line.totalPrice) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-sm text-bodydark bg-slate-50 dark:bg-meta-4 p-4 rounded-xl text-center">No line items.</div>
          </div>

          <div class="bg-slate-50 dark:bg-meta-4 rounded-xl p-6 space-y-4">
            <h4 class="text-sm font-bold text-emphasis uppercase tracking-wider">Financial Summary</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p class="text-xs text-bodydark dark:text-bodydark1">Sub Total</p>
                <p class="text-lg font-bold text-emphasis">{{ formatCurrency(selectedInvoice.subTotal) }}</p>
              </div>
              <div>
                <p class="text-xs text-bodydark dark:text-bodydark1">Discount</p>
                <p class="text-lg font-bold text-emphasis">{{ formatCurrency(selectedInvoice.discountAmount) }}</p>
              </div>
              <div>
                <p class="text-xs text-bodydark dark:text-bodydark1">Tax</p>
                <p class="text-lg font-bold text-emphasis">{{ formatCurrency(selectedInvoice.taxAmount) }}</p>
              </div>
              <div>
                <p class="text-xs text-bodydark dark:text-bodydark1">Total</p>
                <p class="text-lg font-bold text-emphasis">{{ formatCurrency(selectedInvoice.totalAmount) }}</p>
              </div>
            </div>
            <div class="border-t border-stroke dark:border-strokedark pt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p class="text-xs text-bodydark dark:text-bodydark1">Paid</p>
                <p class="text-xl font-bold text-meta-3">{{ formatCurrency(selectedInvoice.paidAmount) }}</p>
              </div>
              <div>
                <p class="text-xs text-bodydark dark:text-bodydark1">Balance Due</p>
                <p class="text-xl font-bold text-danger">{{ formatCurrency(selectedInvoice.balanceDue) }}</p>
              </div>
              <div v-if="selectedInvoice.creditAmount">
                <p class="text-xs text-bodydark dark:text-bodydark1">Credit</p>
                <p class="text-xl font-bold text-primary">{{ formatCurrency(selectedInvoice.creditAmount) }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-sm font-bold text-emphasis uppercase tracking-wider">Payment History</h4>
            <div v-if="selectedInvoice.payments && selectedInvoice.payments.length > 0" class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="border-b border-stroke dark:border-strokedark text-bodydark">
                    <th class="py-2">Payment #</th>
                    <th class="py-2">Date</th>
                    <th class="py-2">Method</th>
                    <th class="py-2 text-right">Amount</th>
                    <th class="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in selectedInvoice.payments" :key="p.id" class="border-b border-stroke/50 dark:border-strokedark/50 text-emphasis">
                    <td class="py-2.5 font-mono">{{ p.paymentNumber || `#PAY-${String(p.id)}` }}</td>
                    <td class="py-2.5">{{ formatDate(p.paymentDate) }}</td>
                    <td class="py-2.5">{{ PaymentMethodMap[p.paymentMethod] || 'N/A' }}</td>
                    <td class="py-2.5 text-right font-bold text-meta-3">{{ formatCurrency(p.amount) }}</td>
                    <td class="py-2.5">
                      <span v-if="p.isVoided" class="text-danger text-xs font-bold">VOIDED</span>
                      <span v-else class="text-meta-3 text-xs font-bold">ACTIVE</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-sm text-bodydark bg-slate-50 dark:bg-meta-4 p-4 rounded-xl text-center">No payments recorded yet.</div>
          </div>

          <div class="space-y-4" v-if="selectedInvoice.auditLogs && selectedInvoice.auditLogs.length > 0">
            <h4 class="text-sm font-bold text-emphasis uppercase tracking-wider">Audit Trail</h4>
            <div class="bg-slate-50 dark:bg-meta-4 rounded-xl p-4 space-y-2">
              <div v-for="log in selectedInvoice.auditLogs" :key="log.id" class="flex items-start gap-3 text-sm">
                <span class="text-xs font-mono text-bodydark whitespace-nowrap">{{ formatDate(log.createdAt) }}</span>
                <span class="font-bold text-emphasis">{{ log.action }}</span>
                <span class="text-bodydark" v-if="log.notes">— {{ log.notes }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sticky bottom-0 bg-surface border-t border-stroke dark:border-strokedark p-6 flex flex-wrap justify-between items-center gap-3 print:hidden">
          <div class="flex flex-wrap gap-2">
            <BaseButton variant="outline" @click="printInvoice">Print Invoice</BaseButton>
            <BaseButton v-if="selectedInvoice.status === 0" variant="primary" @click="handleIssueInvoice(selectedInvoice.id)">Issue Invoice</BaseButton>
            <BaseButton v-if="selectedInvoice.balanceDue > 0 && (selectedInvoice.status === 1 || selectedInvoice.status === 2)" variant="primary" @click="showPaymentModal = true">
              Record Payment
            </BaseButton>
            <BaseButton v-if="selectedInvoice.status === 1 || selectedInvoice.status === 2" variant="danger" @click="showVoidModal = true">Void Invoice</BaseButton>
          </div>
          <BaseButton variant="outline" @click="showDetailModal = false">Close</BaseButton>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="showPaymentModal = false">
      <div class="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stroke dark:border-strokedark">
        <h3 class="text-xl font-bold text-emphasis mb-4">Record Payment</h3>
        <div class="space-y-4">
          <div>
            <p class="text-sm text-bodydark">
              Balance Due:
              <span class="font-bold text-danger">{{ formatCurrency(selectedInvoice?.balanceDue) }}</span>
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-bodydark mb-1">Amount *</label>
            <input
              v-model.number="paymentAmount"
              type="number"
              min="1"
              class="w-full rounded-lg border border-stroke dark:border-strokedark bg-transparent p-2.5 text-emphasis outline-none focus:border-primary"
              placeholder="Enter amount"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-bodydark mb-1">Payment Method *</label>
            <select v-model.number="paymentMethod" class="w-full rounded-lg border border-stroke dark:border-strokedark bg-transparent p-2.5 text-emphasis outline-none focus:border-primary">
              <option :value="0">Cash</option>
              <option :value="1">Card</option>
              <option :value="2">Bank Transfer</option>
              <option :value="3">Insurance</option>
              <option :value="4">Cheque</option>
              <option :value="5">Online</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-bodydark mb-1">Reference Number</label>
            <input
              v-model="paymentReference"
              type="text"
              class="w-full rounded-lg border border-stroke dark:border-strokedark bg-transparent p-2.5 text-emphasis outline-none focus:border-primary"
              placeholder="Optional reference"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-bodydark mb-1">Notes</label>
            <textarea
              v-model="paymentNotes"
              rows="2"
              class="w-full rounded-lg border border-stroke dark:border-strokedark bg-transparent p-2.5 text-emphasis outline-none focus:border-primary"
              placeholder="Optional notes"
            ></textarea>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <BaseButton variant="outline" @click="showPaymentModal = false">Cancel</BaseButton>
          <BaseButton variant="primary" :disabled="processingPayment || paymentAmount <= 0" @click="handleRecordPayment">
            {{ processingPayment ? 'Processing...' : 'Record Payment' }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Void Modal -->
    <div v-if="showVoidModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="showVoidModal = false">
      <div class="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stroke dark:border-strokedark">
        <h3 class="text-xl font-bold text-danger mb-4">Void Invoice</h3>
        <p class="text-sm text-bodydark mb-4">
          Are you sure you want to void invoice
          <strong>{{ selectedInvoice?.invoiceNumber }}</strong>
          ? This action cannot be undone.
        </p>
        <div>
          <label class="block text-sm font-medium text-bodydark mb-1">Cancellation Reason *</label>
          <textarea
            v-model="voidReason"
            rows="3"
            class="w-full rounded-lg border border-stroke dark:border-strokedark bg-transparent p-2.5 text-emphasis outline-none focus:border-primary"
            placeholder="Provide a reason for voiding this invoice..."
          ></textarea>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <BaseButton variant="outline" @click="showVoidModal = false">Cancel</BaseButton>
          <BaseButton variant="danger" :disabled="processingVoid || !voidReason.trim()" @click="handleVoid">
            {{ processingVoid ? 'Processing...' : 'Void Invoice' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<style>
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
