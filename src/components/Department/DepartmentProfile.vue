<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import DepartmentsServices from '@/services/Department/Department.services';
  import type { IDepartment } from '@/services/Department/Department.dto';
  import EditPencilIcon from '@/assets/images/SVGs/EditPencilIcon.svg';
  import KeyIcon from '@/assets/images/SVGs/KeyIcon.svg';

  const route = useRoute();
  const router = useRouter();
  const { showAlert } = useAlert();
  const departmentService = new DepartmentsServices();

  const loading = ref(true);
  const department = ref<IDepartment | null>(null);

  const loadDepartmentDetails = async () => {
    loading.value = true;
    try {
      const departmentId = route.params.id as string;
      const response = await departmentService.getDepartmentById(departmentId);
      if (response?.data) {
        department.value = response.data;
      }
    } catch {
      showAlert('error', 'Failed to load department details', 'Error');
      router.push('/departments');
    } finally {
      loading.value = false;
    }
  };

  const handleBack = () => {
    router.push('/departments');
  };

  const handleEdit = () => {
    if (department.value) router.push(`/departments/edit/${department.value.id}`);
  };

  onMounted(() => {
    loadDepartmentDetails();
  });
</script>

<template>
  <div class="mt-6">
    <div v-if="loading" class="animate-pulse space-y-6">
      <div class="bg-surface rounded-2xl p-6">
        <div class="h-8 bg-elevated rounded w-1/3 mb-4"></div>
        <div class="h-64 bg-elevated rounded"></div>
      </div>
    </div>

    <div v-else-if="department" class="space-y-6 mt-6">
      <div class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark overflow-hidden">
        <div class="h-24 bg-gradient-to-r from-primary to-primary"></div>
        <div class="px-6 pb-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-12">
            <div class="w-24 h-24 rounded-2xl border-4 border-white dark:border-boxdark bg-surface shadow-lg flex items-center justify-center">
              <span class="text-3xl font-bold text-primary">{{ department.name?.charAt(0) || 'D' }}</span>
            </div>
            <div class="flex-1 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4">
              <div>
                <h1 class="text-3xl font-bold text-emphasis mb-1">{{ department.name }}</h1>
                <div class="flex flex-wrap items-center gap-4 text-sm text-bodydark dark:text-bodydark1">
                  <span class="inline-block px-2.5 py-1 rounded-full text-xs font-black uppercase bg-meta-3/10 text-meta-3 border border-meta-3/20">
                    {{ department.status || 'Active' }}
                  </span>
                  <span v-if="department.location" class="flex items-center gap-1">{{ department.location }}</span>
                </div>
              </div>
              <div class="flex flex-wrap gap-3">
                <BaseButton variant="outline" size="md" @click="handleBack" class="border-2 border-stroke dark:border-strokedark text-emphasis hover:border-primary dark:hover:border-primary">
                  <KeyIcon class="w-4 h-4 mr-2" />
                  Back
                </BaseButton>
                <BaseButton variant="primary" size="md" @click="handleEdit">
                  <EditPencilIcon class="w-4 h-4 mr-2" />
                  Edit Department
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-surface rounded-2xl shadow-sm border border-stroke dark:border-strokedark p-6">
        <h2 class="text-xl font-semibold text-emphasis mb-6">Department Information</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1">
            <label class="text-sm text-bodydark dark:text-bodydark1">Department Name</label>
            <p class="text-base font-medium text-emphasis">{{ department.name }}</p>
          </div>
          <div class="space-y-1">
            <label class="text-sm text-bodydark dark:text-bodydark1">Status</label>
            <p class="text-base font-medium text-emphasis">{{ department.status || 'Active' }}</p>
          </div>
          <div class="space-y-1">
            <label class="text-sm text-bodydark dark:text-bodydark1">Head of Department</label>
            <p class="text-base font-medium text-emphasis">{{ department.headOfDepartment || '-' }}</p>
          </div>
          <div class="space-y-1">
            <label class="text-sm text-bodydark dark:text-bodydark1">Location</label>
            <p class="text-base font-medium text-emphasis">{{ department.location || '-' }}</p>
          </div>
          <div class="space-y-1">
            <label class="text-sm text-bodydark dark:text-bodydark1">Phone</label>
            <p class="text-base font-medium text-emphasis">{{ department.phone || '-' }}</p>
          </div>
          <div class="space-y-1">
            <label class="text-sm text-bodydark dark:text-bodydark1">Email</label>
            <p class="text-base font-medium text-emphasis">{{ department.email || '-' }}</p>
          </div>
          <div class="space-y-1">
            <label class="text-sm text-bodydark dark:text-bodydark1">Capacity</label>
            <p class="text-base font-medium text-emphasis">{{ department.capacity ?? '-' }}</p>
          </div>
          <div class="space-y-1">
            <label class="text-sm text-bodydark dark:text-bodydark1">Established Date</label>
            <p class="text-base font-medium text-emphasis">{{ department.establishedDate ? new Date(department.establishedDate).toLocaleDateString() : '-' }}</p>
          </div>
          <div class="space-y-1 md:col-span-2">
            <label class="text-sm text-bodydark dark:text-bodydark1">Description</label>
            <p class="text-base font-medium text-emphasis">{{ department.description || 'No description' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
