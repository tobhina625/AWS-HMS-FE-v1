<script setup lang="ts">
  import BaseButton from '@/components/Base/BaseButton.vue';
  import router from '@/router';

  withDefaults(
    defineProps<{
      submitLabel?: string;
      cancelLabel?: string;
      loading?: boolean;
      submitVariant?: 'primary' | 'secondary' | 'success';
    }>(),
    {
      submitLabel: 'Save',
      cancelLabel: 'Cancel',
      loading: false,
      submitVariant: 'primary',
    }
  );

  const emit = defineEmits<{
    (e: 'submit'): void;
    (e: 'cancel'): void;
  }>();

  const handleCancel = () => {
    emit('cancel');
    router.back();
  };
</script>

<template>
  <div class="w-full mt-8 flex sm:flex-row items-center justify-end gap-4">
    <BaseButton variant="outline" @click="handleCancel">
      {{ cancelLabel }}
    </BaseButton>
    <BaseButton :variant="submitVariant" :loading="loading" @click="emit('submit')">
      {{ submitLabel }}
    </BaseButton>
  </div>
</template>
