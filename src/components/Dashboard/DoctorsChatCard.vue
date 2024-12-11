
<template>
  <div class="flex-1 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
    <!-- Heading -->
    <h2 class="text-2xl font-bold mb-4 p-3">Doctors</h2>
    <hr class="mb-4" />

    <!-- Doctor Cards -->
    <div
      v-for="doctor in doctors"
      :key="doctor.id"
      class="flex items-center p-4 bg-white shadow rounded-lg mb-4"
    >
      <!-- Doctor Image -->
      <img
        :src="doctor.image"
        alt="Doctor Picture"
        class="w-16 h-16 rounded-full mr-4"
      />

      <!-- Doctor Details -->
      <div class="flex-1">
        <h3 class="font-semibold text-lg">{{ doctor.name }}</h3>  
        <p class="text-sm text-gray-500">{{ doctor.occupation }}</p>
      </div>

      <!-- Action Icons -->
      <button class="text-gray-500 hover:text-gray-700">📞</button>
      <button class="text-gray-500 hover:text-gray-700 ml-2">⋮</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import userOne from '@/assets/images/user/user-01.png'
import userTwo from '@/assets/images/user/user-02.png'
import userThree from '@/assets/images/user/user-03.png'

const doctors = ref([
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
    doctors.value = data;
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
