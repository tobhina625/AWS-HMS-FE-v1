export interface IPrescription {
  id?: number;
  patientId: number;
  patientHistoryId?: number;
  medicine: string;
  dose?: string;
  route?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  status?: string; // Active, Completed, Discontinued
  branchId?: number;
  patientName?: string;
}
