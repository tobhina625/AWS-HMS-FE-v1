<script setup lang="ts">
import { ref } from 'vue'

const packages = ref([
  { name: 'Jennifer JBS', Email: 'example@gmail.com', phone: 'xxxxxxxxxxx', gender: 'Female', Address: 'Manor Park London', specialization: 'Neurology', qualification: 'MBBS', department: 'Neurology', check_availabilities: 'Availabilities', check_appointments: 'Appointments', },
  { name: 'Jennifer JBS', Email: 'example@gmail.com', phone: 'xxxxxxxxxxx', gender: 'Female', Address: 'Manor Park London', specialization: 'Neurology', qualification: 'MBBS', department: 'Neurology', check_availabilities: 'Availabilities', check_appointments: 'Appointments', },
  { name: 'Jennifer JBS', Email: 'example@gmail.com', phone: 'xxxxxxxxxxx', gender: 'Female', Address: 'Manor Park London', specialization: 'Neurology', qualification: 'MBBS', department: 'Neurology', check_availabilities: 'Availabilities', check_appointments: 'Appointments', },
  { name: 'Jennifer JBS', Email: 'example@gmail.com', phone: 'xxxxxxxxxxx', gender: 'Female', Address: 'Manor Park London', specialization: 'Neurology', qualification: 'MBBS', department: 'Neurology', check_availabilities: 'Availabilities', check_appointments: 'Appointments', }
])
</script>

<template>
  
  
  <div
    class="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1"
  >
    <div class="max-w-full overflow-x-auto">
      <table class="w-full table-auto">
        <thead>
          <tr class="bg-gray-2 text-left dark:bg-meta-4">
            <th class="min-w-[220px] py-4 px-4  text-black dark:text-white xl:pl-11 font-bold text-700">
              Doctor Name
            </th>
            <th class="min-w-[150px] py-4 px-4  text-black dark:text-white font-bold text-700">
              Email
            </th>
            <th class="min-w-[150px] py-4 px-4  text-black dark:text-white font-bold text-700">
              Phone No.
            </th>
            <th class="min-w-[150px] py-4 px-4  text-black dark:text-white font-bold text-700">
              Gender
            </th>
            <th class="min-w-[150px] py-4 px-4  text-black dark:text-white font-bold text-700">
              Address
            </th>
            <th class="min-w-[150px] py-4 px-4  text-black dark:text-white font-bold text-700">
              Specialization
            </th>
            <th class="min-w-[150px] py-4 px-4  text-black dark:text-white font-bold text-700">
              Qualification
            </th>
            <th class="min-w-[150px] py-4 px-4  text-black dark:text-white font-bold text-700">
               Department
            </th>
            <th class="min-w-[150px] py-4 px-4  text-black dark:text-white font-bold text-700">
               Check Availabilities
            </th>
            <th class="min-w-[150px] py-4 px-4  text-black dark:text-white font-bold text-700">
               Check Appointments
            </th>
            <th class="min-w-[150px] py-4 px-4  text-black dark:text-white font-bold text-700">
               Actions
            </th> 
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in packages" :key="index">
            <td class="py-5 px-4 pl-9 xl:pl-11">
              <h5 class=" text-grey dark:text-white font-bold text-700">{{ item.name }}</h5>
            </td>
            <td class="py-5 px-4">
              <p class="text-grey dark:text-white font-bold text-700">{{ item.Email }}</p>
            </td> <td class="py-5 px-4">
              <p class="text-grey dark:text-white font-bold text-700">{{ item.phone }}</p>
            </td>
            <td class="py-5 px-4">
              <p class="text-grey dark:text-white font-bold text-700">{{ item.gender }}</p>
            </td>
            <td class="py-5 px-4">
              <p class="text-grey dark:text-white font-bold text-700">{{ item.Address }}</p>
            </td>
            <td class="py-5 px-4">
              <p class="text-grey dark:text-white font-bold text-700">{{ item.specialization }}</p>
            </td>
            <td class="py-5 px-4">
              <p class="text-grey dark:text-white font-bold text-700">{{ item.qualification }}</p>
            </td>
            <td class="py-5 px-4">
              <p class="text-grey dark:text-white font-bold text-700">{{ item.department }}</p>
            </td>
            <td class="py-5 px-4">
              <button class="bg-yellow-500 text-white dark:text-white text-center p-2  rounded-lg font-bold text-700" >{{ item.check_availabilities}}</button>
            </td>
            <td class="py-5 px-4">
              <p class="bg-pink-500 text-white dark:text-white text-center p-2  rounded-lg font-bold text-700">{{ item.check_appointments }}</p>
            </td>
            

            
            <td class="py-5 px-4">
              <div class="flex items-center space-x-3.5">
                <button class="hover:text-primary">
                  <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                  <rect width="20" height="21" fill="url(#pattern0_850_896)"/>
                  <defs>
                  <pattern id="pattern0_850_896" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_850_896" transform="matrix(0.00772059 0 0 0.00735294 -0.0134191 0)"/>
                  </pattern>
                  <image id="image0_850_896" width="133" height="136" xlink:href="data:image/png;base64,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"/>
                  </defs>
                  </svg>

                </button>

               

                <button class="hover:text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" width="24px" height="24px hover:text-primary"><path d="M 14.925781 2 C 14.813054 1.9991672 14.748047 2.0058594 14.748047 2.0058594 A 0.50005 0.50005 0 0 0 14.378906 2.2207031 L 4.2558594 16.998047 A 0.50005 0.50005 0 0 0 4.1699219 17.253906 L 4 20.474609 A 0.50005 0.50005 0 0 0 4.7128906 20.953125 L 7.6328125 19.585938 A 0.50005 0.50005 0 0 0 7.8320312 19.416016 L 17.955078 4.6386719 A 0.50005 0.50005 0 0 0 18.021484 4.2109375 C 18.021484 4.2109375 17.722643 3.2071312 16.755859 2.5566406 C 16.031006 2.0689324 15.263963 2.0024984 14.925781 2 z M 15.019531 3.0546875 C 15.173987 3.0505575 15.632727 3.0068745 16.197266 3.3867188 C 16.759177 3.7647948 16.88795 4.2002352 16.943359 4.3476562 L 15.902344 5.8652344 L 13.980469 4.5703125 L 15.019531 3.0546875 z M 13.416016 5.3964844 L 15.337891 6.6914062 L 7.0859375 18.736328 L 5.0429688 19.693359 L 5.1601562 17.447266 L 13.416016 5.3964844 z M 11.5 20 A 0.5 0.5 0 0 0 11.5 21 A 0.5 0.5 0 0 0 11.5 20 z M 14.5 20 A 0.5 0.5 0 0 0 14.5 21 A 0.5 0.5 0 0 0 14.5 20 z M 17.5 20 A 0.5 0.5 0 0 0 17.5 21 A 0.5 0.5 0 0 0 17.5 20 z"/></svg>
                </button>
                <button class="hover:text-danger">
                  <svg
                    class="fill-current"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.70664V1.9969H7.67852ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z"
                      fill=""
                    />
                    <path
                      d="M9.00039 9.11255C8.66289 9.11255 8.35352 9.3938 8.35352 9.75942V13.3313C8.35352 13.6688 8.63477 13.9782 9.00039 13.9782C9.33789 13.9782 9.64727 13.6969 9.64727 13.3313V9.75942C9.64727 9.3938 9.33789 9.11255 9.00039 9.11255Z"
                      fill=""
                    />
                    <path
                      d="M11.2502 9.67504C10.8846 9.64692 10.6033 9.90004 10.5752 10.2657L10.4064 12.7407C10.3783 13.0782 10.6314 13.3875 10.9971 13.4157C11.0252 13.4157 11.0252 13.4157 11.0533 13.4157C11.3908 13.4157 11.6721 13.1625 11.6721 12.825L11.8408 10.35C11.8408 9.98442 11.5877 9.70317 11.2502 9.67504Z"
                      fill=""
                    />
                    <path
                      d="M6.72245 9.67504C6.38495 9.70317 6.1037 10.0125 6.13182 10.35L6.3287 12.825C6.35683 13.1625 6.63808 13.4157 6.94745 13.4157C6.97558 13.4157 6.97558 13.4157 7.0037 13.4157C7.3412 13.3875 7.62245 13.0782 7.59433 12.7407L7.39745 10.2657C7.39745 9.90004 7.08808 9.64692 6.72245 9.67504Z"
                      fill=""
                    />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
