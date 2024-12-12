<script setup lang="ts">
import { ref } from 'vue'
import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue'
import DoctorUI from '@/components/Doctors/DoctorUI.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import Search from '../components/Doctors/Search.vue'
import Add from '../components/Doctors/Add.vue'


const pageTitle = ref('Doctors')
</script>

<template>
  <DefaultLayout>
    <!-- Breadcrumb Start -->
    <BreadcrumbDefault :pageTitle="pageTitle" />
    <!-- Breadcrumb End -->

    <div class="flex flex-col gap-10">
      <Add/>
      <Search/>
     
      <DoctorUI />
    </div>
  </DefaultLayout>
</template>
