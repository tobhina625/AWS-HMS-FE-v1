<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import FormViewTemplate from '@/components/Templates/FormViewTemplate.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BaseTextArea from '@/components/Base/BaseTextArea.vue';
  import ModuleServices from '@/services/Module/Module.services';

  const router = useRouter();
  const { showAlert } = useAlert();
  const moduleService = new ModuleServices();

  const isSubmitting = ref(false);
  const formData = ref({
    name: '',
    description: '',
    icon: '',
    route: '',
    displayOrder: 0,
    isActive: true,
  });

  const submitModule = async () => {
    if (!formData.value.name) {
      showAlert('error', 'Module name is required', 'Validation Error');
      return;
    }

    isSubmitting.value = true;
    try {
      const response = await moduleService.addModule(formData.value);
      if (response.isSuccess) {
        showAlert('success', 'Module added successfully', 'Success');
        router.push('/modules');
      } else {
        showAlert('error', response.error, 'Error');
      }
    } catch {
      showAlert('error', 'Failed to add module', 'Error');
    } finally {
      isSubmitting.value = false;
    }
  };
</script>

<template>
  <DefaultLayout>
    <FormViewTemplate title="Create New Module" breadcrumb-title="Modules" :is-submitting="isSubmitting" @submit="submitModule" @cancel="router.back()">
      <BaseInput label="Module Name" v-model="formData.name" placeholder="e.g. Patient Management" field-required />

      <BaseInput label="Icon" v-model="formData.icon" placeholder="e.g. fa-user-md" />

      <BaseInput label="Route" v-model="formData.route" placeholder="e.g. /patients" />

      <div class="flex flex-col gap-1.5 w-full">
        <label class="block text-sm font-medium text-emphasis">Display Order</label>
        <div class="flex items-stretch rounded-lg border border-stroke dark:border-form-strokedark bg-transparent dark:bg-form-input overflow-hidden">
          <input
            type="number"
            v-model.number="formData.displayOrder"
            placeholder="e.g. 1"
            min="0"
            class="flex-1 py-3 px-4 text-sm font-medium text-emphasis bg-transparent outline-none focus:border-primary dark:focus:border-primary border-r border-stroke dark:border-form-strokedark [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <div class="flex flex-col">
            <button
              type="button"
              @click="formData.displayOrder = Math.max(0, (formData.displayOrder || 0) + 1)"
              class="flex-1 px-3 py-1 bg-surface dark:bg-form-input border-b border-stroke dark:border-strokedark text-emphasis hover:bg-elevated dark:hover:bg-elevated transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
            </button>
            <button
              type="button"
              @click="formData.displayOrder = Math.max(0, (formData.displayOrder || 0) - 1)"
              class="flex-1 px-3 py-1 bg-surface dark:bg-form-input text-emphasis hover:bg-elevated dark:hover:bg-elevated transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
        </div>
      </div>

      <BaseSelect
        label="Status"
        v-model="formData.isActive"
        :options="[
          { id: true, name: 'Active' },
          { id: false, name: 'Inactive' },
        ]"
        placeholder="Select status..."
        field-required
      />

      <BaseTextArea label="Description" v-model="formData.description" placeholder="Enter module description..." rows="3" />
    </FormViewTemplate>
  </DefaultLayout>
</template>
