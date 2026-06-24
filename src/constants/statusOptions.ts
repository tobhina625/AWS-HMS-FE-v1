export interface StatusOption {
  id: string;
  name: string;
}

export interface StatusOptionWithValue {
  value: string;
  label: string;
}

export const STATUS_OPTIONS = {
  ACTIVE_INACTIVE: [
    { id: 'Active', name: 'Active' },
    { id: 'Inactive', name: 'Inactive' },
  ] as StatusOption[],

  DEPARTMENT: [
    { id: 'Active', name: 'Active' },
    { id: 'Inactive', name: 'Inactive' },
    { id: 'UnderReview', name: 'Under Review' },
    { id: 'Restructuring', name: 'Restructuring' },
  ] as StatusOption[],

  DESIGNATION: [
    { id: 'Active', name: 'Active' },
    { id: 'Inactive', name: 'Inactive' },
    { id: 'Frozen', name: 'Frozen' },
    { id: 'UnderReview', name: 'Under Review' },
  ] as StatusOption[],

  DISEASE: [
    { id: 'Active', name: 'Active' },
    { id: 'Inactive', name: 'Inactive' },
    { id: 'UnderResearch', name: 'Under Research' },
    { id: 'Eradicated', name: 'Eradicated' },
  ] as StatusOption[],

  SURGERY: [
    { id: 'Active', name: 'Active' },
    { id: 'Inactive', name: 'Inactive' },
    { id: 'UnderReview', name: 'Under Review' },
    { id: 'Discontinued', name: 'Discontinued' },
  ] as StatusOption[],

  WARD: [
    { id: 'Active', name: 'Active' },
    { id: 'UnderMaintenance', name: 'Under Maintenance' },
    { id: 'Closed', name: 'Closed' },
    { id: 'Emergency', name: 'Emergency' },
  ] as StatusOption[],

  EMPLOYEE: [
    { id: 'Active', name: 'Active' },
    { id: 'Inactive', name: 'Inactive' },
    { id: 'OnLeave', name: 'On Leave' },
    { id: 'Suspended', name: 'Suspended' },
  ] as StatusOption[],

  OPERATION_THEATRE: [
    { id: 'Available', name: 'Available' },
    { id: 'InUse', name: 'In Use' },
    { id: 'UnderMaintenance', name: 'Under Maintenance' },
    { id: 'Emergency', name: 'Emergency' },
  ] as StatusOption[],

  APPOINTMENT: [
    { id: 1, name: 'Pending' },
    { id: 2, name: 'Confirmed' },
    { id: 3, name: 'Completed' },
    { id: 4, name: 'Cancelled' },
    { id: 5, name: 'Rescheduled' },
  ] as { id: number; name: string }[],

  APPOINTMENT_TYPE: [
    { id: 1, name: 'Consultation' },
    { id: 2, name: 'Follow-up' },
    { id: 3, name: 'Emergency' },
    { id: 4, name: 'Routine Check-up' },
    { id: 5, name: 'Surgery' },
  ] as { id: number; name: string }[],

  INVENTORY: [
    { value: 'Available', label: 'Available' },
    { value: 'LowStock', label: 'Low Stock' },
    { value: 'OutOfStock', label: 'Out of Stock' },
    { value: 'Expired', label: 'Expired' },
    { value: 'Discontinued', label: 'Discontinued' },
  ] as StatusOptionWithValue[],

  BED: [
    { id: 'Available', name: 'Available' },
    { id: 'Occupied', name: 'Occupied' },
    { id: 'Reserved', name: 'Reserved' },
    { id: 'Maintenance', name: 'Maintenance' },
  ] as StatusOption[],

  LAB_TEST: [
    { id: 'Active', name: 'Active' },
    { id: 'Inactive', name: 'Inactive' },
  ] as StatusOption[],

  /** Status ids that do not reserve a physical bed until formally admitted (see backend AdmissionWorkflow). */
  ADMISSION_DEFERS_PHYSICAL_BED_IDS: [0, 1, 2, 3, 9] as const,

  /** Status ids where an exit / discharge-style date is relevant. */
  ADMISSION_SHOW_DISCHARGE_DATE_IDS: [12, 13, 14, 15] as const,

  ADMISSION: [
    { id: 0, name: 'Pending' },
    { id: 1, name: 'Waiting For Approval' },
    { id: 2, name: 'Scheduled' },
    { id: 3, name: 'Pre-Admission' },
    { id: 4, name: 'Admitted' },
    { id: 5, name: 'Observation' },
    { id: 6, name: 'Under Treatment' },
    { id: 7, name: 'Transferred Internal' },
    { id: 8, name: 'ICU' },
    { id: 9, name: 'On Hold' },
    { id: 10, name: 'LAMA' },
    { id: 11, name: 'Re-Admission' },
    { id: 12, name: 'Discharge Approved' },
    { id: 13, name: 'Discharged' },
    { id: 14, name: 'Transferred External' },
    { id: 15, name: 'Expired' },
    { id: 16, name: 'Cancelled' },
  ] as { id: number; name: string }[],

  ADMISSION_STATUS_COLORS: {
    Pending: 'bg-warning/15 text-warning border border-warning/40 dark:bg-warning/25 dark:border-warning/50',
    'Waiting For Approval': 'bg-meta-5/20 text-meta-5 border border-meta-5/40 dark:bg-meta-5/30 dark:border-meta-5/50',
    Scheduled: 'bg-meta-10/20 text-meta-10 border border-meta-10/40 dark:bg-meta-10/30 dark:border-meta-10/50',
    'Pre-Admission': 'bg-meta-8/20 text-meta-8 border border-meta-8/40 dark:bg-meta-8/30 dark:border-meta-8/50',
    Admitted: 'bg-success/20 text-success border border-success/40 dark:bg-success/30 dark:border-success/50',
    Observation: 'bg-meta-10/20 text-meta-10 border border-meta-10/40 dark:bg-meta-10/30 dark:border-meta-10/50',
    'Under Treatment': 'bg-meta-3/20 text-meta-3 border border-meta-3/40 dark:bg-meta-3/30 dark:border-meta-3/50',
    'Transferred Internal': 'bg-meta-5/20 text-meta-5 border border-meta-5/40 dark:bg-meta-5/30 dark:border-meta-5/50',
    ICU: 'bg-meta-7/20 text-meta-7 border border-meta-7/40 dark:bg-meta-7/30 dark:border-meta-7/50',
    'On Hold': 'bg-meta-6/20 text-meta-6 border border-meta-6/40 dark:bg-meta-6/30 dark:border-meta-6/50',
    LAMA: 'bg-danger/20 text-danger border border-danger/40 dark:bg-danger/30 dark:border-danger/50',
    'Re-Admission': 'bg-meta-8/20 text-meta-8 border border-meta-8/40 dark:bg-meta-8/30 dark:border-meta-8/50',
    'Discharge Approved': 'bg-meta-10/20 text-meta-10 border border-meta-10/40 dark:bg-meta-10/30 dark:border-meta-10/50',
    Discharged: 'bg-meta-9/25 text-meta-4 border border-meta-9/50 dark:bg-strokedark/60 dark:text-bodydark1 dark:border-strokedark',
    'Transferred External': 'bg-meta-5/20 text-meta-5 border border-meta-5/40 dark:bg-meta-5/30 dark:border-meta-5/50',
    Expired: 'bg-danger/20 text-danger border border-danger/40 dark:bg-danger/30 dark:border-danger/50',
    Unknown: 'bg-meta-9/25 text-meta-4 border border-meta-9/50 dark:bg-strokedark/60 dark:text-bodydark1 dark:border-strokedark',
  } as Record<string, string>,

  PURCHASE_ORDER: [
    { id: 'Pending', name: 'Pending' },
    { id: 'Confirmed', name: 'Confirmed' },
    { id: 'Cancelled', name: 'Cancelled' },
  ] as StatusOption[],

  SALE_ORDER: [
    { id: 'Pending', name: 'Pending' },
    { id: 'Confirmed', name: 'Confirmed' },
    { id: 'Cancelled', name: 'Cancelled' },
  ] as StatusOption[],

  PAYMENT_METHOD: [
    { id: 0, name: 'Cash' },
    { id: 1, name: 'Card' },
  ] as { id: number; name: string }[],
};

export type StatusType = keyof typeof STATUS_OPTIONS;
