<script setup lang="ts">
  import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue';
  import BaseCard from '@/components/Base/BaseCard.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';

  defineProps({
    title: {
      type: String,
      required: true,
    },
    breadcrumbTitle: String,
    loading: Boolean,
    selectionCount: {
      type: Number,
      default: 0,
    },
    showBulkActions: {
      type: Boolean,
      default: false,
    },
  });

  defineEmits(['selectAll', 'deselectAll']);
</script>

<template>
  <div class="space-y-6">
    <BreadcrumbDefault :pageTitle="breadcrumbTitle || title" />

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-emphasis tracking-tight">{{ title }}</h1>
        <p v-if="$slots.subtitle" class="text-bodydark dark:text-bodydark1 font-medium mt-1">
          <slot name="subtitle"></slot>
        </p>
      </div>
      <div class="flex items-center gap-3">
        <slot name="actions"></slot>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex-1 w-full max-w-2xl">
          <slot name="search"></slot>
        </div>
        <div class="flex items-center gap-4">
          <slot name="filters"></slot>
        </div>
      </div>

      <BaseCard no-padding class="relative">
        <div v-if="loading" class="absolute inset-0 z-10 bg-white/50 dark:bg-boxdark/50 backdrop-blur-[1px] flex items-center justify-center">
          <div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div v-if="showBulkActions && selectionCount > 0" class="sticky top-0 z-20 bg-primary/10 dark:bg-primary/20 border-b border-primary/30 px-6 py-4">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <span class="text-sm font-semibold text-primary dark:text-white">{{ selectionCount }} {{ selectionCount === 1 ? 'item' : 'items' }} selected</span>
              <div class="h-4 w-px bg-primary/30"></div>
              <BaseButton variant="ghost" @click="$emit('selectAll')" class="!p-0 text-sm font-medium text-primary hover:text-primary/80 dark:text-white dark:hover:text-white/80">
                Select All
              </BaseButton>
              <BaseButton variant="ghost" @click="$emit('deselectAll')" class="!p-0 text-sm font-medium text-primary hover:text-primary/80 dark:text-white dark:hover:text-white/80">
                Deselect All
              </BaseButton>
            </div>
            <div class="flex items-center gap-2">
              <slot name="bulk-actions"></slot>
            </div>
          </div>
        </div>

        <slot name="table"></slot>

        <template #footer v-if="$slots.pagination">
          <slot name="pagination"></slot>
        </template>
      </BaseCard>
    </div>
  </div>
</template>
