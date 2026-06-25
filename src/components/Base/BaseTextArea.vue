<script setup lang="ts">
  defineProps({
    label: String,
    placeholder: { type: String, default: 'Enter text...' },
    modelValue: String,
    rows: { type: Number, default: 4 },
    fieldRequired: Boolean,
    error: Boolean,
    errorMessage: String,
    disabled: Boolean,
  });

  defineEmits(['update:modelValue', 'change']);
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label class="block text-sm font-medium text-emphasis">
      {{ label }}
      <span v-if="fieldRequired" class="text-meta-1 ml-0.5">*</span>
    </label>
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      @change="$emit('change')"
      class="w-full rounded-lg border bg-transparent py-3 px-4 text-sm font-medium outline-none transition dark:bg-form-input text-emphasis resize-y disabled:opacity-50 disabled:cursor-not-allowed"
      :class="[error ? 'border-meta-1' : 'border-stroke focus:border-primary dark:border-form-strokedark dark:focus:border-primary']"
    ></textarea>
    <p v-if="error" class="text-meta-1 text-xs font-medium pl-0.5">
      {{ errorMessage ?? 'This field is required' }}
    </p>
  </div>
</template>
