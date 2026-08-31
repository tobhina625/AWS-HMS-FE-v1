import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSidebarStore = defineStore('sidebar', () => {
  const isSidebarOpen = ref(false);
  const selected = useStorage('selected', ref('eCommerce'));
  const page = useStorage('page', ref('Dashboard'));
  const scrollTop = ref(0);

  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value;
  }

  function setScrollTop(top: number) {
    scrollTop.value = top;
  }

  return { isSidebarOpen, toggleSidebar, selected, page, scrollTop, setScrollTop };
});
