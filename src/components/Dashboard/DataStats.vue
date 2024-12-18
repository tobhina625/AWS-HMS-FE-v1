<template>
  <!-- Card Item Start -->
  <div
    v-for="(item, index) in cardItems"
    :key="index"
    class="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark"
  >
    <!-- Image Section -->
    <div
      class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4"
    >
      <img :src="item.image" alt="icon" class="h-12 w-12 object-cover rounded-full" />
    </div>

    <!-- Content Section -->
    <div class="mt-4 flex items-end justify-between">
      <div>
        <h4 class="text-title-md font-bold text-black dark:text-white">{{ item.total }}</h4>
        <span class="text-sm font-medium">{{ item.title }} </span>
      </div>
    </div>
  </div>
  <!-- Card Item End -->
</template>

<script setup lang="ts">
import { ref } from 'vue'
import userOne from '@/assets/images/user/user-22.png'
import userTwo from '@/assets/images/user/user-23.png'
import userThree from '@/assets/images/user/user-24.png'

const cardItems = ref([
  {
    image: userThree, // Add your image URL here
    title: 'Total Appointment',
    total: '78',
  },
  {
    image: userTwo, // Replace with your desired image
    title: 'Consultation',
    total: '78',
  },
  {
    image: userOne, // Replace with your desired image
    title: 'Staff',
    total: '78',
  }
]);
</script>
