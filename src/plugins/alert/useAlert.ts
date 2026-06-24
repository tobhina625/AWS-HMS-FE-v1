import { getCurrentInstance } from 'vue';
import type { AlertType, AlertOptions } from './alert';

const useAlert = () => {
  const instance = getCurrentInstance();

  // Access the global $alertRef from app context
  const alertRef = instance?.appContext.config.globalProperties.$alertRef;

  // Function to show an alert
  const showAlert = (type: AlertType, message: string, title: string = 'Alert', options?: AlertOptions) => {
    if (alertRef?.value) {
      alertRef.value.showAlert(type, message, title, options);
    } else {
      console.error('Alert component is not yet initialized.');
    }
  };

  return { showAlert };
};

export default useAlert;
