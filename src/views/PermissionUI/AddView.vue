<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BaseCheckbox from '@/components/Base/BaseCheckbox.vue';
  import PermissionServices from '@/services/Permissions/Permission.services';
  import ModuleServices from '@/services/Module/Module.services';

  const router = useRouter();
  const { showAlert } = useAlert();
  const permissionService = new PermissionServices();
  const moduleService = new ModuleServices();

  const isSubmitting = ref(false);
  const modules = ref<any[]>([]);
  const formData = ref({
    moduleId: 0,
    canAdd: false,
    canView: false,
    canEdit: false,
    canDelete: false,
  });

  const loadModules = async () => {
    try {
      const response = await moduleService.getAllModules();
      if (response.isSuccess) {
        modules.value = response.data.map((m: any) => ({ id: m.id, name: m.name }));
      }
    } catch {
      showAlert('error', 'Failed to load modules', 'Error');
    }
  };

  const submitPermission = async () => {
    if (formData.value.moduleId <= 0) {
      showAlert('error', 'Please select a module', 'Validation Error');
      return;
    }

    isSubmitting.value = true;
    try {
      const response = await permissionService.addPermission(formData.value);
      if (response.isSuccess) {
        showAlert('success', 'Permission added successfully', 'Success');
        router.push('/permissions');
      } else {
        showAlert('error', response.error, 'Error');
      }
    } catch {
      showAlert('error', 'Failed to add permission', 'Error');
    } finally {
      isSubmitting.value = false;
    }
  };

  onMounted(async () => {
    await loadModules();
  });
</script>

<template>
  <DefaultLayout>
    <FormViewTemplate title="Create New Permission" breadcrumb-title="Permissions" :is-submitting="isSubmitting" @submit="submitPermission" @cancel="router.back()">
      <BaseSelect label="Module" v-model="formData.moduleId" :options="modules" placeholder="Select module..." field-required :max-visible-items="5" />

      <div class="space-y-4 p-6 bg-elevated rounded-lg">
        <h3 class="text-lg font-semibold text-emphasis mb-4">Permission Settings</h3>

        <div class="flex items-center gap-3">
          <BaseCheckbox v-model="formData.canAdd" id="canAdd" />
          <label for="canAdd" class="text-sm font-medium text-emphasis cursor-pointer">Can Add</label>
        </div>

        <div class="flex items-center gap-3">
          <BaseCheckbox v-model="formData.canView" id="canView" />
          <label for="canView" class="text-sm font-medium text-emphasis cursor-pointer">Can View</label>
        </div>

        <div class="flex items-center gap-3">
          <BaseCheckbox v-model="formData.canEdit" id="canEdit" />
          <label for="canEdit" class="text-sm font-medium text-emphasis cursor-pointer">Can Edit</label>
        </div>

        <div class="flex items-center gap-3">
          <BaseCheckbox v-model="formData.canDelete" id="canDelete" />
          <label for="canDelete" class="text-sm font-medium text-emphasis cursor-pointer">Can Delete</label>
        </div>
      </div>
    </FormViewTemplate>
  </DefaultLayout>
</template>
