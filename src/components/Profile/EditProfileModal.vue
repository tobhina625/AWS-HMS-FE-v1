<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useToast } from 'vue-toastification';
  import BaseModal from '@/components/Base/BaseModal.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseTextArea from '@/components/Base/BaseTextArea.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import BaseSelect from '@/components/Base/BaseSelect.vue';
  import BaseCnicInput from '@/components/Base/BaseCnicInput.vue';
  import { useUserProfile } from '@/composables/useUserProfile';
  import { useCnicConfig } from '@/composables/useCnicConfig';
  import UserIcon from '@/assets/images/SVGs/UserIcon.svg';
  import MailIcon from '@/assets/images/SVGs/EmailIcon.svg';

  const props = defineProps<{
    show: boolean;
    profileData: any;
  }>();

  const emit = defineEmits(['close', 'updated']);

  const toast = useToast();
  const { updateCurrentUser } = useUserProfile();
  const { cnicConfig } = useCnicConfig();

  const formData = ref({
    name: '',
    email: '',
    phoneNumber: '',
    cnic: '',
    gender: 0,
    address: '',
    qualification: '',
    specialization: '',
    notes: '',
  });

  const loading = ref(false);
  const errors = ref<Record<string, string>>({});

  const genderOptions = [
    { id: 0, name: 'Male' },
    { id: 1, name: 'Female' },
    { id: 2, name: 'Other' },
  ];

  const validate = (): boolean => {
    errors.value = {};
    if (!formData.value.name?.trim()) {
      errors.value.name = 'Name is required';
    }
    if (!formData.value.email?.trim()) {
      errors.value.email = 'Email is required';
    }
    if (!formData.value.phoneNumber?.trim()) {
      errors.value.phoneNumber = 'Phone number is required';
    }
    if (!formData.value.cnic?.trim()) {
      errors.value.cnic = `${cnicConfig.value.fieldName} is required`;
    }
    return Object.keys(errors.value).length === 0;
  };

  const populateForm = () => {
    if (props.profileData) {
      formData.value = {
        name: props.profileData.name || '',
        email: props.profileData.email || '',
        phoneNumber: props.profileData.phoneNumber || '',
        cnic: props.profileData.cnic || '',
        gender: props.profileData.gender ?? 0,
        address: props.profileData.address || '',
        qualification: props.profileData.qualification || '',
        specialization: props.profileData.specialization || '',
        notes: props.profileData.notes || '',
      };
    }
  };

  watch(
    () => [props.show, props.profileData],
    () => {
      if (props.show && props.profileData) {
        populateForm();
        errors.value = {};
      }
    },
    { immediate: true }
  );

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    loading.value = true;
    try {
      const payload = {
        id: props.profileData.id,
        name: formData.value.name.trim(),
        email: formData.value.email.trim(),
        phoneNumber: formData.value.phoneNumber.trim(),
        cnic: formData.value.cnic.trim(),
        gender: formData.value.gender,
        address: formData.value.address.trim(),
        qualification: formData.value.qualification.trim(),
        specialization: formData.value.specialization.trim(),
        notes: formData.value.notes.trim(),
        department: props.profileData.department || { id: 0, name: '' },
        designations: props.profileData.designations || [],
        status: props.profileData.status || 'Active',
      };

      const success = await updateCurrentUser(payload);
      if (success) {
        toast.success('Profile updated successfully');
        emit('updated');
        emit('close');
      } else {
        toast.error('Failed to update profile');
      }
    } catch {
      toast.error('An error occurred while updating profile');
    } finally {
      loading.value = false;
    }
  };

  const handleClose = () => {
    if (!loading.value) {
      emit('close');
    }
  };
</script>

<template>
  <BaseModal :show="show" title="Edit Profile" size="lg" @close="handleClose">
    <form @submit.prevent="handleSubmit" class="space-y-5">
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <BaseInput v-model="formData.name" label="Full Name" placeholder="Enter your name" :error="!!errors.name" :error-message="errors.name" field-required>
          <template #leading>
            <UserIcon class="fill-current text-blue dark:text-white" />
          </template>
        </BaseInput>

        <BaseInput v-model="formData.email" label="Email" type="email" placeholder="Enter your email" :error="!!errors.email" :error-message="errors.email" field-required>
          <template #leading>
            <MailIcon class="fill-current text-blue dark:text-white" />
          </template>
        </BaseInput>
      </div>

      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <BaseInput v-model="formData.phoneNumber" label="Phone Number" placeholder="Enter phone number" :error="!!errors.phoneNumber" :error-message="errors.phoneNumber" field-required />

        <BaseCnicInput v-model="formData.cnic" :error="!!errors.cnic" :error-message="errors.cnic" field-required />
      </div>

      <BaseSelect v-model="formData.gender" label="Gender" :options="genderOptions" value-key="id" display-key="name" placeholder="Select gender" />

      <BaseInput v-model="formData.address" label="Address" placeholder="Enter your address" />

      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <BaseInput v-model="formData.qualification" label="Qualification" placeholder="Enter qualification" />

        <BaseInput v-model="formData.specialization" label="Specialization" placeholder="Enter specialization" />
      </div>

      <BaseTextArea v-model="formData.notes" label="Notes" placeholder="Additional notes" :rows="3" />
    </form>

    <template #footer>
      <BaseButton variant="outline" @click="handleClose" :disabled="loading">Cancel</BaseButton>
      <BaseButton @click="handleSubmit" :disabled="loading">
        {{ loading ? 'Saving...' : 'Save Changes' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
