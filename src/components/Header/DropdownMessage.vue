<script setup lang="ts">
  import { onClickOutside } from '@vueuse/core';
  import { ref } from 'vue';

  const target = ref(null);
  const dropdownOpen = ref(false);
  const notifying = ref(true);

  onClickOutside(target, () => {
    dropdownOpen.value = false;
  });

  import userOne from '@/assets/images/user/user-01.png';
  import userTwo from '@/assets/images/user/user-02.png';
  import userThree from '@/assets/images/user/user-03.png';
  import userFour from '@/assets/images/user/user-04.png';
  import MessageIcon from '@/assets/images/SVGs/MessageIcon.svg';

  const messagesList = ref([
    {
      route: '#',
      userImg: userTwo,
      name: 'Mariya Desoja',
      message: 'I like your confidence 💪',
      time: '2min ago',
    },
    {
      route: '#',
      userImg: userOne,
      name: 'Robert Jhon',
      message: 'Can you share your offer?',
      time: '10min ago',
    },
    {
      route: '#',
      userImg: userThree,
      name: 'Henry Dholi',
      message: 'I cam across your profile and...',
      time: '1day ago',
    },
    {
      route: '#',
      userImg: userFour,
      name: 'Cody Fisher',
      message: 'I’m waiting for you response!',
      time: '5day ago',
    },
    {
      route: '#',
      userImg: userTwo,
      name: 'Mariya Desoja',
      message: 'I like your confidence 💪',
      time: '2min ago',
    },
  ]);
</script>

<template>
  <li class="relative" ref="target">
    <router-link
      class="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-elevated hover:text-primary dark:border-strokedark"
      to="#"
      @click.prevent="((dropdownOpen = !dropdownOpen), (notifying = false))"
    >
      <span :class="!notifying && 'hidden'" class="absolute -top-0.5 -right-0.5 z-1 h-2 w-2 rounded-full bg-meta-1">
        <span class="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-meta-1 opacity-75"></span>
      </span>

      <!-- put svg here DropdownMessage -->
      <MessageIcon class="fill-current text-blue dark:text-white" />
    </router-link>

    <!-- Dropdown Start -->
    <div v-show="dropdownOpen" class="absolute -right-16 mt-2.5 flex h-90 w-75 flex-col rounded-sm border border-stroke bg-surface shadow-default dark:border-strokedark sm:right-0 sm:w-80">
      <div class="px-4.5 py-3">
        <h5 class="text-sm font-medium text-bodydark2">Messages</h5>
      </div>

      <ul class="flex h-auto flex-col overflow-y-auto">
        <template v-for="(item, index) in messagesList" :key="index">
          <li>
            <router-link class="flex gap-4.5 border-t border-stroke px-4.5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4" :to="item.route">
              <div class="h-12.5 w-12.5 rounded-full">
                <img :src="item.userImg" alt="User" />
              </div>

              <div>
                <h6 class="text-sm font-medium text-emphasis">{{ item.name }}</h6>
                <p class="text-sm">{{ item.message }}</p>
                <p class="text-xs">{{ item.time }}</p>
              </div>
            </router-link>
          </li>
        </template>
      </ul>
    </div>
    <!-- Dropdown End -->
  </li>
</template>
