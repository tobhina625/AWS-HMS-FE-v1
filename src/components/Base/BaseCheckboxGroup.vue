<script setup lang="ts">
  import { computed } from 'vue';
  import CheckmarkIcon from '@/assets/images/SVGs/Checkmark.svg';

  interface CheckboxOption {
    id: string | number;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    modelValue: (string | number)[];
    options: CheckboxOption[];
    columns?: 1 | 2 | 3 | 4;
    label?: string;
    error?: string;
    variant?: 'simple' | 'card';
  }

  const props = withDefaults(defineProps<Props>(), {
    columns: 2,
    variant: 'simple',
  });

  const emit = defineEmits<{
    'update:modelValue': [(string | number)[]];
  }>();

  const columnClasses = computed(() => {
    const classes: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
    };
    return classes[props.columns];
  });

  const isChecked = (optionId: string | number) => {
    return props.modelValue.includes(optionId);
  };

  const toggleOption = (optionId: string | number) => {
    const newValue = [...props.modelValue];
    const index = newValue.indexOf(optionId);
    if (index === -1) {
      newValue.push(optionId);
    } else {
      newValue.splice(index, 1);
    }
    emit('update:modelValue', newValue);
  };
</script>

<template>
  <div class="space-y-3">
    <label v-if="label" class="block text-sm font-medium text-emphasis">{{ label }}</label>

    <div v-if="variant === 'simple'" class="space-y-2">
      <label v-for="option in options" :key="option.id" class="flex items-center gap-2 cursor-pointer group" :class="{ 'opacity-50 cursor-not-allowed': option.disabled }">
        <div class="relative">
          <input type="checkbox" class="sr-only" :checked="isChecked(option.id)" :disabled="option.disabled" @change="toggleOption(option.id)" />
          <div
            class="flex h-5 w-5 items-center justify-center rounded border transition-all duration-200"
            :class="[
              isChecked(option.id) ? 'border-primary bg-primary text-light' : 'border-stroke bg-transparent dark:border-form-strokedark',
              option.disabled ? 'opacity-50 cursor-not-allowed' : 'group-hover:border-primary',
            ]"
          >
            <span v-show="isChecked(option.id)">
              <CheckmarkIcon class="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
        <span class="text-sm text-bodydark dark:text-bodydark1">{{ option.label }}</span>
      </label>
    </div>

    <div v-else :class="['grid gap-4', columnClasses]">
      <label
        v-for="option in options"
        :key="option.id"
        class="flex items-center gap-3 p-3 bg-elevated rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-meta-4/80 transition-colors"
        :class="{ 'opacity-50 cursor-not-allowed': option.disabled }"
      >
        <div class="relative">
          <input type="checkbox" class="sr-only" :checked="isChecked(option.id)" :disabled="option.disabled" @change="toggleOption(option.id)" />
          <div
            class="flex h-5 w-5 items-center justify-center rounded border transition-all duration-200"
            :class="[
              isChecked(option.id) ? 'border-primary bg-primary text-light' : 'border-stroke bg-transparent dark:border-form-strokedark',
              option.disabled ? 'opacity-50 cursor-not-allowed' : 'group-hover:border-primary',
            ]"
          >
            <span v-show="isChecked(option.id)">
              <CheckmarkIcon class="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
        <span class="text-sm text-emphasis">{{ option.label }}</span>
      </label>
    </div>

    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>
