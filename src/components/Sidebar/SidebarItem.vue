<script setup lang="ts">
  import { useSidebarStore } from '@/stores/sidebar';
  import { RouteLocationNormalizedLoaded, useRoute } from 'vue-router';
  import SidebarDropdown from './SidebarDropdown.vue';
  import ChevronRightTriangleIcon from '@/assets/images/SVGs/ChevronRightTriangle.svg';
  import { watch } from 'vue';

  const sidebarStore = useSidebarStore();

  const props = defineProps(['item', 'index']);
  const route = useRoute();

  interface SidebarItem {
    label: string;
    route?: string;
    children?: SidebarItem[];
    icon?: string;
  }

  const updateStoreFromRoute = (route: RouteLocationNormalizedLoaded) => {
    const matchedLabel = findLabelByRoute(props.item, route.path);
    if (matchedLabel) {
      sidebarStore.page = matchedLabel;
    }
  };

  const findLabelByRoute = (item: SidebarItem, currentPath: string): string | null => {
    if (item.route === currentPath) return item.label;

    if (item.children) {
      for (const child of item.children) {
        if (child.route === currentPath) return item.label;
      }
    }

    return null;
  };

  watch(
    () => route.path,
    () => {
      updateStoreFromRoute(route);
    },
    { immediate: true }
  );
</script>

<template>
  <li>
    <div
      v-if="item.children"
      @click="sidebarStore.page = sidebarStore.page === item.label ? '' : item.label"
      class="group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-bold duration-300 ease-in-out cursor-pointer"
      :class="{
        'bg-light dark:bg-dark text-blue': sidebarStore.page === item.label,
        'text-light dark:text-emphasis hover:text-blue dark:hover:text-blue hover:bg-light dark:hover:bg-dark': sidebarStore.page !== item.label,
      }"
    >
      <component :is="item.icon" class="w-[18px] h-[18px] shrink-0" />
      {{ item.label }}
      <ChevronRightTriangleIcon class="ml-auto h-3 w-3 transform transition-transform duration-200" :class="{ 'rotate-90': sidebarStore.page === item.label }" />
    </div>

    <router-link
      v-else
      :to="item.route"
      class="group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-bold hover:text-blue duration-300 ease-in-out"
      :class="{
        'bg-light dark:bg-dark text-blue': sidebarStore.page === item.label,
        'text-light dark:text-emphasis hover:text-blue dark:hover:text-blue hover:bg-light dark:hover:bg-dark': sidebarStore.page != item.label,
      }"
    >
      <component :is="item.icon" class="w-[18px] h-[18px] shrink-0"></component>

      {{ item.label }}
    </router-link>

    <div class="translate transform overflow-hidden" v-show="sidebarStore.page === item.label">
      <SidebarDropdown v-if="item.children" :items="item.children" :page="item.label" />
    </div>
  </li>
</template>
