<template>
  <div class="flex flex-col lg:flex-row h-screen bg-elevated dark:bg-slate-700">
    <!-- Left Section: Doctor Card -->
    <div class="w-full lg:w-[350px] p-6">
      <div class="bg-white shadow-md rounded-lg p-6 dark:bg-black">
        <!-- Doctor's Image -->
        <img src="@/assets/images/user/user-06.png" alt="Doctor's Image" class="rounded-full mx-auto mb-4 w-32 h-32 object-cover" />
        <!-- Name and Designation -->
        <div class="relative flex items-center justify-center">
          <h2 class="text-xl font-semibold text-center text-gray-800">Dr. John Doe</h2>
          <BaseButton variant="ghost" class="!absolute !right-0 !p-2" @click="showEdit">
            <ShareIcon class="w-6 h-6 text-muted hover:text-primary" />
          </BaseButton>
        </div>
        <p class="text-center text-gray-600">Cardiologist</p>

        <!-- Personal Information -->
        <div class="mt-6">
          <h3 class="font-semibold text-gray-700">Contact Information</h3>
          <p class="text-sm text-gray-600 mt-2">
            Email: john.doe@example.com
            <br />
            Phone: +1 234 567 890
          </p>
        </div>
      </div>
    </div>

    <!-- Right Section -->
    <div class="flex-1 p-6">
      <div class="bg-white shadow-md rounded-lg dark:bg-black">
        <!-- Top Navigation Bar -->
        <div>
          <div class="grid grid-cols-1 sm:hidden">
            <!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
            <BaseSelectNative aria-label="Select a tab" v-model="activeTabName" :options="tabs.map((t) => ({ label: t.name, value: t.name }))" class="col-start-1 row-start-1 w-full" />
            <ChevronDownIcon class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-500" aria-hidden="true" />
          </div>
          <div class="hidden sm:block">
            <div class="border-b border-gray-200">
              <nav aria-label="Tabs" class="nav-container">
                <!-- Company -->
                <a href="#" class="nav-link" :class="{ active: currentTab === 'History' }" @click.prevent="setTab('History')">
                  <div class="nav-item">
                    <GridViewIcon class="icon" />
                    <span class="nav-text">History</span>
                  </div>
                </a>

                <!-- Team Members -->
                <a href="#" class="nav-link" :class="{ active: currentTab === 'About' }" @click.prevent="setTab('About')">
                  <div class="nav-item">
                    <UsersThreeIcon class="icon" />
                    <span class="nav-text">About</span>
                  </div>
                </a>

                <!-- Billing -->
                <a href="#" class="nav-link" :class="{ active: currentTab === 'Setting' }" @click.prevent="setTab('Setting')">
                  <div class="nav-item">
                    <InboxIcon class="icon" />
                    <span class="nav-text">Setting</span>
                  </div>
                </a>
              </nav>
            </div>
          </div>
        </div>

        <!-- Dynamic Content Section -->
        <div class="p-6">
          <div v-if="currentTab === 'History'">
            <h2 class="text-lg font-semibold">History</h2>
            <List />
            <!-- Appointments -->
          </div>
          <!-- About -->
          <div v-else-if="currentTab === 'About'">
            <h2 class="text-lg font-semibold">About</h2>
            <p>About content goes here.</p>
          </div>
          <div v-else-if="currentTab === 'Setting'">
            <h2 class="text-lg font-semibold">Setting</h2>
            <p>Setting content goes here.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import InboxIcon from '@/assets/images/SVGs/InboxIcon.svg';
  import GridViewIcon from '@/assets/images/SVGs/GridViewIcon.svg';
  import UsersThreeIcon from '@/assets/images/SVGs/UsersThreeIcon.svg';
  import ShareIcon from '@/assets/images/SVGs/ShareIcon.svg';

  import { ref, computed } from 'vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseSelectNative from '@/components/Base/BaseSelectNative.vue';

  const currentTab = ref('History');
  const tabs = [
    { name: 'History', current: true },
    { name: 'About', current: false },
    { name: 'Setting', current: false },
  ];

  const activeTabName = computed({
    get: () => currentTab.value,
    set: (val) => {
      currentTab.value = val;
    },
  });

  const setTab = (tab) => {
    currentTab.value = tab;
  };
</script>

<style scoped>
  .nav-container {
    display: flex;
    gap: 20px;
    justify-content: flex-start;
    align-items: center;
  }

  .nav-link {
    text-decoration: none;
    font-size: 14px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .icon {
    width: 28px;
    height: 28px;
  }

  .nav-text {
    font-size: 20px;
  }

  .nav-container {
    display: flex;
    gap: 1rem;
  }

  .nav-link {
    padding: 0.5rem 1rem;
    text-decoration: none; /* Gray color */
    border-radius: 0.375rem;
    background-color: transparent;
    transition: all 0.3s ease;
  }

  .nav-link.active {
    color: var(--color-primary);
    border-bottom: 2px solid var(--color-primary);
    border-radius: 0;
  }
</style>
