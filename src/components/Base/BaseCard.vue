<script setup lang="ts">
  defineProps({
    title: String,
    subtitle: String,
    noPadding: Boolean,
  });
</script>

<template>
  <div class="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-md shadow-xl dark:border-strokedark/50 dark:bg-boxdark/80 overflow-hidden transition-all duration-300">
    <div v-if="title || $slots.header" class="px-6 py-4 border-b border-gray-100 dark:border-strokedark/50">
      <slot name="header">
        <h2 class="text-xl font-extrabold text-emphasis tracking-tight">{{ title }}</h2>
        <p v-if="subtitle" class="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-1">{{ subtitle }}</p>
      </slot>
    </div>
    <div :class="[noPadding ? '' : 'p-6']">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="px-6 py-4 bg-gray-50/50 dark:bg-strokedark/20 border-t border-stroke dark:border-strokedark">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
