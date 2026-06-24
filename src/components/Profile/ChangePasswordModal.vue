<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useToast } from 'vue-toastification';
  import BaseModal from '@/components/Base/BaseModal.vue';
  import BaseInput from '@/components/Base/BaseInput.vue';
  import BaseButton from '@/components/Base/BaseButton.vue';
  import UserService from '@/services/user/user.service';

  const props = defineProps<{
    show: boolean;
  }>();

  const emit = defineEmits(['close', 'updated']);

  const toast = useToast();
  const userService = new UserService();

  const formData = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const showCurrentPassword = ref(false);
  const showNewPassword = ref(false);
  const showConfirmPassword = ref(false);
  const loading = ref(false);
  const errors = ref<Record<string, string>>({});

  const validate = (): boolean => {
    errors.value = {};
    if (!formData.value.currentPassword?.trim()) {
      errors.value.currentPassword = 'Current password is required';
    }
    if (!formData.value.newPassword?.trim()) {
      errors.value.newPassword = 'New password is required';
    } else if (formData.value.newPassword.length < 8) {
      errors.value.newPassword = 'Password must be at least 8 characters';
    }
    if (formData.value.newPassword !== formData.value.confirmPassword) {
      errors.value.confirmPassword = 'Passwords do not match';
    }
    if (formData.value.currentPassword && formData.value.newPassword === formData.value.currentPassword) {
      errors.value.newPassword = 'New password must be different from current password';
    }
    return Object.keys(errors.value).length === 0;
  };

  watch(
    () => props.show,
    (isShow) => {
      if (isShow) {
        formData.value = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        };
        errors.value = {};
      }
    }
  );

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    loading.value = true;
    try {
      const response = await userService.changePassword(formData.value.currentPassword, formData.value.newPassword);

      if (response?.isSuccess) {
        toast.success('Password changed successfully');
        emit('updated');
        emit('close');
      } else {
        toast.error(response?.error || 'Failed to change password');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'An error occurred while changing password');
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
  <BaseModal :show="show" title="Change Password" size="md" @close="handleClose">
    <form @submit.prevent="handleSubmit" class="space-y-5">
      <BaseInput
        v-model="formData.currentPassword"
        :type="showCurrentPassword ? 'text' : 'password'"
        label="Current Password"
        placeholder="Enter current password"
        :error="!!errors.currentPassword"
        :error-message="errors.currentPassword"
        field-required
      />

      <BaseInput
        v-model="formData.newPassword"
        :type="showNewPassword ? 'text' : 'password'"
        label="New Password"
        placeholder="Enter new password (min 8 characters)"
        :error="!!errors.newPassword"
        :error-message="errors.newPassword"
        field-required
      />

      <BaseInput
        v-model="formData.confirmPassword"
        :type="showConfirmPassword ? 'text' : 'password'"
        label="Confirm New Password"
        placeholder="Confirm new password"
        :error="!!errors.confirmPassword"
        :error-message="errors.confirmPassword"
        field-required
      />
    </form>

    <template #footer>
      <BaseButton variant="outline" @click="handleClose" :disabled="loading">Cancel</BaseButton>
      <BaseButton @click="handleSubmit" :disabled="loading">
        {{ loading ? 'Changing...' : 'Change Password' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
