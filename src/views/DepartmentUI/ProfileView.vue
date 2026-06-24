<script setup lang="ts">
  import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import { ref } from 'vue';
  import DepartmentProfile from '@/components/Department/DepartmentProfile.vue';

  const pageTitle = ref('Department Profile');
</script>

<template>
  <DefaultLayout>
    <div class="mx-auto max-w-full">
      <!-- Breadcrumb Start -->
      <BreadcrumbDefault :pageTitle="pageTitle" />
      <!-- Breadcrumb End -->
      <DepartmentProfile></DepartmentProfile>
    </div>
  </DefaultLayout>
</template>
