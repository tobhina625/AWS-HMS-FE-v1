<template>
    <div
      class="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-12"
    >
      <!-- Heading -->
      <h2 class="text-2xl font-bold mb-4">Upcoming Appointments</h2>
  
      <!-- Calendar Navigation -->
      <div class="flex items-center justify-between mb-4 border-b pb-2">
        <button @click="prevDay" class="text-gray-500 hover:text-gray-800">
          &lt;
        </button>
        <div class="flex gap-2">
          <div
            v-for="(day, index) in days"
            :key="index"
            :class="[ 
              'px-3 py-2 rounded-lg cursor-pointer',
              selectedDay === day.date
                ? 'bg-teal-500 text-white'
                : 'text-gray-700 hover:bg-gray-200',
            ]"
            @click="selectDay(day)"
          >
            <div class="text-sm font-semibold">{{ day.day }}</div>
            <div class="text-xs">{{ day.date }}</div>
          </div>
        </div>
        <button @click="nextDay" class="text-gray-500 hover:text-gray-800">
          &gt;
        </button>
      </div>
  
      <!-- Appointment Cards -->
      <div class="space-y-4">
        <div
          v-for="appointment in appointments"
          :key="appointment.id"
          class="flex items-center p-4 bg-white rounded-lg shadow"
        >
          <img
            :src="appointment.image"
            alt="Profile Picture"
            class="w-16 h-16 rounded-full mr-4"
          />
          <div class="flex-1">
            <h3 class="font-semibold text-lg">{{ appointment.name }}</h3>
            <p class="text-sm text-gray-500">{{ appointment.type }}</p>
            <div class="flex items-center text-sm text-gray-600 mt-1">
              <span class="mr-2">🕒 {{ appointment.time }}</span>
              <span class="mr-2">$ {{ appointment.cost }}</span>
            </div>
          </div>
          <div class="flex space-x-4">
            <button class="text-gray-500 hover:text-gray-700">📞</button>
            <button class="text-gray-500 hover:text-gray-700">⋮</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import userOne from '@/assets/images/user/user-01.png'
import userTwo from '@/assets/images/user/user-02.png'
import userThree from '@/assets/images/user/user-03.png'
  
  // State management
  const selectedDay = ref("Wednesday May 4th 2022");
  const days = ref([
    { day: "Mon", date: "2nd" },
    { day: "Tue", date: "3rd" },
    { day: "Wednesday", date: "May 4th 2022" },
    { day: "Thu", date: "5th" },
    { day: "Fri", date: "6th" },
  ]);
  const appointments = ref([
    {
      id: 1,
      name: "Jennifer J",
      type: "Laboratory Screening",
      time: "10:00 AM",
      cost: "50",
      image: userOne,
    },
    {
      id: 2,
      name: "Robert Smith",
      type: "Dental Checkup",
      time: "12:30 PM",
      cost: "75",
      image: userTwo,
    },
    {
      id: 3,
      name: "Maria Garcia",
      type: "Therapy Session",
      time: "3:00 PM",
      cost: "100",
      image: userThree,
    },
  ]);
  
  // Select day
  const selectDay = (day) => {
    selectedDay.value = day.date;
  };
  
  // Navigate to previous and next days
  const prevDay = () => {
    const currentIndex = days.value.findIndex((d) => d.date === selectedDay.value);
    if (currentIndex > 0) {
      selectDay(days.value[currentIndex - 1]);
    }
  };
  
  const nextDay = () => {
    const currentIndex = days.value.findIndex((d) => d.date === selectedDay.value);
    if (currentIndex < days.value.length - 1) {
      selectDay(days.value[currentIndex + 1]);
    }
  };
  
  // Simulated API fetch (data is hardcoded here)
  onMounted(() => {
    console.log("Appointments loaded");
  });
  </script>
  
  <style scoped>
  /* Add Tailwind CSS classes as necessary */
  </style>
  