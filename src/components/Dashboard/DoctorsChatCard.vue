<template>
  <div class="flex-1 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
    <!-- Heading -->
    <h2 class="text-2xl font-bold mb-4 p-3">Doctors</h2>
    <hr class="mb-4 border-t border-[#D3D3D3]" />

    <!-- Doctor Cards -->
    <div
      v-for="Doctor in Doctors"
      :key="Doctor.id"
      class="flex items-center p-4 bg-white  dark:bg-strokedark shadow rounded-lg mb-4"
    >
      <!-- Doctor Image -->
      <img
        :src="Doctor.image"
        alt="Doctor Picture"
        class="w-16 h-16 rounded-full mr-4"
      />

      <!-- Doctor Details -->
      <div class="flex-1">
        <h3 class="font-semibold text-lg">{{ Doctor.name }}</h3>
        <p class="text-sm text-gray-500">{{ Doctor.occupation }}</p>
      </div>

      <!-- Action Icons -->
      <button class="text-gray-500 hover:text-gray-700">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  </button>
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

const Doctors = ref([
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
const fetchDoctors = async () => {
  try {
    // Replace the URL with your actual API endpoint
    const response = await fetch("https://api.example.com/doctors");
    const data = await response.json();
    Doctors.value = data;
  } catch (error) {
    console.error("Error fetching doctors:", error);
  }
};

onMounted(() => {
  fetchDoctors();
});
</script>

<style scoped>
/* Add any additional custom styling here if needed */
</style>
