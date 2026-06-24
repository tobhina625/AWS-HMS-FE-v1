<script setup>
  import DotsVerticalIcon from '@/assets/images/SVGs/DotsVerticalIcon.svg';
  import DotsHorizontalIcon from '@/assets/images/SVGs/DotsHorizontalIcon.svg';
  import UserIcon from '@/assets/images/SVGs/UserIcon.svg';

  import { onMounted, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import useAlert from '@/plugins/alert/useAlert';
  import router from '@/router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseCheckbox from '@/components/Base/BaseCheckbox.vue';
  import EmployeePermissionsServices from '@/services/EmployeePermissions/EmployeePermissions.services';

  const employeePermissionService = new EmployeePermissionsServices();
  const readParamsId = useRoute();
  const { showAlert } = useAlert();

  const selectAllList = ref(false);
  const selectAllAdd = ref(false);
  const selectAllView = ref(false);
  const selectAllEdit = ref(false);
  const selectAllDelete = ref(false);

  const apiResponse = ref({
    Employee: {
      id: '',
      name: '',
    },
    Permission: [
      {
        id: '',
        name: '',
        isList: false,
        isAdd: false,
        isView: false,
        isEdit: false,
        isDelete: false,
      },
    ],
  });

  const toggleAllList = () => {
    apiResponse.value.Permission = apiResponse.value.Permission.map((p) => ({
      ...p,
      isList: selectAllList.value,
    }));
  };

  const toggleAllAdd = () => {
    apiResponse.value.Permission = apiResponse.value.Permission.map((p) => ({
      ...p,
      isAdd: selectAllAdd.value,
    }));
  };

  const toggleAllView = () => {
    apiResponse.value.Permission = apiResponse.value.Permission.map((p) => ({
      ...p,
      isView: selectAllView.value,
    }));
  };

  const toggleAllEdit = () => {
    apiResponse.value.Permission = apiResponse.value.Permission.map((p) => ({
      ...p,
      isEdit: selectAllEdit.value,
    }));
  };

  const toggleAllDelete = () => {
    apiResponse.value.Permission = apiResponse.value.Permission.map((p) => ({
      ...p,
      isDelete: selectAllDelete.value,
    }));
  };

  const loadEmployeePermission = async (id) => {
    var response = await employeePermissionService.getEmployeesPermissions(id);
    apiResponse.value = {
      Employee: response.data.employee,
      Permission: response.data.permission,
    };
  };

  const updateEmployeePermissions = async () => {
    var response = await employeePermissionService.addEmployeePermissions(apiResponse.value);
    if (response.isSuccess) {
      showAlert('success', 'Permission Updated Successfully', 'Success');
      router.push('/permissions/employees');
    } else {
      showAlert('error', response.error, 'Invalid Permission Data!');
    }
  };

  onMounted(async () => {
    loadEmployeePermission(readParamsId.params.id.toString());
  });

  watch(
    () => apiResponse.value.Permission,
    (newVal) => {
      selectAllList.value = newVal.every((p) => p.isList);
      selectAllAdd.value = newVal.every((p) => p.isAdd);
      selectAllView.value = newVal.every((p) => p.isView);
      selectAllEdit.value = newVal.every((p) => p.isEdit);
      selectAllDelete.value = newVal.every((p) => p.isDelete);
    },
    { deep: true }
  );
</script>

<template>
  <DefaultLayout>
    <!-- Header Section -->
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-2">
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <UserIcon class="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 class="text-2xl font-bold text-emphasis">Employee Permissions</h2>
          <p class="text-sm text-muted">Configure specific permissions for {{ apiResponse.Employee.name }}</p>
        </div>
      </div>

      <!-- Info Banner -->
      <div class="rounded-lg bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 p-4 mb-4">
        <div class="flex items-start gap-3">
          <DotsHorizontalIcon class="h-5 w-5 text-primary dark:text-primary-light mt-0.5 flex-shrink-0" />
          <div>
            <p class="text-sm font-medium text-primary dark:text-primary-light">Individual Permission Override</p>
            <p class="text-xs text-primary dark:text-primary-light mt-1">These permissions will override the default role permissions for this employee only.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Permissions Table Card -->
    <div class="rounded-lg border border-stroke bg-surface shadow-lg dark:border-strokedark overflow-hidden">
      <!-- Card Header -->
      <div class="border-b border-stroke dark:border-strokedark bg-elevated px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-emphasis">Module Permissions</h3>
            <p class="text-xs text-muted mt-1">Select permissions for each module</p>
          </div>
          <div class="flex items-center gap-2 text-sm text-muted">
            <span class="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">{{ apiResponse.Permission.length }} Modules</span>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-elevated">
              <th class="py-4 px-6 text-left">
                <span class="text-sm font-semibold text-emphasis">Module Name</span>
              </th>
              <th class="py-4 px-4 text-center w-24">
                <div class="flex flex-col items-center gap-2">
                  <BaseCheckbox v-model="selectAllList" @change="toggleAllList" size="sm" />
                  <span class="text-xs font-semibold text-info dark:text-info-light">List</span>
                </div>
              </th>
              <th class="py-4 px-4 text-center w-24">
                <div class="flex flex-col items-center gap-2">
                  <BaseCheckbox v-model="selectAllAdd" @change="toggleAllAdd" size="sm" />
                  <span class="text-xs font-semibold text-success dark:text-success-light">Add</span>
                </div>
              </th>
              <th class="py-4 px-4 text-center w-24">
                <div class="flex flex-col items-center gap-2">
                  <BaseCheckbox v-model="selectAllView" @change="toggleAllView" size="sm" />
                  <span class="text-xs font-semibold text-primary dark:text-primary-light">View</span>
                </div>
              </th>
              <th class="py-4 px-4 text-center w-24">
                <div class="flex flex-col items-center gap-2">
                  <BaseCheckbox v-model="selectAllEdit" @change="toggleAllEdit" size="sm" />
                  <span class="text-xs font-semibold text-warning dark:text-warning-light">Edit</span>
                </div>
              </th>
              <th class="py-4 px-4 text-center w-24">
                <div class="flex flex-col items-center gap-2">
                  <BaseCheckbox v-model="selectAllDelete" @change="toggleAllDelete" size="sm" />
                  <span class="text-xs font-semibold text-danger dark:text-danger-light">Delete</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-strokedark">
            <tr v-for="(perm, index) in apiResponse.Permission" :key="perm.id" class="hover:bg-elevated transition-colors duration-150">
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <span class="text-sm font-bold text-primary">{{ index + 1 }}</span>
                  </div>
                  <span class="text-sm font-medium text-emphasis">{{ perm.name }}</span>
                </div>
              </td>
              <td class="py-4 px-4">
                <div class="flex justify-center">
                  <div class="permission-checkbox permission-list" :class="{ active: apiResponse.Permission[index].isList }">
                    <BaseCheckbox v-model="apiResponse.Permission[index].isList" size="sm" />
                  </div>
                </div>
              </td>
              <td class="py-4 px-4">
                <div class="flex justify-center">
                  <div class="permission-checkbox permission-add" :class="{ active: apiResponse.Permission[index].isAdd }">
                    <BaseCheckbox v-model="apiResponse.Permission[index].isAdd" size="sm" />
                  </div>
                </div>
              </td>
              <td class="py-4 px-4">
                <div class="flex justify-center">
                  <div class="permission-checkbox permission-view" :class="{ active: apiResponse.Permission[index].isView }">
                    <BaseCheckbox v-model="apiResponse.Permission[index].isView" size="sm" />
                  </div>
                </div>
              </td>
              <td class="py-4 px-4">
                <div class="flex justify-center">
                  <div class="permission-checkbox permission-edit" :class="{ active: apiResponse.Permission[index].isEdit }">
                    <BaseCheckbox v-model="apiResponse.Permission[index].isEdit" size="sm" />
                  </div>
                </div>
              </td>
              <td class="py-4 px-4">
                <div class="flex justify-center">
                  <div class="permission-checkbox permission-delete" :class="{ active: apiResponse.Permission[index].isDelete }">
                    <BaseCheckbox v-model="apiResponse.Permission[index].isDelete" size="sm" />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Card Footer -->
      <div class="border-t border-stroke dark:border-strokedark bg-elevated px-6 py-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            These permissions will override role-based permissions for
            <span class="font-semibold text-primary">{{ apiResponse.Employee.name }}</span>
          </p>
          <div class="flex gap-3">
            <BaseButton variant="outline" @click="router.back()" class="min-w-[120px]">Cancel</BaseButton>
            <BaseButton variant="primary" @click="updateEmployeePermissions()" class="min-w-[120px]">
              <DotsVerticalIcon class="w-4 h-4 mr-2" />
              Save Changes
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<style scoped>
  .permission-checkbox {
    @apply p-2 rounded-lg transition-all duration-200;
  }

  .permission-checkbox.permission-list.active {
    background-color: var(--color-permission-list);
  }

  .dark .permission-checkbox.permission-list.active {
    background-color: var(--color-permission-list-dark);
  }

  .permission-checkbox.permission-add.active {
    background-color: var(--color-permission-add);
  }

  .dark .permission-checkbox.permission-add.active {
    background-color: var(--color-permission-add-dark);
  }

  .permission-checkbox.permission-view.active {
    background-color: var(--color-permission-view);
  }

  .dark .permission-checkbox.permission-view.active {
    background-color: var(--color-permission-view-dark);
  }

  .permission-checkbox.permission-edit.active {
    background-color: var(--color-permission-edit);
  }

  .dark .permission-checkbox.permission-edit.active {
    background-color: var(--color-permission-edit-dark);
  }

  .permission-checkbox.permission-delete.active {
    background-color: var(--color-permission-delete);
  }

  .dark .permission-checkbox.permission-delete.active {
    background-color: var(--color-permission-delete-dark);
  }
</style>
