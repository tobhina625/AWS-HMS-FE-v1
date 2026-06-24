<script setup lang="ts">
  import BaseRadio from '@/components/Base/BaseRadio.vue';

  interface RadioOption {
    value: string | number;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    modelValue: string | number;
    options: RadioOption[];
    name?: string;
    label?: string;
    error?: string;
    columns?: 1 | 2 | 3 | 4;
  }

  withDefaults(defineProps<Props>(), {
    columns: 1,
  });

  const emit = defineEmits<{
    'update:modelValue': [value: string | number];
    change: [value: string | number];
  }>();

  const columnClasses: Record<number, string> = {
    1: 'flex flex-col gap-4',
    2: 'grid grid-cols-2 gap-4',
    3: 'grid grid-cols-3 gap-4',
    4: 'grid grid-cols-4 gap-4',
  };

  const updateValue = (value: string | number) => {
    emit('update:modelValue', value);
    emit('change', value);
  };
</script>

<template>
  <div class="space-y-3">
    <label v-if="label" class="block text-sm font-medium text-emphasis">{{ label }}</label>

    <div :class="columnClasses[columns]">
      <BaseRadio
        v-for="option in options"
        :key="String(option.value)"
        :model-value="modelValue"
        :value="option.value"
        :name="name"
        :label="option.label"
        :disabled="option.disabled"
        :id="`${name || 'radio'}-${option.value}`"
        @update:model-value="updateValue"
      />
    </div>

    <p v-if="error" class="text-sm text-meta-1 mt-1">{{ error }}</p>
  </div>
</template>
