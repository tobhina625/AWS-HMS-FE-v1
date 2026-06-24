<script setup lang="ts">
  import { RouterView } from 'vue-router';
  import { ref, getCurrentInstance } from 'vue';
  import type { ComponentPublicInstance } from 'vue';
  import ConfirmModal from '@/components/Base/ConfirmModal.vue';
  import { useConfirm } from '@/composables/useConfirm';

  // Define the type for the `vue-basic-alert` instance
  interface VueBasicAlertInstance {
    showAlert: (title: string, message: string, type: string) => void;
  }

  // Create a ref with the correct type
  const alertRef = ref<ComponentPublicInstance<VueBasicAlertInstance> | null>(null);

  // Assign the alertRef globally
  const instance = getCurrentInstance();
  if (!instance) {
    throw new Error('getCurrentInstance() returned null. This must be called within a setup function.');
  }

  instance.appContext.config.globalProperties.$alertRef = alertRef;

  // Setup confirm modal
  const { showConfirm, confirmOptions, handleConfirm, handleCancel } = useConfirm();
</script>

<template>
  <!-- Bind the alertRef to the vue-basic-alert component -->
  <vue-basic-alert :duration="300" :closeIn="3000" ref="alertRef" />

  <!-- Global confirm modal -->
  <ConfirmModal
    :show="showConfirm"
    :title="confirmOptions.title"
    :message="confirmOptions.message"
    :confirmText="confirmOptions.confirmText"
    :cancelText="confirmOptions.cancelText"
    :variant="confirmOptions.variant"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />

  <!-- Main router view -->
  <RouterView />
</template>
