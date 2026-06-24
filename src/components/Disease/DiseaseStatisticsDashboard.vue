<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import type { IDiseaseStatistics } from '@/services/Disease/Disease.dto';
  import DiseasesServices from '@/services/Disease/Disease.services';
  import CollapsibleSection from '@/components/UI/CollapsibleSection.vue';
  import SkeletonGroup from '@/components/UI/SkeletonGroup.vue';
  import StatsGridCard from '@/components/UI/StatsGridCard.vue';
  import StatsGroupGrid from '@/components/UI/StatsGroupGrid.vue';
  import FolderIcon from '@/assets/images/SVGs/FolderIcon.svg';
  import BellNotificationIcon from '@/assets/images/SVGs/BellNotificationIcon.svg';
  import LinkIcon from '@/assets/images/SVGs/LinkIcon.svg';
  import TagIcon from '@/assets/images/SVGs/TagIcon.svg';

  const diseaseService = new DiseasesServices();
  const loading = ref(true);
  const statistics = ref<IDiseaseStatistics>({
    totalDiseases: 0,
    activeDiseases: 0,
    contagiousDiseases: 0,
    criticalDiseases: 0,
    diseasesByCategory: [],
    diseasesBySeverity: [],
    diseasesByBodyPart: [],
  });

  const loadStatistics = async () => {
    loading.value = true;
    try {
      const response = await diseaseService.getDiseaseStatistics();
      if (response?.data) {
        statistics.value = response.data;
      }
    } catch (error) {
      console.error('Failed to load disease statistics:', error);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    loadStatistics();
  });
</script>

<template>
  <CollapsibleSection title="Disease Catalog Overview">
    <SkeletonGroup v-if="loading" preset="stats-grid" />

    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsGridCard label="Total Diseases" :value="statistics.totalDiseases" variant="primary" minimal :icon="FolderIcon" />
        <StatsGridCard label="Active Cases" :value="statistics.activeDiseases" variant="success" minimal :icon="TagIcon" />
        <StatsGridCard label="Contagious" :value="statistics.contagiousDiseases" variant="warning" minimal :icon="LinkIcon" />
        <StatsGridCard label="Critical" :value="statistics.criticalDiseases" variant="danger" minimal :icon="BellNotificationIcon" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsGroupGrid
          v-if="statistics.diseasesByCategory?.length"
          title="By Category"
          :items="statistics.diseasesByCategory.map((c) => ({ label: c.category, value: c.count }))"
          :columns="2"
          variant="muted"
        />

        <StatsGroupGrid
          v-if="statistics.diseasesBySeverity?.length"
          title="By Severity"
          :items="statistics.diseasesBySeverity.map((s) => ({ label: s.severity, value: s.count }))"
          :columns="2"
          variant="muted"
        />

        <StatsGroupGrid
          v-if="statistics.diseasesByBodyPart?.length"
          title="By Body Part"
          :items="statistics.diseasesByBodyPart.map((p) => ({ label: p.bodyPart, value: p.count }))"
          :columns="2"
          variant="muted"
        />
      </div>
    </div>
  </CollapsibleSection>
</template>
