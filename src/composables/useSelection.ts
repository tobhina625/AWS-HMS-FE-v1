import { ref, computed, type Ref } from 'vue';

export function useSelection<T extends number | string = number>() {
  const selectedIds: Ref<T[]> = ref([]);

  const hasSelection = computed(() => selectedIds.value.length > 0);

  const selectionCount = computed(() => selectedIds.value.length);

  const isSelected = (id: T) => selectedIds.value.includes(id);

  const toggle = (id: T) => {
    const index = selectedIds.value.indexOf(id);
    if (index === -1) {
      selectedIds.value.push(id);
    } else {
      selectedIds.value.splice(index, 1);
    }
  };

  const selectAll = <I extends { id: T }>(items: I[]) => {
    selectedIds.value = items.map((item) => item.id);
  };

  const deselectAll = () => {
    selectedIds.value = [];
  };

  const toggleAll = <I extends { id: T }>(checked: boolean, items: I[]) => {
    if (checked) {
      selectAll(items);
    } else {
      deselectAll();
    }
  };

  return {
    selectedIds,
    hasSelection,
    selectionCount,
    isSelected,
    toggle,
    selectAll,
    deselectAll,
    toggleAll,
  };
}
