<script setup lang="ts">
  import { computed } from 'vue';
  import type { IInventory } from '@/services/Inventory/Inventory.interface';
  import StatusBadge from '@/components/UI/StatusBadge.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import ActionIconButton from '@/components/UI/ActionIconButton.vue';
  import ProgressBar from '@/components/UI/ProgressBar.vue';
  import EditPencilIcon from '@/assets/images/SVGs/EditPencilIcon.svg';
  import XCircleIcon from '@/assets/images/SVGs/XCircleIcon.svg';
  import EyeSimpleIcon from '@/assets/images/SVGs/EyeSimpleIcon.svg';
  import PrinterIcon from '@/assets/images/SVGs/PrinterIcon.svg';
  import CalendarDayIcon from '@/assets/images/SVGs/CalendarDayIcon.svg';
  import ShieldIcon from '@/assets/images/SVGs/ShieldIcon.svg';
  import DeleteIcon from '@/assets/images/SVGs/Delete.svg';

  const props = defineProps<{
    inventory: IInventory;
    showDelete?: boolean;
  }>();

  const emit = defineEmits<{
    edit: [id: number];
    viewDetails: [id: number];
    delete: [inventory: IInventory];
  }>();

  const inventoryStatusMap: Record<string, { variant: 'success' | 'danger' | 'warning' | 'primary' | 'secondary' | 'info' | 'default' }> = {
    Available: { variant: 'success' },
    LowStock: { variant: 'warning' },
    OutOfStock: { variant: 'danger' },
    Expired: { variant: 'danger' },
    Discontinued: { variant: 'default' },
  };

  const categoryColor = computed(() => {
    const colors: Record<string, string> = {
      Medicine: 'bg-primary-light text-light',
      Equipment: 'bg-secondary-light text-light',
      Surgical: 'bg-danger-light text-light',
      Laboratory: 'bg-success-light text-light',
      Consumables: 'bg-warning-light text-light',
      Furniture: 'bg-primary-light text-light',
      PPE: 'bg-danger-light text-light',
      Other: 'bg-elevated text-light',
    };
    return colors[props.inventory.category] || colors.Other;
  });
</script>

<template>
  <div class="rounded-sm border border-stroke bg-surface shadow-default dark:border-strokedark hover:shadow-lg transition-shadow duration-200">
    <div class="p-6">
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-emphasis mb-1">
            {{ inventory.name }}
          </h3>
          <p v-if="inventory.sku" class="text-sm text-bodydark dark:text-bodydark1">SKU: {{ inventory.sku }}</p>
        </div>
        <div class="flex items-center gap-2">
          <StatusBadge :status="inventory.status" :status-map="inventoryStatusMap" />
          <ActionIconButton v-if="showDelete" variant="danger" title="Delete Inventory Item" @click="emit('delete', inventory)">
            <DeleteIcon class="w-5 h-5" />
          </ActionIconButton>
        </div>
      </div>

      <div class="flex flex-wrap gap-2 mb-4">
        <span :class="['inline-flex rounded px-2 py-1 text-xs', categoryColor]">
          {{ inventory.category }}
        </span>
        <span class="inline-flex rounded bg-elevated px-2 py-1 text-xs font-medium text-bodydark dark:text-bodydark1">
          {{ inventory.itemType }}
        </span>
      </div>

      <div class="mb-4">
        <ProgressBar :value="inventory.stockPercentage" label="Stock Level" variant="auto" size="sm" value-format="fraction" :thresholds="{ warning: 40, danger: 20 }" />
        <div class="flex justify-between items-center mt-1 text-xs text-muted">
          <span>{{ inventory.quantity }} / {{ inventory.maximumStockLevel }}</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div class="pb-3 border-b border-stroke dark:border-strokedark">
          <p class="text-bodydark dark:text-bodydark1">Cost</p>
          <p class="font-medium text-emphasis">${{ inventory.cost }}</p>
        </div>
        <div class="pb-3 border-b border-stroke dark:border-strokedark">
          <p class="text-bodydark dark:text-bodydark1">Price</p>
          <p class="font-medium text-emphasis">${{ inventory.price }}</p>
        </div>
        <div v-if="inventory.location" class="pt-3 border-t border-stroke dark:border-strokedark">
          <p class="text-bodydark dark:text-bodydark1">Location</p>
          <p class="font-medium text-emphasis truncate">{{ inventory.location }}</p>
        </div>
        <div v-if="inventory.manufacturer" class="pt-3 border-t border-stroke dark:border-strokedark">
          <p class="text-bodydark dark:text-bodydark1">Manufacturer</p>
          <p class="font-medium text-emphasis truncate">{{ inventory.manufacturer }}</p>
        </div>
      </div>

      <div v-if="inventory.isLowStock || inventory.isExpiringSoon || inventory.isExpired" class="mb-4 space-y-2">
        <div v-if="inventory.isExpired" class="flex items-center gap-2 text-xs text-danger">
          <XCircleIcon class="w-4 h-4" />
          <span>Expired</span>
        </div>
        <div v-else-if="inventory.isExpiringSoon" class="flex items-center gap-2 text-xs text-warning">
          <PrinterIcon class="w-4 h-4" />
          <span>Expires in {{ inventory.daysUntilExpiry }} days</span>
        </div>
        <div v-if="inventory.isLowStock" class="flex items-center gap-2 text-xs text-warning">
          <PrinterIcon class="w-4 h-4" />
          <span>Low Stock</span>
        </div>
      </div>

      <div v-if="inventory.requiresPrescription || inventory.isTemperatureControlled || inventory.isHazardous" class="flex flex-wrap gap-2 mb-4">
        <span v-if="inventory.requiresPrescription" class="inline-flex items-center gap-1 rounded bg-primary-light px-2 py-1 text-xs text-light">
          <ShieldIcon class="w-3 h-3" />
          Prescription
        </span>
        <span v-if="inventory.isTemperatureControlled" class="inline-flex items-center gap-1 rounded bg-primary-light px-2 py-1 text-xs text-light">
          <CalendarDayIcon class="w-3 h-3" />
          Temp Control
        </span>
        <span v-if="inventory.isHazardous" class="inline-flex items-center gap-1 rounded bg-danger-light px-2 py-1 text-xs text-light">
          <PrinterIcon class="w-3 h-3" />
          Hazardous
        </span>
      </div>

      <div class="flex gap-2">
        <BaseButton variant="primary" size="sm" @click="emit('viewDetails', inventory.id)" class="flex-1">
          <EyeSimpleIcon class="w-4 h-4" />
          View
        </BaseButton>
        <BaseButton variant="secondary" size="sm" @click="emit('edit', inventory.id)" class="flex-1 !bg-meta-3 hover:!bg-meta-3/90 !text-light">
          <EditPencilIcon class="w-4 h-4" />
          Edit
        </BaseButton>
      </div>
    </div>
  </div>
</template>
