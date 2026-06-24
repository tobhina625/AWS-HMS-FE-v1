<script setup lang="ts">
  import { onMounted, computed } from 'vue';
  import ClipboardCheckIcon from '@/assets/images/SVGs/ClipboardCheckIcon.svg';
  import { useCnicConfig } from '@/composables/useCnicConfig';

  const props = defineProps({
    label: String,
    labelPrefix: String,
    placeholder: String,
    modelValue: String,
    error: Boolean,
    errorMessage: String,
    fieldRequired: Boolean,
    readonly: Boolean,
    disabled: Boolean,
    useDefaultLabel: { type: Boolean, default: true },
  });

  const emit = defineEmits(['update:modelValue', 'change']);

  const { cnicConfig, loadCnicConfig, formatCnic, getErrorMessage } = useCnicConfig();

  onMounted(async () => {
    await loadCnicConfig();
  });

  const displayLabel = computed(() => {
    if (props.label) return props.label;
    if (props.labelPrefix) {
      return `${props.labelPrefix} ${cnicConfig.value.fieldName}`;
    }
    if (props.useDefaultLabel) return cnicConfig.value.fieldName;
    return '';
  });

  const displayPlaceholder = computed(() => {
    return props.placeholder || cnicConfig.value.placeholder;
  });

  const displayMaxLength = computed(() => {
    return cnicConfig.value.maxLength;
  });

  const displayHelpText = computed(() => {
    return cnicConfig.value.helpText;
  });

  const displayErrorMessage = computed(() => {
    return props.errorMessage || getErrorMessage.value;
  });

  const handleInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    emit('update:modelValue', input.value);
  };

  const handleBlur = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const formatted = formatCnic(input.value);
    emit('update:modelValue', formatted);
    emit('change');
  };
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label v-if="displayLabel" class="block text-sm font-medium text-emphasis">
      {{ displayLabel }}
      <span v-if="fieldRequired" class="text-meta-1 ml-0.5">*</span>
    </label>
    <div class="relative flex items-center group">
      <input
        type="text"
        :placeholder="displayPlaceholder"
        :value="modelValue"
        @input="handleInput"
        @blur="handleBlur"
        :readonly="readonly"
        :disabled="disabled"
        :maxlength="displayMaxLength"
        class="w-full rounded-lg border bg-transparent py-3 px-4 text-sm font-medium outline-none transition dark:bg-form-input text-emphasis disabled:opacity-50 disabled:cursor-not-allowed"
        :class="error ? 'border-meta-1' : 'border-stroke focus:border-primary dark:border-form-strokedark dark:focus:border-primary'"
      />

      <!-- Info icon -->
      <div class="absolute right-4 flex items-center justify-center pointer-events-none">
        <ClipboardCheckIcon class="w-4 h-4 transition-colors duration-300" :class="error ? 'text-meta-1' : 'text-bodydark dark:text-bodydark1 group-focus-within:text-primary'" />
      </div>
    </div>
    <p v-if="error" class="text-meta-1 text-xs font-medium pl-0.5">
      {{ displayErrorMessage }}
    </p>
    <p v-else class="text-bodydark dark:text-bodydark1 text-xs pl-0.5">{{ displayHelpText }}</p>
  </div>
</template>
