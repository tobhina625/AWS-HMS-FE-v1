<script setup lang="ts">
  import { computed } from 'vue';

  type StatusVariant = 'success' | 'danger' | 'warning' | 'primary' | 'secondary' | 'info' | 'default';
  type BadgeSize = 'sm' | 'md' | 'lg';

  interface StatusConfig {
    variant: StatusVariant;
    label?: string;
  }

  interface Props {
    status: string;
    variant?: StatusVariant;
    size?: BadgeSize;
    statusMap?: Record<string, StatusConfig>;
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'md',
  });

  const defaultStatusMap: Record<string, StatusConfig> = {
    Active: { variant: 'success' },
    Inactive: { variant: 'danger' },
    Pending: { variant: 'warning' },
    Completed: { variant: 'success' },
    Cancelled: { variant: 'danger' },
    InProgress: { variant: 'primary', label: 'In Progress' },
    UnderMaintenance: { variant: 'warning', label: 'Under Maintenance' },
    UnderReview: { variant: 'warning', label: 'Under Review' },
    UnderResearch: { variant: 'info', label: 'Under Research' },
    Restructuring: { variant: 'warning' },
    Closed: { variant: 'danger' },
    Emergency: { variant: 'secondary' },
    Available: { variant: 'success' },
    Occupied: { variant: 'primary' },
    Reserved: { variant: 'secondary' },
    Maintenance: { variant: 'warning' },
    InUse: { variant: 'primary', label: 'In Use' },
    Frozen: { variant: 'info' },
    Eradicated: { variant: 'default' },
    Discontinued: { variant: 'danger' },
    OnLeave: { variant: 'warning', label: 'On Leave' },
    Suspended: { variant: 'danger' },
    Confirmed: { variant: 'success' },
    Rescheduled: { variant: 'info' },
    LowStock: { variant: 'warning', label: 'Low Stock' },
    OutOfStock: { variant: 'danger', label: 'Out of Stock' },
    Expired: { variant: 'danger' },
  };

  const statusConfig = computed(() => {
    const map = props.statusMap || defaultStatusMap;
    return map[props.status] || { variant: props.variant || 'default' };
  });

  const variantClasses: Record<StatusVariant, string> = {
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    primary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    secondary: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    info: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-300',
  };

  const sizeClasses: Record<BadgeSize, string> = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  };

  const displayLabel = computed(() => {
    return statusConfig.value.label || props.status.replace(/([A-Z])/g, ' $1').trim();
  });
</script>

<template>
  <span :class="['inline-flex items-center rounded-lg font-semibold shadow-sm', variantClasses[statusConfig.variant], sizeClasses[size]]">
    {{ displayLabel }}
  </span>
</template>
