<script setup lang="ts">
  type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  type SpinnerVariant = 'primary' | 'white' | 'current';

  interface Props {
    size?: SpinnerSize;
    variant?: SpinnerVariant;
  }

  withDefaults(defineProps<Props>(), {
    size: 'md',
    variant: 'primary',
  });

  const sizeClasses: Record<SpinnerSize, string> = {
    xs: 'w-4 h-4 border-2',
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-10 h-10 border-4',
    xl: 'w-12 h-12 border-4',
  };

  const variantClasses: Record<SpinnerVariant, string> = {
    primary: 'border-primary border-t-transparent',
    white: 'border-white border-t-transparent',
    current: 'border-current border-t-transparent',
  };
</script>

<template>
  <div :class="['rounded-full animate-spin', sizeClasses[size], variantClasses[variant]]" role="status">
    <span class="sr-only">Loading...</span>
  </div>
</template>
