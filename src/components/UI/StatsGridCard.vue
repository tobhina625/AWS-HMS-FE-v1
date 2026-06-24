<script setup lang="ts">
  import { computed } from 'vue';

  export type StatsGridCardVariant = 'primary' | 'success' | 'secondary' | 'warning' | 'danger' | 'info';

  export interface StatsGridCardProps {
    label: string;
    value: string | number;
    subtitle?: string;
    variant?: StatsGridCardVariant;
    solid?: boolean;
    minimal?: boolean;
    large?: boolean;

    icon?: any;
  }

  const props = withDefaults(defineProps<StatsGridCardProps>(), {
    variant: 'primary',
    solid: false,
    minimal: false,
    large: false,
  });

  const variantClasses = computed(() => {
    const gradientVariants: Record<StatsGridCardVariant, { card: string; iconBg: string }> = {
      primary: {
        card: 'bg-gradient-to-br from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30 border-primary/20 dark:border-primary/30',
        iconBg: 'bg-primary/20',
      },
      success: {
        card: 'bg-gradient-to-br from-success/10 to-success/20 dark:from-success/20 dark:to-success/30 border-success/20 dark:border-success/30',
        iconBg: 'bg-success/20',
      },
      secondary: {
        card: 'bg-gradient-to-br from-secondary/10 to-secondary/20 dark:from-secondary/20 dark:to-secondary/30 border-secondary/20 dark:border-secondary/30',
        iconBg: 'bg-secondary/20',
      },
      warning: {
        card: 'bg-gradient-to-br from-warning/10 to-warning/20 dark:from-warning/20 dark:to-warning/30 border-warning/20 dark:border-warning/30',
        iconBg: 'bg-warning/20',
      },
      danger: {
        card: 'bg-gradient-to-br from-danger/10 to-danger/20 dark:from-danger/20 dark:to-danger/30 border-danger/20 dark:border-danger/30',
        iconBg: 'bg-danger/20',
      },
      info: {
        card: 'bg-gradient-to-br from-info/10 to-info/20 dark:from-info/20 dark:to-info/30 border-info/20 dark:border-info/30',
        iconBg: 'bg-info/20',
      },
    };

    const solidVariants: Record<StatsGridCardVariant, { card: string; iconBg: string }> = {
      primary: {
        card: 'bg-gradient-to-br from-primary-light to-primary-light border-primary',
        iconBg: 'bg-primary/20',
      },
      success: {
        card: 'bg-gradient-to-br from-success-light to-success-light border-success',
        iconBg: 'bg-success/20',
      },
      secondary: {
        card: 'bg-gradient-to-br from-secondary-light to-secondary-light border-secondary',
        iconBg: 'bg-secondary/20',
      },
      warning: {
        card: 'bg-gradient-to-br from-warning-light to-warning-light border-warning',
        iconBg: 'bg-warning/20',
      },
      danger: {
        card: 'bg-gradient-to-br from-danger-light to-danger-light border-danger',
        iconBg: 'bg-danger/20',
      },
      info: {
        card: 'bg-gradient-to-br from-info-light to-info-light border-info',
        iconBg: 'bg-info/20',
      },
    };

    const minimalVariants: Record<StatsGridCardVariant, { card: string; iconBg: string }> = {
      primary: {
        card: 'bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30',
        iconBg: 'bg-primary/20',
      },
      success: {
        card: 'bg-success/5 dark:bg-success/10 border-success/20 dark:border-success/30',
        iconBg: 'bg-success/20',
      },
      secondary: {
        card: 'bg-secondary/5 dark:bg-secondary/10 border-secondary/20 dark:border-secondary/30',
        iconBg: 'bg-secondary/20',
      },
      warning: {
        card: 'bg-warning/5 dark:bg-warning/10 border-warning/20 dark:border-warning/30',
        iconBg: 'bg-warning/20',
      },
      danger: {
        card: 'bg-danger/5 dark:bg-danger/10 border-danger/20 dark:border-danger/30',
        iconBg: 'bg-danger/20',
      },
      info: {
        card: 'bg-info/5 dark:bg-info/10 border-info/20 dark:border-info/30',
        iconBg: 'bg-info/20',
      },
    };

    if (props.minimal) return minimalVariants[props.variant];
    return props.solid ? solidVariants[props.variant] : gradientVariants[props.variant];
  });
</script>

<template>
  <div :class="['rounded-xl border', minimal ? 'p-4' : large ? 'p-6' : 'p-5', variantClasses.card]">
    <div :class="['flex items-center justify-between', large ? 'mb-4' : 'mb-2']">
      <p :class="['font-semibold text-emphasis', large ? 'text-lg' : 'text-sm']">{{ label }}</p>
      <div v-if="icon" :class="['rounded-full flex items-center justify-center', large ? 'w-12 h-12' : 'w-10 h-10', variantClasses.iconBg]">
        <component :is="icon" :class="['text-emphasis', large ? 'w-6 h-6' : 'w-5 h-5']" />
      </div>
      <slot v-else name="icon" />
    </div>
    <p :class="['font-bold text-emphasis', minimal ? 'text-2xl' : large ? 'text-4xl' : 'text-3xl']">{{ value }}</p>
    <p v-if="subtitle" class="text-xs text-emphasis mt-1">{{ subtitle }}</p>
    <slot name="footer" />
  </div>
</template>
