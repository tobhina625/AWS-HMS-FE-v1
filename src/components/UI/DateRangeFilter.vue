<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      placeholder?: string;
    }>(),
    {
      modelValue: '',
      placeholder: 'Filter by Date',
    }
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'change', value: string): void;
  }>();

  const isOpen = ref(false);
  const containerRef = ref<HTMLElement | null>(null);

  // Calendar View State: Current display month & year
  const today = new Date();
  const currentViewDate = ref(new Date(today.getFullYear(), today.getMonth(), 1));

  // Selection state
  const selectedStartDate = ref<Date | null>(null);
  const selectedEndDate = ref<Date | null>(null);
  const hoveringDate = ref<Date | null>(null);
  const activePreset = ref<string>('');

  // Preset options
  const presets = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'last7days', label: 'Last 7 Days' },
    { id: 'last30days', label: 'Last 30 Days' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'lastMonth', label: 'Last Month' },
  ];

  // Formatting helpers
  const formatIsoDate = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseIsoDate = (str: string): Date | null => {
    if (!str) return null;
    const parts = str.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d);
      }
    }
    return null;
  };

  const formatDisplayDate = (d: Date): string => {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Sync internal state with external modelValue
  const syncFromModelValue = (val: string) => {
    activePreset.value = '';
    selectedStartDate.value = null;
    selectedEndDate.value = null;

    if (!val) {
      return;
    }

    // Check if preset
    const matchedPreset = presets.find((p) => p.id.toLowerCase() === val.toLowerCase());
    if (matchedPreset && matchedPreset.id !== 'all') {
      activePreset.value = matchedPreset.id;
      applyPresetDates(matchedPreset.id, false);
      return;
    }

    // Check if comma-separated range
    if (val.includes(',')) {
      const [startStr, endStr] = val.split(',');
      const s = parseIsoDate(startStr);
      const e = parseIsoDate(endStr);
      if (s) {
        selectedStartDate.value = s;
        currentViewDate.value = new Date(s.getFullYear(), s.getMonth(), 1);
      }
      if (e) {
        selectedEndDate.value = e;
      }
      return;
    }

    // Check single date
    const single = parseIsoDate(val);
    if (single) {
      selectedStartDate.value = single;
      selectedEndDate.value = single;
      currentViewDate.value = new Date(single.getFullYear(), single.getMonth(), 1);
    }
  };

  watch(
    () => props.modelValue,
    (newVal) => {
      syncFromModelValue(newVal || '');
    },
    { immediate: true }
  );

  // Label to show on the trigger button
  const displayLabel = computed(() => {
    if (!props.modelValue) return props.placeholder;

    const matchedPreset = presets.find((p) => p.id.toLowerCase() === props.modelValue.toLowerCase());
    if (matchedPreset && matchedPreset.id !== 'all') {
      return matchedPreset.label;
    }

    if (selectedStartDate.value && selectedEndDate.value) {
      if (formatIsoDate(selectedStartDate.value) === formatIsoDate(selectedEndDate.value)) {
        return formatDisplayDate(selectedStartDate.value);
      }
      return `${formatDisplayDate(selectedStartDate.value)} – ${formatDisplayDate(selectedEndDate.value)}`;
    }

    if (selectedStartDate.value) {
      return formatDisplayDate(selectedStartDate.value);
    }

    return props.placeholder;
  });

  const hasActiveFilter = computed(() => !!props.modelValue);

  // Preset handler
  const applyPresetDates = (presetId: string, emitChange = true) => {
    activePreset.value = presetId;
    const now = new Date();
    const t = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let val = '';
    if (presetId === 'all') {
      selectedStartDate.value = null;
      selectedEndDate.value = null;
      val = '';
    } else if (presetId === 'today') {
      selectedStartDate.value = t;
      selectedEndDate.value = t;
      val = 'today';
    } else if (presetId === 'yesterday') {
      const y = new Date(t);
      y.setDate(y.getDate() - 1);
      selectedStartDate.value = y;
      selectedEndDate.value = y;
      val = 'yesterday';
    } else if (presetId === 'last7days') {
      const start = new Date(t);
      start.setDate(start.getDate() - 6);
      selectedStartDate.value = start;
      selectedEndDate.value = t;
      val = `${formatIsoDate(start)},${formatIsoDate(t)}`;
    } else if (presetId === 'last30days') {
      const start = new Date(t);
      start.setDate(start.getDate() - 29);
      selectedStartDate.value = start;
      selectedEndDate.value = t;
      val = `${formatIsoDate(start)},${formatIsoDate(t)}`;
    } else if (presetId === 'thisMonth') {
      const start = new Date(t.getFullYear(), t.getMonth(), 1);
      selectedStartDate.value = start;
      selectedEndDate.value = t;
      val = `${formatIsoDate(start)},${formatIsoDate(t)}`;
    } else if (presetId === 'lastMonth') {
      const start = new Date(t.getFullYear(), t.getMonth() - 1, 1);
      const end = new Date(t.getFullYear(), t.getMonth(), 0);
      selectedStartDate.value = start;
      selectedEndDate.value = end;
      val = `${formatIsoDate(start)},${formatIsoDate(end)}`;
    }

    if (selectedStartDate.value) {
      currentViewDate.value = new Date(selectedStartDate.value.getFullYear(), selectedStartDate.value.getMonth(), 1);
    }

    if (emitChange) {
      emit('update:modelValue', val);
      emit('change', val);
      isOpen.value = false;
    }
  };

  // Calendar matrix calculation
  const calendarMonths = computed(() => {
    const year = currentViewDate.value.getFullYear();
    const month = currentViewDate.value.getMonth();

    const getMonthDays = (y: number, m: number) => {
      const firstDayOfMonth = new Date(y, m, 1);
      const lastDayOfMonth = new Date(y, m + 1, 0);

      const daysInMonth = lastDayOfMonth.getDate();
      const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun

      const days: { date: Date; isCurrentMonth: boolean; isToday: boolean; isSelectedStart: boolean; isSelectedEnd: boolean; isInRange: boolean }[] = [];

      // Previous month trailing days
      const prevMonthLastDay = new Date(y, m, 0).getDate();
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const d = new Date(y, m - 1, prevMonthLastDay - i);
        days.push(createDayObject(d, false));
      }

      // Current month days
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(y, m, i);
        days.push(createDayObject(d, true));
      }

      // Next month leading days (fill up to 42 cells or full weeks)
      const remaining = (7 - (days.length % 7)) % 7;
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(y, m + 1, i);
        days.push(createDayObject(d, false));
      }

      return {
        year: y,
        month: m,
        title: firstDayOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        days,
      };
    };

    return [getMonthDays(year, month)];
  });

  const createDayObject = (d: Date, isCurrentMonth: boolean) => {
    const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const isToday = formatIsoDate(dateOnly) === formatIsoDate(today);

    let isSelectedStart = false;
    let isSelectedEnd = false;
    let isInRange = false;

    if (selectedStartDate.value) {
      const s = new Date(selectedStartDate.value.getFullYear(), selectedStartDate.value.getMonth(), selectedStartDate.value.getDate());
      isSelectedStart = dateOnly.getTime() === s.getTime();

      const e = selectedEndDate.value
        ? new Date(selectedEndDate.value.getFullYear(), selectedEndDate.value.getMonth(), selectedEndDate.value.getDate())
        : hoveringDate.value
          ? new Date(hoveringDate.value.getFullYear(), hoveringDate.value.getMonth(), hoveringDate.value.getDate())
          : null;

      if (e) {
        isSelectedEnd = dateOnly.getTime() === e.getTime();
        const minTime = Math.min(s.getTime(), e.getTime());
        const maxTime = Math.max(s.getTime(), e.getTime());
        isInRange = dateOnly.getTime() >= minTime && dateOnly.getTime() <= maxTime;
      }
    }

    return {
      date: dateOnly,
      isCurrentMonth,
      isToday,
      isSelectedStart,
      isSelectedEnd,
      isInRange,
    };
  };

  // Day click logic (Range selection: 1st click = start date, 2nd click = end date)
  const handleDayClick = (dayDate: Date) => {
    activePreset.value = '';

    if (!selectedStartDate.value || (selectedStartDate.value && selectedEndDate.value)) {
      // First click: reset and pick start date
      selectedStartDate.value = dayDate;
      selectedEndDate.value = null;
    } else {
      // Second click: set end date
      if (dayDate < selectedStartDate.value) {
        selectedEndDate.value = selectedStartDate.value;
        selectedStartDate.value = dayDate;
      } else {
        selectedEndDate.value = dayDate;
      }
    }
  };

  const handleDayHover = (dayDate: Date) => {
    if (selectedStartDate.value && !selectedEndDate.value) {
      hoveringDate.value = dayDate;
    }
  };

  // Month navigation
  const prevMonth = () => {
    currentViewDate.value = new Date(currentViewDate.value.getFullYear(), currentViewDate.value.getMonth() - 1, 1);
  };

  const nextMonth = () => {
    currentViewDate.value = new Date(currentViewDate.value.getFullYear(), currentViewDate.value.getMonth() + 1, 1);
  };

  // Apply custom range
  const applyCustomSelection = () => {
    if (selectedStartDate.value) {
      const startStr = formatIsoDate(selectedStartDate.value);
      const endStr = selectedEndDate.value ? formatIsoDate(selectedEndDate.value) : startStr;

      const finalVal = startStr === endStr ? startStr : `${startStr},${endStr}`;
      emit('update:modelValue', finalVal);
      emit('change', finalVal);
    } else {
      emit('update:modelValue', '');
      emit('change', '');
    }
    isOpen.value = false;
  };

  // Clear filter
  const clearFilter = (event?: MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    selectedStartDate.value = null;
    selectedEndDate.value = null;
    activePreset.value = '';
    emit('update:modelValue', '');
    emit('change', '');
    isOpen.value = false;
  };

  // Click outside to close
  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
      isOpen.value = false;
    }
  };

  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<template>
  <div ref="containerRef" class="relative inline-block text-left select-none">
    <!-- Trigger Button -->
    <button
      type="button"
      @click="isOpen = !isOpen"
      :class="[
        'flex items-center gap-2.5 px-4 h-[50px] min-h-[50px] text-sm font-medium rounded-xl border transition-all duration-150 shadow-sm focus:outline-none select-none',
        hasActiveFilter
          ? 'bg-primary/10 border-primary text-primary dark:bg-primary/20 dark:border-primary/50 dark:text-primary font-semibold'
          : 'bg-surface border-stroke text-emphasis hover:border-bodydark2/50 dark:bg-boxdark dark:border-strokedark dark:text-bodydark1'
      ]"
    >
      <!-- Calendar Icon -->
      <svg class="w-5 h-5 shrink-0 text-current opacity-80" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
      </svg>

      <!-- Label -->
      <span class="max-w-[220px] truncate text-left text-sm font-medium">
        {{ displayLabel }}
      </span>

      <!-- Clear Button (when filter active) -->
      <span
        v-if="hasActiveFilter"
        @click="clearFilter"
        title="Clear date filter"
        class="inline-flex items-center justify-center w-5 h-5 ml-0.5 rounded-full hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
      >
        <svg class="w-3.5 h-3.5 text-current" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </span>

      <!-- Dropdown Chevron -->
      <svg
        class="w-4 h-4 ml-0.5 text-current opacity-70 transition-transform duration-200 shrink-0"
        :class="{ 'rotate-180': isOpen }"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- Popover Dropdown Panel -->
    <div
      v-if="isOpen"
      class="absolute right-0 z-50 mt-2 bg-white dark:bg-boxdark rounded-2xl shadow-2xl border border-stroke dark:border-strokedark p-4 w-[340px] sm:w-[480px] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
    >
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Sidebar: Presets -->
        <div class="flex sm:flex-col gap-1 border-b sm:border-b-0 sm:border-r border-stroke dark:border-strokedark pb-3 sm:pb-0 sm:pr-3 overflow-x-auto sm:overflow-visible shrink-0 sm:w-[130px]">
          <div class="text-[11px] font-bold uppercase tracking-wider text-bodydark2 mb-1 hidden sm:block">Presets</div>
          <button
            v-for="p in presets"
            :key="p.id"
            type="button"
            @click="applyPresetDates(p.id, true)"
            :class="[
              'px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors whitespace-nowrap',
              activePreset.toLowerCase() === p.id.toLowerCase() || (!hasActiveFilter && p.id === 'all')
                ? 'bg-primary text-white dark:text-white font-semibold shadow-sm'
                : 'text-emphasis hover:bg-bodydark2/10 dark:text-bodydark1 dark:hover:bg-strokedark'
            ]"
          >
            {{ p.label }}
          </button>
        </div>

        <!-- Main Calendar Area -->
        <div class="flex-1">
          <div v-for="m in calendarMonths" :key="`${m.year}-${m.month}`" class="space-y-3">
            <!-- Header: Month Title & Navigation -->
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-emphasis dark:text-white">{{ m.title }}</span>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  @click="prevMonth"
                  class="p-1.5 rounded-lg text-emphasis hover:bg-bodydark2/10 dark:text-bodydark1 dark:hover:bg-strokedark transition-colors"
                  title="Previous month"
                >
                  <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button
                  type="button"
                  @click="nextMonth"
                  class="p-1.5 rounded-lg text-emphasis hover:bg-bodydark2/10 dark:text-bodydark1 dark:hover:bg-strokedark transition-colors"
                  title="Next month"
                >
                  <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Day-of-week Header -->
            <div class="grid grid-cols-7 gap-1 text-center">
              <span v-for="d in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" :key="d" class="text-[11px] font-semibold text-bodydark2 py-1">
                {{ d }}
              </span>
            </div>

            <!-- Calendar Days Grid -->
            <div class="grid grid-cols-7 gap-1">
              <button
                v-for="(day, idx) in m.days"
                :key="idx"
                type="button"
                @click="handleDayClick(day.date)"
                @mouseenter="handleDayHover(day.date)"
                :class="[
                  'relative h-8 text-xs font-medium rounded-lg flex items-center justify-center transition-all',
                  !day.isCurrentMonth ? 'text-bodydark2/40 dark:text-bodydark2/30' : 'text-emphasis dark:text-bodydark1',
                  day.isSelectedStart || day.isSelectedEnd ? 'bg-primary text-white font-bold shadow-sm' : '',
                  day.isInRange && !day.isSelectedStart && !day.isSelectedEnd ? 'bg-primary/15 text-primary dark:bg-primary/25 dark:text-primary rounded-none' : '',
                  day.isToday && !day.isSelectedStart && !day.isSelectedEnd ? 'border border-primary font-bold' : '',
                  day.isCurrentMonth && !day.isSelectedStart && !day.isSelectedEnd && !day.isInRange ? 'hover:bg-bodydark2/10 dark:hover:bg-strokedark' : ''
                ]"
              >
                {{ day.date.getDate() }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Row: Footer -->
      <div class="flex items-center justify-between pt-3 border-t border-stroke dark:border-strokedark">
        <button
          type="button"
          @click="clearFilter"
          class="text-xs font-medium text-bodydark2 hover:text-danger dark:hover:text-danger transition-colors px-2 py-1"
        >
          Reset
        </button>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="isOpen = false"
            class="px-3 py-1.5 text-xs font-medium rounded-lg border border-stroke dark:border-strokedark text-emphasis dark:text-bodydark1 hover:bg-bodydark2/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="applyCustomSelection"
            class="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
