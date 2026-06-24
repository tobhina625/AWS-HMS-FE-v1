<script setup lang="ts">
  import { computed } from 'vue';
  import type { IEmployee } from '@/services/Employee/Employee.interface';
  import StatusBadge from '@/components/UI/StatusBadge.vue';
  import ActionIconButton from '@/components/UI/ActionIconButton.vue';
  import EditPencilIcon from '@/assets/images/SVGs/EditPencilIcon.svg';
  import EyeSimpleIcon from '@/assets/images/SVGs/EyeSimpleIcon.svg';
  import MapPinLocationIcon from '@/assets/images/SVGs/MapPinLocationIcon.svg';
  import BuildingWardVariantIcon from '@/assets/images/SVGs/BuildingWardVariantIcon.svg';
  import EmailIcon from '@/assets/images/SVGs/EmailIcon.svg';
  import PhoneIcon from '@/assets/images/SVGs/PhoneIcon.svg';
  import DeleteIcon from '@/assets/images/SVGs/Delete.svg';

  const props = defineProps<{
    employee: IEmployee;
    showDelete?: boolean;
  }>();

  const emit = defineEmits<{
    edit: [employee: IEmployee];
    viewDetails: [employee: IEmployee];
    delete: [employee: IEmployee];
  }>();

  const dutyStatusColor = computed(() => {
    return props.employee.isOnDuty ? 'text-success' : 'text-muted';
  });

  const displaySpecialization = computed(() => {
    const spec = props.employee.specialization?.trim();
    if (spec && spec.toLowerCase() !== 'general') return spec;
    const designation = props.employee.designations?.[0]?.name;
    return designation || spec || 'No specialization';
  });
</script>

<template>
  <div class="bg-surface rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-stroke dark:border-strokedark p-6">
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <h3 class="text-lg font-semibold text-emphasis">{{ employee.name }}</h3>
          <StatusBadge :status="employee.status" />
        </div>
        <p class="text-sm text-bodydark dark:text-bodydark1">
          {{ displaySpecialization }}
        </p>
        <p v-if="employee.specializationType" class="text-xs text-bodydark dark:text-bodydark1 mt-1">Type: {{ employee.specializationType.replace(/([A-Z])/g, ' $1').trim() }}</p>
      </div>
      <div class="flex">
        <ActionIconButton variant="secondary" title="View Details" @click="emit('viewDetails', employee)">
          <EyeSimpleIcon class="w-5 h-5" />
        </ActionIconButton>
        <ActionIconButton variant="primary" title="Edit Employee" @click="emit('edit', employee)">
          <EditPencilIcon class="w-5 h-5" />
        </ActionIconButton>
        <ActionIconButton v-if="showDelete" variant="danger" title="Delete Employee" @click="emit('delete', employee)">
          <DeleteIcon class="w-5 h-5" />
        </ActionIconButton>
      </div>
    </div>

    <div class="space-y-3 mb-4">
      <div class="flex items-center gap-2 text-sm">
        <EmailIcon class="w-4 h-4 text-bodydark" />
        <span class="text-bodydark dark:text-bodydark1">{{ employee.email }}</span>
      </div>

      <div class="flex items-center gap-2 text-sm">
        <PhoneIcon class="w-4 h-4 text-bodydark" />
        <span class="text-bodydark dark:text-bodydark1">{{ employee.phoneNumber }}</span>
      </div>

      <div v-if="employee.officeLocation" class="flex items-center gap-2 text-sm">
        <BuildingWardVariantIcon class="w-4 h-4 text-bodydark" />
        <span class="text-bodydark dark:text-bodydark1">{{ employee.officeLocation }}</span>
      </div>

      <div v-if="employee.department" class="flex items-center gap-2 text-sm">
        <MapPinLocationIcon class="w-4 h-4 text-bodydark" />
        <span class="text-bodydark dark:text-bodydark1">{{ employee.department.name }}</span>
      </div>
    </div>

    <div class="border-t border-stroke dark:border-strokedark pt-4">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium text-bodydark dark:text-bodydark1">Certifications</span>
        <span class="text-sm font-semibold text-primary">{{ employee.certificationCount || 0 }}/3</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <span v-if="employee.hasMedicalLicense" class="px-2 py-1 bg-primary-light text-primary text-xs rounded-full">Medical License</span>
        <span v-if="employee.hasSurgicalCertification" class="px-2 py-1 bg-secondary-light text-secondary text-xs rounded-full">Surgical Cert.</span>
        <span v-if="employee.hasSpecializedTraining" class="px-2 py-1 bg-success-light text-success text-xs rounded-full">Specialized</span>
        <span v-if="!employee.hasMedicalLicense && !employee.hasSurgicalCertification && !employee.hasSpecializedTraining" class="text-xs text-bodydark dark:text-bodydark1">No certifications</span>
      </div>
    </div>

    <div v-if="employee.isOnDuty || employee.yearsOfService" class="border-t border-stroke dark:border-strokedark pt-4 mt-4 flex items-center justify-between">
      <div v-if="employee.isOnDuty" class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
        <span :class="['text-sm font-medium', dutyStatusColor]">On Duty</span>
      </div>
      <div v-if="employee.yearsOfService" class="text-sm text-bodydark dark:text-bodydark1">{{ employee.yearsOfService }} {{ employee.yearsOfService === 1 ? 'year' : 'years' }} of service</div>
    </div>
  </div>
</template>
