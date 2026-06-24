<script setup lang="ts">
  import SunLightIcon from '@/assets/images/SVGs/SunLightIcon.svg';
  import CheckmarkBoldIcon from '@/assets/images/SVGs/CheckmarkBoldIcon.svg';
  import MoonDarkIcon from '@/assets/images/SVGs/MoonDarkIcon.svg';
  import MonitorIcon from '@/assets/images/SVGs/MonitorIcon.svg';

  import { ref, onMounted } from 'vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseTextarea from '@/components/Base/BaseTextarea.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import { useDarkModeStore, type ThemePreference } from '@/stores/darkMode';
  import { useUserProfile } from '@/composables/useUserProfile';
  import defaultProfilePhoto from '@/assets/images/user/user-06.png';

  const darkModeStore = useDarkModeStore();
  const { fetchCurrentUser } = useUserProfile();
  const profileData = ref<any>(null);

  const formData = ref({
    fullName: '',
    phoneNumber: '',
    emailAddress: '',
    username: '',
    bio: '',
  });

  const profilePhotoUrl = ref(defaultProfilePhoto);

  const loadProfile = async () => {
    profileData.value = await fetchCurrentUser();
    if (profileData.value) {
      formData.value = {
        fullName: profileData.value.name || '',
        phoneNumber: profileData.value.phoneNumber || '',
        emailAddress: profileData.value.email || '',
        username: profileData.value.name?.replace(/\s+/g, '').toLowerCase() || '',
        bio: profileData.value.notes || '',
      };
      profilePhotoUrl.value = profileData.value.profilePhotoUrl || defaultProfilePhoto;
    }
  };

  onMounted(() => {
    loadProfile();
  });
  import PencilSquare from '@/assets/images/SVGs/PencilSquare.svg';
  import MailIcon from '@/assets/images/SVGs/EmailIcon.svg';
  import ArrowUpTray from '@/assets/images/SVGs/ArrowUpTray.svg';
  import UserIcon from '@/assets/images/SVGs/UserIcon.svg';

  const handleSubmit = () => {
    // Handle form submission for personal information
  };

  const handleCancel = () => {
    // Handle cancel action for personal information
  };

  const handlePhotoSubmit = () => {
    // Handle form submission for user photo
  };

  const handleFileChange = () => {
    // Handle file change for user photo
  };

  const handlePhotoCancel = () => {
    // Handle cancel action for user photo
  };

  const deletePhoto = () => {
    // Handle delete action for user photo
  };

  const updatePhoto = () => {
    // Handle update action for user photo
  };

  const selectTheme = (theme: ThemePreference) => {
    darkModeStore.setThemePreference(theme);
  };
</script>

<template>
  <div class="grid grid-cols-5 gap-8">
    <!-- Appearance Settings Section -->
    <div class="col-span-5">
      <div class="rounded-sm border border-stroke bg-surface shadow-default dark:border-strokedark">
        <div class="border-b border-stroke py-4 px-7 dark:border-strokedark">
          <h3 class="font-medium text-emphasis">Appearance Settings</h3>
        </div>
        <div class="p-7">
          <div class="mb-4">
            <label class="mb-3 block text-sm font-medium text-emphasis">Theme Preference</label>
            <p class="mb-4 text-sm text-bodydark dark:text-bodydark1">Choose how the interface looks. System will match your device settings.</p>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <!-- Light Theme Option -->
              <BaseButton
                variant="ghost"
                @click="selectTheme('light')"
                :class="[
                  '!flex flex-col items-center gap-3 !rounded-lg border-2 p-4 transition-all h-auto',
                  darkModeStore.themePreference === 'light'
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-stroke dark:border-strokedark hover:border-primary/50 dark:hover:border-primary/50',
                ]"
              >
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10 dark:bg-warning/20">
                  <SunLightIcon class="h-6 w-6 text-warning dark:text-warning" />
                </div>
                <div class="text-center">
                  <p class="font-semibold text-emphasis">Light</p>
                  <p class="text-xs text-bodydark dark:text-bodydark1">Always light mode</p>
                </div>
                <div v-if="darkModeStore.themePreference === 'light'" class="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <CheckmarkBoldIcon class="h-3 w-3 text-white" />
                </div>
              </BaseButton>

              <!-- Dark Theme Option -->
              <BaseButton
                variant="ghost"
                @click="selectTheme('dark')"
                :class="[
                  '!flex flex-col items-center gap-3 !rounded-lg border-2 p-4 transition-all h-auto',
                  darkModeStore.themePreference === 'dark'
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-stroke dark:border-strokedark hover:border-primary/50 dark:hover:border-primary/50',
                ]"
              >
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                  <MoonDarkIcon class="h-6 w-6 text-primary dark:text-primary" />
                </div>
                <div class="text-center">
                  <p class="font-semibold text-emphasis">Dark</p>
                  <p class="text-xs text-bodydark dark:text-bodydark1">Always dark mode</p>
                </div>
                <div v-if="darkModeStore.themePreference === 'dark'" class="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <CheckmarkBoldIcon class="h-3 w-3 text-white" />
                </div>
              </BaseButton>

              <!-- System Theme Option -->
              <BaseButton
                variant="ghost"
                @click="selectTheme('system')"
                :class="[
                  '!flex flex-col items-center gap-3 !rounded-lg border-2 p-4 transition-all h-auto',
                  darkModeStore.themePreference === 'system'
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-stroke dark:border-strokedark hover:border-primary/50 dark:hover:border-primary/50',
                ]"
              >
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 dark:bg-secondary/20">
                  <MonitorIcon class="h-6 w-6 text-secondary dark:text-secondary" />
                </div>
                <div class="text-center">
                  <p class="font-semibold text-emphasis">System</p>
                  <p class="text-xs text-bodydark dark:text-bodydark1">Match device settings</p>
                </div>
                <div v-if="darkModeStore.themePreference === 'system'" class="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <CheckmarkBoldIcon class="h-3 w-3 text-white" />
                </div>
              </BaseButton>
            </div>

            <!-- Current Status -->
            <div class="mt-4 rounded-lg bg-elevated p-3">
              <p class="text-sm text-bodydark dark:text-white">
                <span class="font-medium">Current mode:</span>
                <span class="font-semibold text-primary">{{ darkModeStore.darkMode ? 'Dark' : 'Light' }}</span>
                <span v-if="darkModeStore.themePreference === 'system'" class="text-bodydark dark:text-bodydark1">(following system preference)</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Personal Information Section -->
    <div class="col-span-5 xl:col-span-3">
      <div class="rounded-sm border border-stroke bg-surface shadow-default dark:border-strokedark">
        <div class="border-b border-stroke py-4 px-7 dark:border-strokedark">
          <h3 class="font-medium text-emphasis">Personal Information</h3>
        </div>
        <div class="p-7">
          <form @submit.prevent="handleSubmit">
            <!-- Full Name Section -->
            <div class="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
              <div class="w-full sm:w-1/2">
                <BaseInput label="Full Name" v-model="formData.fullName" placeholder="Devid Jhon" id="fullName" name="fullName">
                  <UserIcon class="fill-current text-blue dark:text-white" />
                </BaseInput>
              </div>

              <!-- Phone Number Section -->
              <div class="w-full sm:w-1/2">
                <BaseInput label="Phone Number" v-model="formData.phoneNumber" placeholder="+990 3343 7865" id="phoneNumber" name="phoneNumber" />
              </div>
            </div>

            <!-- Email Address Section -->
            <div class="mb-5.5">
              <BaseInput label="Email Address" v-model="formData.emailAddress" placeholder="devidjond45@gmail.com" id="emailAddress" name="emailAddress" type="email">
                <MailIcon class="fill-current text-blue dark:text-white" />
              </BaseInput>
            </div>

            <!-- Username Section -->
            <div class="mb-5.5">
              <BaseInput label="Username" v-model="formData.username" placeholder="devidjhon24" id="Username" name="Username" />
            </div>

            <!-- Bio Section -->
            <div class="mb-5.5">
              <BaseTextarea label="BIO" v-model="formData.bio" placeholder="Write your bio here" id="bio" name="bio" :rows="6">
                <template #icon>
                  <PencilSquare class="fill-current text-blue dark:text-white" />
                </template>
              </BaseTextarea>
            </div>

            <!-- Save and Cancel Buttons -->
            <div class="flex justify-end gap-4.5">
              <BaseButton variant="outline" @click="handleCancel">Cancel</BaseButton>
              <BaseButton type="submit">Save</BaseButton>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Your Photo Section -->
    <div class="col-span-5 xl:col-span-2">
      <div class="rounded-sm border border-stroke bg-surface shadow-default dark:border-strokedark">
        <div class="border-b border-stroke py-4 px-7 dark:border-strokedark">
          <h3 class="font-medium text-emphasis">Your Photo</h3>
        </div>
        <div class="p-7">
          <form @submit.prevent="handlePhotoSubmit">
            <!-- User Photo Section -->
            <div class="mb-4 flex items-center gap-3">
              <div class="h-14 w-14 rounded-full overflow-hidden">
                <img :src="profilePhotoUrl" alt="User" class="w-full h-full object-cover" />
              </div>
              <div>
                <span class="mb-1.5 font-medium text-emphasis">Edit your photo</span>
                <span class="flex gap-2.5">
                  <BaseButton variant="ghost" size="sm" @click="deletePhoto" class="!px-0 hover:!text-danger">Delete</BaseButton>
                  <BaseButton variant="ghost" size="sm" @click="updatePhoto" class="!px-0 hover:!text-primary">Update</BaseButton>
                </span>
              </div>
            </div>

            <!-- File Upload Section -->
            <div id="FileUpload" class="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border-2 border-dashed border-primary bg-elevated py-4 px-4 sm:py-7.5">
              <input type="file" accept="image/*" class="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none" @change="handleFileChange" />
              <div class="flex flex-col items-center justify-center space-y-3">
                <span class="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-surface dark:border-strokedark">
                  <!-- put svg here FileUploadSection -->
                  <ArrowUpTray class="fill-current text-blue dark:text-white" />
                </span>
                <p class="text-sm font-medium">
                  <span class="text-primary">Click to upload</span>
                  or drag and drop
                </p>
                <p class="mt-1.5 text-sm font-medium">SVG, PNG, JPG or GIF</p>
                <p class="text-sm font-medium">(max, 800 X 800px)</p>
              </div>
            </div>

            <!-- Save and Cancel Buttons for Photo Section -->
            <div class="flex justify-end gap-4.5">
              <BaseButton variant="outline" @click="handlePhotoCancel">Cancel</BaseButton>
              <BaseButton type="submit">Save</BaseButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
