/**
 * usePaginatedDropdown
 * Manages the state for a lazily-loaded, paginated, searchable dropdown.
 * Handles: page tracking, infinite scroll, loading flag, open/close toggling,
 * click-outside closing (lifecycle-managed), and item selection.
 *
 * @param loadPage - async function called with a page number; must return
 *                   { content: T[]; last: boolean } (Spring Page shape).
 * @param transformer - optional function to transform items into { value, label } format
 */
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

type LoadPageFn<T> = (page: number, size?: number, searchTerm?: string) => Promise<{ content: T[]; last: boolean } | null>;
type TransformerFn<T> = (item: T) => { value: any; label: string };

export function usePaginatedDropdown<T extends { id?: string | number; name?: string }>(loadPage: LoadPageFn<T>, transformer?: TransformerFn<T>) {
  const list = ref<T[]>([]);
  const selected = ref<T | null>(null);
  const showDropdown = ref(false);
  const isLoading = ref(false);
  const isLastPage = ref(false);
  const currentPage = ref(0);
  const triggerRef = ref<HTMLElement | null>(null);
  const searchTerm = ref('');

  const fetchNextPage = async () => {
    if (isLoading.value || isLastPage.value) return;
    isLoading.value = true;
    try {
      const response = await loadPage(currentPage.value, 10, searchTerm.value);
      if (response?.content?.length) {
        (list.value as T[]).push(...response.content);
        currentPage.value++;
      }
      if (response?.last) isLastPage.value = true;
    } catch (error) {
      console.error('Failed to fetch page:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
    if (showDropdown.value && list.value.length === 0) fetchNextPage();
  };

  const selectItem = (item: T) => {
    selected.value = item;
    showDropdown.value = false;
  };

  const handleScroll = (e: Event) => {
    const el = e.target as HTMLElement;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 5;
    if (atBottom) fetchNextPage();
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (triggerRef.value && !triggerRef.value.contains(event.target as Node)) {
      showDropdown.value = false;
    }
  };

  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
    // Auto-fetch first page if transformer is provided (new API)
    if (transformer) {
      fetchNextPage();
    }
  });

  onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));

  const reset = () => {
    list.value = [];
    selected.value = null;
    showDropdown.value = false;
    isLoading.value = false;
    isLastPage.value = false;
    currentPage.value = 0;
    searchTerm.value = '';
  };

  /** Reset list and load from page 0 with the given server-side search string (e.g. BaseSelect @search). */
  const applySearch = async (term: string) => {
    searchTerm.value = term;
    list.value = [];
    currentPage.value = 0;
    isLastPage.value = false;
    isLoading.value = false;
    await fetchNextPage();
  };

  // Computed options for BaseSelect (new API)
  const options = computed(() => {
    if (transformer) {
      return list.value.map(transformer);
    }
    return [];
  });

  return {
    // Old API
    list,
    selected,
    showDropdown,
    isLoading,
    isLastPage,
    triggerRef,
    fetchNextPage,
    toggleDropdown,
    selectItem,
    handleScroll,
    reset,
    applySearch,
    // New API
    options,
    loading: isLoading,
  };
}
