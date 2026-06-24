<script setup lang="ts">
  import { useSidebarStore } from '@/stores/sidebar';
  import { ref } from 'vue';

  const sidebarStore = useSidebarStore();

  const props = defineProps(['items', 'page']);
  const items = ref(props.items);
</script>

<template>
  <ul class="mt-2 flex flex-col gap-1 pl-6">
    <template v-for="(childItem, index) in items" :key="index">
      <li>
        <router-link
          :to="childItem.route"
          class="group relative flex items-center gap-2.5 rounded-sm py-1.5 px-4 font-medium text-sm duration-300 ease-in-out"
          :class="{
            'bg-light dark:bg-dark text-blue': childItem.label === sidebarStore.selected,
            'text-light dark:text-emphasis hover:text-blue dark:hover:text-blue hover:bg-light dark:hover:bg-dark': childItem.label !== sidebarStore.selected,
          }"
        >
          <component v-if="childItem.icon" :is="childItem.icon" class="w-[18px] h-[18px] shrink-0" />
          {{ childItem.label }}
        </router-link>
      </li>
    </template>
  </ul>
</template>

<!-- group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white -->
