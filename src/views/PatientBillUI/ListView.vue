<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import router from '@/router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import ListViewTemplate from '@/components/Templates/ListViewTemplate.vue';
  import SearchBar from '@/components/UI/SearchBar.vue';
  import DynamicTable from '@/components/UI/DynamicTable.vue';
  import DynamicPagination from '@/components/UI/DynamicPagination.vue';
  import PatientBillsServices from '@/services/PatientBill/Patientbill.services';
  import EnumService from '@/services/Enum/Enum.service';
  import { usePermissions } from '@/composables/usePermissions';
  import useAlert from '@/plugins/alert/useAlert';
  import { useConfirm } from '@/composables/useConfirm';

  const { showAlert } = useAlert();
  const { confirm } = useConfirm();
  const { canDeleteFromModule } = usePermissions();
  const pageTitle = ref('Billing Management');
  const canDelete = computed(() => canDeleteFromModule('Patient Bills'));
  const PatientBillService = new PatientBillsServices();
  const enumService = new EnumService();
  const loading = ref(false);

  const listFilters = ref({
    page: 0,
    size: 10,
    searchTerm: '',
  });

  const apiResponse = ref({
    data: [],
    totalElements: 0,
    totalPages: 0,
    startIndex: 0,
    itemsPerPage: 0,
  });

  const billTypeMap = ref<Record<number, string>>({});

  const fetchBillTypes = async () => {
    try {
      const response = await enumService.getBillTypes();
      const billTypeList = response?.data?.billType;
      if (billTypeList && Array.isArray(billTypeList)) {
        const map: Record<number, string> = {};
        billTypeList.forEach((item) => {
          const key = Object.keys(item)[0];
          const enumItem = item[key];
          if (enumItem?.id !== undefined && enumItem?.name) {
            map[enumItem.id] = enumItem.name;
          }
        });
        billTypeMap.value = map;
      }
    } catch (error) {
      console.error('Error fetching bill types:', error);
    }
  };

  const getSearchTerm = async (query: string) => {
    listFilters.value.searchTerm = query;
    listFilters.value.page = 0;
    await fetchPatientBills();
  };

  const fetchPatientBills = async () => {
    loading.value = true;
    try {
      let filters = '';
      Object.entries(listFilters.value).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          filters = filters != '' ? `${filters}&${key}=${value}` : `${key}=${value}`;
        }
      });

      const response = await PatientBillService.getPatientBills(filters);
      const rawData = response.content || [];

      apiResponse.value.data = rawData.map((item: any) => ({
        ...item,
        patientName: item.patient?.name || 'N/A',
        patientCnic: item.patient?.cnic || 'N/A',
        billType: billTypeMap.value[item.billType] ?? `Type ${item.billType}`,
        isPaid: item.isPaid ? 'Yes' : 'No',
      }));
      apiResponse.value.itemsPerPage = response.size;
      apiResponse.value.totalPages = response.totalPages;
      apiResponse.value.startIndex = response.page;
      apiResponse.value.totalElements = response.totalElements;
    } finally {
      loading.value = false;
    }
  };

  const handlePageChange = async (newPage: number) => {
    listFilters.value.page = newPage;
    await fetchPatientBills();
  };

  const handlePageSizeChange = async (newSize: number) => {
    listFilters.value.size = newSize;
    listFilters.value.page = 0;
    await fetchPatientBills();
  };

  const handleDelete = async (item: any) => {
    if (!canDelete.value) {
      showAlert('error', 'You do not have permission to delete patient bills.', 'Permission Denied');
      return;
    }

    const confirmed = await confirm({
      title: 'Delete Patient Bill',
      message: `Are you sure you want to delete this bill? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (confirmed) {
      try {
        const response = await PatientBillService.deletePatientBill(item.id);
        if (response?.isSuccess !== false) {
          showAlert('success', 'Patient bill has been deleted successfully.', 'Success');
          await fetchPatientBills();
        } else {
          showAlert('error', response?.error || 'Failed to delete patient bill.', 'Error');
        }
      } catch {
        showAlert('error', 'An error occurred while deleting the patient bill.', 'Error');
      }
    }
  };

  onMounted(async () => {
    await fetchBillTypes();
    await fetchPatientBills();
  });
</script>

<template>
  <DefaultLayout>
    <ListViewTemplate :title="pageTitle" breadcrumb-title="Billing" :loading="loading">
      <template #subtitle>Monitor patient invoices, payments, and outstanding balances.</template>

      <template #search>
        <SearchBar placeholder="Search bills by patient or ID..." add-button-route="patient-bills/add" @searchTerm="getSearchTerm" />
      </template>

      <template #table>
        <DynamicTable :data="apiResponse.data" showEdit :showDelete="canDelete" @edit="(item) => router.push(`/patient-bills/edit/${item.id}`)" @delete="handleDelete" />
      </template>

      <template #pagination>
        <DynamicPagination
          :currentPage="listFilters.page"
          :totalPages="apiResponse.totalPages"
          :totalElements="apiResponse.totalElements"
          :itemsPerPage="apiResponse.itemsPerPage"
          :startIndex="apiResponse.startIndex"
          @change-page="handlePageChange"
          @change-page-size="handlePageSizeChange"
        />
      </template>
    </ListViewTemplate>
  </DefaultLayout>
</template>
