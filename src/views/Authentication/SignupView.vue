<script setup lang="ts">
import DefaultAuthCard from '@/components/Auths/DefaultAuthCard.vue'
import InputGroup from '@/components/Auths/InputGroup.vue'
import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

import { ref } from 'vue'
import GenderSelectionGroup from '../../components/Forms/GenderSelectionGroup.vue'
import SpecializationSelectionGroup from '../../components/Forms/SpecializationSelectionGroup.vue'

const selectedOption = ref<string>('')
const isOptionSelected = ref<boolean>(false)

const changeTextColor = () => {
  isOptionSelected.value = true
}
const pageTitle = ref('Sign Up')
</script>

<template>
  <DefaultLayout>
    <!-- Breadcrumb Start -->
    <BreadcrumbDefault :pageTitle="pageTitle" />
    <!-- Breadcrumb End -->

    <DefaultAuthCard title="Sign Up" >
      <form>
        <div class="flex justify-between items-center">
          <p class="font-medium">
            <InputGroup label="First Name" type="text" placeholder="First name" required>
            </InputGroup>
          </p>

          <p class="font-medium">
            <InputGroup label="Last Name" type="text" placeholder="Last name">
            </InputGroup>
          </p>
        </div>

        <InputGroup label="Email" type="email" placeholder="Email">
        </InputGroup>
        
        <div class="flex justify-between items-center">
          <p class="font-medium">
            <InputGroup label="Age" type="number" placeholder="Enter your email">
            </InputGroup>

            <InputGroup label="CNIC" type="email" placeholder="Enter your email">
            </InputGroup>
          </p>

          <p class="font-medium">
            <InputGroup label="Phone No." type="tel" placeholder="Enter your phone number">
            </InputGroup>

            <GenderSelectionGroup />
          </p>
        </div>

        <InputGroup label="Address" type="email" placeholder="Enter your email">
        </InputGroup>

        <SpecializationSelectionGroup />

        <div class="flex justify-between items-center">
          <p class="font-medium">
            <InputGroup label="Password" type="password" placeholder="Enter your password">
            </InputGroup>
          </p>

          <p class="font-medium">
            <InputGroup label="Re-type Password" type="password" placeholder="Re-enter your password">
            </InputGroup>
          </p>
        </div>

        <div class="mb-5 mt-6">
          <router-link to="/auth/signup">
          <input
            type="submit"
            value="Sign Up"
            class="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 font-medium text-white transition hover:bg-opacity-90"
          />
          </router-link>
        </div>

        <div class="mt-6 text-center">
          <p class="font-medium">
            Already have an account?
            <router-link to="/auth/signin" class="text-primary">Signin Here</router-link>
          </p>
        </div>
      </form>
    </DefaultAuthCard>
  </DefaultLayout>
</template>
