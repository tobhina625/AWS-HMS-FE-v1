<script setup lang="ts">
  import { ref } from 'vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import ChevronUpIcon from '@/assets/images/SVGs/ChevronUpIcon.svg';

  interface Props {
    title: string;
    defaultExpanded?: boolean;
    bordered?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    defaultExpanded: true,
    bordered: true,
  });

  const isExpanded = ref(props.defaultExpanded);

  const toggle = () => {
    isExpanded.value = !isExpanded.value;
  };

  defineExpose({ isExpanded, toggle });
</script>

<template>
  <div :class="['bg-surface rounded-2xl shadow-sm mb-6', bordered ? 'border border-stroke dark:border-strokedark' : '']">
    <div class="flex items-center justify-between p-6 cursor-pointer" @click="toggle">
      <h2 class="text-xl font-semibold text-emphasis">{{ title }}</h2>
      <BaseButton variant="ghost" type="button" class="!p-0 text-muted hover:text-primary" @click.stop="toggle">
        <ChevronUpIcon class="w-6 h-6 transition-transform duration-300" :class="{ 'rotate-180': !isExpanded }" />
      </BaseButton>
    </div>
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[2000px]"
      leave-from-class="opacity-100 max-h-[2000px]"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-show="isExpanded" class="overflow-hidden">
        <div class="px-6 pb-6">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>
