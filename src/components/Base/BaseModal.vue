<script setup lang="ts">
  import { onMounted, onUnmounted } from 'vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import CloseXIcon from '@/assets/images/SVGs/CloseX.svg';

  interface Props {
    show: boolean;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }

  const props = defineProps<Props>();
  const emit = defineEmits(['close']);

  const closeOnEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.show) emit('close');
  };

  onMounted(() => document.addEventListener('keydown', closeOnEsc));
  onUnmounted(() => document.removeEventListener('keydown', closeOnEsc));

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div v-show="show" class="bg-surface w-full shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh]" :class="sizes[size || 'md']">
            <!-- Header -->
            <div class="px-8 py-6 border-b border-gray-100 dark:border-strokedark flex items-center justify-between">
              <h3 v-if="title" class="text-2xl font-black text-emphasis tracking-tight">{{ title }}</h3>
              <BaseButton variant="icon" @click="emit('close')">
                <CloseXIcon class="w-6 h-6" />
              </BaseButton>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <slot></slot>
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="px-8 py-6 bg-elevated border-t border-gray-100 dark:border-strokedark flex items-center justify-end gap-3">
              <slot name="footer"></slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
