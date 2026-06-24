<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import AvailabilityServices from '@/services/Availability/Availability.services';
  import type { IEmployeeAvailabilityDetail, IAvailabilitySlot } from '@/services/Availability/Availability.dto';
  import useAlert from '@/plugins/alert/useAlert';
  import { usePermissions } from '@/composables/usePermissions';
  import { useConfirmDelete } from '@/composables/useConfirmDelete';

  import EditPencilIcon from '@/assets/images/SVGs/EditPencilIcon.svg';
  import TrashDetailedIcon from '@/assets/images/SVGs/TrashDetailedIcon.svg';
  import PlusIcon from '@/assets/images/SVGs/PlusIcon.svg';

  const route = useRoute();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { canEditModule, canDeleteFromModule, canAddToModule } = usePermissions();
  const { confirmDelete } = useConfirmDelete();

  const availabilityService = new AvailabilityServices();

  const loading = ref(true);
  const employeeAvailability = ref<IEmployeeAvailabilityDetail | null>(null);

  const employeeId = computed(() => route.params.id as string);

  const canEdit = computed(() => canEditModule('Availability'));
  const canDelete = computed(() => canDeleteFromModule('Availability'));
  const canAdd = computed(() => canAddToModule('Availability'));

  const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const groupedByDay = computed(() => {
    if (!employeeAvailability.value?.availabilities) return {};

    const groups: Record<string, IAvailabilitySlot[]> = {};
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (const slot of employeeAvailability.value.availabilities) {
      const rawDay = slot.dayOfWeek || 'Unspecified';
      const day = rawDay === 'Unspecified' ? rawDay : capitalizeFirst(rawDay);
      if (!groups[day]) {
        groups[day] = [];
      }
      groups[day].push(slot);
    }

    const sortedGroups: Record<string, IAvailabilitySlot[]> = {};
    for (const day of daysOrder) {
      if (groups[day]) {
        sortedGroups[day] = groups[day];
      }
    }
    if (groups['Unspecified']) {
      sortedGroups['Unspecified'] = groups['Unspecified'];
    }

    return sortedGroups;
  });

  const loadAvailabilityDetails = async () => {
    loading.value = true;
    try {
      const response = await availabilityService.getAvailabilitiesByEmployee(Number(employeeId.value));
      employeeAvailability.value = response;
    } catch (error) {
      console.error('Error loading availability details:', error);
      showAlert({ title: 'Error', message: 'Failed to load availability details', type: 'error' });
    } finally {
      loading.value = false;
    }
  };

  const handleEdit = (slot: IAvailabilitySlot) => {
    router.push(`/availability/edit/${slot.id}`);
  };

  const handleDelete = async (slot: IAvailabilitySlot) => {
    if (!canDelete.value) return;

    await confirmDelete({
      entityName: 'Availability Slot',
      itemName: `${slot.dayOfWeek || 'Slot'} (${slot.startTimeOfDay} - ${slot.endTimeOfDay})`,
      deleteAction: () => availabilityService.deleteAvailability(slot.id),
      onSuccess: () => loadAvailabilityDetails(),
    });
  };

  const handleAddNew = () => {
    router.push(`/availability/add?employeeId=${employeeId.value}`);
  };

  const handleBack = () => {
    router.push('/availability');
  };

  onMounted(async () => {
    await loadAvailabilityDetails();
  });
</script>

<template>
  <DefaultLayout>
    <div class="mx-auto max-w-7xl">
      <BreadcrumbDefault :pageTitle="`${employeeAvailability?.employeeName || 'Employee'} - Availability`" breadcrumbTitle="Availability" />

      <div class="mt-6"></div>

      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="employeeAvailability" class="space-y-6">
        <div class="bg-white dark:bg-boxdark rounded-xl shadow-card p-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 class="text-2xl font-bold text-black dark:text-white">
                {{ employeeAvailability.employeeName }}
              </h2>
              <p v-if="employeeAvailability.branchName" class="text-sm text-body dark:text-bodydark mt-1">Branch: {{ employeeAvailability.branchName }}</p>
              <p class="text-sm text-body dark:text-bodydark">{{ employeeAvailability.availabilities.length }} time slot(s) configured</p>
            </div>
            <div class="flex gap-3">
              <BaseButton variant="outline" @click="handleBack">Back to List</BaseButton>
              <BaseButton v-if="canAdd" @click="handleAddNew">
                <PlusIcon class="w-4 h-4 mr-2" />
                Add Slot
              </BaseButton>
            </div>
          </div>

          <div v-if="Object.keys(groupedByDay).length === 0" class="text-center py-12">
            <p class="text-body dark:text-bodydark mb-4">No availability slots configured for this employee.</p>
            <BaseButton v-if="canAdd" @click="handleAddNew">
              <PlusIcon class="w-4 h-4 mr-2" />
              Add First Slot
            </BaseButton>
          </div>

          <div v-else class="space-y-6">
            <div v-for="(slots, day) in groupedByDay" :key="day" class="border border-stroke dark:border-strokedark rounded-lg overflow-hidden">
              <div class="bg-gray-2 dark:bg-meta-4 px-4 py-3">
                <h3 class="font-semibold text-black dark:text-white">{{ day }}</h3>
              </div>
              <div class="divide-y divide-stroke dark:divide-strokedark">
                <div
                  v-for="slot in slots"
                  :key="slot.id"
                  class="px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-gray-1 dark:hover:bg-meta-4 transition-colors"
                >
                  <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                      <span class="text-lg font-medium text-black dark:text-white">
                        {{ slot.startTimeOfDay || '-' }}
                      </span>
                      <span class="text-body dark:text-bodydark">to</span>
                      <span class="text-lg font-medium text-black dark:text-white">
                        {{ slot.endTimeOfDay || '-' }}
                      </span>
                    </div>
                    <span :class="slot.isAvailable ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'" class="px-2 py-1 rounded text-xs font-medium">
                      {{ slot.isAvailable ? 'Available' : 'Unavailable' }}
                    </span>
                  </div>
                  <div class="flex gap-2">
                    <button v-if="canEdit" @click="handleEdit(slot)" class="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors" title="Edit">
                      <EditPencilIcon class="w-4 h-4" />
                    </button>
                    <button v-if="canDelete" @click="handleDelete(slot)" class="p-2 rounded-lg hover:bg-danger/10 text-danger transition-colors" title="Delete">
                      <TrashDetailedIcon class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20">
        <p class="text-body dark:text-bodydark mb-4">Employee availability not found.</p>
        <BaseButton @click="handleBack">Back to List</BaseButton>
      </div>
    </div>
  </DefaultLayout>
</template>
