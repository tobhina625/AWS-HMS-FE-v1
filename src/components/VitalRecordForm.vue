<template>
  <div class="vital-record-form">
    <h3 class="text-lg font-semibold mb-4">Record Vitals</h3>
    <form @submit.prevent="submitForm" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Temperature (°C)</label>
        <input v-model="form.temperature" type="number" step="0.1" required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Pulse Rate (bpm)</label>
        <input v-model="form.pulseRate" type="number" required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Respiration Rate</label>
        <input v-model="form.respirationRate" type="number" required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Systolic BP</label>
        <input v-model="form.bloodPressureSystolic" type="number" required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Diastolic BP</label>
        <input v-model="form.bloodPressureDiastolic" type="number" required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Oxygen Saturation (%)</label>
        <input v-model="form.oxygenSaturation" type="number" step="0.1" required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Weight (kg)</label>
        <input v-model="form.weight" type="number" step="0.1"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div class="flex items-center">
        <input v-model="form.isEmergency" type="checkbox"
          class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
        <label class="ml-2 block text-sm text-gray-900">Emergency Treatment</label>
      </div>
      <div class="md:col-span-3">
        <label class="block text-sm font-medium text-gray-700">Notes</label>
        <textarea v-model="form.notes" rows="2"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
      </div>
      <div class="md:col-span-3 flex justify-end space-x-3">
        <button type="button" @click="resetForm"
          class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Reset
        </button>
        <button type="submit" :disabled="submitting"
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
          {{ submitting ? 'Saving...' : 'Save Vitals' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import VitalServices from '@/services/Vitals/Vital.services';

const vitalService = new VitalServices();

export default {
  name: 'VitalRecordForm',
  props: {
    admissionId: { type: Number, required: true }
  },
  data() {
    return {
      submitting: false,
      form: {
        temperature: '', pulseRate: '', respirationRate: '',
        bloodPressureSystolic: '', bloodPressureDiastolic: '',
        oxygenSaturation: '', weight: '', notes: '', isEmergency: false
      }
    };
  },
  methods: {
    resetForm() {
      this.form = {
        temperature: '', pulseRate: '', respirationRate: '',
        bloodPressureSystolic: '', bloodPressureDiastolic: '',
        oxygenSaturation: '', weight: '', notes: '', isEmergency: false
      };
    },
    async submitForm() {
      this.submitting = true;
      try {
        const payload = {
          ...this.form,
          temperature: parseFloat(this.form.temperature),
          pulseRate: parseInt(this.form.pulseRate),
          respirationRate: parseInt(this.form.respirationRate),
          bloodPressureSystolic: parseInt(this.form.bloodPressureSystolic),
          bloodPressureDiastolic: parseInt(this.form.bloodPressureDiastolic),
          oxygenSaturation: parseFloat(this.form.oxygenSaturation),
          weight: this.form.weight ? parseFloat(this.form.weight) : null,
          recordedAt: new Date().toISOString()
        };
        await vitalService.addVitalRecord(this.admissionId, payload);
        this.$emit('saved');
        this.resetForm();
      } catch (error) {
        console.error('Error saving vitals:', error);
        alert('Failed to save vitals. Please try again.');
      } finally {
        this.submitting = false;
      }
    }
  }
};
</script>

</script>