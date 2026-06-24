<script setup lang="ts">
  import { onClickOutside } from '@vueuse/core';
  import { ref, computed, onMounted } from 'vue';
  import router from '@/router';
  import { useAuth } from '@/composables/useAuth';
  import ChevronDown from '@/assets/images/SVGs/ChevronDown.svg';
  import UserIcon from '@/assets/images/SVGs/UserIcon.svg';
  import ContactIcon from '@/assets/images/SVGs/ContactIcon.svg';
  import SettingIcon from '@/assets/images/SVGs/SettingIcon.svg';
  import LogoutIcon from '@/assets/images/SVGs/LogOut.svg';
  import BaseButton from '@/components/Base/BaseButton.vue';

  const { getUser } = useAuth();
  const target = ref(null);
  const dropdownOpen = ref(false);
  const currentUser = ref(getUser());

  onMounted(() => {
    currentUser.value = getUser();
  });

  const displayName = computed(() => {
    return currentUser.value?.userName || 'User';
  });

  const displayRole = computed(() => {
    const roles = currentUser.value?.roles || [];
    return roles.length > 0 ? roles[0] : 'Staff';
  });

  onClickOutside(target, () => {
    dropdownOpen.value = false;
  });

  const logout = () => {
    localStorage.removeItem('hms-token');
    localStorage.removeItem('hms-user');
    router.push('/signin');
  };
</script>

<template>
  <div class="relative" ref="target">
    <router-link class="flex items-center gap-4" to="#" @click.prevent="dropdownOpen = !dropdownOpen">
      <span class="hidden text-right lg:block">
        <span class="block text-sm font-medium text-emphasis">{{ displayName }}</span>
        <span class="block text-xs font-medium">{{ displayRole }}</span>
      </span>

      <span class="h-12 w-12 rounded-full">
        <img src="@/assets/images/user/user-06.png" alt="Doctor's Image" class="rounded-full mx-auto mb-4 w-12 h-12 object-cover" />
      </span>

      <!-- put svg here DropdownUser-01 -->
      <ChevronDown class="fill-current text-blue dark:text-white" />
    </router-link>

    <!-- Dropdown Start -->
    <div v-show="dropdownOpen" class="absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-surface shadow-default dark:border-strokedark">
      <ul class="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
        <li>
          <router-link to="/profile" class="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base">
            <!-- put svg here DropdownUser-02 -->
            <UserIcon class="fill-current text-blue dark:text-white" />

            My Profile
          </router-link>
        </li>
        <li>
          <router-link to="#" class="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base">
            <!-- put svg here DropdownUser-03 -->
            <ContactIcon class="fill-current text-blue dark:text-white" />

            My Contacts
          </router-link>
        </li>
        <li>
          <router-link to="/pages/settings" class="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base">
            <!-- put svg here DropdownUser-04 -->
            <SettingIcon class="fill-current text-blue dark:text-white" />

            Account Settings
          </router-link>
        </li>
      </ul>
      <BaseButton
        variant="ghost"
        class="!flex items-center gap-3.5 !py-4 !px-6 !text-sm !font-medium duration-300 ease-in-out hover:text-primary lg:!text-base !w-full !justify-start"
        @click="logout()"
      >
        <LogoutIcon class="fill-current text-blue dark:text-white" />
        Log Out
      </BaseButton>
    </div>
    <!-- Dropdown End -->
  </div>
</template>
