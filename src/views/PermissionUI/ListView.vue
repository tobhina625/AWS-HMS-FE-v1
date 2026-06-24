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
  import PermissionServices from '@/services/Permissions/Permission.services';
  import { useConfirm } from '@/composables/useConfirm';

  const { showAlert } = useAlert();
  const { confirm } = useConfirm();
  const permissionService = new PermissionServices();
  const permissions = ref<any[]>([]);
  const loading = ref(false);
  const viewPermission = ref<any | null>(null);
  const showViewModal = ref(false);

  const loadPermissions = async () => {
    loading.value = true;
    try {
      const response = await permissionService.getAllPermissions();
      if (response.isSuccess) {
        permissions.value = response.data;
      }
    } catch {
      showAlert('error', 'Failed to load permissions', 'Error');
    } finally {
      loading.value = false;
    }
  };

  const handleView = (permission: any) => {
    viewPermission.value = permission;
    showViewModal.value = true;
  };

  const handleEdit = (permission: any) => {
    router.push(`/permissions/edit/${permission.id}`);
  };

  const handleDelete = async (permission: any) => {
    const confirmed = await confirm({
      title: 'Delete Permission',
      message: `Are you sure you want to delete permission for "${permission.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (confirmed) {
      try {
        const response = await permissionService.deletePermission(permission.id);
        if (response.isSuccess) {
          showAlert('success', 'Permission deleted successfully', 'Success');
          await loadPermissions();
        } else {
          showAlert('error', response.error, 'Error');
        }
      } catch {
        showAlert('error', 'Failed to delete permission', 'Error');
      }
    }
  };

  const handleAddNew = () => {
    router.push('/permissions/add');
  };

  onMounted(async () => {
    await loadPermissions();
  });
</script>

<template>
  <DefaultLayout>
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-title-md2 font-bold text-emphasis">Permissions Management</h2>
      <BaseButton @click="handleAddNew">
        <PlusSimpleIcon class="w-5 h-5 mr-2" />
        Add Permission
      </BaseButton>
    </div>

    <div class="rounded-sm border border-stroke bg-surface shadow-default dark:border-strokedark">
      <div class="max-w-full overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-elevated text-left">
              <th class="min-w-[220px] py-4 px-4 font-medium text-emphasis xl:pl-11">Module Name</th>
              <th class="min-w-[120px] py-4 px-4 font-medium text-emphasis text-center">Can Add</th>
              <th class="min-w-[120px] py-4 px-4 font-medium text-emphasis text-center">Can View</th>
              <th class="min-w-[120px] py-4 px-4 font-medium text-emphasis text-center">Can Edit</th>
              <th class="min-w-[120px] py-4 px-4 font-medium text-emphasis text-center">Can Delete</th>
              <th class="py-4 px-4 font-medium text-emphasis text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-8">
                <div class="flex justify-center items-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </td>
            </tr>
            <tr v-else-if="permissions.length === 0">
              <td colspan="6" class="text-center py-8 text-bodydark">No permissions found</td>
            </tr>
            <tr v-else v-for="permission in permissions" :key="permission.id" class="border-b border-stroke dark:border-strokedark">
              <td class="py-5 px-4 pl-9 xl:pl-11">
                <h5 class="font-medium text-emphasis">{{ permission.name }}</h5>
              </td>
              <td class="py-5 px-4 text-center">
                <span v-if="permission.isAdd" class="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">Yes</span>
                <span v-else class="inline-flex rounded-full bg-danger bg-opacity-10 py-1 px-3 text-sm font-medium text-danger">No</span>
              </td>
              <td class="py-5 px-4 text-center">
                <span v-if="permission.isView" class="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">Yes</span>
                <span v-else class="inline-flex rounded-full bg-danger bg-opacity-10 py-1 px-3 text-sm font-medium text-danger">No</span>
              </td>
              <td class="py-5 px-4 text-center">
                <span v-if="permission.isEdit" class="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">Yes</span>
                <span v-else class="inline-flex rounded-full bg-danger bg-opacity-10 py-1 px-3 text-sm font-medium text-danger">No</span>
              </td>
              <td class="py-5 px-4 text-center">
                <span v-if="permission.isDelete" class="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">Yes</span>
                <span v-else class="inline-flex rounded-full bg-danger bg-opacity-10 py-1 px-3 text-sm font-medium text-danger">No</span>
              </td>
              <td class="py-5 px-4">
                <div class="flex items-center justify-center space-x-3.5">
                  <BaseButton variant="ghost" size="sm" @click="handleView(permission)" class="!p-1 hover:text-primary" title="View">
                    <EyeIcon class="fill-current" />
                  </BaseButton>
                  <BaseButton variant="ghost" size="sm" @click="handleEdit(permission)" class="!p-1 hover:text-primary" title="Edit">
                    <LockIcon class="fill-current" />
                  </BaseButton>
                  <BaseButton variant="ghost" size="sm" @click="handleDelete(permission)" class="!p-1 hover:text-danger" title="Delete">
                    <TrashBinIcon class="fill-current" />
                  </BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BaseModal :show="showViewModal" title="Permission Details" size="md" @close="showViewModal = false">
      <div v-if="viewPermission" class="space-y-4">
        <div>
          <label class="text-xs font-semibold uppercase tracking-wider text-muted">Module Name</label>
          <p class="mt-1 text-sm font-medium text-emphasis">{{ viewPermission.name }}</p>
        </div>
        <div>
          <label class="text-xs font-semibold uppercase tracking-wider text-muted">Can Add</label>
          <p class="mt-1">
            <span v-if="viewPermission.isAdd" class="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">Yes</span>
            <span v-else class="inline-flex rounded-full bg-danger bg-opacity-10 py-1 px-3 text-sm font-medium text-danger">No</span>
          </p>
        </div>
        <div>
          <label class="text-xs font-semibold uppercase tracking-wider text-muted">Can View</label>
          <p class="mt-1">
            <span v-if="viewPermission.isView" class="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">Yes</span>
            <span v-else class="inline-flex rounded-full bg-danger bg-opacity-10 py-1 px-3 text-sm font-medium text-danger">No</span>
          </p>
        </div>
        <div>
          <label class="text-xs font-semibold uppercase tracking-wider text-muted">Can Edit</label>
          <p class="mt-1">
            <span v-if="viewPermission.isEdit" class="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">Yes</span>
            <span v-else class="inline-flex rounded-full bg-danger bg-opacity-10 py-1 px-3 text-sm font-medium text-danger">No</span>
          </p>
        </div>
        <div>
          <label class="text-xs font-semibold uppercase tracking-wider text-muted">Can Delete</label>
          <p class="mt-1">
            <span v-if="viewPermission.isDelete" class="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">Yes</span>
            <span v-else class="inline-flex rounded-full bg-danger bg-opacity-10 py-1 px-3 text-sm font-medium text-danger">No</span>
          </p>
        </div>
      </div>
      <template #footer>
        <BaseButton @click="showViewModal = false">Close</BaseButton>
      </template>
    </BaseModal>
  </DefaultLayout>
</template>
