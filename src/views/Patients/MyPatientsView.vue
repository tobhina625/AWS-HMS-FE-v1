<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
    <div class="mb-6">
      <h2 class="text-title-md2 font-bold text-emphasis">My Patients</h2>
      <p class="text-sm text-muted mt-1">View all patients assigned to you</p>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-10">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="bg-danger-light border border-danger p-4 rounded-lg">
      <p class="text-danger">{{ error }}</p>
    </div>

    <div v-else class="rounded-sm border border-stroke bg-surface shadow-default dark:border-strokedark">
      <div class="px-4 py-6 md:px-6 xl:px-7.5">
        <h4 class="text-xl font-bold text-emphasis">Patient Histories ({{ patients.length }})</h4>
      </div>

      <div v-if="patients.length === 0" class="p-7 text-center text-muted">No patients found</div>

      <div v-else class="overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-elevated text-left">
              <th class="px-4 py-4 font-medium text-emphasis">Visit Date</th>
              <th class="px-4 py-4 font-medium text-emphasis">Patient</th>
              <th class="px-4 py-4 font-medium text-emphasis">Symptoms</th>
              <th class="px-4 py-4 font-medium text-emphasis">Disease</th>
              <th class="px-4 py-4 font-medium text-emphasis">Emergency</th>
              <th class="px-4 py-4 font-medium text-emphasis">Admission</th>
              <th class="px-4 py-4 font-medium text-emphasis">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="patientHistory in patients" :key="patientHistory.id" class="border-b border-stroke dark:border-strokedark">
              <td class="px-4 py-4">
                <p class="text-sm text-emphasis">
                  {{ formatDate(patientHistory.visitDate) }}
                </p>
              </td>
              <td class="px-4 py-4">
                <p class="text-sm font-medium text-emphasis">
                  {{ patientHistory.patient?.name || patientHistory.patient?.firstName + ' ' + patientHistory.patient?.lastName || 'N/A' }}
                </p>
              </td>
              <td class="px-4 py-4">
                <p class="text-sm text-emphasis">
                  {{ patientHistory.symptom || 'N/A' }}
                </p>
              </td>
              <td class="px-4 py-4">
                <p class="text-sm text-emphasis">
                  {{ patientHistory.disease?.name || 'N/A' }}
                </p>
              </td>
              <td class="px-4 py-4">
                <span class="inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium" :class="patientHistory.isEmergency ? 'bg-danger text-danger' : 'bg-success text-success'">
                  {{ patientHistory.isEmergency ? 'Yes' : 'No' }}
                </span>
              </td>
              <td class="px-4 py-4">
                <span class="inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium" :class="patientHistory.adviseAdmission ? 'bg-warning text-warning' : 'bg-success text-success'">
                  {{ patientHistory.adviseAdmission ? 'Advised' : 'Not Required' }}
                </span>
              </td>
              <td class="px-4 py-4">
                <BaseButton variant="ghost" @click="viewDetails(patientHistory)" class="!p-0 text-primary hover:underline text-sm">View Details</BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import { useUserProfile } from '@/composables/useUserProfile';

  const { loading, error, fetchMyPatients } = useUserProfile();
  const patients = ref<any[]>([]);

  const loadPatients = async () => {
    patients.value = await fetchMyPatients();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const viewDetails = (patientHistory: any) => {
    console.log('View details for:', patientHistory);
    // TODO: Navigate to patient details page or open modal
  };

  onMounted(() => {
    loadPatients();
  });
</script>
