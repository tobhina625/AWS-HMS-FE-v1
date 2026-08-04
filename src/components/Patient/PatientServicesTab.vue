<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BaseTextArea from '@/components/Base/BaseTextArea.vue';
  import PatientSurgeryServices from '@/services/PatientSurgery/PatientSurgery.services';
  import SurgeryService from '@/services/Surgery/Surgery.services';
  import OperationTheatreService from '@/services/OperationTheatre/OperationTheatre.services';
  import AdmissionServices from '@/services/Admission/Admission.services';
  import WardServices from '@/services/Ward/ward.services';
  import type { IPatientSurgery } from '@/services/PatientSurgery/PatientSurgery.dto';

  const props = defineProps<{
    patientId: number;
  }>();

  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();
  const patientSurgeryService = new PatientSurgeryServices();
  const surgeryService = new SurgeryService();
  const operationTheatreService = new OperationTheatreService();
  const admissionService = new AdmissionServices();
  const wardService = new WardServices();

  const loading = ref(true);
  const patientSurgeries = ref<IPatientSurgery[]>([]);
  const showCreateForm = ref(false);
  const isSubmitting = ref(false);
  const loadingDropdowns = ref(false);

  const surgeryOptions = ref<{ id: number; name: string }[]>([]);
  const operationTheatreOptions = ref<{ id: number; name: string }[]>([]);
  const patientAdmissions = ref<any[]>([]);
  const selectedAdmissionId = ref(0);

  const formData = ref({
    surgeryTime: '',
    endTime: '',
    notes: '',
    surgeryId: 0,
    operationTheatreId: 0,
  });

  const TERMINAL_STATUSES = [10, 13, 14, 15, 16];

  const activeAdmission = computed(() => {
    return patientAdmissions.value.find((a: any) => !TERMINAL_STATUSES.includes(a.status));
  });

  const hasActiveAdmission = computed(() => !!activeAdmission.value);

  const isEmpty = computed(() => !loading.value && patientSurgeries.value.length === 0);

  // Auto-calculate duration from end - start time
  const calculatedDuration = computed(() => {
    if (!formData.value.surgeryTime || !formData.value.endTime) return 0;
    const start = new Date(formData.value.surgeryTime);
    const end = new Date(formData.value.endTime);
    if (end <= start) return 0;
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  });

  const loadPatientSurgeries = async () => {
    loading.value = true;
    try {
      const response = await patientSurgeryService.getPatientSurgeriesByPatientId(props.patientId);
      const content = response?.content || response?.Content || [];
      patientSurgeries.value = content.filter((item: any) => !item.isDeleted);
    } catch (error) {
      console.error('Error loading patient surgeries:', error);
      patientSurgeries.value = [];
    } finally {
      loading.value = false;
    }
  };

  const loadSurgeryOptions = async () => {
    try {
      const response = await surgeryService.getSurgeries('size=1000&page=0&isDeleted=false');
      const content = response?.content || response?.Content || [];
      surgeryOptions.value = content.filter((item: any) => !item.isDeleted).map((item: any) => ({ id: item.id, name: item.name || `Surgery #${item.id}` }));
    } catch {
      showAlert('error', 'Failed to load surgeries.', 'Error');
    }
  };

  const loadOperationTheatreOptions = async () => {
    try {
      const response = await operationTheatreService.getOperationTheatres('size=1000&page=0&isDeleted=false');
      const content = response?.content || response?.Content || [];
      operationTheatreOptions.value = content
        .filter((item: any) => !item.isDeleted)
        .map((item: any) => ({
          id: item.id,
          name: item.location ? `${item.name} - ${item.location}` : item.name || `Theatre #${item.id}`,
        }));
    } catch {
      showAlert('error', 'Failed to load operation theatres.', 'Error');
    }
  };

  const loadPatientAdmissions = async () => {
    try {
      const response = await admissionService.getAdmissionsByPatientId(props.patientId);
      const data = response?.data || response?.Data || [];
      patientAdmissions.value = Array.isArray(data) ? data : [];
      const active = patientAdmissions.value.find((a: any) => !TERMINAL_STATUSES.includes(a.status));
      selectedAdmissionId.value = active?.id || 0;
    } catch (error) {
      console.error('Error loading patient admissions:', error);
      patientAdmissions.value = [];
    }
  };

  const loadDropdownData = async () => {
    loadingDropdowns.value = true;
    try {
      await Promise.all([loadSurgeryOptions(), loadOperationTheatreOptions(), loadPatientAdmissions()]);
    } finally {
      loadingDropdowns.value = false;
    }
  };

  const resetForm = () => {
    formData.value = {
      surgeryTime: '',
      endTime: '',
      notes: '',
      surgeryId: 0,
      operationTheatreId: 0,
    };
  };

  const toggleCreateForm = async () => {
    showCreateForm.value = !showCreateForm.value;
    if (showCreateForm.value && surgeryOptions.value.length === 0) {
      await loadDropdownData();
    }
    if (!showCreateForm.value) {
      resetForm();
    }
  };

  const movePatientToWard = async () => {
    try {
      const bedResponse = await wardService.getBedByPatientId(props.patientId);
      const existingBed = bedResponse?.data || bedResponse?.Data;
      if (existingBed) {
        return;
      }
    } catch {
      // 404 means no bed assigned - continue to assign one
    }

    try {
      const bedsResponse = await wardService.getAvailableBeds(false);
      const availableBeds = bedsResponse?.data || bedsResponse?.Data || [];
      if (!availableBeds.length) {
        showAlert('warning', 'Patient service created, but no available beds found for ward assignment.', 'Ward Assignment');
        return;
      }

      const firstBed = availableBeds[0];
      const assignResponse = await wardService.assignBedToPatient(firstBed.id, props.patientId);
      if (assignResponse?.isSuccess ?? (assignResponse as any)?.IsSuccess) {
        showAlert('info', `Patient has been assigned to ${firstBed.wardName || 'ward'} - Bed ${firstBed.bedNumber || firstBed.id}.`, 'Ward Assignment');
      }
    } catch (error: any) {
      console.error('Error moving patient to ward:', error);
      showAlert('warning', 'Patient service created, but failed to assign ward bed.', 'Ward Assignment');
    }
  };

  const submitPatientSurgery = async () => {
    if (!hasActiveAdmission.value) {
      showAlert('error', 'Patient has no active admission. Please create an admission first.', 'Error');
      return;
    }

    const isValid = validateForm(formData.value, {
      surgeryTime: [rules.required()],
      endTime: [rules.required()],
      surgeryId: [rules.requiredPositiveId('Please select a surgery')],
      operationTheatreId: [rules.requiredPositiveId('Please select an operation theatre')],
    });

    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const response = await patientSurgeryService.addPatientSurgery({
        surgeryTime: formData.value.surgeryTime,
        endTime: formData.value.endTime,
        duration: calculatedDuration.value,
        status: 'Scheduled',
        notes: formData.value.notes,
        surgeryId: Number(formData.value.surgeryId),
        operationTheatreId: Number(formData.value.operationTheatreId),
        admissionId: Number(selectedAdmissionId.value),
      });

      if (response.isSuccess) {
        showAlert('success', 'Patient service created successfully. Surgery has been scheduled in Operation Theatre.', 'Success');
        await movePatientToWard();
        await loadPatientSurgeries();
        showCreateForm.value = false;
        resetForm();
      } else {
        showAlert('error', response.error || 'Failed to create patient service.', 'Error');
      }
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'An unexpected error occurred while creating the patient service.';
      showAlert('error', message, 'Error');
    } finally {
      isSubmitting.value = false;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    if (!minutes || minutes <= 0) return 'N/A';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getStatusClass = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'scheduled') return 'bg-primary/10 text-primary';
    if (s === 'ongoing') return 'bg-warning/10 text-warning';
    if (s === 'finished' || s === 'completed') return 'bg-success/10 text-success';
    if (s === 'cancelled') return 'bg-danger/10 text-danger';
    return 'bg-elevated text-bodydark';
  };

  onMounted(() => {
    loadPatientSurgeries();
  });
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-end mb-4">
      <BaseButton variant="primary" size="sm" @click="toggleCreateForm">
        {{ showCreateForm ? 'Cancel' : '+ Add New Surgery' }}
      </BaseButton>
    </div>

    <div v-if="showCreateForm" class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-6 mb-6">
      <h3 class="text-lg font-semibold text-emphasis mb-6">Create New Patient Surgery</h3>

      <div v-if="!hasActiveAdmission" class="bg-warning/10 text-warning p-4 rounded-lg mb-6">
        <p class="text-sm font-medium">This patient has no active admission. An admission is required before creating a surgery.</p>
        <p class="text-xs mt-1">Please create an admission for this patient first.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-bodydark dark:text-bodydark1 mb-2">Patient</label>
          <div class="rounded-lg border border-stroke dark:border-strokedark bg-elevated py-3 px-4 text-sm font-medium text-emphasis">Patient ID: #{{ props.patientId }}</div>
        </div>

        <BaseInput
          label="Surgery Start Time"
          type="datetime-local"
          v-model="formData.surgeryTime"
          :error="!!errors.surgeryTime"
          :error-message="errors.surgeryTime"
          field-required
          :disabled="!hasActiveAdmission"
          @change="validateField('surgeryTime', formData.surgeryTime, [rules.required()])"
        />

        <BaseInput
          label="Surgery End Time"
          type="datetime-local"
          v-model="formData.endTime"
          :error="!!errors.endTime"
          :error-message="errors.endTime"
          field-required
          :disabled="!hasActiveAdmission"
          @change="validateField('endTime', formData.endTime, [rules.required()])"
        />

        <!-- Auto-calculated Duration (read-only) -->
        <div>
          <label class="block text-sm font-medium text-bodydark dark:text-bodydark1 mb-2">Duration (auto-calculated)</label>
          <div class="rounded-lg border border-stroke dark:border-strokedark bg-elevated py-3 px-4 text-sm font-medium text-emphasis">
            {{ calculatedDuration > 0 ? formatDuration(calculatedDuration) : 'Select start and end time' }}
          </div>
          <p v-if="calculatedDuration > 0" class="text-xs text-bodydark dark:text-bodydark1 mt-1">{{ calculatedDuration }} minutes</p>
        </div>

        <!-- Status (read-only, default Scheduled) -->
        <div>
          <label class="block text-sm font-medium text-bodydark dark:text-bodydark1 mb-2">Status</label>
          <div class="rounded-lg border border-stroke dark:border-strokedark bg-primary/5 py-3 px-4 text-sm font-medium text-primary">Scheduled</div>
          <p class="text-xs text-bodydark dark:text-bodydark1 mt-1">Status can be changed from Operation Theatre module</p>
        </div>

        <BaseSelect
          label="Surgery"
          v-model="formData.surgeryId"
          :options="surgeryOptions"
          placeholder="Select a surgery..."
          :loading="loadingDropdowns"
          :error="!!errors.surgeryId"
          :error-message="errors.surgeryId"
          field-required
          :disabled="!hasActiveAdmission"
          display-key="name"
          value-key="id"
          @change="validateField('surgeryId', formData.surgeryId, [rules.requiredPositiveId('Please select a surgery')])"
        />

        <BaseSelect
          label="Operation Theatre"
          v-model="formData.operationTheatreId"
          :options="operationTheatreOptions"
          placeholder="Select an operation theatre..."
          :loading="loadingDropdowns"
          :error="!!errors.operationTheatreId"
          :error-message="errors.operationTheatreId"
          field-required
          :disabled="!hasActiveAdmission"
          display-key="name"
          value-key="id"
          @change="validateField('operationTheatreId', formData.operationTheatreId, [rules.requiredPositiveId('Please select an operation theatre')])"
        />

        <div class="md:col-span-2">
          <BaseTextArea label="Notes" v-model="formData.notes" placeholder="Enter surgery notes..." :rows="4" :disabled="!hasActiveAdmission" />
        </div>

        <div class="md:col-span-2 flex justify-end gap-3">
          <BaseButton variant="outline" size="md" @click="toggleCreateForm" :disabled="isSubmitting">Cancel</BaseButton>
          <BaseButton variant="primary" size="md" @click="submitPatientSurgery" :disabled="isSubmitting || !hasActiveAdmission">
            {{ isSubmitting ? 'Creating...' : 'Create Surgery' }}
          </BaseButton>
        </div>
      </div>
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="animate-pulse bg-surface rounded-xl p-6 border border-stroke dark:border-strokedark">
        <div class="flex items-center justify-between mb-4">
          <div class="h-4 bg-elevated rounded w-1/4"></div>
          <div class="h-8 bg-elevated rounded w-20"></div>
        </div>
        <div class="space-y-2">
          <div class="h-3 bg-elevated rounded w-3/4"></div>
          <div class="h-3 bg-elevated rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <div v-else-if="isEmpty" class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-12 text-center">
      <div class="text-4xl mb-3">🏥</div>
      <h3 class="text-xl font-semibold text-emphasis mb-2">No Patient Surgeries</h3>
      <p class="text-bodydark dark:text-bodydark1 mb-6 max-w-md mx-auto">This patient doesn't have any surgeries recorded yet. Create a new surgery to get started.</p>
      <BaseButton variant="primary" size="lg" @click="toggleCreateForm" v-if="!showCreateForm">+ Add New Surgery</BaseButton>
    </div>

    <div v-else class="space-y-4">
      <div v-for="surgery in patientSurgeries" :key="surgery.id" class="bg-surface rounded-xl border border-stroke dark:border-strokedark p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-lg font-semibold text-emphasis">{{ surgery.surgery?.name || 'Surgery' }}</h3>
              <span class="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                {{ surgery.operationTheatre?.name || 'N/A' }}
              </span>
              <!-- Status Badge -->
              <span :class="['px-3 py-1 text-xs font-semibold rounded-full', getStatusClass(surgery.status)]">
                {{ surgery.status || 'Scheduled' }}
              </span>
            </div>
            <div class="space-y-1">
              <p class="text-sm text-bodydark dark:text-bodydark1">
                <span class="font-medium">Start:</span>
                {{ formatDate(surgery.surgeryTime) }}
              </p>
              <p class="text-sm text-bodydark dark:text-bodydark1">
                <span class="font-medium">End:</span>
                {{ formatDate(surgery.endTime) }}
              </p>
              <p class="text-sm text-bodydark dark:text-bodydark1">
                <span class="font-medium">Duration:</span>
                {{ formatDuration(surgery.duration) }}
              </p>
              <p v-if="surgery.notes" class="text-sm text-bodydark dark:text-bodydark1 mt-2">
                <span class="font-medium">Notes:</span>
                {{ surgery.notes }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
