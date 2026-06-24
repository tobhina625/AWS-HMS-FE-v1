<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import HospitalCross404Icon from '@/assets/images/SVGs/HospitalCross404.svg';

  const router = useRouter();
</script>

<template>
  <DefaultLayout>
    <div class="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <!-- Background glow -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[80px] pointer-events-none -z-10"></div>

      <!-- Hospital cross icon -->
      <div class="relative mb-8 animate-float">
        <div class="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center ring-4 ring-primary/20">
          <HospitalCross404Icon class="w-14 h-14 text-primary" />
        </div>
        <span class="absolute -top-2 -right-2 bg-meta-1 text-white text-[10px] font-black px-2 py-1 rounded-full border-2 border-white dark:border-boxdark uppercase tracking-wider">404</span>
      </div>

      <!-- Content -->
      <div class="max-w-sm">
        <h2 class="text-3xl font-black text-emphasis mb-3">Record Not Found</h2>
        <p class="text-body dark:text-bodydark text-sm mb-8 leading-relaxed">This page or medical record couldn't be located in our system. It may have been moved or archived.</p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <BaseButton variant="primary" size="lg" rounded="xl" @click="router.push('/')">Back to Dashboard</BaseButton>
          <BaseButton variant="ghost" size="lg" rounded="xl" @click="router.back()">Go Back</BaseButton>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<style scoped>
  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  .animate-float {
    animation: float 4s ease-in-out infinite;
  }
</style>
