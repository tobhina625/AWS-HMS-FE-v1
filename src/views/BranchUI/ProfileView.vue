<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue';
  import BaseCard from '@/components/Base/BaseCard.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import StatusBadge from '@/components/UI/StatusBadge.vue';
  import DynamicTable from '@/components/UI/DynamicTable.vue';
  import BranchService, { type BranchDto } from '@/services/Branch/Branch.services';
  import EmployeeBranchService, { type EmployeeBranchDto } from '@/services/EmployeeBranch/EmployeeBranch.services';

  const route = useRoute();
  const router = useRouter();
  const { showAlert } = useAlert();

  const pageTitle = ref('Branch Profile');
  const isLoading = ref(true);
  const branch = ref<BranchDto | null>(null);
  const branchEmployees = ref<EmployeeBranchDto[]>([]);
  const activeTab = ref('about');

  const branchId = computed(() => Number(route.params.id));

  const loadBranchData = async () => {
    try {
      const response = await BranchService.getBranchById(branchId.value);
      if (response.isSuccess && response.data) {
        branch.value = response.data;
      } else {
        showAlert('error', 'Branch not found.', 'Error');
        router.push('/branches');
      }
    } catch {
      showAlert('error', 'Failed to load branch.', 'Error');
      router.push('/branches');
    }
  };

  const loadBranchEmployees = async () => {
    try {
      const response = await EmployeeBranchService.getByBranchId(branchId.value);
      if (response.isSuccess && response.data) {
        branchEmployees.value = response.data;
      }
    } catch (err) {
      console.error('Failed to load branch employees:', err);
    }
  };

  const handleEdit = () => {
    router.push(`/branches/edit/${branchId.value}`);
  };

  const employeeColumns = ['employeeName', 'assignmentType', 'requireLocationVerification', 'assignedFrom', 'assignedTo'];

  onMounted(async () => {
    isLoading.value = true;
    await Promise.all([loadBranchData(), loadBranchEmployees()]);
    isLoading.value = false;
  });
</script>

<template>
  <DefaultLayout>
    <div class="mx-auto max-w-full">
      <BreadcrumbDefault :pageTitle="pageTitle" />

      <div v-if="isLoading" class="flex items-center justify-center h-64 mt-6">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p class="mt-4 text-muted">Loading branch...</p>
        </div>
      </div>

      <div v-else-if="branch" class="space-y-6 mt-6">
        <BaseCard>
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-2xl font-bold text-foreground mb-2">{{ branch.name }}</h2>
              <p class="text-muted">{{ branch.code }}</p>
            </div>
            <div class="flex gap-3">
              <StatusBadge :status="branch.status" />
              <BaseButton @click="handleEdit" variant="outline">Edit Branch</BaseButton>
            </div>
          </div>

          <div class="border-b border-border mb-6">
            <nav class="flex space-x-8">
              <button
                @click="activeTab = 'about'"
                :class="[
                  'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === 'about' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground hover:border-border',
                ]"
              >
                About
              </button>
              <button
                @click="activeTab = 'staff'"
                :class="[
                  'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === 'staff' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground hover:border-border',
                ]"
              >
                Staff ({{ branchEmployees.length }})
              </button>
            </nav>
          </div>

          <div v-if="activeTab === 'about'" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 class="text-sm font-medium text-muted mb-1">Address</h3>
                <p class="text-foreground">{{ branch.address }}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-muted mb-1">City</h3>
                <p class="text-foreground">{{ branch.city || '-' }}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-muted mb-1">Phone Number</h3>
                <p class="text-foreground">{{ branch.phoneNumber || '-' }}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-muted mb-1">Email</h3>
                <p class="text-foreground">{{ branch.email || '-' }}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-muted mb-1">Branch Head</h3>
                <p class="text-foreground">{{ branch.branchHeadName || 'Not Assigned' }}</p>
              </div>
              <div>
                <h3 class="text-sm font-medium text-muted mb-1">Total Staff</h3>
                <p class="text-foreground">{{ branch.employeeCount }}</p>
              </div>
            </div>

            <div v-if="branch.latitude && branch.longitude" class="border-t border-border pt-6">
              <h3 class="text-lg font-semibold mb-4">Location Settings</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 class="text-sm font-medium text-muted mb-1">Latitude</h3>
                  <p class="text-foreground">{{ branch.latitude }}</p>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-muted mb-1">Longitude</h3>
                  <p class="text-foreground">{{ branch.longitude }}</p>
                </div>
                <div>
                  <h3 class="text-sm font-medium text-muted mb-1">Allowed Radius</h3>
                  <p class="text-foreground">{{ branch.allowedRadiusMeters }} meters</p>
                </div>
                <div class="md:col-span-3">
                  <h3 class="text-sm font-medium text-muted mb-1">Location Verification</h3>
                  <p class="text-foreground">{{ branch.requireLocationLogin ? 'Required' : 'Not Required' }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'staff'">
            <div v-if="branchEmployees.length === 0" class="text-center py-12">
              <p class="text-muted">No staff assigned to this branch yet.</p>
            </div>
            <DynamicTable v-else :columns="employeeColumns" :data="branchEmployees" :loading="false" :can-delete="false" :show-actions="false" />
          </div>
        </BaseCard>
      </div>
    </div>
  </DefaultLayout>
</template>
