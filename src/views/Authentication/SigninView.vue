<script setup lang="ts">
  import DefaultAuthCard from '@/components/Auths/DefaultAuthCard.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseCheckbox from '@/components/Base/BaseCheckbox.vue';
  import FullScreenLayout from '@/layouts/FullScreenLayout.vue';
  import useAlert from '@/plugins/alert/useAlert';
  import AutenticationService from '@/services/Authentication/Signin.service';
  import { useGeolocation } from '@/composables/useGeolocation';
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import EmailIcon from '@/assets/images/SVGs/EmailIcon.svg';
  import EyeIcon from '@/assets/images/SVGs/Eye.svg';
  import EyeSlashIcon from '@/assets/images/SVGs/EyeSlash.svg';

  const { showAlert } = useAlert();
  const signinService = new AutenticationService();
  const { getCurrentPosition, isSupported } = useGeolocation();
  const pageTitle = ref('Account Sign In');
  const showPassword = ref(false);
  const isVerifyingLocation = ref(false);

  const credentials = ref({
    email: '',
    password: '',
  });

  const errors = ref({
    email: '',
    password: '',
  });

  const apiError = ref('');
  const router = useRouter();

  const login = async () => {
    validateCredentials();
    if (!errors.value.email && !errors.value.password) {
      try {
        apiError.value = '';

        let user = {
          email: credentials.value.email,
          password: credentials.value.password,
        };

        const response = await signinService.signInUser(user);

        if (response.isSuccess) {
          const loginData = response.data;

          // Store token temporarily
          const tempToken = loginData.token;

          // Check if location verification is needed
          isVerifyingLocation.value = true;
          try {
            // Get user's current location
            if (isSupported.value) {
              const location = await getCurrentPosition();

              // Send location to backend for verification
              const locationData = {
                latitude: location.latitude,
                longitude: location.longitude,
              };

              const locationResponse = await signinService.verifyLocation(locationData, tempToken);

              if (locationResponse.isSuccess) {
                const verificationResult = locationResponse.data;

                if (!verificationResult.isWithinRange && verificationResult.allowedRadius) {
                  // Location verification failed
                  showAlert('error', verificationResult.message, 'Location Verification Failed');
                  isVerifyingLocation.value = false;
                  return;
                }

                // Location verified or not required
                if (verificationResult.isWithinRange) {
                  showAlert('success', 'Location verified successfully', 'Login Successful');
                }
              }
            }
          } catch (locationError: any) {
            // Location error - check if it's required
            console.warn('Location error:', locationError);
            // Continue with login if location is not mandatory
          } finally {
            isVerifyingLocation.value = false;
          }

          // Store auth data
          localStorage.setItem('hms-token', loginData.token);
          localStorage.setItem(
            'hms-user',
            JSON.stringify({
              userName: loginData.userName,
              email: loginData.email,
              roles: loginData.roles,
              designations: loginData.designations,
            })
          );
          router.push('/');
        } else {
          showAlert('error', response.error, 'Invalid Credentials');
        }
      } catch (err) {
        const error = err as any;
        apiError.value = error.response?.data?.message || 'An error occurred during login.';
        console.error('Login failed:', error);
      }
    }
  };

  const validateCredentials = () => {
    validateEmail();
    validatePassword();
  };

  const validateEmail = () => {
    errors.value.email = '';

    if (!credentials.value.email) {
      errors.value.email = 'Email is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.value.email)) {
        errors.value.email = 'Invalid email format.';
      }
    }
  };

  const validatePassword = () => {
    errors.value.password = '';

    if (!credentials.value.password) {
      errors.value.password = 'Password is required.';
    } else if (credentials.value.password.length < 6) {
      errors.value.password = 'Password must be at least 6 characters.';
    }
  };
</script>

<template>
  <FullScreenLayout>
    <DefaultAuthCard :pageTitle="pageTitle" subtitle="Welcome back! Please sign in to your dashboard.">
      <form @submit.prevent="login" class="space-y-6">
        <BaseInput
          label="Email Address"
          type="email"
          placeholder="e.g. name@hospital.com"
          v-model="credentials.email"
          @change="validateEmail()"
          :error="errors.email !== ''"
          :error-message="errors.email"
          :field-required="true"
        >
          <EmailIcon class="text-muted" />
        </BaseInput>

        <div class="relative">
          <BaseInput
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Min. 6 characters"
            v-model="credentials.password"
            @change="validatePassword()"
            :error="errors.password !== ''"
            :error-message="errors.password"
            :field-required="true"
          >
            <div class="flex items-center">
              <EyeIcon v-if="!showPassword" @click="showPassword = true" class="cursor-pointer text-muted hover:text-primary transition-colors" />
              <EyeSlashIcon v-else @click="showPassword = false" class="cursor-pointer text-muted hover:text-primary transition-colors" />
            </div>
          </BaseInput>
        </div>

        <!-- Show API error -->
        <div v-if="apiError" class="bg-danger/10 dark:bg-danger/20 border border-danger/20 dark:border-danger/30 p-3 rounded-lg">
          <p class="text-danger dark:text-danger text-sm font-medium">{{ apiError }}</p>
        </div>

        <div class="flex justify-between items-center text-sm">
          <BaseCheckbox label="Remember me" id="remember_me" />

          <router-link to="/#" class="text-primary font-semibold hover:underline decoration-2 underline-offset-4">Forgot Password?</router-link>
        </div>

        <!-- Location verification status -->
        <div v-if="isVerifyingLocation" class="bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 p-3 rounded-lg">
          <p class="text-primary dark:text-primary text-sm font-medium flex items-center gap-2">
            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verifying your location...
          </p>
        </div>

        <div class="pt-4">
          <BaseButton type="submit" size="lg" block class="group !py-4" :disabled="isVerifyingLocation">
            <span v-if="isVerifyingLocation">Verifying Location...</span>
            <span v-else>Sign In to Account</span>
            <span v-if="!isVerifyingLocation" class="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">→</span>
          </BaseButton>
        </div>
      </form>
    </DefaultAuthCard>
  </FullScreenLayout>
</template>

<style scoped>
  /* Custom transitions and refinements if needed */
</style>
