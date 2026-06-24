<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserProfile } from '@/composables/useUserProfile';
  import { useCnicConfig } from '@/composables/useCnicConfig';
  import BaseCard from '@/components/Base/BaseCard.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import MailIcon from '@/assets/images/SVGs/EmailIcon.svg';
  import CallIcon from '@/assets/images/SVGs/CallIcon.svg';
  import Education from '@/assets/images/SVGs/Education.svg';
  import Location from '@/assets/images/SVGs/Location.svg';
  import KebabIcon from '@/assets/images/SVGs/KebabIcon.svg';
  import Appointment from '@/assets/images/SVGs/Appointment.svg';
  import defaultProfilePhoto from '@/assets/images/user/user-06.png';
  import EditProfileModal from '@/components/Profile/EditProfileModal.vue';
  import ChangePasswordModal from '@/components/Profile/ChangePasswordModal.vue';

  const router = useRouter();
  const { loading, error, fetchCurrentUser, fetchMyAppointments } = useUserProfile();
  const { cnicConfig, loadCnicConfig } = useCnicConfig();

  const currentTab = ref('Appointment');
  const showMenu = ref(false);
  const showEditProfileModal = ref(false);
  const showChangePasswordModal = ref(false);
  const menuRef = ref<HTMLElement | null>(null);
  const profileData = ref<any>(null);
  const appointments = ref<any[]>([]);

  const toggleMenu = (e: Event) => {
    e.stopPropagation();
    showMenu.value = !showMenu.value;
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
      showMenu.value = false;
    }
  };

  const setTab = (tab: string) => {
    currentTab.value = tab;
    if (tab === 'Appointment' && appointments.value.length === 0) {
      loadAppointments();
    }
  };

  const loadProfile = async () => {
    profileData.value = await fetchCurrentUser();
  };

  const loadAppointments = async () => {
    appointments.value = await fetchMyAppointments();
  };

  const logout = () => {
    localStorage.removeItem('hms-token');
    localStorage.removeItem('hms-user');
    router.push('/signin');
  };

  const openEditProfile = () => {
    showMenu.value = false;
    showEditProfileModal.value = true;
  };

  const openChangePassword = () => {
    showMenu.value = false;
    showChangePasswordModal.value = true;
  };

  const onProfileUpdated = () => {
    loadProfile();
  };

  const displayName = computed(() => profileData.value?.name || 'Loading...');
  const displayDesignation = computed(() => {
    const designations = profileData.value?.designations || [];
    return designations.length > 0 ? designations[0].name : 'Staff Member';
  });
  const displayEmail = computed(() => profileData.value?.email || 'N/A');
  const displayPhone = computed(() => profileData.value?.phoneNumber || 'N/A');
  const displayCnic = computed(() => profileData.value?.cnic || 'N/A');
  const displayEducation = computed(() => profileData.value?.qualification || 'N/A');
  const displaySpecialization = computed(() => profileData.value?.specialization || 'N/A');
  const displayDepartment = computed(() => profileData.value?.department?.name || 'N/A');
  const displayGender = computed(() => {
    const gender = profileData.value?.gender;
    if (gender === 0) return 'Male';
    if (gender === 1) return 'Female';
    return 'Other';
  });
  const displayLocation = computed(() => profileData.value?.address || 'N/A');
  const profilePhotoUrl = computed(() => profileData.value?.profilePhotoUrl || defaultProfilePhoto);

  onMounted(async () => {
    await loadCnicConfig();
    document.addEventListener('click', handleClickOutside);
    loadProfile();
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<template>
  <div v-if="loading" class="flex justify-center items-center py-20">
    <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
  </div>

  <div v-else-if="error" class="bg-danger-light border border-danger p-6 rounded-lg">
    <p class="text-danger text-center">{{ error }}</p>
  </div>

  <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <!-- Left Column: Primary Profile -->
    <div class="lg:col-span-4 space-y-6">
      <BaseCard class="text-center">
        <template #header>
          <div class="flex justify-between items-center w-full">
            <span class="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">Medical Staff</span>
            <div class="relative" ref="menuRef">
              <BaseButton variant="ghost" size="sm" @click="toggleMenu">
                <KebabIcon class="w-5 h-5 opacity-60" />
              </BaseButton>

              <transition
                enter-active-class="transition duration-100 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in"
                leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0"
              >
                <div v-if="showMenu" class="absolute right-0 mt-2 w-48 bg-surface border border-elevated shadow-2xl rounded-xl z-50 overflow-hidden">
                  <BaseButton variant="ghost" @click="openEditProfile" class="w-full !px-4 !py-3 !text-sm !font-semibold transition-colors !justify-start">Edit Profile</BaseButton>
                  <BaseButton variant="ghost" @click="openChangePassword" class="w-full !px-4 !py-3 !text-sm !font-semibold transition-colors !justify-start">Change Password</BaseButton>
                  <BaseButton variant="ghost" @click="logout" class="w-full !px-4 !py-3 !text-sm !font-semibold transition-colors !text-danger !justify-start">Log Out</BaseButton>
                </div>
              </transition>
            </div>
          </div>
        </template>

        <div class="flex flex-col items-center">
          <div class="relative mb-6">
            <div class="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-strokedark shadow-xl">
              <img :src="profilePhotoUrl" alt="Profile" class="w-full h-full object-cover" />
            </div>
            <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-success border-4 border-white dark:border-boxdark rounded-full shadow-lg"></div>
          </div>

          <h1 class="text-2xl font-black text-emphasis tracking-tight">{{ displayName }}</h1>
          <p class="text-primary font-bold uppercase text-[11px] tracking-widest mb-6">{{ displayDesignation }}</p>

          <div class="w-full space-y-4 text-left">
            <div class="flex items-center gap-4 p-3 rounded-2xl bg-bodydark1 dark:bg-bodydark2 border border-transparent hover:border-stroke dark:hover:border-strokedark transition-all">
              <div class="w-10 h-10 rounded-xl bg-surface flex items-center justify-center shadow-sm">
                <MailIcon class="w-5 h-5 text-primary" />
              </div>
              <div>
                <p class="text-[10px] font-black text-muted uppercase tracking-tighter">Email</p>
                <p class="text-sm font-bold text-emphasis truncate max-w-[180px]">{{ displayEmail }}</p>
              </div>
            </div>

            <div class="flex items-center gap-4 p-3 rounded-2xl bg-bodydark1 dark:bg-bodydark2 border border-transparent hover:border-stroke dark:hover:border-strokedark transition-all">
              <div class="w-10 h-10 rounded-xl bg-surface flex items-center justify-center shadow-sm">
                <CallIcon class="w-5 h-5 text-primary" />
              </div>
              <div>
                <p class="text-[10px] font-black text-muted uppercase tracking-tighter">Phone</p>
                <p class="text-sm font-bold text-emphasis">{{ displayPhone }}</p>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>

      <BaseCard>
        <template #header>
          <h3 class="text-sm font-black uppercase tracking-widest text-muted">Identity Details</h3>
        </template>
        <div class="space-y-4">
          <div class="flex items-center justify-between py-2 border-b border-stroke dark:border-strokedark pb-3">
            <span class="text-xs font-bold text-muted uppercase">{{ cnicConfig.fieldName }} #</span>
            <span class="text-sm font-bold text-emphasis">{{ displayCnic }}</span>
          </div>
          <div class="flex items-center justify-between py-2">
            <span class="text-xs font-bold text-muted uppercase">Gender</span>
            <span class="text-sm font-bold text-emphasis">{{ displayGender }}</span>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Right Column: Professional Details -->
    <div class="lg:col-span-8 space-y-6">
      <BaseCard no-padding>
        <div class="border-b border-elevated">
          <nav class="flex px-6">
            <BaseButton
              variant="ghost"
              @click="setTab('Appointment')"
              :class="[
                '!px-6 !py-4 !text-sm !font-black !uppercase tracking-widest transition-all !relative !rounded-none',
                currentTab === 'Appointment' ? '!text-primary' : '!text-muted hover:!text-emphasis',
              ]"
            >
              Appointments
              <div v-if="currentTab === 'Appointment'" class="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>
            </BaseButton>
            <BaseButton
              variant="ghost"
              @click="setTab('Professional')"
              :class="[
                '!px-6 !py-4 !text-sm !font-black !uppercase tracking-widest transition-all !relative !rounded-none',
                currentTab === 'Professional' ? '!text-primary' : '!text-muted hover:!text-emphasis',
              ]"
            >
              Credentials
              <div v-if="currentTab === 'Professional'" class="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>
            </BaseButton>
          </nav>
        </div>

        <div class="p-8 h-[500px]">
          <transition mode="out-in" enter-active-class="transition duration-200" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0">
            <div v-if="currentTab === 'Appointment'">
              <div v-if="appointments.length === 0" class="flex flex-col items-center justify-center h-full text-center opacity-40">
                <div class="w-20 h-20 rounded-3xl bg-elevated flex items-center justify-center mb-6">
                  <Appointment class="w-10 h-10 text-muted" />
                </div>
                <h4 class="text-xl font-black text-emphasis mb-2 uppercase tracking-tighter">No Appointments Scheduled</h4>
                <p class="text-sm font-medium">Your current roster for today is clear.</p>
              </div>
              <div v-else class="space-y-4">
                <div v-for="appointment in appointments" :key="appointment.id" class="p-4 rounded-2xl bg-elevated border border-stroke dark:border-strokedark hover:border-primary/30 transition-all">
                  <div class="flex justify-between items-start">
                    <div>
                      <h5 class="font-bold text-emphasis">{{ appointment.patient?.name || 'Patient' }}</h5>
                      <p class="text-sm text-muted mt-1">{{ new Date(appointment.appointmentDateTime).toLocaleString() }}</p>
                    </div>
                    <span class="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {{ appointment.appointmentStatus?.name || 'Scheduled' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="currentTab === 'Professional'" class="space-y-12">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="flex gap-4">
                  <div class="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center flex-shrink-0">
                    <Education class="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h5 class="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Qualification</h5>
                    <p class="text-lg font-bold text-emphasis">{{ displayEducation }}</p>
                  </div>
                </div>

                <div class="flex gap-4">
                  <div class="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center flex-shrink-0">
                    <Education class="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h5 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Specialization</h5>
                    <p class="text-lg font-bold text-emphasis">{{ displaySpecialization }}</p>
                  </div>
                </div>

                <div class="flex gap-4">
                  <div class="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center flex-shrink-0">
                    <Education class="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h5 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Department</h5>
                    <p class="text-lg font-bold text-emphasis">{{ displayDepartment }}</p>
                  </div>
                </div>

                <div class="flex gap-4">
                  <div class="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center flex-shrink-0">
                    <Location class="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h5 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Location</h5>
                    <p class="text-lg font-bold text-emphasis">{{ displayLocation }}</p>
                  </div>
                </div>
              </div>

              <div class="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                <h5 class="text-[10px] font-black text-primary uppercase tracking-widest mb-3">Notice From Hospital Admin</h5>
                <p class="text-sm font-medium text-muted italic">"Please ensure all medical licenses are renewed before the end of Q3. Contact HR if you require assistance with credentialing."</p>
              </div>
            </div>
          </transition>
        </div>
      </BaseCard>
    </div>

    <EditProfileModal :show="showEditProfileModal" :profile-data="profileData" @close="showEditProfileModal = false" @updated="onProfileUpdated" />
    <ChangePasswordModal :show="showChangePasswordModal" @close="showChangePasswordModal = false" @updated="onProfileUpdated" />
  </div>
</template>
