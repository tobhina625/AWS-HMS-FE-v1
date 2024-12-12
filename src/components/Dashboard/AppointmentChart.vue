<template>
  <div
    class="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-12"
  >
    <!-- Heading with Month and Year -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">Upcoming Appointments</h2>
      <div class="text-lg font-medium  text-gray-700 ">
        {{ currentMonth }} {{ currentYear }}
      </div>
    </div>

    <!-- Calendar Navigation -->
    <div class="flex items-center text-lg justify-between mb-4 border-b pb-2">
      <button @click="prevDay" class="text-gray-500  hover:text-gray-800 text-2xl">
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
          <div class="text-lg font-medium ">{{ day.day }}</div>
          <div class="text-lg text-center font-bold">{{ formatDate(day.date) }}</div>
        </div>
      </div>
      <button @click="nextDay" class="text-gray-500 hover:text-gray-800 text-2xl">
        &gt;
      </button>
    </div>

    <!-- Appointment Cards -->
    <div class="space-y-4">
      <div
        v-for="appointment in filteredAppointments"
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
  <!-- SVG Button -->
  <button class="text-gray-500 hover:text-gray-700">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  </button>
  
  <!-- Dots Button -->
  <button class="text-gray-500 hover:text-gray-700">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
</svg>

  </button>
</div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import userOne from '@/assets/images/user/user-01.png';
import userTwo from '@/assets/images/user/user-02.png';
import userThree from '@/assets/images/user/user-03.png';
import userFour from '@/assets/images/user/user-04.png';

// State management
const selectedDay = ref("2022-05-04");
const days = ref([
  { day: "Mon", date: "2022-05-02" },
  { day: "Tue", date: "2022-05-03" },
  { day: "Wed", date: "2022-05-04" },
  { day: "Thu", date: "2022-05-05" },
  { day: "Fri", date: "2022-05-06" },
  { day: "Sat", date: "2022-05-07" },
]);

const appointments = ref({
  "2022-05-02": [
    { id: 1, name: "John Doe", type: "Eye Checkup", time: "9:00 AM", cost: "30", image: userOne },
  ],
  "2022-05-03": [
    { id: 3, name: "Jennifer J", type: "Laboratory Screening", time: "10:00 AM", cost: "50", image: userOne },
    { id: 5, name: "Maria Garcia", type: "Therapy Session", time: "3:00 PM", cost: "100", image: userThree },
    { id: 2, name: "Emily Davis", type: "Skin Consultation", time: "11:00 AM", cost: "60", image: userTwo },  
  ],
  "2022-05-04": [
    { id: 3, name: "Jennifer J", type: "Laboratory Screening", time: "10:00 AM", cost: "50", image: userOne },
    { id: 4, name: "Robert Smith", type: "Dental Checkup", time: "12:30 PM", cost: "75", image: userTwo },
    { id: 5, name: "Maria Garcia", type: "Therapy Session", time: "3:00 PM", cost: "100", image: userThree },
  ],
  "2022-05-05": [
    { id: 6, name: "Michael Brown", type: "Cardiology Checkup", time: "2:00 PM", cost: "150", image: userFour },
  ],
  "2022-05-06": [
    { id: 7, name: "Sophia Johnson", type: "Nutrition Counseling", time: "10:00 AM", cost: "80", image: userOne },
  ],
  "2022-05-07": [
    { id: 8, name: "Sophia Johnson", type: "Nutrition Counseling", time: "10:00 AM", cost: "80", image: userOne },
  ],
});

// Current Month and Year
const currentMonth = computed(() => {
  const date = new Date(selectedDay.value);
  return date.toLocaleString("default", { month: "long" });
});

const currentYear = computed(() => {
  const date = new Date(selectedDay.value);
  return date.getFullYear();
});

// Filter appointments for the selected day
const filteredAppointments = computed(() => {
  return appointments.value[selectedDay.value] || [];
});

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

// Format date for day display
// Format date for day display
const formatDate = (date) => {
  const day = new Date(date).getDate();
  return day < 10 ? `0${day}` : day;
};

</script>
