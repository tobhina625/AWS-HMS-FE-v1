
<template>
    <div class=" rounded-2xl mb-10 mx-40 bg-[#13B0DC] p-13 ">
      <div class="gap-6 flex flex-col md:flex-row">
        <input
          type="text"
          placeholder="Department"
          v-model="filters.department"
          @input="onFilterChange"
          class="p-2 rounded-xl border flex-1 "
        />
        <input
          type="text"
          placeholder="Doctor Name"
          v-model="filters.doctorName"
          @input="onFilterChange"
          class="p-2 rounded-xl border flex-1 "
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