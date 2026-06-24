<script setup lang="ts">
  import CheckCircleIcon from '@/assets/images/SVGs/CheckCircleIcon.svg';
  import ArchiveBoxIcon from '@/assets/images/SVGs/ArchiveBoxIcon.svg';
  import HomeHouseIcon from '@/assets/images/SVGs/HomeHouseIcon.svg';
  import PlusSimpleIcon from '@/assets/images/SVGs/PlusSimpleIcon.svg';
  import KeyIcon from '@/assets/images/SVGs/KeyIcon.svg';
  import BellNotificationIcon from '@/assets/images/SVGs/BellNotificationIcon.svg';
  import LinkIcon from '@/assets/images/SVGs/LinkIcon.svg';
  import UserIcon from '@/assets/images/SVGs/UserIcon.svg';

  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseTextArea from '@/components/Base/BaseTextArea.vue';
  import BaseCheckbox from '@/components/Base/BaseCheckbox.vue';
  import BaseSelectNative from '@/components/Base/BaseSelectNative.vue';
  import WardServices from '@/services/Ward/ward.services';
  import type { IWard, IWardBed } from '@/services/Ward/ward.interface';
  import { useConfirm } from '@/composables/useConfirm';

  const route = useRoute();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { confirm } = useConfirm();
  const wardService = new WardServices();

  const loading = ref(true);
  const ward = ref<IWard | null>(null);
  const beds = ref<IWardBed[]>([]);
  const showAddBedModal = ref(false);
  const showAssignModal = ref(false);
  const selectedBed = ref<IWardBed | null>(null);
  const editingBedId = ref<number | null>(null);
  const savingBedId = ref<number | null>(null);

  const editForm = ref({
    bedNumber: '',
    status: 'Available',
    hasOxygen: false,
    notes: '',
  });

  const BED_STATUS_OPTIONS = [
    { value: 'Available', label: 'Available' },
    { value: 'UnderMaintenance', label: 'Under Maintenance' },
    { value: 'Reserved', label: 'Reserved' },
  ];

  const newBed = ref({
    bedNumber: '',
    hasOxygen: false,
    notes: '',
  });

  const assignData = ref({
    patientId: '',
    oxygenRequired: false,
  });

  const availableBedsCount = computed(() => beds.value.filter((b) => b.status === 'Available').length);
  const occupiedBedsCount = computed(() => beds.value.filter((b) => b.status === 'Occupied').length);
  const maintenanceBedsCount = computed(() => beds.value.filter((b) => b.status === 'UnderMaintenance').length);

  const loadWardDetails = async () => {
    loading.value = true;
    try {
      const wardId = route.params.id as string;
      const [wardResponse, bedsResponse] = await Promise.all([wardService.getWardById(wardId), wardService.getWardBeds(Number(wardId))]);

      if (wardResponse?.data) {
        ward.value = wardResponse.data;
      }

      if (bedsResponse?.data) {
        beds.value = bedsResponse.data;
      }
    } catch {
      showAlert('error', 'Failed to load ward details', 'Error');
    } finally {
      loading.value = false;
    }
  };

  const getBedStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-success-light text-success';
      case 'Occupied':
        return 'bg-primary-light text-primary';
      case 'UnderMaintenance':
        return 'bg-warning-light text-warning';
      case 'Reserved':
        return 'bg-secondary-light text-secondary';
      default:
        return 'bg-elevated text-muted';
    }
  };

  const handleAddBed = async () => {
    if (!newBed.value.bedNumber || !ward.value) return;

    try {
      const payload = {
        bedNumber: newBed.value.bedNumber,
        hasOxygen: newBed.value.hasOxygen,
        status: 'Available',
        notes: newBed.value.notes || undefined,
      };

      await wardService.addBedToWard(ward.value.id, payload);
      showAlert('success', 'Bed added successfully', 'Success');
      showAddBedModal.value = false;
      newBed.value = { bedNumber: '', hasOxygen: false, notes: '' };
      await loadWardDetails();
    } catch {
      showAlert('error', 'Failed to add bed', 'Error');
    }
  };

  const handleAssignBed = async () => {
    if (!assignData.value.patientId || !selectedBed.value) return;

    try {
      await wardService.assignBedToPatient(selectedBed.value.id, Number(assignData.value.patientId));
      showAlert('success', 'Bed assigned to patient successfully', 'Success');
      showAssignModal.value = false;
      selectedBed.value = null;
      assignData.value = { patientId: '', oxygenRequired: false };
      await loadWardDetails();
    } catch {
      showAlert('error', 'Failed to assign bed', 'Error');
    }
  };

  const handleReleaseBed = async (bed: IWardBed) => {
    const confirmed = await confirm({
      title: 'Release Bed',
      message: `Are you sure you want to release bed ${bed.bedNumber}? The patient will be unassigned from this bed.`,
      confirmText: 'Release',
      cancelText: 'Cancel',
      variant: 'warning',
    });

    if (!confirmed) return;

    try {
      await wardService.releaseBed(bed.id);
      showAlert('success', 'Bed released successfully', 'Success');
      await loadWardDetails();
    } catch {
      showAlert('error', 'Failed to release bed', 'Error');
    }
  };

  const openAssignModal = (bed: IWardBed) => {
    selectedBed.value = bed;
    showAssignModal.value = true;
  };

  const startEditBed = (bed: IWardBed) => {
    editingBedId.value = bed.id;
    editForm.value = {
      bedNumber: bed.bedNumber,
      status: bed.status === 'Occupied' ? 'Available' : bed.status,
      hasOxygen: bed.hasOxygen,
      notes: bed.notes || '',
    };
  };

  const cancelEditBed = () => {
    editingBedId.value = null;
  };

  const saveBedEdit = async () => {
    if (!editingBedId.value || !ward.value) return;
    if (!editForm.value.bedNumber.trim()) {
      showAlert('warning', 'Bed number is required', 'Validation');
      return;
    }

    savingBedId.value = editingBedId.value;
    try {
      const payload = {
        bedNumber: editForm.value.bedNumber.trim(),
        wardId: ward.value.id,
        wardName: ward.value.name,
        status: editForm.value.status,
        hasOxygen: editForm.value.hasOxygen,
        oxygenInUse: false,
        currentPatientId: null,
        occupiedSince: null,
        notes: editForm.value.notes || undefined,
      };
      await wardService.updateBed(editingBedId.value, payload);
      showAlert('success', 'Bed updated successfully', 'Success');
      cancelEditBed();
      await loadWardDetails();
    } catch {
      showAlert('error', 'Failed to update bed', 'Error');
    } finally {
      savingBedId.value = null;
    }
  };

  onMounted(() => {
    loadWardDetails();
  });
</script>

<template>
  <DefaultLayout>
    <div class="mx-auto max-w-7xl">
      <div v-if="loading" class="animate-pulse space-y-4">
        <div class="h-8 bg-elevated rounded w-1/3"></div>
        <div class="h-64 bg-elevated rounded"></div>
      </div>

      <div v-else-if="ward">
        <div class="mb-6 flex items-center justify-between">
          <div>
            <BaseButton variant="ghost" @click="router.back()" class="mb-4">
              <KeyIcon class="w-5 h-5" />
              Back to Wards
            </BaseButton>
            <h1 class="text-3xl font-bold text-emphasis">{{ ward.name }} - Bed Management</h1>
            <p class="text-muted mt-2">{{ ward.location || 'Location not specified' }}</p>
          </div>
          <BaseButton variant="primary" @click="showAddBedModal = true">
            <PlusSimpleIcon class="w-5 h-5" />
            Add Bed Test
          </BaseButton>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-surface rounded-2xl shadow-sm p-6 border border-stroke dark:border-strokedark">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted mb-1">Total Beds</p>
                <p class="text-3xl font-bold text-emphasis">{{ beds.length }}</p>
              </div>
              <div class="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                <HomeHouseIcon class="w-6 h-6 text-primary dark:text-primary-light" />
              </div>
            </div>
          </div>

          <div class="bg-surface rounded-2xl shadow-sm p-6 border border-stroke dark:border-strokedark">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted mb-1">Available</p>
                <p class="text-3xl font-bold text-success">{{ availableBedsCount }}</p>
              </div>
              <div class="w-12 h-12 rounded-full bg-success-light flex items-center justify-center">
                <CheckCircleIcon class="w-6 h-6 text-success" />
              </div>
            </div>
          </div>

          <div class="bg-surface rounded-2xl shadow-sm p-6 border border-stroke dark:border-strokedark">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted mb-1">Occupied</p>
                <p class="text-3xl font-bold text-primary">{{ occupiedBedsCount }}</p>
              </div>
              <div class="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                <UserIcon class="w-6 h-6 text-primary dark:text-primary-light" />
              </div>
            </div>
          </div>

          <div class="bg-surface rounded-2xl shadow-sm p-6 border border-stroke dark:border-strokedark">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted mb-1">Maintenance</p>
                <p class="text-3xl font-bold text-warning">{{ maintenanceBedsCount }}</p>
              </div>
              <div class="w-12 h-12 rounded-full bg-warning-light flex items-center justify-center">
                <LinkIcon class="w-6 h-6 text-warning" />
              </div>
            </div>
          </div>
        </div>

        <div class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-6">
          <h2 class="text-xl font-semibold text-emphasis mb-6">Beds</h2>

          <div v-if="beds.length === 0" class="text-center py-12">
            <ArchiveBoxIcon class="w-16 h-16 mx-auto text-muted mb-4" />
            <p class="text-muted">No beds added yet. Click "Add Bed" to get started.</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="bed in beds" :key="bed.id" class="border border-stroke dark:border-strokedark rounded-xl p-4 hover:shadow-md transition-all">
              <!-- Inline Edit Form -->
              <template v-if="editingBedId === bed.id">
                <h3 class="font-semibold text-emphasis text-lg mb-4">Edit Bed</h3>
                <div class="space-y-3">
                  <BaseInput v-model="editForm.bedNumber" label="Bed Number" placeholder="e.g. 101, A-1" field-required />
                  <BaseSelectNative v-model="editForm.status" label="Status" :options="BED_STATUS_OPTIONS" />
                  <BaseCheckbox v-model="editForm.hasOxygen" label="Has Oxygen" :id="`edit-oxygen-${bed.id}`" />
                  <BaseTextArea v-model="editForm.notes" label="Notes" :rows="2" placeholder="Additional notes..." />
                </div>
                <div class="flex gap-2 mt-4">
                  <BaseButton variant="outline" size="sm" @click="cancelEditBed" class="flex-1">Cancel</BaseButton>
                  <BaseButton variant="primary" size="sm" :loading="savingBedId === bed.id" :disabled="!editForm.bedNumber.trim()" @click="saveBedEdit" class="flex-1">Save</BaseButton>
                </div>
              </template>

              <!-- View Mode -->
              <template v-else>
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <h3 class="font-semibold text-emphasis text-lg">Bed {{ bed.bedNumber }}</h3>
                    <span :class="['inline-block px-2 py-1 rounded-full text-xs font-medium mt-2', getBedStatusColor(bed.status)]">
                      {{ bed.status }}
                    </span>
                  </div>
                  <div v-if="bed.hasOxygen" class="flex items-center gap-1 text-primary" title="Oxygen Available">
                    <BellNotificationIcon class="w-5 h-5" />
                  </div>
                </div>

                <div v-if="bed.status === 'Occupied' && bed.currentPatientName" class="mb-3 p-3 bg-elevated rounded-lg">
                  <p class="text-xs text-muted mb-1">Patient:</p>
                  <p class="font-medium text-emphasis">{{ bed.currentPatientName }}</p>
                  <p v-if="bed.occupiedSince" class="text-xs text-muted mt-1">Since: {{ new Date(bed.occupiedSince).toLocaleDateString() }}</p>
                </div>

                <div v-if="bed.notes" class="mb-3">
                  <p class="text-xs text-muted italic">{{ bed.notes }}</p>
                </div>

                <div class="flex flex-wrap gap-2 mt-4">
                  <BaseButton v-if="bed.status === 'Available'" variant="primary" size="sm" @click="openAssignModal(bed)" class="flex-1">Assign</BaseButton>
                  <BaseButton v-if="bed.status === 'Occupied'" variant="success" size="sm" @click="handleReleaseBed(bed)" class="flex-1">Release</BaseButton>
                  <BaseButton v-if="bed.status !== 'Occupied'" variant="secondary" size="sm" @click="startEditBed(bed)">Edit</BaseButton>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Add Bed Modal -->
        <div v-if="showAddBedModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-surface rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 class="text-xl font-semibold text-emphasis mb-4">Add New Bed</h3>

            <div class="space-y-4">
              <BaseInput v-model="newBed.bedNumber" label="Bed Number" placeholder="e.g. 101, A-1" field-required />
              <BaseCheckbox v-model="newBed.hasOxygen" label="Has Oxygen Supply" id="hasOxygen" />
              <BaseTextArea v-model="newBed.notes" label="Notes" :rows="3" placeholder="Additional notes..." />
            </div>

            <div class="flex gap-3 mt-6">
              <BaseButton variant="outline" @click="showAddBedModal = false" class="flex-1">Cancel</BaseButton>
              <BaseButton variant="primary" :disabled="!newBed.bedNumber" @click="handleAddBed" class="flex-1">Add Bed</BaseButton>
            </div>
          </div>
        </div>

        <!-- Assign Bed Modal -->
        <div v-if="showAssignModal && selectedBed" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-surface rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 class="text-xl font-semibold text-emphasis mb-4">Assign Bed {{ selectedBed.bedNumber }}</h3>

            <div class="space-y-4">
              <BaseInput v-model="assignData.patientId" label="Patient ID" type="number" placeholder="Enter patient ID" field-required />
              <BaseCheckbox v-if="selectedBed.hasOxygen" v-model="assignData.oxygenRequired" label="Patient requires oxygen" id="oxygenRequired" />
            </div>

            <div class="flex gap-3 mt-6">
              <BaseButton
                variant="outline"
                @click="
                  showAssignModal = false;
                  selectedBed = null;
                "
                class="flex-1"
              >
                Cancel
              </BaseButton>
              <BaseButton variant="primary" :disabled="!assignData.patientId" @click="handleAssignBed" class="flex-1">Assign</BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
