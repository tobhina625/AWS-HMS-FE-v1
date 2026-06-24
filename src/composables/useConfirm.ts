import { ref } from 'vue';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
}

const showConfirm = ref(false);
const confirmOptions = ref<ConfirmOptions>({
  message: '',
});
let resolvePromise: ((value: boolean) => void) | null = null;

export function useConfirm() {
  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    confirmOptions.value = options;
    showConfirm.value = true;

    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  };

  const handleConfirm = () => {
    showConfirm.value = false;
    if (resolvePromise) {
      resolvePromise(true);
      resolvePromise = null;
    }
  };

  const handleCancel = () => {
    showConfirm.value = false;
    if (resolvePromise) {
      resolvePromise(false);
      resolvePromise = null;
    }
  };

  return {
    confirm,
    showConfirm,
    confirmOptions,
    handleConfirm,
    handleCancel,
  };
}
