export interface IPatient {
  id: number;
  name: string | null;
  age: number | null;
  phone: string | null;
  cnic: string | null;
  gender: number | null;
  address: string | null;
}

export interface IPatientBills {
  id: number;
  billType: number;
  reason: string | null;
  entityId: number;
  totalAmount: number;
  isPaid: boolean;
  paidAmount: number;
  remainingBalance: number;
  patient: IPatient;
}

export interface IAddPatientBills {
  billType: number;
  reason?: string | null;
  entityId: number;
  totalAmount: number;
  isPaid: boolean;
  paidAmount: number;
  remainingBalance: number;
  patient: {
    id?: number;
    name: string;
    age: number;
    phone: string;
    cnic: string;
    gender: number;
    address: string;
  };
}
