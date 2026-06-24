<template>
  <div class="flex-1 rounded-2xl border border-white/40 bg-surface p-6 shadow-xl dark:border-strokedark/50 transition-all duration-300">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-extrabold text-emphasis tracking-tight">Departments</h2>
      <div class="p-1 px-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg text-[10px] font-black uppercase text-teal-600 dark:text-teal-400">All Units</div>
    </div>

    <!-- Department List -->
    <div class="space-y-4 overflow-y-auto max-h-[360px] min-h-[360px] custom-scrollbar pr-2">
      <div
        v-for="department in departments"
        :key="department.id"
        class="group flex items-center p-4 rounded-2xl bg-elevated border border-transparent hover:border-teal-500/10 hover:bg-white dark:hover:bg-strokedark transition-all duration-300 shadow-sm"
      >
        <div class="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 shrink-0">
          <EnvelopeIcon class="w-6 h-6" />
        </div>

        <div class="flex-1 ml-4 overflow-hidden">
          <h3 class="font-bold text-emphasis truncate leading-tight">{{ department.name }}</h3>
          <p class="text-[10px] font-semibold text-gray-400 uppercase tracking-tighter">Operational</p>
        </div>

        <BaseButton variant="ghost" class="!p-2 hover:!bg-elevated rounded-xl transition-colors">
          <KebabIcon class="w-4 h-4 text-gray-400" />
        </BaseButton>
      </div>

      <div v-if="isLoading" class="flex flex-col items-center py-10 opacity-30">
        <div class="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <div v-else-if="!hasMore" class="text-center py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Listing Complete</div>
    </div>
  </div>
</template>

<script setup>
  import EnvelopeIcon from '@/assets/images/SVGs/EnvelopeIcon.svg';

  import { ref, onMounted } from 'vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import DepartmentsServices from '@/services/dashboardDepartment/departments.service';
  import KebabIcon from '@/assets/images/SVGs/KebabIcon.svg';

  const departments = ref([]);
  const page = ref(0);
  const size = 5;
  const isLoading = ref(false);
  const hasMore = ref(true);
  const departmentsService = new DepartmentsServices();

  const fetchDepartments = async () => {
    if (isLoading.value || !hasMore.value) return;

    isLoading.value = true;
    try {
      const response = await departmentsService.getDepartments(page.value, size);
      if (response.content.length > 0) {
        departments.value.push(...response.content);
        page.value++;
      } else {
        hasMore.value = false;
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    fetchDepartments();
  });
</script>
