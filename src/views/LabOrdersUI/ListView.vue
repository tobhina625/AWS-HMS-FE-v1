<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import ListViewTemplate from '@/components/Templates/ListViewTemplate.vue';
  import SearchWithViewToggle from '@/components/UI/SearchWithViewToggle.vue';
  import DynamicTable from '@/components/UI/DynamicTable.vue';
  import DynamicPagination from '@/components/UI/DynamicPagination.vue';
  import EmptyState from '@/components/UI/EmptyState.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BulkDeleteButton from '@/components/UI/BulkDeleteButton.vue';
  import PatientLabsService from '@/services/PatientLabs/PatientLabs.services';
  import type { IPatientLabs, IUpdateLabResult } from '@/services/PatientLabs/PatientLabs.interface';
  import useAlert from '@/plugins/alert/useAlert';
  import { usePermissions } from '@/composables/usePermissions';
  import { useSelection } from '@/composables/useSelection';
  import { useConfirmDelete } from '@/composables/useConfirmDelete';
  import { useLabReport } from '@/composables/useLabReport';
  import DetailPageIcon from '@/assets/images/SVGs/View.svg';
  import DownloadIcon from '@/assets/images/SVGs/DownloadIcon.svg';

  const { showAlert } = useAlert();
  const { canViewModule, canDeleteFromModule } = usePermissions();
  const { confirmBulkDelete } = useConfirmDelete();
  const { selectedIds, selectionCount, toggle, selectAll, deselectAll, toggleAll } = useSelection<number>();
  const { downloadPdfReport } = useLabReport();
  const labService = new PatientLabsService();
  const route = useRoute();
  const router = useRouter();

  const canViewLabOrders = computed(() => canViewModule('Lab Orders'));
  const canDelete = computed(() => canDeleteFromModule('Lab Orders'));

  // ── Patient-filter mode (coming from patient profile) ──────────────────────
  const patientIdFilter = computed(() => {
    const val = route.query.patientId;
    return val ? Number(val) : null;
  });
  const patientNameFilter = computed(() => orders.value.find((o) => o.patientId === patientIdFilter.value)?.patientName ?? null);

  // ── Core data ───────────────────────────────────────────────────────────────
  const orders = ref<IPatientLabs[]>([]);
  const loading = ref(true);

  // ── Filters ─────────────────────────────────────────────────────────────────
  const filterStatus = ref('');
  const searchQuery = ref('');

  // Date filter (supports presets, single date, or date ranges)
  const dateFilter = ref<string>('');

  // ── Pagination ───────────────────────────────────────────────────────────────
  const PAGE_SIZE = 10;
  const currentPage = ref(0);

  // ── Modal state ─────────────────────────────────────────────────────────────
  const selectedOrder = ref<IPatientLabs | null>(null);
  const showResultModal = ref(false);
  const submitting = ref(false);

  const resultForm = ref<IUpdateLabResult>({
    patientLabsId: 0,
    status: 'Completed',
    details: '',
    testEntries: [],
  });

  // ── Status colour map for DynamicTable ───────────────────────────────────────
  const statusColorMap: Record<string, string> = {
    Ordered: 'bg-primary/10 text-primary border border-primary/20',
    InProgress: 'bg-warning/10 text-warning border border-warning/20',
    Completed: 'bg-success/10 text-success border border-success/20',
    Cancelled: 'bg-danger/10 text-danger border border-danger/20',
  };

  // ── Columns shown in DynamicTable ────────────────────────────────────────────
  const labOrderColumns = patientIdFilter.value ? ['labTestName', 'status', 'details', 'reportTime', 'createdAt'] : ['patientName', 'labTestName', 'status', 'details', 'branchName', 'createdAt'];

  // ── Date helpers ─────────────────────────────────────────────────────────────
  const startOfDay = (d: Date) => {
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const dateRangeForFilter = computed<{ from: Date | null; to: Date | null }>(() => {
    if (!dateFilter.value) return { from: null, to: null };
    const val = dateFilter.value.trim().toLowerCase();
    const t = startOfDay(new Date());

    if (val === 'today') {
      const to = new Date(t);
      to.setHours(23, 59, 59, 999);
      return { from: t, to };
    }
    if (val === 'yesterday') {
      const from = new Date(t);
      from.setDate(from.getDate() - 1);
      const to = new Date(from);
      to.setHours(23, 59, 59, 999);
      return { from, to };
    }
    if (val === 'last7days') {
      const from = new Date(t);
      from.setDate(from.getDate() - 6);
      const to = new Date(t);
      to.setHours(23, 59, 59, 999);
      return { from, to };
    }
    if (val === 'last30days') {
      const from = new Date(t);
      from.setDate(from.getDate() - 29);
      const to = new Date(t);
      to.setHours(23, 59, 59, 999);
      return { from, to };
    }
    if (val === 'thismonth') {
      const from = new Date(t.getFullYear(), t.getMonth(), 1);
      const to = new Date(t);
      to.setHours(23, 59, 59, 999);
      return { from, to };
    }
    if (val === 'lastmonth') {
      const from = new Date(t.getFullYear(), t.getMonth() - 1, 1);
      const to = new Date(t.getFullYear(), t.getMonth(), 0);
      to.setHours(23, 59, 59, 999);
      return { from, to };
    }
    if (val.includes(',')) {
      const [s, e] = val.split(',');
      const from = new Date(s);
      from.setHours(0, 0, 0, 0);
      const to = new Date(e);
      to.setHours(23, 59, 59, 999);
      return { from, to };
    }
    const single = new Date(val);
    if (!isNaN(single.getTime())) {
      const from = startOfDay(new Date(single));
      const to = new Date(from);
      to.setHours(23, 59, 59, 999);
      return { from, to };
    }
    return { from: null, to: null };
  });

  // ── Computed: client-side filtered list ─────────────────────────────────────
  const filteredOrders = computed(() => {
    const { from, to } = dateRangeForFilter.value;
    return orders.value.filter((o) => {
      if (filterStatus.value && o.status !== filterStatus.value) return false;
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        if (!(o.patientName?.toLowerCase().includes(q) || o.labTestName?.toLowerCase().includes(q))) return false;
      }
      if (from || to) {
        const d = o.createdAt ? new Date(o.createdAt) : null;
        if (!d) return false;
        if (from && d < from) return false;
        if (to && d > to) return false;
      }
      return true;
    });
  });

  // ── Computed: paginated slice for the current page ───────────────────────────
  const paginatedOrders = computed(() => {
    const start = currentPage.value * PAGE_SIZE;
    return filteredOrders.value.slice(start, start + PAGE_SIZE);
  });

  const totalPages = computed(() => Math.ceil(filteredOrders.value.length / PAGE_SIZE));
  const totalElements = computed(() => filteredOrders.value.length);
  const isEmpty = computed(() => !loading.value && filteredOrders.value.length === 0);
  const hasData = computed(() => filteredOrders.value.length > 0);

  // ── Search handler ───────────────────────────────────────────────────────────
  const handleSearch = (term: string) => {
    searchQuery.value = term;
    currentPage.value = 0;
  };

  const handleDateFilter = (val: string) => {
    dateFilter.value = val;
    currentPage.value = 0;
  };

  const handlePageChange = (page: number) => {
    currentPage.value = page;
  };

  // ── Data loading ─────────────────────────────────────────────────────────────
  const toArray = (raw: any): IPatientLabs[] => {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.content)) return raw.content;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  };

  const loadOrders = async () => {
    loading.value = true;
    try {
      if (patientIdFilter.value) {
        const raw = await labService.getByPatientId(patientIdFilter.value);
        orders.value = toArray(raw);
      } else {
        const raw = await labService.getAll('', 0, 0, 200);
        orders.value = toArray(raw);
      }
    } catch (err) {
      console.error('Lab orders fetch error:', err);
      showAlert('error', 'Failed to load lab orders.', 'Error');
    } finally {
      loading.value = false;
    }
  };

  // ── Result modal ─────────────────────────────────────────────────────────────
  const openResultModal = (order: IPatientLabs) => {
    selectedOrder.value = order;
    resultForm.value = {
      patientLabsId: order.id!,
      status: 'Completed',
      details: order.details || '',
      testEntries: order.report ? order.report.map((r) => ({ ...r })) : [],
    };
    showResultModal.value = true;
  };

  const addTestEntry = () => {
    resultForm.value.testEntries!.push({ entity: '', normalMinValue: 0, normalMaxValue: 0, recordedValue: 0 });
  };

  const removeEntry = (index: number) => {
    resultForm.value.testEntries!.splice(index, 1);
  };

  const submitResult = async () => {
    if (!resultForm.value.testEntries?.length) {
      showAlert('error', 'Add at least one test result entry.', 'Validation');
      return;
    }
    submitting.value = true;
    try {
      await labService.updateLabResult(resultForm.value);
      showAlert('success', 'Lab result submitted successfully.', 'Success');
      showResultModal.value = false;
      await loadOrders();
    } catch (err: any) {
      console.error('Submit lab result error:', err);
      const serverMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message || '';
      showAlert('error', serverMsg ? `Failed to submit lab result: ${serverMsg}` : 'Failed to submit lab result.', 'Error');
    } finally {
      submitting.value = false;
    }
  };

  const handleBulkDelete = async () => {
    if (!canDelete.value) return;

    await confirmBulkDelete({
      entityName: 'Lab Order',
      count: selectionCount.value,
      deleteAction: () => labService.bulkDeleteLabOrders(selectedIds.value),
      onSuccess: async () => {
        deselectAll();
        await loadOrders();
      },
    });
  };

  onMounted(loadOrders);
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate
      :title="patientIdFilter ? 'Patient Lab Orders' : 'Lab Orders'"
      :breadcrumb-title="patientIdFilter ? '🧪 Lab Orders – Patient View' : 'Lab Orders'"
      :loading="loading"
      :selection-count="selectionCount"
      :show-bulk-actions="selectionCount > 0"
      @select-all="selectAll(paginatedOrders)"
      @deselect-all="deselectAll"
    >
      <!-- Subtitle -->
      <template #subtitle>
        <span v-if="patientIdFilter">
          All lab orders for
          <strong>{{ patientNameFilter || 'Patient #' + patientIdFilter }}</strong>
          — old and new.
          <button @click="router.push('/patients/' + patientIdFilter)" class="ml-2 text-primary underline hover:no-underline text-sm font-medium">← Back to Patient Profile</button>
        </span>
        <span v-else>Manage, filter and enter results for all patient lab orders.</span>
      </template>

      <template #bulk-actions>
        <BulkDeleteButton :disabled="selectionCount === 0" @click="handleBulkDelete" />
      </template>

      <!-- Search / date filter bar -->
      <template #search>
        <div class="flex w-full items-center gap-4 flex-wrap">
          <SearchWithViewToggle
            :model-value="'table'"
            :show-date-filter="true"
            :date-filter="dateFilter"
            placeholder="Search patient or test name..."
            :show-add="false"
            class="flex-1"
            @search="handleSearch"
            @update:date-filter="handleDateFilter"
          />

          <!-- Status filter -->
          <select
            v-model="filterStatus"
            @change="currentPage = 0"
            class="border border-stroke dark:border-strokedark rounded-lg px-4 py-2 text-sm bg-transparent text-emphasis focus:outline-none focus:border-primary"
          >
            <option value="">All Status</option>
            <option value="Ordered">Ordered</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <BaseButton variant="outline" size="sm" @click="loadOrders" :loading="loading">Refresh</BaseButton>
        </div>
      </template>

      <!-- Table slot -->
      <template #table>
        <!-- Patient-filter banner -->
        <div v-if="patientIdFilter" class="flex items-center gap-3 bg-primary/10 border-b border-primary/20 px-6 py-3">
          <span class="text-lg">🧪</span>
          <p class="text-sm font-medium text-primary flex-1">
            Filtered to:
            <strong>{{ patientNameFilter || 'Patient #' + patientIdFilter }}</strong>
            &nbsp;·&nbsp; {{ totalElements }} order(s) found
          </p>
        </div>

        <!-- Empty state -->
        <EmptyState v-if="isEmpty" title="No Lab Orders Found" description="No lab orders match the current filters. Try adjusting the search, status or date." icon="data" />

        <!-- Table -->
        <DynamicTable
          v-else
          :data="paginatedOrders"
          :columns="labOrderColumns"
          :status-color-map="statusColorMap"
          module-name="Lab Orders"
          item-key="id"
          :selectable="true"
          :selected-ids="selectedIds"
          :showDelete="canDelete"
          @select="toggle"
          @select-all="(checked: boolean) => toggleAll(checked, paginatedOrders)"
        >
          <template #actions="{ item }">
            <!-- Completed with results: download report -->
            <div
              v-if="item.status === 'Completed' && item.report?.length"
              @click="downloadPdfReport(item)"
              title="Download Report"
              class="p-2 rounded-xl cursor-pointer text-gray-500 hover:bg-elevated hover:text-success dark:hover:text-gray-300 transition-all duration-200 w-8 h-8 flex items-center justify-center"
            >
              <DownloadIcon class="w-5 h-5 transition-colors duration-200" />
            </div>

            <!-- Otherwise: open the result entry modal (subject to view permission) -->
            <div
              v-else-if="canViewLabOrders"
              @click="openResultModal(item)"
              title="Enter Result"
              class="p-2 rounded-xl cursor-pointer text-gray-500 hover:bg-elevated hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200 w-8 h-8 flex items-center justify-center"
            >
              <DetailPageIcon class="w-5 h-5 transition-colors duration-200" />
            </div>
          </template>
        </DynamicTable>
      </template>

      <!-- Pagination -->
      <template #pagination>
        <DynamicPagination
          v-if="hasData"
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-elements="totalElements"
          :items-per-page="PAGE_SIZE"
          :start-index="currentPage"
          @change-page="handlePageChange"
        />
      </template>
    </ListViewTemplate>

    <!-- ── Result Entry / View Modal ──────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showResultModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showResultModal = false"></div>
        <div class="relative bg-white dark:bg-boxdark rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-xl font-bold text-emphasis">{{ selectedOrder?.labTestName || 'Lab Test' }} Results</h3>
              <p class="text-sm text-bodydark mt-1">Patient: {{ selectedOrder?.patientName }}</p>
            </div>
            <button @click="showResultModal = false" class="text-bodydark hover:text-emphasis transition-colors text-xl">&times;</button>
          </div>

          <div class="space-y-5">
            <!-- Status & Notes -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-emphasis mb-1">Status</label>
                <select
                  v-model="resultForm.status"
                  class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary"
                >
                  <option>InProgress</option>
                  <option>Completed</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-emphasis mb-1">Notes</label>
                <input
                  v-model="resultForm.details"
                  type="text"
                  placeholder="Additional notes..."
                  class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <!-- Test Entries -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <label class="text-sm font-semibold text-emphasis">Test Entries</label>
                <button @click="addTestEntry" class="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors">+ Add Entry</button>
              </div>

              <div v-if="!resultForm.testEntries?.length" class="text-center py-8 bg-elevated rounded-lg">
                <p class="text-bodydark text-sm">No test entries yet. Click "Add Entry" to begin.</p>
              </div>

              <div class="space-y-3">
                <div v-for="(entry, idx) in resultForm.testEntries" :key="idx" class="grid grid-cols-12 gap-3 items-center p-3 bg-elevated rounded-lg">
                  <div class="col-span-4">
                    <input
                      v-model="entry.entity"
                      type="text"
                      placeholder="Parameter (e.g. Hemoglobin)"
                      class="w-full border border-stroke dark:border-strokedark rounded-md px-3 py-2 text-sm bg-white dark:bg-boxdark text-emphasis focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div class="col-span-2">
                    <input
                      v-model.number="entry.normalMinValue"
                      type="number"
                      placeholder="Min"
                      class="w-full border border-stroke dark:border-strokedark rounded-md px-3 py-2 text-sm bg-white dark:bg-boxdark text-emphasis focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div class="col-span-2">
                    <input
                      v-model.number="entry.normalMaxValue"
                      type="number"
                      placeholder="Max"
                      class="w-full border border-stroke dark:border-strokedark rounded-md px-3 py-2 text-sm bg-white dark:bg-boxdark text-emphasis focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div class="col-span-3">
                    <input
                      v-model.number="entry.recordedValue"
                      type="number"
                      placeholder="Result"
                      :class="[
                        'w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white dark:bg-boxdark text-emphasis',
                        entry.recordedValue < entry.normalMinValue || entry.recordedValue > entry.normalMaxValue ? 'border-danger/60' : 'border-stroke dark:border-strokedark',
                      ]"
                    />
                  </div>
                  <div class="col-span-1 flex justify-center">
                    <button @click="removeEntry(idx)" class="text-danger hover:text-danger/70 transition-colors text-lg">×</button>
                  </div>
                </div>
              </div>

              <div class="flex gap-2 mt-2 text-xs text-bodydark">
                <span class="font-medium">Columns:</span>
                <span>Parameter | Min | Max | Result</span>
                <span class="text-danger ml-2">● Values outside range highlighted in red</span>
              </div>
            </div>
          </div>

          <div class="flex gap-3 mt-6 pt-4 border-t border-stroke dark:border-strokedark">
            <BaseButton variant="outline" class="flex-1" @click="showResultModal = false" :disabled="submitting">Cancel</BaseButton>
            <BaseButton variant="primary" class="flex-1" @click="submitResult" :loading="submitting">Submit Results</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </DefaultLayout>
</template>
