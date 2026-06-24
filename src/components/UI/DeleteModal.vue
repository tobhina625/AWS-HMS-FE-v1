<script setup>
  import { defineProps, defineEmits } from 'vue';
  import BaseModal from '@/components/Base/BaseModal.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';

  const props = defineProps({
    show: Boolean,
    item: Object,
  });

  defineEmits(['cancel', 'accept']);
</script>

<template>
  <BaseModal :show="props.show" :title="'Delete ' + props.item?.name" @close="$emit('cancel')" size="sm">
    <p class="text-gray-600 mb-4 font-medium">
      Are you sure you want to delete this
      <span class="text-emphasis font-bold">{{ props.item?.name }}</span>
      ?
    </p>

    <template #footer>
      <BaseButton variant="outline" @click="$emit('cancel')">Cancel</BaseButton>
      <BaseButton variant="danger" @click="$emit('accept')">Delete</BaseButton>
    </template>
  </BaseModal>
</template>
