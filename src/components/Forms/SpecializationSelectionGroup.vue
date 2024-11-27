<script setup lang="ts">
import { ref } from 'vue'

const selectedOption = ref<string>('')
const isOptionSelected = ref<boolean>(false)

const changeTextColor = () => {
  isOptionSelected.value = true
}
</script>

<template>
  <div class="mb-4.5">
    <label class="mb-2.5 block text-black dark:text-white"> Specialization </label>

    <div class="relative z-20 bg-transparent dark:bg-form-input">
      <select
        v-model="selectedOption"
        class="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
        :class="{ 'text-black dark:text-white': isOptionSelected }"
        @change="changeTextColor"
      >
        <option value="" disabled selected>Select Your Specialization</option>
        <option value="male">General Medicine</option>
        <option value="female">Nursing</option>
        <option value="pnts">Pharmacy</option>
        <option value="pnts">Surgery</option>
        <option value="pnts">Pediatrics</option>
        <option value="pnts">Dentistry</option>
        <option value="pnts">Psychiatry</option>
        <option value="pnts">Physiotherapy</option>
        <option value="pnts">Radiology</option>
        <option value="pnts">Cardiology</option>
        <option value="pnts">Dermatology</option>
        <option value="pnts">Neurology</option>
        <option value="pnts">Orthopedics</option>
        <option value="pnts">Oncology</option>
        <option value="pnts">Ophthalmology</option>
        <option value="pnts">Gynecology/Obstetrics</option>
        <option value="pnts">Nephrology</option>
        <option value="pnts">Gastroenterology</option>
        <option value="pnts">Anesthesiology</option>
        <option value="pnts">Pulmonology</option>
        <option value="pnts">Emergency Medicine</option>
        <option value="pnts">Pathology</option>
        <option value="pnts">Endocrinology</option>
        <option value="pnts">Rheumatology</option>
        <option value="pnts">Public Health</option>
        <option value="pnts">Sports Medicine</option>
        <option value="pnts">Occupational Therapy</option>
        <option value="pnts">Speech Therapy</option>
        <option value="pnts">Audiology</option>
        <option value="pnts">Nutrition and Dietetics</option>
        <option value="pnts">Immunology</option>
        <option value="pnts">Hematology</option>
        <option value="pnts">Allergy Medicine</option>
        <option value="pnts">Palliative Care</option>
        <option value="pnts">Toxicology</option>
        <option value="pnts">Urology</option>
        <option value="pnts">Infectious Disease</option>
        <option value="pnts">Genetics</option>
        <option value="pnts">Family Medicine</option>
        <option value="pnts">Reproductive Endocrinology</option>
        <option value="pnts">Pain Medicine</option>
        <option value="pnts">Sleep Medicine</option>
        <option value="pnts">Vascular Surgery</option>
        <option value="pnts">Aesthetic Medicine</option>
        <option value="pnts">Medical Informatics</option>
        <option value="pnts">Disaster Medicine</option>
        <option value="pnts">Regenerative Medicine</option>
        <option value="pnts">Otolaryngology (ENT)</option>
        <option value="pnts">Perinatology</option>
        <option value="pnts">Transplant Medicine</option>
        <option value="pnts">Hyperbaric Medicine</option>
        <option value="pnts">Clinical Pharmacology</option>
        <option value="pnts">Nuclear Medicine</option>
        <option value="pnts">Forensic Medicine</option>
      </select>

      <span class="absolute top-1/2 right-4 z-30 -translate-y-1/2">
        <svg
          class="fill-current"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g opacity="0.8">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
              fill=""
            ></path>
          </g>
        </svg>
      </span>
    </div>
  </div>
</template>
