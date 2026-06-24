import { ref, computed } from 'vue';

export interface ListFilters {
  page: number;
  size: number;
  searchTerm: string;
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  data: T[];
  totalElements: number;
  totalPages: number;
  startIndex: number;
  itemsPerPage: number;
}

export function useListView<T = any>(fetchFunction: (filters: string) => Promise<any>, initialPageSize: number = 10) {
  const loading = ref(false);
  const listFilters = ref<ListFilters>({
    page: 0,
    size: initialPageSize,
    searchTerm: '',
  });

  const apiResponse = ref<ApiResponse<T>>({
    data: [],
    totalElements: 0,
    totalPages: 0,
    startIndex: 0,
    itemsPerPage: 0,
  });

  const isEmpty = computed(() => !loading.value && apiResponse.value.data.length === 0);
  const hasData = computed(() => apiResponse.value.data.length > 0);

  const buildFilterString = () => {
    let filters = '';
    Object.entries(listFilters.value).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        filters = filters !== '' ? `${filters}&${key}=${value}` : `${key}=${value}`;
      }
    });
    return filters;
  };

  const fetchData = async (transformFn?: (item: any) => T) => {
    loading.value = true;
    try {
      const filters = buildFilterString();
      let response = await fetchFunction(filters);

      // Handle both lowercase 'content' and uppercase 'Content' from backend
      let content = response.content || response.Content || [];
      const totalPages = response.totalPages ?? 0;

      // If we're on an out-of-range page (e.g. deleted last page), go back to last valid page
      if (listFilters.value.page >= totalPages && totalPages > 0) {
        listFilters.value.page = totalPages - 1;
        response = await fetchFunction(buildFilterString());
        content = response.content || response.Content || [];
      }

      // Filter out deleted records on client-side as a safety measure
      content = content.filter((item: any) => item.isDeleted === false || item.isDeleted === undefined || item.isDeleted === null);

      apiResponse.value.data = transformFn ? content.map(transformFn) : content;

      apiResponse.value.itemsPerPage = response.size ?? response.Size ?? 10;
      apiResponse.value.totalPages = response.totalPages ?? response.TotalPages ?? 0;
      apiResponse.value.startIndex = response.page ?? response.number ?? response.Page ?? response.Number ?? 0;
      apiResponse.value.totalElements = response.totalElements ?? response.TotalElements ?? 0;
    } catch (error) {
      console.error('Error fetching data:', error);
      apiResponse.value.data = [];
    } finally {
      loading.value = false;
    }
  };

  const handleSearch = async (query: string, transformFn?: (item: any) => T) => {
    listFilters.value.searchTerm = query;
    listFilters.value.page = 0;
    await fetchData(transformFn);
  };

  const handlePageChange = async (newPage: number, transformFn?: (item: any) => T) => {
    listFilters.value.page = newPage;
    await fetchData(transformFn);
  };

  const handlePageSizeChange = async (newSize: number, transformFn?: (item: any) => T) => {
    listFilters.value.size = newSize;
    listFilters.value.page = 0;
    await fetchData(transformFn);
  };

  const refreshData = async (transformFn?: (item: any) => T) => {
    await fetchData(transformFn);
  };

  return {
    loading,
    listFilters,
    apiResponse,
    isEmpty,
    hasData,
    fetchData,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    refreshData,
  };
}
