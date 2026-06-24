<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import useAlert from '@/plugins/alert/useAlert';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue';
  import BaseCard from '@/components/Base/BaseCard.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseSegmentedControl from '@/components/Base/BaseSegmentedControl.vue';
  import SystemConfigurationService, { type SystemConfigurationDto } from '@/services/SystemConfiguration/SystemConfiguration.services';
  import { usePermissions } from '@/composables/usePermissions';

  const { showAlert } = useAlert();
  const { canEditModule } = usePermissions();

  const pageTitle = ref('System Configuration');
  const isLoading = ref(true);
  const configurations = ref<SystemConfigurationDto[]>([]);
  const editingKey = ref<string | null>(null);
  const editingValue = ref('');
  const editingDescription = ref('');

  const canEdit = computed(() => canEditModule('SystemConfiguration'));

  const isBooleanValue = (value: string): boolean => {
    return value.toLowerCase() === 'true' || value.toLowerCase() === 'false';
  };

  const parseBooleanValue = (value: string): boolean => {
    return value.toLowerCase() === 'true';
  };

  const isLocationLoginMode = (key: string): boolean => {
    return key === 'LocationLoginMode';
  };

  const isColorField = (key: string): boolean => {
    return key === 'PrimaryColor' || key === 'SecondaryColor';
  };

  const isLogoField = (key: string): boolean => {
    return key === 'CompanyLogo';
  };

  const locationLoginModeOptions = [
    { value: 'strict', label: 'Strict' },
    { value: 'warn', label: 'Warn' },
    { value: 'configurable', label: 'Configurable' },
  ];

  const formatConfigKey = (key: string): string => {
    // Convert camelCase to Title Case with spaces
    return key
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim();
  };

  const getLocationModeDescription = (mode: string): string => {
    switch (mode) {
      case 'strict':
        return 'Blocks login if user is outside allowed radius';
      case 'warn':
        return 'Shows warning but allows login from any location';
      case 'configurable':
        return 'Enforces location per branch/employee settings';
      default:
        return '';
    }
  };

  const groupedConfigurations = computed(() => {
    const groups: Record<string, SystemConfigurationDto[]> = {};
    configurations.value.forEach((config) => {
      const category = config.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(config);
    });
    return groups;
  });

  const loadConfigurations = async () => {
    isLoading.value = true;
    try {
      const response = await SystemConfigurationService.getAllConfigurations();
      if (response.isSuccess && response.data) {
        configurations.value = response.data;
      } else {
        showAlert('error', 'Failed to load configurations.', 'Error');
      }
    } catch {
      showAlert('error', 'Failed to load configurations.', 'Error');
    } finally {
      isLoading.value = false;
    }
  };

  const startEdit = (config: SystemConfigurationDto) => {
    if (!config.isEditable || !canEdit.value) return;
    editingKey.value = config.key;
    editingValue.value = config.value;
    editingDescription.value = config.description || '';
  };

  const cancelEdit = () => {
    editingKey.value = null;
    editingValue.value = '';
    editingDescription.value = '';
  };

  const saveEdit = async (key: string) => {
    try {
      const valueToSave = editingValue.value;
      const response = await SystemConfigurationService.updateConfiguration(key, valueToSave, editingDescription.value);
      if (response.isSuccess) {
        showAlert('success', 'Configuration updated successfully.', 'Success');
        await loadConfigurations();
        cancelEdit();
      } else {
        showAlert('error', response.error || 'Failed to update configuration.', 'Error');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to update configuration';
      showAlert('error', msg, 'Error');
    }
  };

  onMounted(async () => {
    await loadConfigurations();
  });
</script>

<template>
  <DefaultLayout>
    <div class="mx-auto max-w-full">
      <BreadcrumbDefault :pageTitle="pageTitle" />

      <div v-if="isLoading" class="flex items-center justify-center h-64 mt-6">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p class="mt-4 text-muted">Loading configurations...</p>
        </div>
      </div>

      <div v-else class="space-y-6 mt-6">
        <div v-for="(configs, category) in groupedConfigurations" :key="category">
          <BaseCard>
            <div class="border-b border-border/50 pb-4 mb-6">
              <h3 class="text-xl font-bold text-foreground">{{ category }}</h3>
            </div>

            <div class="space-y-6">
              <div v-for="config in configs" :key="config.id" class="border-b border-border/50 last:border-b-0 pb-6 last:pb-0">
                <div class="flex justify-between items-start mb-3">
                  <div class="flex-1">
                    <h4 class="font-semibold text-foreground text-base">{{ formatConfigKey(config.key) }}</h4>
                    <p v-if="config.description" class="text-sm text-muted mt-1.5">{{ config.description }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span v-if="!config.isEditable" class="text-xs px-2.5 py-1 bg-muted/20 text-muted rounded-md font-medium">Read-only</span>
                  </div>
                </div>

                <div v-if="editingKey === config.key" class="mt-4 space-y-4 bg-muted/10 p-5 rounded-lg border border-border/50">
                  <!-- Location Login Mode Segmented Control -->
                  <div v-if="isLocationLoginMode(config.key)" class="space-y-3">
                    <BaseSegmentedControl label="Value" v-model="editingValue" :options="locationLoginModeOptions" />
                    <p class="text-xs text-muted italic pl-1">
                      {{ getLocationModeDescription(editingValue) }}
                    </p>
                  </div>
                  <!-- Boolean Segmented Control -->
                  <div v-else-if="isBooleanValue(config.value)" class="space-y-2">
                    <BaseSegmentedControl
                      label="Value"
                      v-model="editingValue"
                      :options="[
                        { value: 'true', label: 'Enabled' },
                        { value: 'false', label: 'Disabled' },
                      ]"
                    />
                  </div>
                  <!-- Color Picker for color fields -->
                  <div v-else-if="isColorField(config.key)" class="space-y-2">
                    <label class="block text-sm font-medium text-foreground mb-2">Value</label>
                    <div class="flex items-center gap-3">
                      <input type="color" v-model="editingValue" class="h-10 w-20 rounded border border-border cursor-pointer" />
                      <BaseInput v-model="editingValue" placeholder="#000000" class="flex-1" />
                    </div>
                    <p class="text-xs text-muted italic">Note: Color changes will be applied after page refresh</p>
                  </div>
                  <!-- Logo Upload field -->
                  <div v-else-if="isLogoField(config.key)" class="space-y-2">
                    <label class="block text-sm font-medium text-foreground mb-2">Company Logo URL</label>
                    <BaseInput v-model="editingValue" placeholder="Enter logo URL or leave empty..." />
                    <p class="text-xs text-muted italic">Enter a URL to an image or leave empty to use default</p>
                  </div>
                  <!-- Text Input for non-boolean values -->
                  <BaseInput v-else label="Value" v-model="editingValue" placeholder="Enter value..." />

                  <BaseInput label="Description" v-model="editingDescription" placeholder="Enter description..." />
                  <div class="flex gap-3 pt-2">
                    <BaseButton @click="saveEdit(config.key, isBooleanValue(config.value))" size="sm">Save Changes</BaseButton>
                    <BaseButton @click="cancelEdit" variant="outline" size="sm">Cancel</BaseButton>
                  </div>
                </div>

                <div v-else class="mt-3 flex justify-between items-center">
                  <!-- Location Login Mode Badge -->
                  <div v-if="isLocationLoginMode(config.key)" class="flex flex-col gap-1.5">
                    <span
                      class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold capitalize shadow-sm w-fit"
                      :class="{
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300': config.value === 'strict',
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300': config.value === 'warn',
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300': config.value === 'configurable',
                      }"
                    >
                      {{ config.value }}
                    </span>
                    <p class="text-xs text-muted italic">
                      {{ getLocationModeDescription(config.value) }}
                    </p>
                  </div>
                  <!-- Boolean Badge -->
                  <div v-else-if="isBooleanValue(config.value)">
                    <span
                      class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold capitalize shadow-sm"
                      :class="
                        parseBooleanValue(config.value) ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-300'
                      "
                    >
                      {{ parseBooleanValue(config.value) ? 'Enabled' : 'Disabled' }}
                    </span>
                  </div>
                  <!-- Color Display -->
                  <div v-else-if="isColorField(config.key)" class="flex items-center gap-3">
                    <div class="flex items-center gap-2 px-4 py-2 bg-muted/20 rounded-lg">
                      <div class="w-8 h-8 rounded border border-border shadow-sm" :style="{ backgroundColor: config.value }"></div>
                      <code class="text-sm text-foreground font-mono">{{ config.value }}</code>
                    </div>
                  </div>
                  <!-- Logo Display -->
                  <div v-else-if="isLogoField(config.key)">
                    <div v-if="config.value" class="flex items-center gap-3">
                      <img :src="config.value" alt="Company Logo" class="h-12 w-auto object-contain rounded border border-border" @error="(e) => (e.target.style.display = 'none')" />
                      <code class="text-xs text-muted font-mono truncate max-w-xs">{{ config.value }}</code>
                    </div>
                    <span v-else class="text-sm text-muted italic">No logo set</span>
                  </div>
                  <!-- Regular Value -->
                  <code v-else class="text-sm bg-muted/20 px-4 py-2 rounded-lg text-foreground font-mono">{{ config.value }}</code>

                  <BaseButton v-if="config.isEditable && canEdit" @click="startEdit(config)" variant="outline" size="sm" class="ml-4">Edit</BaseButton>
                </div>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
