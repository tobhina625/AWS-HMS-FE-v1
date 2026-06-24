<script setup lang="ts">
  import ChevronRightIcon from '@/assets/images/SVGs/ChevronRightIcon.svg';
  import DocumentIcon from '@/assets/images/SVGs/DocumentIcon.svg';

  import { ref, computed, watch } from 'vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import DynamicPagination from '@/components/UI/DynamicPagination.vue';
  import EmptyState from '@/components/UI/EmptyState.vue';
  import PatientHistoryServices from '@/services/PatientHistory/PatientHistory.services';

  const props = defineProps<{
    patientId: number;
  }>();

  const historyService = new PatientHistoryServices();
  const loading = ref(true);
  const histories = ref<any[]>([]);
  const selectedHistory = ref<any>(null);
  const showDetails = ref(false);

  const pagination = ref({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  const loadHistory = async (page: number = 0) => {
    if (!props.patientId || props.patientId === 0) {
      loading.value = false;
      return;
    }

    loading.value = true;
    try {
      const response = await historyService.getPatientHistoryByPatientId(props.patientId, page, pagination.value.size);

      if (response?.content) {
        histories.value = response.content;
        pagination.value = {
          page: response.page,
          size: response.size,
          totalPages: response.totalPages,
          totalElements: response.totalElements,
        };
      }
    } catch (error) {
      console.error('Error loading patient history:', error);
      histories.value = [];
    } finally {
      loading.value = false;
    }
  };

  const viewDetails = async (history: any) => {
    try {
      const response = await historyService.getPatientHistoryWithDetails(history.id, 'employee,disease,patient,prescription');
      if (response?.data) {
        selectedHistory.value = response.data;
        showDetails.value = true;
      }
    } catch (error) {
      console.error('Error loading history details:', error);
    }
  };

  const closeDetails = () => {
    showDetails.value = false;
    selectedHistory.value = null;
  };

  const handlePageChange = (newPage: number) => {
    loadHistory(newPage);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isEmpty = computed(() => !loading.value && histories.value.length === 0);

  watch(
    () => props.patientId,
    (newId) => {
      if (newId && newId > 0) {
        loadHistory();
      }
    },
    { immediate: true }
  );
</script>

<template>
  <div class="space-y-6">
    <div v-if="!loading && !isEmpty" class="flex justify-end">
      <router-link :to="`/patienthistoryforpatient?patientId=${patientId}`" class="text-sm font-medium text-primary hover:text-primary/80">View full history →</router-link>
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
    <EmptyState v-else-if="isEmpty" title="No Medical History" description="This patient doesn't have any medical history records yet." icon="data" />

    <!-- History List -->
    <div v-else class="space-y-4">
      <div
        v-for="history in histories"
        :key="history.id"
        class="bg-elevated rounded-xl border border-stroke dark:border-strokedark hover:shadow-lg transition-shadow cursor-pointer min-h-[140px]"
        @click="viewDetails(history)"
      >
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-lg font-semibold text-emphasis">Visit on {{ formatDate(history.visitDate) }}</h3>
                <span
                  v-if="history.isEmergency"
                  class="px-2 py-1 text-xs font-semibold rounded-full bg-danger/10 text-danger dark:bg-danger/20 dark:text-danger-light border border-danger/20 dark:border-danger/30"
                >
                  Emergency
                </span>
                <span v-if="history.adviseAdmission" class="px-2 py-1 text-xs font-semibold rounded-full bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning-light">Admission Advised</span>
              </div>
              <p class="text-sm text-bodydark dark:text-bodydark1">Doctor: {{ history.employee?.name || 'N/A' }}</p>
            </div>
            <BaseButton variant="ghost" size="sm">
              <ChevronRightIcon class="w-5 h-5" />
            </BaseButton>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-if="history.symptom">
              <label class="text-xs text-bodydark dark:text-bodydark1">Symptoms</label>
              <p class="text-sm font-medium text-emphasis mt-1">{{ history.symptom }}</p>
            </div>
            <div v-if="history.disease">
              <label class="text-xs text-bodydark dark:text-bodydark1">Diagnosis</label>
              <p class="text-sm font-medium text-emphasis mt-1">{{ history.disease.name }}</p>
            </div>
          </div>

          <div v-if="history.prescription" class="mt-4 pt-4 border-t border-stroke dark:border-strokedark">
            <label class="text-xs text-bodydark dark:text-bodydark1 mb-2 block">Prescription</label>
            <p class="text-sm text-emphasis">{{ history.prescription }}</p>
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
    <div v-if="showDetails && selectedHistory" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="closeDetails">
      <div class="bg-surface rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-surface border-b border-stroke dark:border-strokedark p-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-emphasis">Medical History Details</h2>
          <BaseButton variant="ghost" @click="closeDetails" class="w-10 h-10 !p-0 rounded-full hover:bg-elevated flex items-center justify-center">
            <DocumentIcon class="w-6 h-6" />
          </BaseButton>
        </div>

        <!-- Modal Content -->
        <div class="p-6 space-y-6">
          <!-- Visit Information -->
          <div class="bg-elevated rounded-xl p-4">
            <h3 class="text-lg font-semibold text-emphasis mb-4">Visit Information</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs text-bodydark dark:text-bodydark1">Visit Date</label>
                <p class="text-sm font-medium text-emphasis">{{ formatDate(selectedHistory.visitDate) }}</p>
              </div>
              <div>
                <label class="text-xs text-bodydark dark:text-bodydark1">Doctor</label>
                <p class="text-sm font-medium text-emphasis">{{ selectedHistory.employee?.name || 'N/A' }}</p>
              </div>
              <div>
                <label class="text-xs text-bodydark dark:text-bodydark1">Emergency</label>
                <p class="text-sm font-medium text-emphasis">{{ selectedHistory.isEmergency ? 'Yes' : 'No' }}</p>
              </div>
              <div>
                <label class="text-xs text-bodydark dark:text-bodydark1">Admission Advised</label>
                <p class="text-sm font-medium text-emphasis">{{ selectedHistory.adviseAdmission ? 'Yes' : 'No' }}</p>
              </div>
            </div>
          </div>

          <!-- Symptoms & Diagnosis -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-if="selectedHistory.symptom" class="bg-elevated rounded-xl p-4">
              <h3 class="text-lg font-semibold text-emphasis mb-2">Symptoms</h3>
              <p class="text-sm text-bodydark dark:text-bodydark1">{{ selectedHistory.symptom }}</p>
            </div>
            <div v-if="selectedHistory.disease" class="bg-elevated rounded-xl p-4">
              <h3 class="text-lg font-semibold text-emphasis mb-2">Diagnosis</h3>
              <p class="text-sm font-medium text-emphasis">{{ selectedHistory.disease.name }}</p>
            </div>
          </div>

          <!-- Prescription -->
          <div v-if="selectedHistory.prescription" class="bg-elevated rounded-xl p-4">
            <h3 class="text-lg font-semibold text-emphasis mb-4">Prescription</h3>
            <div class="bg-surface rounded-lg p-4 border border-stroke dark:border-strokedark">
              <p class="text-sm text-bodydark dark:text-bodydark1 whitespace-pre-line">{{ selectedHistory.prescription }}</p>
            </div>
          </div>

          <!-- Lab Tests -->
          <div v-if="selectedHistory.patientLabs && selectedHistory.patientLabs.length > 0" class="bg-elevated rounded-xl p-4">
            <h3 class="text-lg font-semibold text-emphasis mb-4">Lab Tests</h3>
            <div class="space-y-2">
              <div v-for="(lab, index) in selectedHistory.patientLabs" :key="index" class="bg-surface rounded-lg p-3 border border-stroke dark:border-strokedark">
                <p class="text-sm font-medium text-emphasis">{{ lab.name || 'Lab Test' }}</p>
              </div>
            </div>
          </div>

          <!-- Admissions -->
          <div v-if="selectedHistory.admissions && selectedHistory.admissions.length > 0" class="bg-elevated rounded-xl p-4">
            <h3 class="text-lg font-semibold text-emphasis mb-4">Admissions</h3>
            <div class="space-y-2">
              <div v-for="(admission, index) in selectedHistory.admissions" :key="index" class="bg-surface rounded-lg p-3 border border-stroke dark:border-strokedark">
                <p class="text-sm font-medium text-emphasis">Admission #{{ admission.id }}</p>
                <p class="text-xs text-bodydark dark:text-bodydark1">{{ formatDate(admission.admissionDate) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="sticky bottom-0 bg-surface border-t border-stroke dark:border-strokedark p-6 flex justify-end gap-3">
          <BaseButton variant="outline" @click="closeDetails">Close</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
