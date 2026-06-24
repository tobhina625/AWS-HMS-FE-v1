<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BaseCard from '@/components/Base/BaseCard.vue';
  import LoadingSkeleton from '@/components/UI/LoadingSkeleton.vue';
  import TreatmentServices from '@/services/Treatment/Treatment.services';
  import WardServices from '@/services/Ward/ward.services';
  import AdmissionServices from '@/services/Admission/Admission.services';
  import type { ITreatmentDetails, IPurchaseRecommendation } from '@/services/Treatment/Treatment.dto';

  const router = useRouter();
  const route = useRoute();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();
  const treatmentService = new TreatmentServices();
  const wardService = new WardServices();
  const admissionService = new AdmissionServices();

  const isSubmitting = ref(false);
  const isLoading = ref(true);
  const loadingDropdowns = ref(false);
  const wards = ref<{ id: number; name: string }[]>([]);
  const admissions = ref<{ id: number; name: string }[]>([]);

  const formData = ref({
    id: 0,
    bedNumber: 0,
    wardId: 0,
    admissionId: 0,
  });

  const treatmentDetails = ref<ITreatmentDetails[]>([]);
  const purchaseRecommendations = ref<IPurchaseRecommendation[]>([]);

  const loadWards = async () => {
    try {
      const response = await wardService.getWards('size=1000&page=0&isDeleted=false');
      const content = response.content || response.Content || [];
      wards.value = content.filter((item: any) => !item.isDeleted).map((item: any) => ({ id: item.id, name: item.name || `Ward #${item.id}` }));
    } catch {
      showAlert('error', 'Failed to load wards.', 'Error');
    }
  };

  const loadAdmissions = async () => {
    try {
      const response = await admissionService.getAdmissions('size=1000&page=0&isDeleted=false');
      const content = response.content || response.Content || [];
      admissions.value = content
        .filter((item: any) => !item.isDeleted)
        .map((item: any) => {
          const patientName = item.patientHistory?.patientName || 'Unknown';
          const admissionDate = item.admissionDate ? new Date(item.admissionDate).toLocaleDateString() : '-';
          return {
            id: item.id,
            name: `Patient: ${patientName} (${admissionDate})`,
          };
        });
    } catch {
      showAlert('error', 'Failed to load admissions.', 'Error');
    }
  };

  const loadDropdownData = async () => {
    loadingDropdowns.value = true;
    try {
      await Promise.all([loadWards(), loadAdmissions()]);
    } finally {
      loadingDropdowns.value = false;
    }
  };

  const loadDetails = async () => {
    isLoading.value = true;
    try {
      const response = await treatmentService.getTreatmentById(Number(route.params.id));
      if (response.data) {
        formData.value = {
          id: response.data.id,
          bedNumber: response.data.bedNumber,
          wardId: response.data.wardId,
          admissionId: response.data.admissionId,
        };
        treatmentDetails.value = response.data.treatmentDetails || [];
        purchaseRecommendations.value = response.data.purchaseRecommendations || [];
      }
    } catch {
      showAlert('error', 'Failed to load treatment details.', 'Error');
      router.push('/treatments');
    } finally {
      isLoading.value = false;
    }
  };

  const submitUpdate = async () => {
    const isValid = validateForm(formData.value, {
      bedNumber: [rules.required(), rules.minValue(1, 'Bed number must be at least 1')],
      wardId: [rules.requiredPositiveId('Please select a ward')],
      admissionId: [rules.requiredPositiveId('Please select an admission')],
    });

    if (!isValid) return;

    isSubmitting.value = true;
    try {
      const response = await treatmentService.updateTreatment({
        id: formData.value.id,
        bedNumber: Number(formData.value.bedNumber),
        wardId: Number(formData.value.wardId),
        admissionId: Number(formData.value.admissionId),
      });
      if (response.isSuccess) {
        showAlert('success', 'Treatment updated successfully.', 'Success');
        router.push('/treatments');
      } else {
        showAlert('error', response.error || 'Failed to update treatment.', 'Error');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to update treatment';
      showAlert('error', msg, 'Error');
    } finally {
      isSubmitting.value = false;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  onMounted(() => {
    Promise.all([loadDetails(), loadDropdownData()]);
  });
</script>

<template>
  <DefaultLayout>
    <div v-if="isLoading" class="space-y-6 max-w-5xl mx-auto">
      <LoadingSkeleton />
    </div>

    <FormViewTemplate
      v-else
      title="Edit Treatment"
      breadcrumb-title="Treatments"
      :breadcrumb-slug="`Treatment #${formData.id}`"
      :is-submitting="isSubmitting"
      @submit="submitUpdate"
      @cancel="router.back()"
    >
      <BaseInput
        label="Bed Number"
        type="number"
        v-model="formData.bedNumber"
        placeholder="1"
        :min="1"
        :error="!!errors.bedNumber"
        :error-message="errors.bedNumber"
        field-required
        @change="validateField('bedNumber', formData.bedNumber, [rules.required(), rules.minValue(1, 'Bed number must be at least 1')])"
      />

      <BaseSelect
        label="Ward"
        v-model="formData.wardId"
        :options="wards"
        placeholder="Select a ward..."
        :loading="loadingDropdowns"
        :error="!!errors.wardId"
        :error-message="errors.wardId"
        field-required
        display-key="name"
        value-key="id"
        @change="validateField('wardId', formData.wardId, [rules.requiredPositiveId('Please select a ward')])"
      />

      <BaseSelect
        label="Admission"
        v-model="formData.admissionId"
        :options="admissions"
        placeholder="Select an admission..."
        :loading="loadingDropdowns"
        :error="!!errors.admissionId"
        :error-message="errors.admissionId"
        field-required
        display-key="name"
        value-key="id"
        @change="validateField('admissionId', formData.admissionId, [rules.requiredPositiveId('Please select an admission')])"
      />

      <template #extra>
        <BaseCard class="md:col-span-3">
          <template #header>
            <h3 class="text-lg font-semibold text-emphasis">Treatment Details</h3>
          </template>

          <div v-if="treatmentDetails.length === 0" class="text-center py-8 text-gray-500">No treatment details available</div>

          <div v-else class="space-y-4">
            <div v-for="detail in treatmentDetails" :key="detail.id" class="border-b pb-4 last:border-0">
              <p class="font-medium">{{ detail.medicine }}</p>
              <p class="text-sm text-gray-600">{{ formatDate(detail.noteTime) }}</p>
              <p class="text-sm">{{ detail.notes }}</p>
              <span v-if="detail.isEmergencyTreatment" class="inline-block mt-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Emergency</span>
            </div>
          </div>
        </BaseCard>

        <BaseCard class="md:col-span-3">
          <template #header>
            <h3 class="text-lg font-semibold text-emphasis">Purchase Recommendations</h3>
          </template>

          <div v-if="purchaseRecommendations.length === 0" class="text-center py-8 text-gray-500">No purchase recommendations</div>

          <div v-else class="space-y-4">
            <div v-for="rec in purchaseRecommendations" :key="rec.id" class="border-b pb-4 last:border-0">
              <p class="font-medium">{{ rec.product }}</p>
              <p class="text-sm text-gray-600">Quantity: {{ rec.quantity }}</p>
              <p class="text-sm text-gray-600">{{ formatDate(rec.recommendationDate) }}</p>
            </div>
          </div>
        </BaseCard>
      </template>
    </FormViewTemplate>
  </DefaultLayout>
</template>
