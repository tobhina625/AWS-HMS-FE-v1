<script setup lang="ts">
  import { ref } from 'vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BaseModal from '@/components/Base/BaseModal.vue';
  import PlusIcon from '@/assets/images/SVGs/PlusIcon.svg';
  import TrashDetailedIcon from '@/assets/images/SVGs/TrashDetailedIcon.svg';
  import { useFormValidation } from '@/composables/useFormValidation';

  const props = defineProps<{
    isOpen: boolean;
    isSubmitting?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'submit', vitals: any, medicines: any[]): void;
  }>();

  const { errors, rules, validateForm } = useFormValidation();

  const ROUTE_OPTIONS = [
    { value: 'Oral', label: 'Oral' },
    { value: 'IV', label: 'IV (Intravenous)' },
    { value: 'IM', label: 'IM (Intramuscular)' },
    { value: 'SC', label: 'SC (Subcutaneous)' },
    { value: 'Topical', label: 'Topical' },
    { value: 'Inhaled', label: 'Inhaled' },
    { value: 'Other', label: 'Other' },
  ];

  const FREQUENCY_OPTIONS = [
    { value: 'OD', label: 'OD (Once daily)' },
    { value: 'BD', label: 'BD (Twice daily)' },
    { value: 'TDS', label: 'TDS (Three times daily)' },
    { value: 'QDS', label: 'QDS (Four times daily)' },
    { value: 'SOS', label: 'SOS (If necessary)' },
    { value: 'PRN', label: 'PRN (As needed)' },
    { value: 'Stat', label: 'Stat (Immediately)' },
    { value: 'Other', label: 'Other' },
  ];

  const vitals = ref({
    temperature: 0,
    pulseRate: 0,
    respirationRate: 0,
    bloodPressureSystolic: 0,
    bloodPressureDiastolic: 0,
    oxygenSaturation: 97,
    weight: 0,
    notes: '',
    isEmergency: false,
  });

  const defaultMedicine = () => ({
    medicine: '',
    dosageInstructions: '',
    route: '',
    frequency: '',
    doctorInstructions: '',
    isEmergencyTreatment: false,
  });

  const medicines = ref<any[]>([defaultMedicine()]);

  const addMedicineRow = () => {
    medicines.value.push(defaultMedicine());
  };

  const removeMedicineRow = (index: number) => {
    if (medicines.value.length > 1) {
      medicines.value.splice(index, 1);
    }
  };

  const handleSubmit = () => {
    // Validate vitals
    const vitalsValid = validateForm(vitals.value, {
      temperature: [rules.required(), rules.minValue(30, 'Temp too low'), rules.maxValue(45, 'Temp too high')],
      pulseRate: [rules.required(), rules.minValue(30, 'Pulse too low'), rules.maxValue(200, 'Pulse too high')],
      respirationRate: [rules.required(), rules.minValue(8, 'RR too low'), rules.maxValue(60, 'RR too high')],
      bloodPressureSystolic: [rules.required(), rules.minValue(50, 'Sys BP too low'), rules.maxValue(250, 'Sys BP too high')],
      bloodPressureDiastolic: [rules.required(), rules.minValue(30, 'Dia BP too low'), rules.maxValue(150, 'Dia BP too high')],
      oxygenSaturation: [rules.required(), rules.minValue(50, 'SpO2 too low'), rules.maxValue(100, 'SpO2 too high')],
    });

    if (!vitalsValid) return;

    // Validate medicines
    let medicinesValid = true;
    medicines.value.forEach((med) => {
      if (!med.medicine || !med.dosageInstructions || !med.route || !med.frequency) {
        medicinesValid = false;
      }
    });

    if (!medicinesValid) {
      // You could show a toast here or set some error state
      alert('Please fill all required medicine fields (Name, Dose, Route, Frequency).');
      return;
    }

    emit('submit', vitals.value, medicines.value);
  };

  const handleClose = () => {
    if (props.isSubmitting) return;

    // Reset form
    vitals.value = {
      temperature: 0,
      pulseRate: 0,
      respirationRate: 0,
      bloodPressureSystolic: 0,
      bloodPressureDiastolic: 0,
      oxygenSaturation: 97,
      weight: 0,
      notes: '',
      isEmergency: false,
    };
    medicines.value = [defaultMedicine()];

    emit('close');
  };
</script>

<template>
  <BaseModal :show="isOpen" title="Record Treatment Session" size="xl" @close="handleClose">
    <div class="space-y-8 py-2">
      <!-- STEP 1: VITALS -->
      <section>
        <div class="flex items-center justify-between mb-4 border-b border-stroke pb-2">
          <h3 class="text-lg font-bold text-emphasis">Step 1: Patient Vitals</h3>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="vitals.isEmergency" class="form-checkbox h-4 w-4 text-red-500 rounded border-stroke" />
            <span class="text-sm font-medium text-red-600">Emergency Session</span>
          </label>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <BaseInput label="Temp (°C) [30-45]" type="number" v-model="vitals.temperature" placeholder="30 - 45" field-required :error="!!errors.temperature" :error-message="errors.temperature" />

          <BaseInput label="Pulse (bpm) [30-200]" type="number" v-model="vitals.pulseRate" placeholder="30 - 200" field-required :error="!!errors.pulseRate" :error-message="errors.pulseRate" />

          <BaseInput
            label="Resp Rate (bpm) [8-60]"
            type="number"
            v-model="vitals.respirationRate"
            placeholder="8 - 60"
            field-required
            :error="!!errors.respirationRate"
            :error-message="errors.respirationRate"
          />

          <BaseInput
            label="BP Systolic (mmHg) [50-250]"
            type="number"
            v-model="vitals.bloodPressureSystolic"
            placeholder="50 - 250"
            field-required
            :error="!!errors.bloodPressureSystolic"
            :error-message="errors.bloodPressureSystolic"
          />

          <BaseInput
            label="BP Diastolic (mmHg) [30-150]"
            type="number"
            v-model="vitals.bloodPressureDiastolic"
            placeholder="30 - 150"
            field-required
            :error="!!errors.bloodPressureDiastolic"
            :error-message="errors.bloodPressureDiastolic"
          />

          <BaseInput
            label="SpO2 (%) [50-100]"
            type="number"
            v-model="vitals.oxygenSaturation"
            placeholder="50 - 100"
            field-required
            :error="!!errors.oxygenSaturation"
            :error-message="errors.oxygenSaturation"
          />
        </div>
        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput label="Weight (kg) - Optional" type="number" placeholder="e.g. 70" v-model="vitals.weight" />
          <BaseInput label="Notes - Optional" placeholder="Any extra observations..." v-model="vitals.notes" />
        </div>
      </section>

      <!-- STEP 2: MEDICINES -->
      <section>
        <div class="flex items-center justify-between mb-4 border-b border-stroke pb-2">
          <h3 class="text-lg font-bold text-emphasis">Step 2: Administered Medicines</h3>
          <BaseButton variant="outline" size="sm" @click="addMedicineRow">
            <PlusIcon class="w-4 h-4 mr-1" />
            Add Medicine
          </BaseButton>
        </div>

        <div class="space-y-4">
          <div v-for="(med, idx) in medicines" :key="idx" class="bg-gray-50 dark:bg-meta-4 rounded p-4 border border-stroke dark:border-strokedark relative">
            <button v-if="medicines.length > 1" @click="removeMedicineRow(idx)" class="absolute top-2 right-2 text-danger hover:bg-danger/10 p-1 rounded transition-colors" title="Remove medicine">
              <TrashDetailedIcon class="w-5 h-5" />
            </button>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pr-8">
              <BaseInput label="Medicine Name" v-model="med.medicine" placeholder="e.g. Paracetamol" field-required />
              <BaseInput label="Dose" v-model="med.dosageInstructions" placeholder="e.g. 500mg" field-required />
              <BaseSelect label="Route" v-model="med.route" :options="ROUTE_OPTIONS" placeholder="Select Route" field-required display-key="label" value-key="value" />
              <BaseSelect label="Frequency" v-model="med.frequency" :options="FREQUENCY_OPTIONS" placeholder="Select Freq" field-required display-key="label" value-key="value" />
            </div>

            <div class="mt-4">
              <BaseInput label="Additional Instructions (Optional)" v-model="med.doctorInstructions" placeholder="e.g. After meal" />
            </div>
          </div>
        </div>
      </section>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <BaseButton variant="outline" @click="handleClose" :disabled="isSubmitting">Cancel</BaseButton>
        <BaseButton variant="primary" @click="handleSubmit" :loading="isSubmitting">Save Treatment Session</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
