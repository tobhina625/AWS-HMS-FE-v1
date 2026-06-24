export interface IVendorPayment {
  id: number;
  amount: number;
  paymentDate: string;
  paymentMethod: number;
}

export interface IVendor {
  id: number;
  companyName: string;
  representative: string;
  contactNo: string;
  totalPayable: number;
  paidAmount: number;
  remainingBalance: number;
  vendorPayments?: IVendorPayment[];
}

export interface IAddVendor {
  companyName: string;
  representative: string;
  contactNo: string;
  totalPayable: number;
  paidAmount: number;
  remainingBalance: number;
}

export interface IUpdateVendor extends IAddVendor {
  id: number;
}
