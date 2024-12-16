<script setup lang="ts">
import DataStatsOne from '@/components/DataStats/DataStatsOne.vue'
import ChartOne from '@/components/Charts/ChartOne.vue'
import ChartThree from '@/components/Charts/ChartThree.vue'
import ChartTwo from '@/components/Charts/ChartTwo.vue'
import ChatCardTest from '@/components/ChatCardTest.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AppointmentChart from '../../components/Dashboard/AppointmentChart.vue'
import DoctorsChatCard from '../../components/Dashboard/DoctorsChatCard.vue'
import DepartmentsChatCard from '../../components/Dashboard/DepartmentsChatCard.vue'
import DataStats from '../../components/Dashboard/DataStats.vue'
import DataChart from '../../components/Dashboard/DataChart.vue'
import AppointmentOverviewChart from '../../components/Dashboard/AppointmentOverviewChart.vue'
</script>

<template>
  <DefaultLayout>

    <div class="flex gap-6 flex-col xl:flex-row">
      <div class="flex-[2]">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 2xl:gap-7.5">
          <DataStats/>
        </div>
  
        <div class="mt-4 grid grid-cols-2 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
          
          <DataChart/>

          <div>
          <div class="flex gap-6 col-span-12" >
          
            <DoctorsChatCard/>
           
            <DepartmentsChatCard/>

            <!-- ====== Chat Card End -->

          </div>
        </div>
      </div>
  
      <div class="flex-1">
        <div class="grid grid-cols-1 gap-4 md:gap-6 2xl:gap-7.5">
         
        <AppointmentChart/>
     
        <AppointmentOverviewChart/>
      

        </div>
      </div>
    </div>

  </DefaultLayout>
</template>
