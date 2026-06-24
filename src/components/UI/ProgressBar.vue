<script setup lang="ts">
  import { computed } from 'vue';

  type ProgressVariant = 'primary' | 'success' | 'warning' | 'danger' | 'auto';
  type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';
  type ValueFormat = 'percent' | 'fraction' | 'value';

  interface Thresholds {
    warning: number;
    danger: number;
  }

  interface Props {
    value: number;
    max?: number;
    label?: string;
    showValue?: boolean;
    valueFormat?: ValueFormat;
    variant?: ProgressVariant;
    size?: ProgressSize;
    thresholds?: Thresholds;
  }

  const props = withDefaults(defineProps<Props>(), {
    max: 100,
    showValue: true,
    valueFormat: 'percent',
    variant: 'primary',
    size: 'md',
    thresholds: () => ({ warning: 70, danger: 90 }),
  });

  const percentage = computed(() => Math.min(100, Math.max(0, (props.value / props.max) * 100)));

  const displayValue = computed(() => {
    switch (props.valueFormat) {
      case 'percent':
        return `${Math.round(percentage.value)}%`;
      case 'fraction':
        return `${props.value} / ${props.max}`;
      case 'value':
        return props.value.toString();
      default:
        return `${Math.round(percentage.value)}%`;
    }
  });

  const barVariant = computed(() => {
    if (props.variant !== 'auto') return props.variant;
    if (percentage.value >= props.thresholds.danger) return 'danger';
    if (percentage.value >= props.thresholds.warning) return 'warning';
    return 'success';
  });

  const variantClasses: Record<Exclude<ProgressVariant, 'auto'>, string> = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
  };

  const sizeClasses: Record<ProgressSize, string> = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };
</script>

<template>
  <div>
    <div v-if="label || showValue" class="flex items-center justify-between mb-2">
      <span v-if="label" class="text-sm text-muted">{{ label }}</span>
      <span v-if="showValue" class="text-sm font-semibold text-emphasis">{{ displayValue }}</span>
    </div>
    <div :class="['w-full bg-stroke dark:bg-strokedark rounded-full', sizeClasses[size]]">
      <div :class="['rounded-full transition-all duration-300', sizeClasses[size], variantClasses[barVariant]]" :style="{ width: `${percentage}%` }"></div>
    </div>
  </div>
</template>
