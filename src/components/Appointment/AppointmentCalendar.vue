<script setup lang="ts">
  import { computed } from 'vue';
  import type { IAppointmentSlot } from '@/services/Appointment/appointment.interface';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import { calendarDayKey, startOfWeekMondayYmd, addDaysYmd, toLocalYmd, isSlotStartInPast, ymdIsBefore } from '@/utils/calendarDate';

  export type CalendarViewMode = 'day' | 'week' | 'month';

  const props = withDefaults(
    defineProps<{
      slots: IAppointmentSlot[];
      viewMode: CalendarViewMode;
      focusDate: string;
      /** When true, slots that already started are disabled (add appointment flow). */
      blockPastSlots?: boolean;
      /** Minimum calendar day (YYYY-MM-DD); prev navigation and past month cells respect this. */
      minFocusDateYmd?: string;
      /** Edit flow: keep this slot clickable even if booked (this appointment) or in the past. */
      pinnedSlotStartMs?: number | null;
    }>(),
    {
      blockPastSlots: true,
      minFocusDateYmd: '',
      pinnedSlotStartMs: null,
    }
  );

  const emit = defineEmits<{
    (e: 'update:viewMode', v: CalendarViewMode): void;
    (e: 'update:focusDate', v: string): void;
    (e: 'slot-select', slot: IAppointmentSlot): void;
  }>();

  const dayKey = calendarDayKey;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const slotIsPast = (s: IAppointmentSlot) => props.blockPastSlots && isSlotStartInPast(s.startTime);

  const isPinnedSlot = (s: IAppointmentSlot) => props.pinnedSlotStartMs != null && new Date(s.startTime).getTime() === props.pinnedSlotStartMs;

  const slotDisabled = (s: IAppointmentSlot) => {
    if (isPinnedSlot(s)) return false;
    return s.isBooked || slotIsPast(s);
  };

  const slotsForFocusDay = computed(() => {
    const key = props.focusDate;
    return props.slots.filter((s) => dayKey(s.startTime) === key).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  });

  const addDays = (dateStr: string, days: number) => addDaysYmd(dateStr, days);

  const prevDayDisabled = computed(() => {
    if (!props.minFocusDateYmd) return false;
    const prev = addDaysYmd(props.focusDate, -1);
    return ymdIsBefore(prev, props.minFocusDateYmd);
  });

  function goPreviousDay() {
    if (prevDayDisabled.value) return;
    emit('update:focusDate', addDaysYmd(props.focusDate, -1));
  }

  function goNextDay() {
    emit('update:focusDate', addDaysYmd(props.focusDate, 1));
  }

  function onMonthCellClick(cell: { date: string; inMonth: boolean; isBeforeMin: boolean }) {
    if (cell.isBeforeMin) return;
    emit('update:focusDate', cell.date);
    emit('update:viewMode', 'day');
  }

  const weekDays = computed(() => {
    const start = startOfWeekMondayYmd(props.focusDate);
    const days: { date: string; label: string; slots: IAppointmentSlot[] }[] = [];
    for (let i = 0; i < 7; i++) {
      const date = addDaysYmd(start, i);
      const dow = new Date(date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short' });
      const daySlots = props.slots.filter((s) => dayKey(s.startTime) === date).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      days.push({ date, label: `${dow} ${date.slice(8, 10)}`, slots: daySlots });
    }
    return days;
  });

  const monthGrid = computed(() => {
    const parts = props.focusDate.split('-').map(Number);
    const y = parts[0];
    const m = parts[1];
    if (!y || !m) {
      return {
        weeks: [] as {
          date: string;
          inMonth: boolean;
          count: number;
          booked: number;
          past: number;
          isBeforeMin: boolean;
        }[][],
      };
    }
    const first = new Date(y, m - 1, 1);
    const startPad = first.getDay() === 0 ? 6 : first.getDay() - 1;
    const daysInMonth = new Date(y, m, 0).getDate();
    const cells: { date: string; inMonth: boolean; count: number; booked: number; past: number; isBeforeMin: boolean }[] = [];
    const prevMonthLast = new Date(y, m - 1, 0).getDate();
    for (let i = startPad - 1; i >= 0; i--) {
      const d = prevMonthLast - i;
      const ds = toLocalYmd(new Date(y, m - 2, d));
      cells.push(dayCell(ds, false));
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = toLocalYmd(new Date(y, m - 1, d));
      cells.push(dayCell(ds, true));
    }
    while (cells.length % 7 !== 0) {
      const last = cells[cells.length - 1];
      const next = addDays(last.date, 1);
      cells.push(dayCell(next, false));
    }
    const weeks: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return { weeks };
  });

  function dayCell(date: string, inMonth: boolean) {
    const list = props.slots.filter((s) => dayKey(s.startTime) === date);
    const isPastSlot = (s: IAppointmentSlot) => props.blockPastSlots && isSlotStartInPast(s.startTime);
    const countsAsFree = (s: IAppointmentSlot) => {
      if (isPinnedSlot(s)) return true;
      return !s.isBooked && !isPastSlot(s);
    };
    const count = list.filter(countsAsFree).length;
    const booked = list.filter((s) => s.isBooked && !isPinnedSlot(s)).length;
    const past = list.filter((s) => isPastSlot(s) && !s.isBooked && !isPinnedSlot(s)).length;
    const isBeforeMin = !!(props.minFocusDateYmd && ymdIsBefore(date, props.minFocusDateYmd));
    return { date, inMonth, count, booked, past, isBeforeMin };
  }

  const setView = (v: CalendarViewMode) => emit('update:viewMode', v);
</script>

<template>
  <div class="rounded-md border border-stroke bg-surface p-4 dark:border-strokedark">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <BaseButton variant="outline" size="sm" :disabled="prevDayDisabled" @click="goPreviousDay">←</BaseButton>
        <span class="text-sm font-semibold text-emphasis">{{ focusDate }}</span>
        <BaseButton variant="outline" size="sm" @click="goNextDay">→</BaseButton>
      </div>
      <div class="flex gap-1">
        <BaseButton :variant="viewMode === 'day' ? 'primary' : 'outline'" size="sm" @click="setView('day')">Day</BaseButton>
        <BaseButton :variant="viewMode === 'week' ? 'primary' : 'outline'" size="sm" @click="setView('week')">Week</BaseButton>
        <BaseButton :variant="viewMode === 'month' ? 'primary' : 'outline'" size="sm" @click="setView('month')">Month</BaseButton>
      </div>
    </div>

    <!-- Day -->
    <div v-if="viewMode === 'day'" class="max-h-96 space-y-2 overflow-y-auto">
      <p v-if="slotsForFocusDay.length === 0" class="text-sm text-muted">No slots for this day.</p>
      <button
        v-for="(s, idx) in slotsForFocusDay"
        :key="idx"
        type="button"
        :disabled="slotDisabled(s)"
        :class="[
          'w-full rounded border px-3 py-2 text-left text-sm transition',
          slotDisabled(s) ? 'cursor-not-allowed border-stroke bg-meta-9/30 text-muted' : 'border-stroke hover:border-primary dark:border-strokedark',
        ]"
        @click="!slotDisabled(s) && emit('slot-select', s)"
      >
        {{ formatTime(s.startTime) }} – {{ formatTime(s.endTime) }}
        <span v-if="isPinnedSlot(s)" class="ml-2 text-xs font-medium text-primary">Current</span>
        <span v-else-if="s.isBooked" class="ml-2 text-xs font-medium text-danger">Booked</span>
        <span v-else-if="slotIsPast(s)" class="ml-2 text-xs font-medium text-muted">Past</span>
        <span v-else class="ml-2 text-xs text-success">Available</span>
      </button>
    </div>

    <!-- Week -->
    <div v-else-if="viewMode === 'week'" class="grid grid-cols-1 gap-3 md:grid-cols-7">
      <div v-for="col in weekDays" :key="col.date" class="min-h-[120px] rounded border border-stroke p-2 dark:border-strokedark">
        <p class="mb-2 text-xs font-bold text-muted">{{ col.label }}</p>
        <div class="max-h-48 space-y-1 overflow-y-auto">
          <button
            v-for="(s, idx) in col.slots"
            :key="idx"
            type="button"
            :disabled="slotDisabled(s)"
            class="block w-full truncate rounded px-1 py-0.5 text-left text-xs disabled:opacity-50"
            :class="slotDisabled(s) ? 'bg-meta-9/20 text-muted' : 'bg-success/10 hover:bg-success/20'"
            @click="!slotDisabled(s) && (emit('update:focusDate', col.date), emit('slot-select', s))"
          >
            {{ formatTime(s.startTime) }}
            <span v-if="s.isBooked" class="text-danger">·</span>
            <span v-else-if="slotIsPast(s)" class="text-muted">·</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Month -->
    <div v-else class="overflow-x-auto">
      <table class="w-full border-collapse text-center text-xs">
        <thead>
          <tr>
            <th v-for="h in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']" :key="h" class="border border-stroke py-1 dark:border-strokedark">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in monthGrid.weeks" :key="ri">
            <td
              v-for="cell in row"
              :key="cell.date"
              class="h-14 border border-stroke align-top p-1 dark:border-strokedark"
              :class="[!cell.inMonth ? 'bg-meta-9/10 text-muted' : '', focusDate === cell.date ? 'ring-2 ring-primary' : '', cell.isBeforeMin ? 'cursor-not-allowed opacity-50' : 'cursor-pointer']"
              @click="onMonthCellClick(cell)"
            >
              <div class="font-semibold">{{ cell.date.slice(8, 10) }}</div>
              <div v-if="cell.count > 0" class="text-[10px] text-success">{{ cell.count }} free</div>
              <div v-if="cell.past > 0" class="text-[10px] text-muted">{{ cell.past }} past</div>
              <div v-if="cell.booked > 0" class="text-[10px] text-muted">{{ cell.booked }} booked</div>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="mt-2 text-xs text-muted">Click a day to open the day view and pick a slot.</p>
    </div>
  </div>
</template>
