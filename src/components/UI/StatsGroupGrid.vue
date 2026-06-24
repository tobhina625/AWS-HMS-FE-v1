<script setup lang="ts">
  import { computed } from 'vue';

  export interface StatsGroupItem {
    label: string;
    value: number | string;
  }

  export type StatsGroupGridVariant = 'default' | 'elevated' | 'muted';

  export interface StatsGroupGridProps {
    title: string;
    items: StatsGroupItem[];
    columns?: 2 | 3 | 4 | 5;
    variant?: StatsGroupGridVariant;
  }

  const props = withDefaults(defineProps<StatsGroupGridProps>(), {
    columns: 4,
    variant: 'elevated',
  });

  const containerClasses = computed(() => {
    const variants: Record<StatsGroupGridVariant, string> = {
      default: 'bg-surface border border-stroke dark:border-strokedark',
      elevated: 'bg-elevated',
      muted: 'bg-bodydark2/5 dark:bg-strokedark/20',
    };
    return variants[props.variant];
  });

  const gridClasses = computed(() => {
    const columnMap: Record<number, string> = {
      2: 'grid-cols-2',
      3: 'grid-cols-2 md:grid-cols-3',
      4: 'grid-cols-2 md:grid-cols-4',
      5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    };
    return columnMap[props.columns];
  });
</script>

<template>
  <div :class="['rounded-xl p-6', containerClasses]">
    <h3 class="text-lg font-semibold text-emphasis mb-4">{{ title }}</h3>
    <div :class="['grid gap-4', gridClasses]">
      <div v-for="item in items" :key="item.label" class="text-center p-4 bg-surface rounded-lg border border-stroke dark:border-strokedark">
        <p class="text-sm text-bodydark dark:text-bodydark1 mb-2">{{ item.label }}</p>
        <p class="text-2xl font-bold text-emphasis">{{ item.value }}</p>
      </div>
    </div>
  </div>
</template>
