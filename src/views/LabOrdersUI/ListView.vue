<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import PatientLabsService from '@/services/PatientLabs/PatientLabs.services';
  // import type { IPatientLabs, IUpdateLabResult, ILabTestEntry } from '@/services/PatientLabs/PatientLabs.interface';
  import type { IPatientLabs, IUpdateLabResult } from '@/services/PatientLabs/PatientLabs.interface';
  import useAlert from '@/plugins/alert/useAlert';

  const { showAlert } = useAlert();
  const labService = new PatientLabsService();

  const orders = ref<IPatientLabs[]>([]);
  const loading = ref(true);
  const filterStatus = ref('');
  const searchQuery = ref('');
  const selectedOrder = ref<IPatientLabs | null>(null);
  const showResultModal = ref(false);
  const submitting = ref(false);

  const resultForm = ref<IUpdateLabResult>({
    patientLabsId: 0,
    status: 'Completed',
    details: '',
    testEntries: [],
  });

  const statusColors: Record<string, string> = {
    Ordered: 'bg-primary/10 text-primary border-primary/20',
    InProgress: 'bg-warning/10 text-warning border-warning/20',
    Completed: 'bg-success/10 text-success border-success/20',
    Cancelled: 'bg-danger/10 text-danger border-danger/20',
  };

  const filteredOrders = computed(() => {
    return orders.value.filter((o) => {
      const matchesStatus = !filterStatus.value || o.status === filterStatus.value;
      const matchesSearch = !searchQuery.value || o.patientName?.toLowerCase().includes(searchQuery.value.toLowerCase()) || o.labTestName?.toLowerCase().includes(searchQuery.value.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  });

  const loadOrders = async () => {
    loading.value = true;
    try {
      const data = await labService.getAll(filterStatus.value, 0, 0, 200);
      orders.value = Array.isArray(data) ? data : data?.items || [];
    } catch {
      showAlert('error', 'Failed to load lab orders.', 'Error');
    } finally {
      loading.value = false;
    }
  };

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
    } catch {
      showAlert('error', 'Failed to submit lab result.', 'Error');
    } finally {
      submitting.value = false;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  onMounted(loadOrders);
</script>

<template>
  <DefaultLayout>
    <BreadcrumbDefault pageTitle="Lab Orders" />

    <div class="mt-6 space-y-6">
      <!-- Header & Filters -->
      <div class="bg-surface rounded-2xl border border-stroke dark:border-strokedark p-5">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div class="flex-1">
            <h2 class="text-xl font-bold text-emphasis">Lab Order Worklist</h2>
            <p class="text-sm text-bodydark dark:text-bodydark1 mt-1">{{ filteredOrders.length }} order(s) found</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search patient or test..."
              class="border border-stroke dark:border-strokedark rounded-lg px-4 py-2 text-sm bg-transparent text-emphasis focus:outline-none focus:border-primary w-56"
            />
            <select
              v-model="filterStatus"
              @change="loadOrders"
              class="border border-stroke dark:border-strokedark rounded-lg px-4 py-2 text-sm bg-transparent text-emphasis focus:outline-none focus:border-primary"
            >
              <option value="">All Status</option>
              <option value="Ordered">Ordered</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <BaseButton variant="outline" @click="loadOrders" :loading="loading">Refresh</BaseButton>
          </div>
        </div>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="bg-surface rounded-xl border border-stroke dark:border-strokedark p-4 animate-pulse flex gap-4">
          <div class="w-12 h-12 bg-elevated rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-elevated rounded w-1/3"></div>
            <div class="h-3 bg-elevated rounded w-1/2"></div>
          </div>
          <div class="w-20 h-8 bg-elevated rounded-full"></div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!filteredOrders.length" class="bg-surface rounded-2xl border border-stroke dark:border-strokedark p-16 text-center">
        <div class="text-6xl mb-4">🧪</div>
        <h3 class="text-lg font-semibold text-emphasis mb-2">No Lab Orders Found</h3>
        <p class="text-bodydark dark:text-bodydark1">No lab orders match the current filters.</p>
      </div>

      <!-- Orders Table -->
      <div v-else class="bg-surface rounded-2xl border border-stroke dark:border-strokedark overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-elevated border-b border-stroke dark:border-strokedark">
            <tr>
              <th class="px-5 py-4 text-left font-semibold text-emphasis">#</th>
              <th class="px-5 py-4 text-left font-semibold text-emphasis">Patient</th>
              <th class="px-5 py-4 text-left font-semibold text-emphasis">Test</th>
              <th class="px-5 py-4 text-left font-semibold text-emphasis">Ordered</th>
              <th class="px-5 py-4 text-left font-semibold text-emphasis">Status</th>
              <th class="px-5 py-4 text-left font-semibold text-emphasis">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stroke dark:divide-strokedark">
            <tr v-for="(order, idx) in filteredOrders" :key="order.id" class="hover:bg-elevated/50 transition-colors">
              <td class="px-5 py-4 text-bodydark">{{ idx + 1 }}</td>
              <td class="px-5 py-4">
                <div class="font-medium text-emphasis">{{ order.patientName || 'Patient #' + order.patientId }}</div>
              </td>
              <td class="px-5 py-4">
                <div class="font-medium text-emphasis">{{ order.labTestName || 'Lab Test #' + order.labTestId }}</div>
                <div v-if="order.details" class="text-xs text-bodydark mt-0.5 truncate max-w-xs">{{ order.details }}</div>
              </td>
              <td class="px-5 py-4 text-bodydark">{{ formatDate(order.createdAt) }}</td>
              <td class="px-5 py-4">
                <span :class="['px-3 py-1 rounded-full text-xs font-medium border', statusColors[order.status] || 'bg-elevated text-bodydark']">
                  {{ order.status }}
                </span>
              </td>
              <td class="px-5 py-4">
                <button
                  v-if="order.status === 'Ordered' || order.status === 'InProgress'"
                  @click="openResultModal(order)"
                  class="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  Enter Results
                </button>
                <button
                  v-else-if="order.status === 'Completed'"
                  @click="openResultModal(order)"
                  class="px-3 py-1.5 rounded-lg bg-elevated text-bodydark text-xs font-medium hover:bg-elevated/80 transition-colors"
                >
                  View Results
                </button>
                <span v-else class="text-bodydark text-xs">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Result Entry Modal -->
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
