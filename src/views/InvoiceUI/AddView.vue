<script setup lang="ts">
  import { ref } from 'vue';
  import router from '@/router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import useAlert from '@/plugins/alert/useAlert';
  import InvoiceService from '@/services/Invoice/Invoice.services';
  import { InvoiceLineTypeMap } from '@/services/Invoice/Invoice.dto';

  const { showAlert } = useAlert();
  const invoiceService = new InvoiceService();
  const loading = ref(false);
  const pageTitle = ref('Create Invoice');

  const form = ref({
    patientId: 0,
    notes: '',
    lines: [{ lineType: 0, description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
  });

  const addLine = () => {
    form.value.lines.push({ lineType: 0, description: '', quantity: 1, unitPrice: 0, totalPrice: 0 });
  };

  const removeLine = (index: number) => {
    if (form.value.lines.length > 1) {
      form.value.lines.splice(index, 1);
    }
  };

  const updateTotal = (index: number) => {
    const line = form.value.lines[index];
    line.totalPrice = line.quantity * line.unitPrice;
  };

  const getTotalAmount = () => {
    return form.value.lines.reduce((sum, line) => sum + line.totalPrice, 0);
  };

  const handleSubmit = async () => {
    if (!form.value.patientId) {
      showAlert('error', 'Please select a patient.', 'Validation Error');
      return;
    }
    if (form.value.lines.length === 0 || form.value.lines.every((l) => !l.description)) {
      showAlert('error', 'Please add at least one invoice line with a description.', 'Validation Error');
      return;
    }
    loading.value = true;
    try {
      const response = await invoiceService.createInvoice({
        patientId: form.value.patientId,
        notes: form.value.notes || null,
        invoiceLines: form.value.lines.map((l) => ({
          lineType: l.lineType,
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          totalPrice: l.totalPrice,
        })),
      });
      if (response?.isSuccess !== false) {
        showAlert('success', 'Invoice created successfully.', 'Success');
        router.push('/invoices');
      } else {
        showAlert('error', response?.error || 'Failed to create invoice.', 'Error');
      }
    } catch {
      showAlert('error', 'An error occurred while creating the invoice.', 'Error');
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <DefaultLayout>
    <div class="p-6 max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-emphasis">{{ pageTitle }}</h1>
          <p class="text-sm text-bodydark">Create a new invoice with line items.</p>
        </div>
        <BaseButton variant="outline" @click="router.push('/invoices')">Back to Invoices</BaseButton>
      </div>

      <div class="bg-surface border border-stroke dark:border-strokedark rounded-2xl p-6 shadow-default space-y-6">
        <div>
          <label class="block text-sm font-medium text-bodydark mb-1">Patient ID *</label>
          <input
            v-model.number="form.patientId"
            type="number"
            min="1"
            class="w-full rounded-lg border border-stroke dark:border-strokedark bg-transparent p-2.5 text-emphasis outline-none focus:border-primary"
            placeholder="Enter patient ID"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-bodydark mb-1">Notes</label>
          <textarea
            v-model="form.notes"
            rows="2"
            class="w-full rounded-lg border border-stroke dark:border-strokedark bg-transparent p-2.5 text-emphasis outline-none focus:border-primary"
            placeholder="Optional notes"
          ></textarea>
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-emphasis">Invoice Lines</h3>
            <BaseButton variant="outline" @click="addLine">+ Add Line</BaseButton>
          </div>

          <div v-for="(line, index) in form.lines" :key="index" class="border border-stroke dark:border-strokedark rounded-xl p-4 space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm font-bold text-emphasis">Line {{ index + 1 }}</span>
              <button v-if="form.lines.length > 1" @click="removeLine(index)" class="text-danger text-sm hover:underline">Remove</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-bodydark mb-1">Type</label>
                <select v-model.number="line.lineType" class="w-full rounded-lg border border-stroke dark:border-strokedark bg-transparent p-2 text-emphasis outline-none focus:border-primary text-sm">
                  <option v-for="(label, key) in InvoiceLineTypeMap" :key="key" :value="Number(key)">{{ label }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-bodydark mb-1">Description *</label>
                <input
                  v-model="line.description"
                  type="text"
                  class="w-full rounded-lg border border-stroke dark:border-strokedark bg-transparent p-2 text-emphasis outline-none focus:border-primary text-sm"
                  placeholder="Item description"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-bodydark mb-1">Quantity</label>
                <input
                  v-model.number="line.quantity"
                  type="number"
                  min="1"
                  @input="updateTotal(index)"
                  class="w-full rounded-lg border border-stroke dark:border-strokedark bg-transparent p-2 text-emphasis outline-none focus:border-primary text-sm"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-bodydark mb-1">Unit Price</label>
                <input
                  v-model.number="line.unitPrice"
                  type="number"
                  min="0"
                  @input="updateTotal(index)"
                  class="w-full rounded-lg border border-stroke dark:border-strokedark bg-transparent p-2 text-emphasis outline-none focus:border-primary text-sm"
                />
              </div>
            </div>
            <div class="text-right text-sm font-bold text-emphasis">Total: {{ line.totalPrice }}</div>
          </div>

          <div class="text-right text-xl font-black text-emphasis border-t border-stroke dark:border-strokedark pt-4">Grand Total: {{ getTotalAmount() }}</div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-stroke dark:border-strokedark">
          <BaseButton variant="outline" @click="router.push('/invoices')">Cancel</BaseButton>
          <BaseButton variant="primary" :disabled="loading" @click="handleSubmit">
            {{ loading ? 'Creating...' : 'Create Invoice' }}
          </BaseButton>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
