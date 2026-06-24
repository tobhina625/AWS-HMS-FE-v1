<script setup lang="ts">
  import ChevronRightIcon from '@/assets/images/SVGs/ChevronRightIcon.svg';
  import DocumentIcon from '@/assets/images/SVGs/DocumentIcon.svg';

  import { ref, computed, watch } from 'vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import DynamicPagination from '@/components/UI/DynamicPagination.vue';
  import EmptyState from '@/components/UI/EmptyState.vue';
  import PatientBillsService from '@/services/PatientBill/Patientbill.services';

  const props = defineProps<{
    patientId: number;
  }>();

  const emit = defineEmits<{
    (e: 'addNew'): void;
  }>();

  const billService = new PatientBillsService();
  const loading = ref(true);
  const bills = ref<any[]>([]);
  const selectedBill = ref<any>(null);
  const showDetails = ref(false);

  const pagination = ref({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  const billTypeLabels: Record<number, string> = {
    0: 'Consultation',
    1: 'Lab Test',
    2: 'Procedure',
    3: 'Medication',
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

  const viewDetails = (bill: any) => {
    selectedBill.value = bill;
    showDetails.value = true;
  };

  const closeDetails = () => {
    showDetails.value = false;
    selectedBill.value = null;
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
                <span v-if="bill.isPaid ?? bill.IsPaid" class="px-2 py-1 text-xs font-semibold rounded-full bg-meta-3/10 text-meta-3 border border-meta-3/20">Paid</span>
                <span v-else class="px-2 py-1 text-xs font-semibold rounded-full bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning-light">Pending</span>
              </div>
              <p v-if="bill.reason ?? bill.Reason" class="text-sm text-bodydark dark:text-bodydark1">{{ bill.reason ?? bill.Reason }}</p>
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

    <!-- Details Modal -->
    <div v-if="showDetails && selectedBill" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="closeDetails">
      <div class="bg-surface rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-surface border-b border-stroke dark:border-strokedark p-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-emphasis">Bill Details</h2>
          <BaseButton variant="ghost" @click="closeDetails" class="w-10 h-10 !p-0 rounded-full hover:bg-elevated flex items-center justify-center">
            <DocumentIcon class="w-6 h-6" />
          </BaseButton>
        </div>

        <div class="p-6 space-y-6">
          <div class="bg-elevated rounded-xl p-4">
            <h3 class="text-lg font-semibold text-emphasis mb-4">Bill Information</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs text-bodydark dark:text-bodydark1">Bill Type</label>
                <p class="text-sm font-medium text-emphasis">{{ getBillTypeLabel(selectedBill.billType ?? selectedBill.BillType) }}</p>
              </div>
              <div>
                <label class="text-xs text-bodydark dark:text-bodydark1">Status</label>
                <p class="text-sm font-medium text-emphasis">{{ (selectedBill.isPaid ?? selectedBill.IsPaid) ? 'Paid' : 'Pending' }}</p>
              </div>
              <div>
                <label class="text-xs text-bodydark dark:text-bodydark1">Total Amount</label>
                <p class="text-sm font-medium text-emphasis">{{ formatCurrency(selectedBill.totalAmount ?? selectedBill.TotalAmount) }}</p>
              </div>
              <div>
                <label class="text-xs text-bodydark dark:text-bodydark1">Paid Amount</label>
                <p class="text-sm font-medium text-emphasis">{{ formatCurrency(selectedBill.paidAmount ?? selectedBill.PaidAmount) }}</p>
              </div>
              <div v-if="selectedBill.reason ?? selectedBill.Reason" class="col-span-2">
                <label class="text-xs text-bodydark dark:text-bodydark1">Reason</label>
                <p class="text-sm font-medium text-emphasis mt-1">{{ selectedBill.reason ?? selectedBill.Reason }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="sticky bottom-0 bg-surface border-t border-stroke dark:border-strokedark p-6 flex justify-end gap-3">
          <BaseButton variant="outline" @click="closeDetails">Close</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
