<script setup lang="ts">
  import { computed } from 'vue';
  import BaseModal from './BaseModal.vue';
  import BaseButton from './BaseButton.vue';
  import TrashIcon from '@/assets/images/SVGs/TrashIcon.svg';
  import WarningTriangleIcon from '@/assets/images/SVGs/WarningTriangle.svg';
  import SuccessCheckCircleIcon from '@/assets/images/SVGs/SuccessCheckCircle.svg';
  import InfoIconSvg from '@/assets/images/SVGs/InfoIcon.svg';

  interface Props {
    show: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  }

  const props = withDefaults(defineProps<Props>(), {
    title: 'Confirm Action',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger',
  });

  const emit = defineEmits<{
    confirm: [];
    cancel: [];
  }>();

  const iconClass = computed(() => {
    switch (props.variant) {
      case 'danger':
        return 'text-danger';
      case 'warning':
        return 'text-warning';
      case 'success':
        return 'text-success';
      case 'primary':
        return 'text-primary';
      case 'secondary':
        return 'text-secondary';
      default:
        return 'text-danger';
    }
  });

  const iconBgClass = computed(() => {
    switch (props.variant) {
      case 'danger':
        return 'bg-danger/10 dark:bg-danger/20';
      case 'warning':
        return 'bg-warning/10 dark:bg-warning/20';
      case 'success':
        return 'bg-success/10 dark:bg-success/20';
      case 'primary':
        return 'bg-primary/10 dark:bg-primary/20';
      case 'secondary':
        return 'bg-secondary/10 dark:bg-secondary/20';
      default:
        return 'bg-danger/10 dark:bg-danger/20';
    }
  });

  const confirmButtonVariant = computed(() => {
    switch (props.variant) {
      case 'primary':
        return 'primary';
      case 'secondary':
        return 'secondary';
      case 'success':
        return 'success';
      case 'danger':
        return 'danger';
      case 'warning':
        return 'danger'; // BaseButton doesn't have warning, use danger
      default:
        return 'danger';
    }
  });

  const iconComponent = computed(() => {
    switch (props.variant) {
      case 'danger':
        return TrashIcon;
      case 'warning':
        return WarningTriangleIcon;
      case 'success':
        return SuccessCheckCircleIcon;
      case 'primary':
      case 'secondary':
        return InfoIconSvg;
      default:
        return InfoIconSvg;
    }
  });
</script>

<template>
  <BaseModal :show="show" :title="title" size="sm" @close="emit('cancel')">
    <div class="flex flex-col items-center text-center space-y-4">
      <!-- Icon -->
      <div class="w-16 h-16 rounded-full flex items-center justify-center" :class="iconBgClass">
        <component :is="iconComponent" class="w-8 h-8" :class="iconClass" />
      </div>

      <!-- Message -->
      <p class="text-base text-muted dark:text-muted">{{ message }}</p>
    </div>

    <template #footer>
      <BaseButton @click="emit('cancel')" variant="outline">
        {{ cancelText }}
      </BaseButton>
      <BaseButton @click="emit('confirm')" :variant="confirmButtonVariant">
        {{ confirmText }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
