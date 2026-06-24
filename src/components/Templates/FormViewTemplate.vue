<script setup lang="ts">
  import BaseCard from '../Base/BaseCard.vue';
  import BaseButton from '../Base/BaseButton.vue';

  defineProps<{
    title: string;
    breadcrumbTitle: string;
    breadcrumbSlug?: string;
    isSubmitting?: boolean;
    submitLabel?: string;
    cancelLabel?: string;
    hideFooter?: boolean;
  }>();

  defineEmits(['submit', 'cancel']);
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <!-- Header Area -->
    <div class="flex flex-col gap-1">
      <h2 class="text-2xl font-black text-emphasis tracking-tight">{{ title }}</h2>
      <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
        <span>Administration</span>
        <span class="text-gray-200 dark:text-gray-600">/</span>
        <span>{{ breadcrumbTitle }}</span>
        <span class="text-gray-200 dark:text-gray-600">/</span>
        <span class="text-primary">{{ breadcrumbSlug ?? 'New Entry' }}</span>
      </div>
    </div>

    <form @submit.prevent="$emit('submit')" class="space-y-6">
      <BaseCard>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 p-2 pb-2">
          <slot></slot>
        </div>

        <template #footer v-if="!hideFooter">
          <div class="flex items-center justify-end gap-4 pt-4 mt-6">
            <BaseButton type="button" variant="outline" @click="$emit('cancel')" :disabled="isSubmitting" class="bg-elevated hover:bg-gray-100 dark:hover:bg-meta-4/80">
              {{ cancelLabel || 'Discard Changes' }}
            </BaseButton>

            <BaseButton type="submit" :loading="isSubmitting">
              {{ submitLabel || 'Save Information' }}
            </BaseButton>
          </div>
        </template>
      </BaseCard>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <slot name="extra"></slot>
      </div>
    </form>
  </div>
</template>
