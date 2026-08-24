<script setup lang="ts">
  import { computed, ref } from 'vue';
  import BaseButton from '@/components/Base/BaseButton.vue';

  const props = defineProps<{
    show: boolean;
    admission: any;
    bills: any[];
    targetStatusName: string;
    downloadingPdf?: boolean;
    payingNow?: boolean;
    dischargingNow?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'cancel'): void;
    (e: 'payNow', bill?: any): void;
    (e: 'downloadInvoice'): void;
    (e: 'confirmDischarge'): void;
  }>();

  const unpaidBills = computed(() => props.bills.filter((b) => !b.isPaid));
  const hasUnpaid = computed(() => unpaidBills.value.length > 0);
  const totalCharges = computed(() => props.bills.reduce((s, b) => s + (b.totalAmount || 0), 0));
  const totalPaid = computed(() => props.bills.reduce((s, b) => s + (b.isPaid ? b.totalAmount : b.paidAmount || 0), 0));
  const outstandingBalance = computed(() => Math.max(0, totalCharges.value - totalPaid.value));

  const fmtCur = (v: number) => v.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

  const patientName = computed(() => {
    if (!props.admission?.patient) return 'N/A';
    return `${props.admission.patient.firstName || ''} ${props.admission.patient.lastName || ''}`.trim();
  });

  const showDownloadTip = ref(false);
  const showPayTip = ref(false);

  const handlePayBill = (bill?: any) => {
    const target = bill || unpaidBills.value[0];
    emit('payNow', target);
  };
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="fixed inset-0 z-[99999] flex items-center justify-center p-4" style="background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px)" @click.self="emit('cancel')">
        <div class="w-full max-w-xl bg-white dark:bg-boxdark rounded-2xl shadow-2xl border border-stroke dark:border-strokedark overflow-hidden" role="dialog" aria-modal="true">
          <!-- Header -->
          <div class="px-6 py-5 border-b border-stroke dark:border-strokedark flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-bold text-emphasis leading-tight">Confirm {{ targetStatusName }}</h2>
              <p class="text-sm text-bodydark dark:text-bodydark1 mt-0.5">Admission #{{ admission?.id }} &mdash; {{ patientName }}</p>
            </div>
            <button class="text-bodydark hover:text-danger transition-colors p-1 rounded-lg hover:bg-danger/10 flex-shrink-0" aria-label="Close" @click="emit('cancel')">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Alert Banner -->
          <div class="px-6 pt-5">
            <!-- Unpaid Bills -->
            <div v-if="hasUnpaid" class="rounded-xl border border-warning/40 bg-warning/10 p-4 flex gap-3 items-start">
              <svg class="w-5 h-5 text-warning flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-warning">Unpaid Invoices Detected</p>
                <p class="text-xs text-warning/80 mt-0.5">{{ unpaidBills.length }} unpaid bill{{ unpaidBills.length !== 1 ? 's' : '' }} found with outstanding balance.</p>
                <div class="mt-3 space-y-1.5">
                  <div v-for="bill in unpaidBills" :key="bill.id" class="flex items-center justify-between text-xs bg-white/70 dark:bg-boxdark/70 rounded-lg px-3 py-2 border border-warning/20">
                    <div class="truncate max-w-[50%]">
                      <span class="text-emphasis font-bold">#{{ bill.id }} &mdash;</span>
                      <span class="text-emphasis font-medium">
                        {{
                          String(bill.reason || '')
                            .split('|')[0]
                            .trim() || 'Charge'
                        }}
                      </span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-danger flex-shrink-0">${{ (bill.remainingBalance ?? bill.totalAmount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
                      <button type="button" class="px-2 py-1 bg-warning/20 hover:bg-warning hover:text-white text-warning font-bold rounded text-[11px] transition-colors" @click="handlePayBill(bill)">
                        Pay
                      </button>
                    </div>
                  </div>
                </div>
                <div class="mt-3 flex items-center justify-between border-t border-warning/30 pt-2">
                  <span class="text-xs font-semibold text-warning">Total Outstanding:</span>
                  <span class="text-sm font-black text-warning">{{ fmtCur(outstandingBalance) }}</span>
                </div>
              </div>
            </div>

            <!-- All Paid -->
            <div v-else class="rounded-xl border border-success/40 bg-success/10 p-4 flex gap-3 items-start">
              <svg class="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              <div>
                <p class="text-sm font-bold text-success">All Bills Settled &mdash; Ready to Discharge</p>
                <p class="text-xs text-success/80 mt-0.5">Total charges of {{ fmtCur(totalCharges) }} have been fully paid.</p>
                <div class="mt-2 flex items-center gap-4 text-xs">
                  <span class="text-success/70">Bills: {{ bills.length }}</span>
                  <span class="text-success/70">Paid: {{ fmtCur(totalPaid) }}</span>
                  <span class="text-success font-semibold">Balance: $0.00</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="px-6 py-5 flex flex-col gap-3">
            <!-- Row 1: Download Invoice + Pay Now -->
            <div class="flex gap-3">
              <!-- Download Invoice -->
              <div class="relative flex-1" @mouseenter="showDownloadTip = hasUnpaid" @mouseleave="showDownloadTip = false">
                <button
                  :disabled="hasUnpaid || downloadingPdf"
                  :class="[
                    'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-2',
                    hasUnpaid
                      ? 'border-stroke dark:border-strokedark text-bodydark dark:text-bodydark1 cursor-not-allowed opacity-50'
                      : 'border-primary text-primary hover:bg-primary hover:text-white active:scale-95',
                  ]"
                  @click="!hasUnpaid && !downloadingPdf && emit('downloadInvoice')"
                >
                  <svg v-if="downloadingPdf" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {{ downloadingPdf ? 'Generating...' : 'Download Invoice (PDF)' }}
                </button>
                <Transition name="fade-tip">
                  <div
                    v-if="showDownloadTip"
                    class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap z-10 pointer-events-none shadow-lg"
                  >
                    Clear all unpaid bills first
                    <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                  </div>
                </Transition>
              </div>

              <!-- Pay Now -->
              <div class="relative flex-1" @mouseenter="showPayTip = !hasUnpaid" @mouseleave="showPayTip = false">
                <button
                  :disabled="!hasUnpaid || payingNow"
                  :class="[
                    'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all',
                    !hasUnpaid
                      ? 'bg-bodydark/10 dark:bg-strokedark text-bodydark dark:text-bodydark1 cursor-not-allowed opacity-50'
                      : 'bg-warning text-white hover:bg-warning/90 active:scale-95 shadow-md shadow-warning/30',
                    payingNow ? 'opacity-70 cursor-wait' : '',
                  ]"
                  @click="hasUnpaid && !payingNow && handlePayBill()"
                >
                  <svg v-if="payingNow" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  {{ payingNow ? 'Processing...' : 'Pay Now' }}
                </button>
                <Transition name="fade-tip">
                  <div
                    v-if="showPayTip"
                    class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap z-10 pointer-events-none shadow-lg"
                  >
                    All bills are already paid
                    <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                  </div>
                </Transition>
              </div>
            </div>

            <!-- Row 2: Cancel + Discharge -->
            <div class="flex gap-3">
              <BaseButton variant="outline" size="md" class="flex-1 border-2" @click="emit('cancel')">Cancel</BaseButton>
              <button
                :disabled="dischargingNow"
                :class="[
                  'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all',
                  hasUnpaid ? 'bg-danger text-white hover:bg-danger/90 shadow-md shadow-danger/30' : 'bg-success text-white hover:bg-success/90 shadow-md shadow-success/30',
                  dischargingNow ? 'opacity-70 cursor-wait' : 'active:scale-95',
                ]"
                @click="!dischargingNow && emit('confirmDischarge')"
              >
                <svg v-if="dischargingNow" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {{ dischargingNow ? 'Processing...' : `Confirm ${targetStatusName}` }}
              </button>
            </div>

            <p v-if="hasUnpaid" class="text-xs text-bodydark dark:text-bodydark1 text-center">⚠ You may still confirm discharge with outstanding balance. The amount will remain due.</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
  }

  .fade-tip-enter-active,
  .fade-tip-leave-active {
    transition: opacity 0.15s ease;
  }
  .fade-tip-enter-from,
  .fade-tip-leave-to {
    opacity: 0;
  }
</style>
