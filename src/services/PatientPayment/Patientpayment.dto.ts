export interface IPatientPayment {
  id?: number;
  amount: number;
  paymentDate?: string;
  paymentMethod: number; // 0 = Cash, 1 = Card
  patientBillId: number;
}
