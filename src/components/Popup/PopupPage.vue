<template>
  <div class="fixed inset-0 flex items-center justify-center bg-gray-800 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-70 z-50">
    <div class="bg-surface rounded-lg shadow-lg w-96 p-6 text-center border border-stroke dark:border-strokedark">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Page Not Found</h2>
      <p class="text-gray-600 dark:text-bodydark mt-2">The page you are looking for does not exist.</p>
      <BaseButton @click="goHome" variant="primary" class="!mt-4">Main Menu / Home</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import BaseButton from '@/components/Base/BaseButton.vue';

  const router = useRouter();

  const goHome = () => {
    router.push('/'); // Navigate to the home page
  };
</script>

<style scoped>
  /* Add any additional styles here if needed */
</style>
