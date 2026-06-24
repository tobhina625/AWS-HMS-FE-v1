<script setup lang="ts">
  import BaseButton from '@/components/Base/BaseButton.vue';

  type ActionVariant = 'primary' | 'danger' | 'warning' | 'success' | 'secondary' | 'ghost';
  type ActionSize = 'sm' | 'md' | 'lg';

  const variantMap: Record<ActionVariant, string> = {
    primary: 'iconPrimary',
    danger: 'iconDanger',
    warning: 'iconWarning',
    success: 'iconSuccess',
    secondary: 'iconSecondary',
    ghost: 'iconGhost',
  };

  const sizeMap: Record<ActionSize, string> = {
    sm: 'iconSm',
    md: 'iconMd',
    lg: 'iconLg',
  };

  const props = withDefaults(
    defineProps<{
      variant?: ActionVariant;
      size?: ActionSize;
      title?: string;
      disabled?: boolean;
    }>(),
    {
      variant: 'ghost',
      size: 'md',
      disabled: false,
    }
  );
</script>

<template>
  <BaseButton :variant="variantMap[props.variant] as any" :size="sizeMap[props.size] as any" :title="props.title" :disabled="props.disabled">
    <slot />
  </BaseButton>
</template>
