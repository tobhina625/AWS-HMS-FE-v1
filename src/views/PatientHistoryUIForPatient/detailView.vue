<script setup lang="ts">
  import { ref } from 'vue';
  import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import PatientDetail from '@/components/PatientHistoryForPatient/PatientDetail.vue';

  const pageTitle = ref('Patient History');
</script>

<template>
  <DefaultLayout>
    <!-- Breadcrumb Start -->
    <BreadcrumbDefault :pageTitle="pageTitle" />
    <!-- Breadcrumb End -->

    <div class="flex flex-col gap-10">
      <PatientDetail />
    </div>
  </DefaultLayout>
</template>
