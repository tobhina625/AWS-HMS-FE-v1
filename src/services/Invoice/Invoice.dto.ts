export interface IInvoiceLine {
  id?: number;
  invoiceId?: number;
  lineType: number; // 0=Consultation, 1=Admission, 2=Procedure, 3=LabTest, 4=Surgery, 5=Pharmacy, 6=ManualCharge
  entityId?: number | null;
  entityType?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountAmount?: number | null;
  taxAmount?: number | null;
  doctorId?: number | null;
  departmentId?: number | null;
  createdByUserId?: number | null;
}

export interface IPayment {
  id?: number;
  invoiceId: number;
  paymentNumber?: string;
  amount: number;
  paymentMethod: number; // 0=Cash, 1=Card, 2=BankTransfer, 3=Insurance, 4=Cheque, 5=Online
  paymentDate: string;
  referenceNumber?: string | null;
  payerType?: string | null;
  payerId?: number | null;
  branchId?: number | null;
  cashierId?: number | null;
  isReconciled?: boolean;
  reconciliationId?: number | null;
  notes?: string | null;
  isVoided?: boolean;
  voidedAt?: string | null;
  voidedByUserId?: number | null;
  voidReason?: string | null;
}

export interface IRefund {
  id?: number;
  invoiceId: number;
  paymentId?: number | null;
  refundNumber?: string;
  amount: number;
  refundMethod: number; // 0=Cash, 1=Card, 2=BankTransfer
  refundDate: string;
  reason: string;
  processedByUserId?: number | null;
  branchId?: number | null;
}

export interface IInvoiceAuditLog {
  id?: number;
  invoiceId: number;
  action: string;
  oldValues?: string | null;
  newValues?: string | null;
  changedByUserId?: number | null;
  branchId?: number | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  notes?: string | null;
  createdAt?: string | null;
}

export interface IPatient {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  gender: number;
  phone?: string | null;
  cnic?: string | null;
  address?: string | null;
}

export interface IInvoice {
  id: number;
  invoiceNumber: string;
  patientId: number;
  branchId?: number | null;
  status: number; // 0=Draft, 1=Issued, 2=PartiallyPaid, 3=Paid, 4=Voided, 5=Refunded, 6=Overdue
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  creditAmount?: number | null;
  currency?: string;
  issuedDate?: string | null;
  dueDate?: string | null;
  paidDate?: string | null;
  voidedDate?: string | null;
  refundedDate?: string | null;
  notes?: string | null;
  cancellationReason?: string | null;
  refundReason?: string | null;
  isFinalized: boolean;
  migratedFromPatientBillId?: number | null;
  patient?: IPatient | null;
  invoiceLines?: IInvoiceLine[] | null;
  payments?: IPayment[] | null;
  refunds?: IRefund[] | null;
  auditLogs?: IInvoiceAuditLog[] | null;
  createdAt?: string;
}

export interface IAddInvoice {
  patientId: number;
  branchId?: number;
  notes?: string | null;
  dueDate?: string | null;
  invoiceLines: IInvoiceLine[];
}

export interface IInvoiceSummary {
  totalCharged: number;
  totalPaid: number;
  totalDue: number;
  totalOutstanding: number;
  totalRefunded: number;
  totalDiscounted: number;
}

export const InvoiceStatusMap: Record<number, string> = {
  0: 'Draft',
  1: 'Issued',
  2: 'Partially Paid',
  3: 'Paid',
  4: 'Voided',
  5: 'Refunded',
  6: 'Overdue',
};

export const InvoiceStatusColorMap: Record<number, string> = {
  0: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  1: 'bg-primary/15 text-primary border-primary/30',
  2: 'bg-warning/15 text-warning border-warning/30',
  3: 'bg-meta-3/15 text-meta-3 border-meta-3/30',
  4: 'bg-danger/15 text-danger border-danger/30',
  5: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  6: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
};

export const InvoiceLineTypeMap: Record<number, string> = {
  0: 'Consultation',
  1: 'Admission',
  2: 'Procedure',
  3: 'Lab Test',
  4: 'Surgery',
  5: 'Pharmacy',
  6: 'Manual Charge',
};

export const PaymentMethodMap: Record<number, string> = {
  0: 'Cash',
  1: 'Card',
  2: 'Bank Transfer',
  3: 'Insurance',
  4: 'Cheque',
  5: 'Online',
};
