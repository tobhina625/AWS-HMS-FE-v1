<script setup>
  import { ref, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import SearchIcon from '@/assets/images/SVGs/MagnifyingGlass.svg';
  import AddIcon from '@/assets/images/SVGs/AddIcon.svg';
  import { useDebounceFn } from '@vueuse/core';

  const emit = defineEmits(['searchTerm']);

  const props = defineProps({
    placeholder: {
      type: String,
      default: 'Search',
    },
    addButtonRoute: {
      type: String,
      default: '',
    },
    showAdd: {
      type: Boolean,
      default: true,
    },
    debounceMs: {
      type: Number,
      default: 500,
    },
  });

  const searchContent = ref('');
  const router = useRouter();

  const sendDataToParent = () => {
    emit('searchTerm', searchContent.value);
  };

  const debouncedSearch = useDebounceFn(() => {
    sendDataToParent();
  }, props.debounceMs);

  watch(searchContent, () => {
    debouncedSearch();
  });

  const add = () => {
    if (props.addButtonRoute) {
      router.push(`/${props.addButtonRoute}`);
    }
  };
</script>

<template>
  <div class="flex items-center gap-3 w-full min-w-0">
    <BaseInput v-model="searchContent" :placeholder="placeholder" class="flex-1 [&_input]:min-h-[52px] [&_input]:text-base [&_input]:py-3">
      <template #leading>
        <SearchIcon class="w-4 h-4" />
      </template>
    </BaseInput>

    <BaseButton v-if="showAdd" variant="primary" size="md" rounded="xl" @click="add" class="shrink-0">
      <AddIcon class="w-4 h-4" />
      <span class="hidden sm:inline">Add New</span>
    </BaseButton>
  </div>
</template>
