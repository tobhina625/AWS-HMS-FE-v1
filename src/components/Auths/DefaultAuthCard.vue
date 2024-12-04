<script setup lang="ts">
const props = defineProps(['subtitle', 'title', 'customClasses'])
</script>

<template>
  <!-- ====== Forms Section Start -->
  <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark h-full">
    <div class="flex flex-wrap items-center h-full">
      <div class="hidden w-full xl:block xl:w-1/2 bg-primary h-full">
        <div class="py-17.5 px-26 text-center h-full flex flex-col justify-center"> 

          <p class="font-medium 2xl:px-20 text-white">
            HMS - Hospital Management System
          </p>

          <span class="mt-15 inline-block">
            <img src="@/assets/images/illustration/doc_image-01.svg" alt="illustration" />
          </span>

          <p class="font-medium 2xl:px-20 pt-5 text-white">
            Copyright @2023 - {{new Date().getFullYear() + 1}}. All rights reserved.
          </p>
        </div>
      </div>
      
      <div class="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2 h-full overflow-auto">
        <div class="w-full p-4 sm:p-12.5 xl:p-17.5 flex flex-col">
          <!-- <span class="mb-1.5 block font-medium">{{ props.subtitle }}</span> -->
          <h2 class="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2 text-center">
            {{ props.title }}
          </h2>

          <slot></slot>
        </div>
      </div>
    </div>
  </div>
  <!-- ====== Forms Section End -->
</template>
