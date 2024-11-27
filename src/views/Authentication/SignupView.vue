<script setup lang="ts">
import DefaultAuthCard from '@/components/Auths/DefaultAuthCard.vue'
import InputGroup from '@/components/Auths/InputGroup.vue'
import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue'
import FullScreenLayout from '@/layouts/FullScreenLayout.vue'

import { ref } from 'vue'
import GenderSelectionGroup from '../../components/Forms/GenderSelectionGroup.vue'
import SpecializationSelectionGroup from '../../components/Forms/SpecializationSelectionGroup.vue'


const selectedOption = ref<string>('')
const isOptionSelected = ref<boolean>(false)

const changeTextColor = () => {
  isOptionSelected.value = true
}

const pageTitle = ref('Sign Up')
const signupPageData = ref({
  fName: '',
  lName: '',
  email: '',
  age: '',
  cnic: '',
  phoneNo: '',
  gender: '',
  address: '',
  specialization: '',
  password: '',
  rePassword: '',
})

const signup = () => {
  const isValid = validateRequiredFields();

}

const validateRequiredFields = () => {
  if (
    signupPageData.value.fName && 
    signupPageData.value.lName &&
    signupPageData.value.email
  ) {

  }
}
</script>

<template>
  <FullScreenLayout>
    <DefaultAuthCard title="Sign Up" >
      <form>
        <div class="flex justify-between items-center">
          <p class="font-medium">
            <InputGroup label="First Name" type="text" placeholder="your first name" v-model="signupPageData.fName">
            </InputGroup>
          </p>

          <p class="font-medium">
            <InputGroup label="Last Name" type="text" placeholder="your fast name" v-model="signupPageData.lName">
            </InputGroup>
          </p>
        </div>

        <InputGroup label="Email" type="email" placeholder="your email" v-model="signupPageData.email">
        </InputGroup>
        
        <div class="flex justify-between items-center">
          <p class="font-medium">
            <InputGroup label="Age" type="number" placeholder="your age" v-model="signupPageData.age">
            </InputGroup>

            <InputGroup label="CNIC" type="number" placeholder="your cnic" v-model="signupPageData.cnic">
            </InputGroup>
          </p>

          <p class="font-medium">
            <InputGroup label="Phone No." type="tel" placeholder="your phone number" v-model="signupPageData.phoneNo">
            </InputGroup>

            <GenderSelectionGroup v-model="signupPageData.gender"/>
          </p>
        </div>

        <InputGroup label="Address" type="text" placeholder="your address" v-model="signupPageData.address">
        </InputGroup>

        <SpecializationSelectionGroup v-model="signupPageData.specialization"/>

        <div class="flex justify-between items-center">
          <p class="font-medium">
            <InputGroup label="Password" type="password" placeholder="Enter your password" v-model="signupPageData.password">
            </InputGroup>
          </p>

          <p class="font-medium">
            <InputGroup label="Re-type Password" type="password" placeholder="Re-enter your password" v-model="signupPageData.rePassword">
            </InputGroup>
          </p>
        </div>

        <div class="mb-5 mt-6">
          <div
            class="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 text-center"
            @click="signup()">
            Sign Up
          </div>
        </div>

        <div class="mt-6 text-center">
          <p class="font-medium">
            Already have an account?
            <router-link to="/auth/signin" class="text-primary">Sign In</router-link>
          </p>
        </div>
      </form>
    </DefaultAuthCard>
  </FullScreenLayout>
</template>
