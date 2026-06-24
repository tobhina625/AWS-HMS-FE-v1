# useListView Composable

A reusable composable for managing list views with pagination, search, and loading states.

## Features

- ✅ Automatic loading state management
- ✅ Built-in pagination handling
- ✅ Search functionality
- ✅ Empty state detection
- ✅ Type-safe with TypeScript
- ✅ Consistent API across all list views

## Basic Usage

```typescript
import { useListView } from '@/composables/useListView';
import YourService from '@/services/YourService';

const service = new YourService();

const {
  loading,
  listFilters,
  apiResponse,
  isEmpty,
  hasData,
  fetchData,
  handleSearch,
  handlePageChange,
  refreshData,
} = useListView((filters) => service.getItems(filters));

// Fetch data on mount
onMounted(async () => {
  await fetchData();
});
```

## With Data Transformation

```typescript
const transformData = (item: any) => ({
  ...item,
  displayName: item.firstName + ' ' + item.lastName,
  status: item.status || 'Active',
});

const { fetchData, handleSearch, handlePageChange } = useListView(
  (filters) => service.getItems(filters)
);

// Use transform function
await fetchData(transformData);
await handleSearch('query', transformData);
await handlePageChange(2, transformData);
```

## Complete Example

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useListView } from '@/composables/useListView';
import EmptyState from '@/components/UI/EmptyState.vue';
import ItemCard from '@/components/ItemCard.vue';
import ItemService from '@/services/ItemService';
import type { IItem } from '@/services/Item.interface';

const router = useRouter();
const itemService = new ItemService();

// Initialize composable
const {
  loading,
  listFilters,
  apiResponse,
  isEmpty,
  hasData,
  fetchData,
  handleSearch,
  handlePageChange: changePage,
} = useListView<IItem>((filters) => itemService.getItems(filters));

// Transform function
const transformItem = (item: any): IItem => ({
  ...item,
  fullName: `${item.firstName} ${item.lastName}`,
  statusLabel: item.status || 'Active',
});

// Search handler
const onSearch = async (query: string) => {
  await handleSearch(query, transformItem);
};

// Page change handler
const onPageChange = async (page: number) => {
  await changePage(page, transformItem);
};

// Add new handler
const handleAddNew = () => {
  router.push('/items/add');
};

// Load data on mount
onMounted(async () => {
  await fetchData(transformItem);
});
</script>

<template>
  <div>
    <!-- Search -->
    <SearchBar @search="onSearch" />

    <!-- Empty State -->
    <EmptyState
      v-if="isEmpty"
      title="No Items Found"
      description="Get started by adding your first item."
      icon="data"
      action-label="Add Item"
      @action="handleAddNew"
    />

    <!-- Data Display -->
    <div v-else-if="hasData" class="grid gap-4">
      <ItemCard
        v-for="item in apiResponse.data"
        :key="item.id"
        :item="item"
      />
    </div>

    <!-- Pagination -->
    <Pagination
      v-if="hasData"
      :current-page="listFilters.page"
      :total-pages="apiResponse.totalPages"
      @change="onPageChange"
    />
  </div>
</template>
```

## API Reference

### Returned Values

| Property | Type | Description |
|----------|------|-------------|
| `loading` | `Ref<boolean>` | Loading state indicator |
| `listFilters` | `Ref<ListFilters>` | Current filter values (page, size, searchTerm) |
| `apiResponse` | `Ref<ApiResponse<T>>` | API response data and metadata |
| `isEmpty` | `ComputedRef<boolean>` | True when not loading and no data |
| `hasData` | `ComputedRef<boolean>` | True when data array has items |
| `fetchData` | `Function` | Fetch data with optional transform |
| `handleSearch` | `Function` | Search with optional transform |
| `handlePageChange` | `Function` | Change page with optional transform |
| `refreshData` | `Function` | Refresh current page data |

### Types

```typescript
interface ListFilters {
  page: number;
  size: number;
  searchTerm: string;
  [key: string]: any; // Additional custom filters
}

interface ApiResponse<T = any> {
  data: T[];
  totalElements: number;
  totalPages: number;
  startIndex: number;
  itemsPerPage: number;
}
```

## Migration Guide

### Before (Old Approach)

```vue
<script setup>
const loading = ref(false);
const items = ref([]);
const page = ref(0);

const fetchItems = async () => {
  loading.value = true;
  try {
    const response = await service.getItems();
    items.value = response.content;
  } finally {
    loading.value = false;
  }
};

const handleSearch = async (query: string) => {
  searchTerm.value = query;
  page.value = 0;
  await fetchItems();
};
</script>
```

### After (New Approach)

```vue
<script setup>
const {
  loading,
  apiResponse,
  isEmpty,
  fetchData,
  handleSearch,
} = useListView((filters) => service.getItems(filters));

onMounted(() => fetchData());
</script>
```

## Benefits

1. **Consistency**: Same pattern across all list views
2. **Less Code**: Reduces boilerplate by ~60%
3. **Type Safety**: Full TypeScript support
4. **Maintainability**: Changes in one place affect all views
5. **Testing**: Easier to test business logic
6. **Performance**: Optimized state management

## Best Practices

1. Always provide a transform function for consistent data shape
2. Use `isEmpty` for empty state detection
3. Use `hasData` for conditional rendering
4. Call `fetchData` in `onMounted`
5. Pass transform function to all data-fetching methods
