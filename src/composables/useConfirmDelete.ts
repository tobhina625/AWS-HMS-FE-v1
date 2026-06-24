import { useConfirm } from '@/composables/useConfirm';
import useAlert from '@/plugins/alert/useAlert';

interface DeleteOptions {
  entityName: string;
  itemName: string;
  deleteAction: () => Promise<{ isSuccess: boolean; error?: string }>;
  onSuccess?: () => void | Promise<void>;
}

interface BulkDeleteOptions {
  entityName: string;
  count: number;
  deleteAction: () => Promise<{ isSuccess: boolean; error?: string }>;
  onSuccess?: () => void | Promise<void>;
}

export function useConfirmDelete() {
  const { confirm } = useConfirm();
  const { showAlert } = useAlert();

  const confirmDelete = async (options: DeleteOptions): Promise<boolean> => {
    const confirmed = await confirm({
      title: `Delete ${options.entityName}`,
      message: `Are you sure you want to delete "${options.itemName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return false;

    try {
      const response = await options.deleteAction();
      if (response.isSuccess) {
        showAlert('success', `${options.entityName} deleted successfully.`, 'Success');
        if (options.onSuccess) await options.onSuccess();
        return true;
      } else {
        showAlert('error', response.error || `Failed to delete ${options.entityName}.`, 'Error');
        return false;
      }
    } catch {
      showAlert('error', `An error occurred while deleting the ${options.entityName.toLowerCase()}.`, 'Error');
      return false;
    }
  };

  const confirmBulkDelete = async (options: BulkDeleteOptions): Promise<boolean> => {
    if (options.count === 0) {
      showAlert('warning', 'Please select at least one item to delete.', 'No Selection');
      return false;
    }

    const confirmed = await confirm({
      title: `Delete Multiple ${options.entityName}s`,
      message: `Are you sure you want to delete ${options.count} ${options.entityName.toLowerCase()}(s)? This action cannot be undone.`,
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return false;

    try {
      const response = await options.deleteAction();
      if (response.isSuccess) {
        showAlert('success', `${options.count} ${options.entityName.toLowerCase()}(s) deleted successfully.`, 'Success');
        if (options.onSuccess) await options.onSuccess();
        return true;
      } else {
        showAlert('error', response.error || `Failed to delete ${options.entityName.toLowerCase()}s.`, 'Error');
        return false;
      }
    } catch {
      showAlert('error', `An error occurred while deleting ${options.entityName.toLowerCase()}s.`, 'Error');
      return false;
    }
  };

  return { confirmDelete, confirmBulkDelete };
}
