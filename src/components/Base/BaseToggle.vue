<script setup lang="ts">
  import { computed } from 'vue';

  interface Props {
    modelValue: boolean;
    disabled?: boolean;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
  }

  const props = withDefaults(defineProps<Props>(), {
    disabled: false,
    size: 'md',
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
  }>();

  const toggle = () => {
    if (!props.disabled) {
      emit('update:modelValue', !props.modelValue);
    }
  };

  const sizeClasses = computed(() => {
    switch (props.size) {
      case 'sm':
        return {
          container: 'h-5 w-9',
          circle: 'h-3.5 w-3.5',
        };
      case 'lg':
        return {
          container: 'h-8 w-15',
          circle: 'h-6 w-6',
        };
      default:
        return {
          container: 'h-6 w-11',
          circle: 'h-4 w-4',
        };
    }
  });
</script>

<template>
  <div class="flex items-center gap-3">
    <label
      :class="[
        'relative m-0 block rounded-full transition-all duration-200',
        sizeClasses.container,
        modelValue ? 'bg-primary shadow-sm' : 'bg-stroke/50 dark:bg-strokedark/50',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md hover:scale-105',
      ]"
      @click="toggle"
    >
      <input type="checkbox" :checked="modelValue" :disabled="disabled" class="sr-only" />
      <span :class="['absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-md transition-all duration-200 ease-in-out', sizeClasses.circle, modelValue ? 'right-1' : 'left-1']" />
    </label>
    <span v-if="label" :class="['text-sm font-semibold capitalize', disabled ? 'text-muted' : modelValue ? 'text-success dark:text-green-400' : 'text-muted']">
      {{ label }}
    </span>
  </div>
</template>
