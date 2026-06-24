// PatientHistoryAdd.vue
<template>
  <div class="rounded-sm border border-stroke bg-surface shadow-default dark:border-strokedark">
    <div class="flex flex-col gap-5.5 p-6.5">
      <!-- Visit Date Picker and Advice Admission in one row -->
      <div class="flex flex-col sm:flex-row gap-4">
        <BaseInput label="Visit Date" v-model="form.visitDate" placeholder="mm/dd/yyyy" class="flex-1 datepicker" />

        <BaseSelectNative
          label="Is Emergency"
          v-model="form.isEmergency"
          :options="[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]"
          class="flex-1"
        />
      </div>

      <div class="flex gap-6">
        <BaseInput label="Admission" v-model="form.admissions" placeholder="Admission No" class="w-full md:w-1/2" />

        <BaseInput label="Patient Lab Test" v-model="form.patientLabTest" placeholder="e.g., Complete Blood Count (CBC)" class="w-full md:w-1/2" />
      </div>

      <div class="flex gap-4">
        <BaseTextarea label="Notes" v-model="form.notes" placeholder="Enter remarks or additional details" class="w-full md:w-1/2" :rows="4" />

        <BaseTextarea label="Advice Admission" v-model="form.adviceAdmission" placeholder="Provide recommendations or advice" class="w-full md:w-1/2" :rows="4" />
      </div>

      <BaseTextarea label="Prescription" v-model="form.prescription" :rows="4" placeholder="Enter prescribed treatments or medication plan" />

      <div class="flex gap-4 mt-4">
        <BaseButton class="w-full" @click="handleSubmit">ADD</BaseButton>
        <BaseButton variant="secondary" class="w-full" @click="form = { notes: '', isEmergency: '', visitDate: '', adviceAdmission: '', admissions: '', patientLabTest: '', prescription: '' }">
          Cancel
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  /// <reference lib="dom" />
  import { ref, onMounted } from 'vue';
  import BaseInput from '../Base/BaseInput.vue';
  import BaseSelectNative from '../Base/BaseSelectNative.vue';
  import BaseTextarea from '../Base/BaseTextarea.vue';
  import BaseButton from '../Base/BaseButton.vue';
  import flatpickr from 'flatpickr';

  const form = ref({
    notes: '',
    isEmergency: '',
    visitDate: '',
    adviceAdmission: '',
    admissions: '',
    patientLabTest: '',
    prescription: '',
  });

  onMounted(() => {
    flatpickr('.datepicker', {
      mode: 'single',
      static: true,
      monthSelectorType: 'static',
      dateFormat: 'M j, Y',
      prevArrow: '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M5.4 10.8l1.4-1.4-4-4 4-4L5.4 0 0 5.4z" /></svg>',
      nextArrow: '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M1.4 10.8L0 9.4l4-4-4-4L1.4 0l5.4 5.4z" /></svg>',
    });
  });

  const handleSubmit = () => {
    if (!form.value.visitDate || !form.value.isEmergency) {
      alert('Visit Date and Is Emergency are required fields.');
      return;
    }
    alert('Patient history added successfully!');
    form.value = {
      notes: '',
      isEmergency: '',
      visitDate: '',
      adviceAdmission: '',
      admissions: '',
      patientLabTest: '',
      prescription: '',
    };
  };
</script>

<style scoped>
  .patient-history-add {
    max-width: 800px;
    margin: 0 auto;
    padding: 16px;
    border: 1px solid var(--color-border-light);
    border-radius: 8px;
    background-color: var(--color-bg-light);
  }

  textarea {
    min-height: 80px;
  }

  @media (max-width: 640px) {
    .patient-history-add {
      padding: 12px;
    }

    textarea {
      min-height: 60px;
    }
  }
</style>
