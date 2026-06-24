<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseCard from '@/components/Base/BaseCard.vue';
  import StatusBadge from '@/components/UI/StatusBadge.vue';
  import SurgeryService from '@/services/Surgery/Surgery.services';
  import type { ISurgery } from '@/services/Surgery/Surgery.dto';
  import useAlert from '@/plugins/alert/useAlert';
  import { useConfirm } from '@/composables/useConfirm';
  import { usePermissions } from '@/composables/usePermissions';

  import KeyIcon from '@/assets/images/SVGs/KeyIcon.svg';
  import EditPencilIcon from '@/assets/images/SVGs/EditPencilIcon.svg';
  import TrashDetailedIcon from '@/assets/images/SVGs/TrashDetailedIcon.svg';
  import DotsHorizontalIcon from '@/assets/images/SVGs/DotsHorizontalIcon.svg';
  import MapPinLocationIcon from '@/assets/images/SVGs/MapPinLocationIcon.svg';
  import BuildingIcon from '@/assets/images/SVGs/Building.svg';
  import CheckCircleIcon from '@/assets/images/SVGs/CheckCircleIcon.svg';
  import ChartBarIcon from '@/assets/images/SVGs/ChartBarIcon.svg';
  import SurgeryIcon from '@/assets/images/SVGs/Surgery.svg';
  import ClockIcon from '@/assets/images/SVGs/ClockIcon.svg';

  const route = useRoute();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { confirm } = useConfirm();
  const { canDeleteFromModule } = usePermissions();
  const surgeryService = new SurgeryService();

  const pageTitle = ref('Surgery Profile');
  const currentTab = ref('about');
  const loading = ref(true);
  const surgeryId = ref<number>(0);
  const surgeryDetails = ref<ISurgery | null>(null);

  const canDelete = computed(() => canDeleteFromModule('Surgeries'));

  const loadSurgeryDetails = async () => {
    loading.value = true;
    try {
      surgeryId.value = Number(route.params.id);
      const response = await surgeryService.getSurgeryById(surgeryId.value);
      if (response?.data) {
        surgeryDetails.value = {
          ...response.data,
          department: response.data.department ? { id: response.data.department.id, name: response.data.department.name } : undefined,
        };
      }
    } catch (error) {
      console.error('Error loading surgery details:', error);
      showAlert('error', 'Failed to load surgery details.', 'Error');
    } finally {
      loading.value = false;
    }
  };

  const handleEdit = () => {
    router.push(`/surgery/edit/${surgeryId.value}`);
  };

  const handleBack = () => {
    router.push('/surgery');
  };

  const handleDelete = async () => {
    if (!canDelete.value) {
      showAlert('error', 'You do not have permission to delete surgeries.', 'Permission Denied');
      return;
    }
    const confirmed = await confirm({
      title: 'Delete Surgery',
      message: `Are you sure you want to delete ${surgeryDetails.value?.name}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed && surgeryDetails.value) {
      try {
        await surgeryService.deleteSurgeryById(surgeryDetails.value.id);
        showAlert('success', 'Surgery has been deleted successfully.', 'Success');
        router.push('/surgery');
      } catch {
        showAlert('error', 'An error occurred while deleting the surgery.', 'Error');
      }
    }
  };

  const setTab = (tab: string) => {
    currentTab.value = tab;
  };

  onMounted(() => {
    loadSurgeryDetails();
  });
</script>

<template>
  <DefaultLayout>
    <BreadcrumbDefault :pageTitle="pageTitle" />

    <!-- Loading State -->
    <div v-if="loading" class="animate-pulse space-y-6">
      <div class="bg-surface rounded-2xl p-6">
        <div class="flex items-center gap-6">
          <div class="w-32 h-32 bg-elevated rounded-xl"></div>
          <div class="flex-1 space-y-4">
            <div class="h-8 bg-elevated rounded w-1/3"></div>
            <div class="h-4 bg-elevated rounded w-1/4"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Surgery Profile Content -->
    <div v-else-if="surgeryDetails" class="space-y-6">
      <!-- Header Card -->
      <div class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark overflow-hidden">
        <div class="h-32 bg-gradient-to-r from-primary to-primary"></div>

        <div class="px-6 pb-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16">
            <div class="relative">
              <div class="w-32 h-32 rounded-2xl border-4 border-white dark:border-boxdark bg-elevated flex items-center justify-center shadow-lg">
                <SurgeryIcon class="w-16 h-16 text-primary" />
              </div>
            </div>

            <div class="flex-1 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4">
              <div>
                <h1 class="text-3xl font-bold text-emphasis mb-2">{{ surgeryDetails.name }}</h1>
                <div class="flex items-center gap-4 flex-wrap">
                  <StatusBadge :status="surgeryDetails.status" size="md" />
                  <span class="text-sm text-bodydark dark:text-bodydark1">{{ surgeryDetails.category || 'General' }}</span>
                  <span v-if="surgeryDetails.department" class="flex items-center gap-1 text-sm text-bodydark dark:text-bodydark1">
                    <BuildingIcon class="w-4 h-4" />
                    {{ surgeryDetails.department.name }}
                  </span>
                  <span v-if="surgeryDetails.location" class="flex items-center gap-1 text-sm text-bodydark dark:text-bodydark1">
                    <MapPinLocationIcon class="w-4 h-4" />
                    {{ surgeryDetails.location }}
                  </span>
                  <span class="text-sm text-bodydark dark:text-bodydark1">${{ surgeryDetails.cost || 0 }} · {{ surgeryDetails.duration || 0 }} mins</span>
                </div>
              </div>

              <div class="flex gap-3">
                <BaseButton variant="outline" size="md" @click="handleBack" class="border-2 border-stroke dark:border-strokedark text-emphasis hover:border-primary dark:hover:border-primary">
                  <KeyIcon class="w-4 h-4 mr-2" />
                  Back
                </BaseButton>
                <BaseButton v-if="canDelete" variant="danger" size="md" @click="handleDelete" class="!bg-danger !text-light hover:!bg-danger/90 border-2 border-danger">
                  <TrashDetailedIcon class="w-4 h-4 mr-2" />
                  Delete
                </BaseButton>
                <BaseButton variant="primary" size="md" @click="handleEdit">
                  <EditPencilIcon class="w-4 h-4 mr-2" />
                  Edit
                </BaseButton>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="mt-6 border-b border-stroke dark:border-strokedark">
            <nav class="flex gap-8">
              <BaseButton
                variant="ghost"
                @click="setTab('about')"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors',
                  currentTab === 'about' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">
                  <DotsHorizontalIcon class="w-5 h-5" />
                  About
                </div>
              </BaseButton>
              <BaseButton
                variant="ghost"
                @click="setTab('requirements')"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors',
                  currentTab === 'requirements' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">
                  <CheckCircleIcon class="w-5 h-5" />
                  Requirements
                </div>
              </BaseButton>
              <BaseButton
                variant="ghost"
                @click="setTab('statistics')"
                :class="[
                  '!rounded-none !px-1 !py-0 pb-4 border-b-2 font-medium text-sm transition-colors',
                  currentTab === 'statistics' ? 'border-primary text-primary' : 'border-transparent text-bodydark hover:text-emphasis dark:text-bodydark1',
                ]"
              >
                <div class="flex items-center gap-2">
                  <ChartBarIcon class="w-5 h-5" />
                  Statistics
                </div>
              </BaseButton>
            </nav>
          </div>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- About Tab -->
        <template v-if="currentTab === 'about'">
          <div class="lg:col-span-2 bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-6">
            <h2 class="text-xl font-semibold text-emphasis mb-6 flex items-center gap-2">
              <DotsHorizontalIcon class="w-6 h-6 text-primary" />
              Surgery Information
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-1">
                <label class="text-sm text-bodydark dark:text-bodydark1">Name</label>
                <p class="text-base font-medium text-emphasis">{{ surgeryDetails.name || 'N/A' }}</p>
              </div>

              <div class="space-y-1">
                <label class="text-sm text-bodydark dark:text-bodydark1">Status</label>
                <p class="text-base">
                  <StatusBadge :status="surgeryDetails.status" size="sm" />
                </p>
              </div>

              <div class="space-y-1">
                <label class="text-sm text-bodydark dark:text-bodydark1">Category</label>
                <p class="text-base font-medium text-emphasis">{{ surgeryDetails.category || 'General' }}</p>
              </div>

              <div class="space-y-1">
                <label class="text-sm text-bodydark dark:text-bodydark1">Cost</label>
                <p class="text-base font-medium text-emphasis">${{ surgeryDetails.cost ?? 0 }}</p>
              </div>

              <div class="space-y-1">
                <label class="text-sm text-bodydark dark:text-bodydark1">Duration</label>
                <p class="text-base font-medium text-emphasis">{{ surgeryDetails.duration ?? 0 }} minutes</p>
              </div>

              <div class="space-y-1">
                <label class="text-sm text-bodydark dark:text-bodydark1">Risk Level</label>
                <p class="text-base font-medium text-emphasis">{{ surgeryDetails.riskLevel || 'Not specified' }}</p>
              </div>

              <div class="space-y-1">
                <label class="text-sm text-bodydark dark:text-bodydark1">Department</label>
                <p class="text-base font-medium text-emphasis">{{ surgeryDetails.department?.name || 'Not Assigned' }}</p>
              </div>

              <div class="space-y-1">
                <label class="text-sm text-bodydark dark:text-bodydark1">Location</label>
                <p class="text-base font-medium text-emphasis">{{ surgeryDetails.location || 'N/A' }}</p>
              </div>

              <div class="space-y-1 md:col-span-2">
                <label class="text-sm text-bodydark dark:text-bodydark1">Description</label>
                <p class="text-base font-medium text-emphasis">{{ surgeryDetails.description || 'No description' }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-6">
              <h3 class="text-lg font-semibold text-emphasis mb-4 flex items-center gap-2">
                <ClockIcon class="w-5 h-5 text-primary" />
                Quick Stats
              </h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-3 bg-elevated rounded-lg">
                  <span class="text-sm text-bodydark dark:text-bodydark1">Cost</span>
                  <span class="text-sm font-medium text-emphasis">${{ surgeryDetails.cost ?? 0 }}</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-elevated rounded-lg">
                  <span class="text-sm text-bodydark dark:text-bodydark1">Duration</span>
                  <span class="text-sm font-medium text-emphasis">{{ surgeryDetails.duration ?? 0 }} mins</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-elevated rounded-lg">
                  <span class="text-sm text-bodydark dark:text-bodydark1">Total Procedures</span>
                  <span class="text-sm font-medium text-emphasis">{{ surgeryDetails.totalProcedures ?? 0 }}</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-elevated rounded-lg">
                  <span class="text-sm text-bodydark dark:text-bodydark1">Risk Level</span>
                  <span class="text-sm font-medium text-emphasis">{{ surgeryDetails.riskLevel || '-' }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Requirements Tab -->
        <div v-if="currentTab === 'requirements'" class="lg:col-span-3">
          <BaseCard>
            <template #header>
              <h3 class="text-lg font-semibold text-emphasis flex items-center gap-2">
                <CheckCircleIcon class="w-5 h-5 text-primary" />
                Medical Requirements
              </h3>
            </template>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="flex items-center justify-between p-4 bg-elevated rounded-xl border border-stroke dark:border-strokedark">
                <span class="text-sm text-bodydark dark:text-bodydark1">General Anesthesia</span>
                <span class="text-sm font-medium" :class="surgeryDetails.requiresGeneralAnesthesia ? 'text-success' : 'text-muted'">
                  {{ surgeryDetails.requiresGeneralAnesthesia ? 'Required' : 'Not Required' }}
                </span>
              </div>
              <div class="flex items-center justify-between p-4 bg-elevated rounded-xl border border-stroke dark:border-strokedark">
                <span class="text-sm text-bodydark dark:text-bodydark1">Blood Bank</span>
                <span class="text-sm font-medium" :class="surgeryDetails.requiresBloodBank ? 'text-success' : 'text-muted'">
                  {{ surgeryDetails.requiresBloodBank ? 'Required' : 'Not Required' }}
                </span>
              </div>
              <div class="flex items-center justify-between p-4 bg-elevated rounded-xl border border-stroke dark:border-strokedark">
                <span class="text-sm text-bodydark dark:text-bodydark1">ICU</span>
                <span class="text-sm font-medium" :class="surgeryDetails.requiresICU ? 'text-success' : 'text-muted'">
                  {{ surgeryDetails.requiresICU ? 'Required' : 'Not Required' }}
                </span>
              </div>
              <div class="flex items-center justify-between p-4 bg-elevated rounded-xl border border-stroke dark:border-strokedark">
                <span class="text-sm text-bodydark dark:text-bodydark1">Minimally Invasive</span>
                <span class="text-sm font-medium" :class="surgeryDetails.isMinimallyInvasive ? 'text-success' : 'text-muted'">
                  {{ surgeryDetails.isMinimallyInvasive ? 'Yes' : 'No' }}
                </span>
              </div>
            </div>
          </BaseCard>
        </div>

        <!-- Statistics Tab -->
        <div v-if="currentTab === 'statistics'" class="lg:col-span-3">
          <BaseCard>
            <template #header>
              <h3 class="text-lg font-semibold text-emphasis flex items-center gap-2">
                <ChartBarIcon class="w-5 h-5 text-primary" />
                Surgery Statistics
              </h3>
            </template>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="p-6 bg-elevated rounded-xl border border-stroke dark:border-strokedark">
                <p class="text-sm text-bodydark dark:text-bodydark1 mb-1">Total Procedures</p>
                <p class="text-2xl font-bold text-emphasis">{{ surgeryDetails.totalProcedures ?? 0 }}</p>
              </div>
              <div class="p-6 bg-elevated rounded-xl border border-stroke dark:border-strokedark">
                <p class="text-sm text-bodydark dark:text-bodydark1 mb-1">Cost</p>
                <p class="text-2xl font-bold text-emphasis">${{ surgeryDetails.cost ?? 0 }}</p>
              </div>
              <div class="p-6 bg-elevated rounded-xl border border-stroke dark:border-strokedark">
                <p class="text-sm text-bodydark dark:text-bodydark1 mb-1">Duration</p>
                <p class="text-2xl font-bold text-emphasis">{{ surgeryDetails.duration ?? 0 }} mins</p>
              </div>
              <div class="p-6 bg-elevated rounded-xl border border-stroke dark:border-strokedark">
                <p class="text-sm text-bodydark dark:text-bodydark1 mb-1">Status</p>
                <p class="text-base">
                  <StatusBadge :status="surgeryDetails.status" size="md" />
                </p>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-else class="text-center py-20">
      <SurgeryIcon class="w-24 h-24 mx-auto mb-4 text-muted opacity-50" />
      <h2 class="text-xl font-semibold text-emphasis mb-2">Surgery Not Found</h2>
      <p class="text-bodydark dark:text-bodydark1 mb-6">The surgery you're looking for does not exist or has been removed.</p>
      <BaseButton variant="primary" @click="handleBack">Back to List</BaseButton>
    </div>
  </DefaultLayout>
</template>
