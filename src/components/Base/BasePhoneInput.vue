<script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue';
  import CountryList from 'country-list-with-dial-code-and-flag';

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      label?: string;
      placeholder?: string;
      error?: boolean;
      errorMessage?: string;
      fieldRequired?: boolean;
      disabled?: boolean;
    }>(),
    {
      label: 'Phone #',
      placeholder: 'Enter phone number',
    }
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', val: string): void;
    (e: 'change', val: string): void;
  }>();

  // ─── State ────────────────────────────────────────────────────────────────
  const countries = ref<{ name: string; dial_code: string; flag: string }[]>([]);
  const dialCode = ref('');
  const number = ref('');
  const isDropdownOpen = ref(false);
  const searchQuery = ref('');
  const dropdownRef = ref<HTMLElement | null>(null);

  // Keep number in sync if parent passes a pre-filled value (e.g. edit forms)
  onMounted(() => {
    const raw = CountryList.getAll().map((c: any) => c.data);
    countries.value = raw;

    if (props.modelValue) {
      // Try to split a stored value like "+92 3001234567"
      const match = props.modelValue.match(/^(\+\d+)\s?(.*)$/);
      if (match) {
        dialCode.value = match[1];
        number.value = match[2];
      }
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', handleClickOutside);
  });

  const handleClickOutside = (e: MouseEvent) => {
    if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
      isDropdownOpen.value = false;
      searchQuery.value = '';
    }
  };

  // Clean up event listener
  onMounted(() => {
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });

  const filteredCountries = computed(() => {
    if (!searchQuery.value) return countries.value;

    const query = searchQuery.value.toLowerCase();
    return countries.value.filter((c) => c.name.toLowerCase().includes(query) || c.dial_code.includes(query));
  });

  const selectedCountry = computed(() => {
    return countries.value.find((c) => c.dial_code === dialCode.value);
  });

  const fullNumber = computed(() => (dialCode.value ? `${dialCode.value} ${number.value}`.trim() : number.value));

  const emitUpdate = () => {
    emit('update:modelValue', fullNumber.value);
    emit('change', fullNumber.value);
  };

  const toggleDropdown = () => {
    if (!props.disabled) {
      isDropdownOpen.value = !isDropdownOpen.value;
      if (!isDropdownOpen.value) {
        searchQuery.value = '';
      }
    }
  };

  const selectCountry = (country: { name: string; dial_code: string; flag: string }) => {
    dialCode.value = country.dial_code;
    isDropdownOpen.value = false;
    searchQuery.value = '';
    emitUpdate();
  };

  const onNumberKeydown = (e: KeyboardEvent) => {
    const allowed = /^[0-9]$/;
    if (!allowed.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete') {
      e.preventDefault();
    }
  };

  const onNumberInput = () => {
    number.value = number.value.replace(/\D/g, '').slice(0, 10);
    emitUpdate();
  };

  // Reset search when dropdown closes
  watch(isDropdownOpen, (isOpen) => {
    if (!isOpen) {
      searchQuery.value = '';
    }
  });
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label class="block text-sm font-medium text-emphasis">
      {{ label }}
      <span v-if="fieldRequired" class="text-meta-1 ml-0.5">*</span>
    </label>

    <div class="flex gap-2">
      <!-- Country code selector with custom dropdown -->
      <div ref="dropdownRef" class="relative w-36 shrink-0">
        <button
          type="button"
          @click="toggleDropdown"
          :disabled="disabled"
          class="w-full rounded-lg border bg-transparent py-3 px-3 text-sm font-medium outline-none transition cursor-pointer dark:bg-form-input text-emphasis flex items-center justify-between"
          :class="[
            error ? 'border-meta-1' : 'border-stroke focus:border-primary dark:border-form-strokedark dark:focus:border-primary',
            !dialCode ? 'text-bodydark dark:text-bodydark1' : '',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
          ]"
        >
          <span v-if="selectedCountry">{{ selectedCountry.flag }} {{ selectedCountry.dial_code }}</span>
          <span v-else>Select</span>
          <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': isDropdownOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Dropdown menu -->
        <div
          v-if="isDropdownOpen"
          class="absolute z-50 mt-1 w-80 rounded-lg border border-stroke dark:border-form-strokedark bg-white dark:bg-boxdark shadow-lg max-h-80 overflow-hidden flex flex-col"
        >
          <!-- Search input -->
          <div class="p-2 border-b border-stroke dark:border-form-strokedark">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search country..."
              class="w-full rounded border border-stroke dark:border-form-strokedark bg-transparent py-2 px-3 text-sm outline-none focus:border-primary dark:focus:border-primary text-emphasis"
              @click.stop
            />
          </div>

          <!-- Country list -->
          <div class="overflow-y-auto">
            <button
              v-for="c in filteredCountries"
              :key="c.dial_code + c.name"
              type="button"
              @click="selectCountry(c)"
              class="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-2 dark:hover:bg-meta-4 transition flex items-center gap-2 text-emphasis"
              :class="{ 'bg-gray-2 dark:bg-meta-4': dialCode === c.dial_code }"
            >
              <span class="text-lg">{{ c.flag }}</span>
              <span class="font-medium">{{ c.dial_code }}</span>
              <span class="text-bodydark dark:text-bodydark1">{{ c.name }}</span>
            </button>

            <div v-if="filteredCountries.length === 0" class="px-3 py-4 text-sm text-center text-bodydark dark:text-bodydark1">No countries found</div>
          </div>
        </div>
      </div>

      <!-- Phone number input (max 10 digits after country code) -->
      <input
        v-model="number"
        :placeholder="dialCode ? placeholder : 'Select country first'"
        :disabled="disabled"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        maxlength="10"
        @keydown="onNumberKeydown"
        @input="onNumberInput"
        @change="emitUpdate"
        class="flex-1 rounded-lg border bg-transparent py-3 px-4 text-sm font-medium outline-none transition dark:bg-form-input text-emphasis"
        :class="error ? 'border-meta-1' : 'border-stroke focus:border-primary dark:border-form-strokedark dark:focus:border-primary'"
      />
    </div>

    <p v-if="error" class="text-meta-1 text-xs font-medium pl-0.5">
      {{ errorMessage ?? 'Phone number is required' }}
    </p>
  </div>
</template>
