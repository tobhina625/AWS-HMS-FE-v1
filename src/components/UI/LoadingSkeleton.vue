<script setup lang="ts">
  type SkeletonVariant = 'text' | 'title' | 'paragraph' | 'card' | 'avatar' | 'button' | 'input' | 'custom';
  type RoundedSize = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

  interface Props {
    variant?: SkeletonVariant;
    lines?: number;
    width?: string;
    height?: string;
    rounded?: RoundedSize;
  }

  withDefaults(defineProps<Props>(), {
    variant: 'text',
    lines: 1,
    rounded: 'lg',
  });

  const roundedClasses: Record<RoundedSize, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  };
</script>

<template>
  <div class="animate-pulse">
    <template v-if="variant === 'text'">
      <div
        v-for="i in lines"
        :key="i"
        :class="['h-4 bg-elevated dark:bg-strokedark', roundedClasses[rounded], i < lines ? 'mb-2' : '']"
        :style="{ width: width || (i === lines ? '75%' : '100%') }"
      ></div>
    </template>

    <template v-else-if="variant === 'title'">
      <div :class="['h-8 bg-elevated dark:bg-strokedark', roundedClasses[rounded]]" :style="{ width: width || '33%' }"></div>
    </template>

    <template v-else-if="variant === 'paragraph'">
      <div class="space-y-2">
        <div class="h-4 bg-elevated dark:bg-strokedark rounded w-full"></div>
        <div class="h-4 bg-elevated dark:bg-strokedark rounded w-full"></div>
        <div class="h-4 bg-elevated dark:bg-strokedark rounded w-3/4"></div>
      </div>
    </template>

    <template v-else-if="variant === 'card'">
      <div :class="['bg-elevated dark:bg-strokedark', roundedClasses[rounded]]" :style="{ height: height || '150px' }"></div>
    </template>

    <template v-else-if="variant === 'avatar'">
      <div class="rounded-full bg-elevated dark:bg-strokedark" :style="{ width: width || '48px', height: height || '48px' }"></div>
    </template>

    <template v-else-if="variant === 'button'">
      <div :class="['h-10 bg-elevated dark:bg-strokedark', roundedClasses[rounded]]" :style="{ width: width || '100px' }"></div>
    </template>

    <template v-else-if="variant === 'input'">
      <div :class="['h-12 bg-elevated dark:bg-strokedark', roundedClasses[rounded]]" :style="{ width: width || '100%' }"></div>
    </template>

    <template v-else>
      <div :class="['bg-elevated dark:bg-strokedark', roundedClasses[rounded]]" :style="{ width, height }"></div>
    </template>
  </div>
</template>
