<script setup lang="ts">
  import { computed } from 'vue';
  import SpinnerIcon from '@/assets/images/SVGs/Spinner.svg';

  type StepState = 'completed' | 'active' | 'disabled';

  interface Props {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost' | 'icon' | 'iconGhost' | 'iconPrimary' | 'iconDanger' | 'iconWarning' | 'iconSuccess' | 'iconSecondary' | 'step';
    size?: 'sm' | 'md' | 'lg' | 'iconSm' | 'iconMd' | 'iconLg';
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    block?: boolean;
    rounded?: 'normal' | 'full' | 'xl';
    stepState?: StepState;
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    size: 'md',
    type: 'button',
    rounded: 'xl',
  });

  const variants: Record<string, string> = {
    primary: 'bg-primary text-white hover:bg-primary-light dark:bg-primary dark:text-white dark:hover:bg-primary-light shadow-4 active:scale-[0.98]',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 dark:bg-secondary dark:text-white dark:hover:bg-secondary/90 shadow-4 active:scale-[0.98]',
    outline:
      'border-2 border-stroke dark:border-strokedark text-bodydark dark:text-bodydark1 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary active:scale-[0.98]',
    danger: 'bg-danger text-white hover:bg-danger-light dark:bg-danger dark:text-white dark:hover:bg-danger-light shadow-4 active:scale-[0.98]',
    success: 'bg-success text-white hover:bg-success-light dark:bg-success dark:text-white dark:hover:bg-success-light shadow-4 active:scale-[0.98]',
    ghost: 'text-gray-muted dark:text-bodydark1 hover:bg-gray dark:hover:bg-strokedark active:scale-[0.95]',
    icon: 'p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-strokedark hover:text-emphasis transition-colors',
    iconGhost: 'rounded-lg hover:bg-elevated text-muted transition-colors',
    iconPrimary: 'rounded-lg hover:bg-primary/10 text-primary transition-colors',
    iconDanger: 'rounded-lg hover:bg-danger-light hover:text-danger text-muted transition-colors',
    iconWarning: 'rounded-lg hover:bg-warning-light hover:text-warning text-muted transition-colors',
    iconSuccess: 'rounded-lg hover:bg-success-light hover:text-success text-muted transition-colors',
    iconSecondary: 'rounded-lg hover:bg-secondary-light hover:text-secondary text-muted transition-colors',
    step: 'w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200',
  };

  const stepStateClasses: Record<StepState, string> = {
    completed: 'bg-primary text-light cursor-pointer hover:bg-primary/90',
    active: 'bg-primary text-light ring-4 ring-primary/20',
    disabled: 'bg-elevated text-bodydark dark:text-bodydark1 cursor-not-allowed',
  };

  const sizes: Record<string, string> = {
    sm: 'px-4 py-1.5 text-xs font-bold uppercase tracking-wider',
    md: 'px-6 py-3 text-sm font-bold',
    lg: 'px-8 py-4 text-lg font-extrabold',
    iconSm: 'p-1.5 w-7 h-7 min-w-7 min-h-7',
    iconMd: 'p-2 w-9 h-9 min-w-9 min-h-9',
    iconLg: 'p-2.5 w-11 h-11 min-w-11 min-h-11',
  };

  const roundedClasses: Record<string, string> = {
    normal: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  const isIconVariant = (v: string) => ['icon', 'iconGhost', 'iconPrimary', 'iconDanger', 'iconWarning', 'iconSuccess', 'iconSecondary'].includes(v);
  const isStepVariant = (v: string) => v === 'step';

  const buttonClasses = computed(() => {
    const base = 'inline-flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100';
    const classes: string[] = [base];

    if (isStepVariant(props.variant)) {
      classes.push(variants.step, stepStateClasses[props.stepState || 'disabled']);
    } else {
      classes.push(variants[props.variant] || variants.primary);
    }

    if (isStepVariant(props.variant)) {
      // step has fixed size in variant
    } else if (isIconVariant(props.variant)) {
      classes.push(['iconSm', 'iconMd', 'iconLg'].includes(props.size) ? sizes[props.size] : sizes.iconMd);
    } else {
      classes.push(sizes[props.size] || sizes.md);
    }

    if (!isStepVariant(props.variant) && !isIconVariant(props.variant)) {
      classes.push(roundedClasses[props.rounded] || roundedClasses.xl);
    }

    if (props.block) classes.push('w-full');

    return classes;
  });
</script>

<template>
  <button :type="type" :disabled="disabled || loading" :class="buttonClasses">
    <SpinnerIcon v-if="loading" class="animate-spin h-4 w-4 text-current" />
    <slot v-else name="iconLeft"></slot>

    <slot></slot>

    <slot v-if="!loading" name="iconRight"></slot>
  </button>
</template>
