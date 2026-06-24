<script setup lang="ts">
  import BaseButton from '@/components/Base/BaseButton.vue';
  import TrashDetailedIcon from '@/assets/images/SVGs/TrashDetailedIcon.svg';

  defineProps<{
    disabled?: boolean;
    label?: string;
  }>();

  defineEmits<{
    click: [];
  }>();
</script>

<template>
  <BaseButton variant="danger" size="sm" @click="$emit('click')" :disabled="disabled">
    <TrashDetailedIcon class="w-4 h-4" />
    {{ label || 'Delete Selected' }}
  </BaseButton>
</template>
