<script setup lang="ts">
  defineProps<{
    modelValue: string | number;
    label: string;
    options: { label: string; value: string | number }[];
    placeholder?: string;
    error?: boolean;
    errorMessage?: string;
    fieldRequired?: boolean;
    disabled?: boolean;
  }>();

  defineEmits(['update:modelValue', 'change']);
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label class="block text-sm font-medium text-emphasis">
      {{ label }}
      <span v-if="fieldRequired" class="text-meta-1 ml-0.5">*</span>
    </label>

    <select
      :value="modelValue"
      :disabled="disabled"
      @change="
        $emit('update:modelValue', ($event.target as HTMLSelectElement).value);
        $emit('change', ($event.target as HTMLSelectElement).value);
      "
      class="w-full rounded-lg border bg-transparent py-3 px-4 text-sm outline-none transition focus:outline-none dark:bg-form-input appearance-none"
      :class="[
        error ? 'border-meta-1 focus:border-meta-1' : 'border-stroke focus:border-primary dark:border-form-strokedark dark:focus:border-primary',
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        !modelValue ? 'text-bodydark dark:text-bodydark1 font-normal' : 'text-emphasis font-medium',
      ]"
    >
      <option v-if="placeholder" value="" disabled selected hidden class="text-bodydark dark:text-bodydark1">{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value" class="bg-surface text-emphasis">
        {{ opt.label }}
      </option>
    </select>

    <p v-if="error" class="text-meta-1 text-xs font-medium pl-0.5">
      {{ errorMessage ?? 'This field is required' }}
    </p>
  </div>
</template>
