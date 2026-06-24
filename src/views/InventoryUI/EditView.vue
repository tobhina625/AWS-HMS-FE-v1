<script setup lang="ts">
  import ChevronLeftIcon from '@/assets/images/SVGs/ChevronLeftIcon.svg';
  import ChevronRightIcon from '@/assets/images/SVGs/ChevronRightIcon.svg';

  import { ref, reactive, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import { inventoryService } from '@/services/Inventory/Inventory.services';
  import DepartmentsServices from '@/services/Department/Department.services';
  import type { IUpdateInventory } from '@/services/Inventory/Inventory.interface';

  const departmentService = new DepartmentsServices();
  import { useFormValidation } from '@/composables/useFormValidation';
  import FormStepper from '@/components/UI/FormStepper.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BaseTextarea from '@/components/Base/BaseTextarea.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseCheckbox from '@/components/Base/BaseCheckbox.vue';
  import { useToast } from 'vue-toastification';
  import { STATUS_OPTIONS } from '@/constants/statusOptions';

  const router = useRouter();
  const route = useRoute();
  const toast = useToast();
  const currentStep = ref(1);
  const loading = ref(false);
  const loadingData = ref(true);

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Item details' },
    { id: 2, title: 'Stock & Pricing', description: 'Inventory levels' },
    { id: 3, title: 'Additional Details', description: 'Supplier & expiry' },
  ];

  const formData = reactive<IUpdateInventory>({
    id: 0,
    name: '',
    description: '',
    sku: '',
    barcode: '',
    quantity: 0,
    minimumStockLevel: 10,
    reorderLevel: 20,
    maximumStockLevel: 1000,
    cost: 0,
    price: 0,
    itemType: 'Medical',
    category: 'Medicine',
    status: 'Available',
    location: '',
    storageConditions: '',
    manufacturer: '',
    supplierName: '',
    supplierContact: '',
    manufactureDate: '',
    expiryDate: '',
    batchNumber: '',
    requiresPrescription: false,
    isTemperatureControlled: false,
    isHazardous: false,
    notes: '',
    departmentId: undefined,
  });

  const departments = ref<any[]>([]);
  const { errors, clearError } = useFormValidation();

  const itemTypes = [
    { value: 'Surgical', label: 'Surgical' },
    { value: 'Medical', label: 'Medical' },
    { value: 'Furniture', label: 'Furniture' },
    { value: 'Other', label: 'Other' },
  ];

  const categories = [
    { value: 'Medicine', label: 'Medicine' },
    { value: 'Equipment', label: 'Equipment' },
    { value: 'Surgical', label: 'Surgical' },
    { value: 'Laboratory', label: 'Laboratory' },
    { value: 'Consumables', label: 'Consumables' },
    { value: 'Furniture', label: 'Furniture' },
    { value: 'PPE', label: 'PPE (Personal Protective Equipment)' },
    { value: 'Other', label: 'Other' },
  ];

  const statuses = STATUS_OPTIONS.INVENTORY;

  onMounted(async () => {
    await loadDepartments();
    await loadInventoryItem();
  });

  const loadDepartments = async () => {
    try {
      const response = await departmentService.getDepartments('page=0&size=100');
      if (response.data) {
        departments.value = response.data.map((dept: any) => ({
          value: dept.id,
          label: dept.name,
        }));
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadInventoryItem = async () => {
    try {
      loadingData.value = true;
      const id = Number(route.params.id);
      const response = await inventoryService.getInventoryById(id);

      if (response.data) {
        const item = response.data;
        formData.id = item.id;
        formData.name = item.name || '';
        formData.description = item.description || '';
        formData.sku = item.sku || '';
        formData.barcode = item.barcode || '';
        formData.quantity = item.quantity || 0;
        formData.minimumStockLevel = item.minimumStockLevel || 10;
        formData.reorderLevel = item.reorderLevel || 20;
        formData.maximumStockLevel = item.maximumStockLevel || 1000;
        formData.cost = item.cost || 0;
        formData.price = item.price || 0;
        formData.itemType = item.itemType || 'Medical';
        formData.category = item.category || 'Medicine';
        formData.status = item.status || 'Available';
        formData.location = item.location || '';
        formData.storageConditions = item.storageConditions || '';
        formData.manufacturer = item.manufacturer || '';
        formData.supplierName = item.supplierName || '';
        formData.supplierContact = item.supplierContact || '';
        formData.manufactureDate = item.manufactureDate ? item.manufactureDate.split('T')[0] : '';
        formData.expiryDate = item.expiryDate ? item.expiryDate.split('T')[0] : '';
        formData.batchNumber = item.batchNumber || '';
        formData.requiresPrescription = item.requiresPrescription || false;
        formData.isTemperatureControlled = item.isTemperatureControlled || false;
        formData.isHazardous = item.isHazardous || false;
        formData.notes = item.notes || '';
        formData.departmentId = item.department?.id;
      }
    } catch {
      toast.error('Failed to load inventory item');
      router.push({ name: 'InventoryList' });
    } finally {
      loadingData.value = false;
    }
  };

  const validateStep = (step: number): boolean => {
    errors.value = {};

    if (step === 1) {
      if (!formData.name) {
        errors.value.name = 'Item name is required';
      }
      if (!formData.category) {
        errors.value.category = 'Category is required';
      }
      if (!formData.itemType) {
        errors.value.itemType = 'Item type is required';
      }
    } else if (step === 2) {
      if (formData.quantity < 0) {
        errors.value.quantity = 'Quantity cannot be negative';
      }
      if (formData.cost < 0) {
        errors.value.cost = 'Cost cannot be negative';
      }
      if (formData.price < 0) {
        errors.value.price = 'Price cannot be negative';
      }
      if (formData.minimumStockLevel < 0) {
        errors.value.minimumStockLevel = 'Minimum stock level cannot be negative';
      }
      if (formData.reorderLevel < formData.minimumStockLevel) {
        errors.value.reorderLevel = 'Reorder level must be greater than minimum stock level';
      }
      if (formData.maximumStockLevel < formData.reorderLevel) {
        errors.value.maximumStockLevel = 'Maximum stock level must be greater than reorder level';
      }
    }

    return Object.keys(errors.value).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep.value)) {
      if (currentStep.value < steps.length) {
        currentStep.value++;
      }
    }
  };

  const previousStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep.value)) {
      return;
    }

    try {
      loading.value = true;
      const { departmentId, ...rest } = formData;
      const payload = {
        ...rest,
        department: departmentId ? { id: Number(departmentId) } : undefined,
      };
      await inventoryService.updateInventory(payload);
      toast.success('Inventory item updated successfully!');
      router.push({ name: 'InventoryList' });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update inventory item');
    } finally {
      loading.value = false;
    }
  };

  const handleCancel = () => {
    router.push({ name: 'InventoryList' });
  };
</script>

<template>
  <DefaultLayout>
    <div class="mx-auto max-w-5xl">
      <div class="mb-6">
        <h2 class="text-title-md2 font-semibold text-emphasis">Edit Inventory Item</h2>
      </div>

      <div v-if="loadingData" class="flex justify-center items-center py-20">
        <div class="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>

      <div v-else class="rounded-sm border border-stroke bg-surface shadow-default dark:border-strokedark">
        <div class="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <FormStepper :steps="steps" :currentStep="currentStep" @update:currentStep="currentStep = $event" />
        </div>

        <form @submit.prevent="handleSubmit" class="p-6.5">
          <!-- Step 1: Basic Information -->
          <div v-show="currentStep === 1" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <BaseInput v-model="formData.name" label="Item Name" placeholder="Enter item name" :error="errors.name" @update:modelValue="clearError('name')" required />

              <BaseSelect v-model="formData.category" label="Category" :options="categories" :error="errors.category" @update:modelValue="clearError('category')" required />
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <BaseSelect v-model="formData.itemType" label="Item Type" :options="itemTypes" :error="errors.itemType" @update:modelValue="clearError('itemType')" required />

              <BaseSelect v-model="formData.status" label="Status" :options="statuses" />
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <BaseInput v-model="formData.sku" label="SKU" placeholder="Stock Keeping Unit" />

              <BaseInput v-model="formData.barcode" label="Barcode" placeholder="Barcode number" />
            </div>

            <BaseTextarea v-model="formData.description" label="Description" placeholder="Enter item description" rows="3" />
          </div>

          <!-- Step 2: Stock & Pricing -->
          <div v-show="currentStep === 2" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <BaseInput v-model.number="formData.quantity" type="number" label="Current Quantity" placeholder="0" :error="errors.quantity" @update:modelValue="clearError('quantity')" />

              <BaseInput
                v-model.number="formData.minimumStockLevel"
                type="number"
                label="Minimum Stock Level"
                placeholder="10"
                :error="errors.minimumStockLevel"
                @update:modelValue="clearError('minimumStockLevel')"
              />
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <BaseInput v-model.number="formData.reorderLevel" type="number" label="Reorder Level" placeholder="20" :error="errors.reorderLevel" @update:modelValue="clearError('reorderLevel')" />

              <BaseInput
                v-model.number="formData.maximumStockLevel"
                type="number"
                label="Maximum Stock Level"
                placeholder="1000"
                :error="errors.maximumStockLevel"
                @update:modelValue="clearError('maximumStockLevel')"
              />
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <BaseInput v-model.number="formData.cost" type="number" label="Cost per Unit" placeholder="0.00" :error="errors.cost" @update:modelValue="clearError('cost')" />

              <BaseInput v-model.number="formData.price" type="number" label="Price per Unit" placeholder="0.00" :error="errors.price" @update:modelValue="clearError('price')" />
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <BaseInput v-model="formData.location" label="Storage Location" placeholder="e.g., Warehouse A, Shelf 3" />

              <BaseSelect v-model.number="formData.departmentId" label="Department" :options="departments" placeholder="Select department (optional)" />
            </div>
          </div>

          <!-- Step 3: Additional Details -->
          <div v-show="currentStep === 3" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <BaseInput v-model="formData.manufacturer" label="Manufacturer" placeholder="Manufacturer name" />

              <BaseInput v-model="formData.batchNumber" label="Batch Number" placeholder="Batch/Lot number" />
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <BaseInput v-model="formData.supplierName" label="Supplier Name" placeholder="Supplier name" />

              <BaseInput v-model="formData.supplierContact" label="Supplier Contact" placeholder="Phone or email" />
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <BaseInput v-model="formData.manufactureDate" type="date" label="Manufacture Date" />

              <BaseInput v-model="formData.expiryDate" type="date" label="Expiry Date" />
            </div>

            <BaseInput v-model="formData.storageConditions" label="Storage Conditions" placeholder="e.g., Store in cool, dry place" />

            <div class="space-y-3">
              <BaseCheckbox label="Requires Prescription" v-model="formData.requiresPrescription" />
              <BaseCheckbox label="Temperature Controlled" v-model="formData.isTemperatureControlled" />
              <BaseCheckbox label="Hazardous Material" v-model="formData.isHazardous" />
            </div>

            <BaseTextarea v-model="formData.notes" label="Notes" placeholder="Additional notes or comments" rows="3" />
          </div>

          <!-- Navigation Buttons -->
          <div class="mt-6 flex justify-between gap-4">
            <BaseButton v-if="currentStep > 1" variant="outline" @click="previousStep">
              <ChevronLeftIcon class="w-4 h-4" />
              Previous
            </BaseButton>

            <div class="ml-auto flex gap-4">
              <BaseButton variant="outline" @click="handleCancel">Cancel</BaseButton>

              <BaseButton v-if="currentStep < steps.length" variant="primary" @click="nextStep">
                Next
                <ChevronRightIcon class="w-4 h-4" />
              </BaseButton>

              <BaseButton v-else type="submit" variant="primary" :loading="loading" :disabled="loading">Update Item</BaseButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  </DefaultLayout>
</template>
