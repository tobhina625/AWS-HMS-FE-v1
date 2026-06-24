<script setup lang="ts">
  import KeyIcon from '@/assets/images/SVGs/KeyIcon.svg';
  import EditPencilIcon from '@/assets/images/SVGs/EditPencilIcon.svg';
  import TrashDetailedIcon from '@/assets/images/SVGs/TrashDetailedIcon.svg';
  import DotsHorizontalIcon from '@/assets/images/SVGs/DotsHorizontalIcon.svg';
  import UserIcon from '@/assets/images/SVGs/UserIcon.svg';
  import BriefcaseIcon from '@/assets/images/SVGs/BriefcaseIcon.svg';

  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import DesignationsService from '@/services/Designation/Designation.services';
  import EmployeesServices from '@/services/Employee/Employee.services';
  import type { IDesignation } from '@/services/Designation/Designation.dto';
  import { useConfirm } from '@/composables/useConfirm';
  import { usePermissions } from '@/composables/usePermissions';

  const route = useRoute();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { confirm } = useConfirm();
  const { canDeleteFromModule } = usePermissions();
  const designationService = new DesignationsService();
  const employeeService = new EmployeesServices();
  const canDelete = computed(() => canDeleteFromModule('Designations'));

  const pageTitle = ref('Designation Profile');
  const loading = ref(true);
  const designation = ref<IDesignation | null>(null);
  const employees = ref<any[]>([]);

  const roleName = computed(() => {
    const r = designation.value?.role;
    return typeof r === 'string' ? r : r?.name || 'Not Assigned';
  });

  const loadDesignationDetails = async () => {
    loading.value = true;
    try {
      const designationId = Number(route.params.id);
      const [designationResponse, employeesResponse] = await Promise.all([designationService.getDesignationById(designationId), employeeService.getEmployeesByDesignation(designationId, 0, 100)]);

      if (designationResponse?.data) {
        designation.value = designationResponse.data;
      }

      if (employeesResponse?.content || employeesResponse?.Content) {
        const content = employeesResponse.content || employeesResponse.Content;
        employees.value = Array.isArray(content) ? content : [];
      }
    } catch {
      showAlert('error', 'Failed to load designation details', 'Error');
      router.push('/designations');
    } finally {
      loading.value = false;
    }
  };

  const handleBack = () => {
    router.push('/designations');
  };

  const handleEdit = () => {
    if (designation.value) router.push(`/designations/edit/${designation.value.id}`);
  };

  const handleDelete = async () => {
    if (!canDelete.value || !designation.value) return;

    const confirmed = await confirm({
      title: 'Delete Designation',
      message: `Are you sure you want to delete "${designation.value.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (confirmed) {
      try {
        await designationService.deleteDesignationbyId(designation.value.id);
        showAlert('success', 'Designation has been deleted successfully.', 'Success');
        router.push('/designations');
      } catch {
        showAlert('error', 'An error occurred while deleting the designation.', 'Error');
      }
    }
  };

  const handleViewEmployee = (employee: any) => {
    router.push(`/employees/profile/${employee.id}`);
  };

  onMounted(() => {
    loadDesignationDetails();
  });
</script>

<template>
  <DefaultLayout>
    <BreadcrumbDefault :pageTitle="pageTitle" />

    <div v-if="loading" class="animate-pulse space-y-6">
      <div class="bg-surface rounded-2xl p-6">
        <div class="h-8 bg-elevated rounded w-1/3 mb-4"></div>
        <div class="h-64 bg-elevated rounded"></div>
      </div>
    </div>

    <div v-else-if="designation" class="space-y-6">
      <!-- Header Card -->
      <div class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark overflow-hidden">
        <div class="h-24 bg-gradient-to-r from-primary to-primary"></div>
        <div class="px-6 pb-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-12">
            <div class="w-24 h-24 rounded-2xl border-4 border-white dark:border-boxdark bg-surface shadow-lg flex items-center justify-center">
              <BriefcaseIcon class="w-12 h-12 text-primary dark:text-primary-light" />
            </div>
            <div class="flex-1 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4">
              <div>
                <h1 class="text-3xl font-bold text-emphasis mb-1">{{ designation.name }}</h1>
                <div class="flex flex-wrap items-center gap-4 text-sm text-bodydark dark:text-bodydark1">
                  <span class="inline-block px-2.5 py-1 rounded-full text-xs font-black uppercase bg-meta-3/10 text-meta-3 border border-meta-3/20">
                    {{ designation.status || 'Active' }}
                  </span>
                  <span v-if="designation.level" class="flex items-center gap-1">Level: {{ designation.level }}</span>
                  <span class="flex items-center gap-1">Role: {{ roleName }}</span>
                </div>
              </div>
              <div class="flex flex-wrap gap-3">
                <BaseButton variant="outline" size="md" @click="handleBack" class="border-2 border-stroke dark:border-strokedark text-emphasis hover:border-primary dark:hover:border-primary">
                  <KeyIcon class="w-4 h-4 mr-2" />
                  Back
                </BaseButton>
                <BaseButton v-if="canDelete" variant="danger" size="md" @click="handleDelete" class="!bg-danger !text-light hover:!bg-danger/90 border-2 border-danger">
                  <TrashDetailedIcon class="w-4 h-4 mr-2" />
                  Delete
                </BaseButton>
                <BaseButton variant="primary" size="md" @click="handleEdit">
                  <EditPencilIcon class="w-4 h-4 mr-2" />
                  Edit Designation
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Designation Information & Employees -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Designation Information Card -->
        <div class="lg:col-span-2 bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-6">
          <h2 class="text-xl font-semibold text-emphasis mb-6 flex items-center gap-2">
            <DotsHorizontalIcon class="w-6 h-6 text-primary" />
            Designation Information
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-1">
              <label class="text-sm text-bodydark dark:text-bodydark1">Designation Name</label>
              <p class="text-base font-medium text-emphasis">{{ designation.name }}</p>
            </div>
            <div class="space-y-1">
              <label class="text-sm text-bodydark dark:text-bodydark1">Status</label>
              <p class="text-base font-medium text-emphasis">{{ designation.status || 'Active' }}</p>
            </div>
            <div class="space-y-1">
              <label class="text-sm text-bodydark dark:text-bodydark1">Role</label>
              <p class="text-base font-medium text-emphasis">{{ roleName }}</p>
            </div>
            <div class="space-y-1">
              <label class="text-sm text-bodydark dark:text-bodydark1">Level</label>
              <p class="text-base font-medium text-emphasis">{{ designation.level || 'Not specified' }}</p>
            </div>
            <div class="space-y-1">
              <label class="text-sm text-bodydark dark:text-bodydark1">Min Salary</label>
              <p class="text-base font-medium text-emphasis">{{ designation.minSalary != null ? `$${designation.minSalary.toLocaleString()}` : 'Not specified' }}</p>
            </div>
            <div class="space-y-1">
              <label class="text-sm text-bodydark dark:text-bodydark1">Max Salary</label>
              <p class="text-base font-medium text-emphasis">{{ designation.maxSalary != null ? `$${designation.maxSalary.toLocaleString()}` : 'Not specified' }}</p>
            </div>
            <div class="space-y-1 md:col-span-2">
              <label class="text-sm text-bodydark dark:text-bodydark1">Responsibilities</label>
              <p class="text-base font-medium text-emphasis">{{ designation.responsibilities || 'No responsibilities defined' }}</p>
            </div>
          </div>
        </div>

        <!-- Employees Count Card -->
        <div class="space-y-4">
          <div class="bg-surface rounded-2xl shadow-sm p-6 border border-stroke dark:border-strokedark">
            <h3 class="text-lg font-semibold text-emphasis mb-4">Employees</h3>
            <p class="text-3xl font-bold text-primary mb-2">{{ employees.length }}</p>
            <p class="text-sm text-muted">Employees with this designation</p>
          </div>
        </div>
      </div>

      <!-- Employees List Section -->
      <div v-if="employees.length > 0" class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-6">
        <h2 class="text-xl font-semibold text-emphasis mb-6">Employees with this Designation</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="employee in employees"
            :key="employee.id"
            class="border border-stroke dark:border-strokedark rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
            @click="handleViewEmployee(employee)"
          >
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                <UserIcon class="w-5 h-5 text-primary dark:text-primary-light" />
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="font-semibold text-emphasis truncate">{{ employee.name }}</h3>
                <p class="text-sm text-muted truncate">{{ employee.email || '-' }}</p>
                <p class="text-xs text-bodydark dark:text-bodydark1 mt-1">{{ employee.department?.name || 'No department' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
