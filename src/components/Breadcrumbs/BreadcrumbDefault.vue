<script setup lang="ts">
  import HomeVariantIcon from '@/assets/images/SVGs/HomeVariantIcon.svg';

  const props = defineProps(['pageTitle']);
</script>

<template>
  <nav class="flex items-center px-4 py-1.5 bg-elevated rounded-full border border-stroke dark:border-strokedark/50">
    <ol class="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-widest">
      <li>
        <router-link class="flex items-center text-gray-400 hover:text-primary transition-colors" to="/">
          <HomeVariantIcon class="w-3.5 h-3.5 mr-1" />
          HMS
        </router-link>
      </li>
      <li class="text-muted">/</li>
      <li class="text-primary truncate max-w-[150px]">{{ props.pageTitle }}</li>
    </ol>
  </nav>
</template>
