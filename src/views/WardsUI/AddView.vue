<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import { useFormValidation } from '@/composables/useFormValidation';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseRadio from '@/components/Base/BaseRadio.vue';
  import WardsServices from '@/services/Ward/ward.services';
  import DepartmentsServices from '@/services/Department/Department.services';
  import { STATUS_OPTIONS } from '@/constants/statusOptions';
  import type { IBedGenerationConfig } from '@/services/Ward/ward.interface';

  const router = useRouter();
  const { showAlert } = useAlert();
  const { errors, rules, validateField, validateForm } = useFormValidation();

  const wardService = new WardsServices();
  const departmentService = new DepartmentsServices();

  const isSubmitting = ref(false);
  const departments = ref<any[]>([]);
  const deptPage = ref(0);
  const hasMoreDepts = ref(true);
  const currentStep = ref(1);

  const formData = ref({
    name: '',
    noOfBeds: '',
    noOfOxygenSlots: '',
    status: 'Active',
    description: '',
    location: '',
    departmentId: '',
  });

  const bedConfig = ref<IBedGenerationConfig>({
    namingType: 'numeric',
    prefix: '',
    startNumber: 1,
    oxygenDistribution: 'first_n',
    oxygenFromBed: 1,
    oxygenToBed: 1,
    customOxygenBeds: [],
  });

  const fetchDepartments = async (reset = false) => {
    if (reset) {
      deptPage.value = 0;
      departments.value = [];
      hasMoreDepts.value = true;
    }
    const response = await departmentService.getDepartments(`page=${deptPage.value}&size=10`);
    departments.value.push(...(response.content || []));
    hasMoreDepts.value = !response.last;
    deptPage.value++;
  };

  const positiveNumberRule = { validate: (v: any) => !v || (Number(v) > 0 && Number(v) <= 1000) || 'Must be greater than 0' };

  const generateBeds = () => {
    const beds = [];
    const totalBeds = Number(formData.value.noOfBeds);
    const oxygenSlots = Number(formData.value.noOfOxygenSlots);

    for (let i = 0; i < totalBeds; i++) {
      const bedNum = bedConfig.value.startNumber + i;
      const bedNumber = bedConfig.value.namingType === 'prefix' ? `${bedConfig.value.prefix}${bedNum}` : `${bedNum}`;

      let hasOxygen = false;
      if (bedConfig.value.oxygenDistribution === 'first_n') {
        hasOxygen = i < oxygenSlots;
      } else if (bedConfig.value.oxygenDistribution === 'range') {
        hasOxygen = bedNum >= (bedConfig.value.oxygenFromBed || 0) && bedNum <= (bedConfig.value.oxygenToBed || 0);
      } else if (bedConfig.value.oxygenDistribution === 'custom') {
        hasOxygen = bedConfig.value.customOxygenBeds?.includes(bedNum) || false;
      }

      beds.push({
        bedNumber,
        hasOxygen,
        status: 'Available',
        oxygenInUse: false,
        notes: '',
      });
    }
    return beds;
  };

  const previewBeds = computed(() => {
    const beds = generateBeds();
    if (beds.length <= 10) return beds;
    return [...beds.slice(0, 5), ...beds.slice(-5)];
  });

  const bedsWithOxygenCount = computed(() => {
    return generateBeds().filter((b) => b.hasOxygen).length;
  });

  const proceedToStep2 = () => {
    const isValid = validateForm(formData.value, {
      name: [rules.required(), rules.name()],
      noOfBeds: [rules.required(), positiveNumberRule],
      noOfOxygenSlots: [rules.required(), positiveNumberRule],
      departmentId: [rules.required('Department assignment is required')],
    });

    if (!isValid) return;

    const oxygenSlots = Number(formData.value.noOfOxygenSlots);
    const totalBeds = Number(formData.value.noOfBeds);

    if (oxygenSlots > totalBeds) {
      showAlert('error', 'Oxygen slots cannot exceed total bed count', 'Validation Error');
      return;
    }

    bedConfig.value.oxygenToBed = bedConfig.value.startNumber + oxygenSlots - 1;
    currentStep.value = 2;
  };

  const goBackToStep1 = () => {
    currentStep.value = 1;
  };

  const submitWard = async () => {
    isSubmitting.value = true;
    try {
      const payload = {
        name: formData.value.name,
        noOfBeds: Number(formData.value.noOfBeds),
        noOfOxygenSlots: Number(formData.value.noOfOxygenSlots),
        status: formData.value.status,
        description: formData.value.description || undefined,
        location: formData.value.location || undefined,
        department: { id: Number(formData.value.departmentId) },
      };

      const response = await wardService.addWard(payload);
      if (response.isSuccess && response.data?.id) {
        const wardId = response.data.id;
        const beds = generateBeds();

        await wardService.addBulkBeds(wardId, beds);

        showAlert('success', `Ward and ${beds.length} beds created successfully.`, 'Registry Updated');
        router.push('/wards');
      }
    } catch {
      showAlert('error', 'Failed to create ward and beds', 'Error');
    } finally {
      isSubmitting.value = false;
    }
  };

  onMounted(() => {
    fetchDepartments();
  });
</script>

<template>
  <DefaultLayout>
    <div class="mx-auto max-w-7xl">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-emphasis">Add Facility Ward</h1>
        <div class="flex items-center gap-4 mt-4">
          <div class="flex items-center gap-2">
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold', currentStep >= 1 ? 'bg-primary text-white' : 'bg-elevated text-muted']">1</div>
            <span :class="['text-sm font-medium', currentStep >= 1 ? 'text-emphasis' : 'text-muted']">Ward Details</span>
          </div>
          <div class="flex-1 h-0.5 bg-stroke dark:bg-strokedark"></div>
          <div class="flex items-center gap-2">
            <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold', currentStep >= 2 ? 'bg-primary text-white' : 'bg-elevated text-muted']">2</div>
            <span :class="['text-sm font-medium', currentStep >= 2 ? 'text-emphasis' : 'text-muted']">Bed Configuration</span>
          </div>
        </div>
      </div>

      <div v-if="currentStep === 1" class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseInput
            label="Ward Name / Identifier"
            v-model="formData.name"
            placeholder="e.g. ICU South"
            :error="!!errors.name"
            :error-message="errors.name"
            field-required
            @change="validateField('name', formData.name, [rules.required(), rules.name()])"
          />

          <BaseSelect
            label="Parent Department"
            v-model="formData.departmentId"
            :options="departments"
            :has-more="hasMoreDepts"
            @load-more="fetchDepartments"
            placeholder="Assign to department..."
            :error="!!errors.departmentId"
            :error-message="errors.departmentId"
            field-required
          />

          <BaseInput
            label="Total Bed Capacity"
            type="number"
            v-model="formData.noOfBeds"
            placeholder="Enter count (min 1)"
            min="1"
            :error="!!errors.noOfBeds"
            :error-message="errors.noOfBeds"
            field-required
            class="[&_input::-webkit-inner-spin-button]:appearance-none [&_input::-webkit-outer-spin-button]:appearance-none [&_input::-webkit-inner-spin-button]:bg-transparent [&_input::-webkit-outer-spin-button]:bg-transparent dark:[&_input::-webkit-inner-spin-button]:bg-transparent dark:[&_input::-webkit-outer-spin-button]:bg-transparent"
            @change="validateField('noOfBeds', formData.noOfBeds, [rules.required(), positiveNumberRule])"
          />

          <BaseInput
            label="Oxygen Slots Availability"
            type="number"
            v-model="formData.noOfOxygenSlots"
            placeholder="Enter count (min 1)"
            min="1"
            :error="!!errors.noOfOxygenSlots"
            :error-message="errors.noOfOxygenSlots"
            field-required
            class="[&_input::-webkit-inner-spin-button]:appearance-none [&_input::-webkit-outer-spin-button]:appearance-none [&_input::-webkit-inner-spin-button]:bg-transparent [&_input::-webkit-outer-spin-button]:bg-transparent dark:[&_input::-webkit-inner-spin-button]:bg-transparent dark:[&_input::-webkit-outer-spin-button]:bg-transparent"
            @change="validateField('noOfOxygenSlots', formData.noOfOxygenSlots, [rules.required(), positiveNumberRule])"
          />

          <BaseSelect label="Ward Status" v-model="formData.status" :options="STATUS_OPTIONS.WARD" placeholder="Select status..." field-required />

          <BaseInput label="Location" v-model="formData.location" placeholder="e.g. Building A, Floor 3" :error="!!errors.location" :error-message="errors.location" class="md:col-span-2" />

          <BaseInput
            label="Description"
            v-model="formData.description"
            placeholder="Additional information about the ward"
            :error="!!errors.description"
            :error-message="errors.description"
            class="md:col-span-2"
          />
        </div>

        <div class="flex gap-3 mt-6 justify-end">
          <BaseButton variant="outline" @click="router.push('/wards')">Cancel</BaseButton>
          <BaseButton variant="primary" @click="proceedToStep2">Next: Configure Beds</BaseButton>
        </div>
      </div>

      <div v-if="currentStep === 2" class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-6">
        <div class="space-y-8">
          <div>
            <h3 class="text-lg font-semibold text-emphasis mb-4">Bed Naming Convention</h3>
            <div class="space-y-4">
              <BaseRadio v-model="bedConfig.namingType" value="numeric" label="Numeric only (1, 2, 3...)" name="namingType" id="naming-numeric" />
              <BaseRadio v-model="bedConfig.namingType" value="prefix" label="Prefix + Number (e.g., ICU-1, A-1)" name="namingType" id="naming-prefix" />

              <div v-if="bedConfig.namingType === 'prefix'" class="ml-7 space-y-3">
                <BaseInput label="Prefix" v-model="bedConfig.prefix" placeholder="e.g. ICU-, A-" />
              </div>

              <div class="ml-7">
                <BaseInput label="Starting Number" type="number" v-model.number="bedConfig.startNumber" placeholder="1" min="1" />
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-emphasis mb-4">Oxygen Distribution</h3>
            <p class="text-sm text-muted mb-4">{{ formData.noOfOxygenSlots }} beds will have oxygen supply</p>
            <div class="space-y-4">
              <BaseRadio v-model="bedConfig.oxygenDistribution" value="first_n" :label="`First ${formData.noOfOxygenSlots} beds`" name="oxygenDistribution" id="oxygen-first" />
              <BaseRadio v-model="bedConfig.oxygenDistribution" value="range" label="Specific range" name="oxygenDistribution" id="oxygen-range" />

              <div v-if="bedConfig.oxygenDistribution === 'range'" class="ml-7 grid grid-cols-2 gap-4">
                <BaseInput label="From Bed Number" type="number" v-model.number="bedConfig.oxygenFromBed" placeholder="1" min="1" />
                <BaseInput label="To Bed Number" type="number" v-model.number="bedConfig.oxygenToBed" placeholder="20" min="1" />
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-semibold text-emphasis mb-4">Preview</h3>
            <div class="bg-elevated rounded-lg p-4 mb-4">
              <p class="text-sm text-emphasis">
                <span class="font-semibold">{{ formData.noOfBeds }}</span>
                beds will be created,
                <span class="font-semibold text-primary">{{ bedsWithOxygenCount }}</span>
                with oxygen supply
              </p>
            </div>

            <div class="space-y-2">
              <p class="text-sm font-medium text-muted mb-3">Sample beds:</p>
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <div v-for="(bed, idx) in previewBeds" :key="idx" class="border border-stroke dark:border-strokedark rounded-lg p-3 text-center">
                  <p class="font-semibold text-emphasis">{{ bed.bedNumber }}</p>
                  <p v-if="bed.hasOxygen" class="text-xs text-primary mt-1">With Oxygen</p>
                  <p v-else class="text-xs text-muted mt-1">No Oxygen</p>
                </div>
              </div>
              <p v-if="Number(formData.noOfBeds) > 10" class="text-xs text-muted text-center mt-2">Showing first 5 and last 5 beds</p>
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-6 justify-end">
          <BaseButton variant="outline" @click="goBackToStep1">Back</BaseButton>
          <BaseButton variant="outline" @click="router.push('/wards')">Cancel</BaseButton>
          <BaseButton variant="primary" :loading="isSubmitting" @click="submitWard">Create Ward & Beds</BaseButton>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
