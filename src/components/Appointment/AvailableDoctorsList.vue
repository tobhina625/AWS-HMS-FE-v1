<script setup lang="ts">
  import type { IAvailableDoctor } from '@/services/Appointment/appointment.interface';

  defineProps<{
    doctors: IAvailableDoctor[];
    loading?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'select', doctor: IAvailableDoctor): void;
  }>();
</script>

<template>
  <div class="space-y-2">
    <p v-if="loading" class="text-sm text-muted">Searching for available doctors…</p>
    <p v-else-if="doctors.length === 0" class="text-sm text-muted">No doctors are free for this department and time window.</p>
    <button
      v-for="d in doctors"
      :key="d.id"
      type="button"
      class="w-full rounded-md border border-stroke bg-surface px-4 py-3 text-left shadow-sm transition hover:border-primary dark:border-strokedark"
      @click="emit('select', d)"
    >
      <span class="font-semibold text-emphasis">{{ d.name }}</span>
      <span v-if="d.specialization" class="mt-0.5 block text-sm text-muted">{{ d.specialization }}</span>
      <span v-if="d.slotDurationMinutes" class="mt-1 block text-xs text-muted">Slot length: {{ d.slotDurationMinutes }} min</span>
    </button>
  </div>
</template>
