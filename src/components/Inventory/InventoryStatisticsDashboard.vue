<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { inventoryService } from '@/services/Inventory/Inventory.services';
  import type { IInventoryStatistics } from '@/services/Inventory/Inventory.interface';
  import CollapsibleSection from '@/components/UI/CollapsibleSection.vue';
  import LoadingSpinner from '@/components/UI/LoadingSpinner.vue';
  import ProgressBar from '@/components/UI/ProgressBar.vue';
  import StatsGridCard from '@/components/UI/StatsGridCard.vue';
  import StatsGroupGrid from '@/components/UI/StatsGroupGrid.vue';
  import AlertTriangleIcon from '@/assets/images/SVGs/AlertTriangleIcon.svg';
  import BriefcaseIcon from '@/assets/images/SVGs/BriefcaseIcon.svg';
  import InfoCircleIcon from '@/assets/images/SVGs/InfoCircleIcon.svg';
  import ClockFilledIcon from '@/assets/images/SVGs/ClockFilledIcon.svg';
  import PrinterIcon from '@/assets/images/SVGs/PrinterIcon.svg';
  import ChatBubbleIcon from '@/assets/images/SVGs/ChatBubbleIcon.svg';

  const statistics = ref<IInventoryStatistics | null>(null);
  const loading = ref(true);

  onMounted(async () => {
    await fetchStatistics();
  });

  const fetchStatistics = async () => {
    try {
      loading.value = true;
      const response = await inventoryService.getInventoryStatistics();
      if (response.data) {
        statistics.value = response.data;
      }
    } catch (error) {
      console.error('Error fetching inventory statistics:', error);
    } finally {
      loading.value = false;
    }
  };

  const totalValueFormatted = computed(() => {
    if (!statistics.value) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(statistics.value.totalValue);
  });
</script>

<template>
  <CollapsibleSection title="Inventory Statistics">
    <div v-if="loading" class="flex justify-center items-center py-8">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else-if="statistics" class="space-y-6">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsGridCard label="Total Items" :value="statistics.totalItems" variant="primary" :icon="BriefcaseIcon" />
        <StatsGridCard label="Total Value" :value="totalValueFormatted" variant="success" :icon="InfoCircleIcon" />
        <StatsGridCard label="Low Stock" :value="statistics.lowStockCount" variant="warning" :icon="AlertTriangleIcon" />
        <StatsGridCard label="Expiring Soon" :value="statistics.expiringCount" variant="danger" :icon="ClockFilledIcon" />
      </div>

      <StatsGroupGrid
        v-if="statistics.statusBreakdown?.length"
        title="Status Distribution"
        :items="statistics.statusBreakdown.map((s) => ({ label: s.status, value: s.count }))"
        :columns="5"
        variant="muted"
      />

      <div>
        <h4 class="mb-3 text-lg font-semibold text-emphasis">Category Breakdown</h4>
        <div class="space-y-3">
          <div v-for="item in statistics.categoryBreakdown" :key="item.category" class="rounded-sm border border-strokedark bg-surface p-4 dark:border-strokedark">
            <div class="flex justify-between items-center mb-2">
              <span class="font-medium text-emphasis">{{ item.category }}</span>
              <div class="text-right">
                <span class="text-sm font-medium text-emphasis">{{ item.count }} items</span>
                <span class="text-xs text-bodydark ml-2">${{ item.totalValue.toLocaleString() }}</span>
              </div>
            </div>
            <ProgressBar :value="item.count" :max="statistics.totalItems" :show-value="false" variant="primary" size="sm" />
          </div>
        </div>
      </div>

      <div v-if="statistics.lowStockItems.length > 0 || statistics.expiringItems.length > 0" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div v-if="statistics.lowStockItems.length > 0">
          <h4 class="mb-3 text-lg font-semibold text-emphasis flex items-center gap-2">
            <PrinterIcon class="w-5 h-5 text-warning" />
            Low Stock Items
          </h4>
          <div class="space-y-2">
            <div v-for="item in statistics.lowStockItems" :key="item.id" class="rounded-sm border border-stroke bg-surface p-3 dark:border-strokedark flex justify-between items-center">
              <div>
                <p class="font-medium text-emphasis">{{ item.name }}</p>
                <p class="text-xs text-bodydark">{{ item.category }}</p>
              </div>
              <div class="text-right">
                <p class="font-medium text-warning">{{ item.quantity }}</p>
                <p class="text-xs text-bodydark">Min: {{ item.minimumStockLevel }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="statistics.expiringItems.length > 0">
          <h4 class="mb-3 text-lg font-semibold text-emphasis flex items-center gap-2">
            <ChatBubbleIcon class="w-5 h-5 text-danger" />
            Expiring Soon
          </h4>
          <div class="space-y-2">
            <div v-for="item in statistics.expiringItems" :key="item.id" class="rounded-sm border border-stroke bg-surface p-3 dark:border-strokedark flex justify-between items-center">
              <div>
                <p class="font-medium text-emphasis">{{ item.name }}</p>
                <p class="text-xs text-bodydark">Batch: {{ item.batchNumber }}</p>
              </div>
              <div class="text-right">
                <p class="font-medium text-danger">{{ item.daysUntilExpiry }} days</p>
                <p class="text-xs text-bodydark">{{ new Date(item.expiryDate!).toLocaleDateString() }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </CollapsibleSection>
</template>
