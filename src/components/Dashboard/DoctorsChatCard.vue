<template>
  <div class="flex-1 rounded-2xl border border-white/40 bg-surface p-6 shadow-xl dark:border-strokedark/50 transition-all duration-300">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-extrabold text-emphasis tracking-tight">Doctors</h2>
      <div class="p-1 px-3 bg-primary-light rounded-lg text-[10px] font-black uppercase text-primary">Online</div>
    </div>

    <!-- Doctor List -->
    <div class="space-y-4 overflow-y-auto max-h-[360px] custom-scrollbar pr-2">
      <div
        v-for="doctor in doctorsChats"
        :key="doctor.id"
        class="group flex items-center p-3 rounded-2xl bg-elevated border border-transparent hover:border-primary/10 hover:bg-white dark:hover:bg-strokedark transition-all duration-300 shadow-sm"
      >
        <div class="relative w-12 h-12 flex-shrink-0">
          <img :src="DoctorImage" class="w-full h-full rounded-xl object-cover" />
          <div class="absolute -right-1 -top-1 w-3 h-3 bg-success border-2 border-white dark:border-boxdark rounded-full"></div>
        </div>

        <div class="flex-1 ml-4 overflow-hidden">
          <h3 class="font-bold text-emphasis truncate leading-tight">{{ doctor.name }}</h3>
          <p class="text-[11px] font-semibold text-muted uppercase tracking-tighter truncate">{{ doctor.specialization }}</p>
        </div>

        <!-- Action Items -->
        <div class="flex items-center gap-2">
          <BaseButton
            variant="ghost"
            @click="copyToClipboard(doctor.phoneNumber, doctor.id)"
            class="!p-2 !rounded-xl !bg-surface !border !border-stroke dark:!border-strokedark shadow-sm hover:!text-primary relative group/btn"
          >
            <CallIcon class="w-4 h-4" />

            <div
              v-if="hoveredDoctorId === doctor.id"
              class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-[10px] text-white rounded-lg whitespace-nowrap opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity"
            >
              {{ copiedDoctorId === doctor.id ? 'Copied!' : doctor.phoneNumber }}
            </div>
          </BaseButton>

          <BaseButton variant="ghost" class="!p-2 hover:!bg-elevated rounded-xl transition-colors">
            <KebabIcon class="w-4 h-4 text-muted" />
          </BaseButton>
        </div>
      </div>

      <div v-if="isLoading" class="flex flex-col items-center py-10 opacity-30">
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div v-else-if="!hasMore" class="text-center py-4 text-[10px] font-black text-muted uppercase tracking-[0.2em]">End of Roster</div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import CallIcon from '@/assets/images/SVGs/CallIcon.svg';
  import KebabIcon from '@/assets/images/SVGs/KebabIcon.svg';
  import DoctorImage from '@/assets/images/user/doctor1.png';
  import DoctorsChatService from '@/services/DashboardDoctorChatCard/doctorsChat.service';

  const doctorsChats = ref([]);
  const doctorsChatService = new DoctorsChatService();
  const page = ref(0);
  const size = 5;
  const isLoading = ref(false);
  const hasMore = ref(true);

  // Tooltip state
  const hoveredDoctorId = ref(null);
  const copiedDoctorId = ref(null);

  const fetchDoctors = async () => {
    if (isLoading.value || !hasMore.value) return;

    isLoading.value = true;
    try {
      const response = await doctorsChatService.getDoctorsinfo(page.value, size);
      if (response.content.length > 0) {
        doctorsChats.value.push(...response.content);
        page.value++;
      } else {
        hasMore.value = false;
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const copyToClipboard = async (phoneNumber, id) => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      copiedDoctorId.value = id;

      setTimeout(() => {
        copiedDoctorId.value = null;
      }, 2000);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  onMounted(() => {
    fetchDoctors();
  });
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
