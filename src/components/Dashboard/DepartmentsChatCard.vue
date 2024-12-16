<template>
  <div class="flex-1 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
    <!-- Heading -->
    <h2 class="text-2xl font-bold mb-4 p-3">Department</h2>
    <hr class="mb-4 border-t border-[#D3D3D3]" />

    <!-- Doctor Cards -->
    <div
      v-for="Department in Departments"
      :key="Department.id"
      class="flex items-center p-4 bg-white  dark:bg-strokedark shadow rounded-lg mb-4"
    >
       <!-- Department Detail -->
      <img
        :src="Department.image"
        alt="Doctor Picture"
        class="w-16 h-16 rounded-full mr-4"
      />

      <!-- Department Details -->
      <div class="flex-1">
        <h3 class="font-semibold text-lg">{{ Department.name }}</h3>
        <p class="text-sm text-gray-500">{{ Department.occupation }}</p>
      </div>

      <!-- Action Icons -->
      <button class="text-gray-500 hover:text-gray-700 ml-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import userOne from '@/assets/images/user/user-01.png'
import userTwo from '@/assets/images/user/user-02.png'
import userThree from '@/assets/images/user/user-03.png'

const Departments = ref([
  {
    id: 1,
    name: "Dr. Jennifer J",
    occupation: "Dentist",
    image: userOne, // Placeholder image
  },
  {
    id: 2,
    name: "Dr. Michael R",
    occupation: "Cardiologist",
    image: userTwo, // Placeholder image
  },
  {
    id: 3,
    name: "Dr. Emma W",
    occupation: "Neurologist",
    image: userThree, // Placeholder image
  },
]);

// Fetch doctors from the backend
const fetchDepartments = async () => {
  try {
    // Replace the URL with your actual API endpoint
    const response = await fetch("https://api.example.com/doctors");
    const data = await response.json();
    Department.value = data;
  } catch (error) {
    console.error("Error fetching doctors:", error);
  }
};

onMounted(() => {
  fetchDepartments();
});
</script>

<style scoped>
/* Add any additional custom styling here if needed */
</style>
