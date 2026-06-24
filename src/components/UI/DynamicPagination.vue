<script setup lang="ts">
  import { computed } from 'vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import PreviousPageIcon from '@/assets/images/SVGs/Chevron-left.svg';
  import NextPageIcon from '@/assets/images/SVGs/ChevronRight.svg';

  const props = withDefaults(
    defineProps<{
      currentPage: number;
      totalPages: number;
      totalElements: number;
      itemsPerPage: number;
      startIndex: number;
      pageSizeOptions?: number[];
    }>(),
    {
      pageSizeOptions: () => [10, 25, 50, 100],
    }
  );

  const emit = defineEmits<{
    (e: 'change-page', page: number): void;
    (e: 'change-page-size', size: number): void;
  }>();

  const startRecord = computed(() => {
    return props.totalElements > 0 ? props.startIndex * props.itemsPerPage + 1 : 0;
  });

  const endRecord = computed(() => {
    if (props.totalElements === 0) return 0;
    const end = (props.startIndex + 1) * props.itemsPerPage;
    return end > props.totalElements ? props.totalElements : end;
  });

  const canGoFirst = computed(() => props.currentPage > 0 && props.totalElements > 0);
  const canGoPrevious = computed(() => props.currentPage > 0 && props.totalElements > 0);
  const canGoNext = computed(() => props.currentPage < props.totalPages - 1 && props.totalElements > 0);
  const canGoLast = computed(() => props.currentPage < props.totalPages - 1 && props.totalElements > 0);

  const goToFirst = () => {
    if (canGoFirst.value) emit('change-page', 0);
  };

  const goToPrevious = () => {
    if (canGoPrevious.value) emit('change-page', props.currentPage - 1);
  };

  const goToNext = () => {
    if (canGoNext.value) emit('change-page', props.currentPage + 1);
  };

  const goToLast = () => {
    if (canGoLast.value) emit('change-page', props.totalPages - 1);
  };

  const goToPage = (page: number) => {
    const pageIndex = page - 1;
    if (pageIndex >= 0 && pageIndex < props.totalPages) {
      emit('change-page', pageIndex);
    }
  };

  const visiblePages = computed(() => {
    const total = props.totalPages;
    if (total <= 0) return [];
    if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1);

    const current = props.currentPage + 1; // 1-based

    // Sliding window of 3 pages centered on current when possible
    let start = Math.max(1, current - 1);
    let end = Math.min(total, current + 1);

    if (current <= 2) {
      start = 1;
      end = Math.min(3, total);
    } else if (current >= total - 2) {
      // Last 3 pages: show ... 48 49 50
      start = Math.max(1, total - 2);
      end = total;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  const showLeadingEllipsis = computed(() => {
    const pages = visiblePages.value;
    return pages.length > 0 && pages[0] > 1;
  });

  const showTrailingEllipsis = computed(() => {
    const pages = visiblePages.value;
    return pages.length > 0 && pages[pages.length - 1] < props.totalPages;
  });

  const onPageSizeChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const size = parseInt(target.value, 10);
    if (!isNaN(size)) emit('change-page-size', size);
  };

  const showPageSizeSelector = computed(() => props.pageSizeOptions.length > 0);
</script>

<template>
  <div
    class="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 w-full p-4 sm:p-6 bg-gray-50/30 dark:bg-boxdark/20 border-t border-gray-100 dark:border-strokedark transition-colors"
  >
    <!-- Left: Records per page + Display info -->
    <div class="flex flex-wrap items-center gap-4 w-full sm:w-auto">
      <div v-if="showPageSizeSelector" class="flex items-center gap-2">
        <label for="page-size" class="text-sm font-medium text-muted whitespace-nowrap">Per page</label>
        <select
          id="page-size"
          :value="itemsPerPage"
          class="h-9 px-3 rounded-lg border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-emphasis text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          @change="onPageSizeChange"
        >
          <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>
      <div class="text-sm font-bold text-muted uppercase tracking-widest leading-none">
        Displaying
        <span class="text-emphasis">{{ startRecord }}</span>
        -
        <span class="text-emphasis">{{ endRecord }}</span>
        of
        <span class="text-emphasis">{{ totalElements }}</span>
      </div>
    </div>

    <!-- Right: Pagination buttons -->
    <div class="flex items-center gap-1 sm:gap-2">
      <BaseButton size="sm" rounded="xl" variant="ghost" :disabled="!canGoFirst" class="!px-2.5 sm:!px-3" title="First page" @click="goToFirst">
        <span class="text-base font-bold">&laquo;</span>
      </BaseButton>
      <BaseButton size="sm" rounded="xl" :disabled="!canGoPrevious" class="!px-2.5 sm:!px-3" title="Previous page" @click="goToPrevious">
        <PreviousPageIcon class="w-4 h-4" />
      </BaseButton>

      <div class="flex items-center gap-1 mx-1 sm:mx-2">
        <template v-if="visiblePages.length > 0">
          <span v-if="showLeadingEllipsis" class="px-2 text-muted text-sm">...</span>
          <BaseButton
            v-for="page in visiblePages"
            :key="page"
            @click.prevent="goToPage(page)"
            :variant="page === currentPage + 1 ? 'primary' : 'ghost'"
            class="!w-9 !h-9 sm:!w-10 sm:!h-10 !p-0 !text-sm !font-black !rounded-xl transition-all duration-300"
            :class="[page === currentPage + 1 ? 'shadow-lg shadow-primary/30 scale-110' : 'text-gray-400 hover:text-emphasis']"
          >
            {{ page }}
          </BaseButton>
          <span v-if="showTrailingEllipsis" class="px-2 text-muted text-sm">...</span>
        </template>
      </div>

      <BaseButton size="sm" rounded="xl" :disabled="!canGoNext" class="!px-2.5 sm:!px-3" title="Next page" @click="goToNext">
        <NextPageIcon class="w-4 h-4" />
      </BaseButton>
      <BaseButton size="sm" rounded="xl" variant="ghost" :disabled="!canGoLast" class="!px-2.5 sm:!px-3" title="Last page" @click="goToLast">
        <span class="text-base font-bold">&raquo;</span>
      </BaseButton>
    </div>
  </div>
</template>
