<script setup lang="ts">
  type SkeletonPreset = 'stats-grid' | 'form' | 'table-row' | 'card-grid' | 'profile';

  interface Props {
    preset: SkeletonPreset;
    count?: number;
  }

  withDefaults(defineProps<Props>(), {
    count: 4,
  });
</script>

<template>
  <div class="animate-pulse">
    <template v-if="preset === 'stats-grid'">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div v-for="i in count" :key="i" class="h-24 bg-elevated dark:bg-strokedark rounded-xl"></div>
      </div>
    </template>

    <template v-else-if="preset === 'form'">
      <div class="space-y-4 max-w-5xl mx-auto">
        <div class="h-8 bg-elevated dark:bg-strokedark rounded-2xl w-1/3"></div>
        <div class="h-36 bg-surface rounded-3xl border border-stroke dark:border-strokedark"></div>
        <div class="h-36 bg-surface rounded-3xl border border-stroke dark:border-strokedark"></div>
      </div>
    </template>

    <template v-else-if="preset === 'table-row'">
      <div v-for="i in count" :key="i" class="flex gap-4 py-4 border-b border-stroke dark:border-strokedark">
        <div class="h-4 bg-elevated dark:bg-strokedark rounded flex-1"></div>
        <div class="h-4 bg-elevated dark:bg-strokedark rounded w-24"></div>
        <div class="h-4 bg-elevated dark:bg-strokedark rounded w-20"></div>
      </div>
    </template>

    <template v-else-if="preset === 'card-grid'">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div v-for="i in count" :key="i" class="h-48 bg-elevated dark:bg-strokedark rounded-2xl"></div>
      </div>
    </template>

    <template v-else-if="preset === 'profile'">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-elevated dark:bg-strokedark"></div>
        <div class="space-y-2 flex-1">
          <div class="h-5 bg-elevated dark:bg-strokedark rounded w-1/3"></div>
          <div class="h-4 bg-elevated dark:bg-strokedark rounded w-1/4"></div>
        </div>
      </div>
    </template>
  </div>
</template>
