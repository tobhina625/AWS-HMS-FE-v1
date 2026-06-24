<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BranchService, { type BranchDto } from '@/services/Branch/Branch.services';

  interface Props {
    modelValue?: number | null;
    label?: string;
    placeholder?: string;
    fieldRequired?: boolean;
    error?: boolean;
    errorMessage?: string;
    disabled?: boolean;
  }

  withDefaults(defineProps<Props>(), {
    label: 'Branch',
    placeholder: 'Select branch...',
    fieldRequired: false,
    error: false,
    errorMessage: '',
    disabled: false,
  });

  const emit = defineEmits<{
    'update:modelValue': [value: number | null];
    'branch-selected': [branch: BranchDto | null];
  }>();

  const branches = ref<BranchDto[]>([]);
  const loading = ref(false);

  const branchOptions = ref<{ value: number; label: string }[]>([]);

  const loadBranches = async () => {
    loading.value = true;
    try {
      const response = await BranchService.getAllBranches(0, 100, 'name', '');
      if (response.isSuccess && response.data) {
        branches.value = response.data;
        branchOptions.value = branches.value.map((branch) => ({
          value: branch.id,
          label: `${branch.name} (${branch.code})`,
        }));
      }
    } catch (err) {
      console.error('Failed to load branches:', err);
    } finally {
      loading.value = false;
    }
  };

  const handleChange = (value: number | null) => {
    emit('update:modelValue', value);
    const selectedBranch = branches.value.find((b) => b.id === value) || null;
    emit('branch-selected', selectedBranch);
  };

  onMounted(async () => {
    await loadBranches();
  });
</script>

<template>
  <BaseSelect
    :label="label"
    :modelValue="modelValue"
    @update:modelValue="handleChange"
    :options="branchOptions"
    :loading="loading"
    :placeholder="placeholder"
    :field-required="fieldRequired"
    :error="error"
    :error-message="errorMessage"
    :disabled="disabled"
  />
</template>
