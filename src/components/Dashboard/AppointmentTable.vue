<template>
  <div class="rounded-2xl border border-white/40 bg-surface shadow-xl dark:border-strokedark/50 overflow-hidden transition-all duration-300">
    <!-- Header -->
    <div class="p-6 pb-0 flex justify-between items-center">
      <h2 class="text-xl font-extrabold text-emphasis tracking-tight">Schedule</h2>
      <div class="px-3 py-1 bg-primary/10 rounded-full">
        <span class="text-sm font-bold text-primary">{{ currentMonth }} {{ currentYear }}</span>
      </div>
    </div>

    <!-- Calendar Navigation -->
    <div class="px-6 py-4 flex items-center justify-between gap-2">
      <BaseButton
        variant="ghost"
        size="sm"
        type="button"
        class="w-9 h-9 !p-0 flex items-center justify-center rounded-xl bg-elevated text-muted hover:bg-primary hover:text-white shrink-0 border border-stroke dark:border-strokedark"
        @click="prevDay"
        aria-label="Previous day"
        title="Previous day"
      >
        <ChevronLeftIcon class="w-5 h-5 shrink-0" />
      </BaseButton>

      <div class="flex flex-1 justify-around px-2">
        <div
          v-for="(day, date) in days"
          :key="date"
          :class="[
            'flex flex-col items-center justify-center w-10 h-14 rounded-xl cursor-pointer transition-all duration-300',
            selectedDay === day.date ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' : 'text-muted hover:bg-elevated',
          ]"
          @click="selectDay(day)"
        >
          <span class="text-[10px] uppercase font-black">{{ day.day[0] }}</span>
          <span class="text-sm font-bold">{{ formatDate(day.date) }}</span>
        </div>
      </div>

      <BaseButton
        variant="ghost"
        size="sm"
        type="button"
        class="w-9 h-9 !p-0 flex items-center justify-center rounded-xl bg-elevated text-muted hover:bg-primary hover:text-white shrink-0 border border-stroke dark:border-strokedark"
        @click="nextDay"
        aria-label="Next day"
        title="Next day"
      >
        <ChevronRightIcon class="w-5 h-5 shrink-0" />
      </BaseButton>
    </div>

    <!-- Appointment List -->
    <div
      class="px-6 pb-6 space-y-3 min-h-[300px] max-h-[500px] overflow-y-auto custom-scrollbar"
      :class="{ 'flex flex-col justify-center items-center': filteredAppointments.length === 0 && !isLoadingAppointments }"
    >
      <div v-if="isLoadingAppointments" class="flex flex-col items-center py-10">
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm font-medium text-muted mt-2">Loading appointments...</p>
      </div>
      <div v-else-if="filteredAppointments.length === 0" class="text-center py-10 opacity-40">
        <div class="bg-elevated w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <CalendarIcon class="w-8 h-8 text-muted" />
        </div>
        <p class="text-sm font-bold text-muted italic uppercase tracking-widest leading-none">Free Day</p>
      </div>

      <div
        v-for="appointment in filteredAppointments"
        :key="appointment.id"
        class="group flex items-center p-3 bg-elevated rounded-2xl border border-transparent hover:border-primary/20 hover:bg-white dark:hover:bg-strokedark transition-all duration-300"
      >
        <div class="relative">
          <img :src="appointment.image" class="w-12 h-12 rounded-xl object-cover shadow-sm bg-primary/20" />
          <div class="absolute -right-1 -bottom-1 w-4 h-4 bg-success border-2 border-white dark:border-boxdark rounded-full"></div>
        </div>

        <div class="flex-1 ml-4 overflow-hidden">
          <h3 class="font-bold text-emphasis truncate leading-tight">{{ appointment.name }}</h3>
          <p class="text-[11px] font-semibold text-muted uppercase tracking-tighter truncate">{{ appointment.type }}</p>
        </div>

        <div class="text-right">
          <p class="text-xs font-black text-primary">{{ appointment.time }}</p>
          <p class="text-[10px] font-bold text-muted">{{ formatCurrency(appointment.cost) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import BaseButton from '@/components/Base/BaseButton.vue';
  import CalendarIcon from '@/assets/images/SVGs/CalendarIcon.svg';
  import ChevronLeftIcon from '@/assets/images/SVGs/ChevronLeftIcon.svg';
  import ChevronRightIcon from '@/assets/images/SVGs/ChevronRightIcon.svg';

  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import AppointmentServices from '@/services/Appointment/appointment.services';
  import defaultAvatar from '@/assets/images/user/doctor1.png';

  // Helper: always use local time for YYYY-MM-DD
  function getLocalDateString(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Helper: parse YYYY-MM-DD as local date
  function parseLocalDate(str: string): Date {
    const [year, month, day] = str.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // State
  const today = new Date();
  const selectedDay = ref(getLocalDateString(today));
  type DayItem = { day: string; date: string };
  type AppointmentDisplay = { id: string | number; name: string; type: string; time: string; cost: number; image: string };

  const weekStart = ref<string | null>(null);
  const days = ref<DayItem[]>([]);

  const appointmentService = new AppointmentServices();
  const appointmentsByDate = ref<Record<string, AppointmentDisplay[]>>({});
  const isLoadingAppointments = ref(false);

  const mapAppointmentToDisplay = (apt: {
    id?: unknown;
    patient?: { firstName?: string; lastName?: string } | null;
    appointmentTypes?: { typeDescription?: string } | null;
    reason?: string;
    startTime?: string | Date;
  }): AppointmentDisplay => ({
    id: typeof apt.id === 'string' || typeof apt.id === 'number' ? apt.id : 0,
    name: apt.patient ? `${apt.patient.firstName || ''} ${apt.patient.lastName || ''}`.trim() || 'Patient' : 'Patient',
    type: apt.appointmentTypes?.typeDescription || apt.reason || 'Consultation',
    time: apt.startTime ? new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
    cost: 0,
    image: defaultAvatar,
  });

  const fetchAppointmentsForDate = async (dateStr: string) => {
    if (appointmentsByDate.value[dateStr]) return;
    isLoadingAppointments.value = true;
    try {
      const response = await appointmentService.getAppointmentsByDate(dateStr);
      const appointments = response?.data || response;
      const list = Array.isArray(appointments) ? appointments.map(mapAppointmentToDisplay) : [];
      appointmentsByDate.value = { ...appointmentsByDate.value, [dateStr]: list };
    } catch (error) {
      console.error('Error fetching appointments:', error);
      appointmentsByDate.value = { ...appointmentsByDate.value, [dateStr]: [] };
    } finally {
      isLoadingAppointments.value = false;
    }
  };

  // Computed
  const currentMonth = computed(() => {
    const date = parseLocalDate(selectedDay.value);
    return date.toLocaleString('default', { month: 'long' });
  });

  const currentYear = computed(() => {
    const date = parseLocalDate(selectedDay.value);
    return date.getFullYear();
  });

  const filteredAppointments = computed(() => {
    return appointmentsByDate.value[selectedDay.value] || [];
  });

  // Methods
  const selectDay = (day: DayItem) => {
    selectedDay.value = day.date;
  };

  const prevDay = () => {
    const current = parseLocalDate(selectedDay.value);
    current.setDate(current.getDate() - 1);
    selectedDay.value = getLocalDateString(current);
    if (!isInCurrentWeek(current)) {
      generateWeek(current);
    }
  };

  const nextDay = () => {
    const current = parseLocalDate(selectedDay.value);
    current.setDate(current.getDate() + 1);
    selectedDay.value = getLocalDateString(current);
    if (!isInCurrentWeek(current)) {
      generateWeek(current);
    }
  };

  const isInCurrentWeek = (date: Date) => {
    if (!weekStart.value) return false;
    const start = parseLocalDate(weekStart.value);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return date >= start && date <= end;
  };

  const generateWeek = (date: Date) => {
    const week: DayItem[] = [];
    const current = new Date(date);
    // Start from Monday (0=Sunday, 1=Monday, ...)
    const dayOfWeek = current.getDay();
    const mondayOffset = (dayOfWeek + 6) % 7;
    current.setDate(current.getDate() - mondayOffset);
    weekStart.value = getLocalDateString(current);

    for (let i = 0; i < 7; i++) {
      const d = new Date(current);
      d.setDate(current.getDate() + i);
      week.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: getLocalDateString(d),
      });
    }

    days.value = week;
    if (!days.value.find((d) => d.date === selectedDay.value)) {
      selectedDay.value = week[0].date;
    }
  };

  const formatDate = (date: string) => {
    const day = parseLocalDate(date).getDate();
    return day < 10 ? `0${day}` : day;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Auto-update selectedDay at midnight
  let midnightTimer: ReturnType<typeof setTimeout> | null = null;

  function setMidnightTimer() {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = nextMidnight.getTime() - now.getTime();

    midnightTimer = setTimeout(() => {
      const newToday = new Date();
      selectedDay.value = getLocalDateString(newToday);
      generateWeek(newToday);
      setMidnightTimer();
    }, msUntilMidnight);
  }

  watch(
    selectedDay,
    (newDate) => {
      fetchAppointmentsForDate(newDate);
    },
    { immediate: true }
  );

  onMounted(() => {
    generateWeek(today);
    setMidnightTimer();
  });

  onUnmounted(() => {
    if (midnightTimer) clearTimeout(midnightTimer);
  });
</script>
