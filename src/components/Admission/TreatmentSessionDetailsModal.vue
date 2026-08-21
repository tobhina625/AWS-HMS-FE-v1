<script setup lang="ts">
  import BaseModal from '@/components/Base/BaseModal.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';

  //const props = defineProps<{
  //isOpen: boolean;
  //session: any;
  //}>();

  const emit = defineEmits<{
    (e: 'close'): void;
  }>();
</script>

<template>
  <BaseModal :show="isOpen" :title="'Treatment Session #' + (session?.id || '')" size="lg" @close="emit('close')">
    <div v-if="session" class="space-y-6 py-2">
      <!-- Vitals Section -->
      <div v-if="session.vitalRecord" class="p-4 bg-elevated/30 rounded-lg border border-stroke dark:border-strokedark">
        <h4 class="text-sm font-semibold text-emphasis mb-3 uppercase tracking-wider">Patient Vitals</h4>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <span class="block text-xs text-bodydark dark:text-bodydark1">Temp (°C)</span>
            <span class="font-medium text-emphasis">{{ session.vitalRecord.temperature || '-' }}</span>
          </div>
          <div>
            <span class="block text-xs text-bodydark dark:text-bodydark1">Pulse (bpm)</span>
            <span class="font-medium text-emphasis">{{ session.vitalRecord.pulseRate || '-' }}</span>
          </div>
          <div>
            <span class="block text-xs text-bodydark dark:text-bodydark1">Resp Rate (bpm)</span>
            <span class="font-medium text-emphasis">{{ session.vitalRecord.respirationRate || '-' }}</span>
          </div>
          <div>
            <span class="block text-xs text-bodydark dark:text-bodydark1">BP Systolic</span>
            <span class="font-medium text-emphasis">{{ session.vitalRecord.bloodPressureSystolic || '-' }}</span>
          </div>
          <div>
            <span class="block text-xs text-bodydark dark:text-bodydark1">BP Diastolic</span>
            <span class="font-medium text-emphasis">{{ session.vitalRecord.bloodPressureDiastolic || '-' }}</span>
          </div>
          <div>
            <span class="block text-xs text-bodydark dark:text-bodydark1">SpO2 (%)</span>
            <span class="font-medium text-emphasis">{{ session.vitalRecord.oxygenSaturation || '-' }}</span>
          </div>
          <div class="col-span-2 sm:col-span-3 mt-2" v-if="session.vitalRecord.notes">
            <span class="block text-xs text-bodydark dark:text-bodydark1">Notes</span>
            <span class="text-sm text-emphasis">{{ session.vitalRecord.notes }}</span>
          </div>
        </div>
      </div>
      <div v-else class="p-4 bg-elevated/30 rounded-lg border border-stroke dark:border-strokedark text-center text-sm text-bodydark">No vitals recorded for this session.</div>

      <!-- Medicines Section -->
      <div>
        <h4 class="text-sm font-semibold text-emphasis mb-3 uppercase tracking-wider">Administered Medicines</h4>
        <div v-if="session.treatmentDetails && session.treatmentDetails.length > 0" class="overflow-x-auto rounded-lg border border-stroke dark:border-strokedark">
          <table class="w-full">
            <thead class="bg-elevated/30">
              <tr>
                <th class="text-left py-3 px-4 text-xs font-semibold text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">Medicine</th>
                <th class="text-left py-3 px-4 text-xs font-semibold text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">Dose & Route</th>
                <th class="text-left py-3 px-4 text-xs font-semibold text-bodydark dark:text-bodydark1 border-b border-stroke dark:border-strokedark">Frequency</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stroke dark:divide-strokedark">
              <tr v-for="med in session.treatmentDetails" :key="med.id" class="hover:bg-elevated/50">
                <td class="py-3 px-4">
                  <div class="font-medium text-emphasis">{{ med.medicine }}</div>
                  <div v-if="med.doctorInstructions" class="text-xs text-bodydark mt-0.5">{{ med.doctorInstructions }}</div>
                </td>
                <td class="py-3 px-4">
                  <div class="text-sm text-emphasis">{{ med.dosageInstructions }}</div>
                  <div class="text-xs text-bodydark mt-0.5">{{ med.route }}</div>
                </td>
                <td class="py-3 px-4 text-sm text-emphasis">{{ med.frequency }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="p-8 bg-elevated/30 rounded-lg border border-stroke dark:border-strokedark text-center text-sm text-bodydark">No medicines recorded for this session.</div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end w-full">
        <BaseButton variant="primary" @click="emit('close')">Close</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
