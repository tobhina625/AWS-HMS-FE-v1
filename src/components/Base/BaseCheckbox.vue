<script setup lang="ts">
  import CheckmarkIcon from '@/assets/images/SVGs/Checkmark.svg';

  defineProps<{
    modelValue: boolean;
    label?: string;
    disabled?: boolean;
    id?: string;
  }>();

  defineEmits(['update:modelValue', 'change']);
</script>

<template>
  <label :for="id" class="flex cursor-pointer select-none items-center group">
    <div class="relative">
      <input
        type="checkbox"
        :id="id"
        class="sr-only"
        :checked="modelValue"
        :disabled="disabled"
        @change="
          $emit('update:modelValue', ($event.target as HTMLInputElement).checked);
          $emit('change', ($event.target as HTMLInputElement).checked);
        "
      />
      <div
        class="mr-3 flex h-5 w-5 items-center justify-center rounded border transition-all duration-200"
        :class="[
          modelValue ? 'border-primary bg-primary text-light' : 'border-stroke bg-transparent dark:border-form-strokedark',
          disabled ? 'opacity-50 cursor-not-allowed' : 'group-hover:border-primary',
        ]"
      >
        <span v-show="modelValue">
          <CheckmarkIcon class="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
    <span v-if="label" class="text-sm font-medium text-emphasis" :class="{ 'opacity-50': disabled }">
      {{ label }}
    </span>
  </label>
</template>
