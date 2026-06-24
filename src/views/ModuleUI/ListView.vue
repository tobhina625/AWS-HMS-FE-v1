<script setup lang="ts">
  import TrashBinIcon from '@/assets/images/SVGs/TrashBinIcon.svg';
  import PlusSimpleIcon from '@/assets/images/SVGs/PlusSimpleIcon.svg';
  import LockIcon from '@/assets/images/SVGs/LockIcon.svg';
  import EyeIcon from '@/assets/images/SVGs/EyeIcon.svg';

  import { ref, onMounted } from 'vue';
  import router from '@/router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseModal from '@/components/Base/BaseModal.vue';
  import useAlert from '@/plugins/alert/useAlert';
  import ModuleServices from '@/services/Module/Module.services';
  import { useConfirm } from '@/composables/useConfirm';

  const { showAlert } = useAlert();
  const { confirm } = useConfirm();
  const moduleService = new ModuleServices();
  const modules = ref<any[]>([]);
  const loading = ref(false);
  const viewModule = ref<any | null>(null);
  const showViewModal = ref(false);

  const loadModules = async () => {
    loading.value = true;
    try {
      const response = await moduleService.getAllModules();
      if (response.isSuccess) {
        modules.value = response.data;
      }
    } catch {
      showAlert('error', 'Failed to load modules', 'Error');
    } finally {
      loading.value = false;
    }
  };

  const handleView = (module: any) => {
    viewModule.value = module;
    showViewModal.value = true;
  };

  const handleEdit = (module: any) => {
    router.push(`/modules/edit/${module.id}`);
  };

  const handleDelete = async (module: any) => {
    const confirmed = await confirm({
      title: 'Delete Module',
      message: `Are you sure you want to delete module "${module.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (confirmed) {
      try {
        const response = await moduleService.deleteModule(module.id);
        if (response.isSuccess) {
          showAlert('success', 'Module deleted successfully', 'Success');
          await loadModules();
        } else {
          showAlert('error', response.error, 'Error');
        }
      } catch {
        showAlert('error', 'Failed to delete module', 'Error');
      }
    }
  };

  const handleAddNew = () => {
    router.push('/modules/add');
  };

  onMounted(async () => {
    await loadModules();
  });
</script>

<template>
  <DefaultLayout>
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-title-md2 font-bold text-emphasis">Modules Management</h2>
      <BaseButton @click="handleAddNew">
        <PlusSimpleIcon class="w-5 h-5 mr-2" />
        Add Module
      </BaseButton>
    </div>

    <div class="rounded-sm border border-stroke bg-surface shadow-default dark:border-strokedark">
      <div class="max-w-full overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray text-left dark:bg-meta-4">
              <th class="min-w-[220px] py-4 px-4 font-medium text-emphasis xl:pl-11">Module Name</th>
              <th class="min-w-[150px] py-4 px-4 font-medium text-emphasis">Description</th>
              <th class="min-w-[120px] py-4 px-4 font-medium text-emphasis">Icon</th>
              <th class="min-w-[120px] py-4 px-4 font-medium text-emphasis">Route</th>
              <th class="min-w-[100px] py-4 px-4 font-medium text-emphasis text-center">Display Order</th>
              <th class="min-w-[100px] py-4 px-4 font-medium text-emphasis text-center">Status</th>
              <th class="py-4 px-4 font-medium text-emphasis text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-8">
                <div class="flex justify-center items-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </td>
            </tr>
            <tr v-else-if="modules.length === 0">
              <td colspan="7" class="text-center py-8 text-bodydark">No modules found</td>
            </tr>
            <tr v-else v-for="module in modules" :key="module.id" class="border-b border-stroke dark:border-strokedark">
              <td class="py-5 px-4 pl-9 xl:pl-11">
                <h5 class="font-medium text-emphasis">{{ module.name }}</h5>
              </td>
              <td class="py-5 px-4">
                <p class="text-sm text-emphasis">{{ module.description || '-' }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-sm text-emphasis">{{ module.icon || '-' }}</p>
              </td>
              <td class="py-5 px-4">
                <p class="text-sm text-emphasis">{{ module.route || '-' }}</p>
              </td>
              <td class="py-5 px-4 text-center">
                <span class="text-sm font-medium">{{ module.displayOrder }}</span>
              </td>
              <td class="py-5 px-4 text-center">
                <span v-if="module.isActive" class="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">Active</span>
                <span v-else class="inline-flex rounded-full bg-danger bg-opacity-10 py-1 px-3 text-sm font-medium text-danger">Inactive</span>
              </td>
              <td class="py-5 px-4">
                <div class="flex items-center justify-center space-x-3.5">
                  <BaseButton variant="ghost" size="sm" @click="handleView(module)" class="!p-1 hover:text-primary" title="View">
                    <EyeIcon class="fill-current" />
                  </BaseButton>
                  <BaseButton variant="ghost" size="sm" @click="handleEdit(module)" class="!p-1 hover:text-primary" title="Edit">
                    <LockIcon class="fill-current" />
                  </BaseButton>
                  <BaseButton variant="ghost" size="sm" @click="handleDelete(module)" class="!p-1 hover:text-danger" title="Delete">
                    <TrashBinIcon class="fill-current" />
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BaseModal :show="showViewModal" title="Module Details" size="md" @close="showViewModal = false">
      <div v-if="viewModule" class="space-y-4">
        <div>
          <label class="text-xs font-semibold uppercase tracking-wider text-muted">Module Name</label>
          <p class="mt-1 text-sm font-medium text-emphasis">{{ viewModule.name }}</p>
        </div>
        <div>
          <label class="text-xs font-semibold uppercase tracking-wider text-muted">Description</label>
          <p class="mt-1 text-sm font-medium text-emphasis">{{ viewModule.description || '-' }}</p>
        </div>
        <div>
          <label class="text-xs font-semibold uppercase tracking-wider text-muted">Icon</label>
          <p class="mt-1 text-sm font-medium text-emphasis">{{ viewModule.icon || '-' }}</p>
        </div>
        <div>
          <label class="text-xs font-semibold uppercase tracking-wider text-muted">Route</label>
          <p class="mt-1 text-sm font-medium text-emphasis">{{ viewModule.route || '-' }}</p>
        </div>
        <div>
          <label class="text-xs font-semibold uppercase tracking-wider text-muted">Display Order</label>
          <p class="mt-1 text-sm font-medium text-emphasis">{{ viewModule.displayOrder }}</p>
        </div>
        <div>
          <label class="text-xs font-semibold uppercase tracking-wider text-muted">Status</label>
          <p class="mt-1">
            <span v-if="viewModule.isActive" class="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">Active</span>
            <span v-else class="inline-flex rounded-full bg-danger bg-opacity-10 py-1 px-3 text-sm font-medium text-danger">Inactive</span>
          </p>
        </div>
      </div>
      <template #footer>
        <BaseButton @click="showViewModal = false">Close</BaseButton>
      </template>
    </BaseModal>
  </DefaultLayout>
</template>
