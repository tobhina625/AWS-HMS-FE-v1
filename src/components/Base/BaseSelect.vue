<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed, watch, toValue } from 'vue';
  import ChevronDownSelectIcon from '@/assets/images/SVGs/ChevronDownSelect.svg';
  import CheckmarkIcon from '@/assets/images/SVGs/Checkmark.svg';

  const props = withDefaults(
    defineProps<{
      modelValue: any;
      label: string;
      options?: any[];
      placeholder?: string;
      loading?: boolean;
      error?: boolean;
      errorMessage?: string;
      fieldRequired?: boolean;
      displayKey?: string;
      valueKey?: string;
      hasMore?: boolean;
      maxVisibleItems?: number;
      emptyMessage?: string;
    }>(),
    { options: () => [], maxVisibleItems: 0, emptyMessage: 'No results' }
  );

  const emit = defineEmits(['update:modelValue', 'search', 'load-more', 'change']);

  const isOpen = ref(false);
  const searchTerm = ref('');
  const dropdownRef = ref<HTMLElement | null>(null);
  const triggerRef = ref<HTMLElement | null>(null);
  const highlightedIndex = ref(-1);
  const visibleCount = ref(0);

  const displayKey = computed(() => props.displayKey || 'name');
  const valueKey = computed(() => props.valueKey || 'id');

  /** Supports plain arrays and refs/computed passed from parents (nested refs are not unwrapped in templates). */
  const optionsList = computed(() => {
    const raw = toValue(props.options);
    return Array.isArray(raw) ? raw : [];
  });

  const selectedOption = computed(() => optionsList.value.find((opt) => String(opt[valueKey.value]) === String(props.modelValue)));

  const filteredOptions = computed(() => optionsList.value.filter((opt) => opt[displayKey.value]?.toLowerCase().includes(searchTerm.value.toLowerCase())));

  const displayedOptions = computed(() => {
    const filtered = filteredOptions.value;
    if (props.maxVisibleItems <= 0) return filtered;
    return filtered.slice(0, visibleCount.value);
  });

  const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
      searchTerm.value = '';
      highlightedIndex.value = -1;
      visibleCount.value = props.maxVisibleItems > 0 ? props.maxVisibleItems : filteredOptions.value.length;
    }
  };

  const selectOption = (option: any) => {
    emit('update:modelValue', option[valueKey.value]);
    emit('change', option);
    isOpen.value = false;
    highlightedIndex.value = -1;
    // Return focus to trigger after selection
    triggerRef.value?.focus();
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!isOpen.value) {
        toggleDropdown();
      } else if (highlightedIndex.value >= 0 && filteredOptions.value[highlightedIndex.value]) {
        selectOption(filteredOptions.value[highlightedIndex.value]);
      }
    } else if (event.key === 'Escape' && isOpen.value) {
      isOpen.value = false;
      highlightedIndex.value = -1;
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen.value) {
        toggleDropdown();
      } else {
        highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredOptions.value.length - 1);
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (isOpen.value) {
        highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
      }
    } else if (event.key === 'Tab' && isOpen.value) {
      // Allow tab to close dropdown and move to next field
      isOpen.value = false;
      highlightedIndex.value = -1;
    }
  };

  const handleScroll = (e: Event) => {
    const el = e.target as HTMLElement;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      if (props.maxVisibleItems > 0 && visibleCount.value < filteredOptions.value.length) {
        visibleCount.value = Math.min(visibleCount.value + props.maxVisibleItems, filteredOptions.value.length);
      } else if (props.hasMore && !props.loading) {
        emit('load-more');
      }
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
      isOpen.value = false;
    }
  };

  watch(
    [optionsList, searchTerm],
    () => {
      if (props.maxVisibleItems > 0 && isOpen.value) {
        visibleCount.value = Math.min(props.maxVisibleItems, filteredOptions.value.length);
      }
    },
    { immediate: false }
  );

  onMounted(() => document.addEventListener('click', handleClickOutside));
  onUnmounted(() => document.removeEventListener('click', handleClickOutside));
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full relative" ref="dropdownRef">
    <label v-if="label" class="block text-sm font-medium text-emphasis">
      {{ label }}
      <span v-if="fieldRequired" class="text-meta-1 ml-0.5">*</span>
    </label>

    <!-- Trigger -->
    <div
      ref="triggerRef"
      tabindex="0"
      role="combobox"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
      :aria-label="label"
      @click="toggleDropdown"
      @keydown="handleKeydown"
      class="relative flex items-center w-full rounded-lg border bg-transparent py-3 px-4 text-sm font-medium cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:bg-form-input"
      :class="[error ? 'border-meta-1' : isOpen ? 'border-primary dark:border-primary' : 'border-stroke dark:border-form-strokedark']"
    >
      <span v-if="selectedOption" class="text-emphasis">{{ selectedOption[displayKey] }}</span>
      <span v-else class="text-gray-400 dark:text-gray-500">{{ placeholder || 'Select an option…' }}</span>

      <ChevronDownSelectIcon class="absolute right-4 w-4 h-4 text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" />
    </div>

    <!-- Dropdown panel -->
    <transition
      enter-active-class="transition duration-75 ease-out"
      enter-from-class="opacity-0 -translate-y-0.5"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-0.5"
    >
      <div v-if="isOpen" class="absolute top-full left-0 right-0 mt-1 z-[200] bg-surface border border-stroke dark:border-strokedark rounded-lg shadow-lg overflow-hidden min-h-[80px] w-full">
        <!-- Search -->
        <div class="p-2 border-b border-stroke dark:border-strokedark">
          <input
            v-model="searchTerm"
            @input="emit('search', searchTerm)"
            autofocus
            placeholder="Search…"
            class="w-full rounded-md border border-stroke dark:border-strokedark bg-gray-50 dark:bg-form-input px-3 py-2 text-sm outline-none focus:border-primary dark:focus:border-primary text-emphasis"
          />
        </div>

        <!-- Options list -->
        <div class="max-h-56 overflow-y-auto" @scroll="handleScroll" role="listbox">
          <div
            v-for="(option, index) in displayedOptions"
            :key="option[valueKey]"
            role="option"
            :aria-selected="String(option[valueKey]) === String(modelValue)"
            @click.stop="selectOption(option)"
            @mouseenter="highlightedIndex = index"
            class="flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer text-emphasis hover:bg-primary/5 hover:text-primary transition-colors"
            :class="{
              'bg-primary/5 text-primary font-semibold': String(option[valueKey]) === String(modelValue),
              'bg-primary/10': highlightedIndex === index,
            }"
          >
            {{ option[displayKey] }}
            <CheckmarkIcon v-if="String(option[valueKey]) === String(modelValue)" class="w-4 h-4" />
          </div>

          <div v-if="loading" class="flex justify-center py-4">
            <div class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>

          <div v-if="!loading && displayedOptions.length === 0" class="py-8 text-center text-xs text-gray-400 uppercase tracking-widest font-semibold">{{ emptyMessage }}</div>
        </div>
      </div>
    </transition>

    <!-- Error -->
    <p v-if="error" class="text-meta-1 text-xs font-medium pl-0.5">
      {{ errorMessage || 'Selection required' }}
    </p>
  </div>
</template>
