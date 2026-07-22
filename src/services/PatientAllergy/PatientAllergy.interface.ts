export interface IPatientAllergy {
  id?: number;
  patientId: number;
  allergen: string;
  category?: string;
  severity?: string;
  reaction?: string;
  status?: string;
  notes?: string;
  branchId?: number;
  patientName?: string;
}
