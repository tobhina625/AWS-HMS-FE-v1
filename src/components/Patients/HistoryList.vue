<script setup>
  import DownloadIcon from '@/assets/images/SVGs/DownloadIcon.svg';
  import ShareIcon from '@/assets/images/SVGs/ShareIcon.svg';
  import StarIcon from '@/assets/images/SVGs/StarIcon.svg';
  import FlagIcon from '@/assets/images/SVGs/FlagIcon.svg';
  import SearchIcon from '@/assets/images/SVGs/SearchIcon.svg';
  import BuildingWardIcon from '@/assets/images/SVGs/BuildingWardIcon.svg';
  import PaperclipIcon from '@/assets/images/SVGs/PaperclipIcon.svg';

  import { ref, computed } from 'vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';

  const data = ref([
    {
      notes: 'Patient experiencing mild fever and headache.',
      prescription: 'Paracetamol 500mg, twice daily for 5 days',
      visitDate: '2024-01-06',
      isEmergency: false,
      adviceAdmissions: 'Rest and hydration advised.',
      admissions: 'Not admitted',
      patientLabs: 'Blood test scheduled',
    },
    {
      notes: 'Chronic back pain reported.',
      prescription: 'Ibuprofen 400mg, once daily for 7 days',
      visitDate: '2024-01-05',
      isEmergency: false,
      adviceAdmissions: 'Physiotherapy sessions suggested.',
      admissions: 'Admitted for observation',
      patientLabs: 'X-ray completed',
    },
    {
      notes: 'Severe allergic reaction to unknown allergen.',
      prescription: 'Antihistamines and corticosteroids',
      visitDate: '2024-01-04',
      isEmergency: true,
      adviceAdmissions: 'Immediate medical attention required.',
      admissions: 'Emergency admission',
      patientLabs: 'Skin allergy test planned',
    },
    {
      notes: 'Routine health check-up.',
      prescription: 'Vitamin D supplements',
      visitDate: '2024-01-03',
      isEmergency: false,
      adviceAdmissions: 'Continue balanced diet.',
      admissions: 'Not admitted',
      patientLabs: 'Blood pressure check',
    },
    {
      notes: 'High blood pressure.',
      prescription: 'Amlodipine 5mg daily',
      visitDate: '2024-01-02',
      isEmergency: false,
      adviceAdmissions: 'Reduce salt intake.',
      admissions: 'Not admitted',
      patientLabs: 'Electrocardiogram (ECG)',
    },
    {
      notes: 'Sprained ankle.',
      prescription: 'Painkillers and ice packs',
      visitDate: '2024-01-01',
      isEmergency: false,
      adviceAdmissions: 'Rest and elevation of foot.',
      admissions: 'Not admitted',
      patientLabs: 'X-ray scheduled',
    },
    {
      notes: 'Mild respiratory infection.',
      prescription: 'Cough syrup and antibiotics',
      visitDate: '2023-12-31',
      isEmergency: false,
      adviceAdmissions: 'Avoid exposure to cold.',
      admissions: 'Not admitted',
      patientLabs: 'Chest X-ray',
    },
    {
      notes: 'Persistent headache.',
      prescription: 'Analgesics',
      visitDate: '2023-12-30',
      isEmergency: false,
      adviceAdmissions: 'Stress management techniques.',
      admissions: 'Not admitted',
      patientLabs: 'MRI scan suggested',
    },
    {
      notes: 'Seasonal flu symptoms.',
      prescription: 'Flu medication and rest',
      visitDate: '2023-12-29',
      isEmergency: false,
      adviceAdmissions: 'Quarantine for 5 days.',
      admissions: 'Not admitted',
      patientLabs: 'Rapid flu test',
    },
    {
      notes: 'Broken wrist from a fall.',
      prescription: 'Pain relief and cast application',
      visitDate: '2023-12-28',
      isEmergency: true,
      adviceAdmissions: 'Orthopedic specialist consultation.',
      admissions: 'Admitted for surgery',
      patientLabs: 'Bone density scan',
    },
    {
      notes: 'Routine follow-up for diabetes.',
      prescription: 'Continue insulin therapy',
      visitDate: '2023-12-27',
      isEmergency: false,
      adviceAdmissions: 'Maintain diet control.',
      admissions: 'Not admitted',
      patientLabs: 'HbA1c test',
    },
    {
      notes: 'Chest pain and shortness of breath.',
      prescription: 'Nitroglycerin',
      visitDate: '2023-12-26',
      isEmergency: true,
      adviceAdmissions: 'Cardiac evaluation.',
      admissions: 'Admitted to cardiology',
      patientLabs: 'ECG and stress test',
    },
    {
      notes: 'Acute appendicitis.',
      prescription: 'Pre-surgical antibiotics',
      visitDate: '2023-12-25',
      isEmergency: true,
      adviceAdmissions: 'Surgery scheduled.',
      admissions: 'Emergency surgery',
      patientLabs: 'Ultrasound imaging',
    },
    {
      notes: 'Routine vaccination.',
      prescription: 'None',
      visitDate: '2023-12-24',
      isEmergency: false,
      adviceAdmissions: 'Next dose in 6 months.',
      admissions: 'Not admitted',
      patientLabs: 'Vaccine record updated',
    },
    {
      notes: 'Post-surgery check-up for knee replacement.',
      prescription: 'Physical therapy exercises',
      visitDate: '2023-12-23',
      isEmergency: false,
      adviceAdmissions: 'Continue rehabilitation.',
      admissions: 'Not admitted',
      patientLabs: 'Joint mobility assessment',
    },
    {
      notes: 'Dizziness and nausea.',
      prescription: 'Antivertigo medication',
      visitDate: '2023-12-22',
      isEmergency: true,
      adviceAdmissions: 'Monitor for dehydration.',
      admissions: 'Admitted for observation',
      patientLabs: 'Blood pressure and electrolyte tests',
    },
    {
      notes: 'Skin infection.',
      prescription: 'Topical antibiotics',
      visitDate: '2023-12-21',
      isEmergency: false,
      adviceAdmissions: 'Maintain hygiene.',
      admissions: 'Not admitted',
      patientLabs: 'Culture test',
    },
    {
      notes: 'Ear pain.',
      prescription: 'Ear drops',
      visitDate: '2023-12-20',
      isEmergency: false,
      adviceAdmissions: 'Avoid water in ears.',
      admissions: 'Not admitted',
      patientLabs: 'Ear swab test',
    },
    {
      notes: 'Vision issues.',
      prescription: 'Glasses prescription',
      visitDate: '2023-12-19',
      isEmergency: false,
      adviceAdmissions: 'Regular eye check-ups.',
      admissions: 'Not admitted',
      patientLabs: 'Eye examination',
    },
    {
      notes: 'Severe stomach ache.',
      prescription: 'Antacids and pain relief',
      visitDate: '2023-12-18',
      isEmergency: true,
      adviceAdmissions: 'Gastroenterologist consultation.',
      admissions: 'Admitted for tests',
      patientLabs: 'Endoscopy',
    },
  ]);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const sortBy = ref(null);
  const sortDirection = ref('asc');

  const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    let sortedData = [...data.value];

    if (sortBy.value) {
      sortedData = sortedData.sort((a, b) => {
        const valA = a[sortBy.value].toString().toLowerCase();
        const valB = b[sortBy.value].toString().toLowerCase();
        if (sortDirection.value === 'asc') {
          return valA < valB ? -1 : 1;
        } else {
          return valA > valB ? -1 : 1;
        }
      });
    }

    return sortedData.slice(start, end);
  });

  const totalPages = computed(() => {
    return Math.ceil(data.value.length / itemsPerPage.value);
  });

  const startIndex = computed(() => {
    return (currentPage.value - 1) * itemsPerPage.value;
  });

  const sortTable = (column) => {
    if (sortBy.value === column) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy.value = column;
      sortDirection.value = 'asc';
    }
  };

  const previousPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  };

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  };

  const searchQuery = ref('');

  const goToPage = (page) => {
    currentPage.value = page;
  };
</script>

<template>
  <div class="rounded-sm border border-stroke bg-surface pt-6 pb-2.5 shadow-default dark:border-strokedark sm:px-7.5 xl:pb-1">
    <div class="max-w-full overflow-x-auto">
      <div class="rounded-2xl p-5">
        <div class="gap-6 flex justify-end flex-col md:flex-row items-center">
          <BaseInput v-model="searchQuery" placeholder="Search" class="!w-full !max-w-80">
            <template #leading>
              <SearchIcon class="size-5" />
            </template>
          </BaseInput>
          <BaseButton variant="ghost" class="!p-0 !rounded-full !w-11.5 !h-11.5 !flex !items-center !justify-center !bg-meta-2 dark:!bg-meta-4 !border !border-stroke">
            <ShareIcon class="size-6" />
          </BaseButton>
        </div>
      </div>
      <table class="w-full table-auto">
        <thead>
          <tr class="border-b bg-gray-2 text-left dark:bg-meta-4">
            <th class="min-w-[400px] py-3 pr-4 pl-4 font-medium text-emphasis cursor-pointer" @click="sortTable('notes')">Notes</th>
            <th class="min-w-[400px] py-3 pr-4 pl-4 font-medium text-emphasis cursor-pointer" @click="sortTable('prescription')">Prescription</th>
            <th class="min-w-[250px] py-3 pr-4 pl-4 font-medium text-emphasis cursor-pointer" @click="sortTable('visitDate')">Visit Date</th>
            <th class="min-w-[250px] py-3 pr-4 pl-4 font-medium text-emphasis cursor-pointer" @click="sortTable('isEmergency')">Emergency</th>
            <th class="min-w-[400px] py-3 pr-4 pl-4 font-medium text-emphasis cursor-pointer" @click="sortTable('adviceAdmissions')">Advice on Admissions</th>
            <th class="min-w-[250px] py-3 pr-4 pl-4 font-medium text-emphasis cursor-pointer" @click="sortTable('admissions')">Admissions</th>
            <th class="min-w-[250px] py-3 pr-4 pl-4 font-medium text-emphasis cursor-pointer" @click="sortTable('patientLabs')">Labs</th>
            <th class="min-w-[250px] py-3 pr-4 pl-4 font-medium text-emphasis">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in paginatedData" :key="index" class="border-b border-stroke dark:border-strokedark">
            <td class="py-3 pr-4 pl-4">{{ item.notes }}</td>
            <td class="py-3 pr-4 pl-4">{{ item.prescription }}</td>
            <td class="py-3 pr-4 pl-4">{{ item.visitDate }}</td>
            <td class="py-3 pr-4 pl-4">{{ item.isEmergency ? 'Yes' : 'No' }}</td>
            <td class="py-3 pr-4 pl-4">{{ item.adviceAdmissions }}</td>
            <td class="py-3 pr-4 pl-4">{{ item.admissions }}</td>
            <td class="py-3 pr-4 pl-4">{{ item.patientLabs }}</td>
            <td class="py-3 pr-4 pl-4">
              <div class="flex items-center space-x-3.5">
                <BaseButton variant="ghost" class="!p-0 hover:!text-primary">
                  <PaperclipIcon class="w-6 h-6" />
                </BaseButton>
                <BaseButton variant="ghost" class="!p-0 hover:!text-primary">
                  <StarIcon class="w-6 h-6" />
                </BaseButton>
                <BaseButton variant="ghost" class="!p-0 hover:!text-danger">
                  <BuildingWardIcon class="fill-current w-6 h-6" />
                </BaseButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <!-- Pagination -->
  <div class="pagination">
    <div class="flex items-center justify-between border-t border-stroke bg-gray-100 px-4 py-3 sm:px-6">
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Showing
            <span class="font-medium">{{ startIndex + 1 }}</span>
            to
            <span class="font-medium">{{ Math.min(startIndex + itemsPerPage, data.length) }}</span>
            of
            <span class="font-medium">{{ data.length }}</span>
            results &nbsp;
          </p>
        </div>
        <div>
          <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <a
              href="#"
              @click.prevent="previousPage"
              class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              :class="{ 'opacity-50': currentPage === 1 }"
            >
              <span class="sr-only">Previous</span>
              <FlagIcon class="h-5 w-5" />
            </a>

            <a
              v-for="page in totalPages"
              :key="page"
              href="#"
              @click.prevent="goToPage(page)"
              :class="{
                'relative z-10 inline-flex items-center bg-indigo-500 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600':
                  page === currentPage,
                'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0':
                  page !== currentPage,
              }"
            >
              {{ page }}
            </a>

            <a
              href="#"
              @click.prevent="nextPage"
              class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              :class="{ 'opacity-50': currentPage === totalPages }"
            >
              <span class="sr-only">Next</span>
              <DownloadIcon class="h-5 w-5" />
            </a>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>
