import { ref, computed } from 'vue';

export type ApiSearchOption = {
  id: number | string;
  name: string;
  role?: { id?: number; name?: string };
  /** Optional ward bed availability (wards dropdown) */
  availableBeds?: number;
  totalBeds?: number;
};

export interface UseApiSearchDropdownOptions {
  /** Minimum characters before calling `fetchSearchPage`. Below this, `loadDefault` runs. Default 2. */
  minSearchLength?: number;
  /** When set, enables paginated loading. The composable will pass page & size to fetch callbacks and track hasMore / loadMore state. */
  pageSize?: number;
  fetchDefaultPage: (page?: number, size?: number) => Promise<ApiSearchOption[]>;
  fetchSearchPage: (term: string, page?: number, size?: number) => Promise<ApiSearchOption[]>;
  getSelectedId: () => string | number | undefined | null | '';
}

/**
 * Searchable BaseSelect pattern: load a short default page from the backend, then replace options
 * when the user types (search). Clearing the query restores the default page and keeps the
 * current selection visible when it is not in that page.
 *
 * When `pageSize` is provided, the composable supports infinite-scroll pagination via `loadMore()`.
 */
export function useApiSearchDropdown(opts: UseApiSearchDropdownOptions) {
  const minLen = opts.minSearchLength ?? 2;
  const pageSize = opts.pageSize ?? 0; // 0 = no pagination
  const items = ref<ApiSearchOption[]>([]);
  const loading = ref(false);
  const searchPerformed = ref(false);
  const hasMore = ref(false);
  const currentPage = ref(0);
  const currentSearchTerm = ref('');

  const loadDefault = async () => {
    const prevSnapshot = items.value.slice();
    loading.value = true;
    currentPage.value = 0;
    currentSearchTerm.value = '';
    hasMore.value = false;
    try {
      const list = await opts.fetchDefaultPage(0, pageSize || undefined);
      let arr = Array.isArray(list) ? [...list] : [];

      // Track if there might be more pages
      if (pageSize > 0) {
        hasMore.value = arr.length >= pageSize;
      }

      const id = opts.getSelectedId();
      if (id !== undefined && id !== null && id !== '') {
        const sid = String(id);
        if (!arr.some((x) => String(x.id) === sid)) {
          const prev = prevSnapshot.find((x) => String(x.id) === sid);
          if (prev) arr = [prev, ...arr];
        }
      }
      items.value = arr;
    } catch {
      items.value = [];
      hasMore.value = false;
    } finally {
      loading.value = false;
    }
  };

  /** Fetch the next page and append results to the current list. Only works when `pageSize` is set. */
  const loadMore = async () => {
    if (!pageSize || loading.value || !hasMore.value) return;
    loading.value = true;
    const nextPage = currentPage.value + 1;
    try {
      let list: ApiSearchOption[];
      if (currentSearchTerm.value) {
        list = await opts.fetchSearchPage(currentSearchTerm.value, nextPage, pageSize);
      } else {
        list = await opts.fetchDefaultPage(nextPage, pageSize);
      }
      const arr = Array.isArray(list) ? list : [];
      hasMore.value = arr.length >= pageSize;
      currentPage.value = nextPage;
      items.value = [...items.value, ...arr];
    } catch {
      hasMore.value = false;
    } finally {
      loading.value = false;
    }
  };

  const onSearch = async (raw: string) => {
    const t = raw?.trim() ?? '';
    if (!t || t.length < minLen) {
      searchPerformed.value = false;
      await loadDefault();
      return;
    }
    loading.value = true;
    searchPerformed.value = true;
    currentPage.value = 0;
    currentSearchTerm.value = t;
    try {
      const list = await opts.fetchSearchPage(t, 0, pageSize || undefined);
      const arr = Array.isArray(list) ? list : [];
      if (pageSize > 0) {
        hasMore.value = arr.length >= pageSize;
      }
      items.value = arr;
    } catch {
      items.value = [];
      hasMore.value = false;
    } finally {
      loading.value = false;
    }
  };

  const emptyMessage = (idleText = 'Type at least 2 characters to filter the list') => computed(() => (searchPerformed.value ? 'No results found' : idleText));

  return { items, loading, searchPerformed, hasMore, loadDefault, loadMore, onSearch, emptyMessage };
}
