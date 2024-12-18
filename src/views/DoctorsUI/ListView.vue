<script setup lang="ts">
import { ref } from 'vue'
import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import Search from '@/components/Doctors/Search.vue'
import List from '@/components/Doctors/List.vue'



const pageTitle = ref('Doctors')
</script>

<template>
  <DefaultLayout>
    <!-- Breadcrumb Start -->
    <BreadcrumbDefault :pageTitle="pageTitle" />
    <!-- Breadcrumb End -->

    <div class="flex flex-col gap-10">
      
      <Search/>
      <List />
    </div>
  </DefaultLayout>
</template>
