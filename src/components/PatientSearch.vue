<template>
<div class="flex justify-between items-center mb-4">
    <div class="breadcrumb flex items-center gap-2">
      <span class="font-bold text-lg">Patients</span>
      <span class="text-gray-500">- Patients</span>
    </div>
    <button
      class="bg-green-500 text-white px-8 py-2 rounded flex items-center hover:bg-green-600"
    >
      <span>+ Add</span>
    </button>
  </div>
    <div class="bg-blue-500 rounded-md mb-10 mx-10 bg-[#13B0DC] p-13 ">
      <div class="gap-2 flex flex-col md:flex-row">
        <input
          type="text"
          placeholder="Patient Name"
          v-model="filters.patientName"
          @input="onFilterChange"
          class="p-2 rounded border flex-1 "
        />
        <input
          type="text"
          placeholder="Doctor Name"
          v-model="filters.doctorName"
          @input="onFilterChange"
          class="p-2 rounded border flex-1 "
        />
        <input
          type="text"
          placeholder="Disease"
          v-model="filters.disease"
          @input="onFilterChange"
          class="p-2 rounded border flex-1"
        />
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        filters: {
          patientName: '',
          doctorName: '',
          disease: '',
        },
      };
    },
    methods: {
      onFilterChange() {
        // Emit updated filter values to the parent component
        this.$emit('updateFilters', { ...this.filters });
      },
    },
  };
  </script>
  
  <style scoped>
  /* Optional: Additional styling for better responsiveness */
  input {
    outline: none;
    transition: border 0.3s ease;
  }
  
  input:focus {
    border: 2px solid #2563eb; /* Focused border color */
  }
  </style>
  