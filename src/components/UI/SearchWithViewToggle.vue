<script setup lang="ts">
  import ChartBarIcon from '@/assets/images/SVGs/ChartBarIcon.svg';
  import SearchMagnifyIcon from '@/assets/images/SVGs/SearchMagnifyIcon.svg';
  import SearchBar from '@/components/UI/SearchBar.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import DateRangeFilter from '@/components/UI/DateRangeFilter.vue';

  const props = defineProps<{
    modelValue: 'table' | 'grid';
    placeholder?: string;
    addButtonRoute?: string;
    showAdd?: boolean;
    searchBarClass?: string;
    dateFilter?: string;
    showDateFilter?: boolean;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [value: 'table' | 'grid'];
    'update:dateFilter': [value: string];
    search: [term: string];
    'date-filter': [value: string];
  }>();

  const setViewMode = (mode: 'table' | 'grid') => {
    emit('update:modelValue', mode);
  };

  const handleSearch = (term: string) => {
    emit('search', term);
  };

  const handleDateFilterChange = (value: string) => {
    emit('update:dateFilter', value);
    emit('date-filter', value);
  };
</script>

<template>
  <div class="flex w-full items-center gap-4">
    <SearchBar
      :placeholder="props.placeholder"
      :add-button-route="props.addButtonRoute"
      :show-add="props.showAdd ?? true"
      :class="props.searchBarClass ?? 'flex-1 max-w-2xl mr-auto'"
      @search-term="handleSearch"
    />

    <div class="ml-auto flex shrink-0 items-center gap-4">
      <div class="flex gap-2 bg-surface rounded-xl p-1 border border-stroke dark:border-strokedark">
        <BaseButton
          variant="ghost"
          @click="setViewMode('table')"
          :class="['px-4 py-2 rounded-lg font-medium transition-colors', modelValue === 'table' ? 'bg-primary text-light dark:text-emphasis' : 'text-emphasis hover:bg-bodydark2/10']"
        >
          <SearchMagnifyIcon class="w-5 h-5" />
        </BaseButton>
        <BaseButton
          variant="ghost"
          @click="setViewMode('grid')"
          :class="['px-4 py-2 rounded-lg font-medium transition-colors', modelValue === 'grid' ? 'bg-primary text-light dark:text-emphasis' : 'text-emphasis hover:bg-bodydark2/10']"
        >
          <ChartBarIcon class="w-5 h-5" />
        </BaseButton>
      </div>

      <div v-if="props.showDateFilter" class="relative">
        <DateRangeFilter :model-value="props.dateFilter ?? ''" @update:model-value="handleDateFilterChange" />
      </div>
    </div>
  </div>
</template>
