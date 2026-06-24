<script setup lang="ts">
  defineProps<{
    modelValue: string | number;
    value: string | number;
    name?: string;
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
        type="radio"
        :id="id"
        :name="name"
        class="sr-only"
        :value="value"
        :checked="modelValue === value"
        :disabled="disabled"
        @change="
          $emit('update:modelValue', value);
          $emit('change', value);
        "
      />
      <div
        class="mr-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200"
        :class="[
          modelValue === value ? 'border-primary bg-primary' : 'border-stroke bg-transparent dark:border-form-strokedark',
          disabled ? 'opacity-50 cursor-not-allowed' : 'group-hover:border-primary',
        ]"
      >
        <span v-show="modelValue === value" class="h-2 w-2 rounded-full bg-light"></span>
      </div>
    </div>
    <span v-if="label" class="text-sm font-medium text-emphasis" :class="{ 'opacity-50': disabled }">
      {{ label }}
    </span>
  </label>
</template>
