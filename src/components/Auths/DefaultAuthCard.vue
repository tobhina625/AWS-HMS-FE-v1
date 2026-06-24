<script setup lang="ts">
  import UserCircleIcon from '@/assets/images/SVGs/UserCircleIcon.svg';

  const props = defineProps(['subtitle', 'title', 'customClasses']);
</script>

<template>
  <div class="fixed inset-0 z-[-1] overflow-hidden">
    <img src="@/assets/images/auth_bg.png" class="w-full h-full object-cover scale-105 blur-[2px] opacity-80" alt="Background" />
    <div class="absolute inset-0 bg-gradient-to-br from-primary/40 via-white/10 to-primary/30"></div>
  </div>

  <div class="flex items-center justify-center min-h-screen p-4">
    <div
      class="w-full max-w-[1000px] flex flex-wrap items-stretch bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-white/40 dark:bg-boxdark/80 dark:border-strokedark/50"
    >
      <!-- Left Section: Illustration/Info -->
      <div class="hidden w-1/2 xl:flex flex-col justify-between bg-primary/95 p-12 text-white relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <UserCircleIcon class="" />
        </div>

        <div class="relative z-10">
          <h1 class="text-4xl font-extrabold tracking-tight mb-4">HMS</h1>
          <p class="text-xl text-primary-light font-light max-w-xs">Revolutionizing Healthcare Management with Intelligence.</p>
        </div>

        <div class="relative z-10 flex justify-center py-8">
          <div class="w-full max-w-[320px] transition-transform duration-700 hover:scale-105">
            <img :src="'/src/assets/images/illustration/doc_image-01.svg'" class="drop-shadow-2xl" />
          </div>
        </div>

        <div class="relative z-10">
          <p class="text-sm opacity-60">© {{ new Date().getFullYear() }} Antigravity HMS. All rights reserved.</p>
        </div>
      </div>

      <!-- Right Section: Form -->
      <div class="w-full xl:w-1/2 flex flex-col justify-center p-8 sm:p-12 xl:p-16">
        <div class="w-full max-w-md mx-auto">
          <header class="mb-10 text-center xl:text-left">
            <h2 class="text-3xl font-bold text-emphasis mb-2">
              {{ props.title }}
            </h2>
            <p class="text-bodydark" v-if="props.subtitle">{{ props.subtitle }}</p>
            <p class="text-muted" v-else>Please enter your details to continue.</p>
          </header>

          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .backdrop-blur-xl {
    backdrop-filter: blur(24px);
  }
</style>
