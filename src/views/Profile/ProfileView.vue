<script setup lang="ts">
  import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import { ref } from 'vue';
  import Profile from '@/components/Profile/UserProfile.vue';

  const pageTitle = ref('Profile');
</script>

<template>
  <DefaultLayout>
    <div class="mx-auto max-w-full">
      <!-- Breadcrumb Start -->
      <BreadcrumbDefault :pageTitle="pageTitle" />
      <!-- Breadcrumb End -->
      <div class="mt-6">
        <Profile />
      </div>
    </div>
  </DefaultLayout>
</template>
