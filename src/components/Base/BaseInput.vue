<script setup lang="ts">
  defineProps({
    label: String,
    type: { type: String, default: 'text' },
    placeholder: String,
    modelValue: [String, Number],
    error: Boolean,
    errorMessage: String,
    fieldRequired: Boolean,
    readonly: Boolean,
    disabled: Boolean,
    maxlength: [String, Number],
    min: [String, Number],
    max: [String, Number],
  });

  defineEmits(['update:modelValue', 'change']);
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label v-if="label" class="block text-sm font-medium text-emphasis">
      {{ label }}
      <span v-if="fieldRequired" class="text-meta-1 ml-0.5">*</span>
    </label>
    <div class="relative flex items-center group">
      <!-- Leading Icon -->
      <div v-if="$slots.leading" class="absolute left-4 flex items-center justify-center pointer-events-none transition-transform duration-300 group-focus-within:scale-110">
        <slot name="leading"></slot>
      </div>

      <input
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        :maxlength="maxlength"
        :min="min"
        :max="max"
        @change="$emit('change')"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :readonly="readonly"
        :disabled="disabled"
        class="w-full rounded-lg border bg-transparent py-3 text-sm font-medium outline-none transition dark:bg-form-input text-emphasis disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-bodydark placeholder:dark:text-bodydark1"
        :class="[
          error ? 'border-meta-1' : 'border-stroke focus:border-primary dark:border-form-strokedark dark:focus:border-primary',
          $slots.leading ? 'pl-11 pr-4' : 'px-4',
          type === 'date' ? 'border-stroke dark:border-form-strokedark [color-scheme:light] dark:[color-scheme:dark]' : '',
          type === 'number'
            ? '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:bg-transparent [&::-webkit-outer-spin-button]:bg-transparent'
            : '',
        ]"
      />

      <!-- Trailing Icon (Default Slot) -->
      <div class="absolute right-4 flex items-center justify-center transition-transform duration-300 group-focus-within:scale-110">
        <slot></slot>
      </div>
    </div>
    <p v-if="error" class="text-meta-1 text-xs font-medium pl-0.5">
      {{ errorMessage ?? 'This field is required' }}
    </p>
  </div>
</template>

<style scoped></style>
