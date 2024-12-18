<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import Appointment from '@/components/Dashboard/Appointment.vue'
import AppointmentOverviewChart from '@/components/Dashboard/AppointmentOverviewChart.vue'
import DataStats from '@/components/Dashboard/DataStats.vue'
import DepartmentsChatCard from '@/components/Dashboard/DepartmentsChatCard.vue'
import DoctorsChatCard from '@/components/Dashboard/DoctorsChatCard.vue'
import IncomeChart from '@/components/Dashboard/IncomeChart.vue'
</script>

<template>
  <DefaultLayout>

    <div class="flex gap-6 flex-col xl:flex-row">
      <div class="flex-[2]">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 2xl:gap-7.5">
          <DataStats/>
        </div>
  
        <div class="mt-4 grid grid-cols-2 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
          
          <IncomeChart/>

       
          <div class="flex gap-6 col-span-12" >
          
            <DoctorsChatCard/>
           
            <DepartmentsChatCard/>

            <!-- ====== Chat Card End -->

          </div>
        </div>
      </div>
  
      <div class="flex-1">
        <div class="grid grid-cols-1 gap-4 md:gap-6 2xl:gap-7.5">
         
        <Appointment/>
     
        <AppointmentOverviewChart/>
      

        </div>
      </div>
    </div>

  </DefaultLayout>
</template>
