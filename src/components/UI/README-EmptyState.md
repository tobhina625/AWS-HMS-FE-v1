# EmptyState Component

A reusable component for displaying empty states across all list views in the application.

## Usage

```vue
<script setup>
import EmptyState from '@/components/UI/EmptyState.vue';

const handleAddNew = () => {
  // Navigate to add page
};
</script>

<template>
  <EmptyState
    v-if="isEmpty"
    title="No Records Found"
    description="Get started by adding your first item."
    icon="ward"
    action-label="Add New Item"
    @action="handleAddNew"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | String | "No Records Found" | Main heading text |
| `description` | String | Auto-generated | Description text below the heading |
| `icon` | String | "default" | Icon type: 'search', 'data', 'bed', 'ward', 'patient', 'default' |
| `actionLabel` | String | undefined | Button text (button hidden if not provided) |
| `actionRoute` | String | undefined | Optional route for navigation |

## Events

| Event | Description |
|-------|-------------|
| `@action` | Emitted when the action button is clicked |

## Examples

### Basic Empty State
```vue
<EmptyState />
```

### With Custom Title and Description
```vue
<EmptyState
  title="No Patients Found"
  description="Start by registering your first patient."
  icon="patient"
/>
```

### With Action Button
```vue
<EmptyState
  title="No Wards Available"
  description="Create a ward to manage hospital beds."
  icon="ward"
  action-label="Create Ward"
  @action="navigateToCreate"
/>
```

### Different Icons
```vue
<!-- Search results -->
<EmptyState icon="search" title="No Results" />

<!-- Data/Reports -->
<EmptyState icon="data" title="No Data Available" />

<!-- Beds -->
<EmptyState icon="bed" title="No Beds Available" />

<!-- Wards -->
<EmptyState icon="ward" title="No Wards Found" />

<!-- Patients -->
<EmptyState icon="patient" title="No Patients Registered" />
```

## Integration with useListView Composable

The EmptyState component works seamlessly with the `useListView` composable:

```vue
<script setup>
import { useListView } from '@/composables/useListView';
import EmptyState from '@/components/UI/EmptyState.vue';

const { isEmpty, hasData, loading } = useListView(fetchFunction);
</script>

<template>
  <EmptyState v-if="isEmpty" ... />
  <DataDisplay v-else-if="hasData" ... />
</template>
```
