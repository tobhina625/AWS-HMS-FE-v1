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
  fetchDefaultPage: () => Promise<ApiSearchOption[]>;
  fetchSearchPage: (term: string) => Promise<ApiSearchOption[]>;
  getSelectedId: () => string | number | undefined | null | '';
}

/**
 * Searchable BaseSelect pattern: load a short default page from the backend, then replace options
 * when the user types (search). Clearing the query restores the default page and keeps the
 * current selection visible when it is not in that page.
 */
export function useApiSearchDropdown(opts: UseApiSearchDropdownOptions) {
  const minLen = opts.minSearchLength ?? 2;
  const items = ref<ApiSearchOption[]>([]);
  const loading = ref(false);
  const searchPerformed = ref(false);

  const loadDefault = async () => {
    const prevSnapshot = items.value.slice();
    loading.value = true;
    try {
      const list = await opts.fetchDefaultPage();
      let arr = Array.isArray(list) ? [...list] : [];
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
    try {
      const list = await opts.fetchSearchPage(t);
      items.value = Array.isArray(list) ? list : [];
    } catch {
      items.value = [];
    } finally {
      loading.value = false;
    }
  };

  const emptyMessage = (idleText = 'Type at least 2 characters to filter the list') => computed(() => (searchPerformed.value ? 'No results found' : idleText));

  return { items, loading, searchPerformed, loadDefault, onSearch, emptyMessage };
}
