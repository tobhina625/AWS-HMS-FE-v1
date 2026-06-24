<script setup lang="ts">
  import { computed } from 'vue';

  interface SegmentOption {
    value: string | number;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    modelValue: string | number;
    options: SegmentOption[];
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    disabled: false,
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number): void;
  }>();

  const selectOption = (value: string | number, optionDisabled?: boolean) => {
    if (!props.disabled && !optionDisabled) {
      emit('update:modelValue', value);
    }
  };

  const sizeClasses = computed(() => {
    switch (props.size) {
      case 'sm':
        return 'text-xs py-1.5 px-3';
      case 'lg':
        return 'text-base py-3 px-5';
      default:
        return 'text-sm py-2 px-4';
    }
  });
</script>

<template>
  <div class="space-y-2.5">
    <label v-if="label" class="block text-sm font-medium text-foreground">{{ label }}</label>

    <div class="inline-flex rounded-lg bg-muted/30 p-1 gap-1 border border-border/50" :class="{ 'opacity-50 cursor-not-allowed': disabled }">
      <button
        v-for="option in options"
        :key="String(option.value)"
        type="button"
        :disabled="disabled || option.disabled"
        @click="selectOption(option.value, option.disabled)"
        :class="[
          'rounded-md font-semibold transition-all duration-200 whitespace-nowrap border',
          sizeClasses,
          modelValue === option.value ? 'bg-primary text-white shadow-md scale-105 border-primary' : 'text-muted hover:text-foreground hover:bg-muted/40 border-border/30 hover:border-border',
          disabled || option.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        ]"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
