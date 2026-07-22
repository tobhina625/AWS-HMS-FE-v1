<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  // import { ref, onMounted, computed } from 'vue';
  import { useRoute } from 'vue-router';
  // import { useRoute, useRouter } from 'vue-router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import useAlert from '@/plugins/alert/useAlert';
  import { useConfirm } from '@/composables/useConfirm';
  import PatientAllergyService from '@/services/PatientAllergy/PatientAllergy.services';
  import type { IPatientAllergy } from '@/services/PatientAllergy/PatientAllergy.interface';

  const route = useRoute();
  // const router = useRouter();
  const { showAlert } = useAlert();
  const { confirm } = useConfirm();
  const allergyService = new PatientAllergyService();

  const patientId = ref<number>(0);
  const allergies = ref<IPatientAllergy[]>([]);
  const loading = ref(true);
  const showAddModal = ref(false);
  const editingAllergy = ref<IPatientAllergy | null>(null);
  const submitting = ref(false);

  const severityColors: Record<string, string> = {
    Mild: 'bg-success/10 text-success',
    Moderate: 'bg-warning/10 text-warning',
    Severe: 'bg-danger/10 text-danger',
    'Life-Threatening': 'bg-danger/20 text-danger border border-danger/40',
  };

  const form = ref<IPatientAllergy>({
    patientId: 0,
    allergen: '',
    category: 'Drug',
    severity: 'Mild',
    reaction: '',
    status: 'Active',
    notes: '',
  });

  const resetForm = () => {
    form.value = { patientId: patientId.value, allergen: '', category: 'Drug', severity: 'Mild', reaction: '', status: 'Active', notes: '' };
    editingAllergy.value = null;
  };

  const loadAllergies = async () => {
    loading.value = true;
    try {
      allergies.value = await allergyService.getByPatientId(patientId.value);
    } catch {
      showAlert('error', 'Failed to load allergies.', 'Error');
    } finally {
      loading.value = false;
    }
  };

  const openAddModal = () => {
    resetForm();
    showAddModal.value = true;
  };

  const openEditModal = (allergy: IPatientAllergy) => {
    editingAllergy.value = allergy;
    form.value = { ...allergy };
    showAddModal.value = true;
  };

  const submitForm = async () => {
    if (!form.value.allergen.trim()) {
      showAlert('error', 'Allergen name is required.', 'Validation');
      return;
    }
    submitting.value = true;
    try {
      if (editingAllergy.value?.id) {
        await allergyService.update(editingAllergy.value.id, form.value);
        showAlert('success', 'Allergy updated successfully.', 'Success');
      } else {
        await allergyService.create({ ...form.value, patientId: patientId.value });
        showAlert('success', 'Allergy added successfully.', 'Success');
      }
      showAddModal.value = false;
      await loadAllergies();
    } catch {
      showAlert('error', 'Failed to save allergy.', 'Error');
    } finally {
      submitting.value = false;
    }
  };

  const deleteAllergy = async (allergy: IPatientAllergy) => {
    const confirmed = await confirm({
      title: 'Remove Allergy',
      message: `Remove allergy to "${allergy.allergen}"?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed && allergy.id) {
      try {
        await allergyService.delete(allergy.id);
        showAlert('success', 'Allergy removed.', 'Success');
        await loadAllergies();
      } catch {
        showAlert('error', 'Failed to remove allergy.', 'Error');
      }
    }
  };

  onMounted(async () => {
    patientId.value = Number(route.params.patientId || route.query.patientId);
    form.value.patientId = patientId.value;
    await loadAllergies();
  });
</script>

<template>
  <DefaultLayout>
    <BreadcrumbDefault pageTitle="Patient Allergies" />

    <div class="mt-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-emphasis">Allergy Registry</h2>
          <p class="text-sm text-bodydark dark:text-bodydark1 mt-1">Manage patient allergy records</p>
        </div>
        <BaseButton variant="primary" @click="openAddModal" id="add-allergy-btn">
          <span class="mr-2 text-lg">+</span>
          Add Allergy
        </BaseButton>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 3" :key="i" class="bg-surface rounded-xl p-5 border border-stroke dark:border-strokedark animate-pulse">
          <div class="h-5 bg-elevated rounded w-1/2 mb-3"></div>
          <div class="h-4 bg-elevated rounded w-3/4 mb-2"></div>
          <div class="h-4 bg-elevated rounded w-1/2"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!allergies.length" class="bg-surface rounded-2xl border border-stroke dark:border-strokedark p-16 text-center">
        <div class="text-6xl mb-4">🛡️</div>
        <h3 class="text-lg font-semibold text-emphasis mb-2">No Allergies Recorded</h3>
        <p class="text-bodydark dark:text-bodydark1 mb-6">No known allergies for this patient.</p>
        <BaseButton variant="primary" @click="openAddModal">Record First Allergy</BaseButton>
      </div>

      <!-- Allergy Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="allergy in allergies" :key="allergy.id" class="bg-surface rounded-xl border border-stroke dark:border-strokedark p-5 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h3 class="font-semibold text-emphasis text-base">{{ allergy.allergen }}</h3>
              <p class="text-sm text-bodydark dark:text-bodydark1">{{ allergy.category || 'Uncategorized' }}</p>
            </div>
            <span :class="['px-2 py-1 rounded-full text-xs font-medium', severityColors[allergy.severity || ''] || 'bg-elevated text-bodydark']">
              {{ allergy.severity || 'Unknown' }}
            </span>
          </div>

          <div class="space-y-2 text-sm mb-4">
            <div v-if="allergy.reaction">
              <span class="text-bodydark dark:text-bodydark1">Reaction:</span>
              <span class="text-emphasis">{{ allergy.reaction }}</span>
            </div>
            <div>
              <span class="text-bodydark dark:text-bodydark1">Status:</span>
              <span :class="allergy.status === 'Active' ? 'text-danger font-medium' : 'text-success'">{{ allergy.status }}</span>
            </div>
            <div v-if="allergy.notes" class="text-bodydark dark:text-bodydark1 italic text-xs">{{ allergy.notes }}</div>
          </div>

          <div class="flex gap-2 pt-3 border-t border-stroke dark:border-strokedark">
            <button @click="openEditModal(allergy)" class="flex-1 text-xs py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium">Edit</button>
            <button @click="deleteAllergy(allergy)" class="flex-1 text-xs py-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors font-medium">Remove</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showAddModal = false"></div>
        <div class="relative bg-white dark:bg-boxdark rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-[fadeIn_0.2s_ease]">
          <h3 class="text-xl font-bold text-emphasis mb-6">{{ editingAllergy ? 'Edit Allergy' : 'Add Allergy' }}</h3>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-emphasis mb-1">
                Allergen
                <span class="text-danger">*</span>
              </label>
              <input
                v-model="form.allergen"
                type="text"
                placeholder="e.g. Penicillin, Peanuts, Latex"
                class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-emphasis mb-1">Category</label>
                <select v-model="form.category" class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary">
                  <option>Drug</option>
                  <option>Food</option>
                  <option>Environmental</option>
                  <option>Insect</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-emphasis mb-1">Severity</label>
                <select v-model="form.severity" class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary">
                  <option>Mild</option>
                  <option>Moderate</option>
                  <option>Severe</option>
                  <option>Life-Threatening</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-emphasis mb-1">Reaction</label>
              <input
                v-model="form.reaction"
                type="text"
                placeholder="e.g. Rash, Anaphylaxis, Hives"
                class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-emphasis mb-1">Status</label>
              <select v-model="form.status" class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary">
                <option>Active</option>
                <option>Inactive</option>
                <option>Resolved</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-emphasis mb-1">Notes</label>
              <textarea
                v-model="form.notes"
                rows="2"
                placeholder="Additional notes..."
                class="w-full border border-stroke dark:border-strokedark rounded-lg px-4 py-2.5 bg-transparent text-emphasis focus:outline-none focus:border-primary resize-none"
              ></textarea>
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <BaseButton variant="outline" class="flex-1" @click="showAddModal = false" :disabled="submitting">Cancel</BaseButton>
            <BaseButton variant="primary" class="flex-1" @click="submitForm" :loading="submitting">
              {{ editingAllergy ? 'Save Changes' : 'Add Allergy' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </DefaultLayout>
</template>
