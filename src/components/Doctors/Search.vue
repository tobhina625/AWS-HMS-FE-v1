<template>
  <div class=" rounded-2xl p-5 ">
    <div class="gap-6 flex justify-end flex-col md:flex-row">

      <input type="text" placeholder="Search"
        class="w-full max-w-80 rounded-lg border-[1.5px] border-stroke px-5 py-1 font-normal text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
      <button class="hover:text-primary">
        <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 opacity-100 border border-stroke  dark:bg-meta-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>


      </button>
      <button class="hover:text-primary">
        <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 opacity-100 border border-stroke  dark:bg-meta-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
          </svg>
        </div>
      </button>
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
  border: 2px solid #2563eb;
  /* Focused border color */
}
</style>