// Define valid alert types
export type AlertType = 'success' | 'info' | 'warning' | 'error';

// Define the options interface for the alert
export interface AlertOptions {
  iconSize: number; // Size of the icon (in pixels)
  iconType: 'solid' | 'regular'; // Icon type: 'solid' or 'regular'
  position: 'top right' | 'top left' | 'bottom left' | 'bottom right'; // Position of the alert
}

// Function to show the alert
export const showAlert = (
  alertRef: any,
  type: AlertType, // Only 'success', 'info', 'warning', 'error' are allowed
  message: string,
  title: string,
  options: AlertOptions
) => {
  if (alertRef.value) {
    alertRef.value.showAlert(type, message, title, options); // Call the method on the ref
  } else {
    console.error('Alert component is not yet initialized.');
  }
};
